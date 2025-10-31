/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_MAX_FILE_SIZE: string;
  readonly VITE_ALLOWED_FILE_TYPES: string;
  readonly VITE_ENABLE_DEBUG: string;
  readonly VITE_ENABLE_MOCK: string;
  readonly VITE_DEEPSEEK_API_URL: string;
  readonly VITE_MINERU_API_URL: string;
  readonly VITE_TTS_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}