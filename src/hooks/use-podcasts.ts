import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ContinueListeningEpisode, Podcast, PodcastWithEpisodes, User } from '@/lib/api-types'

// How often a podcast's episodes are asked for again while any are being made.
const processingRefetchMs = 5_000

export function useMe() {
  return useQuery({ queryKey: ['me'], queryFn: () => api<User>('/api/mobile/me') })
}

export function usePodcasts() {
  return useQuery({ queryKey: ['podcasts'], queryFn: () => api<Podcast[]>('/api/mobile/podcasts') })
}

export function usePodcast(slug: string) {
  return useQuery({
    queryKey: ['podcast', slug],
    queryFn: () => api<PodcastWithEpisodes>(`/api/mobile/podcasts/${encodeURIComponent(slug)}?limit=100`),
    refetchInterval: (query) =>
      query.state.data?.episodes.some((episode) => episode.status === 'pending' || episode.status === 'processing')
        ? processingRefetchMs
        : false,
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
    mutationFn: (input: { podcastId: string; sourceUrl: string }) =>
      api<{ id: string; slug: string }>('/api/mobile/episodes', { method: 'POST', body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['podcast'] }),
  })
}

export function useRetryEpisode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (episodeId: string) => api(`/api/mobile/episodes/${episodeId}/retry`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['podcast'] }),
  })
}

export function useDeleteEpisode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (episodeId: string) => api(`/api/mobile/episodes/${episodeId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['podcast'] }),
  })
}
