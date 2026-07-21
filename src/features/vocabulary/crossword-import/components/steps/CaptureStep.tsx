import { Camera, XCircle } from 'lucide-react'

interface CaptureStepProps {
  error: string | null
  onFileSelected: (file: File) => void
}

export function CaptureStep({ error, onFileSelected }: CaptureStepProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onFileSelected(file)
    event.target.value = ''
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Envie uma foto da página de palavras cruzadas. O app vai ler as dicas e
        salvá-las como palavras pendentes, sem a resposta, para você preencher
        depois.
      </p>

      <label
        htmlFor="crossword-photo"
        className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-muted transition-colors hover:bg-surface-hover"
      >
        <Camera className="mb-3 size-8 text-muted-foreground" />
        <p className="text-sm text-foreground">
          <span className="font-semibold">Tirar foto</span> ou escolher da
          galeria
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          A leitura acontece no seu dispositivo, nada é enviado para fora
        </p>
        <input
          id="crossword-photo"
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleChange}
        />
      </label>

      {error && (
        <div className="border-destructive/20 flex items-start gap-2 rounded-lg border bg-surface p-3">
          <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  )
}
