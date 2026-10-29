import { Image } from 'expo-image'
import { Heart, MessageCircle, Trash2 } from 'lucide-react-native'
import { Alert, Pressable, View } from 'react-native'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { useDeleteComment, useLikeComment } from '@/hooks/use-episode'
import type { CommentReply } from '@/lib/api-types'
import { useAppearance } from '@/lib/appearance'
import { formatTime, timeAgo } from '@/lib/format'
import { colour } from '@/lib/theme'
import { cn } from '@/lib/utils'

type Props = {
  comment: CommentReply
  episodeId: string
  isReply?: boolean
  onReply: (comment: CommentReply) => void
  // Plays the episode from the comment's point.
  onPlayAt?: (seconds: number) => void
}

// One comment or reply: who wrote it and when, the point in the episode it's
// about (pressing it plays from there), its text and GIF, and likes.
export function CommentItem({ comment, episodeId, isReply, onReply, onPlayAt }: Props) {
  const like = useLikeComment(episodeId)
  const remove = useDeleteComment(episodeId)
  const { palette } = useAppearance()
  const name = comment.author.name ?? comment.author.slug

  function confirmDelete() {
    Alert.alert(
      isReply ? 'Delete reply?' : 'Delete comment?',
      isReply ? undefined : 'Its replies will be deleted too.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => remove.mutate(comment.id) },
      ],
    )
  }

  return (
    <View className={cn('flex-row gap-3 py-3', isReply ? 'pl-11 pr-4' : 'px-4')}>
      <Avatar alt={name} className={isReply ? 'size-7' : 'size-9'}>
        {comment.author.imageUrl && <AvatarImage source={{ uri: comment.author.imageUrl }} />}
        <AvatarFallback>
          <Text className="text-xs font-semibold">{name.slice(0, 1).toUpperCase()}</Text>
        </AvatarFallback>
      </Avatar>
      <View className="flex-1 gap-1">
        <View className="flex-row flex-wrap items-center gap-x-2">
          <Text className="font-semibold">{name}</Text>
          {!isReply && (
            <Pressable
              onPress={onPlayAt ? () => onPlayAt(comment.atSeconds) : undefined}
              disabled={!onPlayAt}
              hitSlop={6}
              accessibilityLabel={`Play from ${formatTime(comment.atSeconds)}`}>
              <Text className="text-sm font-medium text-primary">{formatTime(comment.atSeconds)}</Text>
            </Pressable>
          )}
          <Text variant="muted">{timeAgo(comment.createdAt)}</Text>
        </View>
        {comment.body.length > 0 && (
          <Text>
            {comment.body.map((segment, i) =>
              'mention' in segment ? (
                <Text key={i} className="font-semibold text-primary">
                  @{segment.mention.slug}
                </Text>
              ) : (
                segment.text
              ),
            )}
          </Text>
        )}
        {comment.gif && (
          <Image
            source={{ uri: comment.gif.url }}
            accessibilityLabel={comment.gif.title}
            style={{ width: 200, aspectRatio: comment.gif.width / comment.gif.height }}
            contentFit="cover"
          />
        )}
        <View className="flex-row items-center gap-5 pt-1">
          <Pressable
            onPress={() => like.mutate({ commentId: comment.id, like: !comment.liked })}
            disabled={like.isPending}
            hitSlop={8}
            className="flex-row items-center gap-1"
            accessibilityLabel={comment.liked ? 'Unlike' : 'Like'}>
            <Icon
              as={Heart}
              size={15}
              className={comment.liked ? 'text-primary' : 'text-muted-foreground'}
              fill={comment.liked ? colour(palette, 'primary') : 'none'}
            />
            {comment.likeCount > 0 && <Text variant="muted">{comment.likeCount}</Text>}
          </Pressable>
          <Pressable onPress={() => onReply(comment)} hitSlop={8} className="flex-row items-center gap-1">
            <Icon as={MessageCircle} size={15} className="text-muted-foreground" />
            <Text variant="muted">Reply</Text>
          </Pressable>
          {comment.canDelete && (
            <Pressable
              onPress={confirmDelete}
              disabled={remove.isPending}
              hitSlop={8}
              accessibilityLabel={isReply ? 'Delete reply' : 'Delete comment'}>
              <Icon as={Trash2} size={15} className="text-muted-foreground" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  )
}
