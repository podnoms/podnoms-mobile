import '@/global.css'

import { PortalHost } from '@rn-primitives/portal'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack, ThemeProvider } from 'expo-router'
import { ShareIntentProvider } from 'expo-share-intent'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { Platform } from 'react-native'
import { AppearanceProvider, useAppearance } from '@/lib/appearance'
import { AuthProvider, useAuth } from '@/lib/auth'
import { PlayerProvider } from '@/lib/player'
import { navTheme } from '@/lib/theme'

void SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

export default function RootLayout() {
  return (
    // First, as expo-share-intent asks, so a share is caught before anything
    // else loads. Browsers can't share to the app.
    <ShareIntentProvider options={{ disabled: Platform.OS === 'web' }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppearanceProvider>
            <PlayerProvider>
              <Themed />
            </PlayerProvider>
          </AppearanceProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ShareIntentProvider>
  )
}

// Navigation chrome and the status bar in the theme's colours.
function Themed() {
  const { scheme, palette } = useAppearance()
  return (
    <ThemeProvider value={navTheme(scheme, palette)}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Routes />
      <PortalHost />
    </ThemeProvider>
  )
}

// Signed-in screens, or the sign-in screen, once the saved token's been read.
function Routes() {
  const { state } = useAuth()

  useEffect(() => {
    if (state.status !== 'loading') void SplashScreen.hideAsync()
  }, [state.status])

  if (state.status === 'loading') return null
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={state.status === 'signed-in'}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={state.status === 'signed-out'}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  )
}
