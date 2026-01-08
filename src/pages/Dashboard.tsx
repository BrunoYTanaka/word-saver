import { useMemo, useEffect } from 'react'
import {
  BookOpen,
  Archive,
  Bell,
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'
import CountCard from '../components/UI/CountCard'
import Table from '../components/UI/Table'
import Tab from '../components/UI/Tab'
import { formatDate } from '../utils/format-date'
import { useModal } from '../context/ModalContext'

const Dashboard = () => {
  const {
    words,
    stats,
    contexts,
    alerts,
    loading,
    initialized,
    deleteWord,
    deleteContext,
    deleteAlert
  } = useApp()

  const { openModal } = useModal()

  // Processar parâmetros da URL quando vindo de notificação
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const reviewParam = urlParams.get('review')
    const alertParam = urlParams.get('alert')

    if (reviewParam && initialized) {
      console.log(
        'Opening from notification - Review contexts:',
        reviewParam,
        'Alert:',
        alertParam
      )

      // Encontrar o alerta correspondente
      const alert = alerts.find((a) => a.id === alertParam)
      if (alert) {
        // Abrir modal de revisão com os contextos
        const contextIds = reviewParam.split(',').filter(Boolean)
        openModal('REVIEW_WORD', {
          contextIds
        })
      }

      // Limpar parâmetros da URL para não reprocessar
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [alerts, openModal, initialized]) // Dependência de alerts para garantir que estão carregados

  const data = useMemo(
    () =>
      words.map((word) => ({
        id: word.id,
        word: word.word,
        definition: word.definition,
        context: contexts.find((c) => c.id === word.contextId)?.name || 'N/A',
        alerts: word.reviewCount ?? 0
      })),
    [words, contexts]
  )

  // Loading state
  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="mb-6 h-8 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 rounded-lg bg-gray-200 dark:bg-gray-700"
              ></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Stats cards data
  const statCards = [
    {
      title: 'Total de Palavras',
      value: stats?.totalWords || 10,
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900-20',
      textColor: 'text-success',
      text: '+5% desde ontem'
    },
    {
      title: 'Contextos',
      value: stats?.totalContexts || 20,
      icon: Archive,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900-20',
      textColor: 'text-destructive',
      text: '-3% desde ontem'
    },
    {
      title: 'Alertas Ativos',
      value: stats?.activeAlerts || 30,
      icon: Bell,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900-20',
      textColor: 'text-gray-500',
      text: '0% desde ontem'
    }
  ]

  // Quick actions
  const quickActions = [
    {
      title: 'Adicionar Palavra',
      description: 'Criar uma nova palavra para estudar',
      icon: BookOpen,
      action: () => openModal('ADD_WORD'),
      color: 'primary'
    },
    {
      title: 'Criar Contexto',
      description: 'Organizar palavras por categoria',
      icon: Archive,
      action: () => openModal('ADD_CONTEXT'),
      color: 'secondary'
    },
    {
      title: 'Configurar Alerta',
      description: 'Lembrete para revisar palavras',
      icon: Bell,
      action: () => openModal('ADD_ALERT'),
      color: 'outline'
    }
  ]

  const tabs = [
    {
      id: 'words',
      label: 'Palavras',
      content: (
        <Table
          onDelete={deleteWord}
          onEdit={(wordId) => openModal('EDIT_WORD', { wordId })}
          data={data}
          columns={[
            {
              title: 'Palavras',
              field: 'word'
            },
            {
              title: 'Definições',
              field: 'definition'
            },
            {
              title: 'Contextos',
              field: 'context'
            },
            {
              title: 'Alertas',
              field: 'alerts'
            },
            {
              title: 'Ações',
              field: 'actions'
            }
          ]}
        />
      )
    },
    {
      id: 'contexts',
      label: 'Contextos',
      content: (
        <Table
          onDelete={deleteContext}
          onEdit={(contextId) => openModal('EDIT_CONTEXT', { contextId })}
          data={contexts.map((context) => ({
            id: context.id,
            name: context.name,
            color: context.color,
            wordCount: context.wordCount || 0
          }))}
          columns={[
            { title: 'Nome', field: 'name' },
            { title: 'Cor', field: 'color' },
            { title: 'Número de Palavras', field: 'wordCount' },
            { title: 'Ações', field: 'actions' }
          ]}
        />
      )
    },
    {
      id: 'alerts',
      label: 'Alertas',
      content: (
        <Table
          onDelete={deleteAlert}
          onEdit={(alertId) => openModal('EDIT_ALERT', { alertId })}
          data={alerts.map((alert) => ({
            id: alert.id,
            frequency: alert.frequency === 'daily' ? 'Diário' : 'Semanal',
            days: alert.days
              .map((day: number) => {
                switch (day) {
                  case 0:
                    return 'Dom'
                  case 1:
                    return 'Seg'
                  case 2:
                    return 'Ter'
                  case 3:
                    return 'Qua'
                  case 4:
                    return 'Qui'
                  case 5:
                    return 'Sex'
                  case 6:
                    return 'Sáb'
                  default:
                    return ''
                }
              })
              .join(', '),
            lastTriggered: formatDate(alert.lastTriggered),
            createdAt: formatDate(alert.createdAt)
          }))}
          columns={[
            { title: 'Frequência', field: 'frequency' },
            { title: 'Dias', field: 'days' },
            { title: 'Criado Em', field: 'createdAt' },
            { title: 'Último Acionamento', field: 'lastTriggered' },
            { title: 'Ações', field: 'actions' }
          ]}
        />
      )
    }
  ]

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      {/* Welcome Section */}
      <div className="text-left sm:text-center">
        <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Acompanhe seu progresso na memorização de palavras
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 rounded-lg bg-card shadow dark:border dark:border-border">
        {statCards.map((stat, index) => {
          return <CountCard key={index} {...stat} number={stat.value} />
        })}
      </div>

      <Tab tabs={tabs} defaultTab="words" variant="underlined" size="md" />

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
                className="hover:bg-card-hover"
              >
                <div className="text-center">
                  <div className="bg-primary-100 dark:bg-primary-900-20 mb-4 inline-flex size-12 items-center justify-center rounded-lg">
                    <Icon className="text-primary-600 dark:text-primary-400 size-6" />
                  </div>
                  <h3 className="mb-2 font-medium text-gray-900 dark:text-gray-100">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent Activity & Progress */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Progress Overview */}
        <Card>
          <Card.Header>
            <Card.Title>Progresso da Semana</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-green-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Palavras Adicionadas
                  </span>
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {stats?.recentWords || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="size-4 text-blue-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Palavras Revisadas
                  </span>
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {stats?.recentReviews || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-purple-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Média de Revisões
                  </span>
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {stats?.averageReviewsPerWord || 0}
                </span>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Recent Contexts */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>Contextos Recentes</Card.Title>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openModal('ADD_CONTEXT')}
              >
                Ver Todos
              </Button>
            </div>
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
                        style={{ backgroundColor: context.color || '#3B82F6' }}
                      />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {context.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {context.wordCount || 0} palavras
                    </span>
                  </div>
                ))}
                {contexts.length > 3 && (
                  <div className="pt-2 text-center">
                    <Button variant="ghost" size="sm">
                      Ver mais {contexts.length - 3} contextos
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Empty State for New Users */}
      {(!stats || stats.totalWords === 0) && (
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
            <Button variant="primary" onClick={() => openModal('ADD_WORD')}>
              Adicionar Primeira Palavra
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default Dashboard
