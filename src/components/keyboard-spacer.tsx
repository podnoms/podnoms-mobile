import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'
import Reanimated, { useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// Goes at the bottom of a screen with an input at its foot (the comment
// composer): as tall as the keyboard while it's open, following it as it
// slides, so whatever's above sits just on top of it; otherwise as tall as
// the system's gesture bar, which the app draws under (edge to edge).
export function KeyboardSpacer() {
  const { height } = useReanimatedKeyboardAnimation()
  const { bottom } = useSafeAreaInsets()
  const style = useAnimatedStyle(() => ({ height: Math.max(Math.abs(height.value), bottom) }))
  return <Reanimated.View style={style} />
}
