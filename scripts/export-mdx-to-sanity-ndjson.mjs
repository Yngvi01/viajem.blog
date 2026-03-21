#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "src", "contents", "posts");
const OUTPUT_DIR = path.join(ROOT, "sanity", "migration");
const OUTPUT_NDJSON = path.join(OUTPUT_DIR, "import.ndjson");
const OUTPUT_SLUG_MAP = path.join(OUTPUT_DIR, "post-slug-map.json");

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

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  return fallback.toISOString();
};

const parseFrontmatter = (content) => {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { data: {}, body: content };

  const yamlText = match[1];
  const body = content.slice(match[0].length);
  const data = yaml.load(yamlText) || {};
  return { data, body };
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
    if (!text) return;
    blocks.push(createTextBlock(text, keyFactory));
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

    if (/^\s*import\s.+from\s.+;?\s*$/.test(line) || /^\s*export\s.+/.test(line)) {
      continue;
    }

    if (/^\s*<[^>]+>\s*$/.test(trimmed) || /^\s*<\/[^>]+>\s*$/.test(trimmed) || /^\s*<[^>]+\/>\s*$/.test(trimmed)) {
      continue;
    }

    if (!trimmed || trimmed === "---") {
      flushParagraph();
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      const level = Math.min(heading[1].length, 6);
      const text = heading[2].trim();
      if (text) {
        blocks.push(
          createTextBlock(text, keyFactory, {
            style: `h${level}`,
          }),
        );
      }
      continue;
    }

    const bullet = trimmed.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      const text = bullet[1].trim();
      if (text) {
        blocks.push(
          createTextBlock(text, keyFactory, {
            listItem: "bullet",
            level: 1,
          }),
        );
      }
      continue;
    }

    const ordered = trimmed.match(/^\d+\.\s+(.*)$/);
    if (ordered) {
      flushParagraph();
      const text = ordered[1].trim();
      if (text) {
        blocks.push(
          createTextBlock(text, keyFactory, {
            listItem: "number",
            level: 1,
          }),
        );
      }
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  return blocks;
};

const readPostFiles = async () => {
  const files = await fs.readdir(POSTS_DIR);
  return files
    .filter((file) => /\.(md|mdx)$/i.test(file))
    .map((file) => path.join(POSTS_DIR, file))
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
};

const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

