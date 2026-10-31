import type { EpisodeProgress } from '@/lib/api-types'

// 75 → "1:15", 3725 → "1:02:05".
export function formatTime(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = String(seconds % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}

// 3725 → "1 hr 2 min", 300 → "5 min".
export function formatDuration(totalSeconds: number | null) {
  if (!totalSeconds) return null
  const minutes = Math.round(totalSeconds / 60)
  if (minutes < 60) return `${Math.max(1, minutes)} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} hr ${m} min` : `${h} hr`
}

export function formatDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

// 1, "episode" → "1 episode"; 3, "episode" → "3 episodes".
export function pluralise(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? '' : 's'}`
}

// The time of day, as "14:05" or "2:05 PM" where the device's locale prefers it.
export function formatClock(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// What a processing episode is doing, as on the site's show page, with a
// fraction done when it's known.
export function describeProgress(progress: EpisodeProgress | null): { label: string; fraction: number | null } {
  switch (progress?.stage) {
    case 'queued':
      if (progress.paused) return { label: `Waiting: ${progress.paused.platform} is busy`, fraction: null }
      return { label: progress.ahead ? `Queued (${progress.ahead} ahead)` : 'Queued', fraction: null }
    case 'fetching':
      return { label: 'Fetching details…', fraction: null }
    case 'downloading': {
      const { downloadedBytes, totalBytes } = progress
      if (!totalBytes) return { label: `Downloading ${formatBytes(downloadedBytes)}`, fraction: null }
      return {
        label: `Downloading ${formatBytes(downloadedBytes)} of ${formatBytes(totalBytes)}`,
        fraction: downloadedBytes / totalBytes,
      }
    }
    case 'converting':
      return {
        label: progress.percent === null ? 'Converting…' : `Converting ${Math.round(progress.percent)}%`,
        fraction: progress.percent === null ? null : progress.percent / 100,
      }
    default:
      return { label: 'Waiting to start', fraction: null }
  }
}

// "just now", "5m", "3h", "2d", then the date.
export function timeAgo(iso: string, now = Date.now()) {
  const seconds = Math.max(0, (now - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h`
  if (seconds < 7 * 86_400) return `${Math.floor(seconds / 86_400)}d`
  return formatDate(iso)!
}
