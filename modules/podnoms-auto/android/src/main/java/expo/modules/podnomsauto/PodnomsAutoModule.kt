package expo.modules.podnomsauto

import androidx.annotation.OptIn
import androidx.media3.common.util.UnstableApi
import expo.modules.audio.AudioPlayer
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

// A row in the car's lists, from src/lib/auto.ts.
class AutoItem : Record {
  @Field var id: String = ""
  @Field var title: String = ""
  @Field var subtitle: String? = null
  @Field var artworkUrl: String? = null
  @Field var playable: Boolean = false
  // How far through it the listener is, 0 to 1, for a started episode.
  @Field var progress: Double? = null
}

class AutoError : Record {
  // "signed-out" or "failed".
  @Field var code: String = "failed"
  @Field var message: String = ""
}

class NowPlaying : Record {
  @Field var id: String = ""
  @Field var title: String = ""
  @Field var subtitle: String? = null
  @Field var artworkUrl: String? = null
}

@OptIn(UnstableApi::class)
class PodnomsAutoModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("PodnomsAuto")

    Events("onBrowse", "onPlay")

    // JS is listening: sends it whatever the car asked for meanwhile.
    Function("ready") {
      AutoBridge.attach(this@PodnomsAutoModule)
    }

    Function("resolveBrowse") { requestId: String, items: List<AutoItem>?, error: AutoError? ->
      val context = appContext.reactContext ?: return@Function
      AutoBridge.resolve(context, requestId, items, error)
    }

    Function("claimPlayer") { player: AudioPlayer ->
      AutoBridge.claimPlayer(player)
    }

    Function("setPlayer") { player: AudioPlayer, nowPlaying: NowPlaying ->
      val context = appContext.reactContext ?: return@Function
      AutoBridge.setPlayer(context, player, nowPlaying)
    }

    Function("clearPlayer") {
      AutoBridge.clearPlayer()
    }

    OnDestroy {
      AutoBridge.detach(this@PodnomsAutoModule)
    }
  }
}
