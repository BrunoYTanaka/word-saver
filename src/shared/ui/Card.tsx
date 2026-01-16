import { cn } from '../utils/cn'

interface CardProps {
  children?: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  border?: boolean
  hover?: boolean
  clickable?: boolean
  onClick?: () => void
}

function Card({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  border = true,
  hover = false,
  clickable = false,
  onClick,
  ...props
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }

  const cardStyles = cn(
    'bg-surface text-foreground rounded-lg',
    border && 'border border-border',
    paddingClasses[padding],
    shadowClasses[shadow],
    clickable && 'cursor-pointer',
    hover && 'hover:-translate-y-0.5 hover:shadow-xl',
    className
  )

  return (
    <div
      className={cardStyles}
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  className?: string
}

const CardHeader = ({
  children,
  className = '',
  ...props
}: CardHeaderProps) => {
  return (
    <div
      className={cn('border-b border-border pb-3 mb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode
  className?: string
}

const CardTitle = ({ children, className = '', ...props }: CardTitleProps) => {
  return (
    <h3
      className={cn('text-lg font-semibold text-card-foreground', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  className?: string
}

const CardContent = ({
  children,
  className = '',
  ...props
}: CardContentProps) => {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Title = CardTitle
Card.Content = CardContent

export default Card
