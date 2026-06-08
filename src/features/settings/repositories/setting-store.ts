import { SettingRow, Settings } from '../types/settings'
import { STORES, IndexedDBAdapter } from '@/core/database'

class SettingStore extends IndexedDBAdapter {
  constructor() {
    super(STORES.SETTINGS)
  }

  async getSetting(key: string): Promise<string | null> {
    const result = await this.get<SettingRow>(key)
    return result ? result.value : null
  }

  async setSetting(key: string, value: string) {
    return this.update<SettingRow>({ key, value } as SettingRow)
  }

  async getSettings(): Promise<Settings> {
    const rows = await this.getAll<SettingRow>()

    return rows.reduce<Settings>((acc, row) => {
      acc[row.key] = row.value
      return acc
    }, {})
  }
}

export default new SettingStore()
