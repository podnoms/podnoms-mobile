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
import { useAddEpisode, usePodcasts } from '@/hooks/use-podcasts'
import { cn } from '@/lib/utils'

// The first web link in some shared text ("Watch this: https://…").
function linkIn(text: string | null | undefined) {
  return text?.match(/https?:\/\/\S+/)?.[0] ?? ''
}

// Adds an episode from a link, typed in or shared to the app from another.
export default function AddEpisodeScreen() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext()
  const podcasts = usePodcasts()
  const add = useAddEpisode()
  // A shared link opens this screen (see (app)/_layout.tsx) with the share
  // still to hand.
  const [url, setUrl] = useState(() => (hasShareIntent ? (shareIntent.webUrl ?? linkIn(shareIntent.text)) : ''))
  const [podcastId, setPodcastId] = useState<string | null>(null)

  // Done with the share, so it isn't offered again next time.
  useEffect(() => {
    if (hasShareIntent) resetShareIntent()
  }, [hasShareIntent, resetShareIntent])

  const selected = podcastId ?? (podcasts.data?.length === 1 ? podcasts.data[0]!.id : null)
  const selectedPodcast = podcasts.data?.find((podcast) => podcast.id === selected)

  function submit() {
    if (!selected || !url) return
    add.mutate(
      { podcastId: selected, sourceUrl: url.trim() },
      {
        onSuccess: () => {
          router.back()
          if (selectedPodcast) router.push({ pathname: '/podcasts/[slug]', params: { slug: selectedPodcast.slug } })
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
          <Label>Podcast</Label>
          {podcasts.data?.length === 0 && (
            <Text variant="muted">You have no podcasts yet. Create one on the site first.</Text>
          )}
          {podcasts.data?.map((podcast) => {
            const isSelected = podcast.id === selected
            return (
              <Pressable
                key={podcast.id}
                onPress={() => setPodcastId(podcast.id)}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                className={cn(
                  'flex-row items-center gap-3 border p-2',
                  isSelected ? 'border-primary bg-primary/10' : 'border-border',
                )}>
                <Artwork uri={podcast.imageUrl} size={40} />
                <Text className="flex-1" numberOfLines={1}>
                  {podcast.title}
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
