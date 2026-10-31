import { router, Stack } from 'expo-router'
import { useShareIntentContext } from 'expo-share-intent'
import { useEffect } from 'react'
import { useNotifications } from '@/lib/notifications'

export default function AppLayout() {
  const { hasShareIntent } = useShareIntentContext()
  useNotifications()

  // A link shared to the app, now or before signing in, goes to Add episode.
  useEffect(() => {
    if (hasShareIntent) router.push('/add-episode')
  }, [hasShareIntent])

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="shows/[slug]" options={{ title: '' }} />
      <Stack.Screen name="episodes/[id]" options={{ title: '' }} />
      <Stack.Screen name="live/[slug]" options={{ title: '' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="add-episode" options={{ title: 'Add episode', presentation: 'modal' }} />
      <Stack.Screen name="player" options={{ title: '', presentation: 'modal' }} />
    </Stack>
  )
}
