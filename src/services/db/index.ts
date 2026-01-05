import database from './core/database'
import WordAction from './actions/word-action'
import ContextAction from './actions/context-action'
import AlertAction from './actions/alert-action'
import SettingsAction from './actions/settings-action'
import StatsAction from './actions/stats-action'
import ExportAction from './actions/export-action'
import ImportAction from './actions/import-action'

interface DbService {
  words: typeof WordAction
  contexts: typeof ContextAction
  alerts: typeof AlertAction
  settings: typeof SettingsAction
  stats: typeof StatsAction
  export: typeof ExportAction
  import: typeof ImportAction
  init: () => Promise<IDBDatabase>
  close: () => Promise<void>
}

export const dbService: DbService = {
  words: WordAction,
  contexts: ContextAction,
  alerts: AlertAction,
  settings: SettingsAction,
  stats: StatsAction,
  export: ExportAction,
  import: ImportAction,
  init: () => database.getDB(),
  close: () => database.close()
}
