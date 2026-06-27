import { defineArrayMember, defineField, defineType } from "sanity";

export const postType = defineType({
  name: "post",
  title: "Posts",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (Rule) => Rule.required().min(8),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 120 },
      readOnly: ({ document }) => Boolean((document as any)?.slug?.current),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "published",
      title: "Data de publicação",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "lastModified",
      title: "Última atualização",
      type: "datetime",
    }),
    defineField({
      name: "draft",
      title: "Rascunho",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "legacySlugs",
      title: "Slugs antigos (redirect)",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      initialValue: [],
      description:
        "Use para preservar URLs antigas e criar redirects SEO após mudança de slug.",
      validation: (Rule) => Rule.max(20),
    }),
    defineField({
      name: "description",
      title: "Descrição SEO",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required().min(80).max(180),
    }),
    defineField({
      name: "excerpt",
      title: "Resumo",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "author",
      title: "Autor",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "category",
      title: "Categoria",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "tag" }] })],
      validation: (Rule) => Rule.max(12),
    }),
    defineField({
      name: "keywords",
      title: "Palavras-chave SEO",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (Rule) => Rule.max(20),
    }),
    defineField({
      name: "cover",
      title: "Imagem de capa",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "image",
      title: "Imagem principal",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "attractionImage",
      title: "Imagem de atração",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "metaImage",
      title: "Imagem para redes sociais",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "sourceLink",
      title: "Fonte externa",
      type: "url",
    }),
    defineField({
      name: "licenseName",
      title: "Nome da licença",
      type: "string",
    }),
    defineField({
      name: "licenseUrl",
      title: "URL da licença",
      type: "url",
    }),
    defineField({
      name: "body",
      title: "Conteúdo",
      type: "array",
      of: [
        defineArrayMember({ type: "block" }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
            }),
            defineField({
              name: "caption",
              title: "Legenda",
              type: "string",
            }),
          ],
        }),
        defineArrayMember({ type: "offerEmbed" }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "legacyMdx",
      title: "Conteúdo MDX legado",
      type: "text",
      rows: 8,
      description: "Campo opcional para migração inicial dos posts antigos.",
    }),
    defineField({
      name: "legacyAssetPaths",
      title: "Paths de imagens legadas",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description:
        "Lista de caminhos antigos para facilitar migração de mídia.",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "published",
      media: "metaImage",
    },
  },
});
