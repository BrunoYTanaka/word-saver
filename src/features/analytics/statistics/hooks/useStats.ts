import { useReducer } from 'react'
import { Stats, StatsStore } from '../../..'

const ACTIONS = {
  SET_LOADING: 'SET_LOADING' as const,
  SET_ERROR: 'SET_ERROR' as const,
  SET_STATS: 'SET_STATS' as const
}

interface StatsState {
  loading: boolean
  error: string | null
  stats: Stats
}

const initialStatsState: StatsState = {
  loading: false,
  error: null,
  stats: {} as Stats
}

type StatsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_STATS'; payload: Stats }

function statsReducer(state: StatsState, action: StatsAction): StatsState {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload }
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload }
    case ACTIONS.SET_STATS:
      return { ...state, stats: action.payload }
    default:
      return state
  }
}

export function useStats() {
  const [state, dispatch] = useReducer(statsReducer, initialStatsState)

  const refreshStats = async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      const stats = await StatsStore.getStats()
      dispatch({ type: ACTIONS.SET_STATS, payload: stats })
    } catch (error) {
      console.error('Error refreshing stats:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload:
          error instanceof Error
            ? error.message
            : `Refresh stats failed, ${error}`
      })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  return {
    stats: state.stats,
    refreshStats
  }
}
