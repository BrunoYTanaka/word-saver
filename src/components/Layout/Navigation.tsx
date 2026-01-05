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
    <nav className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white md:hidden dark:border-gray-700 dark:bg-gray-800">
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
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
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
