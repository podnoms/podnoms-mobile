package expo.modules.podnomsauto

import android.app.PendingIntent
import android.os.Bundle
import androidx.annotation.OptIn
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.session.CommandButton
import androidx.media3.session.DefaultMediaNotificationProvider
import androidx.media3.session.LibraryResult
import androidx.media3.session.MediaConstants
import androidx.media3.session.MediaLibraryService
import androidx.media3.session.MediaSession
import androidx.media3.session.SessionError
import com.google.common.collect.ImmutableList
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture

// PodNoms's only media session on Android: the notification and lock screen,
// headset and Bluetooth buttons, and Android Auto, with its library (Continue
// listening, Following). Android Auto ignores a session other than the one its
// library hands it, so the app doesn't turn on expo-audio's own (see
// player-engine.ts). The session lasts as long as the service, whatever the
// app is playing, so the car never loses it; its player is swapped instead
// (usePlayer). Media3 keeps the service in the foreground while it plays.
@OptIn(UnstableApi::class)
class AutoLibraryService : MediaLibraryService() {
  companion object {
    private const val ROOT = "root"
    private val tabs = listOf("continue" to "Continue listening", "following" to "Following")
  }

  // Stands in until the app has played something; never loads anything.
  private lateinit var idlePlayer: ExoPlayer
  private var session: MediaLibrarySession? = null

  override fun onCreate() {
    super.onCreate()
    setMediaNotificationProvider(
      DefaultMediaNotificationProvider.Builder(this).build().apply {
        // The monochrome icon expo-notifications adds, if it's there.
        val icon = resources.getIdentifier("notification_icon", "drawable", packageName)
        if (icon != 0) setSmallIcon(icon)
      }
    )
    idlePlayer = ExoPlayer.Builder(this).build()
    session = MediaLibrarySession.Builder(this, AutoPlayer(idlePlayer), LibraryCallback())
      .setId("PodnomsAuto")
      .setMediaButtonPreferences(skipButtons())
      .apply { appIntent()?.let(::setSessionActivity) }
      .build()
    AutoBridge.service = this
  }

  override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaLibrarySession? = session

  // Skip back and forward, as podcast apps have, rather than previous and next.
  private fun skipButtons() = listOf(
    CommandButton.Builder(CommandButton.ICON_SKIP_BACK_10)
      .setPlayerCommand(Player.COMMAND_SEEK_BACK)
      .setDisplayName("Skip back")
      .setSlots(CommandButton.SLOT_BACK)
      .build(),
    CommandButton.Builder(CommandButton.ICON_SKIP_FORWARD_10)
      .setPlayerCommand(Player.COMMAND_SEEK_FORWARD)
      .setDisplayName("Skip forward")
      .setSlots(CommandButton.SLOT_FORWARD)
      .build()
  )

  // Opens the app from the notification.
  private fun appIntent(): PendingIntent? {
    val intent = packageManager.getLaunchIntentForPackage(packageName) ?: return null
    return PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
  }

  fun usePlayer(player: AutoPlayer?) {
    session?.player = player ?: AutoPlayer(idlePlayer)
  }

  override fun onDestroy() {
    AutoBridge.service = null
    session?.release()
    session = null
    idlePlayer.release()
    super.onDestroy()
  }

  private inner class LibraryCallback : MediaLibrarySession.Callback {
    override fun onGetLibraryRoot(
      session: MediaLibrarySession,
      browser: MediaSession.ControllerInfo,
      params: LibraryParams?
    ): ListenableFuture<LibraryResult<MediaItem>> {
      // Lists for tabs and shows, and episodes as rows with their artwork.
      val extras = Bundle().apply {
        putInt(MediaConstants.EXTRAS_KEY_CONTENT_STYLE_BROWSABLE, MediaConstants.EXTRAS_VALUE_CONTENT_STYLE_LIST_ITEM)
        putInt(MediaConstants.EXTRAS_KEY_CONTENT_STYLE_PLAYABLE, MediaConstants.EXTRAS_VALUE_CONTENT_STYLE_LIST_ITEM)
      }
      val rootParams = LibraryParams.Builder().setExtras(extras).build()
      return Futures.immediateFuture(LibraryResult.ofItem(AutoBridge.browsableItem(ROOT, "PodNoms"), rootParams))
    }

    override fun onGetChildren(
      session: MediaLibrarySession,
      browser: MediaSession.ControllerInfo,
      parentId: String,
      page: Int,
      pageSize: Int,
      params: LibraryParams?
    ): ListenableFuture<LibraryResult<ImmutableList<MediaItem>>> {
      if (parentId == ROOT) {
        val items = tabs.map { (id, title) -> AutoBridge.browsableItem(id, title) }
        return Futures.immediateFuture(LibraryResult.ofItemList(items, params))
      }
      return AutoBridge.browse(this@AutoLibraryService, parentId)
    }

    override fun onGetItem(
      session: MediaLibrarySession,
      browser: MediaSession.ControllerInfo,
      mediaId: String
    ): ListenableFuture<LibraryResult<MediaItem>> =
      Futures.immediateFuture(LibraryResult.ofError(SessionError(SessionError.ERROR_NOT_SUPPORTED, "Not available")))

    // An episode picked in the car: the app plays it (and hands the player
    // back), and AutoPlayer ignores the car's attempt to load it itself.
    override fun onAddMediaItems(
      mediaSession: MediaSession,
      controller: MediaSession.ControllerInfo,
      mediaItems: MutableList<MediaItem>
    ): ListenableFuture<MutableList<MediaItem>> {
      mediaItems.firstOrNull()?.mediaId?.takeIf { it.isNotEmpty() }?.let {
        AutoBridge.play(this@AutoLibraryService, it)
      }
      return Futures.immediateFuture(mediaItems)
    }
  }
}
