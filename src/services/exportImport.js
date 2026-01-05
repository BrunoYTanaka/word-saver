// Export/Import Service for Word Saver PWA
import { dbService } from "./db";

class ExportImportService {
  constructor() {
    this.supportedFormats = ["json"];
  }

  // Export all data to JSON
  async exportAllData() {
    try {
      console.log(dbService.export);
      const data = await dbService.export.exportData();
      const exportData = {
        ...data,
        metadata: {
          appName: "Word Saver",
          exportType: "full",
          exportedAt: new Date().toISOString(),
          version: "1.0.0",
        },
      };

      return exportData;
    } catch (error) {
      console.error("Error exporting data:", error);
      throw new Error("Falha ao exportar dados");
    }
  }

  // Export specific context data
  async exportContextData(contextId) {
    try {
      const contextData = await dbService.export.exportContextData(contextId);
      const exportData = {
        ...contextData,
        metadata: {
          appName: "Word Saver",
          exportType: "context",
          exportedAt: new Date().toISOString(),
          version: "1.0.0",
        },
      };

      return exportData;
    } catch (error) {
      console.error("Error exporting context data:", error);
      throw new Error("Falha ao exportar contexto");
    }
  }

  // Export words only (for sharing word lists)
  async exportWordsOnly(contextIds = null) {
    try {
      let words;

      if (contextIds && contextIds.length > 0) {
        const wordArrays = await Promise.all(
          contextIds.map((id) => dbService.words.getWordsByContext(id))
        );
        words = wordArrays.flat();
      } else {
        words = await dbService.words.getAll();
      }

      const contexts = await dbService.contexts.getAll();
      const contextMap = contexts.reduce((acc, ctx) => {
        acc[ctx.id] = ctx.name;
        return acc;
      }, {});

      // Add context names to words for readability
      const enrichedWords = words.map((word) => ({
        ...word,
        contextName: contextMap[word.contextId] || "Desconhecido",
      }));

      return {
        words: enrichedWords,
        contexts: contextIds
          ? contexts.filter((ctx) => contextIds.includes(ctx.id))
          : contexts,
        metadata: {
          appName: "Word Saver",
          exportType: "words-only",
          exportedAt: new Date().toISOString(),
          version: "1.0.0",
          wordCount: words.length,
        },
      };
    } catch (error) {
      console.error("Error exporting words:", error);
      throw new Error("Falha ao exportar palavras");
    }
  }

