import { useEffect, useState } from 'react'
import Modal from '@/shared/ui/Modal'
import { useModal } from '@/shared/context/ModalContext'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { addPendingWords } from '@/store/slices/wordsSlice'
import { useCrosswordImport } from '../hooks/useCrosswordImport'
import { CaptureStep } from './steps/CaptureStep'
import { ProcessingStep } from './steps/ProcessingStep'
import { ReviewCluesStep } from './steps/ReviewCluesStep'

const STEP_TITLES = {
  capture: 'Importar Palavra Cruzada',
  processing: 'Lendo a Imagem…',
  review: 'Revisar Dicas Extraídas'
}

const ImportCrosswordModal = () => {
  const dispatch = useAppDispatch()
  const { closeModal } = useModal()
  const { contexts } = useAppSelector((state) => state.contexts)

  const {
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
  } = useCrosswordImport()

  const [contextId, setContextId] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!contextId && contexts.length > 0) {
      setContextId(contexts[0].id)
    }
  }, [contexts, contextId])

  const handleClose = () => {
    reset()
    closeModal('IMPORT_CROSSWORD')
  }

  const handleSave = async () => {
    const validClues = clues.filter((clue) => clue.text.trim())
    if (validClues.length === 0) return

    setIsSaving(true)
    try {
      await dispatch(
        addPendingWords(
          validClues.map((clue) => ({
            word: '',
            definition: clue.text.trim(),
            contextId,
            status: 'pending' as const,
            source: 'crossword-ocr' as const
          }))
        )
      ).unwrap()
      handleClose()
    } catch (err) {
      console.error('Erro ao salvar dicas importadas:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const footer =
    step === 'review' ? (
      <Modal.Footer.Actions
        onCancel={handleClose}
        onConfirm={handleSave}
        cancelText="Cancelar"
        confirmText={
          isSaving
            ? 'Salvando...'
            : `Salvar ${clues.filter((c) => c.text.trim()).length} palavra(s)`
        }
        loading={isSaving}
        confirmDisabled={isSaving || clues.every((c) => !c.text.trim())}
      />
    ) : undefined

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={STEP_TITLES[step]}
      size="lg"
      closeOnOverlayClick={step !== 'processing'}
      footer={footer}
    >
      {step === 'capture' && (
        <CaptureStep error={error} onFileSelected={selectFile} />
      )}
      {step === 'processing' && (
        <ProcessingStep previewUrl={previewUrl} progress={progress} />
      )}
      {step === 'review' && (
        <ReviewCluesStep
          clues={clues}
          rawText={rawText}
          contexts={contexts}
          contextId={contextId}
          onContextChange={setContextId}
          onClueTextChange={updateClueText}
          onRemoveClue={removeClue}
          onAddClue={addClue}
        />
      )}
    </Modal>
  )
}

export default ImportCrosswordModal
