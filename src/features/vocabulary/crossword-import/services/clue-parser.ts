import type { Clue } from '../types/crossword-import'

type Section = 'across' | 'down'

const HEADER_KEYWORDS: Record<Section, string[]> = {
  across: ['ACROSS', 'HORIZONTAL', 'HORIZONTAIS'],
  down: ['DOWN', 'VERTICAL', 'VERTICAIS']
}

const CLUE_START = /(\d{1,3})\s*[.):]\s*/g

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
}

function levenshtein(a: string, b: string): number {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [
    i,
    ...new Array(b.length).fill(0)
  ])
  for (let j = 0; j <= b.length; j++) rows[0][j] = j

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      rows[i][j] =
        a[i - 1] === b[j - 1]
          ? rows[i - 1][j - 1]
          : 1 + Math.min(rows[i - 1][j - 1], rows[i - 1][j], rows[i][j - 1])
    }
  }
  return rows[a.length][b.length]
}

/**
 * Detects "ACROSS"/"DOWN" (or PT-BR "HORIZONTAIS"/"VERTICAIS") section
 * headers with tolerance for OCR noise (e.g. "ACR0SS", "D0WN").
 */
function detectHeaderSection(line: string): Section | null {
  const cleaned = normalize(line).replace(/[^A-Z0-9]/g, '')
  if (cleaned.length < 4 || cleaned.length > 14) return null

  // OCR frequently confuses digits with visually similar letters (e.g. "D0WN")
  const candidate = cleaned
    .replace(/0/g, 'O')
    .replace(/1/g, 'I')
    .replace(/5/g, 'S')

  for (const [section, keywords] of Object.entries(HEADER_KEYWORDS) as [
    Section,
    string[]
  ][]) {
    for (const keyword of keywords) {
      const maxDistance = keyword.length <= 5 ? 1 : 2
      if (levenshtein(candidate, keyword) <= maxDistance) return section
    }
  }
  return null
}

/**
 * Best-effort segmentation of raw OCR text into individual clues. This is
 * never expected to be perfect — dense, columnar crossword-clue photos push
 * OCR layout analysis past its reliable range, so this pipeline optimizes
 * for "mostly there" rather than exact extraction. Callers must always let
 * the user review/edit the result before saving.
 */
export function parseCluesFromText(rawText: string): Clue[] {
  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const sections: { section: Section | 'unknown'; lines: string[] }[] = []
  let current: Section | 'unknown' = 'unknown'
  let buffer: string[] = []

  const flush = () => {
    if (buffer.length > 0) {
      sections.push({ section: current, lines: buffer })
      buffer = []
    }
  }

  for (const line of lines) {
    const header = detectHeaderSection(line)
    if (header) {
      flush()
      current = header
      continue
    }
    buffer.push(line)
  }
  flush()

  const clues: Clue[] = []

  for (const { section, lines: sectionLines } of sections) {
    const joined = sectionLines.join(' ')
    const matches = [...joined.matchAll(CLUE_START)]

    if (matches.length === 0) {
      const text = joined.trim()
      if (text.length >= 2) {
        clues.push({ id: crypto.randomUUID(), number: null, section, text })
      }
      continue
    }

    matches.forEach((match, index) => {
      const start = match.index! + match[0].length
      const end =
        index + 1 < matches.length ? matches[index + 1].index! : joined.length
      const text = joined.slice(start, end).trim()
      if (text.length >= 2) {
        clues.push({
          id: crypto.randomUUID(),
          number: Number(match[1]),
          section,
          text
        })
      }
    })
  }

  return clues
}
