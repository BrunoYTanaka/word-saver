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
  WORDS = '/words',
  FLASHCARDS = '/flashcards',
  QUIZ = '/quiz',
  STATISTICS = '/statistics',
  HELP = '/help'
}
