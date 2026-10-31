import { Link } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { Pressable, ScrollView, View } from 'react-native'
import { Artwork } from '@/components/artwork'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { useMe } from '@/hooks/use-shows'
import { useAppearance, type Preference } from '@/lib/appearance'
import { useAuth } from '@/lib/auth'
import { usePlayer } from '@/lib/player'

const appearances: [Preference, string][] = [
  ['system', 'System'],
  ['light', 'Light'],
  ['dark', 'Dark'],
]

export default function SettingsScreen() {
  const auth = useAuth()
  const me = useMe()
  const player = usePlayer()
  const appearance = useAppearance()

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-4">
      <View className="flex-row items-center gap-3">
        <Artwork uri={me.data?.imageUrl ?? null} size={56} />
        <View className="flex-1">
          <Text variant="large">{me.data?.name ?? me.data?.slug ?? ' '}</Text>
          <Text variant="muted">{me.data?.email}</Text>
        </View>
      </View>
      <Separator />
      <View className="gap-2">
        <Text variant="small">Appearance</Text>
        <View className="flex-row gap-2" accessibilityRole="radiogroup">
          {appearances.map(([value, label]) => (
            <Button
              key={value}
              className="flex-1"
              size="sm"
              variant={appearance.preference === value ? 'default' : 'outline'}
              accessibilityRole="radio"
              accessibilityState={{ checked: appearance.preference === value }}
              onPress={() => appearance.setPreference(value)}>
              <Text>{label}</Text>
            </Button>
          ))}
        </View>
      </View>
      <Separator />
      <Link href="/notifications" asChild>
        <Pressable className="flex-row items-center justify-between active:opacity-70" accessibilityRole="link">
          <View className="flex-1 gap-1">
            <Text variant="small">Notifications</Text>
            <Text variant="muted">Going live and new episodes from shows you follow</Text>
          </View>
          <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
        </Pressable>
      </Link>
      <Separator />
      <View className="gap-1">
        <Text variant="small">Server</Text>
        <Text variant="muted">{auth.serverUrl}</Text>
      </View>
      <Separator />
      <Button
        variant="outline"
        onPress={() => {
          if (player.episode) player.stop()
          void auth.signOut()
        }}>
        <Text>Sign out</Text>
      </Button>
    </ScrollView>
  )
}
