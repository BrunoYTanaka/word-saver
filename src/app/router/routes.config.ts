import { lazy } from 'react'
import { AppRoutes, RouteConfig } from './types'

const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'))
const FlashcardsPage = lazy(() => import('@/pages/flashcards/FlashcardsPage'))
const QuizPage = lazy(() => import('@/pages/quiz/QuizPage'))
const StatisticsPage = lazy(() => import('@/pages/statistics/StatisticsPage'))
const WordsPage = lazy(() => import('@/pages/words/WordsPage'))
const HelpPage = lazy(() => import('@/pages/help/HelpPage'))

export const routesConfig: RouteConfig[] = [
  {
    path: AppRoutes.DASHBOARD,
    component: Dashboard,
    protected: true,
    title: 'Dashboard',
    description: 'Visão geral do seu progresso de aprendizado'
  },
  {
    path: AppRoutes.WORDS,
    component: WordsPage,
    protected: true,
    title: 'Palavras',
    description: 'Gerencie seu vocabulário'
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
  },
  {
    path: AppRoutes.HELP,
    component: HelpPage,
    protected: true,
    title: 'Ajuda',
    description: 'Como usar o Word Saver'
  }
]
