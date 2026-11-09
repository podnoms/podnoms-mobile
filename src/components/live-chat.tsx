import { Image } from 'expo-image'
import { Send, Smile, Trash2 } from 'lucide-react-native'
import { useRef, useState } from 'react'
import {
  Alert,
  FlatList,
  Keyboard,
  Pressable,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type TextInputSelectionChangeEvent,
} from 'react-native'
import { ExpressionPicker } from '@/components/expression-picker'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Text } from '@/components/ui/text'
import { useDeleteChat, useSendChat } from '@/hooks/use-live'
import { ApiError } from '@/lib/api'
import type { ChatMessage } from '@/lib/api-types'
import { formatClock } from '@/lib/format'
import { commentGif, findGifLink, gifFromLink, type GifConfig } from '@/lib/gifs'
import { cn } from '@/lib/utils'

// The longest message the platform takes (chatMessageMaxLength there).
const maxLength = 500

// Within this many points of the bottom counts as reading the newest messages,
// so the list follows new ones; further up, it stays put.
const followSlack = 48

type Props = {
  showId: string
  // Null while not live: the chat so far stays, but no one can write.
  broadcastId: string | null
  messages: ChatMessage[]
  // Where to search for GIFs; null when the server has no GIF provider.
  gifs: GifConfig | null
  // Says when a picker opens and closes, as the screen makes room for it.
  onPanelChange: (open: boolean) => void
}

// A broadcast's chat, as on the site: messages as they come, and a box to
// write one with emoji and GIFs while it's live.
export function LiveChat({ showId, broadcastId, messages, gifs, onPanelChange }: Props) {
  const send = useSendChat(showId)
  const [body, setBody] = useState('')
  // The emoji and GIF picker takes the keyboard's place while it's open.
  const [panelOpen, setPanelState] = useState(false)
  const list = useRef<FlatList<ChatMessage>>(null)
  const following = useRef(true)
  // Where the cursor is, for an emoji to go in there.
  const selection = useRef({ start: 0, end: 0 })

  function setPanel(open: boolean) {
    setPanelState(open)
    onPanelChange(open)
  }

  // A frame later, as the list goes by the rows it has measured.
  const followNewest = () => {
    if (following.current) requestAnimationFrame(() => list.current?.scrollToEnd({ animated: false }))
  }

  const updateFollowing = ({ nativeEvent: { contentOffset, contentSize, layoutMeasurement } }: NativeSyntheticEvent<NativeScrollEvent>) => {
    following.current = contentSize.height - contentOffset.y - layoutMeasurement.height < followSlack
  }

  function togglePanel() {
    if (!panelOpen) Keyboard.dismiss()
    setPanel(!panelOpen)
  }

  function insertEmoji(emoji: string) {
    const { start, end } = selection.current
    const text = body.slice(0, start) + emoji + body.slice(end)
    if (text.length > maxLength) return
    setBody(text)
    selection.current = { start: start + emoji.length, end: start + emoji.length }
    send.reset()
  }

  async function submit() {
    if (!broadcastId || !body.trim() || send.isPending) return
    following.current = true
    // A keyboard's GIF arrives as its link (see findGifLink): it's sent as a
    // GIF, with any other text; as typed if it can't be loaded.
    const link = findGifLink(body)
    const gif = link ? await gifFromLink(link).then(commentGif, () => null) : null
    const text = gif ? link!.rest : body.trim()
    send.mutate({ broadcastId, body: text || undefined, gif: gif ?? undefined }, { onSuccess: () => setBody('') })
  }

  const error = send.error && (send.error instanceof ApiError && send.error.status < 500 ? send.error.message : "Your message wasn't sent. Try again.")

  return (
    <View className="flex-1 border-t border-border">
      <FlatList
        ref={list}
        className="flex-1"
        data={messages}
        keyExtractor={(message) => message.id}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-3 p-4"
        // Only when they've moved it themselves, not as messages lay out.
        onScrollEndDrag={updateFollowing}
        onMomentumScrollEnd={updateFollowing}
        onContentSizeChange={followNewest}
        onLayout={followNewest}
        renderItem={({ item }) => <Message message={item} showId={showId} />}
        ListEmptyComponent={
          <Text variant="muted" className="py-4 text-center">
            {broadcastId ? 'No messages yet. Say hello!' : 'The chat opens when the broadcast starts.'}
          </Text>
        }
      />
      <View className="gap-2 border-t border-border bg-background px-4 pb-3 pt-2">
        <View className="flex-row items-center gap-2">
          <Input
            value={body}
            onChangeText={(text) => {
              setBody(text)
              send.reset()
            }}
            onSelectionChange={({ nativeEvent }: TextInputSelectionChangeEvent) => {
              selection.current = nativeEvent.selection
            }}
            onFocus={() => setPanel(false)}
            onSubmitEditing={submit}
            submitBehavior="submit"
            returnKeyType="send"
            placeholder={broadcastId ? 'Say something…' : 'Not live right now'}
            editable={broadcastId !== null}
            maxLength={maxLength}
            className="h-10 flex-1"
          />
          <PanelButton
            open={panelOpen}
            disabled={!broadcastId}
            onPress={togglePanel}
            label={panelOpen ? 'Close emoji and GIFs' : gifs ? 'Add an emoji or GIF' : 'Add an emoji'}>
            <Icon as={Smile} size={20} className={panelOpen ? 'text-primary-foreground' : 'text-foreground'} />
          </PanelButton>
          <Button size="icon" onPress={submit} disabled={!broadcastId || !body.trim() || send.isPending} accessibilityLabel="Send">
            <Icon as={Send} />
          </Button>
        </View>
        {error && <Text className="text-sm text-destructive">{error}</Text>}
        {panelOpen && (
          <ExpressionPicker
            gifs={gifs}
            onEmoji={insertEmoji}
            onGif={(picked) => {
              if (!broadcastId) return
              setPanel(false)
              following.current = true
              send.mutate({ broadcastId, gif: commentGif(picked) })
            }}
          />
        )}
      </View>
    </View>
  )
}

