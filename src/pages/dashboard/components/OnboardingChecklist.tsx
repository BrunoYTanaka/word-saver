import { useMemo } from 'react'
import { Plus, Archive, Bell, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { useModal } from '@/shared/context/ModalContext'
import Card from '@/shared/ui/Card'
import { cn } from '@/shared/utils/cn'

const OnboardingChecklist = () => {
  const navigate = useNavigate()
  const { openModal } = useModal()
  const { words } = useAppSelector((state) => state.words)
  const { contexts } = useAppSelector((state) => state.contexts)
  const { alerts } = useAppSelector((state) => state.alerts)

  const steps = useMemo(
    () => [
      {
        title: 'Crie um contexto',
        description:
          'Organize suas palavras por categorias (ex: Inglês, Trabalho).',
        icon: Archive,
        done: contexts.length > 0,
        action: () => navigate('/words')
      },
      {
        title: 'Adicione sua primeira palavra',
        description: 'Salve uma palavra com sua definição para começar.',
        icon: Plus,
        done: words.length > 0,
        action: () => navigate('/words')
      },
      {
        title: 'Configure um alerta de revisão',
        description: 'Receba notificações para revisar suas palavras.',
        icon: Bell,
        done: alerts.length > 0,
        action: () => openModal('ADD_ALERT')
      }
    ],
    [words.length, contexts.length, alerts.length, navigate, openModal]
  )

  const allDone = steps.every((step) => step.done)
  if (allDone) return null

  const completed = steps.filter((s) => s.done).length

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center justify-between">
          <Card.Title>Começando com o Word Saver</Card.Title>
          <span className="text-sm text-muted-foreground">
            {completed} de {steps.length} concluídos
          </span>
        </div>
      </Card.Header>
      <Card.Content>
        <ul className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <li key={index}>
                <button
                  type="button"
                  onClick={step.action}
                  disabled={step.done}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors',
                    step.done
                      ? 'cursor-default opacity-60'
                      : 'hover:bg-surface-hover'
                  )}
                >
                  <div
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full',
                      step.done
                        ? 'bg-success text-success-foreground'
                        : 'bg-primary-soft text-primary'
                    )}
                  >
                    {step.done ? (
                      <Check className="size-4" />
                    ) : (
                      <Icon className="size-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={cn(
                        'font-medium text-foreground',
                        step.done && 'line-through'
                      )}
                    >
                      {step.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </Card.Content>
    </Card>
  )
}

export default OnboardingChecklist
