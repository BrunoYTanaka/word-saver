import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../../../../shared/context/AppContext'
import Modal from '../../../../shared/ui/Modal'
import Button from '../../../../shared/ui/Button'
import Card from '../../../../shared/ui/Card'
import { useModal } from '../../../../shared/context/ModalContext'
import { FullWord } from '../types/word'

interface ReviewWordModalProps {
  contextIds: string[]
}

function ReviewWordModal({ contextIds }: ReviewWordModalProps) {
  const { words, contexts, reviewWord } = useApp()
  const { closeModal } = useModal()

  const [currentWord, setCurrentWord] = useState<FullWord | null>(null)
  const [showDefinition, setShowDefinition] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [isReviewing, setIsReviewing] = useState(false)

  // Get random word from selected contexts
  const getRandomWord = useCallback(() => {
    if (!contextIds) return null

    // Get words from all selected contexts
    const availableWords = words.filter((word) =>
      contextIds.includes(word.contextId)
    )

    if (availableWords.length === 0) return null

    // Get random word
    const randomIndex = Math.floor(Math.random() * availableWords.length)
    return availableWords[randomIndex]
  }, [contextIds, words])

  // Load random word on mount or when getting next word
  useEffect(() => {
    // Só busca nova palavra se não estiver no meio de uma revisão
    if (!isReviewing) {
      const word = getRandomWord()
      setCurrentWord(word)
      setShowDefinition(false)
    }
  }, [getRandomWord, isReviewing])

  const handleShowDefinition = async () => {
    setShowDefinition(true)
    setIsReviewing(true)
    await reviewWord(currentWord!.id)
  }

  const handleNextWord = () => {
    setIsReviewing(false) // Permite buscar nova palavra
    const nextWord = getRandomWord()
    setCurrentWord(nextWord)
    setShowDefinition(false)
    setReviewedCount((prev) => prev + 1)
  }

  const handleClose = () => {
    closeModal('REVIEW_WORD')
  }

  if (!contextIds || !currentWord) {
    return (
      <Modal isOpen={true} onClose={handleClose} title="📚 Revisão de Palavras">
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

  // Get context names
  const contextNames = contexts
    .filter((ctx) => contextIds.includes(ctx.id))
    .map((ctx) => ctx.name)
    .join(', ')

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title="📚 Revisão de Palavras"
      size="md"
    >
      <div className="space-y-6">
        {/* Context info */}
        <div className="text-center text-sm text-muted-foreground">
          Revisando palavras de:{' '}
          <span className="font-medium text-foreground">{contextNames}</span>
          {reviewedCount > 0 && (
            <span className="mt-1 block">
              Palavras revisadas: {reviewedCount}
            </span>
          )}
        </div>

        {/* Word card */}
        <Card className="border-border bg-primary-soft p-6 text-center">
          <div className="space-y-4">
            {/* Word */}
            <div>
              <h3 className="mb-2 text-2xl font-bold text-foreground">
                {currentWord.word}
              </h3>
              {currentWord.tags && (
                <div className="text-sm text-primary">{currentWord.tags}</div>
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

            {/* Definition (shown after click) */}
            {showDefinition && currentWord.definition && (
              <div className="border-t border-border pt-4">
                <p className="leading-relaxed text-foreground">
                  {currentWord.definition}
                </p>
              </div>
            )}

            {/* Action buttons */}
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
                    className="flex-1 bg-success text-success-foreground hover:bg-success-hover"
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

        {/* Stats */}
        <div className="text-center text-xs text-muted-foreground">
          💡 Dica: Tente lembrar da definição antes de clicar para ver!
        </div>
      </div>
    </Modal>
  )
}

export default ReviewWordModal
