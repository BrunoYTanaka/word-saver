import { Clock, Bell, Calendar, Repeat } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import Modal from '../UI/Modal'
import Input from '../UI/Input'
import { useModal } from '../../context/ModalContext'

interface SetAlertFormData {
  name: string
  frequency: 'daily' | 'weekly'
  time: string
  contextIds: string[]
  days: number[]
}

type ErrorTypes = {
  [key in keyof SetAlertFormData]?: string
}

const AddAlertModal = () => {
  const { addAlert, contexts, loading } = useApp()
  const { closeModal } = useModal()

  const [formData, setFormData] = useState<SetAlertFormData>({
    name: '',
    frequency: 'daily', // 'daily' | 'weekly'
    time: '09:00',
    contextIds: [],
    days: [1, 2, 3, 4, 5] // Default weekdays for weekly alerts (Monday to Friday)
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

  // Handle input changes
  const handleChange = (field: keyof SetAlertFormData, value: string) => {
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
  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.FormEvent
  ) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await addAlert(formData)
      // Modal will be closed by the context action
    } catch (error) {
      console.error('Error creating alert:', error)
    } finally {
      closeModal('ADD_ALERT')
    }
  }

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      closeModal('ADD_ALERT')
    }
  }

  const modalFooter = (
    <Modal.Footer.Actions
      onCancel={handleClose}
      onConfirm={handleSubmit}
      cancelText="Cancelar"
      confirmText="Adicionar Palavra"
      confirmVariant="primary"
      loading={loading}
    />
  )

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title="Configurar Alerta"
      size="md"
      footer={modalFooter}
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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
            <label className="block text-sm font-medium">Frequência</label>
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
              <span className="text-sm">Diário</span>
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
              <span className="text-sm">Semanal</span>
            </label>
          </div>
        </div>

        {/* Days Selection (for weekly alerts) */}
        {formData.frequency === 'weekly' && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="size-4" />
              <label className="block text-sm font-medium">
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
              <p className="mt-1 text-sm text-destructive-foreground">
                {errors.days}
              </p>
            )}
          </div>
        )}

        {/* Time Selection */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Clock className="size-4" />
            <label className="block text-sm font-medium">Horário</label>
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
          <label className="mb-2 block text-sm font-medium">
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
                  <span className="text-sm">{context.name}</span>
                  <span className="ml-2 text-xs text-muted">
                    ({context.wordCount || 0} palavras)
                  </span>
                </label>
              ))
            ) : (
              <p className="text-sm text-muted">Nenhum contexto disponível</p>
            )}
          </div>
          {errors.contextIds && (
            <p className="mt-1 text-sm text-destructive">{errors.contextIds}</p>
          )}
        </div>
      </form>
    </Modal>
  )
}

export default AddAlertModal
