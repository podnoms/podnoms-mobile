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

export type CommentSegment = { text: string } | { mention: { slug: string; name: string | null } }

// A GIF from KLIPY or GIPHY, shown from the provider as given.
export type CommentGif = { provider: string; id: string; title: string; url: string; width: number; height: number }

export type CommentReply = {
  id: string
  author: { name: string | null; slug: string; imageUrl: string | null }
  body: CommentSegment[]
  gif: CommentGif | null
  atSeconds: number
  createdAt: string
  likeCount: number
  liked: boolean
  canDelete: boolean
}

export type EpisodeComment = CommentReply & { replies: CommentReply[] }

export type EpisodePage = {
  episode: Episode
  podcast: { id: string; slug: string; title: string; imageUrl: string | null; isOwner: boolean }
  comments: EpisodeComment[]
  // Which GIF provider to search, with its public key; null if none is set up.
  gifs: { provider: 'klipy' | 'giphy'; key: string } | null
}
