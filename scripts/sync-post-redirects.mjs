#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import { createClient } from "@sanity/client";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "src", "contents", "posts");
const VERCEL_CONFIG_PATH = path.join(ROOT, "vercel.json");
const REDIRECTS_OUTPUT_PATH = path.join(ROOT, "data", "post-slug-redirects.json");

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.SANITY_DATASET;
const SANITY_API_VERSION = process.env.SANITY_API_VERSION || "2025-02-06";
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN;

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

const parseFrontmatter = (content) => {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { data: {}, body: content };
  return {
    data: yaml.load(match[1]) || {},
    body: content.slice(match[0].length),
  };
};

const normalizeLegacySlug = (slug) =>
  String(slug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");

const readLocalSlugData = async () => {
  const files = await fs.readdir(POSTS_DIR);
  const entries = [];

  for (const file of files.sort((a, b) => a.localeCompare(b, "pt-BR"))) {
    if (!/\.(md|mdx)$/i.test(file)) continue;

    const filePath = path.join(POSTS_DIR, file);
    const source = await fs.readFile(filePath, "utf8");
    const { data } = parseFrontmatter(source);

    const fileSlug = slugify(path.basename(file, path.extname(file)));
    const slug = slugify(data.slug || fileSlug);
    if (!slug) continue;

    const legacySet = new Set(toArray(data.legacySlugs).map(slugify).filter(Boolean));
    if (fileSlug && fileSlug !== slug) legacySet.add(fileSlug);

    entries.push({
      basePath: "/posts",
      slug,
      legacySlugs: [...legacySet],
    });
  }

  return entries;
};

const readSanitySlugData = async () => {
  if (!SANITY_PROJECT_ID || !SANITY_DATASET) return [];

  const client = createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    token: SANITY_API_TOKEN,
    useCdn: false,
    perspective: "published",
  });

  const query = `{
    "posts": *[_type == "post" && defined(slug.current)]{
      "slug": slug.current,
      "legacySlugs": coalesce(legacySlugs, [])
    },
    "offers": *[_type == "offer" && defined(slug.current)]{
      "slug": slug.current,
      "legacySlugs": coalesce(legacySlugs, [])
    }
  }`;

  const result = await client.fetch(query);

  const postItems = Array.isArray(result?.posts)
    ? result.posts
        .map((item) => ({
          basePath: "/posts",
          slug: slugify(item.slug),
          legacySlugs: toArray(item.legacySlugs).map(slugify).filter(Boolean),
        }))
        .filter((item) => item.slug)
    : [];

  const offerItems = Array.isArray(result?.offers)
    ? result.offers
        .map((item) => ({
          basePath: "/go",
          slug: slugify(item.slug),
          legacySlugs: toArray(item.legacySlugs).map(slugify).filter(Boolean),
        }))
        .filter((item) => item.slug)
    : [];

  return [...postItems, ...offerItems];
};

const buildSlugRedirects = (items) => {
  const redirects = [];
  const seenSources = new Set();

  for (const item of items) {
    const basePath = item.basePath || "/posts";
    for (const legacySlugRaw of item.legacySlugs || []) {
      const legacySlug = slugify(normalizeLegacySlug(legacySlugRaw));
      if (!legacySlug || legacySlug === item.slug) continue;

      const source = encodeURI(`${basePath}/${legacySlug}`);
      const destination = `${basePath}/${item.slug}`;
      if (seenSources.has(source)) continue;
      seenSources.add(source);

      redirects.push({
        source,
        destination,
        permanent: true,
      });
    }
  }

  return redirects.sort((a, b) => a.source.localeCompare(b.source, "pt-BR"));
};

const syncVercelRedirects = async (postRedirects) => {
  const raw = await fs.readFile(VERCEL_CONFIG_PATH, "utf8");
  const config = JSON.parse(raw);
  const existing = Array.isArray(config.redirects) ? config.redirects : [];

  const staticRedirects = existing.filter(
    (redirect) =>
      typeof redirect?.source === "string" &&
      !redirect.source.startsWith("/posts/") &&
      !redirect.source.startsWith("/go/"),
  );

  config.redirects = [...staticRedirects, ...postRedirects];
  await fs.writeFile(VERCEL_CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, "utf8");
};

const main = async () => {
  let source = "local";
  let items = [];

  try {
    const sanityItems = await readSanitySlugData();
    if (sanityItems.length > 0) {
      items = sanityItems;
      source = "sanity";
    } else {
      items = await readLocalSlugData();
    }
  } catch (error) {
    console.warn("Falha ao ler slugs do Sanity, usando fallback local.");
    items = await readLocalSlugData();
  }

  const postRedirects = buildSlugRedirects(items);

  await fs.mkdir(path.dirname(REDIRECTS_OUTPUT_PATH), { recursive: true });
  await fs.writeFile(
    REDIRECTS_OUTPUT_PATH,
    `${JSON.stringify(postRedirects, null, 2)}\n`,
    "utf8",
  );

  await syncVercelRedirects(postRedirects);

  console.log(`Fonte dos slugs: ${source}`);
  console.log(`Registros analisados: ${items.length}`);
  console.log(`Redirects gerados: ${postRedirects.length}`);
  console.log(`Arquivo atualizado: ${path.relative(ROOT, REDIRECTS_OUTPUT_PATH)}`);
  console.log(`Arquivo atualizado: ${path.relative(ROOT, VERCEL_CONFIG_PATH)}`);
};

main().catch((error) => {
  console.error("Erro ao sincronizar redirects:", error);
  process.exit(1);
});
