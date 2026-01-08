import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import Modal from '../UI/Modal'
import Input from '../UI/Input'
import Button from '../UI/Button'
import { FullWord } from '../../types/word.d'
import { useModal } from '../../context/ModalContext'

interface EditWordFormData {
  word: string
  definition: string
  contextId: string
  tags: string
}

type ErrorTypes = {
  [key in keyof EditWordFormData]?: string
}

function EditWordModal({ wordId }: { wordId: string }) {
  const { updateWord, contexts, words, loading } = useApp()
  const { openModal, closeModal } = useModal()

  const word = words.find((w) => w.id === wordId)
  const [formData, setFormData] = useState<EditWordFormData>({
    word: word?.word || '',
    definition: word?.definition || '',
    contextId: word?.contextId || '',
    tags: word?.tags?.join(', ') || ''
  })
  const [errors, setErrors] = useState<ErrorTypes>({})

  // Populate form when modal opens with word data
  useEffect(() => {
    if (!word) return
    setFormData({
      word: word.word || '',
      definition: word.definition || '',
      contextId: word.contextId || '',
      tags: word.tags?.join(', ') || ''
    })
    setErrors({})
  }, [word])

  // Handle input changes
  const handleChange = (field: keyof EditWordFormData, value: string) => {
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

    if (!validateForm() || !word) return

    const updatedWordData: FullWord = {
      ...word,
      word: formData.word.trim(),
      definition: formData.definition.trim(),
      contextId: formData.contextId,
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    }

    try {
      await updateWord(updatedWordData)
      closeModal('EDIT_WORD')
    } catch (error) {
      console.error('Error updating word:', error)
    }
  }

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      closeModal('EDIT_WORD')
    }
  }

  const modalFooter = (
    <Modal.Footer.Actions
      onCancel={handleClose}
      onConfirm={handleSubmit}
      cancelText="Cancelar"
      confirmText="Salvar Alterações"
      confirmVariant="primary"
      loading={loading}
    />
  )

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title="Editar Palavra"
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
          <label className="block text-sm font-medium">
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
              w-full rounded-md border bg-background px-3 py-2
              text-sm text-foreground transition-colors
              focus:outline-none focus:ring-1
              disabled:cursor-not-allowed disabled:opacity-50
              ${
                errors.definition
                  ? 'border-destructive focus:border-destructive focus:ring-destructive'
                  : 'border-border focus:border-primary focus:ring-primary'
              }
            `}
          />
          {errors.definition && (
            <p className="text-xs text-destructive">{errors.definition}</p>
          )}
        </div>

        {/* Context Selection */}
        <div className="space-y-1">
          <label className="block text-sm font-medium ">
            Contexto
            <span className="ml-1 text-destructive">*</span>
          </label>
          {contexts.length === 0 ? (
            <div className="rounded-md border border-border bg-background py-4 text-center">
              <p className="mb-2 text-sm">Nenhum contexto disponível</p>
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
                transition-colors focus:outline-none focus:ring-1
                disabled:cursor-not-allowed disabled:opacity-50
                ${
                  errors.contextId
                    ? 'border-destructive focus:border-destructive focus:ring-destructive'
                    : 'border-border focus:border-primary focus:ring-primary'
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
            <p className="text-xs text-destructive">{errors.contextId}</p>
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

export default EditWordModal
