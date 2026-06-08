import { useMemo } from 'react'
import { Trash2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { FullWord } from '../types/word'
import type { FullContext } from '@/features/vocabulary'
import { DeletePopover } from '@/shared/ui/table'
import { TextCell } from '../components/cells/TextCell'
import { TextareaCell } from '../components/cells/TextareaCell'
import { SelectCell } from '../components/cells/SelectCell'
import { TagsCell } from '../components/cells/TagsCell'
import { ColorCell } from '../components/cells/ColorCell'
import type { EditingCell } from './useWordsTable'

interface UseWordsTableColumnsOptions {
  contexts: FullContext[]
  editing: EditingCell | null
  deletingId: string | null
  startEdit: (rowId: string, field: keyof FullWord) => void
  stopEdit: () => void
  editNextCell: (rowId: string, field: keyof FullWord) => void
  updateRow: (id: string, updates: Partial<FullWord>) => void
  deleteRow: (id: string) => void
  setDeletingId: (id: string | null) => void
}

export function useWordsTableColumns({
  contexts,
  editing,
  deletingId,
  startEdit,
  stopEdit,
  editNextCell,
  updateRow,
  deleteRow,
  setDeletingId
}: UseWordsTableColumnsOptions): ColumnDef<FullWord>[] {
  return useMemo(
    () => [
      {
        id: 'color',
        header: '',
        size: 40,
        enableSorting: false,
        cell: ({ row }) => (
          <td className="px-2 py-3">
            <ColorCell
              value={row.original.color}
              onChange={(color) => updateRow(row.original.id, { color })}
            />
          </td>
        )
      },
      {
        accessorKey: 'word',
        header: 'Palavra',
        cell: ({ row }) => {
          const isEd =
            editing?.rowId === row.original.id && editing.field === 'word'
          return (
            <td className="px-4 py-3">
              <TextCell
                value={row.original.word}
                isEditing={isEd}
                onEdit={() => startEdit(row.original.id, 'word')}
                onChange={(v) => updateRow(row.original.id, { word: v })}
                onCommit={stopEdit}
                onCancel={stopEdit}
                onTabNext={() => editNextCell(row.original.id, 'word')}
                placeholder="Palavra"
                required
              />
            </td>
          )
        }
      },
      {
        accessorKey: 'definition',
        header: 'Definição',
        cell: ({ row }) => {
          const isEd =
            editing?.rowId === row.original.id && editing.field === 'definition'
          return (
            <td className="px-4 py-3">
              <TextareaCell
                value={row.original.definition ?? ''}
                isEditing={isEd}
                onEdit={() => startEdit(row.original.id, 'definition')}
                onChange={(v) => updateRow(row.original.id, { definition: v })}
                onCommit={stopEdit}
                onCancel={stopEdit}
                onTabNext={() => editNextCell(row.original.id, 'definition')}
                placeholder="Definição"
              />
            </td>
          )
        }
      },
      {
        accessorKey: 'contextId',
        header: 'Contexto',
        cell: ({ row }) => {
          const isEd =
            editing?.rowId === row.original.id && editing.field === 'contextId'
          return (
            <td className="px-4 py-3">
              <SelectCell
                value={row.original.contextId}
                isEditing={isEd}
                contexts={contexts}
                onEdit={() => startEdit(row.original.id, 'contextId')}
                onChange={(v) => updateRow(row.original.id, { contextId: v })}
                onCommit={stopEdit}
                onCancel={stopEdit}
                onTabNext={() => editNextCell(row.original.id, 'contextId')}
              />
            </td>
          )
        }
      },
      {
        accessorKey: 'tags',
        header: 'Tags',
        enableSorting: false,
        cell: ({ row }) => {
          const isEd =
            editing?.rowId === row.original.id && editing.field === 'tags'
          return (
            <td className="px-4 py-3">
              <TagsCell
                value={row.original.tags ?? []}
                isEditing={isEd}
                onEdit={() => startEdit(row.original.id, 'tags')}
                onChange={(v) => updateRow(row.original.id, { tags: v })}
                onCommit={stopEdit}
                onCancel={stopEdit}
                onTabNext={() => editNextCell(row.original.id, 'tags')}
              />
            </td>
          )
        }
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        enableSorting: false,
        cell: ({ row }) => (
          <td className="sticky right-0 bg-surface p-3">
            <div className="relative flex items-center justify-end">
              <button
                type="button"
                title="Excluir"
                onClick={() => setDeletingId(row.original.id)}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="size-4" />
              </button>
              {deletingId === row.original.id && (
                <DeletePopover
                  onConfirm={() => deleteRow(row.original.id)}
                  onCancel={() => setDeletingId(null)}
                />
              )}
            </div>
          </td>
        )
      }
    ],
    [
      contexts,
      editing,
      deletingId,
      startEdit,
      stopEdit,
      editNextCell,
      updateRow,
      deleteRow,
      setDeletingId
    ]
  )
}
