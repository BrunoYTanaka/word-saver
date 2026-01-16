import { cn } from '../utils/cn'

interface CountCardProps {
  title: string
  number: number | string
  icon: React.ElementType
  color?: string
  bgColor?: string
  textColor?: string
  text?: string
}

function CountCard({
  title,
  number,
  icon,
  color,
  bgColor,
  textColor,
  text
}: CountCardProps) {
  const Icon = icon

  return (
    <div className="flex w-full flex-col items-center gap-3 bg-transparent p-6 sm:flex-row sm:items-start sm:gap-4 sm:px-12 sm:py-8">
      <div
        className={cn(
          'w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shrink-0',
          bgColor
        )}
      >
        <Icon className={cn('w-8 h-8 sm:w-12 sm:h-12', color)} />
      </div>
      <div className="flex flex-col gap-1 text-center sm:items-start">
        <span className="text-xs font-medium leading-tight text-muted-foreground sm:text-sm">
          {title}
        </span>
        <span className="text-2xl font-bold leading-none text-foreground sm:text-2xl lg:text-3xl">
          {number}
        </span>
        <span className={cn('text-sm font-medium', textColor)}>{text}</span>
      </div>
    </div>
  )
}

export default CountCard
