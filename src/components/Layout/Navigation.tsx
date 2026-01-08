import { Home, BookOpen, Bell, Archive } from 'lucide-react'

const Navigation = () => {
  const navItems = [
    {
      icon: Home,
      label: 'Dashboard',
      active: true // For now, we'll make dashboard active
    },
    {
      icon: BookOpen,
      label: 'Palavras',
      active: false
    },
    {
      icon: Archive,
      label: 'Contextos',
      active: false
    },
    {
      icon: Bell,
      label: 'Alertas',
      active: false
    }
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 border-t-2 border-border bg-surface md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={index}
              className={`
                flex min-w-0 flex-1 flex-col items-center px-3 py-2
                ${
                  item.active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }
                transition-colors
              `}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default Navigation
