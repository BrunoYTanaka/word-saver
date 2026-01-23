import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchStats } from '@/store/slices/statsSlice'

export function useStats() {
  const dispatch = useAppDispatch()
  const { stats, loading, error } = useAppSelector((state) => state.stats)

  const refreshStats = useCallback(async () => {
    await dispatch(fetchStats()).unwrap()
  }, [dispatch])

  return {
    stats,
    loading,
    error,
    refreshStats
  }
}
