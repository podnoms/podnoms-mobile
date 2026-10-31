// What podnoms-platform's mobile API (src/routes/api/mobile/*) sends back.

export type User = {
  id: string
  name: string | null
  slug: string
  email: string | null
  imageUrl: string | null
  isAdmin: boolean
}

export type Show = {
  id: string
  slug: string
  title: string
  description: string | null
  imageUrl: string | null
  private: boolean
  // Whether it's broadcasting right now.
  live: boolean
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

// A show's page, for any show the user may see.
export type ShowDetails = Show & { author: string | null; isOwner: boolean; following: boolean; followerCount: number }

export type ShowWithEpisodes = { show: ShowDetails; episodes: Episode[] }

// A show in a list of others' shows.
export type ShowSummary = {
  id: string
  slug: string
  title: string
  author: string | null
  imageUrl: string | null
  episodeCount: number
  followerCount: number
  live: boolean
}

export type Home = { following: ShowSummary[]; trending: ShowSummary[]; yours: Show[] }

export type ContinueListeningEpisode = {
  id: string
  slug: string
  title: string
  imageUrl: string | null
  audioUrl: string | null
  durationSeconds: number | null
  positionSeconds: number
  show: { slug: string; title: string }
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
  show: { id: string; slug: string; title: string; imageUrl: string | null; isOwner: boolean }
  comments: EpisodeComment[]
  // Which GIF provider to search, with its public key; null if none is set up.
  gifs: { provider: 'klipy' | 'giphy'; key: string } | null
}

export type ChatMessage = {
  id: string
  author: { name: string | null; imageUrl: string | null }
  body: string
  gif: CommentGif | null
  createdAt: string
  canDelete: boolean
}

export type LivePage = {
  show: { id: string; slug: string; title: string; author: string | null; imageUrl: string | null }
  // What's on; null while off air. `interrupted` means the stream has dropped
  // out, and may come back.
  broadcast: { id: string; title: string; startedAt: string; interrupted: boolean } | null
  // The video, as HLS, which takes the same token as the API.
  hlsUrl: string
  chat: ChatMessage[]
  viewers: number
  gifs: { provider: 'klipy' | 'giphy'; key: string } | null
}

export type NotificationSettings = {
  live: boolean
  newEpisodes: boolean
  // The shows the user follows, which they can mute one by one.
  shows: { id: string; slug: string; title: string; imageUrl: string | null; notify: boolean }[]
}
