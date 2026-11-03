// The player (player-engine.ts) for the screens: the mini player, the full
// player and every list with a play button.
import { useAudioPlayerStatus, type AudioStatus } from 'expo-audio'
import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react'
import * as engine from '@/lib/player-engine'
import type { PlayableEpisode } from '@/lib/player-engine'

export { playbackRates, type PlayableEpisode } from '@/lib/player-engine'

type PlayerContextValue = {
  episode: PlayableEpisode | null
  status: AudioStatus
  play: (episode: PlayableEpisode) => void
  toggle: () => void
  seekTo: (seconds: number) => void
  skip: (seconds: number) => void
  rate: number
  setRate: (rate: number) => void
  stop: () => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const status = useAudioPlayerStatus(engine.player)
  const { episode, rate } = useSyncExternalStore(engine.subscribe, engine.getState)

  const value: PlayerContextValue = {
    episode,
    status,
    rate,
    play: engine.play,
    toggle: engine.toggle,
    seekTo: engine.seekTo,
    skip: engine.skip,
    setRate: engine.setRate,
    stop: engine.stop,
  }

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (!context) throw new Error('usePlayer must be used inside PlayerProvider')
  return context
}
