import { getShareExtensionKey } from 'expo-share-intent'
import { appRedirectUri } from '@/lib/oauth'

// Something shared to the app opens it with a link expo-share-intent made;
// (app)/_layout.tsx then opens Add episode with it, once signed in. The
// browser signing in with a provider comes back to podnoms://auth, which the
// browser session (oauth.ts) handles, so the router ignores it.
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    if (path.startsWith(appRedirectUri)) return null
    return path.includes(`dataUrl=${getShareExtensionKey()}`) ? '/' : path
  } catch {
    return '/'
  }
}
