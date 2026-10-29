import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CommentGif, EpisodeComment, EpisodePage } from '@/lib/api-types'

export function useEpisodePage(id: string) {
  return useQuery({
    queryKey: ['episode', id],
    queryFn: () => api<EpisodePage>(`/api/mobile/episodes/${encodeURIComponent(id)}`),
    refetchInterval: (query) => {
      const status = query.state.data?.episode.status
      return status === 'pending' || status === 'processing' ? 5_000 : false
    },
  })
}

// Comments change the page's list in place, from what the server sends back.
function useSetComments(episodeId: string) {
  const queryClient = useQueryClient()
  return (update: (comments: EpisodeComment[]) => EpisodeComment[]) =>
    queryClient.setQueryData<EpisodePage>(['episode', episodeId], (page) =>
      page ? { ...page, comments: update(page.comments) } : page,
    )
}

export function useAddComment(episodeId: string) {
  const setComments = useSetComments(episodeId)
  return useMutation({
    mutationFn: (input: { body: string; gif?: CommentGif; atSeconds: number; parentId?: string }) =>
      api<EpisodeComment[]>(`/api/mobile/episodes/${episodeId}/comments`, { method: 'POST', body: input }),
    onSuccess: (comments) => setComments(() => comments),
  })
}

export function useLikeComment(episodeId: string) {
  const setComments = useSetComments(episodeId)
  return useMutation({
    mutationFn: ({ commentId, like }: { commentId: string; like: boolean }) =>
      api<{ likeCount: number; liked: boolean }>(`/api/mobile/comments/${commentId}/like`, {
        method: 'POST',
        body: { like },
      }),
    onSuccess: (result, { commentId }) => {
      const apply = <T extends { id: string }>(comment: T) => (comment.id === commentId ? { ...comment, ...result } : comment)
      setComments((comments) => comments.map((comment) => ({ ...apply(comment), replies: comment.replies.map(apply) })))
    },
  })
}

export function useDeleteComment(episodeId: string) {
  const setComments = useSetComments(episodeId)
  return useMutation({
    mutationFn: (commentId: string) => api(`/api/mobile/comments/${commentId}`, { method: 'DELETE' }),
    // Its replies go with it.
    onSuccess: (_, commentId) =>
      setComments((comments) =>
        comments
          .filter((comment) => comment.id !== commentId)
          .map((comment) => ({ ...comment, replies: comment.replies.filter((reply) => reply.id !== commentId) })),
      ),
  })
}
