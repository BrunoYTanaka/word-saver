export interface Clue {
  id: string
  number: number | null
  section: 'across' | 'down' | 'unknown'
  text: string
}

export type ImportWizardStep = 'capture' | 'processing' | 'review'
