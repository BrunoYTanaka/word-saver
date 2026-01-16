import { LoaderCircle } from 'lucide-react'
import { cn } from '../utils/cn'

interface ButtonProps {
  children?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  className?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  type?: 'button' | 'submit' | 'reset'
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
    xl: 'h-12 px-8 text-lg'
  }

  const variantClasses = {
    primary:
      'bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-secondary-hover disabled:opacity-50 disabled:cursor-not-allowed',
    danger:
      'bg-destructive text-destructive-foreground hover:bg-destructive-hover disabled:opacity-50 disabled:cursor-not-allowed',
    ghost:
      'bg-transparent text-foreground hover:bg-ghost-hover active:bg-ghost-hover disabled:opacity-50 disabled:cursor-not-allowed',
    outline:
      'bg-transparent text-foreground border border-border hover:bg-outline-hover active:bg-outline-hover disabled:opacity-50 disabled:cursor-not-allowed'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  }

  const iconSize = iconSizes[size] || iconSizes['md']

  const buttonClasses = cn(
    'inline-flex items-center justify-center font-medium transition-all duration-200 gap-3',
    'border-none outline-none select-none cursor-pointer',
    'rounded-md',
    sizeClasses[size],
    variantClasses[variant],
    (disabled || loading) && 'cursor-not-allowed opacity-50',
    className
  )

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <LoaderCircle className="animate-spin size-4" />
          {children && <span>Carregando...</span>}
        </div>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className={`flex items-center justify-center ${iconSize}`}>
              {icon}
            </span>
          )}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && (
            <span className={`flex items-center justify-center ${iconSize}`}>
              {icon}
            </span>
          )}
        </>
      )}
    </button>
  )
}

export default Button