const main = async () => {
  const postFiles = await readPostFiles();
  if (postFiles.length === 0) {
    console.error("Nenhum arquivo .md/.mdx encontrado em src/contents/posts");
    process.exit(1);
  }

  const authors = new Map();
  const categories = new Map();
  const tags = new Map();
  const postDocuments = [];
  const slugMap = [];

  for (const filePath of postFiles) {
    const source = await fs.readFile(filePath, "utf8");
    const { data, body } = parseFrontmatter(source);

    const fileName = path.basename(filePath, path.extname(filePath));
    const fileSlug = slugify(fileName);
    const canonicalSlug = slugify(data.slug || fileSlug);
    if (!canonicalSlug) continue;

    const title = String(data.title || fileName).trim();
    const description = String(data.description || "").trim();
    const excerpt = String(data.excerpt || description).trim();
    const draft = Boolean(data.draft);
    const published = toISODate(data.published || data.date, new Date());
    const lastModified = toISODate(data.lastModified || data.updatedAt || published, new Date(published));

    const authorName = String(data.author || "").trim();
    const categoryName = String(data.category || "").trim();
    const tagNames = toArray(data.tags);
    const keywordNames = toArray(data.keywords);

    const legacySlugsSet = new Set(toArray(data.legacySlugs).map(slugify).filter(Boolean));
    if (fileSlug && fileSlug !== canonicalSlug) legacySlugsSet.add(fileSlug);

    let authorRef;
    if (authorName) {
      const authorSlug = slugify(authorName);
      const authorId = `author-${authorSlug}`;
      authorRef = authorId;
      if (!authors.has(authorId)) {
        authors.set(authorId, {
          _id: authorId,
          _type: "author",
          name: authorName,
          slug: { _type: "slug", current: authorSlug },
        });
      }
    }

    let categoryRef;
    if (categoryName) {
      const categorySlug = slugify(categoryName);
      const categoryId = `category-${categorySlug}`;
      categoryRef = categoryId;
      if (!categories.has(categoryId)) {
        categories.set(categoryId, {
          _id: categoryId,
          _type: "category",
          title: categoryName,
          slug: { _type: "slug", current: categorySlug },
          description: categoryName,
        });
      }
    }

    const tagRefs = tagNames.map((tagName) => {
      const tagSlug = slugify(tagName);
      const tagId = `tag-${tagSlug}`;
      if (!tags.has(tagId)) {
        tags.set(tagId, {
          _id: tagId,
          _type: "tag",
          title: tagName,
          slug: { _type: "slug", current: tagSlug },
        });
      }
      return tagId;
    });

    const bodyBlocks = mdxToPortableTextBlocks(body);
    const imagePaths = [data.cover, data.image, data.attraction_image, data.meta_image]
      .filter((value) => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean);

    const postId = `post-${canonicalSlug}`;
    const postDoc = {
      _id: postId,
      _type: "post",
      title,
      slug: { _type: "slug", current: canonicalSlug },
      published,
      lastModified,
      draft,
      description: description || title,
      excerpt: excerpt || undefined,
      author: authorRef ? { _type: "reference", _ref: authorRef } : undefined,
      category: categoryRef ? { _type: "reference", _ref: categoryRef } : undefined,
      tags: tagRefs.map((ref) => ({ _type: "reference", _ref: ref })),
      keywords: keywordNames,
      sourceLink: data.sourceLink ? String(data.sourceLink).trim() : undefined,
      licenseName: data.licenseName ? String(data.licenseName).trim() : undefined,
      licenseUrl: data.licenseUrl ? String(data.licenseUrl).trim() : undefined,
      legacySlugs: [...legacySlugsSet],
      legacyMdx: body.trim(),
      legacyAssetPaths: imagePaths,
      body: bodyBlocks.length
        ? bodyBlocks
        : [createTextBlock(description || title, makeKeyFactory())],
    };

    const compactPostDoc = Object.fromEntries(
      Object.entries(postDoc).filter(([, value]) => {
        if (value == null) return false;
        if (Array.isArray(value) && value.length === 0) return false;
        if (typeof value === "string" && value.trim() === "") return false;
        return true;
      }),
    );

    postDocuments.push(compactPostDoc);
    slugMap.push({
      file: fileName,
      slug: canonicalSlug,
      legacySlugs: [...legacySlugsSet],
    });
  }

  const documents = [
    ...authors.values(),
    ...categories.values(),
    ...tags.values(),
    ...postDocuments,
  ];

  const ndjsonContent = documents.map((doc) => JSON.stringify(doc)).join("\n") + "\n";

  await ensureDir(OUTPUT_DIR);
  await fs.writeFile(OUTPUT_NDJSON, ndjsonContent, "utf8");
  await fs.writeFile(OUTPUT_SLUG_MAP, JSON.stringify(slugMap, null, 2), "utf8");

  console.log(`Arquivo NDJSON gerado em: ${path.relative(ROOT, OUTPUT_NDJSON)}`);
  console.log(`Mapa de slugs gerado em: ${path.relative(ROOT, OUTPUT_SLUG_MAP)}`);
  console.log(`Total de documentos: ${documents.length}`);
  console.log(`Posts: ${postDocuments.length}`);
  console.log(`Autores: ${authors.size} | Categorias: ${categories.size} | Tags: ${tags.size}`);
  console.log("");
  console.log("Próximo passo sugerido:");
  console.log("npx sanity dataset import sanity/migration/import.ndjson production --replace");
};

main().catch((error) => {
  console.error("Falha ao exportar dados para Sanity:", error);
  process.exit(1);
});
