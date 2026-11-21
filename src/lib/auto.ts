// What Android Auto shows (modules/podnoms-auto): Continue listening, the
// shows the user follows, and their own shows (a tab only if they have any),
// each show with its episodes; an episode picked in the car
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

// Home, which the tabs and two of them all ask for, kept briefly so opening
// the library doesn't load it three times.
const homeCacheMs = 30_000
let homeCache: { at: number; home: Promise<Home> } | null = null

function home() {
  if (!homeCache || Date.now() - homeCache.at > homeCacheMs) {
    const request = api<Home>('/api/mobile/home')
    homeCache = { at: Date.now(), home: request }
    request.catch(() => {
      if (homeCache?.home === request) homeCache = null
    })
  }
  return homeCache.home
}

const tab = (id: string, title: string): AutoItem => ({ id, title, playable: false })

// The library's tabs. If Home can't be loaded, the ones everybody has, which
// then say what's wrong when opened.
async function tabs() {
  const yours = await home().then(
    (page) => page.yours.length > 0,
    () => false,
  )
  return [
    tab('continue', 'Continue listening'),
    tab('following', 'Following'),
    ...(yours ? [tab('yours', 'Your shows')] : []),
  ]
}

async function children(parentId: string): Promise<AutoItem[]> {
  if (parentId === 'root') return tabs()
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
    const { following } = await home()
    return following.map((show) => ({
      id: `show:${show.id}`,
      title: show.title,
      subtitle: show.author,
      artworkUrl: show.imageUrl,
      playable: false,
    }))
  }
  if (parentId === 'yours') {
    const { yours } = await home()
    return yours.map((show) => ({
      id: `show:${show.id}`,
      title: show.title,
      artworkUrl: show.imageUrl,
      playable: false,
    }))
  }
  if (parentId.startsWith('show:')) {
    const showId = parentId.slice('show:'.length)
    const { show, episodes } = await api<ShowWithEpisodes>(
      `/api/mobile/shows/${encodeURIComponent(showId)}?limit=${showEpisodeLimit}`,
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
