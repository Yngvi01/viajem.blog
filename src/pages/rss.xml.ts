import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { IdToSlug } from '../utils/hash';
import YukinaConfig from "../../yukina.config";


export async function GET(context: { site: string }) {
  const posts = await getCollection("posts");

  return rss({
    title: YukinaConfig.title,
    description: YukinaConfig.description,
    site: context.site,
    customData: `<language>${YukinaConfig.locale}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Astro</generator>
    <copyright>Copyright ${new Date().getFullYear()} ${YukinaConfig.title}</copyright>
    <managingEditor>contato@${new URL(YukinaConfig.site).hostname}</managingEditor>
    <webMaster>webmaster@${new URL(YukinaConfig.site).hostname}</webMaster>
    <ttl>60</ttl>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description || "Leia mais sobre essa viagem!",
      pubDate: post.data.published,
      link: `${context.site}/${IdToSlug(post.id)}/`,
      categories: post.data.tags || [],
      author: post.data.author || YukinaConfig.username,
      enclosure: post.data.image ? {
        url: new URL(post.data.image, context.site).href,
        type: 'image/jpeg',
        length: 0
      } : undefined,
      content: post.data.description ? `<![CDATA[${post.data.description}]]>` : undefined,
    })),
  });
}
