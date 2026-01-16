import database from './core/database'
import WordAction from '../../features/vocabulary/words/services/word-action'
import ContextAction from '../../features/vocabulary/contexts/services/context-action'
import AlertAction from '../../features/alerts/services/alert-action'
import SettingsAction from '../../features/settings/services/settings-action'
import StatsAction from '../../features/analytics/statistics/services/stats-action'
import ExportAction from '../../features/data-management/export/services/export-action'
import ImportAction from '../../features/data-management/import/services/import-action'

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
