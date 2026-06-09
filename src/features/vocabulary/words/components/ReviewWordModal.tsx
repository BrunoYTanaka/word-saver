import { useState, useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { reviewWord as reviewWordAction } from '@/store/slices/wordsSlice'
import Modal from '@/shared/ui/Modal'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { useModal } from '@/shared/context/ModalContext'
import type { FullWord } from '../types/word'

interface ReviewWordModalProps {
  contextIds: string[]
  alertId?: string
}

function ReviewWordModal({ contextIds }: ReviewWordModalProps) {
  const dispatch = useAppDispatch()
  const { words } = useAppSelector((state) => state.words)
  const { contexts } = useAppSelector((state) => state.contexts)
  const { closeModal } = useModal()

  const [currentWord, setCurrentWord] = useState<FullWord | null>(null)
  const [showDefinition, setShowDefinition] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())

  const availableWords = words.filter((word) =>
    contextIds.includes(word.contextId)
  )

  const pickRandomWord = useCallback(
    (excludeIds: Set<string>): FullWord | null => {
      if (availableWords.length === 0) return null
      const remaining = availableWords.filter((w) => !excludeIds.has(w.id))
      const pool = remaining.length > 0 ? remaining : availableWords
      const index = Math.floor(Math.random() * pool.length)
      return pool[index]
    },
    [availableWords]
  )

  useEffect(() => {
    if (!currentWord && availableWords.length > 0) {
      setCurrentWord(pickRandomWord(seenIds))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableWords.length])

  const handleClose = () => closeModal('REVIEW_WORD')

  const handleShowDefinition = async () => {
    if (!currentWord) return
    setShowDefinition(true)
    try {
      await dispatch(reviewWordAction(currentWord.id)).unwrap()
    } catch (error) {
      console.error('Error reviewing word:', error)
    }
  }

  const handleNextWord = () => {
    if (!currentWord) return
    const nextSeen = new Set(seenIds).add(currentWord.id)
    setSeenIds(nextSeen)
    setReviewedCount((prev) => prev + 1)
    setShowDefinition(false)
    setCurrentWord(pickRandomWord(nextSeen))
  }

  const contextNames = contexts
    .filter((ctx) => contextIds.includes(ctx.id))
    .map((ctx) => ctx.name)
    .join(', ')

  if (availableWords.length === 0 || !currentWord) {
    return (
      <Modal isOpen onClose={handleClose} title="📚 Revisão de Palavras">
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            Nenhuma palavra encontrada nos contextos selecionados.
          </p>
          <Button onClick={handleClose} className="mt-4">
            Fechar
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      isOpen
      onClose={handleClose}
      title="📚 Revisão de Palavras"
      size="md"
    >
      <div className="space-y-6">
        <div className="text-center text-sm text-muted-foreground">
          Revisando palavras de:{' '}
          <span className="font-medium text-foreground">{contextNames}</span>
          {reviewedCount > 0 && (
            <span className="mt-1 block">
              Palavras revisadas: {reviewedCount}
            </span>
          )}
        </div>

        <Card className="border-border bg-primary-soft p-6 text-center">
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-2xl font-bold text-foreground">
                {currentWord.word}
              </h3>
              {currentWord.tags && currentWord.tags.length > 0 && (
                <div className="text-sm text-primary">
                  {currentWord.tags.join(', ')}
                </div>
              )}
              <div className="mt-2 flex justify-center gap-4 text-xs text-muted-foreground">
                <span>Revisões: {currentWord.reviewCount}</span>
                {currentWord.lastReviewed && (
                  <span>
                    Última revisão:{' '}
                    {new Date(currentWord.lastReviewed).toLocaleDateString(
                      'pt-BR'
                    )}
                  </span>
                )}
              </div>
            </div>

            {showDefinition && currentWord.definition && (
              <div className="border-t border-border pt-4">
                <p className="leading-relaxed text-foreground">
                  {currentWord.definition}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              {!showDefinition ? (
                <Button
                  onClick={handleShowDefinition}
                  variant="primary"
                  className="flex-1"
                >
                  🤔 Ver Definição
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleNextWord}
                    variant="primary"
                    className="flex-1"
                  >
                    ✅ Próxima Palavra
                  </Button>
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="flex-1"
                  >
                    🎯 Finalizar Revisão
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          💡 Dica: Tente lembrar da definição antes de clicar para ver!
        </div>
      </div>
    </Modal>
  )
}

export default ReviewWordModal
