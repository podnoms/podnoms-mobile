import { Host, Slider } from '@expo/ui'
import { router } from 'expo-router'
import { MessageCircle, Pause, Play, RotateCcw, RotateCw } from 'lucide-react-native'
import { useEffect } from 'react'
import { Pressable, View } from 'react-native'
import { Artwork } from '@/components/artwork'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { formatTime } from '@/lib/format'
import { playbackRates, usePlayer } from '@/lib/player'

// The whole player: artwork, scrubbing, skipping and speed.
export default function PlayerScreen() {
  const { episode, status, toggle, seekTo, skip, rate, setRate } = usePlayer()

  // Closed from the mini player while open, say.
  useEffect(() => {
    if (!episode) router.back()
  }, [episode])
  if (!episode) return null

  const duration = status.duration || episode.durationSeconds || 0
  const nextRate = playbackRates[(playbackRates.indexOf(rate) + 1) % playbackRates.length]!

  return (
    <View className="flex-1 items-center gap-6 bg-background px-6 pt-6">
      <Artwork uri={episode.imageUrl} size={280} />
      <View className="w-full gap-1">
        <Text variant="h4" className="text-center" numberOfLines={3}>
          {episode.title}
        </Text>
        <Text variant="muted" className="text-center">
          {episode.showTitle}
        </Text>
      </View>

      <View className="w-full gap-1">
        <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
          <Slider value={status.currentTime} min={0} max={Math.max(duration, 1)} onValueChange={seekTo} />
        </Host>
        <View className="flex-row justify-between">
          <Text variant="muted">{formatTime(status.currentTime)}</Text>
          <Text variant="muted">{duration ? `-${formatTime(duration - status.currentTime)}` : ''}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-10">
        <Pressable onPress={() => skip(-15)} hitSlop={12} accessibilityLabel="Back 15 seconds">
          <Icon as={RotateCcw} size={30} className="text-foreground" />
        </Pressable>
        <Pressable
          onPress={toggle}
          className="h-20 w-20 items-center justify-center rounded-full bg-primary active:opacity-80"
          accessibilityLabel={status.playing ? 'Pause' : 'Play'}>
          <Icon as={status.playing ? Pause : Play} size={36} className="text-primary-foreground" />
        </Pressable>
        <Pressable onPress={() => skip(30)} hitSlop={12} accessibilityLabel="Forward 30 seconds">
          <Icon as={RotateCw} size={30} className="text-foreground" />
        </Pressable>
      </View>

      <View className="flex-row gap-3">
        <Pressable
          onPress={() => setRate(nextRate)}
          className="border border-border px-4 py-2 active:bg-muted"
          accessibilityLabel={`Playback speed ${rate}x`}>
          <Text className="font-semibold">{rate}×</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            router.back()
            router.push({ pathname: '/episodes/[id]', params: { id: episode.id } })
          }}
          className="flex-row items-center gap-2 border border-border px-4 py-2 active:bg-muted">
          <Icon as={MessageCircle} size={16} className="text-foreground" />
          <Text className="font-semibold">Comments</Text>
        </Pressable>
      </View>
      {status.isBuffering && <Text variant="muted">Loading…</Text>}
    </View>
  )
}
