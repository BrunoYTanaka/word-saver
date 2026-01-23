import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchAlerts,
  addAlert as addAlertAction,
  updateAlert as updateAlertAction,
  deleteAlert as deleteAlertAction
} from '@/store/slices/alertsSlice'
import { FullAlert, Alert } from '../types/alert'

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
  const dispatch = useAppDispatch()
  const { alerts, loading, error } = useAppSelector((state) => state.alerts)

  useEffect(() => {
    dispatch(fetchAlerts())
  }, [dispatch])

  const addAlert = useCallback(
    async (alertData: Alert) => {
      await dispatch(addAlertAction(alertData)).unwrap()
    },
    [dispatch]
  )

  const updateAlert = useCallback(
    async (alertData: FullAlert) => {
      await dispatch(updateAlertAction(alertData)).unwrap()
    },
    [dispatch]
  )

  const deleteAlert = useCallback(
    async (alertId: string) => {
      await dispatch(deleteAlertAction(alertId)).unwrap()
    },
    [dispatch]
  )

  const refreshAlerts = useCallback(async () => {
    await dispatch(fetchAlerts()).unwrap()
  }, [dispatch])

  return {
    alerts,
    loading,
    error,
    addAlert,
    updateAlert,
    deleteAlert,
    refreshAlerts
  }
}
