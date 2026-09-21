import { createContext, useContext } from 'react'
import type { Accent, ColorMode } from './theme.config'

type ThemeContextValue = {
  accent: Accent
  colorMode: ColorMode
  setAccent: (accent: Accent) => void
  setColorMode: (colorMode: ColorMode) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const theme = useContext(ThemeContext)
  if (!theme) throw new Error('useTheme must be used within ThemeProvider')
  return theme
}
