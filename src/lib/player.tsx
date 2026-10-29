// The one audio player, shared by the mini player, the full player and every
// list with a play button. Plays in the background with lock screen controls,
// starts where the listener left off and keeps the server told where that is,
// so the site resumes there too.
import { useQueryClient } from '@tanstack/react-query'
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, type AudioStatus } from 'expo-audio'
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { api, authHeaders } from '@/lib/api'

export type PlayableEpisode = {
  id: string
  title: string
  podcastTitle: string
  imageUrl: string | null
  audioUrl: string
  durationSeconds: number | null
  positionSeconds: number
}

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

// How often the position is saved while playing.
const saveEveryMs = 15_000

// Positions this close to the end count as finished, and are cleared.
const finishedWithinSeconds = 30

export const playbackRates = [0.8, 1, 1.25, 1.5, 1.75, 2]

function savePosition(episodeId: string, seconds: number) {
  void api(`/api/mobile/episodes/${episodeId}/position`, { method: 'POST', body: { seconds } }).catch(() => {})
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const player = useAudioPlayer(null, { updateInterval: 500 })
  const status = useAudioPlayerStatus(player)
  const [episode, setEpisode] = useState<PlayableEpisode | null>(null)
  const [rate, setRateState] = useState(1)
  // Where to start the episode just loaded, once it can seek.
  const pendingSeek = useRef<number | null>(null)
  const wasPlaying = useRef(false)

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMix' })
  }, [])

  function saveCurrentPosition() {
    if (!episode || pendingSeek.current !== null) return
    const duration = status.duration || episode.durationSeconds || 0
    const finished = duration > 0 && status.currentTime > duration - finishedWithinSeconds
    savePosition(episode.id, finished ? 0 : status.currentTime)
    void queryClient.invalidateQueries({ queryKey: ['continue-listening'] })
  }

  // Starts from where the listener left off once the audio has loaded.
  useEffect(() => {
    if (status.isLoaded && pendingSeek.current !== null) {
      const seconds = pendingSeek.current
      pendingSeek.current = null
      if (seconds > 0) void player.seekTo(seconds)
    }
  }, [status.isLoaded, player])

  // Saves the position on pausing, and every so often while playing.
  useEffect(() => {
    if (wasPlaying.current && !status.playing) saveCurrentPosition()
    wasPlaying.current = status.playing
    if (!status.playing) return
    const timer = setInterval(saveCurrentPosition, saveEveryMs)
    return () => clearInterval(timer)
    // saveCurrentPosition reads the latest status each time it runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.playing, episode?.id])

  useEffect(() => {
    if (status.didJustFinish && episode) {
      savePosition(episode.id, 0)
      void queryClient.invalidateQueries({ queryKey: ['continue-listening'] })
    }
  }, [status.didJustFinish, episode, queryClient])

  const value: PlayerContextValue = {
    episode,
    status,
    rate,
    play(next) {
      if (episode?.id === next.id) {
        player.play()
        return
      }
      if (episode) saveCurrentPosition()
      pendingSeek.current = next.positionSeconds
      player.replace({ uri: next.audioUrl, headers: authHeaders() })
      player.setPlaybackRate(rate)
      player.play()
      player.setActiveForLockScreen(
        true,
        { title: next.title, artist: next.podcastTitle, artworkUrl: next.imageUrl ?? undefined },
        { showSeekBackward: true, showSeekForward: true },
      )
      setEpisode(next)
      // Counts as a play in the owner's stats, as on the site's players.
      void api(`/api/episodes/${next.id}/activity`, { method: 'POST', body: { type: 'play', source: 'app' } }).catch(
        () => {},
      )
    },
    toggle() {
      if (status.playing) player.pause()
      else player.play()
    },
    seekTo(seconds) {
      void player.seekTo(Math.max(0, seconds))
    },
    skip(seconds) {
      const duration = status.duration || Infinity
      void player.seekTo(Math.min(duration, Math.max(0, status.currentTime + seconds)))
    },
    setRate(next) {
      player.setPlaybackRate(next)
      setRateState(next)
    },
    stop() {
      saveCurrentPosition()
      player.pause()
      player.clearLockScreenControls()
      setEpisode(null)
    },
  }

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (!context) throw new Error('usePlayer must be used inside PlayerProvider')
  return context
}