  // Download data as JSON file
  downloadJSON(data, filename) {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error("Error downloading file:", error);
      throw new Error("Falha ao baixar arquivo");
    }
  }

  // Generate filename with timestamp
  generateFilename(type = "full", contextName = null) {
    const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const time = new Date().toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS

    switch (type) {
      case "context":
        return `word-saver-${
          contextName || "contexto"
        }-${timestamp}-${time}.json`;
      case "words-only":
        return `word-saver-palavras-${timestamp}-${time}.json`;
      default:
        return `word-saver-backup-${timestamp}-${time}.json`;
    }
  }

  // Import data from JSON
  async importData(jsonData, options = {}) {
    const { mode = "merge", validateData = true } = options;

    try {
      let data;

      // Parse JSON if it's a string
      if (typeof jsonData === "string") {
        data = JSON.parse(jsonData);
      } else {
        data = jsonData;
      }

      // Validate data structure
      if (validateData) {
        const validation = this.validateImportData(data);
        if (!validation.isValid) {
          throw new Error(`Dados inválidos: ${validation.errors.join(", ")}`);
        }
      }

      // Import data to database
      const result = await dbService.import.importData(data, mode);

      return {
        success: true,
        imported: result.imported,
        mode,
        metadata: data.metadata || {},
      };
    } catch (error) {
      console.error("Error importing data:", error);
      throw new Error(`Falha ao importar dados: ${error.message}`);
    }
  }

  // Import from file
  async importFromFile(file, options = {}) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("Nenhum arquivo selecionado"));
        return;
      }

      if (file.type !== "application/json" && !file.name.endsWith(".json")) {
        reject(
          new Error("Formato de arquivo não suportado. Use arquivos JSON.")
        );
        return;
      }

      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const result = await this.importData(event.target.result, options);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error("Erro ao ler arquivo"));
      };

      reader.readAsText(file);
    });
  }

  // Validate import data structure
  validateImportData(data) {
    const errors = [];
    let isValid = true;

    // Check if data is an object
    if (!data || typeof data !== "object") {
      return {
        isValid: false,
        errors: ["Dados devem ser um objeto JSON válido"],
      };
    }

    // Validate words structure
    if (data.words && Array.isArray(data.words)) {
      data.words.forEach((word, index) => {
        if (!word.id || !word.word || !word.definition) {
          errors.push(
            `Palavra ${
              index + 1
            }: campos obrigatórios ausentes (id, word, definition)`
          );
          isValid = false;
        }
      });
    }

    // Validate contexts structure
    if (data.contexts && Array.isArray(data.contexts)) {
      data.contexts.forEach((context, index) => {
        if (!context.id || !context.name) {
          errors.push(
            `Contexto ${index + 1}: campos obrigatórios ausentes (id, name)`
          );
          isValid = false;
        }
      });
    }

    // Validate alerts structure
    if (data.alerts && Array.isArray(data.alerts)) {
      data.alerts.forEach((alert, index) => {
        if (!alert.id || !alert.frequency || !alert.time) {
          errors.push(
            `Alerta ${
              index + 1
            }: campos obrigatórios ausentes (id, frequency, time)`
          );
          isValid = false;
        }
      });
    }

    return { isValid, errors };
  }

  // Quick export functions for common use cases
  async quickExportAll() {
    const data = await this.exportAllData();
    const filename = this.generateFilename("full");
    this.downloadJSON(data, filename);
    return { filename, recordCount: this.countRecords(data) };
  }

  async quickExportContext(contextId, contextName) {
    const data = await this.exportContextData(contextId);
    const filename = this.generateFilename("context", contextName);
    this.downloadJSON(data, filename);
    return { filename, recordCount: this.countRecords(data) };
  }

  async quickExportWords(contextIds = null) {
    const data = await this.exportWordsOnly(contextIds);
    const filename = this.generateFilename("words-only");
    this.downloadJSON(data, filename);
    return { filename, recordCount: data.words.length };
  }

  // Count records in export data
  countRecords(data) {
    let count = 0;
    if (data.words) count += data.words.length;
    if (data.contexts) count += data.contexts.length;
    if (data.alerts) count += data.alerts.length;
    if (data.settings) count += data.settings.length;
    return count;
  }

  // Preview import data
  previewImportData(data) {
    try {
      const preview = {
        words: data.words ? data.words.length : 0,
        contexts: data.contexts ? data.contexts.length : 0,
        alerts: data.alerts ? data.alerts.length : 0,
        settings: data.settings ? data.settings.length : 0,
        metadata: data.metadata || {},
        validation: this.validateImportData(data),
      };

      // Sample data preview
      if (data.words && data.words.length > 0) {
        preview.sampleWords = data.words.slice(0, 3).map((word) => ({
          word: word.word,
          definition:
            word.definition.substring(0, 50) +
            (word.definition.length > 50 ? "..." : ""),
          contextName: word.contextName || "N/A",
        }));
      }

      if (data.contexts && data.contexts.length > 0) {
        preview.sampleContexts = data.contexts.slice(0, 3).map((ctx) => ({
          name: ctx.name,
          color: ctx.color || "#3B82F6",
        }));
      }

      return preview;
    } catch (error) {
      console.error("Error previewing import data:", error);
      throw new Error("Erro ao visualizar dados de importação");
    }
  }

  // Backup scheduling (for future implementation)
  async scheduleAutoBackup(frequency = "weekly") {
    // This would integrate with the notification service
    // to schedule automatic backups
    console.log(`Auto backup scheduled: ${frequency}`);
  }
}

// Create singleton instance
const exportImportService = new ExportImportService();

export default exportImportService;
