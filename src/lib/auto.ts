// What Android Auto shows (modules/podnoms-auto): Continue listening, and the
// shows the user follows with their episodes; an episode picked in the car
// plays with the app's player. Set up when the app's JS starts, whether the
// app was opened or the car started it headless (index.ts).
import * as PodnomsAuto from '../../modules/podnoms-auto'
import type { AutoItem } from '../../modules/podnoms-auto'
import { api, isSignedIn } from '@/lib/api'
import type { ContinueListeningEpisode, EpisodePage, Home, ShowWithEpisodes } from '@/lib/api-types'
import { loadSession } from '@/lib/auth'
import { play } from '@/lib/player-engine'

// How many of a show's episodes the car lists, newest first.
const showEpisodeLimit = 50

const episodeItemId = (id: string) => `episode:${id}`

function progress(positionSeconds: number, durationSeconds: number | null) {
  return positionSeconds > 0 && durationSeconds ? positionSeconds / durationSeconds : null
}

async function children(parentId: string): Promise<AutoItem[]> {
  if (parentId === 'continue') {
    const episodes = await api<ContinueListeningEpisode[]>('/api/mobile/continue-listening')
    return episodes
      .filter((episode) => episode.audioUrl)
      .map((episode) => ({
        id: episodeItemId(episode.id),
        title: episode.title,
        subtitle: episode.show.title,
        artworkUrl: episode.imageUrl,
        playable: true,
        progress: progress(episode.positionSeconds, episode.durationSeconds),
      }))
  }
  if (parentId === 'following') {
    const home = await api<Home>('/api/mobile/home')
    return home.following.map((show) => ({
      id: `show:${show.slug}`,
      title: show.title,
      subtitle: show.author,
      artworkUrl: show.imageUrl,
      playable: false,
    }))
  }
  if (parentId.startsWith('show:')) {
    const slug = parentId.slice('show:'.length)
    const { show, episodes } = await api<ShowWithEpisodes>(
      `/api/mobile/shows/${encodeURIComponent(slug)}?limit=${showEpisodeLimit}`,
    )
    return episodes
      .filter((episode) => episode.status === 'ready' && episode.audioUrl)
      .map((episode) => ({
        id: episodeItemId(episode.id),
        title: episode.title,
        subtitle: show.title,
        artworkUrl: episode.imageUrl ?? show.imageUrl,
        playable: true,
        progress: progress(episode.positionSeconds, episode.durationSeconds),
      }))
  }
  return []
}

async function browse(requestId: string, parentId: string) {
  if (!isSignedIn()) {
    PodnomsAuto.resolveBrowse(requestId, {
      error: { code: 'signed-out', message: 'Sign in to PodNoms on your phone' },
    })
    return
  }
  try {
    PodnomsAuto.resolveBrowse(requestId, { items: await children(parentId) })
  } catch {
    PodnomsAuto.resolveBrowse(requestId, {
      error: { code: 'failed', message: "Couldn't load this. Check your connection." },
    })
  }
}

async function playFromCar(mediaId: string) {
  if (!mediaId.startsWith('episode:')) return
  const page = await api<EpisodePage>(`/api/mobile/episodes/${mediaId.slice('episode:'.length)}`)
  if (!page.episode.audioUrl) return
  play({
    id: page.episode.id,
    title: page.episode.title,
    showTitle: page.show.title,
    imageUrl: page.episode.imageUrl ?? page.show.imageUrl,
    audioUrl: page.episode.audioUrl,
    durationSeconds: page.episode.durationSeconds,
    positionSeconds: page.episode.positionSeconds,
  })
}

let started = false

export async function setUpAuto() {
  if (started || !PodnomsAuto.isAvailable) return
  started = true
  await loadSession()
  PodnomsAuto.addListener('onBrowse', ({ requestId, parentId }) => void browse(requestId, parentId))
  PodnomsAuto.addListener('onPlay', ({ mediaId }) => void playFromCar(mediaId).catch(() => {}))
  PodnomsAuto.ready()
}
