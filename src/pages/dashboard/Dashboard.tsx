import { useEffect } from 'react'
import {
  BookOpen,
  Archive,
  Bell,
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from '@/shared/ui/Card'
import Button from '@/shared/ui/Button'
import CountCard from '@/shared/ui/CountCard'
import { useModal } from '@/shared/context/ModalContext'
import { useAppSelector } from '@/store/hooks'
import { useApp } from '../../shared'

const Dashboard = () => {
  const navigate = useNavigate()
  const { initialized } = useApp()
  const { loading, words } = useAppSelector((state) => state.words)
  const { contexts } = useAppSelector((state) => state.contexts)
  const { alerts } = useAppSelector((state) => state.alerts)
  const { stats } = useAppSelector((state) => state.stats)

  const { openModal } = useModal()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const reviewParam = urlParams.get('review')
    const alertParam = urlParams.get('alert')

    if (reviewParam && initialized) {
      const alert = alerts.find((a) => a.id === alertParam)
      if (alert) {
        openModal('REVIEW_WORD', {
          contextIds: reviewParam.split(',').filter(Boolean)
        })
      }
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [alerts, openModal, initialized])

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="mb-6 h-8 w-1/3 rounded bg-surface-muted" />
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-lg bg-surface-muted" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total de Palavras',
      value: words.length,
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-primary-soft',
      textColor: 'text-success'
    },
    {
      title: 'Contextos',
      value: contexts.length,
      icon: Archive,
      color: 'text-success',
      bgColor: 'bg-success-soft',
      textColor: 'text-destructive'
    },
    {
      title: 'Alertas Ativos',
      value: alerts.length,
      icon: Bell,
      color: 'text-warning',
      bgColor: 'bg-warning-soft',
      textColor: 'text-muted-foreground'
    }
  ]

  const quickActions = [
    {
      title: 'Adicionar Palavra',
      description: 'Criar uma nova palavra para estudar',
      icon: BookOpen,
      action: () => navigate('/words')
    },
    {
      title: 'Criar Contexto',
      description: 'Organizar palavras por categoria',
      icon: Archive,
      action: () => openModal('ADD_CONTEXT')
    },
    {
      title: 'Configurar Alerta',
      description: 'Lembrete para revisar palavras',
      icon: Bell,
      action: () => openModal('ADD_ALERT')
    }
  ]

  return (
    <div className="space-y-8">
      <div className="text-left sm:text-center">
        <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Acompanhe seu progresso na memorização de palavras
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 rounded-lg bg-surface shadow dark:border dark:border-border">
        {statCards.map((stat, index) => (
          <CountCard key={index} {...stat} number={stat.value} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Ações Rápidas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Card
                key={index}
                onClick={action.action}
                clickable
                className="hover:bg-surface-hover"
              >
                <div className="text-center">
                  <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-surface-muted">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-medium text-foreground">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Progress + Recent Contexts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <Card.Header>
            <Card.Title>Progresso da Semana</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-success" />
                  <span className="text-sm text-muted-foreground">
                    Palavras Adicionadas
                  </span>
                </div>
                <span className="font-medium text-foreground">
                  {stats?.recentWords || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="size-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Palavras Revisadas
                  </span>
                </div>
                <span className="font-medium text-foreground">
                  {stats?.recentReviews || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-accent" />
                  <span className="text-sm text-muted-foreground">
                    Média de Revisões
                  </span>
                </div>
                <span className="font-medium text-foreground">
                  {stats?.averageReviewsPerWord || 0}
                </span>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Contextos Recentes</Card.Title>
          </Card.Header>
          <Card.Content>
            {contexts.length === 0 ? (
              <div className="py-8 text-center">
                <Archive className="mx-auto mb-4 size-12 text-gray-300 dark:text-gray-600" />
                <p className="mb-4 text-gray-500 dark:text-gray-400">
                  Nenhum contexto criado ainda
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openModal('ADD_CONTEXT')}
                >
                  Criar Primeiro Contexto
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {contexts.slice(0, 3).map((context) => (
                  <div
                    key={context.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="size-4 rounded-full"
                        style={{
                          backgroundColor: context.color || 'var(--primary)'
                        }}
                      />
                      <span className="font-medium text-foreground">
                        {context.name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {context.wordCount || 0} palavras
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Empty State */}
      {words.length === 0 && (
        <Card className="py-12 text-center">
          <div className="mx-auto max-w-md">
            <BookOpen className="mx-auto mb-6 size-16 text-gray-300 dark:text-gray-600" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Bem-vindo ao Word Saver!
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Comece adicionando sua primeira palavra para começar a estudar de
              forma organizada.
            </p>
            <Button variant="primary" onClick={() => navigate('/words')}>
              Adicionar Primeira Palavra
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default Dashboard
