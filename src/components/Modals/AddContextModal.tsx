import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import Modal from '../UI/Modal'
import Input from '../UI/Input'
import { useModal } from '../../context/ModalContext'

interface AddContextFormData {
  name: string
  color: string
  icon: string
}

type ErrorTypes = {
  [key in keyof AddContextFormData]?: string
}

const AddContextModal = () => {
  const { addContext, loading } = useApp()
  const { closeModal } = useModal()

  const [formData, setFormData] = useState<AddContextFormData>({
    name: '',
    color: '#3B82F6',
    icon: '📚'
  })

  const [errors, setErrors] = useState<ErrorTypes>({})

  // Predefined colors for context
  const colors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280' // Gray
  ]

  // Predefined icons for context
  const icons = [
    '📚',
    '💼',
    '🎓',
    '🌍',
    '💻',
    '🎨',
    '🔬',
    '⚽',
    '🎵',
    '🍳',
    '🚗',
    '🏠',
    '💰',
    '❤️',
    '🎯',
    '📱',
    '✈️',
    '🎪',
    '🔧',
    '📖'
  ]

  // Handle input changes
  const handleChange = (field: keyof AddContextFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors: ErrorTypes = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do contexto é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.FormEvent
  ) => {
    e.preventDefault()

    if (!validateForm()) return

    const contextData = {
      name: formData.name.trim(),
      color: formData.color,
      icon: formData.icon
    }

    try {
      await addContext(contextData)
    } catch (error) {
      console.error('Error adding context:', error)
    }
  }

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      closeModal('ADD_CONTEXT')
    }
  }

  const modalFooter = (
    <Modal.Footer.Actions
      onCancel={handleClose}
      onConfirm={handleSubmit}
      cancelText="Cancelar"
      confirmText="Criar Contexto"
      confirmVariant="primary"
      loading={loading}
    />
  )

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title="Criar Novo Contexto"
      size="md"
      footer={modalFooter}
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Context Name */}
        <Input
          label="Nome do Contexto"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ex: Inglês para Negócios, Programação..."
          error={errors.name}
          required
          disabled={loading}
          autoFocus
        />

        {/* Color Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cor do Contexto
          </label>
          <div className="grid grid-cols-5 gap-3">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleChange('color', color)}
                disabled={loading}
                className={`
                  size-10 rounded-lg border-2 transition-all
                  ${
                    formData.color === color
                      ? 'scale-110 border-gray-900 dark:border-gray-100'
                      : 'border-gray-300 hover:scale-105 dark:border-gray-600'
                  }
                  disabled:cursor-not-allowed disabled:opacity-50
                `}
                style={{ backgroundColor: color }}
                aria-label={`Cor ${color}`}
              />
            ))}
          </div>
        </div>

        {/* Icon Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ícone do Contexto
          </label>
          <div className="grid grid-cols-10 gap-2">
            {icons.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => handleChange('icon', icon)}
                disabled={loading}
                className={`
                  size-8 rounded border text-lg transition-all
                  ${
                    formData.icon === icon
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
                  }
                  disabled:cursor-not-allowed disabled:opacity-50
                `}
                aria-label={`Ícone ${icon}`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Visualização
          </label>
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
            <div
              className="flex size-6 items-center justify-center rounded text-sm"
              style={{ backgroundColor: formData.color }}
            >
              {formData.icon}
            </div>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formData.name || 'Nome do Contexto'}
            </span>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default AddContextModal
