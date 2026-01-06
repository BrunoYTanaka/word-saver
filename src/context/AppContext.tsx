// Main App Context for Word Saver PWA
import { createContext, useContext, useReducer, useEffect } from 'react'
import { dbService } from '../services/db'
import notificationService from '../services/notifications.js'

// Initial state
const initialState = {
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
  selectedContextId: null,

  // Modals/Drawers
  showAddWordModal: false,
  showAddContextModal: false,
  showAddAlertModal: false,
  showSettingsModal: false,
  showExportModal: false,
  showImportModal: false
}

// Action types
const ACTIONS = {
  // Initialization
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_INITIALIZED: 'SET_INITIALIZED',

  // Data actions
  SET_WORDS: 'SET_WORDS',
  ADD_WORD: 'ADD_WORD',
  UPDATE_WORD: 'UPDATE_WORD',
  DELETE_WORD: 'DELETE_WORD',

  SET_CONTEXTS: 'SET_CONTEXTS',
  ADD_CONTEXT: 'ADD_CONTEXT',
  UPDATE_CONTEXT: 'UPDATE_CONTEXT',
  DELETE_CONTEXT: 'DELETE_CONTEXT',

  SET_ALERTS: 'SET_ALERTS',
  ADD_ALERT: 'ADD_ALERT',
  UPDATE_ALERT: 'UPDATE_ALERT',
  DELETE_ALERT: 'DELETE_ALERT',

  SET_STATS: 'SET_STATS',

  // UI actions
  SET_VIEW_MODE: 'SET_VIEW_MODE',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_SELECTED_CONTEXT: 'SET_SELECTED_CONTEXT',

  // Modal actions
  TOGGLE_ADD_WORD_MODAL: 'TOGGLE_ADD_WORD_MODAL',
  TOGGLE_ADD_CONTEXT_MODAL: 'TOGGLE_ADD_CONTEXT_MODAL',
  TOGGLE_ADD_ALERT_MODAL: 'TOGGLE_ADD_ALERT_MODAL',
  TOGGLE_SETTINGS_MODAL: 'TOGGLE_SETTINGS_MODAL',
  TOGGLE_EXPORT_MODAL: 'TOGGLE_EXPORT_MODAL',
  TOGGLE_IMPORT_MODAL: 'TOGGLE_IMPORT_MODAL'
}

// Reducer function
function appReducer(state, action) {
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

    // Modals
    case ACTIONS.TOGGLE_ADD_WORD_MODAL:
      return { ...state, showAddWordModal: !state.showAddWordModal }

    case ACTIONS.TOGGLE_ADD_CONTEXT_MODAL:
      return { ...state, showAddContextModal: !state.showAddContextModal }

    case ACTIONS.TOGGLE_ADD_ALERT_MODAL:
      return { ...state, showAddAlertModal: !state.showAddAlertModal }

    case ACTIONS.TOGGLE_SETTINGS_MODAL:
      return { ...state, showSettingsModal: !state.showSettingsModal }

    case ACTIONS.TOGGLE_EXPORT_MODAL:
      return { ...state, showExportModal: !state.showExportModal }

    case ACTIONS.TOGGLE_IMPORT_MODAL:
      return { ...state, showImportModal: !state.showImportModal }

    default:
      return state
  }
}

// Create context
interface AppContextType {
  // State
  words: Array<any>
  contexts: Array<any>
  alerts: Array<any>
  stats: any
  loading: boolean
  error: string | null
  initialized: boolean
  viewMode: 'grid' | 'list'
  searchQuery: string
  selectedContextId: number | null
  showAddWordModal: boolean
  showAddContextModal: boolean
  showAddAlertModal: boolean
  showSettingsModal: boolean
  showExportModal: boolean
  showImportModal: boolean

  // Word operations
  addWord: (wordData: any) => Promise<void>
  updateWord: (wordData: any) => Promise<void>
  deleteWord: (wordId: string) => Promise<void>
  reviewWord: (wordId: string) => Promise<void>

