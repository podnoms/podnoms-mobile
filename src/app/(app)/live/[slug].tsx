import { Image } from 'expo-image'
import { Stack, useLocalSearchParams } from 'expo-router'
import { Eye, RadioTower } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useKeyboardState } from 'react-native-keyboard-controller'
import { KeyboardSpacer } from '@/components/keyboard-spacer'
import { LiveChat } from '@/components/live-chat'
import { LiveIndicator } from '@/components/live-badge'
import { LiveVideo } from '@/components/live-video'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { useLivePage, type LiveView } from '@/hooks/use-live'
import { formatClock } from '@/lib/format'
import { usePlayer } from '@/lib/player'

// A show's live page: its broadcast while there is one, and the chat. It
// follows the broadcast starting and ending, as on the site.
export default function LiveScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const query = useLivePage(slug)
  const player = usePlayer()
  const page = query.data
  const broadcastId = page?.broadcast?.id ?? null
  // The details give way while writing, or the keyboard or a picker leaves
  // little of the chat to see.
  const keyboardOpen = useKeyboardState((keyboard) => keyboard.isVisible)
  const [panelOpen, setPanelOpen] = useState(false)

  // One thing at a time: the episode can be picked up from the mini player after.
  useEffect(() => {
    if (broadcastId && player.status.playing) player.toggle()
    // Only when a broadcast starts here, not whenever the episode's state changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broadcastId])

  if (!page) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ title: '' }} />
        {query.isPending ? (
          <View className="gap-3">
            <Skeleton className="aspect-video w-full rounded-none" />
            <Skeleton className="mx-4 h-6 w-3/4" />
            <Skeleton className="mx-4 h-4 w-1/2" />
          </View>
        ) : (
          <Text className="p-8 text-center">{query.error?.message ?? 'Not found'}</Text>
        )}
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: page.show.title }} />
      <Stage page={page} />
      {!keyboardOpen && !panelOpen && <Details page={page} />}
      <LiveChat slug={slug} broadcastId={broadcastId} messages={page.chat} gifs={page.gifs} onPanelChange={setPanelOpen} />
      {/* Keeps the message box just above the keyboard. */}
      <KeyboardSpacer />
    </View>
  )
}

// The video, or the artwork and a note while there's none to show.
function Stage({ page }: { page: LiveView }) {
  const { broadcast, ended, hlsUrl, show } = page
  return (
    <View className="aspect-video w-full overflow-hidden bg-muted">
      {broadcast && !broadcast.interrupted ? (
        // Starts afresh for each broadcast, and when a dropped stream comes back.
        <LiveVideo key={broadcast.id} src={hlsUrl} />
      ) : (
        <View className="flex-1 items-center justify-center gap-1 px-6">
          {show.imageUrl && (
            <Image
              source={{ uri: show.imageUrl }}
              blurRadius={24}
              contentFit="cover"
              style={{ position: 'absolute', inset: 0, opacity: 0.4 }}
            />
          )}
          <Icon as={RadioTower} size={32} className="mb-1 text-foreground" />
          <Text className="text-center font-medium">
            {broadcast ? 'The stream has stopped' : ended ? 'This broadcast has ended' : 'Not live right now'}
          </Text>
          <Text variant="muted" className="text-center">
            {broadcast
              ? 'Waiting for the host to reconnect…'
              : ended
                ? 'Thanks for watching! The next broadcast will start playing here.'
                : 'This page starts playing when the broadcast begins.'}
          </Text>
        </View>
      )}
    </View>
  )
}

function Details({ page }: { page: LiveView }) {
  const { broadcast, ended, show, viewers } = page
  return (
    <View className="gap-1 px-4 py-3">
      <View className="flex-row items-center gap-2">
        {broadcast?.interrupted ? (
          <Badge variant="secondary">
            <Text>Reconnecting…</Text>
          </Badge>
        ) : broadcast ? (
          <LiveIndicator />
        ) : (
          <Badge variant="secondary">
            <Text>{ended ? 'Ended' : 'Offline'}</Text>
          </Badge>
        )}
        {broadcast && (
          <>
            <View className="flex-row items-center gap-1" accessibilityLabel={`${viewers} watching`}>
              <Icon as={Eye} size={16} className="text-muted-foreground" />
              <Text variant="muted">{viewers}</Text>
            </View>
            <Text variant="muted">since {formatClock(broadcast.startedAt)}</Text>
          </>
        )}
      </View>
      <Text className="font-semibold" numberOfLines={2}>
        {broadcast?.title ?? show.title}
      </Text>
      {show.author ? (
        <Text variant="muted" numberOfLines={1}>
          {show.title} · by {show.author}
        </Text>
      ) : null}
    </View>
  )
}
