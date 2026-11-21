import { useQueryClient } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { Plus } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { Pressable, RefreshControl, ScrollView, View } from 'react-native'
import { EpisodeRow } from '@/components/episode-row'
import { ShowCard } from '@/components/show-card'
import { Icon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { useHome, useYourLatestEpisodes } from '@/hooks/use-shows'
import type { Show } from '@/lib/api-types'

// The shows the user follows, their own shows with their newest episodes,
// then others to discover.
export default function HomeScreen() {
  const home = useHome()
  const queryClient = useQueryClient()
  const { following = [], trending = [], yours = [] } = home.data ?? {}

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={<RefreshControl refreshing={home.isRefetching} onRefresh={() => {
            void home.refetch()
            // Its newest episodes from the user's own shows, too.
            void queryClient.invalidateQueries({ queryKey: ['show'] })
          }} />}>
      {home.isPending ? (
        <View className="gap-3 p-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </View>
      ) : home.isError ? (
        <View className="items-center gap-2 p-8">
          <Text variant="large">Couldn&apos;t load your shows</Text>
          <Text variant="muted" className="text-center">
            {home.error.message}
          </Text>
        </View>
      ) : (
        <>
          <Section title="Following">
            {following.length > 0 ? (
              following.map((show) => <ShowCard key={show.id} show={show} />)
            ) : (
              <Text variant="muted" className="px-4 pb-4">
                {trending.length > 0 ? 'Shows you follow will be here. Why not start with one from Trending?' : 'Shows you follow will be here.'}
              </Text>
            )}
          </Section>
          {yours.length > 0 && (
            <Section
              title="Your shows"
              action={
                <Link href="/add-episode" asChild>
                  <Pressable hitSlop={8} className="flex-row items-center gap-1 active:opacity-70" accessibilityRole="link">
                    <Icon as={Plus} size={14} className="text-primary" />
                    <Text className="text-sm font-medium text-primary">Add an episode</Text>
                  </Pressable>
                </Link>
              }>
              {yours.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </Section>
          )}
          <YourLatestEpisodes shows={yours} />
          {trending.length > 0 && (
            <Section title="Trending">
              {trending.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </Section>
          )}
        </>
      )}
    </ScrollView>
  )
}

// How many of the newest episodes from the user's own shows Home lists.
const yourLatestLimit = 5

function YourLatestEpisodes({ shows }: { shows: Show[] }) {
  const latest = useYourLatestEpisodes(shows, yourLatestLimit)
  if (shows.length === 0 || (!latest.isPending && latest.episodes.length === 0)) return null
  return (
    <Section title="New in your shows">
      {latest.isPending ? (
        <View className="px-4 pb-4">
          <Skeleton className="h-16 w-full" />
        </View>
      ) : (
        latest.episodes.map(({ episode, show }) => <EpisodeRow key={episode.id} episode={episode} show={show} />)
      )}
    </Section>
  )
}

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <View>
      <View className="flex-row items-center justify-between px-4 pb-2 pt-4">
        <Text variant="small" className="uppercase text-muted-foreground">
          {title}
        </Text>
        {action}
      </View>
      {children}
    </View>
  )
}
