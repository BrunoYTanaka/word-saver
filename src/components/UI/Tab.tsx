import { useState } from 'react'
import { cn } from '../../utils/cn'

interface TabItem {
  id: string
  label: string
  content: React.ReactNode
}

interface TabProps {
  tabs: TabItem[]
  defaultTab?: string
  className?: string
  variant?: 'default' | 'pills' | 'underlined'
  size?: 'sm' | 'md' | 'lg'
}

function Tab({
  tabs,
  defaultTab,
  className = '',
  variant = 'default',
  size = 'md'
}: TabProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '')

  const variantClasses = {
    default: 'bg-surface rounded-lg p-1 border border-border',
    pills: 'bg-transparent',
    underlined: 'bg-transparent border-b border-border'
  }

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const getTabButtonClasses = (tabId: string) => {
    const isActive = activeTab === tabId

    const baseClasses = cn(
      'flex w-full cursor-pointer items-center justify-center border-0 px-4 py-2 transition-colors',
      sizeClasses[size]
    )

    switch (variant) {
      case 'default':
        return cn(
          baseClasses,
          'rounded-md',
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-transparent text-muted hover:bg-surface-muted'
        )

      case 'pills':
        return cn(
          baseClasses,
          'rounded-full mx-1 transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-transparent text-muted hover:bg-surface-muted'
        )

      case 'underlined':
        return cn(
          baseClasses,
          'rounded-none border-b-2 transition-colors',
          isActive
            ? 'border-primary text-primary'
            : 'border-transparent text-muted hover:text-foreground'
        )

      default:
        return baseClasses
    }
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        <ul
          className={cn(
            'relative flex list-none flex-wrap',
            variantClasses[variant]
          )}
          role="tablist"
        >
          {tabs.map((tab) => (
            <li key={tab.id} className="z-30 flex-auto text-center">
              <button
                className={getTabButtonClasses(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-4">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              id={`panel-${tab.id}`}
              role="tabpanel"
              className={cn(
                'transition-all duration-200',
                activeTab === tab.id ? 'block' : 'hidden'
              )}
              aria-labelledby={tab.id}
            >
              {tab.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Tab
