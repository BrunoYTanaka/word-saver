import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type VisibilityState
} from '@tanstack/react-table'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import type { FullWord } from '../types/word'
import type { FullContext } from '@/features/vocabulary'
import { TextCell } from './cells/TextCell'
import { TextareaCell } from './cells/TextareaCell'
import { SelectCell } from './cells/SelectCell'
import { TagsCell } from './cells/TagsCell'
import { ColorCell } from './cells/ColorCell'

// ─── Pending changes ────────────────────────────────────────────────────────
type ChangeType = 'create' | 'update' | 'delete'
export interface PendingChange {
  type: ChangeType
  word: FullWord
}

// ─── Editing state ───────────────────────────────────────────────────────────
interface EditingCell {
  rowId: string
  field: keyof FullWord | null
}

// ─── Sortable row wrapper ─────────────────────────────────────────────────────
function SortableRow({
  id,
  children,
  rowColor
}: {
  id: string
  children: React.ReactNode
  rowColor?: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <tr
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: rowColor ? `${rowColor}18` : undefined
      }}
      className="group border-b border-border transition-colors hover:bg-surface-muted"
    >
      {/* Drag handle */}
      <td className="w-8 px-2 py-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100"
          tabIndex={-1}
        >
          <GripVertical className="size-4" />
        </button>
      </td>
      {children}
    </tr>
  )
}

// ─── Delete confirmation popover ──────────────────────────────────────────────
function DeletePopover({
  onConfirm,
  onCancel
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onCancel()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onCancel])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-8 z-20 flex flex-col gap-2 rounded-lg border border-border bg-surface p-3 shadow-lg"
    >
      <p className="text-xs font-medium text-foreground">Confirmar exclusão?</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-border px-2 py-1 text-xs hover:bg-surface-muted"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded bg-destructive px-2 py-1 text-xs text-destructive-foreground hover:bg-destructive-hover"
        >
          Excluir
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
interface WordsTableProps {
  words: FullWord[]
  contexts: FullContext[]
  pageSize: number
  onPageSizeChange: (size: number) => void
  onPendingChange: (changes: PendingChange[]) => void
  externalRows: FullWord[]
  setExternalRows: (rows: FullWord[]) => void
}

