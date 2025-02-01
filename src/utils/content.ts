import { getCollection } from "astro:content";
import { IdToSlug } from "./hash";

/**
 * Represents an archive item with a title, slug, date, and optional tags.
 */
export interface Archive {
  id: string;
  title: string;
  tags: string[];
  date: Date;
  data: {
    title: string;
    image?: string;
    attraction_image?: string;
    description?: string;
    excerpt?: string;
  };
}

/**
 * Represents a tag used to categorize content.
 */
export interface Tag {
  name: string;
  slug: string;
  posts: Archive[];
}

/**
 * Represents a category of content.
 */
export interface Category {
  name: string;
  slug: string;
  image: string; // Imagem associada à categoria
  posts: Archive[];
  description: string;
}

/**
 * Retrieves and sorts blog posts by their published date.
 *
 * This function fetches all blog posts from the "posts" collection, filters out drafts if in production mode,
 * and sorts them in descending order by their published date. It also adds navigation properties to each post.
 *
 * @returns A promise that resolves to an array of sorted blog posts.
 */
export async function GetSortedPosts() {
  const allBlogPosts = await getCollection("posts", ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });
  const sorted = allBlogPosts.sort((a, b) => {
    const dateA = new Date(a.data.published);
    const dateB = new Date(b.data.published);
    return dateA > dateB ? -1 : 1;
  });

  for (let i = 1; i < sorted.length; i++) {
    (sorted[i].data as any).nextSlug = (sorted[i - 1] as any).slug;
    (sorted[i].data as any).nextTitle = sorted[i - 1].data.title;
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    (sorted[i].data as any).prevSlug = (sorted[i + 1] as any).slug;
    (sorted[i].data as any).prevTitle = sorted[i + 1].data.title;
  }

  return sorted;
}

/**
 * Retrieves all blog post categories and their associated posts.
 *
 * This function fetches all blog posts from the "posts" collection and organizes them em um Map de categorias.
 * Cada categoria é identificada por um slug gerado a partir do nome (utilizando IdToSlug) e inclui a imagem e descrição.
 *
 * @returns A promise that resolves to a Map of categories.
 */
export async function GetCategories() {
  const allBlogPosts = await getCollection("posts", ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  const categories = new Map<string, Category>();

  allBlogPosts.forEach((post) => {
    if (!post.data.category) return;

    const categorySlug = IdToSlug(post.data.category);

    // Se a categoria ainda não foi criada, cria o objeto utilizando o valor da propriedade 'category'
    if (!categories.has(categorySlug)) {
      categories.set(categorySlug, {
        name: post.data.category,
        slug: categorySlug,
        image: post.data.image || `/images/default-category.jpg`,
        posts: [],
        // Utiliza o valor da propriedade 'category' como descrição
        description: post.data.category 
      });
    }

    // Adiciona o post à categoria
    categories.get(categorySlug)!.posts.push({
      title: post.data.title,
      id: `/posts/${IdToSlug(post.id)}`,
      date: new Date(post.data.published),
      data: {
        title: post.data.title,
        description: post.data.description || "",
        image: post.data.attraction_image || `/images/default-attraction.jpg`,
        attraction_image: post.data.attraction_image,
        excerpt: post.data.excerpt
      }
    });
  });

  return categories;
}


/**
 * Retrieves and organizes blog post archives.
 *
 * This function fetches all blog posts from the "posts" collection, filters out drafts (em produção),
 * and organizes them em um Map agrupado por ano.
 *
 * @returns A promise that resolves to a Map of archives grouped by year.
 */
export async function GetArchives() {
  const allBlogPosts = await getCollection("posts", ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  const archives = new Map<number, Archive[]>();

  for (const post of allBlogPosts) {
    const date = new Date(post.data.published);
    const year = date.getFullYear();
    if (!archives.has(year)) {
      archives.set(year, []);
    }
    archives.get(year)!.push({
      title: post.data.title,
      id: `/posts/${IdToSlug(post.id)}`,
      date: date,
      tags: post.data.tags,
      data: {
        title: post.data.title,
        image: post.data.attraction_image || `/images/default-attraction.jpg`,
        attraction_image: post.data.attraction_image,
        description: post.data.description || "",
        excerpt: post.data.excerpt
      }
    });
  }

  const sortedArchives = new Map(
    [...archives.entries()].sort((a, b) => b[0] - a[0])
  );
  sortedArchives.forEach((value) => {
    value.sort((a, b) => (a.date > b.date ? -1 : 1));
  });

  return sortedArchives;
}

/**
 * Retrieves all tags from blog posts.
 *
 * This function fetches all blog posts from the "posts" collection and extracts tags de cada post,
 * organizando-os em um Map com seus metadados e posts associados.
 *
 * @returns A promise that resolves to a Map of tags.
 */
export async function GetTags() {
  const allBlogPosts = await getCollection("posts", ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  const tags = new Map<string, Tag>();
  allBlogPosts.forEach((post) => {
    post.data.tags?.forEach((tag: string) => {
      const tagSlug = IdToSlug(tag);
      if (!tags.has(tagSlug)) {
        tags.set(tagSlug, {
          name: tag,
          slug: `/tags/${tagSlug}`,
          posts: [],
        });
      }
      tags.get(tagSlug)!.posts.push({
        title: post.data.title,
        id: `/posts/${IdToSlug(post.id)}`,
        date: new Date(post.data.published),
        tags: post.data.tags,
        data: {
          title: post.data.title,
          image: post.data.attraction_image || `/images/default-attraction.jpg`,
          attraction_image: post.data.attraction_image,
          description: post.data.description || "",
          excerpt: post.data.excerpt
        }
      });
    });
  });

  return tags;
}
