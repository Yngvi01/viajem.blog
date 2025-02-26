import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { IdToSlug } from "../../utils/hash";

export async function GET(context: { site: string }) {
  const posts = await getCollection("posts");

  return rss({
    title: "Guia de Viagem",
    description: "As melhores dicas e guias de viagem.",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description || "Leia mais sobre essa viagem!",
      pubDate: post.data.published,
      link: `${context.site}/${IdToSlug(post.id)}/`, // Adiciona a URL correta
    })),
  });
}
