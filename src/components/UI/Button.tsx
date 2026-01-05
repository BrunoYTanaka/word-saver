import { cn } from '../../utils/cn'

interface ButtonProps {
  children?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
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
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    outline:
      'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50',
    ghost: 'bg-transparent text-foreground hover:bg-secondary',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700'
  }

  const LoadingSpinner = () => (
    <svg
      className="animate-spin"
      style={{
        width: size === 'sm' ? '16px' : '16px',
        height: size === 'sm' ? '16px' : '16px'
      }}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        style={{ opacity: '0.25' }}
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        style={{ opacity: '0.75' }}
        fill="currentColor"
        d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  }

  const iconSize = iconSizes[size] || iconSizes['md']

  const buttonClasses = cn(
    className,
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    'border-none outline-none select-none cursor-pointer',
    'rounded-md',
    sizeClasses[size],
    variantClasses[variant],
    (disabled || loading) && 'cursor-not-allowed opacity-50'
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
          <LoadingSpinner />
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
