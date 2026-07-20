import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent
} from 'react'
import { createPortal } from 'react-dom'
import type { FullContext } from '@/features/vocabulary'
import { Tooltip } from '@/shared/ui/Tooltip'
import { cn } from '@/shared/utils/cn'

interface ContextComboboxCellProps {
  value: string
  isEditing: boolean
  contexts: FullContext[]
  onEdit: () => void
  onChange: (value: string) => void
  onCommit: () => void
  onCancel: () => void
  onTabNext?: () => void
  onCreateContext: (name: string) => Promise<string | null>
}

type ListItem =
  | { type: 'context'; context: FullContext }
  | { type: 'create'; name: string }

export function ContextComboboxCell({
  value,
  isEditing,
  contexts,
  onEdit,
  onChange,
  onCommit,
  onCancel,
  onTabNext,
  onCreateContext
}: ContextComboboxCellProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const suppressBlurRef = useRef(false)

  const [inputValue, setInputValue] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [creating, setCreating] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })

  const resolvedContext = contexts.find((c) => c.id === value)

  const trimmed = inputValue.trim()
  const filtered = contexts.filter((c) =>
    c.name.toLowerCase().includes(trimmed.toLowerCase())
  )
  const hasExactMatch = contexts.some(
    (c) => c.name.trim().toLowerCase() === trimmed.toLowerCase()
  )
  const items: ListItem[] = [
    ...filtered.map((context) => ({ type: 'context' as const, context })),
    ...(trimmed.length > 0 && !hasExactMatch
      ? [{ type: 'create' as const, name: trimmed }]
      : [])
  ]

  useEffect(() => {
    if (!isEditing) return
    setInputValue(resolvedContext?.name ?? '')
    setHighlightedIndex(0)
    inputRef.current?.focus()
    inputRef.current?.select()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing])

  // Anchor the dropdown to the input, viewport-relative (position: fixed —
  // no scrollX/scrollY math needed)
  useLayoutEffect(() => {
    if (!isEditing || !wrapperRef.current) return
    const rect = wrapperRef.current.getBoundingClientRect()
    setPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 200)
    })
  }, [isEditing])

  // Clamp the dropdown to the viewport once its real size is known — the
  // Contexto column sits mid/right in a wide, horizontally-scrollable table,
  // so an unclamped dropdown can render past the right or bottom edge.
  useEffect(() => {
    const el = listRef.current
    const anchor = wrapperRef.current
    if (!el || !anchor) return
    const { width, height } = el.getBoundingClientRect()
    const anchorRect = anchor.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    const left = Math.max(8, Math.min(pos.left, vw - width - 8))
    const fitsBelow = anchorRect.bottom + 4 + height <= vh - 8
    const top = fitsBelow ? pos.top : Math.max(8, anchorRect.top - height - 4)

    el.style.left = `${left}px`
    el.style.top = `${top}px`
  }, [pos, items.length])

  const commitItem = async (item: ListItem | undefined) => {
    if (!item) return
    if (item.type === 'context') {
      onChange(item.context.id)
    } else {
      setCreating(true)
      const newId = await onCreateContext(item.name)
      setCreating(false)
      if (newId) onChange(newId)
    }
  }

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      suppressBlurRef.current = true
      await commitItem(items[highlightedIndex])
      onCommit()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      suppressBlurRef.current = true
      await commitItem(items[highlightedIndex])
      onCommit()
      onTabNext?.()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.min(i + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.max(i - 1, 0))
    }
  }

  const handleBlur = () => {
    if (suppressBlurRef.current) {
      suppressBlurRef.current = false
      return
    }
    onCancel()
  }

  const handleOptionClick = async (index: number, item: ListItem) => {
    suppressBlurRef.current = true
    setHighlightedIndex(index)
    await commitItem(item)
    onCommit()
  }

  if (isEditing) {
    return (
      <div ref={wrapperRef} className="w-full">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          disabled={creating}
          onChange={(e) => {
            setInputValue(e.target.value)
            setHighlightedIndex(0)
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Buscar ou criar contexto…"
          className="w-full rounded border border-primary bg-surface px-2 py-1 text-sm text-foreground outline-none disabled:opacity-60"
        />
        {items.length > 0 &&
          createPortal(
            <ul
              ref={listRef}
              role="listbox"
              style={{
                position: 'fixed',
                top: pos.top,
                left: pos.left,
                width: pos.width
              }}
              className="z-50 max-h-56 overflow-auto rounded-md border border-border bg-surface py-1 shadow-lg"
            >
              {items.map((item, index) => {
                const highlighted = index === highlightedIndex
                if (item.type === 'context') {
                  return (
                    <li key={item.context.id}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleOptionClick(index, item)}
                        className={cn(
                          'flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm',
                          highlighted
                            ? 'bg-primary-soft text-foreground'
                            : 'text-foreground hover:bg-surface-hover'
                        )}
                      >
                        {item.context.color && (
                          <span
                            className="inline-block size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: item.context.color }}
                          />
                        )}
                        <span className="truncate">{item.context.name}</span>
                      </button>
                    </li>
                  )
                }
                return (
                  <li key="create">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleOptionClick(index, item)}
                      disabled={creating}
                      className={cn(
                        'w-full px-3 py-1.5 text-left text-sm font-medium text-primary disabled:opacity-60',
                        highlighted
                          ? 'bg-primary-soft'
                          : 'hover:bg-surface-hover'
                      )}
                    >
                      {creating ? 'Criando…' : `+ Criar "${item.name}"`}
                    </button>
                  </li>
                )
              })}
            </ul>,
            document.body
          )}
      </div>
    )
  }

  return (
    <Tooltip content={resolvedContext?.name ?? ''}>
      <span
        onDoubleClick={onEdit}
        className="flex w-full cursor-pointer items-center gap-2 overflow-hidden text-sm"
      >
        {resolvedContext?.color && (
          <span
            className="inline-block size-3 shrink-0 rounded-full"
            style={{ backgroundColor: resolvedContext.color }}
          />
        )}
        <span className="truncate">
          {resolvedContext?.name ?? (
            <span className="italic text-muted-foreground">—</span>
          )}
        </span>
      </span>
    </Tooltip>
  )
}
