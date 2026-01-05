import { FullAlert } from '../../../types/Alert'
import { FullContext } from '../../../types/Context'
import { Settings } from '../../../types/Settings'
import { FullWord } from '../../../types/Word'

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
