import rss from "@astrojs/rss";
import YukinaConfig from "../../yukina.config";
import { getImageSource } from "../utils/imageImports";
import { GetSortedPosts } from "../utils/content";
import { IdToSlug } from "../utils/hash";

export const prerender = true;

export async function GET(context: { site: string }) {
  const posts = await GetSortedPosts();
  const siteURL = new URL(context.site);

  const resolveImageUrl = (rawImage?: string) => {
    if (!rawImage) return undefined;

    const resolved = getImageSource(rawImage, "images/default-image.jpg");
    const path = typeof resolved === "string" ? resolved : resolved?.src;
    if (!path) return undefined;

    if (/^https?:\/\//i.test(path)) return path;
    return new URL(path.startsWith("/") ? path : `/${path}`, siteURL).href;
  };

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
    items: posts.map((post) => {
      const imageURL = resolveImageUrl(
        post.data.meta_image || post.data.attraction_image || post.data.image,
      );

      return {
        title: post.data.title,
        description: post.data.description || "Leia mais sobre essa viagem!",
        pubDate: post.data.published,
        link: `/posts/${IdToSlug(post.id)}/`,
        categories: post.data.tags || [],
        author: post.data.author || YukinaConfig.username,
        enclosure: imageURL
          ? {
              url: imageURL,
              type: "image/jpeg",
              length: 0,
            }
          : undefined,
        content: post.data.description
          ? `<![CDATA[${post.data.description}]]>`
          : undefined,
      };
    }),
  });
}
