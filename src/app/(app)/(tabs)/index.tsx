import { Link } from 'expo-router'
import { Plus } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { Pressable, RefreshControl, ScrollView, View } from 'react-native'
import { ShowCard } from '@/components/show-card'
import { Icon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { useHome } from '@/hooks/use-shows'

// The shows the user follows, others to discover, and any of their own.
export default function HomeScreen() {
  const home = useHome()
  const { following = [], trending = [], yours = [] } = home.data ?? {}

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={<RefreshControl refreshing={home.isRefetching} onRefresh={() => void home.refetch()} />}>
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
                {trending.length > 0 ? 'Shows you follow will be here. Why not start with one of these?' : 'Shows you follow will be here.'}
              </Text>
            )}
          </Section>
          {trending.length > 0 && (
            <Section title="Trending">
              {trending.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </Section>
          )}
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
        </>
      )}
    </ScrollView>
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
