import Dashboard from '@/pages/dashboard/Dashboard'
import { Flashcards, Quiz, Statistics } from '@/features'
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
    component: Flashcards,
    protected: true,
    title: 'Flashcards',
    description: 'Sistema de cartões de memorização'
  },
  {
    path: AppRoutes.QUIZ,
    component: Quiz,
    protected: true,
    title: 'Quiz',
    description: 'Teste seus conhecimentos'
  },
  {
    path: AppRoutes.STATISTICS,
    component: Statistics,
    protected: true,
    title: 'Estatísticas',
    description: 'Acompanhe seu progresso detalhado'
  }
]
