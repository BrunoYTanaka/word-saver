import { STORES } from "../config/database";
import BaseAction from "../core/base-action";
import database from "../core/database";

class AlertAction extends BaseAction {
  constructor() {
    super(STORES.ALERTS);
  }

  async addAlert(alert) {
    return this.add({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      lastTriggered: null,
      isActive: true,
      ...alert,
    });
  }

  async getActiveAlerts() {
    return new Promise((resolve, reject) => {
      const transaction = database.db.transaction([STORES.ALERTS], "readonly");
      const store = transaction.objectStore(STORES.ALERTS);
      const request = store.getAll();

      request.onsuccess = () => {
        const alerts = request.result;
        const activeAlerts = alerts.filter((alert) => alert.isActive === true);
        resolve(activeAlerts);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateAlertLastTriggered(alertId) {
    const alert = await this.get(alertId);
    if (alert) {
      alert.lastTriggered = new Date().toISOString();
      return this.update(alert);
    }
  }
}

export default new AlertAction();
