import { useCallback, useEffect, useReducer } from 'react'
import wordStore from '../stores/word-store'
import { FullWord, Word } from '../types/word'

const ACTIONS = {
  SET_LOADING: 'SET_LOADING' as const,
  SET_ERROR: 'SET_ERROR' as const,
  GET_ALL_WORDS: 'GET_ALL_WORDS' as const,
  UPDATE_WORD: 'UPDATE_WORD' as const,
  DELETE_WORD: 'DELETE_WORD' as const
}

interface WordState {
  loading: boolean
  error: string | null
  words: FullWord[]
}

const initialWordState: WordState = {
  loading: false,
  error: null,
  words: []
}

type WordAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'GET_ALL_WORDS'; payload: FullWord[] }
  | { type: 'UPDATE_WORD'; payload: FullWord }
  | { type: 'DELETE_WORD'; payload: string }

function wordReducer(state: WordState, action: WordAction): WordState {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload }
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload }
    case ACTIONS.GET_ALL_WORDS:
      return { ...state, words: action.payload }
    case ACTIONS.UPDATE_WORD:
      return {
        ...state,
        words: state.words.map((word) =>
          word.id === action.payload.id ? action.payload : word
        )
      }
    case ACTIONS.DELETE_WORD:
      return {
        ...state,
        words: state.words.filter((word) => word.id !== action.payload)
      }
    default:
      return state
  }
}

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
  const [state, dispatch] = useReducer(wordReducer, initialWordState)

  const fetchWords = useCallback(async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      const allWords = await wordStore.getAll()
      dispatch({ type: ACTIONS.GET_ALL_WORDS, payload: allWords })
    } catch (error) {
      console.error('Error fetching words:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload:
          error instanceof Error
            ? error.message
            : `Fetch all words failed, ${error}`
      })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }, [])

  useEffect(() => {
    fetchWords()
  }, [fetchWords])

  const addWord = async (wordData: Word) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      await wordStore.addWord(wordData)
      await fetchWords()
    } catch (error) {
      console.error('Error adding word:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload:
          error instanceof Error ? error.message : `Add word failed, ${error}`
      })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  const updateWord = async (wordData: FullWord) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      await wordStore.update(wordData)
      dispatch({ type: ACTIONS.UPDATE_WORD, payload: wordData })
      // await refreshStats()
    } catch (error) {
      console.error('Error updating word:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload:
          error instanceof Error
            ? error.message
            : `Update word failed, ${error}`
      })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  const deleteWord = async (wordId: string) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      await wordStore.delete(wordId)
      dispatch({ type: ACTIONS.DELETE_WORD, payload: wordId })
      // await refreshStats()
    } catch (error) {
      console.error('Error deleting word:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload:
          error instanceof Error
            ? error.message
            : `Delete word failed, ${error}`
      })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  const reviewWord = async (wordId: string) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      await wordStore.updateWordReview(wordId)
      const updatedWord = await wordStore.get<FullWord>(wordId)
      dispatch({ type: ACTIONS.UPDATE_WORD, payload: updatedWord })
      // await refreshStats()
    } catch (error) {
      console.error('Error reviewing word:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload:
          error instanceof Error
            ? error.message
            : `Review word failed, ${error}`
      })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  return {
    words: state.words,
    loading: state.loading,
    error: state.error,
    addWord,
    updateWord,
    deleteWord,
    reviewWord,
    refreshWords: fetchWords
  }
}
