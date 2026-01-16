import { useLocation, useNavigate } from 'react-router-dom'
import { AppRoutes, type RouteConfig } from '@/app/router/types'
import { routesConfig } from '@/app/router/routes.config'

export function useAppRouter() {
  const navigate = useNavigate()
  const location = useLocation()

  const navigateTo = (route: AppRoutes | string, replace = false) => {
    navigate(route, { replace })
  }

  const goBack = () => {
    navigate(-1)
  }

  const goForward = () => {
    navigate(1)
  }

  const isCurrentRoute = (route: AppRoutes | string): boolean => {
    return location.pathname === route
  }

  const isSubRoute = (route: AppRoutes | string): boolean => {
    return location.pathname.startsWith(route)
  }

  const getCurrentRouteInfo = () => {
    const routeConfig = routesConfig.find(
      (route: RouteConfig) => route.path === location.pathname
    )
    return {
      path: location.pathname,
      search: location.search,
      hash: location.hash,
      state: location.state,
      config: routeConfig,
      title: routeConfig?.title || 'Word Saver',
      description:
        routeConfig?.description || 'Aplicativo de aprendizado de vocabulário'
    }
  }

  const buildUrl = (
    route: AppRoutes | string,
    params?: Record<string, string>
  ): string => {
    if (!params || Object.keys(params).length === 0) {
      return route
    }

    const searchParams = new URLSearchParams(params)
    return `${route}?${searchParams.toString()}`
  }

  return {
    currentPath: location.pathname,
    currentSearch: location.search,
    currentHash: location.hash,
    currentState: location.state,
    routeInfo: getCurrentRouteInfo(),

    navigateTo,
    goBack,
    goForward,
    isCurrentRoute,
    isSubRoute,
    buildUrl
  }
}
