export interface RouteConfig {
  path: string
  component: React.ComponentType
  protected?: boolean
  title?: string
  description?: string
}

export interface RouterContextType {
  currentRoute: string
  navigate: (path: string) => void
  goBack: () => void
  isLoading: boolean
}

export enum AppRoutes {
  ROOT = '/',
  DASHBOARD = '/dashboard',
  FLASHCARDS = '/flashcards',
  QUIZ = '/quiz',
  STATISTICS = '/statistics',
  VOCABULARY = '/vocabulary',
  SETTINGS = '/settings',
  BACKUP = '/backup',
  EXPORT = '/export',
  IMPORT = '/import'
}
