// Light or dark, and the colours to use: the site's own theme (as admins set
// it on its Theme tab, from /api/mobile/theme), over the default one built in.
// The listener picks System, Light or Dark in Settings; it's kept on the device.
import { useQuery } from '@tanstack/react-query'
import { useColorScheme, vars } from 'nativewind'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Platform, useColorScheme as useSystemColorScheme, View } from 'react-native'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { deleteItem, getItem, setItem } from '@/lib/storage'
import { defaultPalettes, paletteVars, type ColourName, type Palette, type Scheme } from '@/lib/theme'

export type Preference = 'system' | 'light' | 'dark'

// What /api/mobile/theme gives: null while the site has the default theme.
type SiteMode = { colours: Partial<Record<ColourName, string>>; radius: string | null }
type SiteTheme = { basedOn: string | null; light: SiteMode; dark: SiteMode } | null

const preferenceKey = 'podnoms.appearance'
// The last theme fetched, so the app starts in it rather than flashing the default.
const themeKey = 'podnoms.theme'

type AppearanceContextValue = {
  preference: Preference
  setPreference: (preference: Preference) => void
  scheme: Scheme
  palette: Palette
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null)

function withSiteTheme(palette: Palette, site: SiteMode | undefined): Palette {
  if (!site) return palette
  return { colours: { ...palette.colours, ...site.colours }, radius: site.radius ?? palette.radius }
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const { serverUrl } = useAuth()
  const { colorScheme, setColorScheme } = useColorScheme()
  // The device's own setting. On web NativeWind doesn't follow it by itself.
  const systemScheme = useSystemColorScheme() === 'dark' ? 'dark' : 'light'
  const [preference, setPreferenceState] = useState<Preference>('system')
  const [storedTheme, setStoredTheme] = useState<SiteTheme | undefined>(undefined)

  useEffect(() => {
    void getItem(preferenceKey).then((value) => {
      if (value === 'light' || value === 'dark') setPreferenceState(value)
    })
    void getItem(themeKey).then((value) => {
      if (value) setStoredTheme(JSON.parse(value) as SiteTheme)
    })
  }, [])

  // On phones NativeWind follows the system unless told otherwise. On web its
  // dark styles hang off a class it only sets when told which mode to use.
  useEffect(() => {
    setColorScheme(Platform.OS === 'web' && preference === 'system' ? systemScheme : preference)
  }, [preference, systemScheme, setColorScheme])

  const site = useQuery({
    queryKey: ['theme', serverUrl],
    queryFn: () => api<SiteTheme>('/api/mobile/theme'),
    staleTime: 5 * 60_000,
  })
  useEffect(() => {
    if (site.data !== undefined) void setItem(themeKey, JSON.stringify(site.data))
  }, [site.data])
  const theme = site.data !== undefined ? site.data : storedTheme

  const scheme: Scheme = colorScheme === 'dark' ? 'dark' : 'light'
  const palette = withSiteTheme(defaultPalettes[scheme], theme?.[scheme])

  const value: AppearanceContextValue = {
    preference,
    scheme,
    palette,
    setPreference(next) {
      setPreferenceState(next)
      void (next === 'system' ? deleteItem(preferenceKey) : setItem(preferenceKey, next))
    },
  }

  return (
    <AppearanceContext.Provider value={value}>
      <View style={[{ flex: 1 }, vars(paletteVars(palette))]}>{children}</View>
    </AppearanceContext.Provider>
  )
}

export function useAppearance() {
  const context = useContext(AppearanceContext)
  if (!context) throw new Error('useAppearance must be used inside AppearanceProvider')
  return context
}
