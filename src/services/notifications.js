// Notification Service for Word Saver PWA
import { dbService } from "./db";

class NotificationService {
  constructor() {
    this.permission = "default";
    this.isSupported = "Notification" in window;
    this.scheduledAlerts = new Map();
  }

  // Initialize notification service
  async init() {
    if (!this.isSupported) {
      console.warn("Notifications not supported in this browser");
      return false;
    }

    this.permission = Notification.permission;

    if (this.permission === "default") {
      this.permission = await this.requestPermission();
    }

    if (this.permission === "granted") {
      await this.scheduleExistingAlerts();
      return true;
    }

    return false;
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported) return "denied";

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  }

  // Show immediate notification
  showNotification(title, options = {}) {
    if (this.permission !== "granted") return null;

    const defaultOptions = {
      badge: "/pwa-192x192.png",
      icon: "/pwa-192x192.png",
      dir: "ltr",
      lang: "pt-BR",
      vibrate: [200, 100, 200],
      requireInteraction: false,
      silent: false,
      ...options,
    };

    try {
      const notification = new Notification(title, defaultOptions);

      // Auto close after 5 seconds if not interactive
      if (!defaultOptions.requireInteraction) {
        setTimeout(() => notification.close(), 5000);
      }

      return notification;
    } catch (error) {
      console.error("Error showing notification:", error);
      return null;
    }
  }

  // Schedule alert for word review
  async scheduleAlert(alert) {
    if (this.permission !== "granted") return false;

    try {
      const now = new Date();
      const [hours, minutes] = alert.time.split(":").map(Number);

      let nextTrigger = new Date();
      nextTrigger.setHours(hours, minutes, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (nextTrigger <= now) {
        nextTrigger.setDate(nextTrigger.getDate() + 1);
      }

      // For weekly alerts, adjust to next occurrence
      if (alert.frequency === "weekly") {
        // Implementation for weekly scheduling
        const dayOfWeek = alert.days || [new Date().getDay()];
        const currentDay = nextTrigger.getDay();
        const targetDay = dayOfWeek[0];

        const daysUntilTarget = (targetDay - currentDay + 7) % 7;
        if (daysUntilTarget === 0 && nextTrigger <= now) {
          nextTrigger.setDate(nextTrigger.getDate() + 7);
        } else {
          nextTrigger.setDate(nextTrigger.getDate() + daysUntilTarget);
        }
      }

      const timeoutId = setTimeout(async () => {
        await this.triggerAlert(alert);
      }, nextTrigger.getTime() - now.getTime());

      this.scheduledAlerts.set(alert.id, timeoutId);

      console.log(`Alert scheduled for ${nextTrigger.toLocaleString()}`);
      return true;
    } catch (error) {
      console.error("Error scheduling alert:", error);
      return false;
    }
  }

  // Trigger scheduled alert
  async triggerAlert(alert) {
    try {
      // Get words from selected contexts
      const wordsPromises = alert.contextIds.map((contextId) =>
        dbService.words.getWordsByContext(contextId)
      );
      const wordArrays = await Promise.all(wordsPromises);
      const allWords = wordArrays.flat();

      if (allWords.length === 0) {
        console.log("No words found for alert contexts");
        return;
      }

      // Get context names
      const contexts = await Promise.all(
        alert.contextIds.map((id) => dbService.contexts.get(id))
      );
      const contextNames = contexts
        .map((ctx) => ctx?.name)
        .filter(Boolean)
        .join(", ");

      // Show notification
      this.showNotification(`🧠 Hora de revisar palavras!`, {
        body: `${allWords.length} palavras de ${contextNames} aguardando revisão`,
        data: {
          type: "word-review",
          alertId: alert.id,
          contextIds: alert.contextIds,
          wordCount: allWords.length,
        },
        actions: [
          {
            action: "review",
            title: "Revisar Agora",
          },
          {
            action: "later",
            title: "Mais Tarde",
          },
        ],
        requireInteraction: true,
      });

      // Update alert last triggered
      await dbService.alerts.updateAlertLastTriggered(alert.id);

      // Reschedule for next occurrence
      if (alert.isActive) {
        await this.scheduleAlert(alert);
      }
    } catch (error) {
      console.error("Error triggering alert:", error);
    }
  }

  // Cancel scheduled alert
  cancelAlert(alertId) {
    const timeoutId = this.scheduledAlerts.get(alertId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledAlerts.delete(alertId);
      return true;
    }
    return false;
  }

  // Schedule all existing alerts
  async scheduleExistingAlerts() {
    try {
      const activeAlerts = await dbService.alerts.getActiveAlerts();

      for (const alert of activeAlerts) {
        await this.scheduleAlert(alert);
      }

      console.log(`Scheduled ${activeAlerts.length} alerts`);
    } catch (error) {
      console.error("Error scheduling existing alerts:", error);
    }
  }

  // Reschedule all alerts (useful after settings change)
  async rescheduleAlerts() {
    // Cancel all existing schedules
    this.scheduledAlerts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.scheduledAlerts.clear();

    // Reschedule active alerts
    await this.scheduleExistingAlerts();
  }

  // Handle notification click (for service worker)
  static handleNotificationClick(event) {
    event.notification.close();

    const data = event.notification.data || {};

    if (data.type === "word-review") {
      // Open app to review words
      const urlToOpen = `/?review=${data.contextIds.join(",")}&alert=${
        data.alertId
      }`;

      event.waitUntil(
        clients.matchAll().then((clientList) => {
          // Check if app is already open
          for (const client of clientList) {
            if (client.url.includes("/") && "focus" in client) {
              client.navigate(urlToOpen);
              return client.focus();
            }
          }

          // Open new window/tab
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
      );
    }
  }

  // Show word review reminder
  showWordReviewReminder(wordCount, contexts) {
    return this.showNotification("📚 Revisar Palavras", {
      body: `${wordCount} palavras em ${contexts} precisam de revisão`,
      data: { type: "review-reminder" },
      actions: [
        { action: "review", title: "Revisar" },
        { action: "dismiss", title: "Dispensar" },
      ],
    });
  }

  // Show congratulations notification
  showCongratsNotification(milestone) {
    return this.showNotification("🎉 Parabéns!", {
      body: milestone,
      data: { type: "congratulations" },
    });
  }

  // Check if notifications are supported and enabled
  isEnabled() {
    return this.isSupported && this.permission === "granted";
  }

  // Get permission status
  getPermissionStatus() {
    return {
      supported: this.isSupported,
      permission: this.permission,
      enabled: this.isEnabled(),
    };
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
