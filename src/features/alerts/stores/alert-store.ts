import { Alert, FullAlert } from '../types/alert'
import { STORES, IndexedDBAdapter, database } from '@/core/database'

class AlertStore extends IndexedDBAdapter {
  private dbReady: Promise<void>

  constructor() {
    super(STORES.ALERTS)
    this.dbReady = database.init().then(() => {})
  }

  private async ensureDB(): Promise<void> {
    await this.dbReady
  }

  async getAll<T = FullAlert>(): Promise<T[]> {
    await this.ensureDB()
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
    await this.ensureDB()
    const alerts = await this.getAll<FullAlert>()
    return alerts.filter((alert: FullAlert) => alert.isActive)
  }

  async updateAlertLastTriggered(
    alertId: string
  ): Promise<IDBValidKey | undefined> {
    await this.ensureDB()
    const alert = await this.get<FullAlert>(alertId)
    if (alert) {
      alert.lastTriggered = new Date().toISOString()
      return this.update(alert)
    }
  }

  async clear(): Promise<void> {
    await this.ensureDB()
    return super.clear()
  }
}

export default new AlertStore()
