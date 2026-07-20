import { Save, Trash2, AlertCircle } from 'lucide-react'
import Button from '@/shared/ui/Button'

interface WordsTableSaveBarProps {
  pendingCount: number
  isSaving: boolean
  onSave: () => void
  onDiscard: () => void
}

export function WordsTableSaveBar({
  pendingCount,
  isSaving,
  onSave,
  onDiscard
}: WordsTableSaveBarProps) {
  if (pendingCount === 0) return null

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 flex justify-center md:bottom-0">
      <div className="mx-4 mb-4 flex w-full max-w-2xl items-center justify-between gap-4 rounded-xl border border-warning bg-surface px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2 text-sm text-warning">
          <AlertCircle className="size-4 shrink-0" />
          <span>
            {pendingCount}{' '}
            {pendingCount === 1 ? 'alteração pendente' : 'alterações pendentes'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDiscard}
            disabled={isSaving}
            icon={<Trash2 />}
          >
            Descartar
          </Button>
          <span title="Salvar (Ctrl/Cmd+S)">
            <Button
              variant="primary"
              size="sm"
              onClick={onSave}
              loading={isSaving}
              icon={<Save />}
            >
              Salvar Alterações
            </Button>
          </span>
        </div>
      </div>
    </div>
  )
}
