import { createContext, useContext } from 'react'

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
} as const

export type ThemeType = (typeof THEMES)[keyof typeof THEMES]

interface ThemeContextType {
  isDark: boolean
  theme: ThemeType
  themes: typeof THEMES
  isLoading: boolean
  toggleTheme: () => void
  changeTheme: (newTheme: ThemeType) => void
  cycleTheme: () => void
  getThemeDisplayName: (themeValue?: ThemeType) => string
  getThemeIcon: (themeValue?: ThemeType) => string
  getEffectiveTheme: () => ThemeType
  availableThemes: {
    value: ThemeType
    label: string
    icon: string
  }[]
}

export const ThemeContext = createContext<ThemeContextType>(
  {} as ThemeContextType
)

export function useTheme() {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
