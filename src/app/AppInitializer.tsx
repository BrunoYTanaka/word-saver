import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { initializeApp } from '@/store/slices/appSlice'
import { useTheme } from '../shared'
import { LoaderCircle } from 'lucide-react'
import ErrorPage from '../pages/ErrorPage'

export function AppInitializer({ children }: { children: React.ReactNode }) {
  const { loading: themeLoading } = useTheme()
  const dispatch = useAppDispatch()
  const {
    loading: appLoading,
    initialized,
    error
  } = useAppSelector((state) => state.app)

  useEffect(() => {
    if (!initialized && !appLoading) {
      dispatch(initializeApp())
    }
  }, [dispatch, initialized, appLoading])

  if (themeLoading || appLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <LoaderCircle className="animate-spin size-8 text-primary" />
          <p className="text-gray-600 dark:text-gray-400">
            Inicializando aplicação...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return <ErrorPage error={error} resetErrorBoundary={() => {}} />
  }

  if (!initialized) {
    return null
  }

  return <>{children}</>
}
