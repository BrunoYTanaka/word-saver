import { Plus, Settings, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import Button from '../UI/Button'
import { useModal } from '../../context/ModalContext'

const Header = () => {
  const { toggleTheme, isDark } = useTheme()
  const { openModal } = useModal()

  return (
    <header className="bg-surface sticky top-0 z-40 border-b border-border">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4 p-2">
          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">
                W
              </span>
            </div>
            <h1 className="hidden text-xl font-bold sm:block">Word Saver</h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Add Word Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => openModal('ADD_WORD')}
              icon={<Plus />}
              className="hidden sm:flex"
            >
              Nova Palavra
            </Button>

            {/* Mobile Add Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={() => openModal('ADD_WORD')}
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
              onClick={() => openModal('SETTINGS')}
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
