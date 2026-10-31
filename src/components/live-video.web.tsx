import HlsPlayer, { ErrorTypes, Events } from 'hls.js'
import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { Text } from '@/components/ui/text'
import { authHeaders } from '@/lib/api'

// How long to wait before trying again when the stream can't be played.
const retryMs = 3000

// live-video.tsx for the web build: browsers other than Safari can't play HLS
// themselves, or send the token with it, so this uses hls.js, as the site does.
export function LiveVideo({ src }: { src: string }) {
  const video = useRef<HTMLVideoElement>(null)
  const [state, setState] = useState<'loading' | 'playing' | 'waiting'>('loading')

  useEffect(() => {
    const element = video.current
    if (!element) return
    let hls: HlsPlayer | null = null
    let retry: ReturnType<typeof setTimeout> | undefined
    // Browsers won't start sound without a click; start muted rather than not at all.
    const play = () => {
      element.play().catch(() => {
        element.muted = true
        element.play().catch(() => {})
      })
    }
    const onPlaying = () => setState('playing')
    element.addEventListener('playing', onPlaying)

    function start() {
      hls = new HlsPlayer({
        lowLatencyMode: false,
        liveSyncDurationCount: 3,
        backBufferLength: 30,
        xhrSetup: (xhr) => {
          for (const [name, value] of Object.entries(authHeaders())) xhr.setRequestHeader(name, value)
        },
      })
      hls.on(Events.MANIFEST_PARSED, play)
      hls.on(Events.ERROR, (_event, error) => {
        if (!error.fatal) return
        if (error.type === ErrorTypes.MEDIA_ERROR) {
          hls?.recoverMediaError()
          return
        }
        setState('waiting')
        hls?.destroy()
        retry = setTimeout(start, retryMs)
      })
      hls.loadSource(src)
      hls.attachMedia(element!)
    }
    start()

    return () => {
      clearTimeout(retry)
      element.removeEventListener('playing', onPlaying)
      hls?.destroy()
    }
  }, [src])

  return (
    <>
      <video ref={video} controls playsInline autoPlay style={{ width: '100%', height: '100%' }} />
      {state !== 'playing' && (
        <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
          <Text variant="muted">{state === 'waiting' ? 'Waiting for the stream…' : 'Starting the stream…'}</Text>
        </View>
      )}
    </>
  )
}
