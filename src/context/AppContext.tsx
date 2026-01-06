// Main App Context for Word Saver PWA
import { createContext, useContext, useReducer, useEffect } from 'react'
import { dbService } from '../services/db'
import notificationService from '../services/notification'
import { FullWord, Word } from '../types/word'
import { Context, FullContext } from '../types/context'
import { Alert, FullAlert } from '../types/alert'
import { Stats } from '../types/stats'

// Type definitions
export interface AppState {
  // Data
  words: FullWord[]
  contexts: FullContext[]
  alerts: FullAlert[]
  stats: Stats | null

  // UI State
  loading: boolean
  error: string | null
  initialized: boolean

  // View preferences
  viewMode: 'grid' | 'list'
  searchQuery: string
  selectedContextId: string | null
}

// Initial state
const initialState: AppState = {
  // Data
  words: [],
  contexts: [],
  alerts: [],
  stats: null,

  // UI State
  loading: false,
  error: null,
  initialized: false,

  // View preferences
  viewMode: 'grid', // 'grid' | 'list'
  searchQuery: '',
  selectedContextId: null
}

// Action types
type AppAction =
  // Initialization
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }

  // Data actions
  | { type: 'SET_WORDS'; payload: FullWord[] }
  | { type: 'ADD_WORD'; payload: FullWord }
  | { type: 'UPDATE_WORD'; payload: FullWord }
  | { type: 'DELETE_WORD'; payload: string }
  | { type: 'SET_CONTEXTS'; payload: FullContext[] }
  | { type: 'ADD_CONTEXT'; payload: FullContext }
  | { type: 'UPDATE_CONTEXT'; payload: FullContext }
  | { type: 'DELETE_CONTEXT'; payload: string }
  | { type: 'SET_ALERTS'; payload: FullAlert[] }
  | { type: 'ADD_ALERT'; payload: FullAlert }
  | { type: 'UPDATE_ALERT'; payload: FullAlert }
  | { type: 'DELETE_ALERT'; payload: string }
  | { type: 'SET_STATS'; payload: Stats }

  // UI actions
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_CONTEXT'; payload: string | null }

const ACTIONS = {
  // Initialization
  SET_LOADING: 'SET_LOADING' as const,
  SET_ERROR: 'SET_ERROR' as const,
  SET_INITIALIZED: 'SET_INITIALIZED' as const,

  // Data actions
  SET_WORDS: 'SET_WORDS' as const,
  ADD_WORD: 'ADD_WORD' as const,
  UPDATE_WORD: 'UPDATE_WORD' as const,
  DELETE_WORD: 'DELETE_WORD' as const,

  SET_CONTEXTS: 'SET_CONTEXTS' as const,
  ADD_CONTEXT: 'ADD_CONTEXT' as const,
  UPDATE_CONTEXT: 'UPDATE_CONTEXT' as const,
  DELETE_CONTEXT: 'DELETE_CONTEXT' as const,

  SET_ALERTS: 'SET_ALERTS' as const,
  ADD_ALERT: 'ADD_ALERT' as const,
  UPDATE_ALERT: 'UPDATE_ALERT' as const,
  DELETE_ALERT: 'DELETE_ALERT' as const,

  SET_STATS: 'SET_STATS' as const,

  // UI actions
  SET_VIEW_MODE: 'SET_VIEW_MODE' as const,
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY' as const,
  SET_SELECTED_CONTEXT: 'SET_SELECTED_CONTEXT' as const
}

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload }

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false }

    case ACTIONS.SET_INITIALIZED:
      return { ...state, initialized: action.payload }

    // Words
    case ACTIONS.SET_WORDS:
      return { ...state, words: action.payload }

    case ACTIONS.ADD_WORD:
      return { ...state, words: [...state.words, action.payload] }

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

    // Contexts
    case ACTIONS.SET_CONTEXTS:
      return { ...state, contexts: action.payload }

    case ACTIONS.ADD_CONTEXT:
      return { ...state, contexts: [...state.contexts, action.payload] }

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
        ),
        // Also remove words from deleted context
        words: state.words.filter((word) => word.contextId !== action.payload),
        // Reset selected context if it was deleted
        selectedContextId:
          state.selectedContextId === action.payload
            ? null
            : state.selectedContextId
      }

    // Alerts
    case ACTIONS.SET_ALERTS:
      return { ...state, alerts: action.payload }

    case ACTIONS.ADD_ALERT:
      return { ...state, alerts: [...state.alerts, action.payload] }

    case ACTIONS.UPDATE_ALERT:
      return {
        ...state,
        alerts: state.alerts.map((alert) =>
          alert.id === action.payload.id ? action.payload : alert
        )
      }

    case ACTIONS.DELETE_ALERT:
      return {
        ...state,
        alerts: state.alerts.filter((alert) => alert.id !== action.payload)
      }

    // Stats
    case ACTIONS.SET_STATS:
      return { ...state, stats: action.payload }

    // UI State
    case ACTIONS.SET_VIEW_MODE:
      return { ...state, viewMode: action.payload }

    case ACTIONS.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload }

    case ACTIONS.SET_SELECTED_CONTEXT:
      return { ...state, selectedContextId: action.payload }

    default:
      return state
  }
}

