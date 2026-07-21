import { useCallback, useState } from 'react'
import { recognizeImage } from '@/core/ocr'
import type { OcrProgress } from '@/core/ocr'
import { parseCluesFromText } from '../services/clue-parser'
import type { Clue, ImportWizardStep } from '../types/crossword-import'

export function useCrosswordImport() {
  const [step, setStep] = useState<ImportWizardStep>('capture')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState<OcrProgress | null>(null)
  const [rawText, setRawText] = useState('')
  const [clues, setClues] = useState<Clue[]>([])
  const [error, setError] = useState<string | null>(null)

  const runOcr = useCallback(async (file: File) => {
    setStep('processing')
    setError(null)
    setProgress(null)
    try {
      const result = await recognizeImage(file, setProgress)
      setRawText(result.text)
      setClues(parseCluesFromText(result.text))
      setStep('review')
    } catch (err) {
      console.error('Erro ao processar imagem da palavra cruzada:', err)
      setError(
        err instanceof Error ? err.message : 'Não foi possível ler a imagem'
      )
      setStep('capture')
    }
  }, [])

  const selectFile = useCallback(
    (file: File) => {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(file)
      })
      runOcr(file)
    },
    [runOcr]
  )

  const updateClueText = useCallback((id: string, text: string) => {
    setClues((prev) =>
      prev.map((clue) => (clue.id === id ? { ...clue, text } : clue))
    )
  }, [])

  const removeClue = useCallback((id: string) => {
    setClues((prev) => prev.filter((clue) => clue.id !== id))
  }, [])

  const addClue = useCallback(() => {
    setClues((prev) => [
      ...prev,
      { id: crypto.randomUUID(), number: null, section: 'unknown', text: '' }
    ])
  }, [])

  const reset = useCallback(() => {
    setStep('capture')
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setProgress(null)
    setRawText('')
    setClues([])
    setError(null)
  }, [])

  return {
    step,
    previewUrl,
    progress,
    rawText,
    clues,
    error,
    selectFile,
    updateClueText,
    removeClue,
    addClue,
    reset
  }
}
