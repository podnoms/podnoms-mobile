import { router } from 'expo-router'
import { useShareIntentContext } from 'expo-share-intent'
import { Check } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { Artwork } from '@/components/artwork'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Text } from '@/components/ui/text'
import { useAddEpisode, useShows } from '@/hooks/use-shows'
import { cn } from '@/lib/utils'

// The first web link in some shared text ("Watch this: https://…").
function linkIn(text: string | null | undefined) {
  return text?.match(/https?:\/\/\S+/)?.[0] ?? ''
}

// Adds an episode from a link, typed in or shared to the app from another.
export default function AddEpisodeScreen() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext()
  const shows = useShows()
  const add = useAddEpisode()
  // A shared link opens this screen (see (app)/_layout.tsx) with the share
  // still to hand.
  const [url, setUrl] = useState(() => (hasShareIntent ? (shareIntent.webUrl ?? linkIn(shareIntent.text)) : ''))
  const [showId, setShowId] = useState<string | null>(null)

  // Done with the share, so it isn't offered again next time.
  useEffect(() => {
    if (hasShareIntent) resetShareIntent()
  }, [hasShareIntent, resetShareIntent])

  const selected = showId ?? (shows.data?.length === 1 ? shows.data[0]!.id : null)
  const selectedShow = shows.data?.find((show) => show.id === selected)

  function submit() {
    if (!selected || !url) return
    add.mutate(
      { showId: selected, sourceUrl: url.trim() },
      {
        onSuccess: () => {
          router.back()
          if (selectedShow) router.push({ pathname: '/shows/[slug]', params: { slug: selectedShow.slug } })
        },
      },
    )
  }

  return (
    // Scrolls whichever field is focused into view above the keyboard. It isn't
    // a NativeWind component, so it's styled with style, not class names.
    <View className="flex-1 bg-background">
      <KeyboardAwareScrollView
        bottomOffset={24}
        contentContainerStyle={{ gap: 20, padding: 16 }}
        keyboardShouldPersistTaps="handled">
        <View className="gap-1.5">
          <Label nativeID="link">Link</Label>
          <Input
            aria-labelledby="link"
            value={url}
            onChangeText={setUrl}
            placeholder="https://www.youtube.com/watch?v=…"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <Text variant="muted">YouTube, Mixcloud, SoundCloud and most other sites with audio or video.</Text>
        </View>

        <View className="gap-2">
          <Label>Show</Label>
          {shows.data?.length === 0 && (
            <Text variant="muted">You have no shows yet. Create one on the site first.</Text>
          )}
          {shows.data?.map((show) => {
            const isSelected = show.id === selected
            return (
              <Pressable
                key={show.id}
                onPress={() => setShowId(show.id)}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                className={cn(
                  'flex-row items-center gap-3 border p-2',
                  isSelected ? 'border-primary bg-primary/10' : 'border-border',
                )}>
                <Artwork uri={show.imageUrl} size={40} />
                <Text className="flex-1" numberOfLines={1}>
                  {show.title}
                </Text>
                {isSelected && <Icon as={Check} size={18} className="text-primary" />}
              </Pressable>
            )
          })}
        </View>

        {add.isError && <Text className="text-destructive">{add.error.message}</Text>}
        <Button onPress={submit} disabled={!selected || !url.trim() || add.isPending}>
          <Text>{add.isPending ? 'Adding…' : 'Add episode'}</Text>
        </Button>
      </KeyboardAwareScrollView>
    </View>
  )
}
