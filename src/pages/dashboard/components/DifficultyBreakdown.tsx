import { useMemo } from 'react'
import { useAppSelector } from '@/store/hooks'
import { cn } from '@/shared/utils/cn'

const DIFFICULTY_CONFIG = [
  {
    key: 'easy',
    label: 'Fácil',
    barClass: 'bg-success',
    textClass: 'text-success'
  },
  {
    key: 'medium',
    label: 'Média',
    barClass: 'bg-warning',
    textClass: 'text-warning'
  },
  {
    key: 'hard',
    label: 'Difícil',
    barClass: 'bg-destructive',
    textClass: 'text-destructive'
  }
] as const

const DifficultyBreakdown = () => {
  const { words } = useAppSelector((state) => state.words)

  const counts = useMemo(() => {
    const map: Record<string, number> = { easy: 0, medium: 0, hard: 0 }
    for (const word of words) {
      map[word.difficulty] = (map[word.difficulty] ?? 0) + 1
    }
    return map
  }, [words])

  const total = words.length

  return (
    <div className="space-y-3">
      {DIFFICULTY_CONFIG.map(({ key, label, barClass, textClass }) => {
        const count = counts[key] ?? 0
        const percent = total > 0 ? Math.round((count / total) * 100) : 0
        return (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className={cn('font-medium', textClass)}>{label}</span>
              <span className="text-muted-foreground">
                {count} {total > 0 && `(${percent}%)`}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className={cn('h-full rounded-full transition-all', barClass)}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default DifficultyBreakdown
