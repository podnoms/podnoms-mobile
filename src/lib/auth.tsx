// Who the app is signed in as, and which server it talks to. The token and
// server are kept in SecureStore (see storage.ts), so the app stays signed in
// across launches.
import { useQueryClient } from '@tanstack/react-query'
import * as Device from 'expo-device'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, configureApi, defaultServerUrl } from '@/lib/api'
import type { SignInResult } from '@/lib/api-types'
import { authorizeWithProvider } from '@/lib/oauth'
import { deleteItem, getItem, setItem } from '@/lib/storage'

const tokenKey = 'podnoms.token'
const serverKey = 'podnoms.server'

type AuthState = { status: 'loading' } | { status: 'signed-out' } | { status: 'signed-in'; token: string }

type AuthContextValue = {
  state: AuthState
  serverUrl: string
  setServerUrl: (url: string) => Promise<void>
  // Signs in, or returns the challenge to answer with verifySecondFactor.
  signIn: (email: string, password: string) => Promise<Extract<SignInResult, { status: 'two-factor' }> | null>
  // Signs in in a browser, with the same result as signIn; also null when the
  // browser was closed without signing in.
  signInWithProvider: (provider: string) => Promise<Extract<SignInResult, { status: 'two-factor' }> | null>
  verifySecondFactor: (challenge: string, method: 'totp' | 'recovery', code: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// "https://example.com/" or "example.com" → "https://example.com".
export function normaliseServerUrl(input: string) {
  const trimmed = input.trim().replace(/\/+$/, '')
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [state, setState] = useState<AuthState>({ status: 'loading' })
  const [serverUrl, setServerUrlState] = useState(defaultServerUrl)

  async function forget() {
    await deleteItem(tokenKey)
    configureApi({ token: null })
    queryClient.clear()
    setState({ status: 'signed-out' })
  }

  async function remember(token: string) {
    await setItem(tokenKey, token)
    configureApi({ token })
    setState({ status: 'signed-in', token })
  }

  useEffect(() => {
    void (async () => {
      const [token, server] = await Promise.all([getItem(tokenKey), getItem(serverKey)])
      const url = server ?? defaultServerUrl
      configureApi({ serverUrl: url, token, onUnauthorized: () => void forget() })
      setServerUrlState(url)
      setState(token ? { status: 'signed-in', token } : { status: 'signed-out' })
    })()
    // Runs once, on launch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value: AuthContextValue = {
    state,
    serverUrl,
    async setServerUrl(input) {
      const url = normaliseServerUrl(input)
      await setItem(serverKey, url)
      configureApi({ serverUrl: url })
      setServerUrlState(url)
    },
    async signIn(email, password) {
      const result = await api<SignInResult>('/api/mobile/auth/sign-in', {
        method: 'POST',
        body: { email, password, deviceName: Device.deviceName ?? Device.modelName ?? undefined },
      })
      if (result.status === 'two-factor') return result
      await remember(result.token)
      return null
    },
    async signInWithProvider(provider) {
      const authorized = await authorizeWithProvider(serverUrl, provider)
      if (!authorized) return null
      const result = await api<SignInResult>('/api/mobile/auth/oauth/exchange', {
        method: 'POST',
        body: { ...authorized, deviceName: Device.deviceName ?? Device.modelName ?? undefined },
      })
      if (result.status === 'two-factor') return result
      await remember(result.token)
      return null
    },
    async verifySecondFactor(challenge, method, code) {
      const result = await api<SignInResult>('/api/mobile/auth/two-factor', {
        method: 'POST',
        body: { challenge, method, code },
      })
      if (result.status === 'signed-in') await remember(result.token)
    },
    async signOut() {
      // Signed out here whether or not the server hears about it.
      await api('/api/mobile/auth/sign-out', { method: 'POST' }).catch(() => {})
      await forget()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
