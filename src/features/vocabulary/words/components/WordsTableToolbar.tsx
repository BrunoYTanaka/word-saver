import { Search, Plus, X } from 'lucide-react'
import type { FullContext } from '@/features/vocabulary'
import Button from '@/shared/ui/Button'
import { cn } from '@/shared/utils/cn'

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
      {contexts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Contexto:</span>
          {contexts.map((ctx) => (
            <button
              key={ctx.id}
              type="button"
              onClick={() => onContextToggle(ctx.id)}
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
          ))}
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
      )}
    </div>
  )
}
