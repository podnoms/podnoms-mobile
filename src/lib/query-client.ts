import { focusManager, QueryClient } from '@tanstack/react-query'
import { AppState, Platform } from 'react-native'

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

// React Query refetches stale queries when a browser tab comes back into view;
// on phones, coming back to the app is the same thing, but it has to be told.
// Intervals (refetchInterval) also pause while the app is in the background.
if (Platform.OS !== 'web') {
  focusManager.setEventListener((setFocused) => {
    const subscription = AppState.addEventListener('change', (state) => setFocused(state === 'active'))
    return () => subscription.remove()
  })
}
