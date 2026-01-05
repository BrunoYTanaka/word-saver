import { DB_VERSION, STORES } from "../config/database";
import database from "../core/database";
import AlertService from "./alert-action";
import ContextService from "./context-action";
import SettingService from "./settings-action";
import WordService from "./word-action";

class ExportImportAction {
  async exportData() {
    const data = {
      words: await WordService.getAll(),
      contexts: await ContextService.getAll(),
      alerts: await AlertService.getAll(),
      settings: await SettingService.getAll(),
      exportedAt: new Date().toISOString(),
      version: DB_VERSION,
    };
    return data;
  }

  async exportContextData(contextId) {
    const words = await WordService.getWordsByContext(contextId);
    const context = await ContextService.get(contextId);

    return {
      context,
      words,
      exportedAt: new Date().toISOString(),
      type: "context-export",
    };
  }

  async importData(data, mode = "merge") {
    const transaction = database.db.transaction(
      [STORES.WORDS, STORES.CONTEXTS, STORES.ALERTS, STORES.SETTINGS],
      "readwrite"
    );

    try {
      if (mode === "replace") {
        // Clear existing data
        await Promise.all([
          transaction.objectStore(STORES.WORDS).clear(),
          transaction.objectStore(STORES.CONTEXTS).clear(),
          transaction.objectStore(STORES.ALERTS).clear(),
          transaction.objectStore(STORES.SETTINGS).clear(),
        ]);
      }

      // Import data
      const imports = [];

      if (data.contexts) {
        data.contexts.forEach((context) => {
          imports.push(transaction.objectStore(STORES.CONTEXTS).put(context));
        });
      }

      if (data.words) {
        data.words.forEach((word) => {
          imports.push(transaction.objectStore(STORES.WORDS).put(word));
        });
      }

      if (data.alerts) {
        data.alerts.forEach((alert) => {
          imports.push(transaction.objectStore(STORES.ALERTS).put(alert));
        });
      }

      if (data.settings) {
        data.settings.forEach((setting) => {
          imports.push(transaction.objectStore(STORES.SETTINGS).put(setting));
        });
      }

      await Promise.all(imports);
      return { success: true, imported: imports.length };
    } catch (error) {
      transaction.abort();
      throw error;
    }
  }
}

export default new ExportImportAction();
