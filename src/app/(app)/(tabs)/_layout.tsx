import { BottomTabBar, Tabs } from 'expo-router/js-tabs'
import { Headphones, Podcast, Settings } from 'lucide-react-native'
import { View } from 'react-native'
import { MiniPlayer } from '@/components/mini-player'

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => (
        <View>
          <MiniPlayer />
          <BottomTabBar {...props} />
        </View>
      )}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Podcasts', tabBarIcon: ({ color, size }) => <Podcast color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="listen"
        options={{ title: 'Listen', tabBarIcon: ({ color, size }) => <Headphones color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }}
      />
    </Tabs>
  )
}
