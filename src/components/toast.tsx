import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'

type Toast = {
  message: string
  action?: { label: string; onPress: () => void }
}

// How long a toast stays up, which is how long there is to press its action.
const visibleMs = 5_000
// Enough to sit above the mini player at the foot of a screen.
const aboveFootPx = 76

const ToastContext = createContext<(toast: Toast) => void>(() => {})

// Shows a short message at the foot of the screen, with one action (Undo,
// say) if given. A new one replaces the one that's up.
export function useToast() {
  return useContext(ToastContext)
}

// Goes inside AppearanceProvider, whose view sets the theme's colours.
export function ToastProvider({ children }: { children: ReactNode }) {
  const { bottom } = useSafeAreaInsets()
  const [toast, setToast] = useState<(Toast & { key: number }) | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const count = useRef(0)

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    setToast(null)
  }, [])

  const show = useCallback(
    (next: Toast) => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(hide, visibleMs)
      count.current += 1
      setToast({ ...next, key: count.current })
    },
    [hide],
  )

  useEffect(() => hide, [hide])

  const action = toast?.action
  return (
    <ToastContext.Provider value={useMemo(() => show, [show])}>
      {children}
      {toast && (
        <Animated.View
          key={toast.key}
          entering={FadeInDown.duration(180)}
          exiting={FadeOutDown.duration(180)}
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: bottom + aboveFootPx,
            alignItems: 'center',
          }}>
          <View
            className="w-full max-w-md flex-row items-center gap-3 rounded-lg border border-border bg-popover px-4 py-3 shadow-lg shadow-black/20"
            accessibilityRole="alert"
            accessibilityLiveRegion="polite">
            <Text className="flex-1 text-sm text-popover-foreground" numberOfLines={2}>
              {toast.message}
            </Text>
            {action && (
              <Pressable
                onPress={() => {
                  hide()
                  action.onPress()
                }}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                className="active:opacity-70">
                <Text className="text-sm font-semibold text-primary">{action.label}</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  )
}
