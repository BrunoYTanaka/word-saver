import { Clock, Bell, Calendar, Repeat } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import Modal from '../UI/Modal'
import Input from '../UI/Input'
import Button from '../UI/Button'
import { useModal } from '../../context/ModalContext'
import { FullAlert } from '../../types/alert'

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
  const { alerts, updateAlert, contexts, loading } = useApp()
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
      await updateAlert(updatedAlertData)
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
        {/* Alert Name */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Bell className="size-4 text-gray-500" />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nome do Alerta
            </label>
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
            <Repeat className="size-4 text-gray-500" />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Frequência
            </label>
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
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Diário
              </span>
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
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Semanal
              </span>
            </label>
          </div>
        </div>

        {/* Days Selection (for weekly alerts) */}
        {formData.frequency === 'weekly' && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="size-4 text-gray-500" />
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  } ${
                    loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
            {errors.days && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.days}
              </p>
            )}
          </div>
        )}

        {/* Time Selection */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Clock className="size-4 text-gray-500" />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Horário
            </label>
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
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Contextos para Revisão
          </label>
          <div className="max-h-32 space-y-2 overflow-y-auto rounded-lg border bg-gray-50 p-3 dark:bg-gray-800">
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
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {context.name}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({context.wordCount || 0} palavras)
                  </span>
                </label>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Nenhum contexto disponível
              </p>
            )}
          </div>
          {errors.contextIds && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.contextIds}
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
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
