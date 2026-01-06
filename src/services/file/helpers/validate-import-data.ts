import { Settings } from '../../../types/settings'
import { FullAlert } from '../../../types/alert'
import { FullWord } from '../../../types/word'
import { FullContext } from '../../../types/context'

interface Data {
  words?: FullWord[]
  contexts?: FullContext[]
  alerts?: FullAlert[]
  settings?: Settings
}

export function validateImportData(data: Data): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  let isValid = true

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Dados devem ser um objeto JSON válido']
    }
  }

  // Validate words structure
  if (data.words && Array.isArray(data.words)) {
    data.words.forEach((word, index) => {
      if (!word.id || !word.word || !word.definition) {
        errors.push(
          `Palavra ${
            index + 1
          }: campos obrigatórios ausentes (id, word, definition)`
        )
        isValid = false
      }
    })
  }

  // Validate contexts structure
  if (data.contexts && Array.isArray(data.contexts)) {
    data.contexts.forEach((context, index) => {
      if (!context.id || !context.name) {
        errors.push(
          `Contexto ${index + 1}: campos obrigatórios ausentes (id, name)`
        )
        isValid = false
      }
    })
  }

  // Validate alerts structure
  if (data.alerts && Array.isArray(data.alerts)) {
    data.alerts.forEach((alert, index) => {
      if (!alert.id || !alert.frequency || !alert.time) {
        errors.push(
          `Alerta ${
            index + 1
          }: campos obrigatórios ausentes (id, frequency, time)`
        )
        isValid = false
      }
    })
  }

  return { isValid, errors }
}
