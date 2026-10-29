import { Link } from 'expo-router'
import { Plus } from 'lucide-react-native'
import { FlatList, Pressable, RefreshControl, View } from 'react-native'
import { PodcastCard } from '@/components/podcast-card'
import { Icon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { usePodcasts } from '@/hooks/use-podcasts'

export default function PodcastsScreen() {
  const podcasts = usePodcasts()

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={podcasts.data ?? []}
        keyExtractor={(podcast) => podcast.id}
        renderItem={({ item }) => <PodcastCard podcast={item} />}
        refreshControl={<RefreshControl refreshing={podcasts.isRefetching} onRefresh={() => void podcasts.refetch()} />}
        ListHeaderComponent={
          podcasts.data?.length ? (
            <Link href="/add-episode" asChild>
              <Pressable className="m-4 flex-row items-center justify-center gap-2 border border-border bg-primary p-3 active:opacity-80">
                <Icon as={Plus} size={18} className="text-primary-foreground" />
                <Text className="font-semibold text-primary-foreground">Add an episode from a link</Text>
              </Pressable>
            </Link>
          ) : undefined
        }
        ListEmptyComponent={
          podcasts.isPending ? (
            <View className="gap-3 p-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </View>
          ) : podcasts.isError ? (
            <EmptyState title="Couldn't load your podcasts" body={podcasts.error.message} />
          ) : (
            <EmptyState title="No podcasts yet" body="Create a podcast on the site, then add episodes to it from here." />
          )
        }
      />
    </View>
  )
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View className="items-center gap-2 p-8">
      <Text variant="large">{title}</Text>
      <Text variant="muted" className="text-center">
        {body}
      </Text>
    </View>
  )
}
