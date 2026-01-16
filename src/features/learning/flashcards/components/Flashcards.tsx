import { useState, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react'
import { useApp } from '../../../../shared/context/AppContext'
import Card from '../../../../shared/ui/Card'
import Button from '../../../../shared/ui/Button'
import { FullWord } from '../../../vocabulary/words/types/word'

const Flashcards = () => {
  const { words, contexts, reviewWord } = useApp()
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [showDefinition, setShowDefinition] = useState(false)
  const [selectedContexts, setSelectedContexts] = useState<string[]>([])
  const [filteredWords, setFilteredWords] = useState<FullWord[]>([])
  const [finished, setFinished] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  })

  // Randomize words on initial load
  const shuffleArray = (array: FullWord[]) => {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
  }

  // Filter words based on selected contexts
  useEffect(() => {
    if (isReviewing) return // Don't change words while reviewing
    if (selectedContexts.length === 0) {
      setFilteredWords(shuffleArray(words))
    } else {
      setFilteredWords(
        shuffleArray(
          words.filter((word) => selectedContexts.includes(word.contextId))
        )
      )
    }
    setCurrentWordIndex(0)
    setShowDefinition(false)

    // Start reviewing session when there are words
    if (words.length > 0) {
      setIsReviewing(true)
    }
  }, [words, selectedContexts, isReviewing])

  const currentWord = filteredWords[currentWordIndex]

  const handleContextToggle = (contextId: string) => {
    setIsReviewing(false)
    setSelectedContexts((prev) =>
      prev.includes(contextId)
        ? prev.filter((id) => id !== contextId)
        : [...prev, contextId]
    )
  }

  const nextCard = () => {
    if (currentWordIndex < filteredWords.length - 1) {
      setCurrentWordIndex((prev) => prev + 1)
    } else {
      setFinished(true)
    }
    setShowDefinition(false)
  }

  const prevCard = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex((prev) => prev - 1)
      setShowDefinition(false)
    }
  }

  const markAnswer = (correct: boolean) => {
    setSessionStats((prev) => ({
      ...prev,
      [correct ? 'correct' : 'incorrect']:
        prev[correct ? 'correct' : 'incorrect'] + 1,
      total: prev.total + 1
    }))

    nextCard()
    reviewWord(currentWord.id)
  }

  const resetSession = () => {
    setIsReviewing(false)
    setCurrentWordIndex(0)
    setFinished(false)
    setShowDefinition(false)
    setSessionStats({ correct: 0, incorrect: 0, total: 0 })
  }

  const handleClearContextFilters = () => {
    setIsReviewing(false)
    setSelectedContexts([])
  }

  if (filteredWords.length === 0) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <div className="space-y-4">
            <div className="text-6xl">📚</div>
            <h2 className="text-xl font-semibold text-foreground">
              Nenhuma palavra encontrada
            </h2>
            <p className="text-muted-foreground">
              Adicione algumas palavras primeiro para usar os flashcards.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  if (filteredWords.length === 0) {
    return (
      <div className="space-y-6">
        {/* Context Filter */}
        <Card>
          <h3 className="mb-4 font-semibold text-foreground">
            Filtrar por Contextos
          </h3>
          <div className="flex flex-wrap gap-2">
            {contexts.map((context) => (
              <button
                key={context.id}
                onClick={() => handleContextToggle(context.id)}
                className={`
                    rounded-full px-3 py-1 text-sm font-medium transition-colors
                    ${
                      selectedContexts.includes(context.id)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface-muted text-muted-foreground hover:bg-surface-hover'
                    }
                  `}
              >
                {context.name}
              </button>
            ))}
            {selectedContexts.length > 0 && (
              <button
                onClick={handleClearContextFilters}
                className="rounded-full bg-destructive px-3 py-1 text-sm font-medium text-destructive-foreground hover:bg-destructive-hover"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </Card>

        <Card className="text-center">
          <div className="space-y-4">
            <div className="text-6xl">🔍</div>
            <h2 className="text-xl font-semibold text-foreground">
              Nenhuma palavra encontrada
            </h2>
            <p className="text-muted-foreground">
              Não há palavras nos contextos selecionados.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-left sm:text-center">
        <h1 className="mb-2 text-3xl font-bold">Flashcards</h1>
        <p className="text-muted-foreground">
          Pratique suas palavras revisando os flashcards abaixo.
        </p>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-primary">
            {currentWordIndex + 1}
          </div>
          <div className="text-sm text-muted-foreground">
            de {filteredWords.length}
          </div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-success">
            {sessionStats.correct}
          </div>
          <div className="text-sm text-muted-foreground">Corretas</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-destructive">
            {sessionStats.incorrect}
          </div>
          <div className="text-sm text-muted-foreground">Incorretas</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {sessionStats.total}
          </div>
          <div className="text-sm text-muted-foreground">Total</div>
        </Card>
      </div>

      {/* Context Filter */}
      <Card>
        <h3 className="mb-4 font-semibold text-foreground">
          Filtrar por Contextos
        </h3>
        <div className="flex flex-wrap gap-2">
          {contexts.map((context) => (
            <button
              key={context.id}
              onClick={() => handleContextToggle(context.id)}
              className={`
                  rounded-full px-3 py-1 text-sm font-medium transition-colors
                  ${
                    selectedContexts.includes(context.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-surface-muted text-muted-foreground hover:bg-surface-hover'
                  }
                `}
            >
              {context.name}
            </button>
          ))}
          {selectedContexts.length > 0 && (
            <button
              onClick={handleClearContextFilters}
              className="rounded-full bg-destructive px-3 py-1 text-sm font-medium text-destructive-foreground hover:bg-destructive-hover"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </Card>

      {/* Flashcard */}
      {finished ? (
        <Card className="flex min-h-[400px] items-center justify-center text-center">
          <div className="space-y-4">
            <div className="text-6xl">✅</div>
            <h2 className="text-xl font-semibold text-foreground">
              Você revisou todas as palavras!
            </h2>
            <p className="text-muted-foreground">
              Reinicie a sessão para revisar novamente.
            </p>
            <Button
              onClick={resetSession}
              variant="outline"
              className="[&>span]:flex [&>span]:items-center [&>span]:gap-1"
            >
              <RotateCcw className="size-4" />
              Reiniciar Sessão
            </Button>
          </div>
        </Card>
      ) : (
        <Card
          className="min-h-[400px]"
          clickable
          onClick={() => !showDefinition && setShowDefinition(true)}
        >
          <div className="flex min-h-[350px] flex-col items-center justify-center space-y-6 text-center">
            {!showDefinition ? (
              <>
                <h3 className="break-all text-5xl font-bold text-foreground">
                  {currentWord?.word}
                </h3>
                {currentWord?.tags && (
                  <span className="mb-4 font-bold">
                    tags:
                    <span className="ml-1 text-lg text-primary">
                      {currentWord.tags.join(', ')}
                    </span>
                  </span>
                )}
                <p className="text-muted-foreground">
                  Clique para revelar a definição
                </p>
                <Eye className="size-8 text-muted-foreground opacity-50" />
              </>
            ) : (
              <>
                <h3 className="mb-4 break-all text-3xl font-bold text-foreground">
                  {currentWord?.word}
                </h3>
                {currentWord?.tags && (
                  <span className="mb-4 font-bold">
                    tags:
                    <span className="ml-1 text-lg text-primary">
                      {currentWord.tags.join(', ')}
                    </span>
                  </span>
                )}
                <p className="max-w-2xl text-xl leading-relaxed text-foreground">
                  {currentWord?.definition}
                </p>
                <div className="text-sm text-muted-foreground">
                  Contexto:{' '}
                  {contexts.find((c) => c.id === currentWord?.contextId)?.name}
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Controls */}
      <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Button
            onClick={prevCard}
            disabled={currentWordIndex === 0}
            variant="outline"
            className="[&>span]:flex [&>span]:items-center [&>span]:space-x-2"
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>
          <Button
            onClick={nextCard}
            disabled={currentWordIndex === filteredWords.length - 1}
            variant="outline"
            className="[&>span]:flex [&>span]:items-center [&>span]:space-x-2"
          >
            Próximo
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Answer buttons (only show when definition is visible) */}
        {showDefinition && (
          <div className="flex items-center gap-4">
            <Button
              onClick={() => markAnswer(false)}
              variant="danger"
              className="[&>span]:flex [&>span]:items-center [&>span]:gap-1"
            >
              <XCircle className="size-4" />
              Errei
            </Button>
            <Button
              onClick={() => markAnswer(true)}
              variant="secondary"
              className="[&>span]:flex [&>span]:items-center [&>span]:gap-1"
            >
              <CheckCircle className="size-4" />
              Acertei
            </Button>
          </div>
        )}

        {/* Reset */}
        <Button
          onClick={resetSession}
          variant="outline"
          className="[&>span]:flex [&>span]:items-center [&>span]:gap-1"
        >
          <RotateCcw className="size-4 " />
          Reiniciar
        </Button>
      </div>
    </div>
  )
}

export default Flashcards
