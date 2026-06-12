#!/usr/bin/env node
import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { createClient } from "@sanity/client";
import yaml from "js-yaml";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "src", "contents", "posts");
const ASSETS_DIR = path.join(ROOT, "src", "assets", "images");
const PUBLIC_DIR = path.join(ROOT, "public");
const DOTENV_PATH = path.join(ROOT, ".env");
const DRY_RUN = process.argv.includes("--dry-run");
const RUN_ID = `${new Date().toISOString().replace(/\D/g, "").slice(0, 14)}-${randomBytes(3).toString("hex")}`;

const requiredEnvVars = ["SANITY_PROJECT_ID", "SANITY_DATASET", "SANITY_API_TOKEN"];

const slugify = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " e ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean);
};

const toISODate = (value, fallback) => {
  if (!value) return fallback.toISOString();
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  return fallback.toISOString();
};

const parseFrontmatter = (content) => {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { data: {}, body: content };

  return {
    data: yaml.load(match[1]) || {},
    body: content.slice(match[0].length),
  };
};

const makeKeyFactory = () => {
  let index = 0;
  return () => `k${(index++).toString(36).padStart(6, "0")}`;
};

const createTextBlock = (text, keyFactory, extras = {}) => ({
  _type: "block",
  _key: keyFactory(),
  style: "normal",
  markDefs: [],
  children: [
    {
      _type: "span",
      _key: keyFactory(),
      text,
      marks: [],
    },
  ],
  ...extras,
});

const mdxToPortableTextBlocks = (mdxBody) => {
  const lines = mdxBody.split(/\r?\n/);
  const keyFactory = makeKeyFactory();
  const blocks = [];

  let paragraph = [];
  let inCodeFence = false;

  const flushParagraph = () => {
    const text = paragraph.join(" ").replace(/\s+/g, " ").trim();
    paragraph = [];
    if (text) blocks.push(createTextBlock(text, keyFactory));
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      inCodeFence = !inCodeFence;
      paragraph.push(trimmed);
      continue;
    }

    if (inCodeFence) {
      paragraph.push(trimmed);
      continue;
    }

    if (/^\s*import\s.+from\s.+;?\s*$/.test(line) || /^\s*export\s.+/.test(line)) continue;
    if (/^\s*<[^>]+>\s*$/.test(trimmed) || /^\s*<\/[^>]+>\s*$/.test(trimmed) || /^\s*<[^>]+\/>\s*$/.test(trimmed)) continue;

    if (!trimmed || trimmed === "---") {
      flushParagraph();
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      const level = Math.min(heading[1].length, 6);
      const text = heading[2].trim();
      if (text) blocks.push(createTextBlock(text, keyFactory, { style: `h${level}` }));
      continue;
    }

    const bullet = trimmed.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      const text = bullet[1].trim();
      if (text) blocks.push(createTextBlock(text, keyFactory, { listItem: "bullet", level: 1 }));
      continue;
    }

    const ordered = trimmed.match(/^\d+\.\s+(.*)$/);
    if (ordered) {
      flushParagraph();
      const text = ordered[1].trim();
      if (text) blocks.push(createTextBlock(text, keyFactory, { listItem: "number", level: 1 }));
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  return blocks;
};

const compact = (document) =>
  Object.fromEntries(
    Object.entries(document).filter(([, value]) => {
      if (value == null) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      return true;
    }),
  );

const loadDotenv = async () => {
  let content = "";
  try {
    content = await fs.readFile(DOTENV_PATH, "utf8");
  } catch {
    return;
  }

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key] != null) continue;

    let value = rawValue.trim();
    const quote = value[0];
    if ((quote === '"' || quote === "'") && value.endsWith(quote)) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
};

const readPostFiles = async () => {
  const files = await fs.readdir(POSTS_DIR);
  return files
    .filter((file) => /\.(md|mdx)$/i.test(file))
    .map((file) => path.join(POSTS_DIR, file))
    .sort((left, right) => left.localeCompare(right, "pt-BR"));
};

const walkFiles = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => []);
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(absolutePath)));
    } else if (entry.isFile()) {
      files.push(absolutePath);
    }
  }

  return files;
};

const buildImageIndex = async () => {
  const imageFiles = [
    ...(await walkFiles(ASSETS_DIR)),
    ...(await walkFiles(PUBLIC_DIR)),
  ].filter((filePath) => /\.(avif|gif|jpe?g|png|webp)$/i.test(filePath));

  const index = new Map();
  for (const filePath of imageFiles) {
    const basename = path.basename(filePath).toLowerCase();
    if (!index.has(basename)) index.set(basename, filePath);
  }
  return index;
};

const fileExists = async (filePath) => {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
};

