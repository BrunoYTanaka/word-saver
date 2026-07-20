import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

interface SortableRowProps {
  id: string
  rowColor?: string
  children: React.ReactNode
}

export function SortableRow({ id, rowColor, children }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: rowColor ? `${rowColor}18` : undefined
      }}
      className="group transition-colors hover:bg-surface-muted"
    >
      <td
        style={{ width: '2rem', minWidth: '2rem', padding: '0.75rem 0.5rem' }}
        className="border-b border-border"
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          style={{
            display: 'flex',
            alignItems: 'center',
            color: '#9ca3af',
            cursor: 'grab'
          }}
          aria-label="Arraste para reordenar"
        >
          <GripVertical
            style={{ width: '1rem', height: '1rem', flexShrink: 0 }}
          />
        </button>
      </td>
      {children}
    </tr>
  )
}