// Create context
interface AppContextType {
  // State
  words: FullWord[]
  contexts: FullContext[]
  alerts: FullAlert[]
  stats: Stats | null
  loading: boolean
  error: string | null
  initialized: boolean
  viewMode: 'grid' | 'list'
  searchQuery: string
  selectedContextId: string | null

  // Word operations
  addWord: (wordData: Word) => Promise<void>
  updateWord: (wordData: FullWord) => Promise<void>
  deleteWord: (wordId: string) => Promise<void>
  reviewWord: (wordId: string) => Promise<void>

  // Context operations
  addContext: (contextData: Context) => Promise<void>
  updateContext: (contextData: FullContext) => Promise<void>
  deleteContext: (contextId: string) => Promise<void>

  // Alert operations
  addAlert: (alertData: Alert) => Promise<void>
  updateAlert: (alertData: FullAlert) => Promise<void>
  deleteAlert: (alertId: string) => Promise<void>

  // UI operations
  setViewMode: (mode: 'grid' | 'list') => void
  setSearchQuery: (query: string) => void
  setSelectedContext: (contextId: string | null) => void

  // Utilities
  refreshStats: () => Promise<void>
  searchWords: (query: string) => Promise<void>
  clearError: () => void
  loadAllData: () => Promise<void>
  deleteAllData: () => Promise<void>
}
const AppContext = createContext<AppContextType>({} as AppContextType)

