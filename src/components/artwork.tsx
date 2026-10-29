import { Image } from 'expo-image'
import { Podcast } from 'lucide-react-native'
import { View } from 'react-native'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

// Podcast or episode artwork, square, with an icon when there's none.
export function Artwork({ uri, size, className }: { uri: string | null; size: number; className?: string }) {
  return (
    <View
      className={cn('items-center justify-center overflow-hidden border border-border bg-muted', className)}
      style={{ width: size, height: size }}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} contentFit="cover" transition={150} />
      ) : (
        <Icon as={Podcast} size={size / 2.5} className="text-muted-foreground" />
      )}
    </View>
  )
}
