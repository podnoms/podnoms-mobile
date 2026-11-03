// The app's entry: Expo Router, plus what Android Auto needs, including the
// task it starts when the car connects with the app closed (src/lib/auto.ts).
import 'expo-router/entry'
import { AppRegistry } from 'react-native'
import { setUpAuto } from '@/lib/auto'

AppRegistry.registerHeadlessTask('PodnomsAuto', () => setUpAuto)
void setUpAuto()
