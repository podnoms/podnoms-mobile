import { Link } from 'expo-router'
import { ChevronRight, Lock } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { Artwork } from '@/components/artwork'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import type { Podcast } from '@/lib/api-types'

export function PodcastCard({ podcast }: { podcast: Podcast }) {
  return (
    <Link href={{ pathname: '/podcasts/[slug]', params: { slug: podcast.slug } }} asChild>
      <Pressable className="flex-row items-center gap-3 border-b border-border px-4 py-3 active:bg-muted">
        <Artwork uri={podcast.imageUrl} size={64} />
        <View className="flex-1 gap-1">
          <Text className="font-semibold" numberOfLines={2}>
            {podcast.title}
          </Text>
          {podcast.private && (
            <View className="flex-row items-center gap-1">
              <Icon as={Lock} size={12} className="text-muted-foreground" />
              <Text variant="muted">Private</Text>
            </View>
          )}
        </View>
        <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
      </Pressable>
    </Link>
  )
}
