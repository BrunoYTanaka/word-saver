import { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface TooltipProps {
  content: string
  children: ReactNode
  className?: string
}

export function Tooltip({ content, children, className }: TooltipProps) {
  if (!content) return <>{children}</>

  return (
    <span
      className={cn('group/tooltip relative inline-flex max-w-full', className)}
    >
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2',
          'max-w-xs break-words rounded bg-foreground px-2 py-1 text-xs text-background shadow-md',
          'opacity-0 transition-opacity delay-300 duration-150 group-hover/tooltip:opacity-100'
        )}
      >
        {content}
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-foreground" />
      </span>
    </span>
  )
}
