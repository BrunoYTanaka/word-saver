import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchWords,
  addWord as addWordAction,
  updateWord as updateWordAction,
  deleteWord as deleteWordAction,
  reviewWord as reviewWordAction
} from '@/store/slices/wordsSlice'
import { FullWord, Word } from '../types/word'

interface UseWords {
  words: FullWord[]
  loading: boolean
  error: string | null
  addWord: (wordData: Word) => Promise<void>
  updateWord: (wordData: FullWord) => Promise<void>
  deleteWord: (wordId: string) => Promise<void>
  reviewWord: (wordId: string) => Promise<void>
  refreshWords: () => Promise<void>
}

export function useWords(): UseWords {
  const dispatch = useAppDispatch()
  const { words, loading, error } = useAppSelector((state) => state.words)

  useEffect(() => {
    dispatch(fetchWords())
  }, [dispatch])

  const addWord = useCallback(
    async (wordData: Word) => {
      await dispatch(addWordAction(wordData)).unwrap()
    },
    [dispatch]
  )

  const updateWord = useCallback(
    async (wordData: FullWord) => {
      await dispatch(updateWordAction(wordData)).unwrap()
    },
    [dispatch]
  )

  const deleteWord = useCallback(
    async (wordId: string) => {
      await dispatch(deleteWordAction(wordId)).unwrap()
    },
    [dispatch]
  )

  const reviewWord = useCallback(
    async (wordId: string) => {
      await dispatch(reviewWordAction(wordId)).unwrap()
    },
    [dispatch]
  )

  const refreshWords = useCallback(async () => {
    await dispatch(fetchWords()).unwrap()
  }, [dispatch])

  return {
    words,
    loading,
    error,
    addWord,
    updateWord,
    deleteWord,
    reviewWord,
    refreshWords
  }
}
