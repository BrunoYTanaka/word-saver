import { useRef, useEffect, KeyboardEvent, useState } from 'react'
import { X } from 'lucide-react'

interface TagsCellProps {
  value: string[]
  isEditing: boolean
  onEdit: () => void
  onChange: (value: string[]) => void
  onCommit: () => void
  onCancel: () => void
  onTabNext?: () => void
}

export function TagsCell({
  value,
  isEditing,
  onEdit,
  onChange,
  onCommit,
  onCancel,
  onTabNext
}: TagsCellProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInputValue('')
  }

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (inputValue) addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1))
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      if (inputValue) addTag(inputValue)
      onCommit()
      onTabNext?.()
    }
  }

  if (isEditing) {
    return (
      <div className="flex min-h-[32px] flex-wrap items-center gap-1 rounded border border-primary bg-surface px-2 py-1">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="leading-none hover:text-destructive"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue) addTag(inputValue)
            onCommit()
          }}
          placeholder={value.length === 0 ? 'Adicionar tag…' : ''}
          className="min-w-[80px] flex-1 bg-transparent text-sm text-foreground outline-none"
        />
      </div>
    )
  }

  return (
    <div
      onDoubleClick={onEdit}
      title="Duplo clique para editar"
      className="flex cursor-pointer flex-wrap gap-1"
    >
      {value.length > 0 ? (
        value.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary"
          >
            {tag}
          </span>
        ))
      ) : (
        <span className="text-sm italic text-muted-foreground">—</span>
      )}
    </div>
  )
}
