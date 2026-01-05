import { DB_NAME, DB_VERSION } from "../config/database";
import { schemas } from "./schemas";

class Database {
  constructor() {
    this.db = null;
    this.initPromise = null;
  }

  async init() {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        Object.entries(schemas).forEach(([storeName, schema]) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, {
              keyPath: schema.keyPath,
            });

            schema.indexes.forEach((index) => {
              store.createIndex(index.name, index.keyPath, {
                unique: index.unique,
              });
            });
          }
        });
      };
    });

    return this.initPromise;
  }

  getDB() {
    if (!this.db) {
      throw new Error("Database not initialized. Call init() first.");
    }
    return this.db;
  }

  async close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

export default new Database();
