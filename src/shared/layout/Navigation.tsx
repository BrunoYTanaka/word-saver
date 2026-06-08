import { Home, BarChart3, Zap, Brain, BookOpen } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const Navigation = () => {
  const location = useLocation()

  const navItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/dashboard'
    },
    {
      icon: BookOpen,
      label: 'Palavras',
      path: '/words'
    },
    {
      icon: Zap,
      label: 'Flashcards',
      path: '/flashcards'
    },
    {
      icon: Brain,
      label: 'Quiz',
      path: '/quiz'
    },
    {
      icon: BarChart3,
      label: 'Estatísticas',
      path: '/statistics'
    }
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 border-t-2 border-border bg-surface md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive =
            location.pathname === item.path ||
            (item.path === '/dashboard' && location.pathname === '/')

          return (
            <Link
              key={index}
              to={item.path}
              className={`
                flex min-w-0 flex-1 flex-col items-center px-3 py-2
                ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }
                transition-colors
              `}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default Navigation
