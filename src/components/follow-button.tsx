import { Check, Plus } from 'lucide-react-native'
import { View } from 'react-native'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { useFollowShow } from '@/hooks/use-shows'
import type { ShowDetails } from '@/lib/api-types'
import { enableNotifications } from '@/lib/notifications'

// Follows or unfollows a show, which puts it on the home page or takes it off.
export function FollowButton({ show }: { show: ShowDetails }) {
  const follow = useFollowShow(show.slug)
  return (
    <View className="flex-row pt-1">
      <Button
        size="sm"
        variant={show.following ? 'outline' : 'default'}
        disabled={follow.isPending}
        onPress={() => {
          follow.mutate({ showId: show.id, following: !show.following })
          // Now's when asking makes sense: they want to hear from this show.
          if (!show.following) void enableNotifications()
        }}>
        <Icon as={show.following ? Check : Plus} />
        <Text>{show.following ? 'Following' : 'Follow'}</Text>
      </Button>
    </View>
  )
}
