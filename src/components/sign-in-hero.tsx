import { Image } from 'expo-image'
import { View } from 'react-native'
import Animated, { cubicBezier, useReducedMotion } from 'react-native-reanimated'
import { Text } from '@/components/ui/text'

const LOGO_SIZE = 128
const RING_PERIOD = 3600

const easeOut = cubicBezier(0.23, 1, 0.32, 1)
const easeInOut = cubicBezier(0.77, 0, 0.175, 1)

const RING_COUNT = 3
// Only primary and foreground: a site's theme can make secondary and accent
// pale tints, which wouldn't show here.
const bars = [
  { colour: 'bg-primary', duration: 620 },
  { colour: 'bg-foreground', duration: 840 },
  { colour: 'bg-primary', duration: 540 },
  { colour: 'bg-foreground', duration: 760 },
  { colour: 'bg-primary', duration: 580 },
  { colour: 'bg-foreground', duration: 900 },
  { colour: 'bg-primary', duration: 680 },
]

const ripple = {
  from: { opacity: 0.7, transform: [{ scale: 1 }] },
  to: { opacity: 0, transform: [{ scale: 1.7 }] },
}
const bounce = {
  from: { transform: [{ scaleY: 0.25 }] },
  to: { transform: [{ scaleY: 1 }] },
}
const arrive = {
  from: { opacity: 0, transform: [{ scale: 0.92 }] },
  to: { opacity: 1, transform: [{ scale: 1 }] },
}

// Flat circles of the theme's colours behind the screen. Goes first in a
// flex-1 parent, which it fills without taking touches.
export function SignInBackdrop() {
  return (
    <View className="pointer-events-none absolute inset-0 overflow-hidden">
      <View className="absolute -left-24 -top-20 h-72 w-72 rounded-full bg-primary opacity-20" />
      <View className="absolute -right-28 top-24 h-64 w-64 rounded-full bg-foreground opacity-5" />
      <View className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-primary opacity-10" />
    </View>
  )
}

// The logo sending out sound waves, over the app's name and an equaliser.
// Holds still, with the rings drawn in place, if the phone asks for less motion.
export function SignInHero({ subtitle }: { subtitle: string }) {
  const reducedMotion = useReducedMotion()

  return (
    <View className="items-center gap-3">
      <View className="items-center justify-center" style={{ height: LOGO_SIZE + 48, width: LOGO_SIZE + 48 }}>
        {Array.from({ length: RING_COUNT }, (_, i) => (
          <Animated.View
            key={i}
            style={[
              { position: 'absolute', height: LOGO_SIZE, width: LOGO_SIZE },
              reducedMotion
                ? { opacity: 0.4, transform: [{ scale: 1.1 + i * 0.12 }] }
                : {
                    opacity: 0,
                    animationName: ripple,
                    animationDuration: RING_PERIOD,
                    animationDelay: (i * RING_PERIOD) / RING_COUNT,
                    animationIterationCount: 'infinite',
                    animationTimingFunction: 'linear',
                  },
            ]}>
            <View className="h-full w-full rounded-full border-2 border-primary" />
          </Animated.View>
        ))}
        <Animated.View
          style={
            reducedMotion
              ? undefined
              : { animationName: arrive, animationDuration: 300, animationTimingFunction: easeOut }
          }>
          {/* The icon's white background is what the logo's eyes and hub are made of, so it stays. */}
          <Image
            source={require('../../assets/images/icon.png')}
            style={{ height: LOGO_SIZE, width: LOGO_SIZE, borderRadius: LOGO_SIZE / 2 }}
          />
        </Animated.View>
      </View>

      <View className="h-6 flex-row items-center gap-1">
        {bars.map(({ colour, duration }, i) => (
          <Animated.View
            key={i}
            style={[
              { height: 24, width: 4 },
              reducedMotion
                ? { transform: [{ scaleY: 0.4 + ((i * 3) % 5) * 0.15 }] }
                : {
                    animationName: bounce,
                    animationDuration: duration,
                    animationDirection: 'alternate',
                    animationIterationCount: 'infinite',
                    animationTimingFunction: easeInOut,
                  },
            ]}>
            <View className={`h-full w-full rounded-full ${colour}`} />
          </Animated.View>
        ))}
      </View>

      <View className="items-center gap-1">
        <Text variant="h1">PodNoms</Text>
        <Text className="text-center text-lg font-medium">Your shows, in your pocket.</Text>
        <Text variant="muted" className="text-center">
          {subtitle}
        </Text>
      </View>
    </View>
  )
}
