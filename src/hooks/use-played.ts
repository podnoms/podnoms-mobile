import { useCallback } from 'react'
import { useToast } from '@/components/toast'
import { setPlayed } from '@/lib/played'

// Marks an episode played or not and says so in a toast, whose Undo puts it
// back as it was.
export function useMarkPlayed() {
  const toast = useToast()
  return useCallback(
    (episode: { id: string; title: string }, played: boolean) => {
      const save = (value: boolean) =>
        setPlayed(episode.id, value).catch(() =>
          toast({
            message: `Couldn’t mark “${episode.title}” as ${value ? 'played' : 'unplayed'}.`,
          }),
        )
      void save(played)
      toast({
        message: `Marked “${episode.title}” as ${played ? 'played' : 'unplayed'}`,
        action: { label: 'Undo', onPress: () => void save(!played) },
      })
    },
    [toast],
  )
}
