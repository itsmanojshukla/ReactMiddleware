/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WEATHER_API_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_RETRY_COUNT: string;
  readonly VITE_ENABLE_LOGGING: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
