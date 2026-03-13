import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { IdToSlug } from '../utils/hash';
import YukinaConfig from "../../yukina.config";
import { getImageSource } from "../utils/imageImports";


export async function GET(context: { site: string }) {
  const posts = await getCollection("posts", ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });
  const sortedPosts = posts.sort(
    (a, b) =>
      new Date(b.data.published).getTime() - new Date(a.data.published).getTime(),
  );
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
    items: sortedPosts.map((post) => {
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
