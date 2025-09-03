/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REPLICATE_API_TOKEN: string
  readonly VITE_REPLICATE_MODEL_VERSION: string
  readonly VITE_REPLICATE_LLM_MODEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}