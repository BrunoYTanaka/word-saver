import { STORES } from "../config/database";
import BaseAction from "../core/base-action";

class SettingAction extends BaseAction {
  constructor() {
    super(STORES.SETTINGS);
  }

  async getSetting(key) {
    const result = await this.get(key);
    return result ? result.value : null;
  }

  async setSetting(key, value) {
    return this.update({ key, value });
  }

  async getSettings() {
    const settings = await this.getAll();

    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
  }
}

export default new SettingAction();
