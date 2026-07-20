import { ReactNode } from 'react'
import { cn } from '@/shared/utils/cn'

interface TooltipProps {
  content: string
  children: ReactNode
  className?: string
  /** Which side of the trigger the tooltip opens on. Default 'top'. */
  placement?: 'top' | 'bottom'
}

export function Tooltip({
  content,
  children,
  className,
  placement = 'top'
}: TooltipProps) {
  if (!content) return <>{children}</>

  return (
    <span
      className={cn('group/tooltip relative inline-flex max-w-full', className)}
    >
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 z-50 -translate-x-1/2',
          placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
          'max-w-xs break-words rounded bg-foreground px-2 py-1 text-xs text-background shadow-md',
          'opacity-0 transition-opacity delay-300 duration-150 group-hover/tooltip:opacity-100'
        )}
      >
        {content}
        <span
          className={cn(
            'absolute left-1/2 -translate-x-1/2 border-4 border-transparent',
            placement === 'top'
              ? 'top-full border-t-foreground'
              : 'bottom-full border-b-foreground'
          )}
        />
      </span>
    </span>
  )
}
