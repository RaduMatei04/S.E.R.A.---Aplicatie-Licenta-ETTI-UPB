import { useLayoutEffect, useState, type ReactNode } from 'react'
import { accents, accentSchema, colorModeSchema, type Accent, type ColorMode } from './theme.config'
import { ThemeContext } from './useTheme'

const accentStorageKey = 'sera-accent'
const colorModeStorageKey = 'sera-color-mode'

function readPreference(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    console.warn(`SERA: cannot read ${key}; using the default preference.`)
    return null
  }
}

function persistPreference(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    console.warn(`SERA: cannot persist ${key}; preference remains active for this session.`)
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accent, setAccent] = useState<Accent>(() => {
    const result = accentSchema.safeParse(readPreference(accentStorageKey))
    return result.success ? result.data : 'brad'
  })
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    const result = colorModeSchema.safeParse(readPreference(colorModeStorageKey))
    return result.success ? result.data : 'light'
  })

  useLayoutEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accents[accent].color)
    persistPreference(accentStorageKey, accent)
  }, [accent])

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', colorMode === 'dark')
    document.documentElement.style.colorScheme = colorMode
    persistPreference(colorModeStorageKey, colorMode)
  }, [colorMode])

  return (
    <ThemeContext.Provider value={{ accent, colorMode, setAccent, setColorMode }}>
      {children}
    </ThemeContext.Provider>
  )
}
