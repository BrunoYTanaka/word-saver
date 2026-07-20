import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import { DndContext, closestCenter } from '@dnd-kit/core'
import {
  TableHead,
  TableBody,
  TablePagination,
  HeaderCheckbox
} from '@/shared/ui/table'
import { useWordsTable, type PendingChange } from '../hooks/useWordsTable'
import { useWordsTableColumns } from '../hooks/useWordsTableColumns'
import { WordsTableBulkBar } from './WordsTableBulkBar'
import type { FullWord } from '../types/word'
import type { FullContext } from '@/features/vocabulary'

export type { PendingChange }

interface WordsTableViewProps {
  words: FullWord[]
  contexts: FullContext[]
  pageSize: number
  onPageSizeChange: (size: number) => void
  globalFilter: string
  selectedContextIds: string[]
  onPendingChange: (changes: PendingChange[]) => void
  onDeleteWord: (id: string) => void
  onAutoSaveWord: (word: FullWord) => Promise<FullWord | null>
  onCreateContext: (name: string) => Promise<string | null>
  /** Increment to trigger adding a new blank row */
  addRowSignal?: number
}

const SELF_RENDERED = [
  'select',
  'color',
  'actions',
  'word',
  'definition',
  'contextId',
  'tags'
]

export function WordsTableView({
  words,
  contexts,
  pageSize,
  onPageSizeChange,
  globalFilter,
  selectedContextIds,
  onPendingChange,
  onDeleteWord,
  onAutoSaveWord,
  onCreateContext,
  addRowSignal = 0
}: WordsTableViewProps) {
  const state = useWordsTable({
    initialWords: words,
    contexts,
    pageSize,
    globalFilter,
    selectedContextIds,
    addRowSignal,
    onPendingChange,
    onDeleteWord,
    onAutoSaveWord
  })

  const columns = useWordsTableColumns({
    contexts,
    editing: state.editing,
    deletingId: state.deletingId,
    startEdit: state.startEdit,
    stopEdit: state.stopEdit,
    editNextCell: state.editNextCell,
    updateRow: state.updateRow,
    deleteRow: state.deleteRow,
    setDeletingId: state.setDeletingId,
    selectedIds: state.selectedIds,
    toggleRowSelected: state.toggleRowSelected,
    onCreateContext
  })

  const table = useReactTable({
    data: state.pagedRows,
    columns,
    state: { sorting: state.sorting },
    onSortingChange: state.setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualFiltering: true
  })

  const emptyMessage =
    state.filteredRows.length === 0 &&
    (globalFilter || selectedContextIds.length > 0)
      ? 'Nenhuma palavra encontrada com os filtros aplicados.'
      : 'Nenhuma palavra cadastrada. Clique em "+ Adicionar Linha" para começar.'

  return (
    <div className="flex flex-col gap-3">
      <DndContext
        sensors={state.sensors}
        collisionDetection={closestCenter}
        onDragEnd={state.handleDragEnd}
      >
        <div className="overflow-auto rounded-lg border border-border bg-surface shadow-sm">
          <table className="w-full min-w-[640px] table-auto border-separate border-spacing-0 text-left">
            <TableHead
              headerGroups={table.getHeaderGroups()}
              customColumns={['select', 'color', 'actions']}
              headerCheckbox={
                <HeaderCheckbox
                  checked={state.isAllPageSelected}
                  indeterminate={state.isPageSelectionIndeterminate}
                  onChange={state.toggleSelectAllOnPage}
                  label="Selecionar todas as linhas desta página"
                />
              }
            />
            <TableBody
              rows={table.getRowModel().rows}
              itemIds={state.pagedRows.map((r) => r.id)}
              colCount={columns.length}
              emptyMessage={emptyMessage}
              selfRenderedColumns={SELF_RENDERED}
            />
          </table>
        </div>
      </DndContext>

      <TablePagination
        currentPage={state.safePageIndex + 1}
        totalPages={state.totalPages}
        pageSize={pageSize}
        totalRows={state.filteredRows.length}
        filteredRows={state.filteredRows.length}
        onPageChange={(p) => state.setPageIndex(p - 1)}
        onPageSizeChange={onPageSizeChange}
        rowLabel="palavra"
      />

      <WordsTableBulkBar
        selectedCount={state.selectedIds.size}
        contexts={contexts}
        onMoveToContext={state.bulkMoveToContext}
        onClearSelection={state.clearSelection}
        deleteConfirming={state.bulkDeleteConfirming}
        onRequestDelete={state.requestBulkDelete}
        onConfirmDelete={state.confirmBulkDelete}
        onCancelDelete={state.cancelBulkDelete}
      />
    </div>
  )
}
