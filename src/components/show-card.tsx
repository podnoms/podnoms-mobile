import { router } from 'expo-router'
import { ChevronRight, Lock } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { Artwork } from '@/components/artwork'
import { LiveBadge } from '@/components/live-badge'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import type { Show, ShowSummary } from '@/lib/api-types'
import { pluralise } from '@/lib/format'

// Not a Link, as the live badge inside it goes somewhere else.
export function ShowCard({ show }: { show: Show | ShowSummary }) {
  const isPrivate = 'private' in show && show.private
  const details =
    'episodeCount' in show ? [show.author, pluralise(show.episodeCount, 'episode')].filter(Boolean).join(' · ') : null
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/shows/[slug]', params: { slug: show.slug } })}
      accessibilityRole="link"
      className="flex-row items-center gap-3 border-b border-border px-4 py-3 active:bg-muted">
      <Artwork uri={show.imageUrl} size={64} />
      <View className="flex-1 gap-1">
        <Text className="font-semibold" numberOfLines={2}>
          {show.title}
        </Text>
        {details ? (
          <Text variant="muted" numberOfLines={1}>
            {details}
          </Text>
        ) : null}
        <View className="flex-row items-center gap-3">
          <LiveBadge show={show} />
          {isPrivate && (
            <View className="flex-row items-center gap-1">
              <Icon as={Lock} size={12} className="text-muted-foreground" />
              <Text variant="muted">Private</Text>
            </View>
          )}
        </View>
      </View>
      <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
    </Pressable>
  )
}
