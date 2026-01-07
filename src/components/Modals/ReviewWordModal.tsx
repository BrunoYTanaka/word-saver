import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import Card from '../UI/Card'
import { useModal } from '../../context/ModalContext'
import { FullWord } from '../../types/word'

interface ReviewWordModalProps {
  contextIds: string[]
}

function ReviewWordModal({ contextIds }: ReviewWordModalProps) {
  const { words, contexts } = useApp()
  const { closeModal } = useModal()

  const [currentWord, setCurrentWord] = useState<FullWord | null>(null)
  const [showDefinition, setShowDefinition] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)

  // Get random word from selected contexts
  const getRandomWord = () => {
    if (!contextIds) return null

    // Get words from all selected contexts
    const availableWords = words.filter((word) =>
      contextIds.includes(word.contextId)
    )

    if (availableWords.length === 0) return null

    // Get random word
    const randomIndex = Math.floor(Math.random() * availableWords.length)
    return availableWords[randomIndex]
  }

  // Load random word on mount or when getting next word
  useEffect(() => {
    const word = getRandomWord()
    setCurrentWord(word)
    setShowDefinition(false)
  }, [])

  const handleShowDefinition = () => {
    setShowDefinition(true)
  }

  const handleNextWord = () => {
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
          <p className="text-gray-600 dark:text-gray-400">
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
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Revisando palavras de:{' '}
          <span className="font-medium">{contextNames}</span>
          {reviewedCount > 0 && (
            <span className="mt-1 block">
              Palavras revisadas: {reviewedCount}
            </span>
          )}
        </div>

        {/* Word card */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-center dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="space-y-4">
            {/* Word */}
            <div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                {currentWord.word}
              </h3>
              {currentWord.tags && (
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  {currentWord.tags}
                </div>
              )}
            </div>

            {/* Definition (shown after click) */}
            {showDefinition && currentWord.definition && (
              <div className="border-t border-blue-200 pt-4 dark:border-blue-700">
                <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                  {currentWord.definition}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              {!showDefinition ? (
                <Button
                  onClick={handleShowDefinition}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                >
                  🤔 Ver Definição
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleNextWord}
                    className="flex-1 bg-green-600 text-white hover:bg-green-700"
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
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          💡 Dica: Tente lembrar da definição antes de clicar para ver!
        </div>
      </div>
    </Modal>
  )
}

export default ReviewWordModal
