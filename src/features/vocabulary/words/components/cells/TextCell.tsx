import { useRef, useEffect, KeyboardEvent } from 'react'
import { cn } from '@/shared/utils/cn'

interface TextCellProps {
  value: string
  isEditing: boolean
  onEdit: () => void
  onChange: (value: string) => void
  onCommit: () => void
  onCancel: () => void
  onTabNext?: () => void
  placeholder?: string
  required?: boolean
}

export function TextCell({
  value,
  isEditing,
  onEdit,
  onChange,
  onCommit,
  onCancel,
  onTabNext,
  placeholder = '',
  required = false
}: TextCellProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onCommit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      onCommit()
      onTabNext?.()
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onCommit}
        placeholder={placeholder}
        className={cn(
          'w-full rounded border border-primary bg-surface px-2 py-1 text-sm text-foreground outline-none',
          required && !value && 'border-destructive'
        )}
      />
    )
  }

  return (
    <span
      onDoubleClick={onEdit}
      title="Duplo clique para editar"
      className={cn(
        'block cursor-pointer truncate text-sm text-foreground',
        !value && 'text-muted-foreground italic'
      )}
    >
      {value || placeholder}
    </span>
  )
}
