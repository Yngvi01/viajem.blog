# Sanity CMS no Guia de Viagem

Este projeto está preparado para usar o Sanity como CMS principal e manter fallback para os `.mdx` locais durante a migração.

## 1. Configurar ambiente

1. Copie `.env.example` para `.env`.
2. Preencha:
   - `SANITY_PROJECT_ID`
   - `SANITY_DATASET`
   - `SANITY_API_VERSION` (ex.: `2025-02-06`)
   - `SANITY_API_TOKEN` (opcional, recomendado para previews/drafts)

## 2. Rodar o painel administrativo

```bash
npm run studio
```

O Sanity Studio abrirá no navegador para criar autores, categorias, tags e posts.

## 3. Acesso de admin e autenticação

- O Studio usa autenticação nativa da conta Sanity (`npx sanity login`).
- Não existe login customizado no blog para o painel.
- Controle de permissões (Admin, Editor etc.) é feito no projeto Sanity em `Manage project members`.

## 4. Estrutura de conteúdo pensada para escala

- `author` (autores)
- `category` (categoria única por post)
- `tag` (múltiplas por post)
- `affiliateProgram` (programas de afiliados)
- `offer` (ofertas/links afiliados)
- `adSlot` (blocos de anúncios por posição)
- `post` (conteúdo principal com SEO + mídia + body rico)

Isso evita duplicidade de termos e melhora consistência quando o volume de posts cresce.

## 5.1. Monetização integrada

- Rota de links afiliados: `/go/[slug]` (redirecionamento com `noindex`)
- Página de ofertas: `/ofertas`
- Slots de anúncio suportados:
  - `header_top`
  - `content_top`
  - `content_bottom`
  - `post_inline`
  - `post_bottom`
  - `sidebar_top`
  - `footer_top`

## 5. Publicação e indexação

Fluxo recomendado:
1. Publicar post no Sanity.
2. Acionar build na hospedagem (Vercel Deploy Hook).
3. Novo HTML estático gerado com SEO já aplicado.

## 6. Slug imutável e redirects

- O campo `slug` foi configurado como imutável após ser definido.
- Se precisar mudar URL, adicione o slug antigo em `legacySlugs` no post.
- Sincronize redirects:

```bash
npm run redirects:sync
```

Esse comando atualiza:
- `data/post-slug-redirects.json`
- `vercel.json` (redirects permanentes de `/posts/...` e `/go/...`)

## 7. Migração em lote dos posts MDX

Gerar arquivo de import:

```bash
npm run cms:export
```

Isso cria:
- `sanity/migration/import.ndjson`
- `sanity/migration/post-slug-map.json`

Depois importe no Sanity:

```bash
npx sanity dataset import sanity/migration/import.ndjson production --replace
```

## 8. Fallback automático

Se `SANITY_PROJECT_ID` e `SANITY_DATASET` não estiverem definidos, o site continua usando os conteúdos locais em `src/contents/posts`.

## 9. Migração gradual dos posts antigos

1. Crie autores/categorias/tags no Studio.
2. Migre posts antigos em lotes.
3. Valide slug e título antes de publicar.
4. Após migração total, você pode aposentar os arquivos `.mdx` locais.
