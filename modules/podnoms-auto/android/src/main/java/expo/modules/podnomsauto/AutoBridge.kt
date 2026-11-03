package expo.modules.podnomsauto

import android.content.ComponentName
import android.content.Context
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.annotation.OptIn
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.util.UnstableApi
import androidx.media3.session.LibraryResult
import androidx.media3.session.MediaConstants
import androidx.media3.session.MediaController
import androidx.media3.session.SessionError
import androidx.media3.session.SessionToken
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.facebook.react.jstasks.HeadlessJsTaskContext
import com.google.common.collect.ImmutableList
import com.google.common.util.concurrent.ListenableFuture
import com.google.common.util.concurrent.SettableFuture
import expo.modules.audio.AudioPlayer
import java.lang.ref.WeakReference
import java.util.UUID

// Between the car's session (AutoLibraryService) and the app's JS
// (src/lib/auto.ts), which knows the user, the server and the player. What the
// car asks for is sent to JS as events; if JS isn't running (the car connected
// with the app closed), it's started headless and the requests wait for it.
// Everything here runs on the main thread.
@OptIn(UnstableApi::class)
object AutoBridge {
  // The name src/lib/auto.ts registers with AppRegistry.registerHeadlessTask.
  private const val HEADLESS_TASK = "PodnomsAuto"
  private const val BROWSE_TIMEOUT_MS = 20_000L

  private val main = Handler(Looper.getMainLooper())
  private var module: PodnomsAutoModule? = null
  private val waiting = mutableListOf<Pair<String, Bundle>>()
  private val requests = mutableMapOf<String, SettableFuture<LibraryResult<ImmutableList<MediaItem>>>>()
  private var startingJs = false

  var service: AutoLibraryService? = null
    set(value) {
      field = value
      value?.usePlayer(sessionPlayer())
    }

  private var player: WeakReference<AudioPlayer>? = null
  private var nowPlaying: NowPlaying? = null

  fun attach(module: PodnomsAutoModule) = main.post {
    this.module = module
    startingJs = false
    waiting.forEach { (name, body) -> module.sendEvent(name, body) }
    waiting.clear()
  }

  fun detach(module: PodnomsAutoModule) = main.post {
    if (this.module === module) this.module = null
  }

  fun browse(context: Context, parentId: String): ListenableFuture<LibraryResult<ImmutableList<MediaItem>>> {
    val requestId = UUID.randomUUID().toString()
    val future = SettableFuture.create<LibraryResult<ImmutableList<MediaItem>>>()
    requests[requestId] = future
    send(context, "onBrowse", Bundle().apply {
      putString("requestId", requestId)
      putString("parentId", parentId)
    })
    main.postDelayed({
      requests.remove(requestId)?.let {
        startingJs = false
        it.set(LibraryResult.ofError(SessionError(SessionError.ERROR_UNKNOWN, "PodNoms didn't answer. Try again.")))
      }
    }, BROWSE_TIMEOUT_MS)
    return future
  }

  fun play(context: Context, mediaId: String) =
    send(context, "onPlay", Bundle().apply { putString("mediaId", mediaId) })

  fun resolve(context: Context, requestId: String, items: List<AutoItem>?, error: AutoError?) = main.post {
    val future = requests.remove(requestId) ?: return@post
    future.set(
      if (error != null) {
        val code = if (error.code == "signed-out") {
          SessionError.ERROR_SESSION_AUTHENTICATION_EXPIRED
        } else {
          SessionError.ERROR_UNKNOWN
        }
        LibraryResult.ofError(SessionError(code, error.message))
      } else {
        LibraryResult.ofItemList(items.orEmpty().map { mediaItem(context, it) }, null)
      }
    )
  }

  // expo-audio's own session would sit beside ours and take the car's and the
  // system's attention, even for a moment when playback starts, so it goes as
  // soon as the player exists. The app doesn't turn on expo-audio's lock
  // screen controls, so it's never rebuilt.
  fun claimPlayer(player: AudioPlayer) = main.post {
    player.mediaSession.release()
  }

