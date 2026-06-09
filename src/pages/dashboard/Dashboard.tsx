import { useMemo } from 'react'
import {
  BookOpen,
  Archive,
  Bell,
  TrendingUp,
  Calendar,
  Target,
  Plus
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from '@/shared/ui/Card'
import Button from '@/shared/ui/Button'
import CountCard from '@/shared/ui/CountCard'
import { useModal } from '@/shared/context/ModalContext'
import { useAppSelector } from '@/store/hooks'
import OnboardingChecklist from './components/OnboardingChecklist'
import DifficultyBreakdown from './components/DifficultyBreakdown'
import WordsToReview from './components/WordsToReview'

const Dashboard = () => {
  const navigate = useNavigate()
  const { loading, words } = useAppSelector((state) => state.words)
  const { contexts } = useAppSelector((state) => state.contexts)
  const { alerts } = useAppSelector((state) => state.alerts)
  const { stats } = useAppSelector((state) => state.stats)
  const { openModal } = useModal()

  const heroMessage = useMemo(() => {
    if (words.length === 0) {
      return {
        title: 'Bem-vindo ao Word Saver! 👋',
        subtitle:
          'Comece criando um contexto e adicionando suas primeiras palavras.'
      }
    }
    if (alerts.length > 0) {
      return {
        title: 'Hora de revisar! 🔔',
        subtitle: `Você tem ${words.length} palavras salvas em ${contexts.length} contextos.`
      }
    }
    return {
      title: 'Olá! 👋',
      subtitle: `Você tem ${words.length} palavras salvas em ${contexts.length} contextos.`
    }
  }, [words.length, contexts.length, alerts.length])

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
      icon: Plus,
      action: () => navigate('/words')
    },
    {
      title: 'Iniciar Revisão',
      description: 'Revisar palavras com flashcards',
      icon: Target,
      action: () =>
        openModal('REVIEW_WORD', {
          contextIds: contexts.map((c) => c.id)
        }),
      disabled: words.length === 0
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
        <h1 className="mb-2 text-3xl font-bold">{heroMessage.title}</h1>
        <p className="text-muted-foreground">{heroMessage.subtitle}</p>
      </div>

      {/* Onboarding */}
      <OnboardingChecklist />

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
            const isDisabled = action.disabled
            return (
              <Card
                key={index}
                onClick={isDisabled ? undefined : action.action}
                clickable={!isDisabled}
                className={
                  isDisabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:bg-surface-hover'
                }
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

      {/* Words to review */}
      <WordsToReview />

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
              {words.length > 0 && (
                <div className="border-t border-border pt-4">
                  <p className="mb-3 text-sm font-medium text-foreground">
                    Distribuição por dificuldade
                  </p>
                  <DifficultyBreakdown />
                </div>
              )}
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
                <Archive className="text-muted-foreground/40 mx-auto mb-4 size-12" />
                <p className="text-muted-foreground">
                  Nenhum contexto criado ainda
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {contexts.slice(0, 5).map((context) => (
                  <div
                    key={context.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {context.icon && (
                        <span className="text-lg leading-none">
                          {context.icon}
                        </span>
                      )}
                      <div
                        className="size-3 shrink-0 rounded-full"
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
            <BookOpen className="text-muted-foreground/40 mx-auto mb-6 size-16" />
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              Bem-vindo ao Word Saver!
            </h3>
            <p className="mb-6 text-muted-foreground">
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
