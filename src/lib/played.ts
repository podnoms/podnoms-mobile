// Which episodes the user has played. A show's list leaves them out unless
// asked; the player marks one when it finishes, and rows can be swiped to
// mark them either way.
import { api } from '@/lib/api'
import type { EpisodePage, ShowWithEpisodes } from '@/lib/api-types'
import { queryClient } from '@/lib/query-client'

// Shows it in the lists and pages already loaded, without waiting to refetch.
function cachePlayed(episodeId: string, played: boolean) {
  queryClient.setQueriesData<ShowWithEpisodes>({ queryKey: ['show'] }, (page) =>
    page?.episodes.some((episode) => episode.id === episodeId && episode.played !== played)
      ? {
          ...page,
          episodes: page.episodes.map((episode) => (episode.id === episodeId ? { ...episode, played } : episode)),
        }
      : page,
  )
  queryClient.setQueryData<EpisodePage>(['episode', episodeId], (page) =>
    page ? { ...page, episode: { ...page.episode, played } } : page,
  )
}

// Marks an episode played or not, showing it at once and putting it back if
// the server didn't take it (when this rejects).
export async function setPlayed(episodeId: string, played: boolean) {
  cachePlayed(episodeId, played)
  try {
    await api(`/api/mobile/episodes/${episodeId}/played`, {
      method: 'POST',
      body: { played },
    })
  } catch (error) {
    cachePlayed(episodeId, !played)
    throw error
  } finally {
    // Played episodes aren't ones to carry on with.
    void queryClient.invalidateQueries({ queryKey: ['continue-listening'] })
  }
}
