import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchContexts,
  addContext as addContextAction,
  updateContext as updateContextAction,
  deleteContext as deleteContextAction
} from '@/store/slices/contextsSlice'
import { FullContext, Context } from '../types/context'

export function useContexts() {
  const dispatch = useAppDispatch()
  const { contexts, loading, error } = useAppSelector((state) => state.contexts)

  useEffect(() => {
    dispatch(fetchContexts())
  }, [dispatch])

  const addContext = useCallback(
    async (contextData: Context) => {
      await dispatch(addContextAction(contextData)).unwrap()
    },
    [dispatch]
  )

  const updateContext = useCallback(
    async (contextData: FullContext) => {
      await dispatch(updateContextAction(contextData)).unwrap()
    },
    [dispatch]
  )

  const deleteContext = useCallback(
    async (contextId: string) => {
      await dispatch(deleteContextAction(contextId)).unwrap()
    },
    [dispatch]
  )

  const refreshContexts = useCallback(async () => {
    await dispatch(fetchContexts()).unwrap()
  }, [dispatch])

  return {
    contexts,
    loading,
    error,
    addContext,
    updateContext,
    deleteContext,
    refreshContexts
  }
}
