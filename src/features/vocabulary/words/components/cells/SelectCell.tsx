import { useRef, useEffect, KeyboardEvent } from 'react'
import type { FullContext } from '@/features/vocabulary'

interface SelectCellProps {
  value: string
  isEditing: boolean
  contexts: FullContext[]
  onEdit: () => void
  onChange: (value: string) => void
  onCommit: () => void
  onCancel: () => void
  onTabNext?: () => void
}

export function SelectCell({
  value,
  isEditing,
  contexts,
  onEdit,
  onChange,
  onCommit,
  onCancel,
  onTabNext
}: SelectCellProps) {
  const ref = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    if (isEditing) ref.current?.focus()
  }, [isEditing])

  const handleKeyDown = (e: KeyboardEvent<HTMLSelectElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      onCommit()
      onTabNext?.()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      onCommit()
    }
  }

  const contextName = contexts.find((c) => c.id === value)?.name ?? (
    <span className="italic text-muted-foreground">—</span>
  )

  if (isEditing) {
    return (
      <select
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onCommit}
        className="w-full rounded border border-primary bg-surface px-2 py-1 text-sm text-foreground outline-none"
      >
        <option value="">Selecionar contexto</option>
        {contexts.map((ctx) => (
          <option key={ctx.id} value={ctx.id}>
            {ctx.name}
          </option>
        ))}
      </select>
    )
  }

  return (
    <span
      onDoubleClick={onEdit}
      title="Duplo clique para editar"
      className="flex cursor-pointer items-center gap-2 text-sm"
    >
      {value && contexts.find((c) => c.id === value)?.color && (
        <span
          className="inline-block size-3 shrink-0 rounded-full"
          style={{
            backgroundColor: contexts.find((c) => c.id === value)?.color
          }}
        />
      )}
      {contextName}
    </span>
  )
}
