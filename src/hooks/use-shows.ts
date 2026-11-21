import { queryOptions, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ContinueListeningEpisode, Episode, Home, Show, ShowWithEpisodes, User } from '@/lib/api-types'

// How often a show's episodes are asked for again while any are being made.
const processingRefetchMs = 5_000
// How often to ask which shows are live, for their badges.
const liveRefetchMs = 10_000

export function useMe() {
  return useQuery({ queryKey: ['me'], queryFn: () => api<User>('/api/mobile/me') })
}

export function useShows() {
  return useQuery({ queryKey: ['shows'], queryFn: () => api<Show[]>('/api/mobile/shows') })
}

export function useHome() {
  return useQuery({ queryKey: ['home'], queryFn: () => api<Home>('/api/mobile/home') })
}

// A show's page and its newest episodes, shared by its screen and Home's
// newest episodes from the user's own shows.
function showQuery(id: string) {
  return queryOptions({
    queryKey: ['show', id],
    queryFn: () => api<ShowWithEpisodes>(`/api/mobile/shows/${encodeURIComponent(id)}?limit=100`),
    refetchInterval: (query) =>
      query.state.data?.episodes.some((episode) => episode.status === 'pending' || episode.status === 'processing')
        ? processingRefetchMs
        : false,
  })
}

export function useShow(id: string) {
  return useQuery(showQuery(id))
}

// The newest episodes across the user's own shows, whether played or still
// being made, each with its show.
export function useYourLatestEpisodes(shows: Show[], limit: number) {
  return useQueries({
    queries: shows.map((show) => showQuery(show.id)),
    combine: (results) => ({
      isPending: results.some((result) => result.isPending),
      episodes: results
        .flatMap((result) => result.data?.episodes.map((episode) => ({ episode, show: result.data.show })) ?? [])
        .sort((a, b) => latest(b.episode).localeCompare(latest(a.episode)))
        .slice(0, limit),
    }),
  })
}

const latest = (episode: Episode) => episode.publishedAt ?? episode.createdAt

// Whether a show is live now, from a small list every badge shares, so one
// shows up within seconds wherever it's looking. Until that's loaded, what the
// show's own page or list said.
export function useIsLive(show: { id: string; live: boolean }) {
  const liveNow = useQuery({
    queryKey: ['live-now'],
    queryFn: () => api<{ showIds: string[] }>('/api/mobile/live'),
    refetchInterval: liveRefetchMs,
    staleTime: 0,
  })
  return liveNow.data?.showIds ? liveNow.data.showIds.includes(show.id) : show.live
}

export function useFollowShow(showId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { showId: string; following: boolean }) =>
      api<{ following: boolean; followerCount: number }>('/api/mobile/follows', { method: 'POST', body: input }),
    onSuccess: (result) => {
      queryClient.setQueryData<ShowWithEpisodes>(['show', showId], (page) =>
        page ? { ...page, show: { ...page.show, ...result } } : page,
      )
      return queryClient.invalidateQueries({ queryKey: ['home'] })
    },
  })
}

export function useContinueListening() {
  return useQuery({
    queryKey: ['continue-listening'],
    queryFn: () => api<ContinueListeningEpisode[]>('/api/mobile/continue-listening'),
  })
}

export function useAddEpisode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { showId: string; sourceUrl: string }) =>
      api<{ id: string; slug: string }>('/api/mobile/episodes', { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['show'] }),
  })
}

export function useRetryEpisode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (episodeId: string) => api(`/api/mobile/episodes/${episodeId}/retry`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['show'] }),
  })
}

export function useDeleteEpisode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (episodeId: string) => api(`/api/mobile/episodes/${episodeId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['show'] }),
  })
}
