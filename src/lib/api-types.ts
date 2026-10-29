// What podnoms-platform's mobile API (src/routes/api/mobile/*) sends back.

export type User = {
  id: string
  name: string | null
  slug: string
  email: string | null
  imageUrl: string | null
  isAdmin: boolean
}

export type Podcast = {
  id: string
  slug: string
  title: string
  description: string | null
  imageUrl: string | null
  private: boolean
}

export type EpisodeStatus = 'pending' | 'processing' | 'ready' | 'failed'

export type EpisodeProgress =
  | { stage: 'queued'; ahead: number; paused?: { platform: string; reason: string; until: string } }
  | { stage: 'fetching' }
  | {
      stage: 'downloading'
      downloadedBytes: number
      totalBytes: number | null
      bytesPerSecond: number | null
      secondsLeft: number | null
    }
  | { stage: 'converting'; percent: number | null }

export type Episode = {
  id: string
  slug: string
  title: string
  description: string | null
  sourceUrl: string | null
  imageUrl: string | null
  audioUrl: string | null
  durationSeconds: number | null
  status: EpisodeStatus
  error: string | null
  private: boolean
  createdAt: string
  publishedAt: string | null
  positionSeconds: number
  progress: EpisodeProgress | null
}

export type PodcastWithEpisodes = { podcast: Podcast; episodes: Episode[] }

export type ContinueListeningEpisode = {
  id: string
  slug: string
  title: string
  imageUrl: string | null
  audioUrl: string | null
  durationSeconds: number | null
  positionSeconds: number
  podcast: { slug: string; title: string }
}

export type SignInResult =
  | { status: 'signed-in'; token: string }
  | { status: 'two-factor'; challenge: string; methods: { totp: boolean; recovery: true } }
