import { useState, useRef } from 'react'
import { FileUp, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import Modal from '@/shared/ui/Modal'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { useModal } from '@/shared/context/ModalContext'
import { fileService } from '../../file'
import { useWords } from '@/features/vocabulary/words/hooks/useWords'
import { useContexts } from '@/features/vocabulary/contexts/hooks/useContexts'
import { useAlerts } from '@/features/alerts/hooks/useAlerts'

interface ImportResult {
  success: boolean
  imported?: number
  errors?: string[]
  mode?: 'merge' | 'replace'
}

interface ImportStats {
  words: number
  contexts: number
  alerts: number
  hasSettings: boolean
}

const ImportDataModal = () => {
  const { closeModal } = useModal()
  const { refreshWords } = useWords()
  const { refreshContexts } = useContexts()
  const { refreshAlerts } = useAlerts()
  const modalRef = useRef<HTMLDivElement>(null)

  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [jsonData, setJsonData] = useState('')
  const [importMethod, setImportMethod] = useState<'file' | 'text'>('file')
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [previewStats, setPreviewStats] = useState<ImportStats | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  const scrollToSection = (
    selector: string,
    block: ScrollLogicalPosition = 'start'
  ) => {
    setTimeout(() => {
      const element = modalRef.current?.querySelector(selector)
      element?.scrollIntoView({
        behavior: 'smooth',
        block
      })
    }, 100)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportResult(null)
    setPreviewStats(null)
    setErrors([])

    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'application/json') {
        setErrors(['Por favor, selecione um arquivo JSON válido'])
        return
      }
      setSelectedFile(file)
      setErrors([])

      // Read file content for preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        try {
          const data = JSON.parse(content)
          setJsonData(content)
          generatePreviewStats(data)
        } catch (error) {
          setErrors(['Arquivo JSON inválido'])
          setSelectedFile(null)
        }
      }
      reader.readAsText(file)
    }
  }

  const handleJsonChange = (value: string) => {
    setJsonData(value)
    setErrors([])

    if (value.trim()) {
      try {
        const data = JSON.parse(value)
        generatePreviewStats(data)
      } catch (error) {
        setPreviewStats(null)
        setErrors(['JSON inválido'])
      }
    } else {
      setPreviewStats(null)
    }
  }

  const generatePreviewStats = (data: unknown) => {
    const dataObj = data as Record<string, unknown> // Type-safe data access
    const stats: ImportStats = {
      words: Array.isArray(dataObj.words) ? dataObj.words.length : 0,
      contexts: Array.isArray(dataObj.contexts) ? dataObj.contexts.length : 0,
      alerts: Array.isArray(dataObj.alerts) ? dataObj.alerts.length : 0,
      hasSettings: !!dataObj.settings
    }
    setPreviewStats(stats)

    scrollToSection('[data-section="preview"]')
  }

  const handleImport = async () => {
    if (!jsonData.trim()) {
      setErrors(['Nenhum dado para importar'])
      return
    }

    setIsImporting(true)
    setImportResult(null)
    setErrors([])

    try {
      const result = await fileService.import.importData(jsonData, {
        mode: importMode,
        validateData: true
      })

      setImportResult(result)

      // Reload all data
      await Promise.all([refreshWords(), refreshContexts(), refreshAlerts()])

      scrollToSection('[data-section="result"]', 'center')
    } catch (error: unknown) {
      setImportResult({
        success: false,
        errors: [
          error instanceof Error ? error.message : 'Erro ao importar dados'
        ]
      })
    } finally {
      setIsImporting(false)
      scrollToSection('[data-section="result"]', 'center')
    }
  }

  const handleSelectImportType = (type: 'file' | 'text') => {
    setImportMethod(type)
    setSelectedFile(null)
    setJsonData('')
    setPreviewStats(null)
    setImportResult(null)
    setErrors([])
  }

  const resetModal = () => {
    setSelectedFile(null)
    setJsonData('')
    setPreviewStats(null)
    setImportResult(null)
    setErrors([])
    setIsImporting(false)
  }

  const handleClose = () => {
    resetModal()
    closeModal('IMPORT_DATA')
  }

  const modalFooter = (
    <Modal.Footer.Actions
      onCancel={() => closeModal('IMPORT_DATA')}
      onConfirm={handleImport}
      cancelText="Cancelar"
      confirmText={isImporting ? 'Importando...' : 'Importar Dados'}
      confirmVariant="primary"
      loading={isImporting}
      confirmDisabled={!jsonData.trim() || isImporting}
    />
  )

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title="Importar Dados"
      closeOnOverlayClick={!isImporting}
      footer={modalFooter}
    >
      <div ref={modalRef} className="space-y-6">
        {/* Import Method Selection */}
        <Card>
          <h3 className="mb-4 font-semibold text-foreground">
            Método de Importação
          </h3>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="importMethod"
                value="file"
                checked={importMethod === 'file'}
                onChange={(e) =>
                  handleSelectImportType(e.target.value as 'file' | 'text')
                }
                className="text-primary"
              />
              <div>
                <div className="font-medium text-foreground">Arquivo JSON</div>
                <div className="text-sm text-muted-foreground">
                  Selecione um arquivo JSON do seu dispositivo
                </div>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="importMethod"
                value="text"
                checked={importMethod === 'text'}
                onChange={(e) =>
                  handleSelectImportType(e.target.value as 'file' | 'text')
                }
                className="text-primary"
              />
              <div>
                <div className="font-medium text-foreground">Colar JSON</div>
                <div className="text-sm text-muted-foreground">
                  Cole o conteúdo JSON diretamente
                </div>
              </div>
            </label>
          </div>
        </Card>

        {/* File Upload or Text Input */}
        {importMethod === 'file' ? (
          <Card>
            <div className="space-y-4">
              <div className="flex w-full items-center justify-center">
                <label
                  htmlFor="json-file"
                  className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-muted transition-colors hover:bg-surface-hover"
                >
                  <div className="flex flex-col items-center justify-center pb-6 pt-5">
                    <FileUp className="mb-4 size-8 text-muted-foreground" />
                    <p className="mb-2 text-sm text-foreground">
                      <span className="font-semibold">Clique para enviar</span>{' '}
                      ou arraste o arquivo
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Apenas arquivos JSON
                    </p>
                  </div>
                  <input
                    id="json-file"
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>

              {selectedFile && (
                <div className="flex items-center gap-2 rounded-lg bg-surface-muted p-2">
                  <div className="flex flex-1 items-center gap-2">
                    <CheckCircle className="size-4 text-success" />
                    <span className="text-sm text-foreground">
                      {selectedFile.name}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetModal}>
                    Remover
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card>
            <div className="space-y-4">
              <label className="block font-medium text-foreground">
                Conteúdo JSON:
              </label>
              <textarea
                value={jsonData}
                onChange={(e) => handleJsonChange(e.target.value)}
                placeholder='Cole seu JSON aqui...\n\n{\n  "words": [...],\n  "contexts": [...]\n}'
                className="h-40 w-full resize-none rounded-lg border border-border bg-background p-3 font-mono text-sm"
              />
            </div>
          </Card>
        )}

        {/* Preview Stats */}
        {previewStats && (
          <div
            data-section="preview"
            className="bg-card rounded-lg border border-border p-6 shadow-sm"
          >
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <AlertTriangle className="size-5 text-warning" />
              Prévia dos Dados
            </h3>

            <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {previewStats.words}
                </div>
                <div className="text-sm text-muted-foreground">Palavras</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {previewStats.contexts}
                </div>
                <div className="text-sm text-muted-foreground">Contextos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">
                  {previewStats.alerts}
                </div>
                <div className="text-sm text-muted-foreground">Alertas</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    previewStats.hasSettings
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {previewStats.hasSettings ? '✓' : '✗'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Configurações
                </div>
              </div>
            </div>

            {/* Import Mode Selection */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">
                Modo de Importação:
              </h4>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={(e) =>
                    setImportMode(e.target.value as 'merge' | 'replace')
                  }
                  className="mt-1 text-primary"
                />
                <div>
                  <div className="font-medium text-foreground">
                    Mesclar (Recomendado)
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Adiciona novos dados aos existentes. Dados duplicados são
                    ignorados.
                  </div>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={(e) =>
                    setImportMode(e.target.value as 'merge' | 'replace')
                  }
                  className="mt-1 text-primary"
                />
                <div>
                  <div className="font-medium text-destructive">
                    Substituir (Cuidado!)
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Remove todos os dados existentes e importa apenas os novos.
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <Card className="border-destructive/20" data-section="errors">
            <div className="flex items-start gap-2">
              <XCircle className="mt-0.5 size-5 text-destructive" />
              <div className="space-y-1">
                <h4 className="font-medium text-destructive">
                  Erros encontrados:
                </h4>
                <ul className="space-y-1 text-sm text-destructive">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Import Result */}
        {importResult && (
          <div
            data-section="result"
            className={`rounded-lg border p-6 shadow-sm ${
              importResult.success
                ? 'border-success/20 bg-card'
                : 'border-destructive/20 bg-card'
            }`}
          >
            <div className="flex items-start gap-2">
              {importResult.success ? (
                <CheckCircle className="mt-0.5 size-5 text-success" />
              ) : (
                <XCircle className="mt-0.5 size-5 text-destructive" />
              )}
              <div className="space-y-2">
                <h4
                  className={`font-medium ${
                    importResult.success ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {importResult.success
                    ? 'Importação realizada com sucesso!'
                    : 'Falha na importação'}
                </h4>

                {importResult.success && importResult.imported && (
                  <div className="text-sm text-muted-foreground">
                    Importado: {importResult.imported} registros
                    {importResult.mode === 'replace' &&
                      ' (substituição completa)'}
                  </div>
                )}

                {!importResult.success && importResult.errors && (
                  <ul className="space-y-1 text-sm text-destructive">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ImportDataModal
