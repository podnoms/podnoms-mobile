// Searching for GIFs to add to comments, from KLIPY or GIPHY (whichever the
// server has set up; it sends which, with the provider's public key, on each
// episode page). As on the site (podnoms-platform src/lib/gifs.ts, which this
// follows), both providers require searches and GIF files to go straight
// between the listener's device and them, and the chosen GIF's URL to be kept
// exactly as the provider gave it; the server only takes their own URLs.
import type { CommentGif } from '@/lib/api-types'

export type GifConfig = { provider: 'klipy' | 'giphy'; key: string }

// A search result: the GIF to send, and a smaller one for the picker.
export type GifResult = CommentGif & { preview: { url: string; width: number; height: number } }
export type GifPage = { results: GifResult[]; next: number | null }

// Roughly PG-13 for both, as on the site.
const giphyRating = 'pg-13'
const klipyContentFilter = 'medium'
export const gifPageSize = 24

type Media = { url?: string; width?: number | string; height?: number | string }

function media(file: Media | undefined) {
  const width = Number(file?.width)
  const height = Number(file?.height)
  return file?.url && width > 0 && height > 0 ? { url: file.url, width, height } : null
}

// --- KLIPY (docs.klipy.com/gifs-api) ---------------------------------------

type KlipySize = { gif?: Media; webp?: Media }
type KlipyItem = { id?: number | string; slug?: string; title?: string; file?: Record<string, KlipySize | undefined> }
type KlipyResponse = { data?: { data?: KlipyItem[]; current_page?: number; has_next?: boolean } }

function fromKlipy(response: KlipyResponse): GifPage {
  const results = (response.data?.data ?? []).flatMap((item): GifResult[] => {
    const file = item.file ?? {}
    const pick = (...sizes: string[]) => {
      for (const size of sizes) {
        const found = media(file[size]?.webp) ?? media(file[size]?.gif)
        if (found) return found
      }
      return null
    }
    const main = pick('md', 'sm', 'hd')
    const preview = pick('xs', 'sm', 'md')
    const id = item.slug ?? (item.id === undefined ? undefined : String(item.id))
    if (!main || !preview || !id) return []
    return [{ provider: 'klipy', id, title: item.title ?? '', ...main, preview }]
  })
  const page = response.data?.current_page ?? 1
  return { results, next: response.data?.has_next ? page + 1 : null }
}

function klipyUrl(config: GifConfig, query: string, page: number) {
  const url = new URL(`https://api.klipy.com/api/v1/${encodeURIComponent(config.key)}/gifs/${query ? 'search' : 'trending'}`)
  url.searchParams.set('page', String(page))
  url.searchParams.set('per_page', String(gifPageSize))
  url.searchParams.set('content_filter', klipyContentFilter)
  url.searchParams.set('format_filter', 'webp,gif')
  if (query) url.searchParams.set('q', query)
  return url
}

// --- GIPHY (developers.giphy.com/docs/api) ---------------------------------

type GiphyImage = Media & { webp?: string }
type GiphyItem = { id?: string; title?: string; images?: Record<string, GiphyImage | undefined> }
type GiphyResponse = { data?: GiphyItem[]; pagination?: { offset?: number; count?: number; total_count?: number } }

const giphyMedia = (image: GiphyImage | undefined) =>
  image ? (media({ ...image, url: image.webp ?? image.url }) ?? media(image)) : null

function fromGiphy(response: GiphyResponse): GifPage {
  const results = (response.data ?? []).flatMap((item): GifResult[] => {
    const images = item.images ?? {}
    const main = giphyMedia(images.fixed_width) ?? giphyMedia(images.downsized)
    const preview = giphyMedia(images.fixed_width_small) ?? main
    if (!main || !preview || !item.id) return []
    return [{ provider: 'giphy', id: item.id, title: item.title ?? '', ...main, preview }]
  })
  const { offset = 0, count = results.length, total_count: total = 0 } = response.pagination ?? {}
  const next = offset + count
  return { results, next: count > 0 && next < total ? next : null }
}

function giphyUrl(config: GifConfig, query: string, offset: number) {
  const url = new URL(`https://api.giphy.com/v1/gifs/${query ? 'search' : 'trending'}`)
  url.searchParams.set('api_key', config.key)
  url.searchParams.set('limit', String(gifPageSize))
  url.searchParams.set('offset', String(offset))
  url.searchParams.set('rating', giphyRating)
  url.searchParams.set('bundle', 'messaging_non_clips')
  if (query) url.searchParams.set('q', query)
  return url
}

// --- Searching ----------------------------------------------------------------

// The first page of GIFs for `query` (trending ones when it's empty), or the
// page at `next` from an earlier one.
export async function searchGifs(config: GifConfig, query: string, next?: number, signal?: AbortSignal): Promise<GifPage> {
  const trimmed = query.trim()
  const url = config.provider === 'klipy' ? klipyUrl(config, trimmed, next ?? 1) : giphyUrl(config, trimmed, next ?? 0)
  const response = await fetch(url.href, { signal })
  if (!response.ok) throw new Error(`GIF search failed (${response.status})`)
  const body = (await response.json()) as KlipyResponse & GiphyResponse
  return config.provider === 'klipy' ? fromKlipy(body) : fromGiphy(body)
}

// Only GIPHY asks for its name to be shown where its GIFs are offered.
export const gifAttribution: Record<GifConfig['provider'], string | null> = {
  klipy: null,
  giphy: 'Powered by GIPHY',
}

// The GIF as a comment carries it, without the picker's preview.
export function commentGif({ preview: _preview, ...gif }: GifResult): CommentGif {
  return gif
}
