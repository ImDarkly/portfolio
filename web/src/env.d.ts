/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_GITHUB: string
  readonly PUBLIC_LINKEDIN: string
  readonly PUBLIC_EMAIL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
