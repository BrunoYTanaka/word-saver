import { useState, useEffect, useCallback } from 'react'
import { useBlocker } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addWord, updateWord, deleteWord } from '@/store/slices/wordsSlice'
import type { FullWord } from '@/features/vocabulary/words/types/word'
import {
  WordsTableView,
  type PendingChange
} from '@/features/vocabulary/words/components/WordsTable'
import { WordsTableToolbar } from '@/features/vocabulary/words/components/WordsTableToolbar'
import { WordsTableSaveBar } from '@/features/vocabulary/words/components/WordsTableSaveBar'
import { useStorage } from '@/shared/hooks'

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
  const [currentRows, setCurrentRows] = useState<FullWord[]>([])
  const [isSaving, setIsSaving] = useState(false)

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

  // Block navigation when there are pending changes
  const blocker = useBlocker(pendingChanges.length > 0)

  useEffect(() => {
    if (blocker.state === 'blocked') {
      const confirmed = window.confirm(
        'Há alterações não salvas. Deseja sair sem salvar?'
      )
      if (confirmed) blocker.proceed()
      else blocker.reset()
    }
  }, [blocker])

  // Add new blank row
  const handleAddRow = useCallback(() => {
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
    setCurrentRows((prev) => [newWord, ...prev])
  }, [contexts])

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

  // Save all pending changes
  const handleSave = async () => {
    if (pendingChanges.length === 0) return
    setIsSaving(true)
    try {
      for (const change of pendingChanges) {
        if (change.type === 'create' && change.word.word.trim()) {
          const {
            id,
            createdAt,
            reviewCount,
            lastReviewed,
            difficulty,
            ...wordInput
          } = change.word
          await dispatch(
            addWord({ ...wordInput, word: change.word.word })
          ).unwrap()
        } else if (change.type === 'update') {
          await dispatch(updateWord(change.word)).unwrap()
        } else if (change.type === 'delete') {
          await dispatch(deleteWord(change.word.id)).unwrap()
        }
      }
      setPendingChanges([])
    } catch (err) {
      console.error('Erro ao salvar alterações:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Discard all pending changes (resets to Redux state)
  const handleDiscard = () => {
    setPendingChanges([])
    // Force re-render by resetting rows key — handled by WordsTableView re-mount via key
    setCurrentRows([...words].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
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
      />

      {/* Table */}
      <WordsTableView
        key={isSaving ? 'saving' : 'idle'}
        words={
          currentRows.length > 0 || pendingChanges.length > 0
            ? currentRows
            : words
        }
        contexts={contexts}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        globalFilter={debouncedSearch}
        onGlobalFilterChange={setDebouncedSearch}
        selectedContextIds={selectedContextIds}
        onPendingChange={setPendingChanges}
        onRowsChange={setCurrentRows}
        onAddRow={handleAddRow}
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
