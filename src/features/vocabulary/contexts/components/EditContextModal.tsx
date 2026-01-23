import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updateContext } from '@/store/slices/contextsSlice'
import Modal from '@/shared/ui/Modal'
import Input from '@/shared/ui/Input'
import { useModal } from '@/shared/context/ModalContext'
import { FullContext } from '../types/context'
import { colors, icons } from '../constants/context'

interface EditContextFormData {
  name: string
  color: string
  icon: string
}

type ErrorTypes = {
  [key in keyof EditContextFormData]?: string
}

interface EditContextModalProps {
  contextId: string
  onClose?: () => void
}

const EditContextModal = ({ contextId }: EditContextModalProps) => {
  const dispatch = useAppDispatch()
  const { contexts, loading } = useAppSelector((state) => state.contexts)
  const { closeModal } = useModal()

  const context = contexts.find((ctx: FullContext) => ctx.id === contextId)
  const [formData, setFormData] = useState<EditContextFormData>({
    name: context?.name || '',
    color: context?.color || '',
    icon: context?.icon || ''
  })

  const [errors, setErrors] = useState<ErrorTypes>({})

  // Update form data when context changes
  useEffect(() => {
    if (!context) return
    setFormData({
      name: context.name,
      color: context.color,
      icon: context.icon
    })
    setErrors({})
  }, [context])

  // Handle input changes
  const handleChange = (field: keyof EditContextFormData, value: string) => {
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

    if (!validateForm() || !context) return

    const updatedContextData: FullContext = {
      ...context,
      name: formData.name.trim(),
      color: formData.color,
      icon: formData.icon
    }

    try {
      await dispatch(updateContext(updatedContextData)).unwrap()
    } catch (error) {
      console.error('Error updating context:', error)
    } finally {
      closeModal('EDIT_CONTEXT')
    }
  }

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      closeModal('EDIT_CONTEXT')
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
      title="Editar Contexto"
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
          <label className="block text-sm font-medium ">Cor do Contexto</label>
          <div className="grid grid-cols-5 gap-3">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleChange('color', color)}
                disabled={loading}
                title={`Cor ${color}`}
                className={`
                  size-10 rounded-lg border-2 transition-all
                  ${
                    formData.color === color
                      ? 'scale-110 border-foreground'
                      : 'border-border hover:scale-105'
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
          <label className="block text-sm font-medium ">
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
                      ? 'bg-primary/10 dark:bg-primary/20 border-primary'
                      : 'border-border transition-colors hover:bg-surface-muted'
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
          <label className="block text-sm font-medium ">Visualização</label>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-muted p-3">
            <div
              className="flex size-6 items-center justify-center rounded text-sm"
              style={{ backgroundColor: formData.color }}
            >
              {formData.icon}
            </div>
            <span className="font-medium ">
              {formData.name || 'Nome do Contexto'}
            </span>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default EditContextModal
