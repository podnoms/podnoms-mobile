import { router } from 'expo-router'
import { Check, Pause, Play, RotateCcw, Trash2, Undo2, type LucideIcon } from 'lucide-react-native'
import { useRef } from 'react'
import { Alert, Pressable, View } from 'react-native'
import Swipeable, { SwipeDirection, type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable'
import { Artwork } from '@/components/artwork'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Progress } from '@/components/ui/progress'
import { Text } from '@/components/ui/text'
import { useMarkPlayed } from '@/hooks/use-played'
import { useDeleteEpisode, useRetryEpisode } from '@/hooks/use-shows'
import type { Episode, Show } from '@/lib/api-types'
import { describeProgress, formatDate, formatDuration } from '@/lib/format'
import { usePlayer } from '@/lib/player'
import { cn } from '@/lib/utils'

// How far a row is dragged before letting go marks it.
const swipeThresholdPx = 72

// An episode in a show's list: opens its page (with comments) and plays it
// from its button when it's ready. On the user's own shows, also shows how
// it's coming along while it's being made, and can be retried or deleted when
// that failed. A ready one is dragged left to mark it as played, and right to
// mark it as unplayed again.
export function EpisodeRow({ episode, show }: { episode: Episode; show: Show }) {
  const player = usePlayer()
  const retry = useRetryEpisode()
  const remove = useDeleteEpisode()
  const markPlayed = useMarkPlayed()
  const swipeable = useRef<SwipeableMethods>(null)
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
      showTitle: show.title,
      imageUrl: episode.imageUrl ?? show.imageUrl,
      audioUrl: episode.audioUrl!,
      durationSeconds: episode.durationSeconds,
      positionSeconds: episode.positionSeconds,
    })
  }

  function confirmDelete() {
    Alert.alert('Delete episode?', `"${episode.title}" will be removed from the show and its feed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => remove.mutate(episode.id),
      },
    ])
  }

  const row = (
    <Pressable
      onPress={() => router.push({ pathname: '/episodes/[id]', params: { id: episode.id } })}
      className="gap-2 border-b border-border bg-background px-4 py-3 active:bg-muted"
      accessibilityRole="link"
      accessibilityLabel={episode.title}>
      <View className="flex-row gap-3">
        <Artwork uri={episode.imageUrl ?? show.imageUrl} size={56} />
        <View className="flex-1 gap-1">
          <Text className={cn('font-medium', episode.played && 'text-muted-foreground')} numberOfLines={2}>
            {episode.title}
          </Text>
          <View className="flex-row flex-wrap items-center gap-2">
            <StatusBadge status={episode.status} isPrivate={episode.private} />
            {episode.played && (
              <View className="flex-row items-center gap-1">
                <Icon as={Check} size={14} className="text-muted-foreground" />
                <Text variant="muted">Played</Text>
              </View>
            )}
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
      {playable && !episode.played && listened > 0 && <Progress value={listened * 100} className="h-1" />}
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

  if (!playable) return row
  // Only the side that would change something can be dragged open. The
  // action fills the row, so the row slides away over it; it's back in place
  // by the time it's listed again.
  return (
    <Swipeable
      ref={swipeable}
      friction={1.5}
      overshootLeft={false}
      overshootRight={false}
      leftThreshold={swipeThresholdPx}
      rightThreshold={swipeThresholdPx}
      renderRightActions={episode.played ? undefined : () => <SwipeAction icon={Check} label="Played" side="right" />}
      renderLeftActions={episode.played ? () => <SwipeAction icon={Undo2} label="Unplayed" side="left" /> : undefined}
      onSwipeableOpen={(direction) => {
        swipeable.current?.close()
        markPlayed(episode, direction === SwipeDirection.LEFT)
      }}>
      {row}
    </Swipeable>
  )
}

// What shows behind a row as it's dragged, at the side it's dragged from.
function SwipeAction({ icon, label, side }: { icon: LucideIcon; label: string; side: 'left' | 'right' }) {
  return (
    <View
      className={cn(
        'w-full flex-row items-center gap-2 px-6',
        side === 'right' ? 'justify-end bg-primary' : 'bg-secondary',
      )}>
      <Icon
        as={icon}
        size={18}
        className={side === 'right' ? 'text-primary-foreground' : 'text-secondary-foreground'}
      />
      <Text
        className={cn(
          'text-sm font-medium',
          side === 'right' ? 'text-primary-foreground' : 'text-secondary-foreground',
        )}>
        {label}
      </Text>
    </View>
  )
}
