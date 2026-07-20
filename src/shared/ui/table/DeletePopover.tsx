import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface DeletePopoverProps {
  anchorRef: React.RefObject<HTMLButtonElement | null>
  onConfirm: () => void
  onCancel: () => void
}

export function DeletePopover({
  anchorRef,
  onConfirm,
  onCancel
}: DeletePopoverProps) {
  const ref = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      setPos({
        top: rect.bottom + window.scrollY + 6,
        left: rect.right + window.scrollX
      })
    }
  }, [anchorRef])

  // Focus the safe default action when the popover opens
  useEffect(() => {
    cancelRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        !anchorRef.current?.contains(e.target as Node)
      ) {
        onCancel()
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onCancel, anchorRef])

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label="Confirmar exclusão"
      style={{ position: 'absolute', top: pos.top, left: pos.left }}
      className="z-50 flex -translate-x-full flex-col gap-2 rounded-lg border border-border bg-surface p-3 shadow-lg"
    >
      <p className="whitespace-nowrap text-xs font-medium text-foreground">
        Confirmar exclusão?
      </p>
      <div className="flex gap-2">
        <button
          ref={cancelRef}
          type="button"
          onClick={onCancel}
          className="rounded border border-border px-2 py-1 text-xs hover:bg-surface-muted"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded bg-destructive px-2 py-1 text-xs text-destructive-foreground hover:bg-destructive-hover"
        >
          Excluir
        </button>
      </div>
    </div>,
    document.body
  )
}
