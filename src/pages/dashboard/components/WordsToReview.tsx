import { useMemo } from 'react'
import { Clock, Target } from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import Card from '@/shared/ui/Card'
import Button from '@/shared/ui/Button'
import { useModal } from '@/shared/context/ModalContext'

const MAX_ITEMS = 3

const WordsToReview = () => {
  const { openModal } = useModal()
  const { words } = useAppSelector((state) => state.words)
  const { contexts } = useAppSelector((state) => state.contexts)

  const wordsToReview = useMemo(() => {
    return [...words]
      .sort((a, b) => {
        if (!a.lastReviewed && !b.lastReviewed) {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        }
        if (!a.lastReviewed) return -1
        if (!b.lastReviewed) return 1
        return (
          new Date(a.lastReviewed).getTime() -
          new Date(b.lastReviewed).getTime()
        )
      })
      .slice(0, MAX_ITEMS)
  }, [words])

  if (wordsToReview.length === 0) return null

  const handleReview = (contextId: string) => {
    openModal('REVIEW_WORD', { contextIds: [contextId] })
  }

  const handleReviewAll = () => {
    const contextIds = Array.from(
      new Set(wordsToReview.map((word) => word.contextId))
    )
    openModal('REVIEW_WORD', { contextIds })
  }

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center justify-between">
          <Card.Title>Para revisar agora</Card.Title>
          <Button variant="ghost" size="sm" onClick={handleReviewAll}>
            <span className="flex items-center gap-1">
              <Target className="size-4" />
              Revisar todas
            </span>
          </Button>
        </div>
      </Card.Header>
      <Card.Content>
        <ul className="space-y-3">
          {wordsToReview.map((word) => {
            const context = contexts.find((c) => c.id === word.contextId)
            return (
              <li
                key={word.id}
                className="flex items-center justify-between gap-3 rounded-lg p-2 hover:bg-surface-hover"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {word.word}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    <span>
                      {word.lastReviewed
                        ? `Revisada ${new Date(
                            word.lastReviewed
                          ).toLocaleDateString('pt-BR')}`
                        : 'Nunca revisada'}
                    </span>
                    {context && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          {context.icon && <span>{context.icon}</span>}
                          {context.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReview(word.contextId)}
                >
                  Revisar
                </Button>
              </li>
            )
          })}
        </ul>
      </Card.Content>
    </Card>
  )
}

export default WordsToReview
