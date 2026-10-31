// Push notifications about the shows the user follows, sent by the server
// through Expo (see README.md for what a build needs). The server's told this
// device's Expo push token once the user allows them; settings about what
// they hear are on the server.
import { useQueryClient } from '@tanstack/react-query'
import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'
import { AndroidImportance } from 'expo-notifications'
import { router, type Href } from 'expo-router'
import { useEffect } from 'react'
import { Platform } from 'react-native'
import { api } from '@/lib/api'

// on: this device gets them. off: not asked yet, or can be asked again.
// blocked: refused, so only the system's settings can change it. unavailable:
// this build can't get a push token (no EAS project or Firebase, see README.md).
export type PushState = 'on' | 'off' | 'blocked' | 'unavailable'

// Shown over the app too, as there's no other sign while it's open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

// The channels the server sends to (AppPushMessage). Android asks for
// permission when the first is made, so not until the user's asked to.
async function createChannels() {
  if (Platform.OS !== 'android') return
  await Promise.all([
    Notifications.setNotificationChannelAsync('live', {
      name: 'Going live',
      importance: AndroidImportance.HIGH,
    }),
    Notifications.setNotificationChannelAsync('episodes', {
      name: 'New episodes',
      importance: AndroidImportance.DEFAULT,
    }),
  ])
}

const sendToken = (pushToken: string) => api('/api/mobile/notifications/device', { method: 'POST', body: { pushToken } })

// Tells the server where to reach this device. False if this build can't.
async function register() {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined
  if (!projectId) return false
  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId })
    await sendToken(data)
    return true
  } catch {
    return false
  }
}

// Asks for permission if it can, and registers this device.
export async function enableNotifications(): Promise<PushState> {
  await createChannels()
  let permission = await Notifications.getPermissionsAsync()
  if (!permission.granted && permission.canAskAgain) permission = await Notifications.requestPermissionsAsync()
  if (!permission.granted) return permission.canAskAgain ? 'off' : 'blocked'
  return (await register()) ? 'on' : 'unavailable'
}

// Where things stand, without asking the user anything.
export async function pushState(): Promise<PushState> {
  const permission = await Notifications.getPermissionsAsync()
  if (!permission.granted) return permission.canAskAgain ? 'off' : 'blocked'
  return Constants.expoConfig?.extra?.eas?.projectId && (await register()) ? 'on' : 'unavailable'
}

// The screens a notification may open, so a bad one can't go anywhere else.
const notificationPath = /^\/(live|shows|episodes)\/[^/]+$/

// For the signed-in app: keeps the server's token up to date if permission's
// been given, opens what a pressed notification is about, and refreshes the
// live badges at once when one arrives.
export function useNotifications() {
  const queryClient = useQueryClient()
  const pressed = Notifications.useLastNotificationResponse()
  const path = pressed?.notification.request.content.data?.path
  const pressedId = pressed?.notification.request.identifier

  useEffect(() => {
    void Notifications.getPermissionsAsync().then((permission) => {
      if (permission.granted) void createChannels().then(register)
    })
    const tokenChanged = Notifications.addPushTokenListener(() => void register())
    const received = Notifications.addNotificationReceivedListener(() => {
      void queryClient.invalidateQueries({ queryKey: ['live-now'] })
      void queryClient.invalidateQueries({ queryKey: ['home'] })
    })
    return () => {
      tokenChanged.remove()
      received.remove()
    }
  }, [queryClient])

  useEffect(() => {
    if (typeof path === 'string' && notificationPath.test(path)) router.push(path as Href)
    // Once per notification, and clears so it isn't opened again on reloading.
    if (pressedId) void Notifications.clearLastNotificationResponseAsync()
  }, [pressedId, path])
}
