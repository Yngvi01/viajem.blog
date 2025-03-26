import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { IdToSlug } from '../utils/hash';


export async function GET(context: { site: string }) {
  const posts = await getCollection("posts");

  return rss({
    title: "Guia de Viagem",
    description: "As melhores dicas e guias de viagem para destinos nacionais e internacionais.",
    site: context.site,
    customData: `<language>pt-BR</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate><generator>Astro</generator>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description || "Leia mais sobre essa viagem!",
      pubDate: post.data.published,
      link: `${context.site}/${IdToSlug(post.id)}/`,
      categories: post.data.tags || [],
      author: post.data.author || "Guia de Viagem",
      enclosure: post.data.image ? {
        url: new URL(post.data.image, context.site).href,
        type: 'image/jpeg',
      } : undefined,
    })),
  });
}
