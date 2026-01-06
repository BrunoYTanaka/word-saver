import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import Modal from '../UI/Modal'
import Button from '../UI/Button'
import Card from '../UI/Card'
import { fileService } from '../../services/file'
import { useModal } from '../../context/ModalContext'

const ExportDataModal = () => {
  const { contexts, words } = useApp()
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

  return (
    <Modal
      isOpen={true}
      onClose={() => closeModal('EXPORT_DATA')}
      title="Exportar Dados"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Export Type Selection */}
        <div>
          <h3 className="mb-3 font-semibold text-gray-900 dark:text-gray-100">
            Tipo de Exportação
          </h3>
          <div className="space-y-3">
            {/* Full Export */}
            <label className="flex cursor-pointer items-start space-x-3">
              <input
                type="radio"
                name="exportType"
                value="full"
                checked={exportType === 'full'}
                onChange={(e) => setExportType(e.target.value)}
                className="mt-1 text-blue-600"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Backup Completo
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {getExportDescription()}
                </div>
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
                className="mt-1 text-blue-600"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Contextos Específicos
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
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
                className="mt-1 text-blue-600"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  Apenas Palavras
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
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
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Selecionar Contextos
                {exportType === 'words-only' && ' (opcional)'}
              </h3>
              {contexts.length > 0 && (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleSelectAllContexts}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Todos
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Limpar
                  </button>
                </div>
              )}
            </div>

            {contexts.length === 0 ? (
              <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                Nenhum contexto disponível
              </div>
            ) : (
              <div className="max-h-40 space-y-2 overflow-y-auto">
                {contexts.map((context) => {
                  const wordCount = words.filter(
                    (word) => word.contextId === context.id
                  ).length
                  return (
                    <label
                      key={context.id}
                      className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-3 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedContexts.includes(context.id)}
                          onChange={() => handleContextToggle(context.id)}
                          className="text-blue-600"
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {context.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {wordCount} palavra{wordCount !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      {context.color && (
                        <div
                          className="size-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: context.color }}
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
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-center space-x-4">
            <div className="text-blue-600 dark:text-blue-400">
              <svg
                className="size-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {exportType === 'full' && 'Backup Completo'}
                {exportType === 'context' &&
                  `${selectedContexts.length} Contexto${
                    selectedContexts.length !== 1 ? 's' : ''
                  }`}
                {exportType === 'words-only' && 'Apenas Palavras'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
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

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => closeModal('EXPORT_DATA')}
            disabled={isExporting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            disabled={!canExport() || isExporting}
            className="min-w-30"
          >
            {isExporting ? (
              <div className="flex items-center space-x-2">
                <svg className="size-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Exportando...</span>
              </div>
            ) : (
              'Exportar'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default ExportDataModal
