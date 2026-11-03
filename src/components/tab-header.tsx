import { Image } from 'expo-image'
import { Link } from 'expo-router'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Text } from '@/components/ui/text'
import { useMe } from '@/hooks/use-shows'

const AVATAR_SIZE = 36
const LOGO_SIZE = 40

// The header of every tab: part of the page rather than a bar across it, with
// a large title, and the user's picture to get to Settings from the others.
export function TabHeader({ title, brand, profile }: { title: string; brand?: boolean; profile?: boolean }) {
  const insets = useSafeAreaInsets()

  return (
    <View className="bg-background" style={{ paddingTop: insets.top }}>
      <View className="h-16 flex-row items-center gap-2.5 px-4">
        {brand && (
          <Image
            source={require('../../assets/images/icon.png')}
            style={{ height: LOGO_SIZE, width: LOGO_SIZE, borderRadius: LOGO_SIZE / 2 }}
          />
        )}
        <Text role="heading" numberOfLines={1} className="flex-1 text-3xl font-extrabold tracking-tight">
          {title}
        </Text>
        {profile && <ProfileLink />}
      </View>
    </View>
  )
}

function ProfileLink() {
  const me = useMe()
  const name = me.data?.name ?? me.data?.slug ?? ''

  return (
    <Link href="/settings" asChild>
      <Pressable hitSlop={8} className="active:opacity-70" accessibilityRole="link" accessibilityLabel="Settings">
        <Avatar alt="" style={{ height: AVATAR_SIZE, width: AVATAR_SIZE }}>
          {me.data?.imageUrl && <AvatarImage source={{ uri: me.data.imageUrl }} />}
          <AvatarFallback className="bg-primary">
            <Text className="font-bold text-primary-foreground">{name.charAt(0).toUpperCase()}</Text>
          </AvatarFallback>
        </Avatar>
      </Pressable>
    </Link>
  )
}
