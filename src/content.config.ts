import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

// Definindo a coleção de posts
const posts = defineCollection({
  loader: glob({
    pattern: "**/*.md", // Padrão para buscar todos os arquivos Markdown
    base: "src/contents/posts", // Diretório onde os posts estão localizados
  }),
  schema: z.object({
    title: z.string(), // Título do post
    published: z.date(), // Data de publicação
    draft: z.boolean().optional(), // Indica se o post é um rascunho
    description: z.string().optional(), // Descrição opcional
    cover: z.string().optional(), // Capa opcional
    tags: z.array(z.string()).optional(), // Tags para o post
    category: z.string().optional(), // Categoria do post (por exemplo, cidade)
    author: z.string().optional(), // Autor do post
    sourceLink: z.string().optional(), // Link para fonte externa (se houver)
    licenseName: z.string().optional(), // Nome da licença (se houver)
    licenseUrl: z.string().optional(), // URL da licença (se houver)
    attraction_image: z.string().optional(), // Imagem da atração
    image: z.string().optional(), // Imagem geral do post
  }),
});

// Definindo a coleção de specs (se necessário)
const specs = defineCollection({
  loader: glob({
    pattern: "**/*.md", // Padrão para buscar todos os arquivos Markdown
    base: "src/contents/specs", // Diretório onde as specs estão localizadas
  }),
});

export const collections = { posts, specs };
