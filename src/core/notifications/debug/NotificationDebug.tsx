import { useEffect, useMemo, useState } from 'react'
import { Bell, X, BellRing, Play, RefreshCw } from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import Button from '@/shared/ui/Button'
import { cn } from '@/shared/utils/cn'
import notificationService from '../notification'
import type { PermissionStatus } from '../notification/types'

type LogEntry = {
  id: string
  time: string
  message: string
  tone: 'info' | 'success' | 'error'
}

const PERMISSION_TONE: Record<NotificationPermission, string> = {
  granted: 'text-success',
  denied: 'text-destructive',
  default: 'text-warning'
}

const PERMISSION_LABEL: Record<NotificationPermission, string> = {
  granted: 'Concedida',
  denied: 'Negada',
  default: 'Pendente'
}

const NotificationDebug = () => {
  const { alerts } = useAppSelector((state) => state.alerts)
  const { contexts } = useAppSelector((state) => state.contexts)
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<PermissionStatus>(() =>
    notificationService.getPermissionStatus()
  )
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [busy, setBusy] = useState(false)

  const refreshStatus = () =>
    setStatus(notificationService.getPermissionStatus())

  useEffect(() => {
    if (isOpen) refreshStatus()
  }, [isOpen])

  const log = (message: string, tone: LogEntry['tone'] = 'info') => {
    setLogs((prev) =>
      [
        {
          id: crypto.randomUUID(),
          time: new Date().toLocaleTimeString('pt-BR'),
          message,
          tone
        },
        ...prev
      ].slice(0, 8)
    )
  }

  const handleRequestPermission = async () => {
    setBusy(true)
    try {
      const result = await notificationService.requestPermission()
      refreshStatus()
      log(
        `Permissão: ${PERMISSION_LABEL[result]}`,
        result === 'granted' ? 'success' : 'error'
      )
    } finally {
      setBusy(false)
    }
  }

  const handleSimpleTest = async () => {
    setBusy(true)
    try {
      await notificationService.showNotification('🔔 Teste de Notificação', {
        body: 'Funcionou! Esta é uma notificação de teste do Word Saver.',
        data: { type: 'review-reminder' }
      })
      log('Notificação simples enviada', 'success')
    } catch (err) {
      log(`Erro: ${err instanceof Error ? err.message : String(err)}`, 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleReviewTest = async () => {
    const firstContextId = contexts[0]?.id
    if (!firstContextId) {
      log('Crie ao menos um contexto antes de testar', 'error')
      return
    }
    setBusy(true)
    try {
      await notificationService.showNotification('📚 Hora de revisar!', {
        body: 'Clique para iniciar uma sessão de revisão.',
        data: {
          type: 'word-review',
          alertId: 'debug-test',
          contextIds: [firstContextId]
        },
        requireInteraction: true
      })
      log(
        `Notificação de revisão enviada (contexto: ${firstContextId})`,
        'success'
      )
    } catch (err) {
      log(`Erro: ${err instanceof Error ? err.message : String(err)}`, 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleTriggerAlert = async (alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId)
    if (!alert) return
    setBusy(true)
    try {
      await notificationService.triggerAlertNow(alert)
      log(`Alerta "${alert.name}" disparado`, 'success')
    } catch (err) {
      log(`Erro: ${err instanceof Error ? err.message : String(err)}`, 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleReschedule = async () => {
    setBusy(true)
    try {
      await notificationService.rescheduleAlerts()
      log('Todos os alertas reagendados', 'success')
    } finally {
      setBusy(false)
    }
  }

  const statusInfo = useMemo(
    () => ({
      tone: PERMISSION_TONE[status.permission],
      label: PERMISSION_LABEL[status.permission]
    }),
    [status.permission]
  )

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        title="Debug de notificações (dev only)"
        aria-label="Abrir debug de notificações"
      >
        <BellRing className="size-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-h-[80vh] w-[360px] flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-2xl">
      <div className="flex items-center justify-between border-b border-border bg-surface-muted px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-primary" />
          <h3 className="font-semibold text-foreground">Notification Debug</h3>
          <span className="rounded bg-warning-soft px-1.5 py-0.5 text-xs font-medium text-warning">
            DEV
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Fechar debug"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* Status */}
        <section className="space-y-2 rounded-md bg-surface-muted p-3">
          <h4 className="text-sm font-semibold text-foreground">Status</h4>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Suportado</dt>
              <dd
                className={cn(
                  'font-medium',
                  status.supported ? 'text-success' : 'text-destructive'
                )}
              >
                {status.supported ? 'Sim' : 'Não'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Permissão</dt>
              <dd className={cn('font-medium', statusInfo.tone)}>
                {statusInfo.label}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Habilitado</dt>
              <dd
                className={cn(
                  'font-medium',
                  status.enabled ? 'text-success' : 'text-muted-foreground'
                )}
              >
                {status.enabled ? 'Sim' : 'Não'}
              </dd>
            </div>
          </dl>
        </section>

        {/* Actions */}
        <section className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Ações</h4>
          <div className="grid gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRequestPermission}
              disabled={busy || status.permission === 'granted'}
            >
              Solicitar permissão
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSimpleTest}
              disabled={busy || !status.enabled}
            >
              Enviar notificação simples
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReviewTest}
              disabled={busy || !status.enabled || contexts.length === 0}
            >
              Enviar notificação de revisão
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReschedule}
              disabled={busy || !status.enabled}
            >
              <span className="flex items-center justify-center gap-1.5">
                <RefreshCw className="size-3.5" />
                Reagendar alertas
              </span>
            </Button>
          </div>
        </section>

        {/* Alerts */}
        <section className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">
            Alertas cadastrados ({alerts.length})
          </h4>
          {alerts.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nenhum alerta cadastrado.
            </p>
          ) : (
            <ul className="space-y-1">
              {alerts.map((alert) => (
                <li
                  key={alert.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-border p-2 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {alert.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {alert.time} · {alert.frequency}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTriggerAlert(alert.id)}
                    disabled={busy || !status.enabled}
                    className="hover:bg-primary-soft/80 flex shrink-0 items-center gap-1 rounded bg-primary-soft px-2 py-1 text-xs font-medium text-primary disabled:opacity-50"
                    title="Disparar agora"
                  >
                    <Play className="size-3" />
                    Disparar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Logs */}
        {logs.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">Logs</h4>
              <button
                type="button"
                onClick={() => setLogs([])}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Limpar
              </button>
            </div>
            <ul className="space-y-1">
              {logs.map((entry) => (
                <li
                  key={entry.id}
                  className={cn(
                    'rounded-md border border-border p-2 text-xs',
                    entry.tone === 'success' &&
                      'border-success/30 text-success',
                    entry.tone === 'error' &&
                      'border-destructive/30 text-destructive',
                    entry.tone === 'info' && 'text-muted-foreground'
                  )}
                >
                  <span className="font-mono opacity-60">{entry.time}</span>{' '}
                  {entry.message}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}

export default NotificationDebug
