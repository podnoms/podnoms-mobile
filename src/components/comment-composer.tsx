import { Image } from 'expo-image'
import { X } from 'lucide-react-native'
import { useState } from 'react'
import { Keyboard, Pressable, View } from 'react-native'
import { GifPicker } from '@/components/gif-picker'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { Textarea } from '@/components/ui/textarea'
import { useAddComment } from '@/hooks/use-episode'
import type { CommentReply } from '@/lib/api-types'
import { formatTime } from '@/lib/format'
import { commentGif, type GifConfig, type GifResult } from '@/lib/gifs'
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
  // The GIF picker takes the keyboard's place while it's open.
  const [picking, setPicking] = useState(false)

  function togglePicker() {
    if (!picking) Keyboard.dismiss()
    setPicking(!picking)
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

  return (
    <View className="gap-2 border-t border-border bg-background px-4 pb-3 pt-2">
      {replyingTo ? (
        <View className="flex-row items-center justify-between">
          <Text variant="muted">Replying to {replyingTo.author.name ?? `@${replyingTo.author.slug}`}</Text>
          <Pressable onPress={onCancelReply} hitSlop={8} accessibilityLabel="Cancel reply">
            <Icon as={X} size={16} className="text-muted-foreground" />
          </Pressable>
        </View>
      ) : (
        <Text variant="muted">Comment at {formatTime(atSeconds)}</Text>
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
      <View className="flex-row items-end gap-2">
        {gifs && (
          <Pressable
            onPress={togglePicker}
            className={cn('h-10 justify-center border px-2', picking ? 'border-primary bg-primary' : 'border-input')}
            accessibilityLabel={picking ? 'Close GIFs' : 'Add a GIF'}
            accessibilityState={{ expanded: picking }}>
            <Text className={cn('text-xs font-bold', picking ? 'text-primary-foreground' : 'text-foreground')}>GIF</Text>
          </Pressable>
        )}
        <Textarea
          value={body}
          onChangeText={setBody}
          onFocus={() => setPicking(false)}
          placeholder={replyingTo ? 'Write a reply…' : 'Add a comment…'}
          maxLength={maxLength}
          className="min-h-10 flex-1"
          numberOfLines={3}
        />
        <Button onPress={post} disabled={(!body.trim() && !gif) || add.isPending}>
          <Text>{add.isPending ? 'Posting…' : 'Post'}</Text>
        </Button>
      </View>
      {add.isError && <Text className="text-destructive">{add.error.message}</Text>}
      {picking && gifs && (
        <GifPicker
          config={gifs}
          onPick={(picked) => {
            setGif(picked)
            setPicking(false)
          }}
        />
      )}
    </View>
  )
}
