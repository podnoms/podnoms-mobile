import { useState } from 'react'
import { Pressable, View } from 'react-native'
import { EmojiPicker } from '@/components/emoji-picker'
import { GifPicker } from '@/components/gif-picker'
import { Text } from '@/components/ui/text'
import type { GifConfig, GifResult } from '@/lib/gifs'
import { cn } from '@/lib/utils'

// Emoji and GIFs in one picker, behind the composers' one button, with a tab
// for each; just emoji when the server has no GIF provider. In place of the
// keyboard, at about its height.
export function ExpressionPicker({
  gifs,
  onEmoji,
  onGif,
}: {
  gifs: GifConfig | null
  onEmoji: (emoji: string) => void
  onGif: (gif: GifResult) => void
}) {
  const [tab, setTab] = useState<'emoji' | 'gif'>('emoji')

  return (
    <View className="gap-2">
      {gifs && (
        <View className="flex-row self-center rounded-full bg-muted p-1" accessibilityRole="tablist">
          {(
            [
              ['emoji', 'Emoji'],
              ['gif', 'GIFs'],
            ] as const
          ).map(([id, label]) => (
            <Pressable
              key={id}
              onPress={() => setTab(id)}
              className={cn('rounded-full px-5 py-1.5', tab === id && 'bg-background')}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === id }}>
              <Text className={cn('text-sm font-medium', tab === id ? 'text-foreground' : 'text-muted-foreground')}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      {tab === 'gif' && gifs ? <GifPicker config={gifs} onPick={onGif} /> : <EmojiPicker onPick={onEmoji} />}
    </View>
  )
}
