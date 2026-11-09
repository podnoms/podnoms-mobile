import { router } from 'expo-router'
import { Pause, Play, X } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Artwork } from '@/components/artwork'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { Waveform } from '@/components/waveform'
import { useWaveform } from '@/hooks/use-episode'
import { usePlayer } from '@/lib/player'

// Above the tab bar while something's loaded; opens the episode's page.
// `safeArea` is for the foot of a screen without a tab bar: the app draws
// edge to edge, so it clears the system's navigation bar itself (and, with
// nothing loaded, leaves a gap that tall so the screen still does).
export function MiniPlayer({ safeArea = false }: { safeArea?: boolean }) {
  const { episode, status, toggle, stop } = usePlayer()
  const { bottom } = useSafeAreaInsets()
  const { data: waveform } = useWaveform(episode?.id)
  const inset = safeArea ? bottom : 0
  if (!episode) return inset ? <View style={{ height: inset }} /> : null
  const duration = status.duration || episode.durationSeconds || 0
  const fraction = duration ? status.currentTime / duration : 0

  return (
    <View className="border-t border-border bg-card" style={{ paddingBottom: inset }}>
      {/* The waveform as a faint backdrop, its played part tinted, behind
          everything but the system bar's gap. It doesn't seek here, where it'd
          be easy to catch: the episode's page does. */}
      {waveform && duration ? (
        <View className="absolute inset-x-0 top-0" style={{ bottom: inset }} pointerEvents="none">
          <Waveform values={waveform} duration={duration} position={status.currentTime} size="backdrop" />
        </View>
      ) : null}
      <View className="h-0.5 bg-muted">
        <View className="h-0.5 bg-primary" style={{ width: `${Math.min(100, fraction * 100)}%` }} />
      </View>
      <Pressable
        onPress={() => router.push({ pathname: '/episodes/[id]', params: { id: episode.id } })}
        className="flex-row items-center gap-3 px-3 py-2"
        accessibilityLabel="Open episode">
        <Artwork uri={episode.imageUrl} size={40} />
        <View className="flex-1">
          <Text className="font-medium" numberOfLines={1}>
            {episode.title}
          </Text>
          <Text variant="muted" numberOfLines={1}>
            {episode.showTitle}
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
