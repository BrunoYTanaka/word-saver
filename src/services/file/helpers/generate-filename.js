export function generateFilename(type = "full", contextName = null) {
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
