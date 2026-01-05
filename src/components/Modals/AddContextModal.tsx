// Add Context Modal Component
import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import Modal from '../UI/Modal'
import Input from '../UI/Input'

const AddContextModal = () => {
  const { showAddContextModal, toggleAddContextModal, addContext, loading } =
    useApp()

  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    icon: '📚'
  })

  const [errors, setErrors] = useState({})

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

  // Reset form when modal opens
  useEffect(() => {
    if (showAddContextModal) {
      setFormData({
        name: '',
        color: '#3B82F6',
        icon: '📚'
      })
      setErrors({})
    }
  }, [showAddContextModal])

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do contexto é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
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
      toggleAddContextModal()
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
      isOpen={showAddContextModal}
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
                  w-10 h-10 rounded-lg border-2 transition-all
                  ${
                    formData.color === color
                      ? 'border-gray-900 dark:border-gray-100 scale-110'
                      : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
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
                  w-8 h-8 text-lg rounded border transition-all
                  ${
                    formData.icon === icon
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
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
          <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-sm"
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
