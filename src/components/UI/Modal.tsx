import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import Button from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
  footer?: React.ReactNode
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  className?: string
}

function Modal({
  isOpen = false,
  onClose,
  title = '',
  size = 'md',
  children,
  footer = null,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = ''
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  }

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEscape, onClose])

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus the modal when it opens
      modalRef.current.focus()
    }
  }, [isOpen])

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === overlayRef.current) {
      onClose()
    }
  }

  if (!isOpen) return null

  const modalRoot = document.getElementById('modal-root') || document.body

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="animate-fade-in fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          relative w-full ${sizeClasses[size]} animate-slide-up max-h-[90vh] overflow-hidden
          rounded-lg bg-surface shadow-xl
          focus:outline-none ${className}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-6">
          {title && (
            <h2
              id="modal-title"
              className="text-lg font-semibold text-foreground"
            >
              {title}
            </h2>
          )}

          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={<X />}
              className="ml-auto"
              aria-label="Fechar modal"
            />
          )}
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-border bg-inherit p-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    modalRoot
  )
}

// Preset modal footers
interface ModalFooterActionsProps {
  onCancel: () => void
  onConfirm: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => Promise<void>
  cancelText?: string
  confirmText?: string
  confirmVariant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  loading?: boolean
  confirmDisabled?: boolean
}

interface ModalFooterSingleProps {
  onAction: () => void
  text?: string
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'
  loading?: boolean
}

interface ModalFooterCustomProps {
  children: React.ReactNode
}
Modal.Footer = {
  // Cancel/Confirm footer
  Actions: ({
    onCancel,
    onConfirm,
    cancelText = 'Cancelar',
    confirmText = 'Confirmar',
    confirmVariant = 'primary',
    loading = false,
    confirmDisabled = false
  }: ModalFooterActionsProps) => (
    <>
      <Button variant="ghost" onClick={onCancel} disabled={loading}>
        {cancelText}
      </Button>
      <Button
        variant={confirmVariant}
        onClick={onConfirm}
        loading={loading}
        disabled={confirmDisabled}
      >
        {confirmText}
      </Button>
    </>
  ),

  // Single action footer
  Single: ({
    onAction,
    text = 'OK',
    variant = 'primary',
    loading = false
  }: ModalFooterSingleProps) => (
    <Button variant={variant} onClick={onAction} loading={loading}>
      {text}
    </Button>
  ),

  // Custom footer with multiple actions
  Custom: ({ children }: ModalFooterCustomProps) => children
}

export default Modal
