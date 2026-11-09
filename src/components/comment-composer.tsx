import { Image } from 'expo-image'
import { SendHorizontal, Smile, X } from 'lucide-react-native'
import { useRef, useState } from 'react'
import { Keyboard, Platform, Pressable, View, type TextInputSelectionChangeEvent } from 'react-native'
import { ExpressionPicker } from '@/components/expression-picker'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { Textarea } from '@/components/ui/textarea'
import { useAddComment } from '@/hooks/use-episode'
import type { CommentReply } from '@/lib/api-types'
import { formatTime } from '@/lib/format'
import { commentGif, findGifLink, gifFromLink, type GifConfig, type GifResult } from '@/lib/gifs'
import { cn } from '@/lib/utils'

// The longest comment the platform takes (commentMaxLength there).
const maxLength = 1000

type Props = {
  episodeId: string
  // Where in the episode a new comment is about: where the listener is.
  atSeconds: number
  replyingTo: CommentReply | null
  onCancelReply: () => void
  // Where to search for GIFs; null when the server has no GIF provider.
  gifs: GifConfig | null
}

// Writing a comment, at the point the listener has reached, or a reply: text,
// a GIF, or both. @slug mentions someone, as on the site.
export function CommentComposer({ episodeId, atSeconds, replyingTo, onCancelReply, gifs }: Props) {
  const add = useAddComment(episodeId)
  const [body, setBody] = useState('')
  const [gif, setGif] = useState<GifResult | null>(null)
  // The emoji and GIF picker takes the keyboard's place while it's open.
  const [picking, setPicking] = useState(false)
  // Where the cursor is, for an emoji to go in there.
  const selection = useRef({ start: 0, end: 0 })

  function togglePicker() {
    if (!picking) Keyboard.dismiss()
    setPicking(!picking)
  }

  // A keyboard's GIF arrives as its link (see findGifLink): it becomes the
  // comment's GIF, unless there's one already, and goes back in the text if
  // it can't be loaded.
  function changeText(text: string) {
    const link = gif ? null : findGifLink(text)
    if (!link) return setBody(text)
    setBody(link.rest)
    gifFromLink(link).then(setGif, () => setBody((current) => (current ? `${current} ${link.url}` : link.url)))
  }

  // Emoji go in at the cursor, and the picker stays open for more.
  function insertEmoji(emoji: string) {
    const { start, end } = selection.current
    const text = body.slice(0, start) + emoji + body.slice(end)
    if (text.length > maxLength) return
    setBody(text)
    selection.current = { start: start + emoji.length, end: start + emoji.length }
  }

  function post() {
    add.mutate(
      { body: body.trim(), gif: gif ? commentGif(gif) : undefined, atSeconds, parentId: replyingTo?.id },
      {
        onSuccess: () => {
          setBody('')
          setGif(null)
          setPicking(false)
          onCancelReply()
        },
      },
    )
  }

  const canPost = (!!body.trim() || !!gif) && !add.isPending

  return (
    <View className="gap-2 border-t border-border bg-card px-3 py-2">
      {replyingTo && (
        <View className="flex-row items-center justify-between px-1">
          <Text variant="muted" className="text-sm">
            Replying to {replyingTo.author.name ?? `@${replyingTo.author.slug}`}
          </Text>
          <Pressable onPress={onCancelReply} hitSlop={8} accessibilityLabel="Cancel reply">
            <Icon as={X} size={16} className="text-muted-foreground" />
          </Pressable>
        </View>
      )}
      {gif && (
        <View className="self-start">
          <Image
            source={{ uri: gif.preview.url }}
            accessibilityLabel={gif.title}
            style={{ height: 96, aspectRatio: gif.width / gif.height }}
            contentFit="cover"
          />
          <Pressable
            onPress={() => setGif(null)}
            hitSlop={8}
            className="absolute right-1 top-1 rounded-full bg-background/80 p-1"
            accessibilityLabel="Remove GIF">
            <Icon as={X} size={14} className="text-foreground" />
          </Pressable>
        </View>
      )}
      {/* One line that grows as it's written in, with the buttons kept at its
          foot. The time a comment is at goes in the placeholder. */}
      <View className="flex-row items-end gap-2">
        <Pressable
          onPress={togglePicker}
          className={cn('h-10 w-10 items-center justify-center rounded-full', picking ? 'bg-primary' : 'active:bg-muted')}
          accessibilityLabel={picking ? 'Close emoji and GIFs' : gifs ? 'Add an emoji or GIF' : 'Add an emoji'}
          accessibilityState={{ expanded: picking }}>
          <Icon as={Smile} size={22} className={picking ? 'text-primary-foreground' : 'text-muted-foreground'} />
        </Pressable>
        <Textarea
          value={body}
          onChangeText={changeText}
          onSelectionChange={({ nativeEvent }: TextInputSelectionChangeEvent) => {
            selection.current = nativeEvent.selection
          }}
          onFocus={() => setPicking(false)}
          placeholder={replyingTo ? 'Write a reply…' : `Comment at ${formatTime(atSeconds)}…`}
          maxLength={maxLength}
          className="max-h-32 min-h-10 flex-1 resize-none rounded-3xl px-4 py-2"
          // On web, the height it starts at (it grows to fit); on Android, the most lines it grows to.
          numberOfLines={Platform.OS === 'web' ? 1 : 5}
        />
        <Pressable
          onPress={post}
          disabled={!canPost}
          className={cn(
            'h-10 w-10 items-center justify-center rounded-full bg-primary active:opacity-80',
            !canPost && 'opacity-40',
          )}
          accessibilityLabel={add.isPending ? 'Posting' : replyingTo ? 'Post reply' : 'Post comment'}>
          <Icon as={SendHorizontal} size={18} className="text-primary-foreground" />
        </Pressable>
      </View>
      {add.isError && <Text className="text-destructive">{add.error.message}</Text>}
      {picking && (
        <ExpressionPicker
          gifs={gifs}
          onEmoji={insertEmoji}
          onGif={(picked) => {
            setGif(picked)
            setPicking(false)
          }}
        />
      )}
    </View>
  )
}
