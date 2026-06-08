import Dashboard from '@/pages/dashboard/Dashboard'
import FlashcardsPage from '@/pages/flashcards/FlashcardsPage'
import QuizPage from '@/pages/quiz/QuizPage'
import StatisticsPage from '@/pages/statistics/StatisticsPage'
import { AppRoutes, RouteConfig } from './types'

export const routesConfig: RouteConfig[] = [
  {
    path: AppRoutes.DASHBOARD,
    component: Dashboard,
    protected: true,
    title: 'Dashboard',
    description: 'Visão geral do seu progresso de aprendizado'
  },
  {
    path: AppRoutes.FLASHCARDS,
    component: FlashcardsPage,
    protected: true,
    title: 'Flashcards',
    description: 'Sistema de cartões de memorização'
  },
  {
    path: AppRoutes.QUIZ,
    component: QuizPage,
    protected: true,
    title: 'Quiz',
    description: 'Teste seus conhecimentos'
  },
  {
    path: AppRoutes.STATISTICS,
    component: StatisticsPage,
    protected: true,
    title: 'Estatísticas',
    description: 'Acompanhe seu progresso detalhado'
  }
]
