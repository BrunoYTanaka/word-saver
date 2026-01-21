import { useMemo } from 'react'
import {
  TrendingUp,
  BookOpen,
  Tag,
  Calendar,
  Clock,
  Target,
  Award,
  BarChart3
} from 'lucide-react'
import { useWords } from '@/features/vocabulary/words/hooks/useWords'
import { useContexts } from '@/features/vocabulary/contexts/hooks/useContexts'
import { useAlerts } from '@/features/alerts/hooks/useAlerts'
import Card from '@/shared/ui/Card'
import { FullWord } from '@/features/vocabulary/words/types/word'

const Statistics = () => {
  const { words } = useWords()
  const { contexts } = useContexts()
  const { alerts } = useAlerts()

  const stats = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Words by context
    const wordsByContext = contexts
      .map((context) => ({
        name: context.name,
        count: words.filter((word) => word.contextId === context.id).length,
        id: context.id
      }))
      .sort((a, b) => b.count - a.count)

    // Recent activity (words added in different periods)
    const wordsToday = words.filter((word) => {
      const wordDate = new Date(word.createdAt)
      return wordDate >= today
    }).length

    const wordsThisWeek = words.filter((word) => {
      const wordDate = new Date(word.createdAt)
      return wordDate >= thisWeek
    }).length

    const wordsThisMonth = words.filter((word) => {
      const wordDate = new Date(word.createdAt)
      return wordDate >= thisMonth
    }).length

    // Tags analysis
    const tagCount = new Map<string, number>()
    words.forEach((word: FullWord) => {
      if (word.tags) {
        const tags =
          word?.tags ||
          ''
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        tags.forEach((tag) => {
          tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
        })
      }
    })

    const topTags = Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    // Learning streak (simplified - based on word creation dates)
    const wordDates = words
      .filter((word) => word.lastReviewed)
      .map((word) => {
        const date = new Date(word.lastReviewed!)
        return new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        ).getTime()
      })
      .sort((a, b) => b - a)

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    const uniqueDates = [...new Set(wordDates)]

    if (uniqueDates.length > 0) {
      // Check if today has activity
      if (uniqueDates[0] === today.getTime()) {
        currentStreak = 1
        tempStreak = 1
      }

      // Calculate streaks
      for (let i = 1; i < uniqueDates.length; i++) {
        const dayDiff =
          (uniqueDates[i - 1] - uniqueDates[i]) / (24 * 60 * 60 * 1000)

        if (dayDiff === 1) {
          if (i === 1 && uniqueDates[0] === today.getTime()) {
            currentStreak++
          }
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak)
    }

    // Average words per context
    const avgWordsPerContext =
      contexts.length > 0
        ? Math.round((words.length / contexts.length) * 10) / 10
        : 0

    // Storage usage estimation
    const dataSize = JSON.stringify({ words, contexts, alerts }).length
    const sizeInKB = (dataSize / 1024).toFixed(1)

    return {
      total: words.length,
      contexts: contexts.length,
      alerts: alerts.length,
      wordsToday,
      wordsThisWeek,
      wordsThisMonth,
      wordsByContext,
      topTags,
      currentStreak,
      longestStreak,
      avgWordsPerContext,
      storageSize: sizeInKB
    }
  }, [words, contexts, alerts])

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥'
    if (streak >= 14) return '⚡'
    if (streak >= 7) return '🌟'
    if (streak >= 3) return '✨'
    return '💫'
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            📊 Estatísticas
          </h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso e analise seus dados de aprendizado
          </p>
        </div>

        {/* Overview Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <BookOpen className="size-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">
              Total de Palavras
            </div>
          </Card>

          <Card className="text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Tag className="size-5 text-success" />
            </div>
            <div className="text-3xl font-bold text-success">
              {stats.contexts}
            </div>
            <div className="text-sm text-muted-foreground">Contextos</div>
          </Card>

          <Card className="text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Target className="size-5 text-warning" />
            </div>
            <div className="text-3xl font-bold text-warning">
              {stats.alerts}
            </div>
            <div className="text-sm text-muted-foreground">Alertas Ativos</div>
          </Card>

          <Card className="text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <Award className="size-5 text-destructive" />
            </div>
            <div className="text-3xl font-bold text-destructive">
              {stats.avgWordsPerContext}
            </div>
            <div className="text-sm text-muted-foreground">
              Média por Contexto
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <Calendar className="size-5" />
              Atividade Recente
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">Hoje</div>
                  <div className="text-sm text-muted-foreground">
                    Palavras adicionadas
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {stats.wordsToday}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">Esta Semana</div>
                  <div className="text-sm text-muted-foreground">
                    Últimos 7 dias
                  </div>
                </div>
                <div className="text-2xl font-bold text-success">
                  {stats.wordsThisWeek}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">Este Mês</div>
                  <div className="text-sm text-muted-foreground">Mês atual</div>
                </div>
                <div className="text-2xl font-bold text-warning">
                  {stats.wordsThisMonth}
                </div>
              </div>
            </div>
          </Card>

          {/* Learning Streaks */}
          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <TrendingUp className="size-5" />
              Sequências de Estudo
            </h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="mb-2 text-4xl">
                  {getStreakEmoji(stats.currentStreak)}
                </div>
                <div className="text-3xl font-bold text-primary">
                  {stats.currentStreak}
                </div>
                <div className="text-sm text-muted-foreground">
                  Sequência Atual
                </div>
              </div>
              <div className="border-t border-border pt-4 text-center">
                <div className="text-2xl font-bold text-foreground">
                  {stats.longestStreak}
                </div>
                <div className="text-sm text-muted-foreground">
                  Maior Sequência
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Words by Context */}
        <Card className="mb-8">
          <h3 className="mb-6 flex items-center gap-2 font-semibold text-foreground">
            <BarChart3 className="size-5" />
            Palavras por Contexto
          </h3>
          {stats.wordsByContext.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Nenhum contexto criado ainda
            </div>
          ) : (
            <div className="space-y-4">
              {stats.wordsByContext.map((context) => {
                const maxCount = Math.max(
                  ...stats.wordsByContext.map((c) => c.count)
                )
                const percentage =
                  maxCount > 0 ? (context.count / maxCount) * 100 : 0

                return (
                  <div key={context.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">
                        {context.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {context.count} palavra{context.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Top Tags */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <h3 className="mb-6 flex items-center gap-2 font-semibold text-foreground">
              <Tag className="size-5" />
              Tags Mais Utilizadas
            </h3>
            {stats.topTags.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Nenhuma tag encontrada
              </div>
            ) : (
              <div className="space-y-3">
                {stats.topTags.map(([tag, count], index) => (
                  <div key={tag} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                      <span className="font-medium text-foreground">{tag}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {count} palavra{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* System Stats */}
          <Card>
            <h3 className="mb-6 flex items-center gap-2 font-semibold text-foreground">
              <Clock className="size-5" />
              Informações do Sistema
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">
                    Armazenamento Usado
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Dados locais (IndexedDB)
                  </div>
                </div>
                <div className="text-lg font-bold text-primary">
                  {stats.storageSize} KB
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">
                    Última Atualização
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Dados sincronizados
                  </div>
                </div>
                <div className="text-lg font-bold text-success">Agora</div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">Status</div>
                  <div className="text-sm text-muted-foreground">Aplicação</div>
                </div>
                <div className="text-lg font-bold text-success">✓ Online</div>
              </div>
            </div>
          </Card>
        </div>
        {/* Insights */}
        {/* {stats.total > 0 && (
          <Card className="mt-8">
            <h3 className="mb-4 font-semibold text-foreground">💡 Insights</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stats.currentStreak >= 7 && (
                <div className="rounded-lg border border-success bg-success-soft p-4">
                  <div className="font-medium text-success">
                    🔥 Sequência Incrível!
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Você está há {stats.currentStreak} dias consecutivos
                    estudando!
                  </div>
                </div>
              )}

              {stats.wordsByContext.length > 0 &&
                stats.wordsByContext[0].count > stats.total * 0.5 && (
                  <div className="rounded-lg border border-warning bg-warning-soft p-4">
                    <div className="font-medium text-warning">
                      ⚖️ Diversifique seus estudos
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {Math.round(
                        (stats.wordsByContext[0].count / stats.total) * 100
                      )}
                      % das suas palavras estão em um contexto só.
                    </div>
                  </div>
                )}

              {stats.topTags.length === 0 && stats.total > 5 && (
                <div className="rounded-lg border border-primary bg-primary-soft p-4">
                  <div className="font-medium text-primary">
                    🏷️ Use mais tags!
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Tags ajudam a organizar e encontrar suas palavras mais
                    facilmente.
                  </div>
                </div>
              )}
            </div>
          </Card>
        )} */}
      </div>
    </div>
  )
}

export default Statistics
