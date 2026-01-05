import { Clock, Bell, Calendar, Repeat } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import Modal from '../UI/Modal'
import Input from '../UI/Input'
import Button from '../UI/Button'

const SetAlertModal = () => {
  const {
    showAddAlertModal,
    toggleAddAlertModal,
    addAlert,
    contexts,
    loading
  } = useApp()

  const [formData, setFormData] = useState({
    name: '',
    frequency: 'daily', // 'daily' | 'weekly'
    time: '09:00',
    contextIds: [],
    days: [1, 2, 3, 4, 5], // Default weekdays for weekly alerts (Monday to Friday)
    isActive: true
  })

  const [errors, setErrors] = useState({})

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

  // Reset form when modal opens
  useEffect(() => {
    if (showAddAlertModal) {
      setFormData({
        name: '',
        frequency: 'daily',
        time: '09:00',
        contextIds: contexts.length > 0 ? [contexts[0].id] : [],
        days: [1, 2, 3, 4, 5], // Weekdays
        isActive: true
      })
      setErrors({})
    }
  }, [showAddAlertModal, contexts])

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // Handle context selection
  const handleContextToggle = (contextId) => {
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
  const handleDayToggle = (dayId) => {
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
    const newErrors = {}

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
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await addAlert(formData)
      // Modal will be closed by the context action
    } catch (error) {
      console.error('Error creating alert:', error)
    }
  }

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      toggleAddAlertModal()
    }
  }

  return (
    <Modal
      isOpen={showAddAlertModal}
      onClose={handleClose}
      title="Configurar Alerta"
      size="md"
      className="max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Alert Name */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-4 w-4 text-gray-500" />
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
          <div className="flex items-center gap-2 mb-2">
            <Repeat className="h-4 w-4 text-gray-500" />
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
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-500" />
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
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    formData.days.includes(day.id)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                  } ${
                    loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
            {errors.days && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.days}
              </p>
            )}
          </div>
        )}

        {/* Time Selection */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-gray-500" />
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contextos para Revisão
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
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
                  <span className="text-xs text-gray-500 ml-2">
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
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {errors.contextIds}
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
            {loading ? 'Salvando...' : 'Criar Alerta'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default SetAlertModal
