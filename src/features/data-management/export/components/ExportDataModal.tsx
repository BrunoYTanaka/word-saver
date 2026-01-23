import { FileText } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'
import Modal from '@/shared/ui/Modal'
import Card from '@/shared/ui/Card'
import { fileService } from '../../file'
import { useModal } from '@/shared/context/ModalContext'

const ExportDataModal = () => {
  const { words } = useAppSelector((state) => state.words)
  const { contexts } = useAppSelector((state) => state.contexts)
  const { closeModal } = useModal()

  const [exportType, setExportType] = useState('full')
  const [selectedContexts, setSelectedContexts] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [exportStats, setExportStats] = useState({
    totalWords: 0,
    totalContexts: 0,
    selectedWords: 0
  })

  // Calculate stats when modal opens or selections change
  useEffect(() => {
    const totalWords = words.length
    const totalContexts = contexts.length
    let selectedWords = 0

    if (exportType === 'context' && selectedContexts.length > 0) {
      selectedWords = words.filter((word) =>
        selectedContexts.includes(word.contextId)
      ).length
    } else if (exportType === 'words-only') {
      selectedWords =
        selectedContexts.length > 0
          ? words.filter((word) => selectedContexts.includes(word.contextId))
              .length
          : totalWords
    } else {
      selectedWords = totalWords
    }

    setExportStats({
      totalWords,
      totalContexts,
      selectedWords
    })
  }, [exportType, selectedContexts, words, contexts])

  const handleContextToggle = (contextId: string) => {
    setSelectedContexts((prev) =>
      prev.includes(contextId)
        ? prev.filter((id) => id !== contextId)
        : [...prev, contextId]
    )
  }

  const handleSelectAllContexts = () => {
    setSelectedContexts(contexts.map((ctx) => ctx.id))
  }

  const handleClearSelection = () => {
    setSelectedContexts([])
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      let result

      switch (exportType) {
        case 'full':
          result = await fileService.export.quickExportAll()
          break

        case 'context':
          if (selectedContexts.length === 1) {
            const contextId = selectedContexts[0]
            const context = contexts.find((ctx) => ctx.id === contextId)
            result = await fileService.export.quickExportContext(
              contextId,
              context?.name || ''
            )
          } else {
            // Multiple contexts - export as words only
            result = await fileService.export.quickExportWords(selectedContexts)
          }
          break

        case 'words-only':
          result = await fileService.export.quickExportWords(
            selectedContexts.length > 0 ? selectedContexts : null
          )
          break

        default:
          throw new Error('Tipo de exportação inválido')
      }

      // Success feedback
      console.log('Exportação realizada:', result)

      // Close modal after successful export
      setTimeout(() => {
        closeModal('EXPORT_DATA')
      }, 1000)
    } catch (error) {
      console.error('Erro na exportação:', error)
      alert(
        `Erro ao exportar dados: ${
          error instanceof Error ? error.message : 'Erro desconhecido'
        }`
      )
    } finally {
      setIsExporting(false)
      closeModal('EXPORT_DATA')
    }
  }

  const getExportDescription = () => {
    switch (exportType) {
      case 'full':
        return 'Exporta todos os dados incluindo palavras, contextos, alertas e configurações.'
      case 'context':
        return selectedContexts.length === 1
          ? 'Exporta um contexto específico com suas palavras.'
          : 'Exporta contextos selecionados com suas palavras.'
      case 'words-only':
        return 'Exporta apenas as palavras (ideal para compartilhar listas).'
      default:
        return ''
    }
  }

  const canExport = () => {
    if (exportType === 'full') return true
    if (exportType === 'context' || exportType === 'words-only') {
      return exportType === 'words-only' || selectedContexts.length > 0
    }
    return false
  }

  const modalFooter = (
    <Modal.Footer.Actions
      onCancel={() => closeModal('EXPORT_DATA')}
      onConfirm={handleExport}
      cancelText="Cancelar"
      confirmText="Exportar"
      confirmVariant="primary"
      loading={isExporting}
      confirmDisabled={!canExport() || isExporting}
    />
  )

  return (
    <Modal
      isOpen={true}
      onClose={() => closeModal('EXPORT_DATA')}
      title="Exportar Dados"
      className="max-w-2xl"
      footer={modalFooter}
      closeOnOverlayClick={!isExporting}
      closeOnEscape={!isExporting}
    >
      <div className="space-y-6">
        {/* Export Type Selection */}
        <div>
          <h3 className="mb-3 font-semibold">Tipo de Exportação</h3>
          <div className="space-y-3">
            {/* Full Export */}
            <label className="flex cursor-pointer items-start space-x-3">
              <input
                type="radio"
                name="exportType"
                value="full"
                checked={exportType === 'full'}
                onChange={(e) => setExportType(e.target.value)}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-foreground">
                  Backup Completo
                </div>
                <div className="text-sm">{getExportDescription()}</div>
              </div>
            </label>

            {/* Context Export */}
            <label className="flex cursor-pointer items-start space-x-3">
              <input
                type="radio"
                name="exportType"
                value="context"
                checked={exportType === 'context'}
                onChange={(e) => setExportType(e.target.value)}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-foreground">
                  Contextos Específicos
                </div>
                <div className="text-sm text-muted-foreground">
                  {getExportDescription()}
                </div>
              </div>
            </label>

            {/* Words Only Export */}
            <label className="flex cursor-pointer items-start space-x-3">
              <input
                type="radio"
                name="exportType"
                value="words-only"
                checked={exportType === 'words-only'}
                onChange={(e) => setExportType(e.target.value)}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-foreground">
                  Apenas Palavras
                </div>
                <div className="text-sm text-muted-foreground">
                  {getExportDescription()}
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Context Selection */}
        {(exportType === 'context' || exportType === 'words-only') && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">
                Selecionar Contextos
                {exportType === 'words-only' && ' (opcional)'}
              </h3>
              {contexts.length > 0 && (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleSelectAllContexts}
                    className="text-sm text-primary hover:text-primary-hover"
                  >
                    Todos
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Limpar
                  </button>
                </div>
              )}
            </div>

            {contexts.length === 0 ? (
              <div className="py-4 text-center">Nenhum contexto disponível</div>
            ) : (
              <div className="max-h-40 space-y-2 overflow-y-auto">
                {contexts.map((context) => {
                  const wordCount = words.filter(
                    (word) => word.contextId === context.id
                  ).length
                  return (
                    <label
                      key={context.id}
                      className="flex cursor-pointer items-center justify-between rounded-lg bg-surface-muted p-3 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedContexts.includes(context.id)}
                          onChange={() => handleContextToggle(context.id)}
                        />
                        <div>
                          <div className="font-medium text-foreground">
                            {context.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {wordCount} palavra{wordCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      {context.color && (
                        <div
                          className="size-4 rounded-full border-2 border-border shadow-sm"
                          style={{ backgroundColor: context.color }}
                          title="Cor do contexto"
                        />
                      )}
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Export Stats */}
        <Card className="border-primary">
          <div className="flex items-center space-x-4">
            <div className="text-primary">
              <FileText className="size-6" />
            </div>
            <div>
              <div className="font-semibold">
                {exportType === 'full' && 'Backup Completo'}
                {exportType === 'context' &&
                  `${selectedContexts.length} Contexto${
                    selectedContexts.length !== 1 ? 's' : ''
                  }`}
                {exportType === 'words-only' && 'Apenas Palavras'}
              </div>
              <div className="text-sm text-muted-foreground">
                {exportStats.selectedWords} palavra
                {exportStats.selectedWords !== 1 ? 's' : ''}
                {exportType === 'full' &&
                  `, ${exportStats.totalContexts} contexto${
                    exportStats.totalContexts !== 1 ? 's' : ''
                  }`}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  )
}

export default ExportDataModal
