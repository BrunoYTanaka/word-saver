import { useRef } from 'react'
import { Trash2 } from 'lucide-react'
import { DeletePopover } from '@/shared/ui/table'

interface ActionCellProps {
  rowId: string
  isDeletingThis: boolean
  onDeleteClick: () => void
  onConfirm: () => void
  onCancel: () => void
}

export function ActionCell({
  rowId: _rowId,
  isDeletingThis,
  onDeleteClick,
  onConfirm,
  onCancel
}: ActionCellProps) {
  const btnRef = useRef<HTMLButtonElement>(null)
  return (
    <td
      style={{ width: '4rem', minWidth: '4rem' }}
      className="sticky right-0 border-b border-border bg-surface p-3"
    >
      <div className="flex items-center justify-center">
        <button
          ref={btnRef}
          type="button"
          title="Excluir palavra"
          onClick={onDeleteClick}
          className="rounded-md p-1 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
        >
          <Trash2 className="size-4" />
        </button>
        {isDeletingThis && (
          <DeletePopover
            anchorRef={btnRef}
            onConfirm={onConfirm}
            onCancel={onCancel}
          />
        )}
      </div>
    </td>
  )
}