const resolveImagePath = async (rawPath, imageIndex) => {
  if (!rawPath || /^https?:\/\//i.test(String(rawPath))) return undefined;

  const normalized = String(rawPath).trim().replace(/\\/g, "/");
  const withoutLeadingSlash = normalized.replace(/^\/+/, "");
  const candidates = [];

  if (withoutLeadingSlash.startsWith("src/images/")) {
    const relativeImagePath = withoutLeadingSlash.slice("src/images/".length);
    candidates.push(path.join(ASSETS_DIR, relativeImagePath));
    candidates.push(path.join(ROOT, withoutLeadingSlash));
  } else if (withoutLeadingSlash.startsWith("src/assets/images/")) {
    candidates.push(path.join(ROOT, withoutLeadingSlash));
  } else if (withoutLeadingSlash.startsWith("images/")) {
    const relativeImagePath = withoutLeadingSlash.slice("images/".length);
    candidates.push(path.join(ASSETS_DIR, relativeImagePath));
    candidates.push(path.join(PUBLIC_DIR, withoutLeadingSlash));
  } else {
    candidates.push(path.join(ROOT, withoutLeadingSlash));
    candidates.push(path.join(ASSETS_DIR, withoutLeadingSlash));
    candidates.push(path.join(PUBLIC_DIR, withoutLeadingSlash));
  }

  for (const candidate of candidates) {
    if (await fileExists(candidate)) return candidate;
  }

  return imageIndex.get(path.basename(withoutLeadingSlash).toLowerCase());
};

const toImageField = (asset) => ({
  _type: "image",
  asset: {
    _type: "reference",
    _ref: asset._id,
  },
});

const createReference = (ref) => ({
  _type: "reference",
  _ref: ref,
});

const createArrayReference = (ref, keyFactory) => ({
  _key: keyFactory(),
  ...createReference(ref),
});

const uploadImage = async ({ client, imageCache, imageIndex, rawPath, label, warnings }) => {
  const resolvedPath = await resolveImagePath(rawPath, imageIndex);
  if (!resolvedPath) {
    warnings.push(`Imagem não encontrada para ${label}: ${rawPath}`);
    return undefined;
  }

  if (DRY_RUN) return { _dryRunPath: resolvedPath };

  if (!imageCache.has(resolvedPath)) {
    const asset = await client.assets.upload("image", createReadStream(resolvedPath), {
      filename: path.basename(resolvedPath),
    });
    imageCache.set(resolvedPath, asset);
  }

  return toImageField(imageCache.get(resolvedPath));
};

const buildMigrationPayload = async () => {
  const postFiles = await readPostFiles();
  const imageIndex = await buildImageIndex();

  const authors = new Map();
  const categories = new Map();
  const tags = new Map();
  const posts = [];
  const warnings = [];

  for (const filePath of postFiles) {
    const source = await fs.readFile(filePath, "utf8");
    const { data, body } = parseFrontmatter(source);
    const fileName = path.basename(filePath, path.extname(filePath));
    const fileSlug = slugify(fileName);
    const canonicalSlug = slugify(data.slug || fileSlug);
    if (!canonicalSlug) {
      warnings.push(`Post ignorado sem slug: ${path.relative(ROOT, filePath)}`);
      continue;
    }

    const title = String(data.title || fileName).trim();
    const description = String(data.description || title).trim();
    const excerpt = String(data.excerpt || description).trim();
    const published = toISODate(data.published || data.date, new Date());
    const lastModified = toISODate(data.lastModified || data.updatedAt || published, new Date(published));
    const authorName = String(data.author || "").trim();
    const categoryName = String(data.category || "").trim();
    const tagNames = toArray(data.tags);
    const keywordNames = toArray(data.keywords);
    const postKeyFactory = makeKeyFactory();
    const legacySlugsSet = new Set(toArray(data.legacySlugs).map(slugify).filter(Boolean));

    if (fileSlug && fileSlug !== canonicalSlug) legacySlugsSet.add(fileSlug);

    let authorRef;
    if (authorName) {
      const authorSlug = slugify(authorName);
      authorRef = `author-${authorSlug}`;
      if (!authors.has(authorRef)) {
        authors.set(authorRef, {
          _id: authorRef,
          _type: "author",
          name: authorName,
          slug: { _type: "slug", current: authorSlug },
        });
      }
    }

    let categoryRef;
    if (categoryName) {
      const categorySlug = slugify(categoryName);
      categoryRef = `category-${categorySlug}`;
      if (!categories.has(categoryRef)) {
        categories.set(categoryRef, {
          _id: categoryRef,
          _type: "category",
          title: categoryName,
          slug: { _type: "slug", current: categorySlug },
          description: categoryName,
          imageSourcePath: data.image,
        });
      }
    }

    const tagRefs = tagNames.map((tagName) => {
      const tagSlug = slugify(tagName);
      const tagRef = `tag-${tagSlug}`;
      if (!tags.has(tagRef)) {
        tags.set(tagRef, {
          _id: tagRef,
          _type: "tag",
          title: tagName,
          slug: { _type: "slug", current: tagSlug },
          description: tagName,
        });
      }
      return tagRef;
    });

    const bodyBlocks = mdxToPortableTextBlocks(body);
    const legacyAssetPaths = [data.cover, data.image, data.attraction_image, data.meta_image]
      .filter((value) => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean);

    posts.push({
      filePath,
      imageSources: {
        cover: data.cover,
        image: data.image,
        attractionImage: data.attraction_image,
        metaImage: data.meta_image,
      },
      document: compact({
        _id: `post-local-${canonicalSlug}-${RUN_ID}`,
        _type: "post",
        title,
        slug: { _type: "slug", current: canonicalSlug },
        published,
        lastModified,
        draft: Boolean(data.draft),
        description,
        excerpt,
        author: authorRef ? createReference(authorRef) : undefined,
        category: categoryRef ? createReference(categoryRef) : undefined,
        tags: tagRefs.map((ref) => createArrayReference(ref, postKeyFactory)),
        keywords: keywordNames,
        sourceLink: data.sourceLink ? String(data.sourceLink).trim() : undefined,
        licenseName: data.licenseName ? String(data.licenseName).trim() : undefined,
        licenseUrl: data.licenseUrl ? String(data.licenseUrl).trim() : undefined,
        legacySlugs: [...legacySlugsSet],
        legacyMdx: body.trim(),
        legacyAssetPaths,
        body: bodyBlocks.length ? bodyBlocks : [createTextBlock(description || title, makeKeyFactory())],
      }),
    });
  }

  return { authors, categories, tags, posts, imageIndex, warnings };
};

const attachImages = async ({ client, imageCache, imageIndex, categories, posts, warnings }) => {
  for (const category of categories.values()) {
    const image = await uploadImage({
      client,
      imageCache,
      imageIndex,
      rawPath: category.imageSourcePath,
      label: `categoria ${category.title}`,
      warnings,
    });
    delete category.imageSourcePath;
    if (image && !image._dryRunPath) category.image = image;
  }

  for (const post of posts) {
    const title = post.document.title;
    const cover = await uploadImage({ client, imageCache, imageIndex, rawPath: post.imageSources.cover, label: `${title} / cover`, warnings });
    const image = await uploadImage({ client, imageCache, imageIndex, rawPath: post.imageSources.image, label: `${title} / image`, warnings });
    const attractionImage = await uploadImage({ client, imageCache, imageIndex, rawPath: post.imageSources.attractionImage, label: `${title} / attractionImage`, warnings });
    const metaImage = await uploadImage({ client, imageCache, imageIndex, rawPath: post.imageSources.metaImage, label: `${title} / metaImage`, warnings });

    if (cover && !cover._dryRunPath) post.document.cover = cover;
    if (image && !image._dryRunPath) post.document.image = image;
    if (attractionImage && !attractionImage._dryRunPath) post.document.attractionImage = attractionImage;
    if (metaImage && !metaImage._dryRunPath) post.document.metaImage = metaImage;
  }
};

const main = async () => {
  await loadDotenv();

  const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
  if (missingEnvVars.length > 0) {
    console.error(`Variáveis ausentes: ${missingEnvVars.join(", ")}`);
    process.exit(1);
  }

  const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    apiVersion: process.env.SANITY_API_VERSION || "2025-02-06",
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
  });

  const payload = await buildMigrationPayload();
  console.log(`${DRY_RUN ? "Dry-run" : "Importação"} local -> Sanity`);
  console.log(`Run ID: ${RUN_ID}`);
  console.log(`Posts locais: ${payload.posts.length}`);
  console.log(`Autores: ${payload.authors.size} | Categorias: ${payload.categories.size} | Tags: ${payload.tags.size}`);

  if (DRY_RUN) {
    for (const warning of payload.warnings) console.warn(`Aviso: ${warning}`);
    console.log("Nenhum documento foi criado.");
    return;
  }

  const imageCache = new Map();
  await attachImages({
    client,
    imageCache,
    imageIndex: payload.imageIndex,
    categories: payload.categories,
    posts: payload.posts,
    warnings: payload.warnings,
  });

  let transaction = client.transaction();
  for (const document of payload.authors.values()) transaction = transaction.createIfNotExists(document);
  for (const document of payload.categories.values()) transaction = transaction.createIfNotExists(compact(document));
  for (const document of payload.tags.values()) transaction = transaction.createIfNotExists(document);
  for (const post of payload.posts) transaction = transaction.create(post.document);

  await transaction.commit();

  const postIds = payload.posts.map((post) => post.document._id);
  const importedCount = await client.fetch("count(*[_type == 'post' && _id in $postIds])", { postIds });

  for (const warning of payload.warnings) console.warn(`Aviso: ${warning}`);
  console.log(`Imagens enviadas: ${imageCache.size}`);
  console.log(`Posts criados no Sanity: ${importedCount}`);
};

main().catch((error) => {
  console.error("Falha ao importar posts locais para o Sanity:", error.message || error);
  process.exit(1);
});
