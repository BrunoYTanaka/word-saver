import { useState, useEffect } from 'react'
import { dbService } from '../services/db'
import { ThemeContext } from '../hooks/useTheme'

const THEME_KEY = 'theme'
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
} as const

type ThemeType = (typeof THEMES)[keyof typeof THEMES]

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeType>(THEMES.AUTO)
  const [isDark, setIsDark] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize theme from database
  useEffect(() => {
    const initTheme = async () => {
      try {
        await dbService.init()
        const savedTheme = await dbService.settings.getSetting(THEME_KEY)
        const initialTheme = savedTheme || THEMES.AUTO

        setTheme(initialTheme)
        applyTheme(initialTheme)
      } catch (error) {
        console.error('Error loading theme:', error)
        // Fallback to system preference
        const systemPrefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches
        setIsDark(systemPrefersDark)
        applyThemeToDOM(systemPrefersDark)
      } finally {
        setIsLoading(false)
      }
    }

    initTheme()
  }, [])

  // Listen for system theme changes
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

    // Set initial value
    setIsDark(mediaQuery.matches)
    applyThemeToDOM(mediaQuery.matches)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Apply theme logic
  const applyTheme = (newTheme: ThemeType) => {
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
  }

  // Apply theme to DOM
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

  // Change theme
  const changeTheme = async (newTheme: ThemeType) => {
    if (!Object.values(THEMES).includes(newTheme)) {
      console.error('Invalid theme:', newTheme)
      return
    }

    try {
      // Save to database
      await dbService.settings.setSetting(THEME_KEY, newTheme)

      // Update state and apply
      setTheme(newTheme)
      applyTheme(newTheme)

      console.log(`Theme changed to: ${newTheme}`)
    } catch (error) {
      console.error('Error saving theme:', error)
      // Still apply the theme locally even if saving fails
      setTheme(newTheme)
      applyTheme(newTheme)
    }
  }

  // Toggle between light and dark (for quick toggle button)
  const toggleTheme = () => {
    const newTheme = theme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK
    changeTheme(newTheme)
  }

  // Cycle through all themes (for settings)
  const cycleTheme = () => {
    const themes = Object.values(THEMES)
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    changeTheme(themes[nextIndex])
  }

  // Get theme display name
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

  // Get theme icon
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

  // Get effective theme (resolves auto to actual theme)
  const getEffectiveTheme = () => {
    if (theme === THEMES.AUTO) {
      return isDark ? THEMES.DARK : THEMES.LIGHT
    }
    return theme
  }

  const value = {
    // Current state
    theme,
    isDark,
    isLoading,

    // Theme constants
    themes: THEMES,

    // Actions
    changeTheme,
    toggleTheme,
    cycleTheme,

    // Utilities
    getThemeDisplayName,
    getThemeIcon,
    getEffectiveTheme,

    // For theme selector components
    availableThemes: Object.values(THEMES).map((value) => ({
      value,
      label: getThemeDisplayName(value),
      icon: getThemeIcon(value)
    }))
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
