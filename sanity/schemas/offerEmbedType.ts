import { defineField, defineType } from "sanity";

export const offerEmbedType = defineType({
  name: "offerEmbed",
  title: "Embed de Oferta",
  type: "object",
  fields: [
    defineField({
      name: "offer",
      title: "Oferta",
      type: "reference",
      to: [{ type: "offer" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "customTitle",
      title: "Título customizado",
      type: "string",
    }),
  ],
  preview: {
    select: {
      title: "customTitle",
      offerTitle: "offer.title",
    },
    prepare({ title, offerTitle }) {
      return {
        title: title || offerTitle || "Oferta incorporada",
      };
    },
  },
});
