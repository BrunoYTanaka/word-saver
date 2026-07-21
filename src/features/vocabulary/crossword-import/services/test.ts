import { describe, it, expect } from 'vitest'
import { parseCluesFromText } from './clue-parser'

describe('parseCluesFromText', () => {
  it('splits numbered clues within a section', () => {
    const clues = parseCluesFromText(
      'ACROSS\n1. Capital of France\n2. Frozen water\n3. Opposite of night'
    )

    expect(clues).toEqual([
      expect.objectContaining({
        number: 1,
        section: 'across',
        text: 'Capital of France'
      }),
      expect.objectContaining({
        number: 2,
        section: 'across',
        text: 'Frozen water'
      }),
      expect.objectContaining({
        number: 3,
        section: 'across',
        text: 'Opposite of night'
      })
    ])
  })

  it('splits ACROSS and DOWN into separate sections', () => {
    const clues = parseCluesFromText(
      'ACROSS\n1. Capital of France\nDOWN\n1. Small dog'
    )

    expect(clues.map((c) => c.section)).toEqual(['across', 'down'])
    expect(clues[1].text).toBe('Small dog')
  })

  it('recognizes PT-BR headers HORIZONTAIS/VERTICAIS', () => {
    const clues = parseCluesFromText(
      'HORIZONTAIS\n1. Capital da França\nVERTICAIS\n2. Animal de estimação'
    )

    expect(clues.map((c) => c.section)).toEqual(['across', 'down'])
  })

  it('tolerates noisy OCR header text', () => {
    const clues = parseCluesFromText(
      'ACR0SS\n1. Capital of France\nD0WN\n2. Small dog'
    )

    expect(clues.map((c) => c.section)).toEqual(['across', 'down'])
  })

  it('re-attaches unnumbered continuation lines to the previous clue', () => {
    const clues = parseCluesFromText(
      'ACROSS\n1. Capital\nof France\n2. Frozen water'
    )

    expect(clues[0].text).toBe('Capital of France')
  })

  it('keeps unheadered text as an unknown-section low-confidence clue', () => {
    const clues = parseCluesFromText('1. Capital of France')

    expect(clues).toEqual([
      expect.objectContaining({ section: 'unknown', text: 'Capital of France' })
    ])
  })

  it('drops empty/too-short fragments', () => {
    const clues = parseCluesFromText('ACROSS\n1. Ok\n2. \n3. A')

    expect(clues.map((c) => c.number)).toEqual([1])
  })

  it('returns an empty list for blank input', () => {
    expect(parseCluesFromText('   \n  \n')).toEqual([])
  })
})