export function WordsTable({
  words,
  contexts,
  pageSize,
  onPageSizeChange,
  onPendingChange,
  externalRows,
  setExternalRows
}: WordsTableProps) {
  const [rows, setRows] = useState<FullWord[]>([])
  const [originalRows, setOriginalRows] = useState<FullWord[]>([])
  const [editing, setEditing] = useState<EditingCell | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize })
  const prevEditingRef = useRef<EditingCell | null>(null)

  // Sync external rows ↔ internal
  useEffect(() => {
    const sorted = [...words].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    setRows(sorted)
    setOriginalRows(sorted)
    setExternalRows(sorted)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words])

  useEffect(() => {
    setPagination((p) => ({ ...p, pageSize }))
  }, [pageSize])

  // Compute pending changes whenever rows change
  useEffect(() => {
    const changes: PendingChange[] = []
    const originalMap = new Map(originalRows.map((w) => [w.id, w]))

    rows.forEach((row) => {
      if (!originalMap.has(row.id)) {
        changes.push({ type: 'create', word: row })
      } else {
        const orig = originalMap.get(row.id)!
        if (JSON.stringify(orig) !== JSON.stringify(row)) {
          changes.push({ type: 'update', word: row })
        }
      }
    })

    originalRows.forEach((orig) => {
      if (!rows.find((r) => r.id === orig.id)) {
        changes.push({ type: 'delete', word: orig })
      }
    })

    onPendingChange(changes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows])

  const updateRow = useCallback((id: string, updates: Partial<FullWord>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)))
  }, [])

  const deleteRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
    setDeletingId(null)
  }, [])

  const startEdit = useCallback((rowId: string, field: keyof FullWord) => {
    setEditing({ rowId, field })
  }, [])

  const stopEdit = useCallback(() => {
    setEditing(null)
  }, [])

  const editNextCell = useCallback((rowId: string, field: keyof FullWord) => {
    const editOrder: (keyof FullWord)[] = [
      'word',
      'definition',
      'contextId',
      'tags'
    ]
    const idx = editOrder.indexOf(field)
    if (idx < editOrder.length - 1) {
      setEditing({ rowId, field: editOrder[idx + 1] })
    } else {
      setEditing(null)
    }
  }, [])

  // Paste handler for spreadsheet-like paste
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text')
      if (!text || !text.includes('\t')) return

      const lines = text.trim().split('\n')
      const newRows: FullWord[] = lines
        .map((line) => {
          const [word, definition, tagsRaw] = line.split('\t')
          return {
            id: crypto.randomUUID(),
            word: word?.trim() ?? '',
            definition: definition?.trim() ?? '',
            contextId: contexts[0]?.id ?? '',
            tags: tagsRaw
              ? tagsRaw
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
              : [],
            createdAt: new Date().toISOString(),
            reviewCount: 0,
            lastReviewed: null,
            difficulty: 'medium' as const,
            order: rows.length
          }
        })
        .filter((r) => r.word)

      if (newRows.length > 0) {
        e.preventDefault()
        setRows((prev) => [...newRows, ...prev])
      }
    }
    document.addEventListener('paste', handler)
    return () => document.removeEventListener('paste', handler)
  }, [contexts, rows.length])

  // Track editing to cancel on outside navigation
  useEffect(() => {
    prevEditingRef.current = editing
  }, [editing])

  // ─── DnD sensors ─────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setRows((items) => {
        const oldIdx = items.findIndex((i) => i.id === active.id)
        const newIdx = items.findIndex((i) => i.id === over.id)
        const reordered = arrayMove(items, oldIdx, newIdx)
        return reordered.map((item, idx) => ({ ...item, order: idx }))
      })
    }
  }

  // ─── Column definitions ───────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<FullWord>[]>(
    () => [
      {
        id: 'color',
        header: '',
        size: 40,
        enableSorting: false,
        cell: ({ row }) => (
          <ColorCell
            value={row.original.color}
            onChange={(color) => updateRow(row.original.id, { color })}
          />
        )
      },
      {
        accessorKey: 'word',
        header: ({ column }) => (
          <SortableHeader label="Palavra" column={column} />
        ),
        cell: ({ row }) => {
          const isEd =
            editing?.rowId === row.original.id && editing.field === 'word'
          return (
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
          )
        }
      },
      {
        accessorKey: 'definition',
        header: ({ column }) => (
          <SortableHeader label="Definição" column={column} />
        ),
        cell: ({ row }) => {
          const isEd =
            editing?.rowId === row.original.id && editing.field === 'definition'
          return (
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
          )
        }
      },
      {
        accessorKey: 'contextId',
        header: ({ column }) => (
          <SortableHeader label="Contexto" column={column} />
        ),
        cell: ({ row }) => {
          const isEd =
            editing?.rowId === row.original.id && editing.field === 'contextId'
          return (
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
            <TagsCell
              value={row.original.tags ?? []}
              isEditing={isEd}
              onEdit={() => startEdit(row.original.id, 'tags')}
              onChange={(v) => updateRow(row.original.id, { tags: v })}
              onCommit={stopEdit}
              onCancel={stopEdit}
              onTabNext={() => editNextCell(row.original.id, 'tags')}
            />
          )
        }
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="relative flex items-center justify-end">
            <button
              type="button"
              title="Excluir palavra"
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
        )
      }
    ],
    [
      editing,
      contexts,
      updateRow,
      startEdit,
      stopEdit,
      editNextCell,
      deleteRow,
      deletingId
    ]
  )

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, columnVisibility, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: (v) => {
      setGlobalFilter(v)
      setPagination((p) => ({ ...p, pageIndex: 0 }))
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false
  })

  // Expose filtered row count and pagination info for parent
  const filteredRowCount = table.getFilteredRowModel().rows.length
  const totalPages = table.getPageCount()
  const currentPage = pagination.pageIndex + 1

  // Expose to parent via externalRows (used for save)
  useEffect(() => {
    setExternalRows(rows)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows])

  return {
    table,
    rows,
    setRows,
    originalRows,
    setOriginalRows,
    globalFilter,
    setGlobalFilter,
    filteredRowCount,
    totalPages,
    currentPage,
    setPagination,
    pagination,
    onPageSizeChange
  }
}

// ─── Sortable header helper ───────────────────────────────────────────────────
function SortableHeader({
  label,
  column
}: {
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  column: any
}) {
  const sorted = column.getIsSorted()
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className="flex items-center gap-1 text-sm font-normal text-muted-foreground hover:text-foreground"
    >
      {label}
      {sorted === 'asc' ? (
        <ArrowUp className="size-3" />
      ) : sorted === 'desc' ? (
        <ArrowDown className="size-3" />
      ) : (
        <ArrowUpDown className="size-3 opacity-40" />
      )}
    </button>
  )
}

