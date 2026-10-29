import { DarkTheme, DefaultTheme, type Theme } from 'expo-router'

// The theme's colours as "H S% L%" triplets, which src/global.css and
// tailwind.config.js wrap in hsl(). The site's own theme (from
// /api/mobile/theme, see appearance.tsx) replaces these at runtime.
export type ColourName =
  | 'background'
  | 'foreground'
  | 'card'
  | 'card-foreground'
  | 'popover'
  | 'popover-foreground'
  | 'primary'
  | 'primary-foreground'
  | 'secondary'
  | 'secondary-foreground'
  | 'muted'
  | 'muted-foreground'
  | 'accent'
  | 'accent-foreground'
  | 'destructive'
  | 'destructive-foreground'
  | 'border'
  | 'input'
  | 'ring'

export type Palette = { colours: Record<ColourName, string>; radius: string }
export type Scheme = 'light' | 'dark'

// The platform's default theme (podnoms-platform src/styles/app.css),
// converted from oklch. Keep in step with src/global.css.
export const defaultPalettes: Record<Scheme, Palette> = {
  light: {
    radius: '0px',
    colours: {
      background: '0 0% 100%',
      foreground: '0 0% 0%',
      card: '0 0% 100%',
      'card-foreground': '0 0% 0%',
      popover: '0 0% 100%',
      'popover-foreground': '0 0% 0%',
      primary: '0 100% 60%',
      'primary-foreground': '0 0% 100%',
      secondary: '60 100% 50%',
      'secondary-foreground': '0 0% 0%',
      muted: '0 0% 94.1%',
      'muted-foreground': '0 0% 20%',
      accent: '216 100% 50%',
      'accent-foreground': '0 0% 100%',
      destructive: '0 0% 0%',
      'destructive-foreground': '0 0% 100%',
      border: '0 0% 0%',
      input: '0 0% 0%',
      ring: '0 100% 60%',
    },
  },
  dark: {
    radius: '0px',
    colours: {
      background: '0 0% 0%',
      foreground: '0 0% 100%',
      card: '0 0% 20%',
      'card-foreground': '0 0% 100%',
      popover: '0 0% 20%',
      'popover-foreground': '0 0% 100%',
      primary: '0 100% 70%',
      'primary-foreground': '0 0% 0%',
      secondary: '60 100% 60%',
      'secondary-foreground': '0 0% 0%',
      muted: '0 0% 10.2%',
      'muted-foreground': '0 0% 80%',
      accent: '210 100% 60%',
      'accent-foreground': '0 0% 0%',
      destructive: '0 0% 100%',
      'destructive-foreground': '0 0% 0%',
      border: '0 0% 100%',
      input: '0 0% 100%',
      ring: '0 100% 70%',
    },
  },
}

// A colour for what can't take a class name (navigation chrome, icons).
export const colour = (palette: Palette, name: ColourName) => `hsl(${palette.colours[name]})`

// The palette as the CSS variables the class names read.
export function paletteVars(palette: Palette) {
  const vars: Record<string, string> = { '--radius': palette.radius }
  for (const [name, value] of Object.entries(palette.colours)) vars[`--${name}`] = value
  return vars
}

export function navTheme(scheme: Scheme, palette: Palette): Theme {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme
  return {
    ...base,
    colors: {
      background: colour(palette, 'background'),
      border: colour(palette, 'border'),
      card: colour(palette, 'card'),
      notification: colour(palette, 'destructive'),
      primary: colour(palette, 'primary'),
      text: colour(palette, 'foreground'),
    },
  }
}
