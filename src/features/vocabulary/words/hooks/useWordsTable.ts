import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { type SortingState } from '@tanstack/react-table'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { isEditableTarget } from '@/shared/utils'
import type { FullWord } from '../types/word'
import type { FullContext } from '@/features/vocabulary'

export type ChangeType = 'create' | 'update' | 'delete'

export interface PendingChange {
  type: ChangeType
  word: FullWord
}

export interface EditingCell {
  rowId: string
  field: keyof FullWord | null
}

interface UseWordsTableOptions {
  initialWords: FullWord[]
  contexts: FullContext[]
  pageSize: number
  globalFilter: string
  selectedContextIds: string[]
  addRowSignal: number
  onPendingChange: (changes: PendingChange[]) => void
  onDeleteWord: (id: string) => void
  onAutoSaveWord: (word: FullWord) => Promise<FullWord | null>
}

export function useWordsTable({
  initialWords,
  contexts,
  pageSize,
  globalFilter,
  selectedContextIds,
  addRowSignal,
  onPendingChange,
  onDeleteWord,
  onAutoSaveWord
}: UseWordsTableOptions) {
  const [rows, setRows] = useState<FullWord[]>(() =>
    [...initialWords].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  )
  const [originalRows, setOriginalRows] = useState<FullWord[]>(() =>
    [...initialWords].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  )
  const [editing, setEditing] = useState<EditingCell | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleteConfirming, setBulkDeleteConfirming] = useState(false)

  // Handle addRowSignal
  const prevSignal = useRef(addRowSignal)
  useEffect(() => {
    if (addRowSignal === prevSignal.current) return
    prevSignal.current = addRowSignal
    const newWord: FullWord = {
      id: crypto.randomUUID(),
      word: '',
      definition: '',
      contextId: contexts[0]?.id ?? '',
      tags: [],
      createdAt: new Date().toISOString(),
      reviewCount: 0,
      lastReviewed: null,
      difficulty: 'medium',
      order: 0
    }
    setRows((prev) => [newWord, ...prev])
    setPageIndex(0)
    setEditing({ rowId: newWord.id, field: 'word' })
  }, [addRowSignal, contexts])

  // Reset page and selection on filter/context change
  useEffect(() => {
    setPageIndex(0)
    setSelectedIds(new Set())
  }, [globalFilter, selectedContextIds, pageSize])

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
    onPendingChange(changes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows])

  // Auto-save a new row the moment the user leaves it (Tab past the last
  // field, click away, or open another row) — no manual "Salvar Alterações"
  // needed just to create a word. Existing rows still go through the normal
  // pending-changes/save flow.
  const latestRef = useRef({ rows, originalRows })
  useEffect(() => {
    latestRef.current = { rows, originalRows }
  })

  const prevEditingRowId = useRef<string | null>(null)
  useEffect(() => {
    const leftRowId = prevEditingRowId.current
    const enteredRowId = editing?.rowId ?? null
    prevEditingRowId.current = enteredRowId
    if (!leftRowId || leftRowId === enteredRowId) return

    const { rows: currentRows, originalRows: currentOriginal } =
      latestRef.current
    const isNew = !currentOriginal.some((r) => r.id === leftRowId)
    const row = currentRows.find((r) => r.id === leftRowId)
    if (!isNew || !row || !row.word.trim()) return

    onAutoSaveWord(row).then((saved) => {
      if (!saved) return
      setRows((prev) =>
        prev.map((r) => (r.id === leftRowId ? { ...saved, order: r.order } : r))
      )
      setOriginalRows((prev) => [...prev, { ...saved, order: row.order }])
    })
  }, [editing, onAutoSaveWord])

  // Clipboard paste (tab-separated)
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

  // Filtering
  const filteredRows = useMemo(() => {
    let result = rows
    if (selectedContextIds.length > 0) {
      result = result.filter((r) => selectedContextIds.includes(r.contextId))
    }
    if (globalFilter) {
      const q = globalFilter.toLowerCase()
      result = result.filter(
        (r) =>
          r.word.toLowerCase().includes(q) ||
          r.definition?.toLowerCase().includes(q)
      )
    }
    return result
  }, [rows, selectedContextIds, globalFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safePageIndex = Math.min(pageIndex, totalPages - 1)
  const pagedRows = filteredRows.slice(
    safePageIndex * pageSize,
    safePageIndex * pageSize + pageSize
  )

  // Selection
  const selectedOnPageCount = pagedRows.reduce(
    (count, row) => count + (selectedIds.has(row.id) ? 1 : 0),
    0
  )
  const isAllPageSelected =
    pagedRows.length > 0 && selectedOnPageCount === pagedRows.length
  const isPageSelectionIndeterminate =
    selectedOnPageCount > 0 && selectedOnPageCount < pagedRows.length

  const toggleRowSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAllOnPage = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      const allSelected = pagedRows.every((row) => next.has(row.id))
      pagedRows.forEach((row) => {
        if (allSelected) next.delete(row.id)
        else next.add(row.id)
      })
      return next
    })
  }, [pagedRows])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const bulkMoveToContext = useCallback(
    (contextId: string) => {
      setRows((prev) =>
        prev.map((r) => (selectedIds.has(r.id) ? { ...r, contextId } : r))
      )
    },
    [selectedIds]
  )

  const requestBulkDelete = useCallback(() => setBulkDeleteConfirming(true), [])
  const cancelBulkDelete = useCallback(() => setBulkDeleteConfirming(false), [])

  const confirmBulkDelete = useCallback(() => {
    const idsToDelete = new Set(selectedIds)
    idsToDelete.forEach((id) => {
      const isExisting = originalRows.some((r) => r.id === id)
      if (isExisting) onDeleteWord(id)
    })
    setRows((prev) => prev.filter((r) => !idsToDelete.has(r.id)))
    setSelectedIds(new Set())
    setBulkDeleteConfirming(false)
  }, [selectedIds, originalRows, onDeleteWord])

  // Keyboard shortcuts scoped to the table: Delete/Backspace opens bulk-delete
  // confirmation, Escape cancels the confirmation or clears the selection.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return

      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedIds.size > 0
      ) {
        e.preventDefault()
        requestBulkDelete()
      } else if (e.key === 'Escape') {
        if (bulkDeleteConfirming) cancelBulkDelete()
        else if (selectedIds.size > 0) clearSelection()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [
    selectedIds,
    bulkDeleteConfirming,
    requestBulkDelete,
    cancelBulkDelete,
    clearSelection
  ])

  // Row actions
  const updateRow = useCallback((id: string, updates: Partial<FullWord>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)))
  }, [])

  const deleteRow = useCallback(
    (id: string) => {
      const isExisting = originalRows.some((r) => r.id === id)
      if (isExisting) onDeleteWord(id)
      setRows((prev) => prev.filter((r) => r.id !== id))
      setDeletingId(null)
      setSelectedIds((prev) => {
        if (!prev.has(id)) return prev
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    },
    [originalRows, onDeleteWord]
  )

  const stopEdit = useCallback(() => setEditing(null), [])

  const startEdit = useCallback((rowId: string, field: keyof FullWord) => {
    setEditing({ rowId, field })
  }, [])

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

  return {
    rows,
    filteredRows,
    pagedRows,
    totalPages,
    safePageIndex,
    setPageIndex,
    sorting,
    setSorting,
    editing,
    startEdit,
    stopEdit,
    editNextCell,
    deletingId,
    setDeletingId,
    updateRow,
    deleteRow,
    sensors,
    handleDragEnd,
    DndContext,
    closestCenter,
    selectedIds,
    isAllPageSelected,
    isPageSelectionIndeterminate,
    toggleRowSelected,
    toggleSelectAllOnPage,
    clearSelection,
    bulkMoveToContext,
    bulkDeleteConfirming,
    requestBulkDelete,
    confirmBulkDelete,
    cancelBulkDelete
  }
}
