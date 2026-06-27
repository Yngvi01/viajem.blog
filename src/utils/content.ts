import { IdToSlug, NormalizeSlug } from "./hash";
import { GetSanityPosts, IsSanityEnabled } from "./sanity";

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

export interface Tag {
  name: string;
  slug: string;
  posts: Archive[];
}

export interface Category {
  name: string;
  slug: string;
  image: string;
  posts: Archive[];
  description: string;
}

export interface PostData {
  title: string;
  published: Date;
  lastModified?: Date;
  draft?: boolean;
  legacySlugs?: string[];
  description?: string;
  excerpt?: string;
  cover?: string;
  tags?: string[];
  tagSlugs?: string[];
  category?: string;
  categorySlug?: string;
  categoryImage?: string;
  categoryDescription?: string;
  author?: string;
  sourceLink?: string;
  licenseName?: string;
  licenseUrl?: string;
  attraction_image?: string;
  image?: string;
  meta_image?: string;
  keywords?: string[];
}

export interface BlogPostEntry {
  id: string;
  source: "sanity" | "local";
  data: PostData;
  contentHtml?: string;
}

let postEntriesCache: Promise<BlogPostEntry[]> | undefined;

const toDate = (value: Date | string | undefined): Date => {
  if (!value) return new Date(0);
  return value instanceof Date ? value : new Date(value);
};

async function GetSanityPostEntries(): Promise<BlogPostEntry[]> {
  const includeDrafts = !import.meta.env.PROD;
  const sanityPosts = await GetSanityPosts({ includeDrafts });

  return sanityPosts.map((post) => ({
    id: post.id,
    source: "sanity",
    contentHtml: post.contentHtml,
    data: {
      title: post.title,
      published: toDate(post.published),
      lastModified: post.lastModified
        ? toDate(post.lastModified)
        : toDate(post.published),
      draft: post.draft,
      legacySlugs: post.legacySlugs,
      description: post.description,
      excerpt: post.excerpt,
      cover: post.cover,
      tags: post.tags,
      tagSlugs: post.tagSlugs,
      category: post.category,
      categorySlug: post.categorySlug,
      categoryImage: post.categoryImage,
      categoryDescription: post.categoryDescription,
      author: post.author,
      sourceLink: post.sourceLink,
      licenseName: post.licenseName,
      licenseUrl: post.licenseUrl,
      attraction_image: post.attraction_image,
      image: post.image,
      meta_image: post.meta_image,
      keywords: post.keywords,
    },
  }));
}

async function LoadPostEntries(): Promise<BlogPostEntry[]> {
  if (IsSanityEnabled()) {
    return GetSanityPostEntries();
  }
  return [];
}

async function GetAllPostEntries(): Promise<BlogPostEntry[]> {
  if (IsSanityEnabled()) {
    return LoadPostEntries();
  }

  if (!postEntriesCache) {
    postEntriesCache = LoadPostEntries();
  }
  return postEntriesCache;
}

const SortPostsByPublishedDesc = (entries: BlogPostEntry[]): BlogPostEntry[] =>
  [...entries].sort(
    (a, b) =>
      toDate(b.data.published).getTime() - toDate(a.data.published).getTime(),
  );

export async function GetSortedPosts(): Promise<BlogPostEntry[]> {
  const allBlogPosts = await GetAllPostEntries();
  return SortPostsByPublishedDesc(allBlogPosts);
}

export async function GetPostBySlug(
  slug: string,
): Promise<BlogPostEntry | undefined> {
  const allBlogPosts = await GetAllPostEntries();
  return allBlogPosts.find((post) => IdToSlug(post.id) === slug);
}

export async function GetCategories(): Promise<Map<string, Category>> {
  const allBlogPosts = await GetAllPostEntries();
  const categorias = new Map<string, Category>();

  for (const post of allBlogPosts) {
    if (!post.data.category) continue;

    const categorySlug =
      post.data.categorySlug || NormalizeSlug(post.data.category);

    if (!categorias.has(categorySlug)) {
      categorias.set(categorySlug, {
        name: post.data.category,
        slug: categorySlug,
        image:
          post.data.categoryImage ||
          post.data.image ||
          "/images/default-category.jpg",
        posts: [],
        description: post.data.categoryDescription || post.data.category,
      });
    }

    categorias.get(categorySlug)!.posts.push({
      title: post.data.title,
      id: `/posts/${IdToSlug(post.id)}`,
      date: toDate(post.data.published),
      tags: post.data.tags || [],
      data: {
        title: post.data.title,
        description: post.data.description || "",
        image: post.data.image || "/images/default-attraction.jpg",
        attraction_image: post.data.attraction_image,
      },
    });
  }

  for (const [, category] of categorias) {
    category.posts.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  return categorias;
}

export async function GetArchives(): Promise<Map<number, Archive[]>> {
  const allBlogPosts = await GetAllPostEntries();
  const archives = new Map<number, Archive[]>();

  for (const post of allBlogPosts) {
    const date = toDate(post.data.published);
    const year = date.getFullYear();

    if (!archives.has(year)) {
      archives.set(year, []);
    }

    archives.get(year)!.push({
      title: post.data.title,
      id: `/posts/${IdToSlug(post.id)}`,
      date,
      tags: post.data.tags || [],
      data: {
        title: post.data.title,
        image: post.data.attraction_image || "/images/default-attraction.jpg",
        attraction_image: post.data.attraction_image,
        description: post.data.description || "",
      },
    });
  }

  const sortedArchives = new Map(
    [...archives.entries()].sort((a, b) => b[0] - a[0]),
  );

  sortedArchives.forEach((items) => {
    items.sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  return sortedArchives;
}

export async function GetTags(): Promise<Map<string, Tag>> {
  const allBlogPosts = await GetAllPostEntries();
  const tags = new Map<string, Tag>();

  for (const post of allBlogPosts) {
    const postTags = post.data.tags || [];
    const postTagSlugs = post.data.tagSlugs || [];

    postTags.forEach((tag, index) => {
      const tagSlug = postTagSlugs[index] || NormalizeSlug(tag);

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
        date: toDate(post.data.published),
        tags: postTags,
        data: {
          title: post.data.title,
          image: post.data.attraction_image || "/images/default-attraction.jpg",
          attraction_image: post.data.attraction_image,
          description: post.data.description || "",
        },
      });
    });
  }

  for (const [, tag] of tags) {
    tag.posts.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  return tags;
}
