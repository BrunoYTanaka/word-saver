import { FullAlert } from '../../../types/alert'
import { FullContext } from '../../../types/context'
import { Settings } from '../../../types/settings'
import { FullWord } from '../../../types/word'

interface Data {
  words?: FullWord[]
  contexts?: FullContext[]
  alerts?: FullAlert[]
  settings?: Settings[]
}

export function countRecords(data: Data): number {
  let count = 0
  if (data.words) count += data.words.length
  if (data.contexts) count += data.contexts.length
  if (data.alerts) count += data.alerts.length
  if (data.settings) count += data.settings.length
  return count
}
