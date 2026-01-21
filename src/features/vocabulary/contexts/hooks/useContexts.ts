import { useCallback, useEffect, useReducer } from 'react'
import contextStore from '../stores/context-store'
import wordStore from '../../words/stores/word-store'
import { FullContext, Context } from '../types/context'
import { FullWord } from '../../words/types/word'

const ACTIONS = {
  SET_LOADING: 'SET_LOADING' as const,
  SET_ERROR: 'SET_ERROR' as const,
  GET_ALL_CONTEXTS: 'GET_ALL_CONTEXTS' as const,
  UPDATE_CONTEXT: 'UPDATE_CONTEXT' as const,
  DELETE_CONTEXT: 'DELETE_CONTEXT' as const
}

interface ContextState {
  loading: boolean
  error: string | null
  contexts: FullContext[]
}

const initialContextState: ContextState = {
  loading: false,
  error: null,
  contexts: []
}

type ContextAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'GET_ALL_CONTEXTS'; payload: FullContext[] }
  | { type: 'UPDATE_CONTEXT'; payload: FullContext }
  | { type: 'DELETE_CONTEXT'; payload: string }

function contextReducer(
  state: ContextState,
  action: ContextAction
): ContextState {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload }
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload }
    case ACTIONS.GET_ALL_CONTEXTS:
      return { ...state, contexts: action.payload }
    case ACTIONS.UPDATE_CONTEXT:
      return {
        ...state,
        contexts: state.contexts.map((context) =>
          context.id === action.payload.id ? action.payload : context
        )
      }
    case ACTIONS.DELETE_CONTEXT:
      return {
        ...state,
        contexts: state.contexts.filter(
          (context) => context.id !== action.payload
        )
      }
    default:
      return state
  }
}

interface UseContexts {
  contexts: FullContext[]
  loading: boolean
  error: string | null
  addContext: (contextData: Context) => Promise<void>
  updateContext: (contextData: FullContext) => Promise<void>
  deleteContext: (contextId: string) => Promise<void>
  refreshContexts: () => Promise<void>
}

export function useContexts(): UseContexts {
  const [state, dispatch] = useReducer(contextReducer, initialContextState)

  const fetchContexts = useCallback(async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      const allContexts = await contextStore.getContextWithWordCount()
      dispatch({ type: ACTIONS.GET_ALL_CONTEXTS, payload: allContexts })
    } catch (error) {
      console.error('Error fetching contexts:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload:
          error instanceof Error
            ? error.message
            : `Fetch all contexts failed, ${error}`
      })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }, [])

  useEffect(() => {
    fetchContexts()
  }, [fetchContexts])

  const addContext = async (contextData: Context) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      await contextStore.addContext(contextData)
      await fetchContexts()
    } catch (error) {
      console.error('Error adding context:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload:
          error instanceof Error
            ? error.message
            : `Add context failed, ${error}`
      })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  const updateContext = async (contextData: FullContext) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      await contextStore.update(contextData)
      dispatch({ type: ACTIONS.UPDATE_CONTEXT, payload: contextData })
    } catch (error) {
      console.error('Error updating context:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload:
          error instanceof Error
            ? error.message
            : `Update context failed, ${error}`
      })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  const deleteContext = async (contextId: string) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })

      // Delete all words in this context first
      const words = await wordStore.getWordsByContext(contextId)
      await Promise.all(
        words.map((word: FullWord) => wordStore.delete(word.id))
      )

      // Delete the context
      await contextStore.delete(contextId)
      dispatch({ type: ACTIONS.DELETE_CONTEXT, payload: contextId })
    } catch (error) {
      console.error('Error deleting context:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload:
          error instanceof Error
            ? error.message
            : `Delete context failed, ${error}`
      })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  return {
    contexts: state.contexts,
    loading: state.loading,
    error: state.error,
    addContext,
    updateContext,
    deleteContext,
    refreshContexts: fetchContexts
  }
}
