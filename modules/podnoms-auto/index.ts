// Android Auto's side of PodNoms (android/): the car's library and session.
// Android only; elsewhere every call does nothing. See src/lib/auto.ts.
import { requireOptionalNativeModule, type EventSubscription } from 'expo'
import type { AudioPlayer } from 'expo-audio'

export type AutoItem = {
  id: string
  title: string
  subtitle?: string | null
  artworkUrl?: string | null
  playable: boolean
  // How far through it the listener is, 0 to 1, for a started episode.
  progress?: number | null
}

export type AutoError = { code: 'signed-out' | 'failed'; message: string }

export type NowPlaying = { id: string; title: string; subtitle?: string | null; artworkUrl?: string | null }

type Events = {
  onBrowse: (event: { requestId: string; parentId: string }) => void
  onPlay: (event: { mediaId: string }) => void
}

type PodnomsAutoModule = {
  ready(): void
  resolveBrowse(requestId: string, items: AutoItem[] | null, error: AutoError | null): void
  claimPlayer(player: AudioPlayer): void
  setPlayer(player: AudioPlayer, nowPlaying: NowPlaying): void
  clearPlayer(): void
  addListener<E extends keyof Events>(event: E, listener: Events[E]): EventSubscription
}

const native = requireOptionalNativeModule<PodnomsAutoModule>('PodnomsAuto')

export const isAvailable = native !== null

export function ready() {
  native?.ready()
}

export function resolveBrowse(requestId: string, result: { items: AutoItem[] } | { error: AutoError }) {
  native?.resolveBrowse(requestId, 'items' in result ? result.items : null, 'error' in result ? result.error : null)
}

// Takes over the player's media session (expo-audio's goes), so the car and
// the system only ever see this module's.
export function claimPlayer(player: AudioPlayer) {
  native?.claimPlayer(player)
}

export function setPlayer(player: AudioPlayer, nowPlaying: NowPlaying) {
  native?.setPlayer(player, nowPlaying)
}

export function clearPlayer() {
  native?.clearPlayer()
}

export function addListener<E extends keyof Events>(event: E, listener: Events[E]) {
  return native?.addListener(event, listener)
}
