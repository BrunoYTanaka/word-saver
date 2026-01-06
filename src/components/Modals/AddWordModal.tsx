import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import Modal from '../UI/Modal'
import Input from '../UI/Input'
import Button from '../UI/Button'
import { useModal } from '../../context/ModalContext'

interface AddWordFormData {
  word: string
  definition: string
  contextId: string
  tags: string
}

type ErrorTypes = {
  [key in keyof AddWordFormData]?: string
}

function AddWordModal() {
  const { addWord, contexts, loading } = useApp()
  const { openModal, closeModal } = useModal()

  const [formData, setFormData] = useState<AddWordFormData>({
    word: '',
    definition: '',
    contextId: '',
    tags: ''
  })

  const [errors, setErrors] = useState<ErrorTypes>({})

  // Handle input changes
  const handleChange = (field: keyof AddWordFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors: ErrorTypes = {}

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
  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.FormEvent
  ) => {
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
      closeModal('ADD_WORD')
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
            <span className="ml-1 text-destructive">*</span>
          </label>
          <textarea
            value={formData.definition}
            onChange={(e) => handleChange('definition', e.target.value)}
            placeholder="Digite a definição da palavra..."
            disabled={loading}
            required
            rows={3}
            className={`
              box-border w-full rounded-md border bg-background px-3
              py-2 text-sm text-foreground transition-colors
              focus:border-transparent focus:outline-none
              focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50
              ${
                errors.definition
                  ? 'border-red-300 focus:ring-red-500 dark:border-red-600'
                  : 'focus:ring-primary-500 border-gray-300 dark:border-gray-600'
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
            <span className="ml-1 text-destructive">*</span>
          </label>
          {contexts.length === 0 ? (
            <div className="rounded-md border border-border bg-background py-4 text-center">
              <p className="mb-2 text-sm text-foreground">
                Nenhum contexto disponível
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openModal('ADD_CONTEXT')}
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
                h-10 w-full rounded-md border bg-background
                px-3 py-2 text-sm text-foreground
                transition-colors focus:border-transparent focus:outline-none
                focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50
                ${
                  errors.contextId
                    ? 'border-red-300 focus:ring-red-500 dark:border-red-600'
                    : 'focus:ring-primary-500 border-gray-300 dark:border-gray-600'
                }
              `}
            >
              <option value="" className="">
                Selecione um contexto...
              </option>
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
