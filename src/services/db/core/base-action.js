import database from "./database";

class BaseAction {
  constructor(storeName) {
    this.storeName = storeName;
  }

  async add(data) {
    return new Promise((resolve, reject) => {
      const transaction = database.db.transaction(
        [this.storeName],
        "readwrite"
      );
      const store = transaction.objectStore(this.storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(id) {
    return new Promise((resolve, reject) => {
      const transaction = database.db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll() {
    return new Promise((resolve, reject) => {
      const transaction = database.db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async update(data) {
    return new Promise((resolve, reject) => {
      const transaction = database.db.transaction(
        [this.storeName],
        "readwrite"
      );
      const store = transaction.objectStore(this.storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(id) {
    return new Promise((resolve, reject) => {
      const transaction = database.db.transaction(
        [this.storeName],
        "readwrite"
      );
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clear() {
    return new Promise((resolve, reject) => {
      const transaction = database.db.transaction(
        [this.storeName],
        "readwrite"
      );
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export default BaseAction;
