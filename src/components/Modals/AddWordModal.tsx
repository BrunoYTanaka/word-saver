import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import Modal from '../UI/Modal'
import Input from '../UI/Input'
import Button from '../UI/Button'

const AddWordModal = () => {
  const { showAddWordModal, toggleAddWordModal, addWord, contexts, loading } =
    useApp()

  const [formData, setFormData] = useState({
    word: '',
    definition: '',
    contextId: '',
    tags: ''
  })

  const [errors, setErrors] = useState({})

  // Reset form when modal opens
  useEffect(() => {
    if (showAddWordModal) {
      setFormData({
        word: '',
        definition: '',
        contextId: contexts.length > 0 ? contexts[0].id : '',
        tags: ''
      })
      setErrors({})
    }
  }, [showAddWordModal, contexts])

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

    if (!formData.word.trim()) {
      newErrors.word = 'Palavra é obrigatória'
    }

    if (!formData.definition.trim()) {
      newErrors.definition = 'Definição é obrigatória'
    }

    if (!formData.contextId) {
      newErrors.contextId = 'Contexto é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    const wordData = {
      word: formData.word.trim(),
      definition: formData.definition.trim(),
      contextId: formData.contextId,
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    }

    try {
      await addWord(wordData)
    } catch (error) {
      console.error('Error adding word:', error)
    }
  }

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      toggleAddWordModal()
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
      isOpen={showAddWordModal}
      onClose={handleClose}
      title="Adicionar Nova Palavra"
      size="md"
      footer={modalFooter}
      closeOnOverlayClick={!loading}
      closeOnEscape={!loading}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Word Field */}
        <Input
          label="Palavra"
          type="text"
          value={formData.word}
          onChange={(e) => handleChange('word', e.target.value)}
          placeholder="Digite a palavra..."
          error={errors.word}
          required
          disabled={loading}
          autoFocus
        />

        {/* Definition Field */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Definição
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            value={formData.definition}
            onChange={(e) => handleChange('definition', e.target.value)}
            placeholder="Digite a definição da palavra..."
            disabled={loading}
            required
            rows={3}
            className={`
              w-full rounded-md border bg-white text-gray-900 placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:border-transparent
              disabled:cursor-not-allowed disabled:opacity-50 transition-colors
              dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400 px-3 py-2 box-border
              ${
                errors.definition
                  ? 'border-red-300 focus:ring-red-500 dark:border-red-600'
                  : 'border-gray-300 focus:ring-primary-500 dark:border-gray-600'
              }
            `}
          />
          {errors.definition && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errors.definition}
            </p>
          )}
        </div>

        {/* Context Selection */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Contexto
            <span className="text-red-500 ml-1">*</span>
          </label>
          {contexts.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Nenhum contexto disponível
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toggleAddWordModal()
                  // This would open the add context modal
                  // toggleAddContextModal();
                }}
                disabled={loading}
              >
                Criar Primeiro Contexto
              </Button>
            </div>
          ) : (
            <select
              value={formData.contextId}
              onChange={(e) => handleChange('contextId', e.target.value)}
              disabled={loading}
              required
              className={`
                w-full rounded-md border bg-white text-gray-900
                focus:outline-none focus:ring-2 focus:border-transparent
                disabled:cursor-not-allowed disabled:opacity-50 transition-colors
                dark:bg-gray-800 dark:text-gray-100 px-3 py-2 h-10
                ${
                  errors.contextId
                    ? 'border-red-300 focus:ring-red-500 dark:border-red-600'
                    : 'border-gray-300 focus:ring-primary-500 dark:border-gray-600'
                }
              `}
            >
              <option value="">Selecione um contexto...</option>
              {contexts.map((context) => (
                <option key={context.id} value={context.id}>
                  {context.name}
                </option>
              ))}
            </select>
          )}
          {errors.contextId && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errors.contextId}
            </p>
          )}
        </div>

        {/* Tags Field */}
        <Input
          label="Tags (opcional)"
          type="text"
          value={formData.tags}
          onChange={(e) => handleChange('tags', e.target.value)}
          placeholder="Digite tags separadas por vírgula..."
          helperText="Exemplo: verbo, formal, tecnologia"
          disabled={loading}
        />
      </form>
    </Modal>
  )
}

export default AddWordModal
