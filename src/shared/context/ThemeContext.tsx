import {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback
} from 'react'
import { SettingStore } from '@/features/settings'

const THEME_KEY = 'theme'

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
} as const

type ThemeType = (typeof THEMES)[keyof typeof THEMES]
interface ThemeContextType {
  isDark: boolean
  theme: ThemeType
  themes: typeof THEMES
  loading: boolean
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

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>(THEMES.AUTO)
  const [isDark, setIsDark] = useState(false)
  const [loading, setloading] = useState(true)

  const applyTheme = useCallback((newTheme: ThemeType) => {
    let shouldBeDark = false

    switch (newTheme) {
      case THEMES.DARK:
        shouldBeDark = true
        break
      case THEMES.LIGHT:
        shouldBeDark = false
        break
      case THEMES.AUTO:
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        break
      default:
        shouldBeDark = false
    }

    setIsDark(shouldBeDark)
    applyThemeToDOM(shouldBeDark)
  }, [])

  useEffect(() => {
    const initTheme = async () => {
      try {
        const savedTheme = await SettingStore.getSetting(THEME_KEY)
        const initialTheme = savedTheme || THEMES.AUTO

        setTheme(initialTheme as ThemeType)
        applyTheme(initialTheme as ThemeType)
      } catch (error) {
        console.error('Error loading theme:', error)
        const systemPrefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches
        setIsDark(systemPrefersDark)
        applyThemeToDOM(systemPrefersDark)
      } finally {
        setloading(false)
      }
    }

    initTheme()
  }, [applyTheme])

  useEffect(() => {
    if (theme !== THEMES.AUTO) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === THEMES.AUTO) {
        setIsDark(e.matches)
        applyThemeToDOM(e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)

    setIsDark(mediaQuery.matches)
    applyThemeToDOM(mediaQuery.matches)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const applyThemeToDOM = (dark: boolean) => {
    const root = document.documentElement

    if (dark) {
      root.classList.add('dark')
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', '#1f2937')
    } else {
      root.classList.remove('dark')
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', '#3b82f6')
    }
  }

  const changeTheme = async (newTheme: ThemeType) => {
    if (!Object.values(THEMES).includes(newTheme)) {
      console.error('Invalid theme:', newTheme)
      return
    }

    try {
      await SettingStore.setSetting(THEME_KEY, newTheme)

      setTheme(newTheme)
      applyTheme(newTheme)

      console.log(`Theme changed to: ${newTheme}`)
    } catch (error) {
      console.error('Error saving theme:', error)
      setTheme(newTheme)
      applyTheme(newTheme)
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK
    changeTheme(newTheme)
  }

  const cycleTheme = () => {
    const themes = Object.values(THEMES)
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    changeTheme(themes[nextIndex])
  }

  const getThemeDisplayName = (themeValue = theme) => {
    switch (themeValue) {
      case THEMES.LIGHT:
        return 'Claro'
      case THEMES.DARK:
        return 'Escuro'
      case THEMES.AUTO:
        return 'Automático'
      default:
        return 'Desconhecido'
    }
  }

  const getThemeIcon = (themeValue = theme) => {
    switch (themeValue) {
      case THEMES.LIGHT:
        return '☀️'
      case THEMES.DARK:
        return '🌙'
      case THEMES.AUTO:
        return '🔄'
      default:
        return '❓'
    }
  }

  const getEffectiveTheme = () => {
    if (theme === THEMES.AUTO) {
      return isDark ? THEMES.DARK : THEMES.LIGHT
    }
    return theme
  }

  const value = {
    theme,
    isDark,
    loading,
    themes: THEMES,
    changeTheme,
    toggleTheme,
    cycleTheme,
    getThemeDisplayName,
    getThemeIcon,
    getEffectiveTheme,
    availableThemes: Object.values(THEMES).map((value) => ({
      value,
      label: getThemeDisplayName(value),
      icon: getThemeIcon(value)
    }))
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
