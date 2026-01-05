import { STORES } from "../config/database";
import BaseAction from "../core/base-action";
import WordService from "./word-action";

class ContextAction extends BaseAction {
  constructor() {
    super(STORES.CONTEXTS);
  }

  async addContext(context) {
    return this.add({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...context,
    });
  }

  async getContextWithWordCount() {
    const contexts = await this.getAll();
    const words = await WordService.getAll();

    return contexts.map((context) => ({
      ...context,
      wordCount: words.filter((word) => word.contextId === context.id).length,
    }));
  }
}

export default new ContextAction();
