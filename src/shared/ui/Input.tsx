import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils/cn'

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: string | null
  label?: string | null
  helperText?: string | null
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
  inputClassName?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      placeholder = '',
      value,
      onChange,
      onFocus,
      onBlur,
      disabled = false,
      error = null,
      label = null,
      helperText = null,
      required = false,
      className = '',
      inputClassName = '',
      icon = null,
      iconPosition = 'left',
      size = 'md',
      autoFocus = false,
      ...props
    },
    ref
  ) => {
    const getSizeClasses = () => {
      const baseClasses =
        'w-full rounded-md border transition-all duration-200 outline-none text-sm bg-background text-foreground'

      const sizeClasses = {
        sm: 'h-9',
        md: 'h-10',
        lg: 'h-11'
      }

      const paddingClasses = {
        left: {
          sm: 'pl-9 pr-3',
          md: 'pl-10 pr-4',
          lg: 'pl-11 pr-5'
        },
        right: {
          sm: 'pr-9 pl-3',
          md: 'pr-10 pl-4',
          lg: 'pr-11 pl-5'
        },
        none: {
          sm: 'px-3',
          md: 'px-3',
          lg: 'px-5'
        }
      }

      const iconPositionKey = icon ? iconPosition : 'none'

      const paddingClass = paddingClasses[iconPositionKey][size]

      const stateClasses = disabled
        ? 'opacity-50 cursor-not-allowed'
        : 'cursor-text hover:border-ring/50'

      const errorClasses = error
        ? 'border-destructive focus:border-destructive focus:ring-1 focus:ring-destructive'
        : 'border-border focus:border-ring focus:ring-1 focus:ring-ring'

      return cn(
        baseClasses,
        sizeClasses[size],
        paddingClass,
        stateClasses,
        errorClasses,
        inputClassName
      )
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (onFocus) onFocus(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (onBlur) onBlur(e)
    }

    return (
      <div className={cn('relative flex flex-col', className)}>
        {label && (
          <label className="mb-1.5 block text-sm font-medium">
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <span
              className={cn(
                'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10',
                iconPosition === 'left' ? 'left-3' : 'right-3'
              )}
            >
              {icon}
            </span>
          )}

          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            autoFocus={autoFocus}
            className={getSizeClasses()}
            {...props}
          />
        </div>

        {(error || helperText) && (
          <span
            className={cn(
              'text-xs mt-1',
              error ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {error || helperText}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
