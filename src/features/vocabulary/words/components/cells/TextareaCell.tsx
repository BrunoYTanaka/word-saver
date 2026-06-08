import { useRef, useEffect, KeyboardEvent } from 'react'

interface TextareaCellProps {
  value: string
  isEditing: boolean
  onEdit: () => void
  onChange: (value: string) => void
  onCommit: () => void
  onCancel: () => void
  onTabNext?: () => void
  placeholder?: string
}

export function TextareaCell({
  value,
  isEditing,
  onEdit,
  onChange,
  onCommit,
  onCancel,
  onTabNext,
  placeholder = ''
}: TextareaCellProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing) {
      ref.current?.focus()
      ref.current?.select()
    }
  }, [isEditing])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      onCommit()
      onTabNext?.()
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onCommit()
    }
  }

  if (isEditing) {
    return (
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onCommit}
        placeholder={placeholder}
        rows={2}
        className="w-full resize-none rounded border border-primary bg-surface px-2 py-1 text-sm text-foreground outline-none"
      />
    )
  }

  return (
    <span
      onDoubleClick={onEdit}
      title="Duplo clique para editar"
      className="block cursor-pointer truncate text-sm text-foreground"
    >
      {value || (
        <span className="italic text-muted-foreground">{placeholder}</span>
      )}
    </span>
  )
}