// ─── Presentational table ─────────────────────────────────────────────────────
interface WordsTableViewProps {
  words: FullWord[]
  contexts: FullContext[]
  pageSize: number
  onPageSizeChange: (size: number) => void
  globalFilter: string
  onGlobalFilterChange: (v: string) => void
  selectedContextIds: string[]
  onPendingChange: (changes: PendingChange[]) => void
  onRowsChange: (rows: FullWord[]) => void
  onAddRow: () => void
}

export function WordsTableView({
  words: wordsProp,
  contexts,
  pageSize,
  onPageSizeChange,
  globalFilter: externalFilter,
  onGlobalFilterChange,
  selectedContextIds,
  onPendingChange,
  onRowsChange,
  onAddRow: _onAddRow
}: WordsTableViewProps) {
  const [rows, setRows] = useState<FullWord[]>([])
  const [originalRows, setOriginalRows] = useState<FullWord[]>([])
  const [editing, setEditing] = useState<EditingCell | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize })

  useEffect(() => {
    const sorted = [...wordsProp].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    )
    setRows(sorted)
    setOriginalRows(sorted)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordsProp])

  useEffect(() => {
    setPagination((p) => ({ ...p, pageSize, pageIndex: 0 }))
  }, [pageSize])

  // Reset page on filter change
  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [externalFilter, selectedContextIds])

  useEffect(() => {
    const changes: PendingChange[] = []
    const originalMap = new Map(originalRows.map((w) => [w.id, w]))
    rows.forEach((row) => {
      if (!originalMap.has(row.id)) {
        changes.push({ type: 'create', word: row })
      } else {
        const orig = originalMap.get(row.id)!
        if (JSON.stringify(orig) !== JSON.stringify(row)) {
          changes.push({ type: 'update', word: row })
        }
      }
    })
    originalRows.forEach((orig) => {
      if (!rows.find((r) => r.id === orig.id)) {
        changes.push({ type: 'delete', word: orig })
      }
    })
    onPendingChange(changes)
    onRowsChange(rows)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows])

  const updateRow = useCallback((id: string, updates: Partial<FullWord>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)))
  }, [])

  const deleteRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
    setDeletingId(null)
  }, [])

  const stopEdit = useCallback(() => setEditing(null), [])

  const editNextCell = useCallback((rowId: string, field: keyof FullWord) => {
    const order: (keyof FullWord)[] = [
      'word',
      'definition',
      'contextId',
      'tags'
    ]
    const idx = order.indexOf(field)
    if (idx < order.length - 1) setEditing({ rowId, field: order[idx + 1] })
    else setEditing(null)
  }, [])

  // Paste
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text')
      if (!text || !text.includes('\t')) return
      const lines = text.trim().split('\n')
      const newRows: FullWord[] = lines
        .map((line, i) => {
          const [word, definition, tagsRaw] = line.split('\t')
          return {
            id: crypto.randomUUID(),
            word: word?.trim() ?? '',
            definition: definition?.trim() ?? '',
            contextId: contexts[0]?.id ?? '',
            tags: tagsRaw
              ? tagsRaw
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
              : [],
            createdAt: new Date().toISOString(),
            reviewCount: 0,
            lastReviewed: null,
            difficulty: 'medium' as const,
            order: rows.length + i
          }
        })
        .filter((r) => r.word)
      if (newRows.length > 0) {
        e.preventDefault()
        setRows((prev) => [...newRows, ...prev])
      }
    }
    document.addEventListener('paste', handler)
    return () => document.removeEventListener('paste', handler)
  }, [contexts, rows.length])

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setRows((items) => {
        const oldIdx = items.findIndex((i) => i.id === active.id)
        const newIdx = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIdx, newIdx).map((item, idx) => ({
          ...item,
          order: idx
        }))
      })
    }
  }

  // Filtered data for table
  const filteredRows = useMemo(() => {
    let result = rows
    if (selectedContextIds.length > 0) {
      result = result.filter((r) => selectedContextIds.includes(r.contextId))
    }
    if (externalFilter) {
      const q = externalFilter.toLowerCase()
      result = result.filter(
        (r) =>
          r.word.toLowerCase().includes(q) ||
          r.definition?.toLowerCase().includes(q)
      )
    }
    return result
  }, [rows, selectedContextIds, externalFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safePageIndex = Math.min(pagination.pageIndex, totalPages - 1)
  const pagedRows = filteredRows.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize
  )

  const columns = useMemo<ColumnDef<FullWord>[]>(
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
                onEdit={() =>
                  setEditing({ rowId: row.original.id, field: 'word' })
                }
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
                onEdit={() =>
                  setEditing({ rowId: row.original.id, field: 'definition' })
                }
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
                onEdit={() =>
                  setEditing({ rowId: row.original.id, field: 'contextId' })
                }
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
                onEdit={() =>
                  setEditing({ rowId: row.original.id, field: 'tags' })
                }
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
          <td className="p-3">
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
      editing,
      contexts,
      updateRow,
      stopEdit,
      editNextCell,
      deleteRow,
      deletingId
    ]
  )

  const table = useReactTable({
    data: pagedRows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualFiltering: true
  })

  return (
    <div className="flex flex-col gap-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="overflow-auto rounded-lg border border-border bg-surface shadow-sm">
          <table className="w-full min-w-[640px] table-auto border-collapse text-left">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-border">
                  {/* drag handle col */}
                  <th className="w-8 px-2 py-3" />
                  {hg.headers.map((header) => {
                    if (header.id === 'color' || header.id === 'actions') {
                      return <th key={header.id} className="w-10 px-2 py-3" />
                    }
                    const col = header.column
                    const sorted = col.getIsSorted()
                    return (
                      <th
                        key={header.id}
                        className="px-4 py-3"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder ? null : col.getCanSort() ? (
                          <button
                            type="button"
                            onClick={col.getToggleSortingHandler()}
                            className="flex items-center gap-1 text-sm font-normal text-muted-foreground hover:text-foreground"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {sorted === 'asc' ? (
                              <ArrowUp className="size-3" />
                            ) : sorted === 'desc' ? (
                              <ArrowDown className="size-3" />
                            ) : (
                              <ArrowUpDown className="size-3 opacity-40" />
                            )}
                          </button>
                        ) : (
                          <span className="text-sm font-normal text-muted-foreground">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                        )}
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              <SortableContext
                items={pagedRows.map((r) => r.id)}
                strategy={verticalListSortingStrategy}
              >
                {pagedRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="py-16 text-center text-sm text-muted-foreground"
                    >
                      {filteredRows.length === 0 &&
                      (externalFilter || selectedContextIds.length > 0)
                        ? 'Nenhuma palavra encontrada com os filtros aplicados.'
                        : 'Nenhuma palavra cadastrada. Clique em "+ Adicionar Linha" para começar.'}
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <SortableRow
                      key={row.original.id}
                      id={row.original.id}
                      rowColor={row.original.color}
                    >
                      {row.getVisibleCells().map((cell) => {
                        if (
                          cell.column.id === 'color' ||
                          cell.column.id === 'actions' ||
                          cell.column.id === 'word' ||
                          cell.column.id === 'definition' ||
                          cell.column.id === 'contextId' ||
                          cell.column.id === 'tags'
                        ) {
                          return flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        }
                        return (
                          <td key={cell.id} className="px-4 py-3">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        )
                      })}
                    </SortableRow>
                  ))
                )}
              </SortableContext>
            </tbody>
          </table>
        </div>
      </DndContext>

      {/* Pagination */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            {filteredRows.length === 0
              ? 'Nenhuma palavra'
              : `Mostrando ${safePageIndex * pageSize + 1}–${Math.min(
                  (safePageIndex + 1) * pageSize,
                  filteredRows.length
                )} de ${filteredRows.length}`}
            {filteredRows.length !== rows.length &&
              ` (filtrado de ${rows.length})`}
          </span>
          <div className="flex items-center gap-1.5">
            <label htmlFor="pg-size" className="text-xs">
              Itens:
            </label>
            <select
              id="pg-size"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded border border-border bg-background px-1.5 py-0.5 text-xs text-foreground outline-none"
            >
              {[10, 25, 50, 100].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {[...Array(Math.min(totalPages, 7))].map((_, i) => {
              let p: number
              if (totalPages <= 7) {
                p = i + 1
              } else if (safePageIndex < 3) {
                p = i + 1
              } else if (safePageIndex >= totalPages - 4) {
                p = totalPages - 6 + i
              } else {
                p = safePageIndex - 2 + i
              }
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, pageIndex: p - 1 }))
                  }
                  className={cn(
                    'flex size-7 items-center justify-center rounded border text-xs transition-colors',
                    p === safePageIndex + 1
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background hover:bg-surface-muted'
                  )}
                >
                  {p}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
