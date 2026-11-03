import { BottomTabBar, Tabs } from 'expo-router/js-tabs'
import { Headphones, House, Settings } from 'lucide-react-native'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MiniPlayer } from '@/components/mini-player'
import { TabHeader } from '@/components/tab-header'

export default function TabsLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      // The default height of 49 clips the labels.
      screenOptions={{ tabBarStyle: { height: 56 + insets.bottom } }}
      tabBar={(props) => (
        <View>
          <MiniPlayer />
          <BottomTabBar {...props} />
        </View>
      )}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          header: () => <TabHeader title="PodNoms" brand profile />,
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="listen"
        options={{
          title: 'Listen',
          header: () => <TabHeader title="Listen" profile />,
          tabBarIcon: ({ color, size }) => <Headphones color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          header: () => <TabHeader title="Settings" />,
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  )
}
