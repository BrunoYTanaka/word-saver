import { STORES } from "../config/database";
import BaseAction from "../core/base-action";
import database from "../core/database";

class WordAction extends BaseAction {
  constructor() {
    super(STORES.WORDS);
  }

  async addWord(word) {
    return this.add({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      reviewCount: 0,
      lastReviewed: null,
      difficulty: "medium",
      ...word,
    });
  }

  async getWordsByContext(contextId) {
    return new Promise((resolve, reject) => {
      const transaction = database.db.transaction([STORES.WORDS], "readonly");
      const store = transaction.objectStore(STORES.WORDS);
      const index = store.index("contextId");
      const request = index.getAll(contextId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async searchWords(query) {
    const words = await this.getAll();
    const searchTerm = query.toLowerCase();

    return words.filter(
      (word) =>
        word.word.toLowerCase().includes(searchTerm) ||
        word.definition.toLowerCase().includes(searchTerm) ||
        (word.tags &&
          word.tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
    );
  }

  async updateWordReview(wordId) {
    const word = await this.get(wordId);
    if (word) {
      word.reviewCount = (word.reviewCount || 0) + 1;
      word.lastReviewed = new Date().toISOString();
      return this.update(word);
    }
  }
}

export default new WordAction();
