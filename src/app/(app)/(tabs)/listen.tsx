import { router } from 'expo-router'
import { Play } from 'lucide-react-native'
import { FlatList, Pressable, RefreshControl, View } from 'react-native'
import { Artwork } from '@/components/artwork'
import { Icon } from '@/components/ui/icon'
import { Progress } from '@/components/ui/progress'
import { Text } from '@/components/ui/text'
import { useContinueListening } from '@/hooks/use-podcasts'
import type { ContinueListeningEpisode } from '@/lib/api-types'
import { formatTime } from '@/lib/format'
import { usePlayer } from '@/lib/player'

// Episodes started here or on the site, to carry on with.
export default function ListenScreen() {
  const episodes = useContinueListening()

  return (
    <FlatList
      className="flex-1 bg-background"
      data={episodes.data ?? []}
      keyExtractor={(episode) => episode.id}
      renderItem={({ item }) => <ContinueRow episode={item} />}
      refreshControl={<RefreshControl refreshing={episodes.isRefetching} onRefresh={() => void episodes.refetch()} />}
      ListHeaderComponent={
        <Text variant="small" className="px-4 pb-2 pt-4 uppercase text-muted-foreground">
          Continue listening
        </Text>
      }
      ListEmptyComponent={
        episodes.isPending ? undefined : (
          <View className="items-center gap-2 p-8">
            <Text variant="large">Nothing in progress</Text>
            <Text variant="muted" className="text-center">
              Episodes you start, here or on the site, show up here so you can pick up where you left off.
            </Text>
          </View>
        )
      }
    />
  )
}

function ContinueRow({ episode }: { episode: ContinueListeningEpisode }) {
  const player = usePlayer()
  const left = episode.durationSeconds ? episode.durationSeconds - episode.positionSeconds : null

  function play() {
    player.play({
      id: episode.id,
      title: episode.title,
      podcastTitle: episode.podcast.title,
      imageUrl: episode.imageUrl,
      audioUrl: episode.audioUrl!,
      durationSeconds: episode.durationSeconds,
      positionSeconds: episode.positionSeconds,
    })
  }

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/episodes/[id]', params: { id: episode.id } })}
      className="gap-2 border-b border-border px-4 py-3 active:bg-muted"
      accessibilityRole="link"
      accessibilityLabel={episode.title}>
      <View className="flex-row items-center gap-3">
        <Artwork uri={episode.imageUrl} size={56} />
        <View className="flex-1 gap-1">
          <Text className="font-medium" numberOfLines={2}>
            {episode.title}
          </Text>
          <Text variant="muted" numberOfLines={1}>
            {episode.podcast.title}
            {left !== null ? ` · ${formatTime(left)} left` : ''}
          </Text>
        </View>
        {episode.audioUrl && (
          <Pressable
            onPress={play}
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-full bg-primary active:opacity-80"
            accessibilityLabel={`Play ${episode.title}`}>
            <Icon as={Play} size={18} className="text-primary-foreground" />
          </Pressable>
        )}
      </View>
      {episode.durationSeconds ? (
        <Progress value={(episode.positionSeconds / episode.durationSeconds) * 100} className="h-1" />
      ) : null}
    </Pressable>
  )
}
