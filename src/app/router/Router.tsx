import { Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import { AppRoutes } from './types'
import ErrorPage from '../../pages/ErrorPage'
import NotFoundPage from '../../pages/NotFoundPage'
import { routesConfig } from './routes.config'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function Router() {
  return (
    <ErrorBoundary FallbackComponent={ErrorPage}>
      <Routes>
        <Route
          path={AppRoutes.ROOT}
          element={<Navigate to={AppRoutes.DASHBOARD} replace />}
        />

        {routesConfig.map((route) => {
          const Component = route.component

          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.protected ? (
                  <ProtectedRoute>
                    <Component />
                  </ProtectedRoute>
                ) : (
                  <Component />
                )
              }
            />
          )
        })}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default Router
