import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { FullWord } from '../types/word'
import type { FullContext } from '@/features/vocabulary'
import { TextCell } from '../components/cells/TextCell'
import { TextareaCell } from '../components/cells/TextareaCell'
import { SelectCell } from '../components/cells/SelectCell'
import { TagsCell } from '../components/cells/TagsCell'
import { ColorCell } from '../components/cells/ColorCell'
import { ActionCell } from '../components/cells/ActionCell'
import { RowCheckboxCell } from '../components/cells/RowCheckboxCell'
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
  selectedIds: Set<string>
  toggleRowSelected: (id: string) => void
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
  setDeletingId,
  selectedIds,
  toggleRowSelected
}: UseWordsTableColumnsOptions): ColumnDef<FullWord>[] {
  return useMemo(
    () => [
      {
        id: 'select',
        header: '',
        size: 40,
        enableSorting: false,
        cell: ({ row }) => (
          <RowCheckboxCell
            word={row.original.word}
            checked={selectedIds.has(row.original.id)}
            onChange={() => toggleRowSelected(row.original.id)}
          />
        )
      },
      {
        id: 'color',
        header: '',
        size: 40,
        enableSorting: false,
        cell: ({ row }) => (
          <td className="border-b border-border px-2 py-3">
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
            <td
              className="border-b border-border px-4 py-3"
              style={{ maxWidth: '200px' }}
            >
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
            <td
              className="border-b border-border px-4 py-3"
              style={{ maxWidth: '360px' }}
            >
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
            <td
              className="border-b border-border px-4 py-3"
              style={{ maxWidth: '160px' }}
            >
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
            <td
              className="border-b border-border px-4 py-3"
              style={{ maxWidth: '200px' }}
            >
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
        header: 'Ações',
        size: 64,
        enableSorting: false,
        cell: ({ row }) => (
          <ActionCell
            rowId={row.original.id}
            isDeletingThis={deletingId === row.original.id}
            onDeleteClick={() => setDeletingId(row.original.id)}
            onConfirm={() => deleteRow(row.original.id)}
            onCancel={() => setDeletingId(null)}
          />
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
      setDeletingId,
      selectedIds,
      toggleRowSelected
    ]
  )
}
