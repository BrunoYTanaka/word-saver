import { Settings } from '../types/settings'
import { STORES } from '../../../core/database/config/database'
import BaseAction from '../../../core/database/core/base-action'

class SettingAction extends BaseAction {
  constructor() {
    super(STORES.SETTINGS)
  }

  async getSetting(key: string): Promise<string | null> {
    const result = await this.get<Settings>(key)
    return result ? result.value : null
  }

  async setSetting(key: string, value: string) {
    return this.update<Settings>({ key, value })
  }

  async getSettings() {
    const settings = await this.getAll<Settings>()

    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {})
  }
}

export default new SettingAction()
