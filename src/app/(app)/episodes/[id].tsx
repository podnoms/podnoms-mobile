import { Link, Stack, useLocalSearchParams } from 'expo-router'
import { Pause, Play } from 'lucide-react-native'
import { useState } from 'react'
import { FlatList, Pressable, RefreshControl, View } from 'react-native'
import { Artwork } from '@/components/artwork'
import { CommentComposer } from '@/components/comment-composer'
import { CommentItem } from '@/components/comment-item'
import { KeyboardSpacer } from '@/components/keyboard-spacer'
import { MiniPlayer } from '@/components/mini-player'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { useEpisodePage } from '@/hooks/use-episode'
import type { CommentReply, EpisodeComment, EpisodePage } from '@/lib/api-types'
import { describeProgress, formatDate, formatDuration, formatTime } from '@/lib/format'
import { usePlayer } from '@/lib/player'

// An episode: its details, playing it, and its comments, which can be added
// to, replied to and liked here.
export default function EpisodeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const query = useEpisodePage(id)
  const player = usePlayer()
  const [replyingTo, setReplyingTo] = useState<CommentReply | null>(null)
  const page = query.data

  const isCurrent = player.episode?.id === id
  // A new comment is about where the listener is now, or where they left off.
  const atSeconds = Math.floor(isCurrent ? player.status.currentTime : (page?.episode.positionSeconds ?? 0))

  function playFrom(seconds?: number) {
    if (!page?.episode.audioUrl) return
    if (isCurrent) {
      if (seconds === undefined) return player.toggle()
      player.seekTo(seconds)
      if (!player.status.playing) player.toggle()
      return
    }
    player.play({
      id: page.episode.id,
      title: page.episode.title,
      podcastTitle: page.podcast.title,
      imageUrl: page.episode.imageUrl,
      audioUrl: page.episode.audioUrl,
      durationSeconds: page.episode.durationSeconds,
      positionSeconds: seconds ?? page.episode.positionSeconds,
    })
  }

  // Replies to a reply join its thread, as on the site.
  const items = (page?.comments ?? []).flatMap((comment) => [
    { comment, isReply: false },
    ...comment.replies.map((reply) => ({ comment: reply, isReply: true })),
  ])
  const canComment = page?.episode.status === 'ready'

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: page?.podcast.title ?? '' }} />
      <FlatList
        // Gives way to the composer as it grows (a GIF, the GIF picker).
        className="flex-1 bg-background"
        data={items}
        keyExtractor={(item) => item.comment.id}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} />}
        ListHeaderComponent={
          page ? (
            <EpisodeHeader
              page={page}
              isPlaying={isCurrent && player.status.playing}
              onPlay={() => playFrom()}
              commentCount={page.comments.reduce((n, c) => n + 1 + c.replies.length, 0)}
            />
          ) : query.isPending ? (
            <View className="gap-3 p-4">
              <Skeleton className="h-32 w-32" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </View>
          ) : (
            <Text className="p-8 text-center">{query.error?.message ?? 'Not found'}</Text>
          )
        }
        renderItem={({ item }) => (
          <CommentItem
            comment={item.comment}
            episodeId={id}
            isReply={item.isReply}
            onReply={(comment) =>
              // Replies always go to the thread's first comment.
              setReplyingTo(
                item.isReply
                  ? (page!.comments.find((c: EpisodeComment) => c.replies.some((r) => r.id === comment.id)) ?? comment)
                  : comment,
              )
            }
            onPlayAt={page?.episode.audioUrl ? playFrom : undefined}
          />
        )}
        ListEmptyComponent={
          canComment ? (
            <Text variant="muted" className="px-4 py-6 text-center">
              No comments yet. Be the first.
            </Text>
          ) : undefined
        }
      />
      {canComment && (
        <CommentComposer
          episodeId={id}
          atSeconds={atSeconds}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          gifs={page!.gifs}
        />
      )}
      {!isCurrent && <MiniPlayer />}
      {/* Keeps the composer just above the keyboard. */}
      <KeyboardSpacer />
    </View>
  )
}

// Descriptions longer than this start folded.
const longDescription = 280

function EpisodeHeader({
  page,
  isPlaying,
  onPlay,
  commentCount,
}: {
  page: EpisodePage
  isPlaying: boolean
  onPlay: () => void
  commentCount: number
}) {
  const { episode, podcast } = page
  const [expanded, setExpanded] = useState(false)
  const working = episode.status === 'pending' || episode.status === 'processing'
  const progress = working ? describeProgress(episode.progress) : null
  const meta = [
    formatDate(episode.publishedAt ?? episode.createdAt),
    formatDuration(episode.durationSeconds),
    episode.positionSeconds && episode.durationSeconds ? `${formatTime(episode.durationSeconds - episode.positionSeconds)} left` : null,
  ].filter(Boolean)

  return (
    <View className="gap-4 border-b border-border p-4">
      <View className="flex-row gap-4">
        <Artwork uri={episode.imageUrl} size={112} />
        <View className="flex-1 gap-1">
          <Text variant="h4">{episode.title}</Text>
          {podcast.isOwner ? (
            <Link href={{ pathname: '/podcasts/[slug]', params: { slug: podcast.slug } }}>
              <Text className="text-primary">{podcast.title}</Text>
            </Link>
          ) : (
            <Text variant="muted">{podcast.title}</Text>
          )}
          <Text variant="muted">{meta.join(' · ')}</Text>
          <StatusBadge status={episode.status} isPrivate={episode.private} />
        </View>
      </View>

      {episode.audioUrl && (
        <Button onPress={onPlay}>
          <Icon as={isPlaying ? Pause : Play} />
          <Text>{isPlaying ? 'Pause' : episode.positionSeconds ? `Resume from ${formatTime(episode.positionSeconds)}` : 'Play'}</Text>
        </Button>
      )}
      {progress && (
        <View className="gap-1">
          <Text variant="muted">{progress.label}</Text>
          {progress.fraction !== null && <Progress value={progress.fraction * 100} className="h-1" />}
        </View>
      )}
      {episode.status === 'failed' && episode.error && <Text variant="muted">{episode.error}</Text>}

      {episode.description ? (
        episode.description.length > longDescription ? (
          <Pressable onPress={() => setExpanded(!expanded)} accessibilityLabel={expanded ? 'Show less' : 'Show more'}>
            <Text numberOfLines={expanded ? undefined : 5}>{episode.description.trim()}</Text>
            <Text className="pt-1 text-sm font-medium text-primary">{expanded ? 'Less' : 'More'}</Text>
          </Pressable>
        ) : (
          <Text>{episode.description.trim()}</Text>
        )
      ) : null}

      {episode.status === 'ready' && (
        <Text variant="large">
          Comments{commentCount ? ` (${commentCount})` : ''}
        </Text>
      )}
    </View>
  )
}
