import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { FullContext } from '@/features/vocabulary'
import type { Clue } from '../../types/crossword-import'
import Button from '@/shared/ui/Button'

interface ReviewCluesStepProps {
  clues: Clue[]
  rawText: string
  contexts: FullContext[]
  contextId: string
  onContextChange: (id: string) => void
  onClueTextChange: (id: string, text: string) => void
  onRemoveClue: (id: string) => void
  onAddClue: () => void
}

const SECTION_LABELS: Record<Clue['section'], string> = {
  across: 'Horizontais',
  down: 'Verticais',
  unknown: 'Não identificado'
}

export function ReviewCluesStep({
  clues,
  rawText,
  contexts,
  contextId,
  onContextChange,
  onClueTextChange,
  onRemoveClue,
  onAddClue
}: ReviewCluesStepProps) {
  const [showRawText, setShowRawText] = useState(false)

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        A leitura automática não é perfeita — revise, edite ou remova as dicas
        abaixo antes de salvar. Cada uma vira uma palavra pendente, sem
        resposta, para você preencher depois.
      </p>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Contexto</label>
        {contexts.length > 0 ? (
          <select
            value={contextId}
            onChange={(e) => onContextChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none"
          >
            <option value="">Sem contexto</option>
            {contexts.map((ctx) => (
              <option key={ctx.id} value={ctx.id}>
                {ctx.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum contexto cadastrado ainda. As palavras serão salvas sem
            contexto.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Dicas encontradas ({clues.length})
          </span>
          <Button
            variant="outline"
            size="sm"
            icon={<Plus />}
            onClick={onAddClue}
          >
            Adicionar
          </Button>
        </div>

        {clues.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Nenhuma dica foi reconhecida na imagem. Você pode adicionar
            manualmente ou conferir o texto bruto abaixo.
          </p>
        ) : (
          <ul className="max-h-72 space-y-2 overflow-y-auto pr-4">
            {clues.map((clue) => (
              <li key={clue.id} className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-xs text-muted-foreground">
                  {clue.number ? `${clue.number}. ` : ''}
                  {SECTION_LABELS[clue.section]}
                </span>
                <textarea
                  value={clue.text}
                  onChange={(e) => onClueTextChange(clue.id, e.target.value)}
                  rows={1}
                  className="flex-1 resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => onRemoveClue(clue.id)}
                  aria-label="Remover dica"
                  className="shrink-0 rounded-md p-1 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowRawText((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {showRawText ? (
            <ChevronUp className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )}
          Ver texto bruto reconhecido pelo OCR
        </button>
        {showRawText && (
          <textarea
            readOnly
            value={rawText}
            rows={6}
            className="w-full resize-none rounded-lg border border-border bg-surface-muted p-3 font-mono text-xs text-muted-foreground"
          />
        )}
      </div>
    </div>
  )
}