function PanelButton({
  open,
  disabled,
  onPress,
  label,
  children,
}: {
  open: boolean
  disabled: boolean
  onPress: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn('size-10 items-center justify-center border', open ? 'border-primary bg-primary' : 'border-input', disabled && 'opacity-50')}
      accessibilityLabel={label}
      accessibilityState={{ expanded: open, disabled }}>
      {children}
    </Pressable>
  )
}

function Message({ message, showId }: { message: ChatMessage; showId: string }) {
  const remove = useDeleteChat(showId)
  const name = message.author.name ?? 'A listener'

  function confirmDelete() {
    Alert.alert('Delete message?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove.mutate(message.id) },
    ])
  }

  return (
    <View className="flex-row gap-2.5">
      <Avatar alt={name} className="size-7">
        {message.author.imageUrl && <AvatarImage source={{ uri: message.author.imageUrl }} />}
        <AvatarFallback>
          <Text className="text-xs font-semibold">{name.slice(0, 1).toUpperCase()}</Text>
        </AvatarFallback>
      </Avatar>
      <View className="flex-1">
        <View className="flex-row items-baseline gap-2">
          <Text className="shrink text-xs font-medium" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-xs text-muted-foreground">{formatClock(message.createdAt)}</Text>
        </View>
        {message.body ? <Text className="text-sm">{message.body}</Text> : null}
        {message.gif && (
          // Loaded straight from the provider, as its terms require.
          <Image
            source={{ uri: message.gif.url }}
            accessibilityLabel={message.gif.title || 'GIF'}
            style={{ width: 192, aspectRatio: message.gif.width / message.gif.height, marginTop: 4, borderRadius: 6 }}
            contentFit="cover"
          />
        )}
      </View>
      {message.canDelete && (
        <Pressable onPress={confirmDelete} disabled={remove.isPending} hitSlop={8} accessibilityLabel="Delete message">
          <Icon as={Trash2} size={15} className="text-muted-foreground" />
        </Pressable>
      )}
    </View>
  )
}
