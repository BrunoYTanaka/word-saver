import { Alert, FullAlert } from '../types/alert'
import { STORES, IndexedDBAdapter } from '@/core/database'

class AlertStore extends IndexedDBAdapter {
  constructor() {
    super(STORES.ALERTS)
  }

  async getAll<T = FullAlert>(): Promise<T[]> {
    return super.getAll<T>()
  }

  async addAlert(alert: Alert): Promise<FullAlert> {
    const newAlert = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      lastTriggered: null,
      isActive: true,
      ...alert
    }

    await this.add(newAlert)

    return newAlert
  }

  async getActiveAlerts(): Promise<FullAlert[]> {
    const alerts = await this.getAll<FullAlert>()
    return alerts.filter((alert: FullAlert) => alert.isActive)
  }

  async updateAlertLastTriggered(
    alertId: string
  ): Promise<IDBValidKey | undefined> {
    const alert = await this.get<FullAlert>(alertId)
    if (alert) {
      alert.lastTriggered = new Date().toISOString()
      return this.update(alert)
    }
  }

  async clear(): Promise<void> {
    return super.clear()
  }
}

export default new AlertStore()
