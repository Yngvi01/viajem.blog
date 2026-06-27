import { defineArrayMember, defineField, defineType } from "sanity";

export const offerType = defineType({
  name: "offer",
  title: "Ofertas de Afiliados",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título da oferta",
      type: "string",
      validation: (Rule) => Rule.required().min(3),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 120 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "legacySlugs",
      title: "Slugs antigos",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      initialValue: [],
      description: "Mantém URLs antigas funcionando.",
    }),
    defineField({
      name: "program",
      title: "Programa de afiliado",
      type: "reference",
      to: [{ type: "affiliateProgram" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "finalUrl",
      title: "URL final afiliada",
      type: "url",
      validation: (Rule) =>
        Rule.required().uri({
          allowRelative: false,
          scheme: ["http", "https"],
        }),
    }),
    defineField({
      name: "ctaText",
      title: "Texto do botão",
      type: "string",
      initialValue: "Ver oferta",
    }),
    defineField({
      name: "description",
      title: "Descrição da oferta",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "destinationName",
      title: "Destino/Passeio",
      type: "string",
      description: "Exemplo: Gramado, Cristo Redentor, Lençóis Maranhenses.",
    }),
    defineField({
      name: "destinationSlug",
      title: "Slug do destino",
      type: "slug",
      options: { source: "destinationName", maxLength: 96 },
    }),
    defineField({
      name: "image",
      title: "Imagem da oferta",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "priceFrom",
      title: "Preço a partir de",
      type: "number",
    }),
    defineField({
      name: "currency",
      title: "Moeda",
      type: "string",
      initialValue: "BRL",
    }),
    defineField({
      name: "tags",
      title: "Tags internas",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "isFeatured",
      title: "Destacar oferta",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "priority",
      title: "Prioridade",
      type: "number",
      initialValue: 100,
      description: "Quanto menor, mais alta a prioridade.",
    }),
    defineField({
      name: "startAt",
      title: "Início da validade",
      type: "datetime",
    }),
    defineField({
      name: "endAt",
      title: "Fim da validade",
      type: "datetime",
    }),
    defineField({
      name: "nofollow",
      title: "Aplicar nofollow",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "sponsored",
      title: "Aplicar sponsored",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "isActive",
      title: "Oferta ativa",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "destinationName",
      media: "image",
      featured: "isFeatured",
      active: "isActive",
    },
    prepare({ title, subtitle, media, featured, active }) {
      const badges = [featured ? "Destaque" : "", active ? "Ativa" : "Inativa"]
        .filter(Boolean)
        .join(" · ");
      return {
        title,
        subtitle: [subtitle, badges].filter(Boolean).join(" | "),
        media,
      };
    },
  },
});
