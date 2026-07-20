import { useState, useEffect, useCallback, useRef } from 'react'
import { BookOpen } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addWord, updateWord, deleteWord } from '@/store/slices/wordsSlice'
import {
  WordsTableView,
  type PendingChange
} from '@/features/vocabulary/words/components/WordsTable'
import { WordsTableToolbar } from '@/features/vocabulary/words/components/WordsTableToolbar'
import { WordsTableSaveBar } from '@/features/vocabulary/words/components/WordsTableSaveBar'
import { useStorage } from '@/shared/hooks'
import { isEditableTarget } from '@/shared/utils'

const PAGE_SIZE_KEY = 'words-page-size'
const DEFAULT_PAGE_SIZE = 25

export default function WordsPage() {
  const dispatch = useAppDispatch()
  const { words } = useAppSelector((state) => state.words)
  const { contexts } = useAppSelector((state) => state.contexts)

  const [storedPageSize, setStoredPageSize] = useStorage<number>(
    PAGE_SIZE_KEY,
    DEFAULT_PAGE_SIZE
  )
  const [pageSize, setPageSize] = useState<number>(
    storedPageSize ?? DEFAULT_PAGE_SIZE
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedContextIds, setSelectedContextIds] = useState<string[]>([])
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([])
  const [isSaving, setIsSaving] = useState(false)
  // Incrementing resetKey remounts the table (discard / post-save)
  const [resetKey, setResetKey] = useState(0)
  // Incrementing addRowSignal tells the table to prepend a blank row
  const [addRowSignal, setAddRowSignal] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(t)
  }, [searchTerm])

  // Persist page size
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setStoredPageSize(size)
  }

  // Warn before browser/tab close when there are pending changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (pendingChanges.length > 0) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [pendingChanges.length])

  // Signal the table to prepend a blank row
  const handleAddRow = useCallback(() => {
    setAddRowSignal((s) => s + 1)
  }, [])

  // Context filter
  const handleContextToggle = (id: string) => {
    setSelectedContextIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setDebouncedSearch('')
    setSelectedContextIds([])
  }

  // Delete word immediately (no pending change needed — already confirmed)
  const handleDeleteWord = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteWord(id)).unwrap()
      } catch (err) {
        console.error('Erro ao remover palavra:', err)
      }
    },
    [dispatch]
  )

  // Save all pending changes (fired concurrently — each is an independent IndexedDB write)
  const handleSave = useCallback(async () => {
    if (pendingChanges.length === 0) return
    setIsSaving(true)
    try {
      await Promise.all(
        pendingChanges.map((change) => {
          if (change.type === 'create' && change.word.word.trim()) {
            const wordInput = {
              word: change.word.word,
              definition: change.word.definition,
              contextId: change.word.contextId,
              tags: change.word.tags
            }
            return dispatch(addWord(wordInput)).unwrap()
          } else if (change.type === 'update') {
            return dispatch(updateWord(change.word)).unwrap()
          }
          return Promise.resolve()
        })
      )
      setPendingChanges([])
      // Remount table so originalRows reflects the freshly saved Redux state
      setResetKey((k) => k + 1)
    } catch (err) {
      console.error('Erro ao salvar alterações:', err)
    } finally {
      setIsSaving(false)
    }
  }, [pendingChanges, dispatch])

  // Keyboard shortcuts: Ctrl/Cmd+S saves (intercepts the browser's native
  // save dialog even while a cell is focused); "/" focuses the search input.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (pendingChanges.length > 0 && !isSaving) handleSave()
        return
      }
      if (e.key === '/' && !isEditableTarget(e.target)) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [pendingChanges.length, isSaving, handleSave])

  // Discard — remount table from current Redux state
  const handleDiscard = () => {
    setPendingChanges([])
    setResetKey((k) => k + 1)
  }

  const activeFilterCount =
    selectedContextIds.length + (debouncedSearch ? 1 : 0)

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary-soft">
          <BookOpen className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Palavras</h1>
          <p className="text-sm text-muted-foreground">
            {words.length}{' '}
            {words.length === 1 ? 'palavra cadastrada' : 'palavras cadastradas'}
            {pendingChanges.length > 0 && (
              <span className="ml-2 font-medium text-warning">
                · {pendingChanges.length} pendente
                {pendingChanges.length > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <WordsTableToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedContextIds={selectedContextIds}
        onContextToggle={handleContextToggle}
        onClearFilters={handleClearFilters}
        contexts={contexts}
        onAddRow={handleAddRow}
        activeFilterCount={activeFilterCount}
        searchInputRef={searchInputRef}
      />

      {/* Table — key forces remount on discard/save */}
      <WordsTableView
        key={resetKey}
        words={words}
        contexts={contexts}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        globalFilter={debouncedSearch}
        selectedContextIds={selectedContextIds}
        onPendingChange={setPendingChanges}
        onDeleteWord={handleDeleteWord}
        addRowSignal={addRowSignal}
      />

      {/* Save bar */}
      <WordsTableSaveBar
        pendingCount={pendingChanges.length}
        isSaving={isSaving}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    </div>
  )
}
