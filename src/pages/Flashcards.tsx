import { useState, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'
import { FullWord } from '../types/word'

const Flashcards = () => {
  const { words, contexts } = useApp()
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [showDefinition, setShowDefinition] = useState(false)
  const [selectedContexts, setSelectedContexts] = useState<string[]>([])
  const [filteredWords, setFilteredWords] = useState<FullWord[]>([])
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  })

  // Filter words based on selected contexts
  useEffect(() => {
    if (selectedContexts.length === 0) {
      setFilteredWords(words)
    } else {
      setFilteredWords(
        words.filter((word) => selectedContexts.includes(word.contextId))
      )
    }
    setCurrentWordIndex(0)
    setShowDefinition(false)
  }, [words, selectedContexts])

  const currentWord = filteredWords[currentWordIndex]

  const handleContextToggle = (contextId: string) => {
    setSelectedContexts((prev) =>
      prev.includes(contextId)
        ? prev.filter((id) => id !== contextId)
        : [...prev, contextId]
    )
  }

  const nextCard = () => {
    if (currentWordIndex < filteredWords.length - 1) {
      setCurrentWordIndex((prev) => prev + 1)
      setShowDefinition(false)
    }
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

    setTimeout(() => {
      nextCard()
    }, 500)
  }

  const resetSession = () => {
    setCurrentWordIndex(0)
    setShowDefinition(false)
    setSessionStats({ correct: 0, incorrect: 0, total: 0 })
  }

  if (words.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
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
                onClick={() => setSelectedContexts([])}
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
              onClick={() => setSelectedContexts([])}
              className="rounded-full bg-destructive px-3 py-1 text-sm font-medium text-destructive-foreground hover:bg-destructive-hover"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </Card>

      {/* Flashcard */}
      <Card
        className="min-h-[400px]"
        clickable
        onClick={() => !showDefinition && setShowDefinition(true)}
      >
        <div className="flex min-h-[350px] flex-col items-center justify-center space-y-6 text-center">
          {!showDefinition ? (
            <>
              <div className="text-5xl font-bold text-foreground">
                {currentWord?.word}
              </div>
              {currentWord?.tags && (
                <div className="text-lg text-primary">{currentWord.tags}</div>
              )}
              <p className="text-muted-foreground">
                Clique para revelar a definição
              </p>
              <Eye className="size-8 text-muted-foreground opacity-50" />
            </>
          ) : (
            <>
              <div className="mb-4 text-3xl font-bold text-foreground">
                {currentWord?.word}
              </div>
              {currentWord?.tags && (
                <div className="mb-4 text-lg text-primary">
                  {currentWord.tags}
                </div>
              )}
              <div className="max-w-2xl text-xl leading-relaxed text-foreground">
                {currentWord?.definition}
              </div>
              <div className="text-sm text-muted-foreground">
                Contexto:{' '}
                {contexts.find((c) => c.id === currentWord?.contextId)?.name}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
              // className="flex items-center gap-2 bg-destructive text-destructive-foreground hover:bg-destructive-hover"
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

      {/* Show Definition Button (when definition is hidden) */}
      {!showDefinition && (
        <div className="text-center">
          <Button
            onClick={() => setShowDefinition(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Eye className="size-4" />
            Ver Definição
          </Button>
        </div>
      )}
    </div>
  )
}

export default Flashcards
