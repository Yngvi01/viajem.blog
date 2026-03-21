import { defineField, defineType } from "sanity";

export const affiliateProgramType = defineType({
  name: "affiliateProgram",
  title: "Programas de Afiliados",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nome do programa",
      type: "string",
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "network",
      title: "Rede/Plataforma",
      type: "string",
      options: {
        list: [
          { title: "Booking", value: "booking" },
          { title: "Civitatis", value: "civitatis" },
          { title: "GetYourGuide", value: "getyourguide" },
          { title: "Google Ads", value: "google-ads" },
          { title: "Amazon", value: "amazon" },
          { title: "Outros", value: "other" },
        ],
      },
      initialValue: "other",
    }),
    defineField({
      name: "baseUrl",
      title: "URL base",
      type: "url",
      description: "Link base do programa, se aplicável.",
    }),
    defineField({
      name: "isActive",
      title: "Ativo",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "notes",
      title: "Observações",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "network",
    },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: subtitle ? `Rede: ${subtitle}` : undefined,
      };
    },
  },
});
