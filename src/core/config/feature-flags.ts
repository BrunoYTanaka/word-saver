/**
 * Build-time feature flags, read from Vite env vars (`VITE_*`). Set them in
 * `.env`/`.env.local` (see `.env.example`) or as env vars at build time —
 * changing a flag requires a rebuild, it is not user-configurable at runtime.
 */
export const featureFlags = {
  crosswordImport: import.meta.env.VITE_ENABLE_CROSSWORD_IMPORT !== 'false'
}
