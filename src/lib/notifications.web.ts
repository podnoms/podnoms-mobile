// notifications.ts for the web build, which is only for checking layouts: push
// notifications are for the phones.
export type PushState = 'on' | 'off' | 'blocked' | 'unavailable'

export async function enableNotifications(): Promise<PushState> {
  return 'unavailable'
}

export async function pushState(): Promise<PushState> {
  return 'unavailable'
}

export function useNotifications() {}
