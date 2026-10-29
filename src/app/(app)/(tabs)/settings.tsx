import { ScrollView, View } from 'react-native'
import { Artwork } from '@/components/artwork'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'
import { useMe } from '@/hooks/use-podcasts'
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
