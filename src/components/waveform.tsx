import { useMemo, useRef, useState } from 'react'
import { View, type GestureResponderEvent } from 'react-native'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Text } from '@/components/ui/text'
import Svg, { G, Path } from 'react-native-svg'
import { useAppearance } from '@/lib/appearance'
import { formatTime } from '@/lib/format'
import { colour } from '@/lib/theme'
import { resample } from '@/lib/waveform'

const barWidth = 3
const barGap = 1
// Default, in the full player, and compact, on an episode's page, are as on
// the site (its components/player/waveform.tsx): the bars, and their
// reflection below at a fraction of the height. Backdrop is faint bars behind something else (the
// mini player), filling whatever it's laid over, so place it absolutely.
const sizes = {
  default: { barsHeight: 88, reflectionHeight: 28, unplayed: 0.3, played: 1 },
  compact: { barsHeight: 48, reflectionHeight: 18, unplayed: 0.3, played: 1 },
  backdrop: { barsHeight: null, reflectionHeight: 0, unplayed: 0.12, played: 0.35 },
}
// How much of a backdrop's height the loudest bars reach, leaving it some air.
const backdropReach = 0.85
const markerSize = 18

// A point to mark on the waveform, such as where a comment was made, shown as
// a tiny avatar along the bottom: its image, or the fallback (initials) without one.
export type WaveformMarker = { id: string; seconds: number; imageUrl: string | null; fallback: string }

// A Mixcloud-style waveform that shows how far through the episode the
// listener is, as the site draws it. With `onSeek`, dragging along it seeks
// when let go, telling `onScrub` where it would land on the way (and null
// once done) so the screen can show that time. Markers sit along the bottom.
export function Waveform({
  values,
  duration,
  position,
  onSeek,
  onScrub,
  markers = [],
  size = 'default',
}: {
  // Bar heights from 0 to 255.
  values: number[]
  duration: number
  position: number
  onSeek?: (seconds: number) => void
  onScrub?: (seconds: number | null) => void
  markers?: WaveformMarker[]
  size?: keyof typeof sizes
}) {
  const { palette } = useAppearance()
  const look = sizes[size]
  const [layout, setLayout] = useState({ width: 0, height: 0 })
  const { width } = layout
  const reflectionHeight = look.reflectionHeight
  const barsHeight = look.barsHeight ?? Math.floor(layout.height * backdropReach)
  const height = look.barsHeight === null ? layout.height : reflectionHeight ? barsHeight + 1 + reflectionHeight : barsHeight
  // Where a drag would seek to, as a fraction of the width.
  const [scrub, setScrub] = useState<number | null>(null)
  // The view's left edge on screen, so a drag that strays off it still tracks.
  const left = useRef(0)

  // Each bar's outline, above and (if there's one) in the reflection, to be
  // joined into the played and unplayed paths.
  const { upper, lower } = useMemo(() => {
    const bars = resample(values, Math.floor((width + barGap) / (barWidth + barGap)))
    const outlines = (scale: number, top: number, direction: 1 | -1) =>
      bars.map((value, i) => {
        const h = Math.max(1, (value / 255) * scale)
        const x = i * (barWidth + barGap)
        return direction === 1 ? `M${x} ${top - h}h${barWidth}v${h}h${-barWidth}z` : `M${x} ${top}h${barWidth}v${h}h${-barWidth}z`
      })
    // A backdrop's bars stand on its bottom edge.
    return {
      upper: outlines(barsHeight, look.barsHeight === null ? height : barsHeight, 1),
      lower: reflectionHeight ? outlines(reflectionHeight, barsHeight + 1, -1) : [],
    }
  }, [values, width, height, barsHeight, reflectionHeight, look.barsHeight])

  const played = duration > 0 ? Math.min(1, Math.max(0, position / duration)) : 0
  const shown = scrub ?? played
  // The played bars and the rest as separate paths, split at the bar the
  // listener's reached, rather than clipping one over the other: Android's
  // react-native-svg doesn't redraw a clip path when its size changes.
  const split = Math.round(shown * upper.length)
  const playedUpper = upper.slice(0, split).join('')
  const restUpper = upper.slice(split).join('')
  const playedLower = lower.slice(0, split).join('')
  const restLower = lower.slice(split).join('')
  const seekable = !!onSeek && duration > 0

  const fractionAt = (event: GestureResponderEvent) =>
    width ? Math.min(1, Math.max(0, (event.nativeEvent.pageX - left.current) / width)) : 0
  const track = (fraction: number) => {
    setScrub(fraction)
    onScrub?.(fraction * duration)
  }
  const end = (seek: boolean, event?: GestureResponderEvent) => {
    if (seek && event) onSeek?.(fractionAt(event) * duration)
    setScrub(null)
    onScrub?.(null)
  }

  return (
    <View
      style={look.barsHeight === null ? { flex: 1 } : { height, width: '100%' }}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout
        setLayout({ width: Math.floor(width), height: Math.floor(height) })
      }}
      // Only a seek control to a screen reader; a backdrop is decoration.
      accessible={seekable}
      accessibilityRole="adjustable"
      accessibilityLabel="Seek"
      accessibilityValue={{ text: `${formatTime(position)} of ${formatTime(duration)}` }}
      accessibilityActions={seekable ? [{ name: 'increment' }, { name: 'decrement' }] : undefined}
      onAccessibilityAction={(event) =>
        onSeek?.(Math.min(duration, Math.max(0, position + (event.nativeEvent.actionName === 'increment' ? 30 : -15))))
      }
      onStartShouldSetResponder={() => seekable}
      onMoveShouldSetResponder={() => seekable}
      // Keep the drag from the modal's swipe to close, say.
      onResponderTerminationRequest={() => false}
      onResponderGrant={(event) => {
        // The SVG takes no touches, so this is relative to this view.
        left.current = event.nativeEvent.pageX - event.nativeEvent.locationX
        track(fractionAt(event))
      }}
      onResponderMove={(event) => track(fractionAt(event))}
      onResponderRelease={(event) => end(true, event)}
      onResponderTerminate={() => end(false)}>
      {width > 0 && height > 0 && (
        <Svg width={width} height={height} pointerEvents="none">
          <G fill={colour(palette, 'muted-foreground')} fillOpacity={look.unplayed}>
            {restUpper ? <Path d={restUpper} /> : null}
            {restLower ? <Path d={restLower} opacity={0.5} /> : null}
          </G>
          <G fill={colour(palette, 'primary')} fillOpacity={look.played}>
            {playedUpper ? <Path d={playedUpper} /> : null}
            {playedLower ? <Path d={playedLower} opacity={0.4} /> : null}
          </G>
        </Svg>
      )}
      {width > 0 &&
        duration > 0 &&
        markers.map((marker) => (
          <Avatar
            key={marker.id}
            alt=""
            pointerEvents="none"
            className="absolute bottom-0 border border-card"
            style={{
              width: markerSize,
              height: markerSize,
              left: Math.min(width, (marker.seconds / duration) * width) - markerSize / 2,
            }}>
            {marker.imageUrl && <AvatarImage source={{ uri: marker.imageUrl }} />}
            <AvatarFallback className="bg-primary">
              <Text className="text-[8px] font-semibold text-primary-foreground">{marker.fallback}</Text>
            </AvatarFallback>
          </Avatar>
        ))}
    </View>
  )
}
