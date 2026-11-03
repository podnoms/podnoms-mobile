package expo.modules.podnomsauto

import androidx.annotation.OptIn
import androidx.media3.common.ForwardingPlayer
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi

// What the car's session controls: the app's player (expo-audio's ExoPlayer)
// once it has played something, otherwise an idle one. The app decides what
// plays, so episodes the car picks are handed to it (AutoBridge.play) and the
// car's attempt to load them here is ignored.
@OptIn(UnstableApi::class)
class AutoPlayer(
  player: Player,
  private val mediaId: String? = null,
  private val metadata: MediaMetadata? = null,
  // Plays through expo-audio, which takes audio focus first.
  private val requestPlay: (() -> Unit)? = null
) : ForwardingPlayer(player) {
  // Set once the car has picked an episode, until the app hands over the
  // player again, so the car's "play" doesn't resume the old one meanwhile.
  private var waitingForApp = false

  override fun play() {
    if (waitingForApp) return
    requestPlay?.invoke() ?: super.play()
  }

  override fun prepare() {
    if (!waitingForApp) super.prepare()
  }

  override fun setMediaItems(mediaItems: MutableList<MediaItem>) {
    waitingForApp = true
  }

  override fun setMediaItems(mediaItems: MutableList<MediaItem>, resetPosition: Boolean) {
    waitingForApp = true
  }

  override fun setMediaItems(mediaItems: MutableList<MediaItem>, startIndex: Int, startPositionMs: Long) {
    waitingForApp = true
  }

  override fun setMediaItem(mediaItem: MediaItem) {
    waitingForApp = true
  }

  override fun setMediaItem(mediaItem: MediaItem, startPositionMs: Long) {
    waitingForApp = true
  }

  override fun setMediaItem(mediaItem: MediaItem, resetPosition: Boolean) {
    waitingForApp = true
  }

  override fun getMediaMetadata(): MediaMetadata = metadata ?: super.getMediaMetadata()

  override fun getCurrentMediaItem(): MediaItem? {
    val item = super.getCurrentMediaItem() ?: return null
    return item.buildUpon()
      .apply { if (mediaId != null) setMediaId(mediaId) }
      .apply { if (metadata != null) setMediaMetadata(metadata) }
      .build()
  }
}
