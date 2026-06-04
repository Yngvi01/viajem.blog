/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { AstroIntegration } from "@swup/astro";

declare global {
  interface Window {
    swup: AstroIntegration;
  }
}

interface ImportMetaEnv {
  readonly SANITY_PROJECT_ID?: string;
  readonly SANITY_DATASET?: string;
  readonly SANITY_API_VERSION?: string;
  readonly SANITY_API_TOKEN?: string;
  readonly SANITY_STUDIO_PROJECT_ID?: string;
  readonly SANITY_STUDIO_DATASET?: string;
  readonly PUBLIC_GOOGLE_SITE_VERIFICATION?: string;
  readonly PUBLIC_BING_SITE_VERIFICATION?: string;
  readonly PUBLIC_YANDEX_SITE_VERIFICATION?: string;
  // ─── Admin Auth ────────────────────────────────────────────────────────────
  readonly ADMIN_USERNAME?: string;
  readonly ADMIN_PASSWORD_HASH?: string;
  readonly SESSION_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
