// Signing in with GitHub, Google or Facebook: the platform runs the provider's
// sign-in in a browser this opens, then sends it back to the app with a
// one-time code (see mobile-auth.server.ts there). The code is only any good
// with the verifier made here, as with OAuth's PKCE.
import { CryptoDigestAlgorithm, CryptoEncoding, digestStringAsync, getRandomBytes } from 'expo-crypto'
import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'

// Where the platform sends the browser back to: the app's own scheme (which
// +native-intent.ts leaves to the browser session), or on web, the popup
// opens the app's sign-in page, which hands the address to this window
// (completeOAuthPopup). The platform allows only these (isMobileRedirect).
export const appRedirectUri = 'podnoms://auth'

function redirectUri() {
  return Platform.OS === 'web' ? `${window.location.origin}/sign-in` : appRedirectUri
}

// In the sign-in popup on web, passes the code to the window that opened it
// and closes; anywhere else, does nothing.
export function completeOAuthPopup() {
  WebBrowser.maybeCompleteAuthSession()
}

// A sign-in the provider or platform refused, with a message to show.
export class OAuthError extends Error {}

const base64Url = (base64: string) => base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

// Null if the browser was closed before signing in finished.
export async function authorizeWithProvider(serverUrl: string, provider: string) {
  const codeVerifier = base64Url(btoa(String.fromCharCode(...getRandomBytes(32))))
  const codeChallenge = base64Url(
    await digestStringAsync(CryptoDigestAlgorithm.SHA256, codeVerifier, { encoding: CryptoEncoding.BASE64 }),
  )
  const url = new URL(`/api/mobile/auth/oauth/${provider}`, serverUrl)
  url.searchParams.set('redirect_uri', redirectUri())
  url.searchParams.set('code_challenge', codeChallenge)

  const result = await WebBrowser.openAuthSessionAsync(url.href, redirectUri())
  if (result.type !== 'success') return null
  const params = new URL(result.url).searchParams
  const code = params.get('code')
  if (code) return { code, codeVerifier }
  throw new OAuthError(params.get('error') ?? "Signing in didn't work. Please try again.")
}
