import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";

// Definindo a coleção de specs (se necessário)
const specs = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}", // Padrão para buscar arquivos Markdown e MDX
    base: "src/contents/specs", // Diretório onde as specs estão localizadas
  }),
});

export const collections = { specs };
