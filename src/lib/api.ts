// Calls to podnoms-platform's mobile API. The server and token are set by
// AuthProvider (auth.tsx), which also hears when the token stops working.

import Constants from 'expo-constants'
import { Platform } from 'react-native'

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

export const defaultServerUrl = __DEV__ ?
  'https://podnoms.dev.fergl.ie:3000' :
  'https://podnoms.com'

// Says who's asking, as the server takes React Native's default on Android
// (okhttp) for a bot and doesn't count its plays. Browsers set their own.
const appHeaders: Record<string, string> =
  Platform.OS === 'web' ? {} : { 'User-Agent': `PodNoms/${Constants.expoConfig?.version ?? '1'}` }

const config = {
  serverUrl: defaultServerUrl,
  token: null as string | null,
  onUnauthorized: () => { },
}

export function configureApi(values: Partial<typeof config>) {
  Object.assign(config, values)
}

// Headers that let the server know who's asking, for audio requests too.
export function authHeaders(): Record<string, string> {
  return config.token ? { Authorization: `Bearer ${config.token}` } : {}
}

export function serverUrl() {
  return config.serverUrl
}

export async function api<T = void>(
  path: string,
  { method = 'GET', body, serverUrl = config.serverUrl }: { method?: string; body?: unknown; serverUrl?: string } = {},
): Promise<T> {
  const sentToken = config.token
  const response = await fetch(new URL(path, serverUrl).href, {
    method,
    headers: {
      Accept: 'application/json',
      ...appHeaders,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...authHeaders(),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!response.ok) {
    // Only if it's the token in use now that was refused, not one since replaced
    // or a request that went without.
    if (response.status === 401 && sentToken && sentToken === config.token) config.onUnauthorized()
    const message = (await response.text().catch(() => '')) || `Request failed (${response.status})`
    throw new ApiError(response.status, message.length > 200 ? `Request failed (${response.status})` : message)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
