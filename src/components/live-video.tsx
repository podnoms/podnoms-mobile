import { useEvent } from 'expo'
import { useVideoPlayer, VideoView, type VideoSource } from 'expo-video'
import { useEffect } from 'react'
import { View } from 'react-native'
import { Text } from '@/components/ui/text'
import { authHeaders } from '@/lib/api'

// How long to wait before trying again when the stream can't be played (it
// may not have reached the server yet).
const retryMs = 3000

// A broadcast's video, from its HLS address, starting as soon as it can.
export function LiveVideo({ src }: { src: string }) {
  const source: VideoSource = { uri: src, contentType: 'hls', headers: authHeaders() }
  const player = useVideoPlayer(source, (created) => created.play())
  const { status } = useEvent(player, 'statusChange', { status: player.status })

  useEffect(() => {
    if (status !== 'error') return
    const retry = setTimeout(() => {
      player.replaceAsync({ uri: src, contentType: 'hls', headers: authHeaders() }).then(
        () => player.play(),
        () => {},
      )
    }, retryMs)
    return () => clearTimeout(retry)
  }, [status, player, src])

  return (
    <>
      <VideoView
        player={player}
        style={{ width: '100%', height: '100%' }}
        contentFit="contain"
        fullscreenOptions={{ enable: true, orientation: 'landscape' }}
      />
      {status !== 'readyToPlay' && (
        <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
          <Text variant="muted">{status === 'error' ? 'Waiting for the stream…' : 'Starting the stream…'}</Text>
        </View>
      )}
    </>
  )
}
