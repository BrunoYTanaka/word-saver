/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_CROSSWORD_IMPORT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
