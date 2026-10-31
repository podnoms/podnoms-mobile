import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Stack, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Linking, ScrollView, Switch, View } from 'react-native'
import { Artwork } from '@/components/artwork'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Text } from '@/components/ui/text'
import { api } from '@/lib/api'
import type { NotificationSettings } from '@/lib/api-types'
import { useAppearance } from '@/lib/appearance'
import { enableNotifications, pushState, type PushState } from '@/lib/notifications'
import { colour } from '@/lib/theme'

const queryKey = ['notification-settings']

// What the user hears about the shows they follow on this app: going live and
// new episodes, and which shows. Whether this device gets them at all is its
// own question, for the system.
export default function NotificationsScreen() {
  const queryClient = useQueryClient()
  const settings = useQuery({ queryKey, queryFn: () => api<NotificationSettings>('/api/mobile/notifications') })
  const [state, setState] = useState<PushState | null>(null)

  // Again on coming back, as they may have been to the system's settings.
  useFocusEffect(
    useCallback(() => {
      void pushState().then(setState)
    }, []),
  )

  const savePrefs = useMutation({
    mutationFn: (prefs: { live: boolean; newEpisodes: boolean }) =>
      api<NotificationSettings>('/api/mobile/notifications', { method: 'POST', body: prefs }),
    onSuccess: (saved) => queryClient.setQueryData(queryKey, saved),
  })
  const muteShow = useMutation({
    mutationFn: (input: { showId: string; notify: boolean }) =>
      api('/api/mobile/notifications/shows', { method: 'POST', body: input }),
    onSuccess: (_, { showId, notify }) =>
      queryClient.setQueryData<NotificationSettings>(queryKey, (current) =>
        current && { ...current, shows: current.shows.map((show) => (show.id === showId ? { ...show, notify } : show)) },
      ),
  })
  const data = settings.data

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4">
      <Stack.Screen options={{ title: 'Notifications' }} />
      <DeviceState state={state} onEnable={() => void enableNotifications().then(setState)} />
      {data ? (
        <>
          <View className="gap-4">
            <Text variant="small">Tell me when a show I follow</Text>
            <Toggle
              label="Goes live"
              value={data.live}
              onChange={(live) => savePrefs.mutate({ live, newEpisodes: data.newEpisodes })}
            />
            <Toggle
              label="Has a new episode"
              value={data.newEpisodes}
              onChange={(newEpisodes) => savePrefs.mutate({ live: data.live, newEpisodes })}
            />
          </View>
          {(savePrefs.isError || muteShow.isError) && (
            <Text className="text-destructive">That wasn&apos;t saved. Please try again.</Text>
          )}
          <Separator />
          <View className="gap-4">
            <View className="gap-1">
              <Text variant="small">Shows you follow</Text>
              <Text variant="muted">Turning one off stops all its notifications, on the site and by email too.</Text>
            </View>
            {data.shows.length > 0 ? (
              data.shows.map((show) => (
                <Toggle
                  key={show.id}
                  label={show.title}
                  artwork={show.imageUrl}
                  showArtwork
                  value={show.notify}
                  onChange={(notify) => muteShow.mutate({ showId: show.id, notify })}
                />
              ))
            ) : (
              <Text variant="muted">You aren&apos;t following any shows yet.</Text>
            )}
          </View>
        </>
      ) : settings.isPending ? (
        <View className="gap-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </View>
      ) : (
        <Text className="text-center">{settings.error?.message}</Text>
      )}
    </ScrollView>
  )
}

// Says if this device won't get them, and what can be done about it.
function DeviceState({ state, onEnable }: { state: PushState | null; onEnable: () => void }) {
  if (state === null || state === 'on') return null
  return (
    <View className="gap-2 border border-border bg-muted p-3">
      {state === 'off' && (
        <>
          <Text>Notifications are off on this device.</Text>
          <Button size="sm" onPress={onEnable}>
            <Text>Turn on notifications</Text>
          </Button>
        </>
      )}
      {state === 'blocked' && (
        <>
          <Text>Notifications are blocked for this app in your device&apos;s settings.</Text>
          <Button size="sm" variant="outline" onPress={() => void Linking.openSettings()}>
            <Text>Open settings</Text>
          </Button>
        </>
      )}
      {state === 'unavailable' && (
        <Text>This version of the app can&apos;t receive notifications yet. Your choices here are still saved.</Text>
      )}
    </View>
  )
}

function Toggle({
  label,
  value,
  onChange,
  artwork,
  showArtwork,
}: {
  label: string
  value: boolean
  onChange: (value: boolean) => void
  artwork?: string | null
  showArtwork?: boolean
}) {
  const { palette } = useAppearance()
  return (
    <View className="flex-row items-center gap-3">
      {showArtwork && <Artwork uri={artwork ?? null} size={40} />}
      <Text className="flex-1" numberOfLines={2}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={label}
        trackColor={{ true: colour(palette, 'primary'), false: colour(palette, 'muted') }}
        thumbColor={colour(palette, 'foreground')}
      />
    </View>
  )
}
