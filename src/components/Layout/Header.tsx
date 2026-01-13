import {
  Plus,
  Settings,
  Moon,
  Sun,
  Home,
  BarChart3,
  Zap,
  Brain
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import Button from '../UI/Button'
import { useModal } from '../../context/ModalContext'

const Header = () => {
  const { toggleTheme, isDark } = useTheme()
  const { openModal } = useModal()
  const location = useLocation()

  const desktopNavItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Zap, label: 'Flashcards', path: '/flashcards' },
    { icon: Brain, label: 'Quiz', path: '/quiz' },
    { icon: BarChart3, label: 'Estatísticas', path: '/statistics' }
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
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

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {desktopNavItems.map((item) => {
              const Icon = item.icon
              const isActive =
                location.pathname === item.path ||
                (item.path === '/dashboard' && location.pathname === '/')

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 rounded-lg px-3 py-2 transition-colors
                    ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                    }
                  `}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

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
