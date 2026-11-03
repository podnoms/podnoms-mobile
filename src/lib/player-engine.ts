// The one audio player, kept outside React so Android Auto can play with the
// app closed (src/lib/auto.ts); PlayerProvider (player.tsx) shows it to the
// screens. Plays in the background with lock screen controls, starts where the
// listener left off and keeps the server told where that is, so the site
// resumes there too.
import { createAudioPlayer, setAudioModeAsync, type AudioStatus } from 'expo-audio'
import * as PodnomsAuto from '../../modules/podnoms-auto'
import { api, authHeaders } from '@/lib/api'
import { queryClient } from '@/lib/query-client'

export type PlayableEpisode = {
  id: string
  title: string
  showTitle: string
  imageUrl: string | null
  audioUrl: string
  durationSeconds: number | null
  positionSeconds: number
}

type PlayerState = { episode: PlayableEpisode | null; rate: number }

// How often the position is saved while playing.
const saveEveryMs = 15_000

// Positions this close to the end count as finished, and are cleared.
const finishedWithinSeconds = 30

export const playbackRates = [0.8, 1, 1.25, 1.5, 1.75, 2]

export const player = createAudioPlayer(null, { updateInterval: 500 })
PodnomsAuto.claimPlayer(player)

// Persistent focus, as music and podcast apps take: other apps stop rather than
// pause for a moment, and Android Auto only makes the app that holds it the
// car's media app (with 'doNotMix', the car kept showing the app before).
void setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMixPersistent' })

let state: PlayerState = { episode: null, rate: 1 }
const listeners = new Set<() => void>()

function setState(next: Partial<PlayerState>) {
  state = { ...state, ...next }
  listeners.forEach((listener) => listener())
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getState() {
  return state
}

// Where to start the episode just loaded, once it can seek.
let pendingSeek: number | null = null
let wasLoaded = false
let wasPlaying = false
let saveTimer: ReturnType<typeof setInterval> | null = null

function savePosition(episodeId: string, seconds: number) {
  void api(`/api/mobile/episodes/${episodeId}/position`, { method: 'POST', body: { seconds } }).catch(() => {})
}

function saveCurrentPosition() {
  const { episode } = state
  if (!episode || pendingSeek !== null) return
  const duration = player.duration || episode.durationSeconds || 0
  const finished = duration > 0 && player.currentTime > duration - finishedWithinSeconds
  savePosition(episode.id, finished ? 0 : player.currentTime)
  void queryClient.invalidateQueries({ queryKey: ['continue-listening'] })
}

player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
  // Starts from where the listener left off once the audio has loaded.
  if (status.isLoaded !== wasLoaded) {
    wasLoaded = status.isLoaded
    if (status.isLoaded && pendingSeek !== null) {
      const seconds = pendingSeek
      pendingSeek = null
      if (seconds > 0) void player.seekTo(seconds)
    }
  }

  // Saves the position on pausing, and every so often while playing.
  if (status.playing !== wasPlaying) {
    if (wasPlaying) saveCurrentPosition()
    wasPlaying = status.playing
    if (saveTimer) clearInterval(saveTimer)
    saveTimer = status.playing ? setInterval(saveCurrentPosition, saveEveryMs) : null
  }

  if (status.didJustFinish && state.episode) {
    savePosition(state.episode.id, 0)
    void queryClient.invalidateQueries({ queryKey: ['continue-listening'] })
  }
})

export function play(next: PlayableEpisode) {
  const { episode, rate } = state
  if (episode?.id === next.id) {
    player.play()
    return
  }
  if (episode) saveCurrentPosition()
  pendingSeek = next.positionSeconds
  player.replace({ uri: next.audioUrl, headers: authHeaders() })
  player.setPlaybackRate(rate)
  player.play()
  if (!PodnomsAuto.isAvailable) {
    const metadata = { title: next.title, artist: next.showTitle, artworkUrl: next.imageUrl ?? undefined }
    if (episode) player.updateLockScreenMetadata(metadata)
    else player.setActiveForLockScreen(true, metadata, { showSeekBackward: true, showSeekForward: true })
  }
  // On Android, the car module's session is the lock screen's and the car's.
  PodnomsAuto.setPlayer(player, {
    id: `episode:${next.id}`,
    title: next.title,
    subtitle: next.showTitle,
    artworkUrl: next.imageUrl,
  })
  setState({ episode: next })
  // Counts as a play in the owner's stats, as on the site's players.
  void api(`/api/episodes/${next.id}/activity`, { method: 'POST', body: { type: 'play', source: 'app' } }).catch(
    () => {},
  )
}

export function toggle() {
  if (player.playing) player.pause()
  else player.play()
}

export function seekTo(seconds: number) {
  void player.seekTo(Math.max(0, seconds))
}

export function skip(seconds: number) {
  const duration = player.duration || Infinity
  void player.seekTo(Math.min(duration, Math.max(0, player.currentTime + seconds)))
}

export function setRate(next: number) {
  player.setPlaybackRate(next)
  setState({ rate: next })
}

export function stop() {
  saveCurrentPosition()
  player.pause()
  if (!PodnomsAuto.isAvailable) player.clearLockScreenControls()
  PodnomsAuto.clearPlayer()
  setState({ episode: null })
}
