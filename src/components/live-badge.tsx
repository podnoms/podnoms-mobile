import { router } from 'expo-router'
import { Pressable, View } from 'react-native'
import { Badge } from '@/components/ui/badge'
import { Text } from '@/components/ui/text'
import { useIsLive } from '@/hooks/use-shows'

// That a show is broadcasting right now.
export function LiveIndicator() {
  return (
    <Badge variant="destructive">
      <View className="size-1.5 animate-pulse rounded-full bg-destructive-foreground" />
      <Text className="text-destructive-foreground">Live</Text>
    </Badge>
  )
}

// The same on a show that's live right now, opening its live page when pressed.
export function LiveBadge({ show }: { show: { slug: string; live: boolean } }) {
  const live = useIsLive(show)
  if (!live) return null
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/live/[slug]', params: { slug: show.slug } })}
      hitSlop={8}
      accessibilityRole="link"
      accessibilityLabel="Live now. Watch live"
      className="active:opacity-70">
      {/* Badge's `group` class makes it take touches itself, so it's kept from them. */}
      <View pointerEvents="none">
        <LiveIndicator />
      </View>
    </Pressable>
  )
}
