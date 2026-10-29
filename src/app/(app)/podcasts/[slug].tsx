import { Stack, useLocalSearchParams } from 'expo-router'
import { FlatList, RefreshControl, View } from 'react-native'
import { Artwork } from '@/components/artwork'
import { EpisodeRow } from '@/components/episode-row'
import { MiniPlayer } from '@/components/mini-player'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { usePodcast } from '@/hooks/use-podcasts'

export default function PodcastScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const query = usePodcast(slug)
  const podcast = query.data?.podcast

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: podcast?.title ?? '' }} />
      <FlatList
        data={podcast ? query.data!.episodes : []}
        keyExtractor={(episode) => episode.id}
        renderItem={({ item }) => <EpisodeRow episode={item} podcast={podcast!} />}
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} />}
        ListHeaderComponent={
          podcast ? (
            <View className="flex-row gap-4 border-b border-border p-4">
              <Artwork uri={podcast.imageUrl} size={96} />
              <View className="flex-1 gap-1">
                <Text variant="h4">{podcast.title}</Text>
                {podcast.description ? (
                  <Text variant="muted" numberOfLines={4}>
                    {podcast.description}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          query.isPending ? (
            <View className="gap-3 p-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </View>
          ) : query.isError ? (
            <Text className="p-8 text-center">{query.error.message}</Text>
          ) : (
            <Text variant="muted" className="p-8 text-center">
              No episodes yet.
            </Text>
          )
        }
      />
      <MiniPlayer />
    </View>
  )
}
