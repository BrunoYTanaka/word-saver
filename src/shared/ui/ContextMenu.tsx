import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/utils/cn'

export interface ContextMenuItem {
  label: string
  icon?: React.ReactNode
  variant?: 'default' | 'danger'
  onClick: () => void
}

interface ContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Position with viewport clamping (applied after render via effect)
  useEffect(() => {
    const el = menuRef.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    el.style.left = `${Math.min(x, vw - width - 8)}px`
    el.style.top = `${Math.min(y, vh - height - 8)}px`
  }, [x, y])

  // Close on outside click or Escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  return createPortal(
    <div
      ref={menuRef}
      style={{ position: 'fixed', left: x, top: y, zIndex: 9999 }}
      className="min-w-[140px] overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-lg"
    >
      {items.map((item, i) => (
        <button
          key={i}
          type="button"
          onClick={() => {
            item.onClick()
            onClose()
          }}
          className={cn(
            'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
            item.variant === 'danger'
              ? 'text-destructive hover:bg-destructive/10'
              : 'text-foreground hover:bg-surface-hover'
          )}
        >
          {item.icon && <span className="size-4 shrink-0">{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>,
    document.body
  )
}
