import { useCallback, useEffect, useReducer } from 'react'
import alertStore from '../stores/alert-store'
import notificationService from '@/core/notifications'
import { FullAlert, Alert } from '../types/alert'

const ACTIONS = {
  SET_LOADING: 'SET_LOADING' as const,
  SET_ERROR: 'SET_ERROR' as const,
  GET_ALL_ALERTS: 'GET_ALL_ALERTS' as const,
  UPDATE_ALERT: 'UPDATE_ALERT' as const,
  DELETE_ALERT: 'DELETE_ALERT' as const
}

interface AlertState {
  loading: boolean
  error: string | null
  alerts: FullAlert[]
}

const initialAlertState: AlertState = {
  loading: false,
  error: null,
  alerts: []
}

type AlertAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'GET_ALL_ALERTS'; payload: FullAlert[] }
  | { type: 'UPDATE_ALERT'; payload: FullAlert }
  | { type: 'DELETE_ALERT'; payload: string }

function alertReducer(state: AlertState, action: AlertAction): AlertState {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload }
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload }
    case ACTIONS.GET_ALL_ALERTS:
      return { ...state, alerts: action.payload }
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
    default:
      return state
  }
}

interface UseAlerts {
  alerts: FullAlert[]
  loading: boolean
  error: string | null
  addAlert: (alertData: Alert) => Promise<void>
  updateAlert: (alertData: FullAlert) => Promise<void>
  deleteAlert: (alertId: string) => Promise<void>
  refreshAlerts: () => Promise<void>
}

export function useAlerts(): UseAlerts {
  const [state, dispatch] = useReducer(alertReducer, initialAlertState)

  const fetchAlerts = useCallback(async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      const allAlerts = await alertStore.getAll()
      dispatch({ type: ACTIONS.GET_ALL_ALERTS, payload: allAlerts })
    } catch (error) {
      console.error('Error fetching alerts:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload:
          error instanceof Error
            ? error.message
            : `Fetch all alerts failed, ${error}`
      })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const addAlert = async (alertData: Alert) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      const alert = await alertStore.addAlert(alertData)

      // Schedule the alert
      await notificationService.scheduleAlert(alert)

      await fetchAlerts()
    } catch (error) {
      console.error('Error adding alert:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload:
          error instanceof Error ? error.message : `Add alert failed, ${error}`
      })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  const updateAlert = async (alertData: FullAlert) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      await alertStore.update(alertData)

      // Cancel and reschedule
      notificationService.cancelAlert(alertData.id)
      if (alertData.isActive) {
        await notificationService.scheduleAlert(alertData)
      }

      dispatch({ type: ACTIONS.UPDATE_ALERT, payload: alertData })
    } catch (error) {
      console.error('Error updating alert:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload:
          error instanceof Error
            ? error.message
            : `Update alert failed, ${error}`
      })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  const deleteAlert = async (alertId: string) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })

      // Cancel scheduled alert
      notificationService.cancelAlert(alertId)

      await alertStore.delete(alertId)
      dispatch({ type: ACTIONS.DELETE_ALERT, payload: alertId })
    } catch (error) {
      console.error('Error deleting alert:', error)
      dispatch({
        type: ACTIONS.SET_ERROR,
        payload:
          error instanceof Error
            ? error.message
            : `Delete alert failed, ${error}`
      })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  return {
    alerts: state.alerts,
    loading: state.loading,
    error: state.error,
    addAlert,
    updateAlert,
    deleteAlert,
    refreshAlerts: fetchAlerts
  }
}
