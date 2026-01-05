import { Settings } from '../../../types/Settings'
import { STORES } from '../config/database'
import BaseAction from '../core/base-action'

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
