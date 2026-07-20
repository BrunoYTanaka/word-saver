import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import Button from '@/shared/ui/Button'
import type { FullContext } from '@/features/vocabulary'

interface WordsTableBulkBarProps {
  selectedCount: number
  contexts: FullContext[]
  onMoveToContext: (contextId: string) => void
  onClearSelection: () => void
  deleteConfirming: boolean
  onRequestDelete: () => void
  onConfirmDelete: () => void
  onCancelDelete: () => void
}

export function WordsTableBulkBar({
  selectedCount,
  contexts,
  onMoveToContext,
  onClearSelection,
  deleteConfirming,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete
}: WordsTableBulkBarProps) {
  const [moveValue, setMoveValue] = useState('')

  if (selectedCount === 0) return null

  const handleMoveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const contextId = e.target.value
    setMoveValue(contextId)
    if (contextId) {
      onMoveToContext(contextId)
      setMoveValue('')
    }
  }

  return (
    <div
      role="region"
      aria-label="Ações em massa"
      className="fixed inset-x-0 bottom-32 z-30 flex justify-center md:bottom-16"
    >
      <div className="mx-4 mb-4 flex w-full max-w-2xl flex-wrap items-center justify-between gap-3 rounded-xl border border-primary bg-surface px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3 text-sm text-foreground">
          <span aria-live="polite">
            {selectedCount}{' '}
            {selectedCount === 1 ? 'selecionada' : 'selecionadas'}
          </span>
          <button
            type="button"
            onClick={onClearSelection}
            className="text-muted-foreground hover:text-foreground"
          >
            Limpar seleção
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={moveValue}
            onChange={handleMoveChange}
            title="Mover selecionadas para outro contexto"
            className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-foreground outline-none"
          >
            <option value="" disabled>
              Mover para contexto…
            </option>
            {contexts.map((ctx) => (
              <option key={ctx.id} value={ctx.id}>
                {ctx.name}
              </option>
            ))}
          </select>

          {deleteConfirming ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-destructive">Excluir {selectedCount}?</span>
              <button
                type="button"
                onClick={onConfirmDelete}
                className="font-semibold text-destructive hover:opacity-80"
              >
                Sim
              </button>
              <button
                type="button"
                onClick={onCancelDelete}
                className="text-muted-foreground hover:text-foreground"
              >
                Não
              </button>
            </div>
          ) : (
            <span title="Excluir selecionadas (Delete)">
              <Button
                variant="danger"
                size="sm"
                onClick={onRequestDelete}
                icon={<Trash2 />}
              >
                Excluir selecionadas
              </Button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