  // The app's player, after it plays an episode, and what to show for it.
  fun setPlayer(context: Context, player: AudioPlayer, nowPlaying: NowPlaying) = main.post {
    player.mediaSession.release()
    this.player = WeakReference(player)
    this.nowPlaying = nowPlaying
    service?.usePlayer(sessionPlayer()) ?: connectToService(context)
  }

  // Starts the service when the phone plays without the car connected, as
  // the notification and lock screen come from its session.
  private var serviceConnection: ListenableFuture<MediaController>? = null

  private fun connectToService(context: Context) {
    if (serviceConnection != null) return
    val token = SessionToken(context, ComponentName(context, AutoLibraryService::class.java))
    serviceConnection = MediaController.Builder(context, token).buildAsync()
  }

  fun clearPlayer() = main.post {
    player = null
    nowPlaying = null
    service?.usePlayer(null)
  }

  private fun sessionPlayer(): AutoPlayer? {
    val audioPlayer = player?.get() ?: return null
    val playing = nowPlaying
    val metadata = playing?.let {
      MediaMetadata.Builder()
        .setTitle(it.title)
        .setArtist(it.subtitle)
        .setArtworkUri(it.artworkUrl?.let(Uri::parse))
        .setIsBrowsable(false)
        .setIsPlayable(true)
        .build()
    }
    return AutoPlayer(audioPlayer.player, playing?.id, metadata) { audioPlayer.requestPlay() }
  }

  fun browsableItem(id: String, title: String) = MediaItem.Builder()
    .setMediaId(id)
    .setMediaMetadata(
      MediaMetadata.Builder()
        .setTitle(title)
        .setIsBrowsable(true)
        .setIsPlayable(false)
        .build()
    )
    .build()

  private fun mediaItem(context: Context, item: AutoItem): MediaItem {
    val extras = Bundle()
    item.progress?.let { progress ->
      extras.putInt(
        MediaConstants.EXTRAS_KEY_COMPLETION_STATUS,
        MediaConstants.EXTRAS_VALUE_COMPLETION_STATUS_PARTIALLY_PLAYED
      )
      extras.putDouble(MediaConstants.EXTRAS_KEY_COMPLETION_PERCENTAGE, progress.coerceIn(0.0, 1.0))
    }
    return MediaItem.Builder()
      .setMediaId(item.id)
      .setMediaMetadata(
        MediaMetadata.Builder()
          .setTitle(item.title)
          .setSubtitle(item.subtitle)
          .setArtist(item.subtitle)
          .setArtworkUri(item.artworkUrl?.let { AutoArtworkProvider.uriFor(context, it) })
          .setIsBrowsable(!item.playable)
          .setIsPlayable(item.playable)
          .setMediaType(if (item.playable) MediaMetadata.MEDIA_TYPE_PODCAST_EPISODE else MediaMetadata.MEDIA_TYPE_PODCAST)
          .setExtras(extras)
          .build()
      )
      .build()
  }

  private fun send(context: Context, name: String, body: Bundle) {
    val module = module
    if (module != null) {
      module.sendEvent(name, body)
    } else {
      waiting += name to body
      startJs(context)
    }
  }

  // Runs the app's JS without its screen, as RN's HeadlessJsTaskService does.
  private fun startJs(context: Context) {
    if (startingJs) return
    val host = (context.applicationContext as? ReactApplication)?.reactHost ?: return
    startingJs = true
    val current = host.currentReactContext
    if (current != null) {
      runTask(current)
      return
    }
    host.addReactInstanceEventListener(object : ReactInstanceEventListener {
      override fun onReactContextInitialized(context: ReactContext) {
        host.removeReactInstanceEventListener(this)
        runTask(context)
      }
    })
    host.start()
  }

  private fun runTask(context: ReactContext) = UiThreadUtil.runOnUiThread {
    HeadlessJsTaskContext.getInstance(context)
      .startTask(HeadlessJsTaskConfig(HEADLESS_TASK, Arguments.createMap(), 0, true))
  }
}
