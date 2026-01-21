import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState
} from 'react'
import notificationService from '../../core/notifications'
import { database } from '../../core'

// Type definitions
export interface AppState {
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
  // UI State
  loading: false,
  error: null,
  initialized: false,

  // View preferences
  viewMode: 'grid',
  searchQuery: '',
  selectedContextId: null
}

// Action types
type AppAction =
  // Initialization
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }

  // UI actions
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_CONTEXT'; payload: string | null }

const ACTIONS = {
  // Initialization
  SET_LOADING: 'SET_LOADING' as const,
  SET_ERROR: 'SET_ERROR' as const,
  SET_INITIALIZED: 'SET_INITIALIZED' as const,

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
  loading: boolean
  error: string | null
  initialized: boolean
  viewMode: 'grid' | 'list'
  searchQuery: string
  selectedContextId: string | null
  isNotificationEnabled: boolean

  // UI operations
  setViewMode: (mode: 'grid' | 'list') => void
  setSearchQuery: (query: string) => void
  setSelectedContext: (contextId: string | null) => void
  clearError: () => void
}

const AppContext = createContext<AppContextType>({} as AppContextType)

// Context provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const [isNotificationEnabled, setIsNotificationEnabled] =
    useState<boolean>(false)

  // Initialize app
  useEffect(() => {
    const initApp = async () => {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true })

        // Initialize database
        await database.init()

        // Initialize notifications
        const isNotificationEnabled = await notificationService.init()

        dispatch({ type: ACTIONS.SET_INITIALIZED, payload: true })
        setIsNotificationEnabled(isNotificationEnabled)
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

  const clearError = () => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: null })
  }

  // Context value
  const value = {
    // State
    ...state,
    isNotificationEnabled,

    // UI operations
    setViewMode: (mode: 'grid' | 'list') =>
      dispatch({ type: ACTIONS.SET_VIEW_MODE, payload: mode }),
    setSearchQuery: (query: string) =>
      dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query }),
    setSelectedContext: (contextId: string | null) =>
      dispatch({ type: ACTIONS.SET_SELECTED_CONTEXT, payload: contextId }),
    clearError
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Custom hook to use the app context
export function useApp(): AppContextType {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export default AppContext
