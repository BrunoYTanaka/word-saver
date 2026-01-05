import database from "./core/database";
import WordAction from "./actions/word-action";
import ContextAction from "./actions/context-action";
import AlertAction from "./actions/alert-action";
import SettingsAction from "./actions/settings-action";
import StatsAction from "./actions/stats-action";
import ExportImportAction from "../db/actions/exportImport-action";

let initPromise = null;

const ensureInitialized = async () => {
  if (!initPromise) {
    initPromise = database.init();
  }
  return initPromise;
};

const createProxy = (target) => {
  return new Proxy(target, {
    get(obj, prop) {
      if (typeof obj[prop] === "function") {
        return async (...args) => {
          await ensureInitialized();
          return obj[prop](...args);
        };
      }
      return obj[prop];
    },
  });
};

export const dbService = {
  words: createProxy(WordAction),
  contexts: createProxy(ContextAction),
  alerts: createProxy(AlertAction),
  settings: createProxy(SettingsAction),
  stats: createProxy(StatsAction),
  export: createProxy(ExportImportAction),
  import: createProxy(ExportImportAction),
  init: () => ensureInitialized(),
  close: () => database.close(),
};