// Context provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Initialize app
  useEffect(() => {
    const initApp = async () => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true })

        // Initialize database
        await dbService.init()

        // Initialize notifications
        await notificationService.init()

        // Load initial data
        await loadAllData()

        dispatch({ type: ACTIONS.SET_INITIALIZED, payload: true })
      } catch (error) {
        console.error('Error initializing app:', error)
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: 'Erro ao inicializar aplicação'
        })
      } finally {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false })
      }
    }

    initApp()
  }, [])

  // Load all data from database
  const loadAllData = async () => {
    try {
      const [words, contexts, alerts, stats] = await Promise.all([
        dbService.words.getAll(),
        dbService.contexts.getContextWithWordCount(),
        dbService.alerts.getAll(),
        dbService.stats.getStats()
      ])

      dispatch({ type: ACTIONS.SET_WORDS, payload: words })
      dispatch({ type: ACTIONS.SET_CONTEXTS, payload: contexts })
      dispatch({ type: ACTIONS.SET_ALERTS, payload: alerts })
      dispatch({ type: ACTIONS.SET_STATS, payload: stats })
    } catch (error) {
      console.error('Error loading data:', error)
      throw error
    }
  }

  const deleteAllData = async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      await dbService.words.clear()
      await dbService.contexts.clear()
      await dbService.alerts.clear()
      await loadAllData()
    } catch (error) {
      console.error('Error deleting all data:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: 'Erro ao deletar todos os dados'
      })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  // Word operations
  const addWord = async (wordData: Word) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      await dbService.words.addWord(wordData)
      await loadAllData() // Reload to get updated stats
    } catch (error) {
      console.error('Error adding word:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: 'Erro ao adicionar palavra'
      })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  const updateWord = async (wordData: FullWord) => {
    try {
      await dbService.words.update(wordData)
      dispatch({ type: ACTIONS.UPDATE_WORD, payload: wordData })
      await refreshStats()
    } catch (error) {
      console.error('Error updating word:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: 'Erro ao atualizar palavra'
      })
    }
  }

  const deleteWord = async (wordId: string) => {
    try {
      await dbService.words.delete(wordId)
      dispatch({ type: ACTIONS.DELETE_WORD, payload: wordId })
      await refreshStats()
    } catch (error) {
      console.error('Error deleting word:', error)
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao deletar palavra' })
    }
  }

  const reviewWord = async (wordId: string) => {
    try {
      await dbService.words.updateWordReview(wordId)
      const updatedWord = await dbService.words.get(wordId)
      dispatch({ type: ACTIONS.UPDATE_WORD, payload: updatedWord as FullWord })
      await refreshStats()
    } catch (error) {
      console.error('Error reviewing word:', error)
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao revisar palavra' })
    }
  }

  // Context operations
  const addContext = async (contextData: Context) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      await dbService.contexts.addContext(contextData)
      await loadAllData()
    } catch (error) {
      console.error('Error adding context:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: 'Erro ao adicionar contexto'
      })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  const updateContext = async (contextData: FullContext) => {
    try {
      await dbService.contexts.update(contextData)
      dispatch({ type: ACTIONS.UPDATE_CONTEXT, payload: contextData })
    } catch (error) {
      console.error('Error updating context:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: 'Erro ao atualizar contexto'
      })
    }
  }

  const deleteContext = async (contextId: string) => {
    try {
      // Delete all words in this context first
      const words = await dbService.words.getWordsByContext(contextId)
      await Promise.all(words.map((word) => dbService.words.delete(word.id)))

      // Delete the context
      await dbService.contexts.delete(contextId)
      dispatch({ type: ACTIONS.DELETE_CONTEXT, payload: contextId })
      await refreshStats()
    } catch (error) {
      console.error('Error deleting context:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: 'Erro ao deletar contexto'
      })
    }
  }

  // Alert operations
  const addAlert = async (alertData: Alert) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      const alert = await dbService.alerts.addAlert(alertData)

      // Schedule the alert
      await notificationService.scheduleAlert(alert)

      await loadAllData()
    } catch (error) {
      console.error('Error adding alert:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: 'Erro ao adicionar alerta'
      })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  const updateAlert = async (alertData: FullAlert) => {
    try {
      await dbService.alerts.update(alertData)

      // Reschedule alerts
      await notificationService.rescheduleAlerts()

      dispatch({ type: ACTIONS.UPDATE_ALERT, payload: alertData })
    } catch (error) {
      console.error('Error updating alert:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload: 'Erro ao atualizar alerta'
      })
    }
  }

  const deleteAlert = async (alertId: string) => {
    try {
      // Cancel scheduled notification
      notificationService.cancelAlert(alertId)

      await dbService.alerts.delete(alertId)
      dispatch({ type: ACTIONS.DELETE_ALERT, payload: alertId })
    } catch (error) {
      console.error('Error deleting alert:', error)
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao deletar alerta' })
    }
  }

  // Utility functions
  const refreshStats = async () => {
    try {
      const stats = await dbService.stats.getStats()
      dispatch({ type: ACTIONS.SET_STATS, payload: stats })
    } catch (error) {
      console.error('Error refreshing stats:', error)
    }
  }

  const searchWords = async (query: string) => {
    try {
      if (!query.trim()) {
        await loadAllData()
        return
      }

      const words = await dbService.words.searchWords(query)
      dispatch({ type: ACTIONS.SET_WORDS, payload: words })
    } catch (error) {
      console.error('Error searching words:', error)
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro na busca' })
    }
  }

  const clearError = () => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: null })
  }

  // Context value
  const value = {
    // State
    ...state,

    // Word operations
    addWord,
    updateWord,
    deleteWord,
    reviewWord,

    // Context operations
    addContext,
    updateContext,
    deleteContext,

    // Alert operations
    addAlert,
    updateAlert,
    deleteAlert,

    // UI operations
    setViewMode: (mode: 'grid' | 'list') =>
      dispatch({ type: ACTIONS.SET_VIEW_MODE, payload: mode }),
    setSearchQuery: (query: string) => {
      dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query })
      searchWords(query)
    },
    setSelectedContext: (contextId: string | null) =>
      dispatch({ type: ACTIONS.SET_SELECTED_CONTEXT, payload: contextId }),

    // Utilities
    refreshStats,
    searchWords,
    clearError,
    loadAllData,
    deleteAllData
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Custom hook to use the app context
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export default AppContext
