import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ChatMessage, CommentGif, LivePage } from '@/lib/api-types'

// How often the live page is asked for again, for new chat and the broadcast
// starting and ending (React Native has no EventSource for the site's stream).
const refetchMs = 3_000

// A broadcast that ended while this was open keeps its chat on screen, as on
// the site, with `ended` to say so.
export type LiveView = LivePage & { ended: boolean }

const queryKey = (slug: string) => ['live', slug]

export function useLivePage(slug: string) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: queryKey(slug),
    queryFn: async (): Promise<LiveView> => {
      const page = await api<LivePage>(`/api/mobile/live/${encodeURIComponent(slug)}`)
      const before = queryClient.getQueryData<LiveView>(queryKey(slug))
      if (page.broadcast || !before) return { ...page, ended: false }
      return { ...page, chat: before.chat, ended: before.ended || before.broadcast !== null }
    },
    refetchInterval: refetchMs,
    // Whether a broadcast has ended only means something while the page is open.
    gcTime: 0,
  })
}

// Changes the page's chat in place, ahead of the next refetch, which is
// stopped if it's on its way as it could be from before this change.
function useSetChat(slug: string) {
  const queryClient = useQueryClient()
  return async (update: (chat: ChatMessage[]) => ChatMessage[]) => {
    await queryClient.cancelQueries({ queryKey: queryKey(slug) })
    queryClient.setQueryData<LiveView>(queryKey(slug), (page) => (page ? { ...page, chat: update(page.chat) } : page))
  }
}

export function useSendChat(slug: string) {
  const setChat = useSetChat(slug)
  return useMutation({
    mutationFn: ({ broadcastId, ...message }: { broadcastId: string; body?: string; gif?: CommentGif }) =>
      api<ChatMessage>(`/api/mobile/broadcasts/${broadcastId}/chat`, { method: 'POST', body: message }),
    onSuccess: (sent) => setChat((chat) => (chat.some((message) => message.id === sent.id) ? chat : [...chat, sent])),
  })
}

export function useDeleteChat(slug: string) {
  const setChat = useSetChat(slug)
  return useMutation({
    mutationFn: (messageId: string) => api(`/api/mobile/chat/${messageId}`, { method: 'DELETE' }),
    onSuccess: (_, messageId) => setChat((chat) => chat.filter((message) => message.id !== messageId)),
  })
}
