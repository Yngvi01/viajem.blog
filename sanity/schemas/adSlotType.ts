import { defineField, defineType } from "sanity";

export const adSlotType = defineType({
  name: "adSlot",
  title: "Slots de Anúncio",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nome interno",
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
      name: "placement",
      title: "Posicionamento",
      type: "string",
      options: {
        list: [
          { title: "Topo do site", value: "header_top" },
          { title: "Topo do conteúdo", value: "content_top" },
          { title: "Fim do conteúdo", value: "content_bottom" },
          { title: "Meio do artigo", value: "post_inline" },
          { title: "Fim do artigo", value: "post_bottom" },
          { title: "Topo da sidebar", value: "sidebar_top" },
          { title: "Rodapé", value: "footer_top" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "provider",
      title: "Provedor",
      type: "string",
      options: {
        list: [
          { title: "Google AdSense", value: "adsense" },
          { title: "HTML customizado", value: "custom_html" },
          { title: "Script externo", value: "external_script" },
        ],
      },
      initialValue: "custom_html",
    }),
    defineField({
      name: "htmlCode",
      title: "Código HTML",
      type: "text",
      rows: 8,
      description: "Cole aqui o bloco de anúncio (iframe/div/script inline).",
    }),
    defineField({
      name: "scriptUrl",
      title: "URL do script externo",
      type: "url",
      description: "Opcional, para carregar script de anúncio externo.",
    }),
    defineField({
      name: "scriptAsync",
      title: "Script async",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "device",
      title: "Dispositivo",
      type: "string",
      options: {
        list: [
          { title: "Todos", value: "all" },
          { title: "Desktop", value: "desktop" },
          { title: "Mobile", value: "mobile" },
        ],
      },
      initialValue: "all",
    }),
    defineField({
      name: "priority",
      title: "Prioridade",
      type: "number",
      initialValue: 100,
      description: "Quanto menor, mais prioridade para exibir.",
    }),
    defineField({
      name: "isActive",
      title: "Ativo",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "startAt",
      title: "Início",
      type: "datetime",
    }),
    defineField({
      name: "endAt",
      title: "Fim",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "placement",
      active: "isActive",
      provider: "provider",
    },
    prepare({ title, subtitle, active, provider }) {
      return {
        title,
        subtitle: `${subtitle || "sem posição"} | ${provider || "sem provedor"} | ${
          active ? "ativo" : "inativo"
        }`,
      };
    },
  },
});
