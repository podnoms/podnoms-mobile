import { Stack, useLocalSearchParams } from 'expo-router'
import { FlatList, RefreshControl, View } from 'react-native'
import { Artwork } from '@/components/artwork'
import { EpisodeRow } from '@/components/episode-row'
import { FollowButton } from '@/components/follow-button'
import { LiveBadge } from '@/components/live-badge'
import { MiniPlayer } from '@/components/mini-player'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { useShow } from '@/hooks/use-shows'
import { pluralise } from '@/lib/format'

export default function ShowScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const query = useShow(slug)
  const show = query.data?.show

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: show?.title ?? '' }} />
      <FlatList
        data={show ? query.data!.episodes : []}
        keyExtractor={(episode) => episode.id}
        renderItem={({ item }) => <EpisodeRow episode={item} show={show!} />}
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} />}
        ListHeaderComponent={
          show ? (
            <View className="flex-row gap-4 border-b border-border p-4">
              <Artwork uri={show.imageUrl} size={96} />
              <View className="flex-1 gap-1">
                <Text variant="h4">{show.title}</Text>
                <Text variant="muted" numberOfLines={1}>
                  {[show.author, pluralise(show.followerCount, 'follower')].filter(Boolean).join(' · ')}
                </Text>
                <View className="flex-row">
                  <LiveBadge show={show} />
                </View>
                {show.description ? (
                  <Text variant="muted" numberOfLines={4}>
                    {show.description}
                  </Text>
                ) : null}
                {!show.isOwner && <FollowButton show={show} />}
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
