import { router } from 'expo-router'
import { Pause, Play, X } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { Artwork } from '@/components/artwork'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { usePlayer } from '@/lib/player'

// Above the tab bar while something's loaded; opens the full player.
export function MiniPlayer() {
  const { episode, status, toggle, stop } = usePlayer()
  if (!episode) return null
  const fraction = status.duration ? status.currentTime / status.duration : 0

  return (
    <View className="border-t border-border bg-card">
      <View className="h-0.5 bg-muted">
        <View className="h-0.5 bg-primary" style={{ width: `${Math.min(100, fraction * 100)}%` }} />
      </View>
      <Pressable
        onPress={() => router.push('/player')}
        className="flex-row items-center gap-3 px-3 py-2"
        accessibilityLabel="Open player">
        <Artwork uri={episode.imageUrl} size={40} />
        <View className="flex-1">
          <Text className="font-medium" numberOfLines={1}>
            {episode.title}
          </Text>
          <Text variant="muted" numberOfLines={1}>
            {episode.podcastTitle}
          </Text>
        </View>
        <Pressable
          onPress={toggle}
          hitSlop={8}
          className="h-10 w-10 items-center justify-center"
          accessibilityLabel={status.playing ? 'Pause' : 'Play'}>
          <Icon as={status.playing ? Pause : Play} size={22} className="text-foreground" />
        </Pressable>
        <Pressable
          onPress={stop}
          hitSlop={8}
          className="h-10 w-8 items-center justify-center"
          accessibilityLabel="Close player">
          <Icon as={X} size={18} className="text-muted-foreground" />
        </Pressable>
      </Pressable>
    </View>
  )
}
