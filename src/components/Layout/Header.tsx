import { Plus, Settings, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { useApp } from '../../context/AppContext'
import Button from '../UI/Button'

const Header = () => {
  const { toggleTheme, isDark } = useTheme()
  const { toggleAddWordModal, toggleSettingsModal } = useApp()

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4 p-2">
          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 flex size-8 items-center justify-center rounded-lg">
              <span className="text-lg font-bold text-white">W</span>
            </div>
            <h1 className="hidden text-xl font-bold text-gray-900 sm:block dark:text-gray-100">
              Word Saver
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Add Word Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={toggleAddWordModal}
              icon={<Plus />}
              className="hidden sm:flex"
            >
              Nova Palavra
            </Button>

            {/* Mobile Add Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={toggleAddWordModal}
              icon={<Plus />}
              className="sm:hidden"
            />

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              icon={isDark ? <Sun /> : <Moon />}
              aria-label="Alternar tema"
            />

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSettingsModal}
              icon={<Settings />}
              aria-label="Configurações"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
