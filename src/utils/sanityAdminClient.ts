/**
 * Cliente Sanity configurado para ESCRITA (criar, editar, excluir documentos).
 * Requer SANITY_API_TOKEN com permissão de Editor no projeto Sanity.
 *
 * ATENÇÃO: Use apenas em rotas SSR do servidor. Nunca exponha no cliente.
 */
import { createClient } from "@sanity/client";

const SANITY_PROJECT_ID = import.meta.env.SANITY_PROJECT_ID;
const SANITY_DATASET = import.meta.env.SANITY_DATASET ?? "production";
const SANITY_API_VERSION = import.meta.env.SANITY_API_VERSION ?? "2025-02-06";
const SANITY_API_TOKEN = import.meta.env.SANITY_API_TOKEN;

export const sanityWriteClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  token: SANITY_API_TOKEN,
  useCdn: false, // Sempre buscar dados frescos
});

export function isSanityWriteEnabled(): boolean {
  return Boolean(SANITY_PROJECT_ID && SANITY_DATASET && SANITY_API_TOKEN);
}
