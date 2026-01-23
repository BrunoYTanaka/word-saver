import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { clearError } from '@/store/slices/appSlice'

export function useApp() {
  const dispatch = useAppDispatch()
  const {
    loading,
    error,
    initialized,
    selectedContextId,
    isNotificationEnabled
  } = useAppSelector((state) => state.app)

  const handleClearError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  return {
    loading,
    error,
    initialized,
    selectedContextId,
    isNotificationEnabled,
    clearError: handleClearError
  }
}
