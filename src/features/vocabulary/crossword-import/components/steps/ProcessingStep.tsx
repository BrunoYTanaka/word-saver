import type { OcrProgress } from '@/core/ocr'

interface ProcessingStepProps {
  previewUrl: string | null
  progress: OcrProgress | null
}

const STATUS_LABELS: Record<string, string> = {
  'loading tesseract core': 'Carregando motor de OCR…',
  'initializing tesseract': 'Inicializando…',
  'loading language traineddata': 'Carregando dados do idioma…',
  'initializing api': 'Preparando…',
  'recognizing text': 'Lendo as dicas…'
}

export function ProcessingStep({ previewUrl, progress }: ProcessingStepProps) {
  const percent = Math.round((progress?.progress ?? 0) * 100)
  const label = progress
    ? STATUS_LABELS[progress.status] ?? progress.status
    : 'Preparando…'

  return (
    <div className="space-y-4">
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Foto da palavra cruzada enviada"
          className="max-h-48 w-full rounded-lg border border-border object-contain"
        />
      )}

      <div className="space-y-2">
        <p className="text-sm text-foreground">{label}</p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{percent}%</p>
      </div>
    </div>
  )
}
