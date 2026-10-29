import { router } from 'expo-router'
import { Pause, Play, RotateCcw, Trash2 } from 'lucide-react-native'
import { Alert, Pressable, View } from 'react-native'
import { Artwork } from '@/components/artwork'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Progress } from '@/components/ui/progress'
import { Text } from '@/components/ui/text'
import { useDeleteEpisode, useRetryEpisode } from '@/hooks/use-podcasts'
import type { Episode, Podcast } from '@/lib/api-types'
import { describeProgress, formatDate, formatDuration } from '@/lib/format'
import { usePlayer } from '@/lib/player'

// One of the user's episodes: opens its page (with comments), plays it from
// its button when it's ready, shows how it's coming along while it's being
// made, and can be retried or deleted when that failed.
export function EpisodeRow({ episode, podcast }: { episode: Episode; podcast: Podcast }) {
  const player = usePlayer()
  const retry = useRetryEpisode()
  const remove = useDeleteEpisode()
  const isCurrent = player.episode?.id === episode.id
  const isPlaying = isCurrent && player.status.playing
  const playable = episode.status === 'ready' && episode.audioUrl
  const working = episode.status === 'pending' || episode.status === 'processing'
  const progress = working ? describeProgress(episode.progress) : null
  const listened =
    episode.durationSeconds && episode.positionSeconds ? episode.positionSeconds / episode.durationSeconds : 0

  function playOrPause() {
    if (!playable) return
    if (isCurrent) return player.toggle()
    player.play({
      id: episode.id,
      title: episode.title,
      podcastTitle: podcast.title,
      imageUrl: episode.imageUrl ?? podcast.imageUrl,
      audioUrl: episode.audioUrl!,
      durationSeconds: episode.durationSeconds,
      positionSeconds: episode.positionSeconds,
    })
  }

  function confirmDelete() {
    Alert.alert('Delete episode?', `"${episode.title}" will be removed from the podcast and its feed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove.mutate(episode.id) },
    ])
  }

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/episodes/[id]', params: { id: episode.id } })}
      className="gap-2 border-b border-border px-4 py-3 active:bg-muted"
      accessibilityRole="link"
      accessibilityLabel={episode.title}>
      <View className="flex-row gap-3">
        <Artwork uri={episode.imageUrl ?? podcast.imageUrl} size={56} />
        <View className="flex-1 gap-1">
          <Text className="font-medium" numberOfLines={2}>
            {episode.title}
          </Text>
          <View className="flex-row flex-wrap items-center gap-2">
            <StatusBadge status={episode.status} isPrivate={episode.private} />
            <Text variant="muted">
              {[formatDate(episode.publishedAt ?? episode.createdAt), formatDuration(episode.durationSeconds)]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </View>
        </View>
        {playable && (
          <Pressable
            onPress={playOrPause}
            hitSlop={8}
            className="h-10 w-10 items-center justify-center self-center rounded-full bg-primary active:opacity-80"
            accessibilityLabel={`${isPlaying ? 'Pause' : 'Play'} ${episode.title}`}>
            <Icon as={isPlaying ? Pause : Play} size={18} className="text-primary-foreground" />
          </Pressable>
        )}
      </View>
      {playable && listened > 0 && <Progress value={listened * 100} className="h-1" />}
      {progress && (
        <View className="gap-1">
          <Text variant="muted">{progress.label}</Text>
          {progress.fraction !== null && <Progress value={progress.fraction * 100} className="h-1" />}
        </View>
      )}
      {episode.status === 'failed' && (
        <View className="gap-2">
          {episode.error && (
            <Text variant="muted" numberOfLines={3}>
              {episode.error}
            </Text>
          )}
          <View className="flex-row gap-2">
            <Button size="sm" variant="outline" onPress={() => retry.mutate(episode.id)} disabled={retry.isPending}>
              <Icon as={RotateCcw} />
              <Text>Retry</Text>
            </Button>
            <Button size="sm" variant="ghost" onPress={confirmDelete} disabled={remove.isPending}>
              <Icon as={Trash2} />
              <Text>Delete</Text>
            </Button>
          </View>
        </View>
      )}
    </Pressable>
  )
}
