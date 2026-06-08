import { useEffect, useRef } from 'react'

interface DeletePopoverProps {
  onConfirm: () => void
  onCancel: () => void
}

export function DeletePopover({ onConfirm, onCancel }: DeletePopoverProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onCancel()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onCancel])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-8 z-20 flex flex-col gap-2 rounded-lg border border-border bg-surface p-3 shadow-lg"
    >
      <p className="text-xs font-medium text-foreground">Confirmar exclusão?</p>
      <div className="flex gap-2">
        <button
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
    </div>
  )
}
