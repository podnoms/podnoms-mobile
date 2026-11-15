import { Stack, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { FlatList, RefreshControl, View } from 'react-native'
import { Artwork } from '@/components/artwork'
import { EpisodeRow } from '@/components/episode-row'
import { FollowButton } from '@/components/follow-button'
import { LiveBadge } from '@/components/live-badge'
import { MiniPlayer } from '@/components/mini-player'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { useShow } from '@/hooks/use-shows'
import { pluralise } from '@/lib/format'

export default function ShowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const query = useShow(id)
  const show = query.data?.show
  // Episodes the user has played are left out until they ask for them.
  const [showPlayed, setShowPlayed] = useState(false)
  const episodes = query.data?.episodes ?? []
  const unplayed = episodes.filter((episode) => !episode.played)

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: show?.title ?? '' }} />
      <FlatList
        data={showPlayed ? episodes : unplayed}
        keyExtractor={(episode) => episode.id}
        renderItem={({ item }) => <EpisodeRow episode={item} show={show!} />}
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} />}
        ListHeaderComponent={
          show ? (
            <View>
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
              {episodes.length > 0 && (
                <View className="flex-row gap-2 border-b border-border px-4 py-2" accessibilityRole="tablist">
                  {[
                    { label: `Unplayed (${unplayed.length})`, value: false },
                    { label: `All (${episodes.length})`, value: true },
                  ].map((filter) => (
                    <Button
                      key={filter.label}
                      size="sm"
                      variant={showPlayed === filter.value ? 'secondary' : 'ghost'}
                      onPress={() => setShowPlayed(filter.value)}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: showPlayed === filter.value }}>
                      <Text>{filter.label}</Text>
                    </Button>
                  ))}
                </View>
              )}
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
          ) : episodes.length > 0 ? (
            <View className="items-center gap-3 p-8">
              <Text variant="muted" className="text-center">
                You’ve played every episode here.
              </Text>
              <Button size="sm" variant="outline" onPress={() => setShowPlayed(true)}>
                <Text>Show played</Text>
              </Button>
            </View>
          ) : (
            <Text variant="muted" className="p-8 text-center">
              No episodes yet.
            </Text>
          )
        }
      />
      <MiniPlayer safeArea />
    </View>
  )
}