  // Context operations
  addContext: (contextData: any) => Promise<void>
  updateContext: (contextData: any) => Promise<void>
  deleteContext: (contextId: string) => Promise<void>

  // Alert operations
  addAlert: (alertData: any) => Promise<void>
  updateAlert: (alertData: any) => Promise<void>
  deleteAlert: (alertId: string) => Promise<void>

  // UI operations
  setViewMode: (mode: 'grid' | 'list') => void
  setSearchQuery: (query: string) => void
  setSelectedContext: (contextId: number | null) => void

  // Modal operations
  toggleAddWordModal: () => void
  toggleAddContextModal: () => void
  toggleAddAlertModal: () => void
  toggleSettingsModal: () => void
  toggleExportModal: () => void
  toggleImportModal: () => void

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
      await dbService.words.deleteAll()
      await dbService.contexts.deleteAll()
      await dbService.alerts.deleteAll()
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
  const addWord = async (wordData) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      await dbService.words.addWord(wordData)
      await loadAllData() // Reload to get updated stats
      dispatch({ type: ACTIONS.TOGGLE_ADD_WORD_MODAL })
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

  const updateWord = async (wordData) => {
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

  const deleteWord = async (wordId) => {
    try {
      await dbService.words.delete(wordId)
      dispatch({ type: ACTIONS.DELETE_WORD, payload: wordId })
      await refreshStats()
    } catch (error) {
      console.error('Error deleting word:', error)
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao deletar palavra' })
    }
  }

  const reviewWord = async (wordId) => {
    try {
      await dbService.words.updateWordReview(wordId)
      const updatedWord = await dbService.words.get(wordId)
      dispatch({ type: ACTIONS.UPDATE_WORD, payload: updatedWord })
      await refreshStats()
    } catch (error) {
      console.error('Error reviewing word:', error)
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Erro ao revisar palavra' })
    }
  }

  // Context operations
  const addContext = async (contextData) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      await dbService.contexts.addContext(contextData)
      await loadAllData()
      dispatch({ type: ACTIONS.TOGGLE_ADD_CONTEXT_MODAL })
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

  const updateContext = async (contextData) => {
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

  const deleteContext = async (contextId) => {
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
  const addAlert = async (alertData) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      await dbService.alerts.addAlert(alertData)

      // Schedule the alert
      await notificationService.scheduleAlert(alertData)

      await loadAllData()
      dispatch({ type: ACTIONS.TOGGLE_ADD_ALERT_MODAL })
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

  const updateAlert = async (alertData) => {
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

  const deleteAlert = async (alertId) => {
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

  const searchWords = async (query) => {
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
    setViewMode: (mode) =>
      dispatch({ type: ACTIONS.SET_VIEW_MODE, payload: mode }),
    setSearchQuery: (query) => {
      dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query })
      searchWords(query)
    },
    setSelectedContext: (contextId) =>
      dispatch({ type: ACTIONS.SET_SELECTED_CONTEXT, payload: contextId }),

    // Modal operations
    toggleAddWordModal: () => dispatch({ type: ACTIONS.TOGGLE_ADD_WORD_MODAL }),
    toggleAddContextModal: () =>
      dispatch({ type: ACTIONS.TOGGLE_ADD_CONTEXT_MODAL }),
    toggleAddAlertModal: () =>
      dispatch({ type: ACTIONS.TOGGLE_ADD_ALERT_MODAL }),
    toggleSettingsModal: () =>
      dispatch({ type: ACTIONS.TOGGLE_SETTINGS_MODAL }),
    toggleExportModal: () => dispatch({ type: ACTIONS.TOGGLE_EXPORT_MODAL }),
    toggleImportModal: () => dispatch({ type: ACTIONS.TOGGLE_IMPORT_MODAL }),

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
