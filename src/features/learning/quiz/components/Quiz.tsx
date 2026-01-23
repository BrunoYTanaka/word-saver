import { useState } from 'react'
import { Play, RotateCcw, CheckCircle, XCircle } from 'lucide-react'
import { FullWord } from '@/features/vocabulary'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { reviewWord as reviewWordAction } from '@/store/slices/wordsSlice'
import Card from '@/shared/ui/Card'
import Button from '@/shared/ui/Button'

interface QuizQuestion {
  word: FullWord
  options: string[]
  correctAnswer: string
}

interface QuizStats {
  correct: number
  incorrect: number
  timeSpent: number
  accuracy: number
}

const Quiz = () => {
  const dispatch = useAppDispatch()
  const { words } = useAppSelector((state) => state.words)
  const { contexts } = useAppSelector((state) => state.contexts)
  const [isQuizStarted, setIsQuizStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [selectedContexts, setSelectedContexts] = useState<string[]>([])
  const [quizSettings, setQuizSettings] = useState({
    questionCount: 10,
    mode: 'definition' as 'definition' | 'word'
  })
  const [stats, setStats] = useState<QuizStats>({
    correct: 0,
    incorrect: 0,
    timeSpent: 0,
    accuracy: 0
  })
  const [startTime, setStartTime] = useState<number>(0)
  const [isQuizCompleted, setIsQuizCompleted] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)

  const generateQuestions = () => {
    // Don't regenerate questions if already reviewing
    if (isReviewing && questions.length > 0) return questions

    const filteredWords =
      selectedContexts.length === 0
        ? words
        : words.filter((word) => selectedContexts.includes(word.contextId))

    if (filteredWords.length < 4) return []

    const shuffledWords = [...filteredWords].sort(() => Math.random() - 0.5)
    const selectedWords = shuffledWords.slice(
      0,
      Math.min(quizSettings.questionCount, filteredWords.length)
    )

    return selectedWords.map((word) => {
      // Get 3 random wrong answers
      const wrongAnswers = filteredWords
        .filter((w) => w.id !== word.id && w.definition !== word.definition)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((w) =>
          quizSettings.mode === 'definition' ? w.definition : w.word
        )

      const correctAnswer =
        quizSettings.mode === 'definition' ? word.definition : word.word
      const options = [correctAnswer, ...wrongAnswers].sort(
        () => Math.random() - 0.5
      )

      return {
        word,
        options,
        correctAnswer
      }
    })
  }

  const startQuiz = () => {
    const newQuestions = generateQuestions()
    if (newQuestions.length === 0) return

    setQuestions(newQuestions)
    setIsQuizStarted(true)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setStats({ correct: 0, incorrect: 0, timeSpent: 0, accuracy: 0 })
    setStartTime(Date.now())
    setIsQuizCompleted(false)
    setIsReviewing(true)
  }

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer) return
    setSelectedAnswer(answer)
    setShowResult(true)

    const isCorrect = answer === questions[currentQuestionIndex].correctAnswer
    setStats((prev) => ({
      ...prev,
      [isCorrect ? 'correct' : 'incorrect']:
        prev[isCorrect ? 'correct' : 'incorrect'] + 1
    }))

    // Mark word as reviewed
    dispatch(reviewWordAction(questions[currentQuestionIndex].word.id))

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
        setSelectedAnswer(null)
        setShowResult(false)
      } else {
        // Quiz completed
        const timeSpent = Math.round((Date.now() - startTime) / 1000)
        const accuracy = Math.round(
          ((stats.correct + (isCorrect ? 1 : 0)) / questions.length) * 100
        )
        setStats((prev) => ({
          ...prev,
          timeSpent,
          accuracy
        }))
        setIsQuizCompleted(true)
      }
    }, 1500)
  }

  const resetQuiz = () => {
    setIsQuizStarted(false)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setQuestions([])
    setStats({ correct: 0, incorrect: 0, timeSpent: 0, accuracy: 0 })
    setIsQuizCompleted(false)
    setIsReviewing(false)
  }

  const handleContextToggle = (contextId: string) => {
    setIsReviewing(false)
    setSelectedContexts((prev) =>
      prev.includes(contextId)
        ? prev.filter((id) => id !== contextId)
        : [...prev, contextId]
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const filteredWords =
    selectedContexts.length === 0
      ? words
      : words.filter((word) => selectedContexts.includes(word.contextId))

  if (words.length === 0) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <div className="space-y-4">
            <div className="text-6xl">🧠</div>
            <h2 className="text-xl font-semibold text-foreground">
              Nenhuma palavra encontrada
            </h2>
            <p className="text-muted-foreground">
              Adicione algumas palavras primeiro para fazer o quiz.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  if (isQuizCompleted) {
    return (
      <div className="min-h-screen p-4">
        <div className="mx-auto max-w-2xl">
          <Card className="text-center">
            <div className="space-y-6">
              <div className="text-6xl">
                {stats.accuracy >= 80
                  ? '🏆'
                  : stats.accuracy >= 60
                    ? '👏'
                    : '💪'}
              </div>

              <div>
                <h2 className="mb-2 text-2xl font-bold text-foreground">
                  Quiz Concluído!
                </h2>
                <p className="text-muted-foreground">
                  Parabéns por completar o quiz de vocabulário!
                </p>
              </div>

              {/* Results */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-success">
                    {stats.correct}
                  </div>
                  <div className="text-sm text-muted-foreground">Corretas</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-destructive">
                    {stats.incorrect}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Incorretas
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-primary">
                    {stats.accuracy}%
                  </div>
                  <div className="text-sm text-muted-foreground">Precisão</div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-foreground">
                    {stats.timeSpent}s
                  </div>
                  <div className="text-sm text-muted-foreground">Tempo</div>
                </div>
              </div>

              {/* Performance Message */}
              <div className="text-center">
                {stats.accuracy >= 80 && (
                  <p className="font-medium text-success">
                    🌟 Excelente performance!
                  </p>
                )}
                {stats.accuracy >= 60 && stats.accuracy < 80 && (
                  <p className="font-medium text-warning">👍 Bom trabalho!</p>
                )}
                {stats.accuracy < 60 && (
                  <p className="font-medium text-muted-foreground">
                    💡 Continue praticando!
                  </p>
                )}
              </div>

              <Button
                onClick={resetQuiz}
                className="[&>span]:flex [&>span]:items-center [&>span]:gap-2"
              >
                <RotateCcw className="size-4" />
                Fazer Novo Quiz
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (!isQuizStarted) {
    return (
      <div className="min-h-screen p-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-foreground">
              🧠 Quiz de Vocabulário
            </h1>
            <p className="text-muted-foreground">
              Teste seus conhecimentos com um quiz interativo
            </p>
          </div>

          {/* Quiz Settings */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Settings Card */}
            <Card>
              <h3 className="mb-4 font-semibold text-foreground">
                Configurações do Quiz
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Número de Perguntas
                  </label>
                  <select
                    value={quizSettings.questionCount}
                    onChange={(e) =>
                      setQuizSettings((prev) => ({
                        ...prev,
                        questionCount: Number(e.target.value)
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value={5}>5 perguntas</option>
                    <option value={10}>10 perguntas</option>
                    <option value={15}>15 perguntas</option>
                    <option value={20}>20 perguntas</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Modo do Quiz
                  </label>
                  <select
                    value={quizSettings.mode}
                    onChange={(e) =>
                      setQuizSettings((prev) => ({
                        ...prev,
                        mode: e.target.value as 'definition' | 'word'
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="definition">
                      Ver palavra → Escolher definição
                    </option>
                    <option value="word">
                      Ver definição → Escolher palavra
                    </option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Statistics Card */}
            <Card>
              <h3 className="mb-4 font-semibold text-foreground">
                Estatísticas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {filteredWords.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Palavras Disponíveis
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {
                      contexts.filter(
                        (c) =>
                          selectedContexts.length === 0 ||
                          selectedContexts.includes(c.id)
                      ).length
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Contextos</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Context Filter */}
          <Card className="mt-6">
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
                  {context.name} (
                  {words.filter((w) => w.contextId === context.id).length})
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

          {/* Start Button */}
          <div className="mt-8 text-center">
            <Button
              onClick={startQuiz}
              disabled={filteredWords.length < 4}
              className="[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span]:px-8 [&>span]:py-3 [&>span]:text-lg"
            >
              <Play className="size-5" />
              Iniciar Quiz
            </Button>
            {filteredWords.length < 4 && (
              <p className="mt-2 text-sm text-muted-foreground">
                São necessárias pelo menos 4 palavras para fazer o quiz
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Pergunta {currentQuestionIndex + 1} de {questions.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {stats.correct} corretas • {stats.incorrect} incorretas
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: `${(currentQuestionIndex / questions.length) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <div className="text-center">
            <div className="mb-6">
              <h2 className="mb-2 text-lg text-muted-foreground">
                {quizSettings.mode === 'definition'
                  ? 'Qual é a definição desta palavra?'
                  : 'Qual palavra corresponde a esta definição?'}
              </h2>
              <div className="text-3xl font-bold text-foreground">
                {quizSettings.mode === 'definition'
                  ? currentQuestion?.word.word
                  : currentQuestion?.word.definition}
              </div>
            </div>

            {/* Options */}
            <div className="mx-auto grid max-w-2xl gap-3">
              {currentQuestion?.options.map((option, index) => {
                let buttonClass =
                  'w-full p-4 text-left border border-border rounded-lg transition-colors hover:bg-surface-hover'

                if (showResult && selectedAnswer) {
                  if (option === currentQuestion.correctAnswer) {
                    buttonClass +=
                      ' bg-success-soft border-success text-success'
                  } else if (
                    option === selectedAnswer &&
                    option !== currentQuestion.correctAnswer
                  ) {
                    buttonClass +=
                      ' bg-destructive-soft border-destructive text-destructive'
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={selectedAnswer !== null}
                    className={buttonClass}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {showResult &&
                        option === currentQuestion.correctAnswer && (
                          <CheckCircle className="size-5 text-success" />
                        )}
                      {showResult &&
                        option === selectedAnswer &&
                        option !== currentQuestion.correctAnswer && (
                          <XCircle className="size-5 text-destructive" />
                        )}
                    </div>
                  </button>
                )
              })}
            </div>

            {showResult && (
              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  Contexto:{' '}
                  {
                    contexts.find(
                      (c) => c.id === currentQuestion.word.contextId
                    )?.name
                  }
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Controls */}
        <div className="text-center">
          <Button
            onClick={resetQuiz}
            variant="outline"
            className="[&>span]:mx-auto [&>span]:flex [&>span]:items-center [&>span]:gap-2"
          >
            <RotateCcw className="size-4" />
            Reiniciar Quiz
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Quiz
