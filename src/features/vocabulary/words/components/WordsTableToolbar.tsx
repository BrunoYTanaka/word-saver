import { useState, useRef, useEffect } from 'react'
import { Search, Plus, X, Check, Pencil, Trash2 } from 'lucide-react'
import type { FullContext } from '@/features/vocabulary'
import Button from '@/shared/ui/Button'
import { cn } from '@/shared/utils/cn'
import { useAppDispatch } from '@/store/hooks'
import {
  addContext,
  updateContext,
  deleteContext
} from '@/store/slices/contextsSlice'
import { fetchWords } from '@/store/slices/wordsSlice'
import { colors } from '@/features/vocabulary/contexts/constants/context'
import { ContextMenu } from '@/shared/ui/ContextMenu'

interface WordsTableToolbarProps {
  searchTerm: string
  onSearchChange: (v: string) => void
  selectedContextIds: string[]
  onContextToggle: (id: string) => void
  onClearFilters: () => void
  contexts: FullContext[]
  onAddRow: () => void
  activeFilterCount: number
}

export function WordsTableToolbar({
  searchTerm,
  onSearchChange,
  selectedContextIds,
  onContextToggle,
  onClearFilters,
  contexts,
  onAddRow,
  activeFilterCount
}: WordsTableToolbarProps) {
  const dispatch = useAppDispatch()

  // --- New context inline form ---
  const [showNewContext, setShowNewContext] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(colors[0])
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // --- Right-click context menu ---
  const [menuState, setMenuState] = useState<{
    ctx: FullContext
    x: number
    y: number
  } | null>(null)

  // --- Edit context inline form ---
  const [editingCtx, setEditingCtx] = useState<FullContext | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState(colors[0])
  const [editSaving, setEditSaving] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)

  // --- Delete confirmation ---
  const [confirmDelete, setConfirmDelete] = useState<FullContext | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (showNewContext) inputRef.current?.focus()
  }, [showNewContext])

  useEffect(() => {
    if (editingCtx) editInputRef.current?.focus()
  }, [editingCtx])

  const handleCreate = async () => {
    if (!newName.trim() || saving) return
    setSaving(true)
    try {
      await dispatch(
        addContext({ name: newName.trim(), color: newColor, icon: '📚' })
      ).unwrap()
      setNewName('')
      setNewColor(colors[0])
      setShowNewContext(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreate()
    if (e.key === 'Escape') {
      setShowNewContext(false)
      setNewName('')
    }
  }

  const handleEditSave = async () => {
    if (!editingCtx || !editName.trim() || editSaving) return
    setEditSaving(true)
    try {
      await dispatch(
        updateContext({
          ...editingCtx,
          name: editName.trim(),
          color: editColor
        })
      ).unwrap()
      setEditingCtx(null)
    } catch (err) {
      console.error(err)
    } finally {
      setEditSaving(false)
    }
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEditSave()
    if (e.key === 'Escape') setEditingCtx(null)
  }

  // Save on blur (clicking outside the edit form)
  const handleEditBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget)) return
    if (editName.trim()) {
      handleEditSave()
    } else {
      setEditingCtx(null)
    }
  }

  // Save or cancel new context on blur
  const handleNewContextBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget)) return
    if (newName.trim()) {
      handleCreate()
    } else {
      setShowNewContext(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDelete || deleting) return
    setDeleting(true)
    try {
      await dispatch(deleteContext(confirmDelete.id)).unwrap()
      // Sync words state — deleteContext removes associated words from DB
      await dispatch(fetchWords())
      setConfirmDelete(null)
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const openEdit = (ctx: FullContext) => {
    setConfirmDelete(null)
    setEditingCtx(ctx)
    setEditName(ctx.name)
    setEditColor(ctx.color ?? colors[0])
  }

  const openConfirmDelete = (ctx: FullContext) => {
    setEditingCtx(null)
    setConfirmDelete(ctx)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Top row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 sm:w-72">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar palavra ou definição…"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <Button variant="primary" size="sm" onClick={onAddRow} icon={<Plus />}>
          Adicionar Linha
        </Button>
      </div>

      {/* Context filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Contexto:</span>

        {contexts.map((ctx) => {
          // Render inline edit form instead of pill
          if (editingCtx?.id === ctx.id) {
            return (
              <div
                key={ctx.id}
                onBlur={handleEditBlur}
                className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-1"
              >
                <div className="flex items-center gap-1">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditColor(c)}
                      className="size-3.5 rounded-full transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c,
                        outline: editColor === c ? `2px solid ${c}` : 'none',
                        outlineOffset: '1px'
                      }}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">·</span>
                <input
                  ref={editInputRef}
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  className="w-36 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
                  disabled={editSaving}
                />
                <button
                  type="button"
                  onClick={handleEditSave}
                  disabled={!editName.trim() || editSaving}
                  className="text-success hover:opacity-80 disabled:opacity-30"
                >
                  <Check className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCtx(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              </div>
            )
          }

          // Render delete confirmation inline
          if (confirmDelete?.id === ctx.id) {
            return (
              <div
                key={ctx.id}
                className="bg-destructive/10 flex items-center gap-1.5 rounded-full border border-destructive px-2 py-1 text-xs"
              >
                <span className="text-destructive">
                  Remover &quot;{ctx.name}&quot;?
                </span>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="font-semibold text-destructive hover:opacity-80 disabled:opacity-50"
                >
                  {deleting ? '…' : 'Sim'}
                </button>
                <span className="text-muted-foreground">/</span>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Não
                </button>
              </div>
            )
          }

          // Normal pill with right-click support
          return (
            <button
              key={ctx.id}
              type="button"
              onClick={() => onContextToggle(ctx.id)}
              onContextMenu={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setMenuState({ ctx, x: e.clientX, y: e.clientY })
              }}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
                selectedContextIds.includes(ctx.id)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface-muted text-muted-foreground hover:bg-surface-hover'
              )}
            >
              {ctx.color && (
                <span
                  className="inline-block size-2 rounded-full"
                  style={{ backgroundColor: ctx.color }}
                />
              )}
              {ctx.name}
            </button>
          )
        })}

        {/* Inline new context form */}
        {showNewContext ? (
          <div
            onBlur={handleNewContextBlur}
            className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-1"
          >
            {/* Color picker swatches */}
            <div className="flex items-center gap-1">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  className="size-3.5 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: newColor === c ? `2px solid ${c}` : 'none',
                    outlineOffset: '1px'
                  }}
                />
              ))}
            </div>
            <span className="text-muted-foreground">·</span>
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nome do contexto…"
              className="w-36 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
              disabled={saving}
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newName.trim() || saving}
              className="text-success hover:opacity-80 disabled:opacity-30"
            >
              <Check className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewContext(false)
                setNewName('')
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowNewContext(true)}
            className="flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="size-3" />
            Novo
          </button>
        )}

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onClearFilters}
            className="flex items-center gap-1 rounded-full bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground hover:bg-destructive-hover"
          >
            <X className="size-3" />
            Limpar ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Right-click context menu */}
      {menuState && (
        <ContextMenu
          x={menuState.x}
          y={menuState.y}
          onClose={() => setMenuState(null)}
          items={[
            {
              label: 'Editar',
              icon: <Pencil className="size-4" />,
              onClick: () => openEdit(menuState.ctx)
            },
            {
              label: 'Remover',
              icon: <Trash2 className="size-4" />,
              variant: 'danger',
              onClick: () => openConfirmDelete(menuState.ctx)
            }
          ]}
        />
      )}
    </div>
  )
}
