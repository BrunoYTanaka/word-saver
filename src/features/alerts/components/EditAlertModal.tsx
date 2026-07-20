import { Clock, Bell, Calendar, Repeat } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updateAlert } from '@/store/slices/alertsSlice'
import Modal from '@/shared/ui/Modal'
import Input from '@/shared/ui/Input'
import Button from '@/shared/ui/Button'
import { useModal } from '@/shared/context/ModalContext'
import { FullAlert } from '../types/alert'

interface EditAlertFormData {
  name: string
  frequency: 'daily' | 'weekly'
  time: string
  contextIds: string[]
  days: number[]
}

type ErrorTypes = {
  [key in keyof EditAlertFormData]?: string
}

interface EditAlertModalProps {
  alertId: string
  onClose?: () => void
}

const EditAlertModal = ({ alertId }: EditAlertModalProps) => {
  const dispatch = useAppDispatch()
  const { alerts, loading } = useAppSelector((state) => state.alerts)
  const { contexts } = useAppSelector((state) => state.contexts)
  const { closeModal } = useModal()

  const alert = alerts.find((a) => a.id === alertId)
  const [formData, setFormData] = useState<EditAlertFormData>({
    name: alert?.name || '',
    frequency: alert?.frequency || 'daily',
    time: alert?.time || '',
    contextIds: alert?.contextIds || [],
    days: alert?.days || []
  })

  const [errors, setErrors] = useState<ErrorTypes>({})

  // Days of week for weekly alerts
  const daysOfWeek = [
    { id: 0, label: 'Dom', name: 'Domingo' },
    { id: 1, label: 'Seg', name: 'Segunda-feira' },
    { id: 2, label: 'Ter', name: 'Terça-feira' },
    { id: 3, label: 'Qua', name: 'Quarta-feira' },
    { id: 4, label: 'Qui', name: 'Quinta-feira' },
    { id: 5, label: 'Sex', name: 'Sexta-feira' },
    { id: 6, label: 'Sáb', name: 'Sábado' }
  ]

  // Update form data when alert changes
  useEffect(() => {
    if (!alert) return
    setFormData({
      name: alert.name,
      frequency: alert.frequency,
      time: alert.time,
      contextIds: alert.contextIds,
      days: alert.days
    })
    setErrors({})
  }, [alert])

  // Handle input changes
  const handleChange = (field: keyof EditAlertFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // Handle context selection
  const handleContextToggle = (contextId: string) => {
    setFormData((prev) => {
      const isSelected = prev.contextIds.includes(contextId)
      const newContextIds = isSelected
        ? prev.contextIds.filter((id) => id !== contextId)
        : [...prev.contextIds, contextId]

      return { ...prev, contextIds: newContextIds }
    })

    // Clear context error
    if (errors.contextIds) {
      setErrors((prev) => ({ ...prev, contextIds: '' }))
    }
  }

  // Handle day selection for weekly alerts
  const handleDayToggle = (dayId: number) => {
    setFormData((prev) => {
      const isSelected = prev.days.includes(dayId)
      const newDays = isSelected
        ? prev.days.filter((id) => id !== dayId)
        : [...prev.days, dayId].sort()

      return { ...prev, days: newDays }
    })

    // Clear days error
    if (errors.days) {
      setErrors((prev) => ({ ...prev, days: '' }))
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors: ErrorTypes = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do alerta é obrigatório'
    }

    if (!formData.time) {
      newErrors.time = 'Horário é obrigatório'
    }

    if (formData.contextIds.length === 0) {
      newErrors.contextIds = 'Selecione pelo menos um contexto'
    }

    if (formData.frequency === 'weekly' && formData.days.length === 0) {
      newErrors.days = 'Selecione pelo menos um dia da semana'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm() || !alert) {
      return
    }

    const updatedAlertData: FullAlert = {
      ...alert,
      name: formData.name.trim(),
      frequency: formData.frequency,
      time: formData.time,
      contextIds: formData.contextIds,
      days: formData.days
    }

    try {
      await dispatch(updateAlert(updatedAlertData)).unwrap()
      // Close modal after successful update
      handleClose()
    } catch (error) {
      console.error('Error updating alert:', error)
    } finally {
      closeModal('EDIT_ALERT')
    }
  }

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      closeModal('EDIT_ALERT')
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title="Editar Alerta"
      size="md"
      className="max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Limitation notice */}
        <div className="border-warning/30 rounded-lg border bg-warning-soft p-3 text-sm text-warning">
          ⚠️ Este app não tem servidor: os alertas só disparam enquanto o Word
          Saver estiver aberto em uma aba do navegador. Com o app fechado, a
          notificação não é enviada.
        </div>

        {/* Alert Name */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Bell className="size-4" />
            <label className="block text-sm font-medium">Nome do Alerta</label>
          </div>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ex: Revisão Matinal de Inglês"
            error={errors.name}
            disabled={loading}
          />
        </div>

        {/* Frequency Selection */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Repeat className="size-4" />
            <label className="block text-sm font-medium ">Frequência</label>
          </div>
          <div className="flex gap-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="frequency"
                value="daily"
                checked={formData.frequency === 'daily'}
                onChange={(e) => handleChange('frequency', e.target.value)}
                className="mr-2"
                disabled={loading}
              />
              <span className="text-sm ">Diário</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="frequency"
                value="weekly"
                checked={formData.frequency === 'weekly'}
                onChange={(e) => handleChange('frequency', e.target.value)}
                className="mr-2"
                disabled={loading}
              />
              <span className="text-sm ">Semanal</span>
            </label>
          </div>
        </div>

        {/* Days Selection (for weekly alerts) */}
        {formData.frequency === 'weekly' && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="size-4" />
              <label className="block text-sm font-medium ">
                Dias da Semana
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => handleDayToggle(day.id)}
                  disabled={loading}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    formData.days.includes(day.id)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'rounded-full border border-border bg-surface p-2 text-foreground transition-colors hover:bg-surface-muted'
                  } ${
                    loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
            {errors.days && (
              <p className="mt-1 text-sm text-destructive">{errors.days}</p>
            )}
          </div>
        )}

        {/* Time Selection */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Clock className="size-4" />
            <label className="block text-sm font-medium ">Horário</label>
          </div>
          <Input
            type="time"
            value={formData.time}
            onChange={(e) => handleChange('time', e.target.value)}
            error={errors.time}
            disabled={loading}
          />
        </div>

        {/* Context Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium ">
            Contextos para Revisão
          </label>
          <div className="max-h-32 space-y-2 overflow-y-auto rounded-lg border bg-surface-muted p-3">
            {contexts.length > 0 ? (
              contexts.map((context) => (
                <label key={context.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.contextIds.includes(context.id)}
                    onChange={() => handleContextToggle(context.id)}
                    className="mr-2"
                    disabled={loading}
                  />
                  <span className="text-sm ">{context.name}</span>
                  <span className="ml-2 text-xs">
                    ({context.wordCount || 0} palavras)
                  </span>
                </label>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum contexto disponível
              </p>
            )}
          </div>
          {errors.contextIds && (
            <p className="mt-1 text-sm text-destructive">{errors.contextIds}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || contexts.length === 0}
            className="flex-1"
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default EditAlertModal
