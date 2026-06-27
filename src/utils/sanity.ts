import { createClient } from "@sanity/client";
import { toHTML } from "@portabletext/to-html";
import { NormalizeSlug } from "./hash";
import { getKnownImageSource } from "./imageImports";
import { renderMdxContentToHtml } from "./mdxRenderer";

const SANITY_PROJECT_ID = import.meta.env.SANITY_PROJECT_ID;
const SANITY_DATASET = import.meta.env.SANITY_DATASET;
const SANITY_API_VERSION = import.meta.env.SANITY_API_VERSION || "2025-02-06";
const SANITY_API_TOKEN = import.meta.env.SANITY_API_TOKEN;

const SANITY_POSTS_QUERY = `
  *[_type == "post" && ($includeDrafts || !coalesce(draft, false))] | order(published desc) {
    _id,
    title,
    "slug": slug.current,
    "legacySlugs": coalesce(legacySlugs, []),
    published,
    "lastModified": coalesce(lastModified, _updatedAt),
    draft,
    description,
    excerpt,
    "category": category->title,
    "categorySlug": category->slug.current,
    "categoryImage": category->image.asset->url,
    "categoryDescription": category->description,
    "tags": tags[]->title,
    "tagSlugs": tags[]->slug.current,
    "cover": cover.asset->url,
    "image": image.asset->url,
    "attraction_image": attractionImage.asset->url,
    "meta_image": metaImage.asset->url,
    keywords,
    "author": coalesce(author->name, author),
    sourceLink,
    licenseName,
    licenseUrl,
    legacyMdx,
    "body": body[]{
      ...,
      _type == "image" => {
        ...,
        "asset": asset->{
          "url": url,
          "altText": altText
        }
      },
      _type == "offerEmbed" => {
        ...,
        "offer": offer->{
          title,
          "slug": slug.current,
          finalUrl,
          ctaText,
          "image": image.asset->url,
          "programName": program->name,
          nofollow,
          sponsored
        }
      }
    }
  }
`;

const SANITY_OFFERS_QUERY = `
  *[
    _type == "offer" &&
    defined(slug.current) &&
    ($includeInactive || coalesce(isActive, true) == true) &&
    (!defined(startAt) || startAt <= now()) &&
    (!defined(endAt) || endAt >= now())
  ] | order(coalesce(isFeatured, false) desc, coalesce(priority, 100) asc, _updatedAt desc) {
    _id,
    title,
    "slug": slug.current,
    "legacySlugs": coalesce(legacySlugs, []),
    finalUrl,
    ctaText,
    description,
    "image": image.asset->url,
    destinationName,
    "destinationSlug": destinationSlug.current,
    priceFrom,
    currency,
    tags,
    isFeatured,
    priority,
    nofollow,
    sponsored,
    isActive,
    "programName": program->name,
    "programSlug": program->slug.current
  }
`;

const SANITY_AD_SLOTS_QUERY = `
  *[
    _type == "adSlot" &&
    placement == $placement &&
    coalesce(isActive, true) == true &&
    (!defined(startAt) || startAt <= now()) &&
    (!defined(endAt) || endAt >= now())
  ] | order(coalesce(priority, 100) asc, _updatedAt desc) {
    _id,
    name,
    "slug": slug.current,
    placement,
    provider,
    htmlCode,
    scriptUrl,
    scriptAsync,
    device,
    priority
  }
`;

interface RawSanityPost {
  _id: string;
  slug?: string;
  legacySlugs?: string[];
  title?: string;
  published?: string;
  lastModified?: string;
  draft?: boolean;
  description?: string;
  excerpt?: string;
  category?: string;
  categorySlug?: string;
  categoryImage?: string;
  categoryDescription?: string;
  tags?: string[];
  tagSlugs?: string[];
  cover?: string;
  image?: string;
  attraction_image?: string;
  meta_image?: string;
  keywords?: string[];
  author?: string;
  sourceLink?: string;
  licenseName?: string;
  licenseUrl?: string;
  legacyMdx?: string;
  body?: unknown[];
}

interface RawSanityOffer {
  _id: string;
  title?: string;
  slug?: string;
  legacySlugs?: string[];
  finalUrl?: string;
  ctaText?: string;
  description?: string;
  image?: string;
  destinationName?: string;
  destinationSlug?: string;
  priceFrom?: number;
  currency?: string;
  tags?: string[];
  isFeatured?: boolean;
  priority?: number;
  nofollow?: boolean;
  sponsored?: boolean;
  isActive?: boolean;
  programName?: string;
  programSlug?: string;
}

interface RawSanityAdSlot {
  _id: string;
  name?: string;
  slug?: string;
  placement?: string;
  provider?: "adsense" | "custom_html" | "external_script";
  htmlCode?: string;
  scriptUrl?: string;
  scriptAsync?: boolean;
  device?: "all" | "desktop" | "mobile";
  priority?: number;
}

export type SanityAdPlacement =
  | "header_top"
  | "content_top"
  | "content_bottom"
  | "post_inline"
  | "post_bottom"
  | "sidebar_top"
  | "footer_top";

export interface SanityPost {
  id: string;
  slug: string;
  legacySlugs: string[];
  title: string;
  published: string;
  lastModified?: string;
  draft: boolean;
  description?: string;
  excerpt?: string;
  category?: string;
  categorySlug?: string;
  categoryImage?: string;
  categoryDescription?: string;
  tags: string[];
  tagSlugs: string[];
  cover?: string;
  image?: string;
  attraction_image?: string;
  meta_image?: string;
  keywords: string[];
  author?: string;
  sourceLink?: string;
  licenseName?: string;
  licenseUrl?: string;
  contentHtml: string;
}

const resolveImportedImageSrc = (src: string): string | undefined => {
  const resolved = getKnownImageSource(src);
  if (!resolved) return src;
  if (typeof resolved === "string") return resolved;
  if (
    typeof resolved === "object" &&
    "src" in resolved &&
    typeof resolved.src === "string"
  ) {
    return resolved.src;
  }
  return src;
};

export interface SanityOffer {
  id: string;
  title: string;
  slug: string;
  legacySlugs: string[];
  finalUrl: string;
  ctaText: string;
  description?: string;
  image?: string;
  destinationName?: string;
  destinationSlug?: string;
  priceFrom?: number;
  currency?: string;
  tags: string[];
  isFeatured: boolean;
  priority: number;
  nofollow: boolean;
  sponsored: boolean;
  isActive: boolean;
  programName?: string;
  programSlug?: string;
}

export interface SanityAdSlot {
  id: string;
  name: string;
  slug: string;
  placement: SanityAdPlacement;
  provider: "adsense" | "custom_html" | "external_script";
  htmlCode?: string;
  scriptUrl?: string;
  scriptAsync: boolean;
  device: "all" | "desktop" | "mobile";
  priority: number;
}

export function IsSanityEnabled(): boolean {
  return Boolean(SANITY_PROJECT_ID && SANITY_DATASET);
}

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const isSafeHref = (href: string): boolean =>
  /^(https?:|mailto:|tel:|\/)/i.test(href);

const renderPortableText = (blocks: unknown[] | undefined): string => {
  if (!Array.isArray(blocks) || blocks.length === 0) return "";

  return toHTML(blocks as any, {
    components: {
      marks: {
        link: ({ value, children }: any) => {
          const href = typeof value?.href === "string" ? value.href.trim() : "";
          if (!href || !isSafeHref(href)) return children;

          const isExternal = /^https?:\/\//i.test(href);
          const rel = isExternal ? ' rel="nofollow noopener noreferrer"' : "";
          const target = isExternal ? ' target="_blank"' : "";
          return `<a href="${escapeHtml(href)}"${target}${rel}>${children}</a>`;
        },
      },
      types: {
        image: ({ value }: any) => {
          const imageUrl = value?.asset?.url;
          if (typeof imageUrl !== "string" || !imageUrl) return "";

          const altCandidate =
            value?.alt || value?.asset?.altText || "Imagem do artigo";
          const caption =
            typeof value?.caption === "string" ? value.caption : "";

          const figcaption = caption
            ? `<figcaption>${escapeHtml(caption)}</figcaption>`
            : "";
          return `<figure><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(
            String(altCandidate),
          )}" loading="lazy" decoding="async" />${figcaption}</figure>`;
        },
        offerEmbed: ({ value }: any) => {
          const embeddedOffer = value?.offer;
          const offerTitle =
            typeof value?.customTitle === "string" && value.customTitle.trim()
              ? value.customTitle.trim()
              : embeddedOffer?.title;

          if (typeof offerTitle !== "string" || !offerTitle) return "";

          const offerSlug =
            typeof embeddedOffer?.slug === "string"
              ? embeddedOffer.slug.trim()
              : "";
          const finalUrl =
            typeof embeddedOffer?.finalUrl === "string"
              ? embeddedOffer.finalUrl.trim()
              : "";
          const href = offerSlug
            ? `/go/${encodeURIComponent(offerSlug)}`
            : finalUrl;
          if (!href) return "";

          const relParts = ["nofollow", "sponsored", "noopener", "noreferrer"];
          const rel = relParts.join(" ");
          const programName =
            typeof embeddedOffer?.programName === "string"
              ? embeddedOffer.programName.trim()
              : "";
          const ctaText =
            typeof embeddedOffer?.ctaText === "string" &&
            embeddedOffer.ctaText.trim()
              ? embeddedOffer.ctaText.trim()
              : "Ver oferta";
          const imageUrl =
            typeof embeddedOffer?.image === "string"
              ? embeddedOffer.image
              : undefined;

          const imageHtml = imageUrl
            ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(
                offerTitle,
              )}" loading="lazy" decoding="async" style="width:100%;height:auto;border-radius:0.75rem;" />`
            : "";

          return `<aside class="affiliate-offer-card" data-affiliate-offer="true" style="border:1px solid rgba(148,163,184,0.35);border-radius:1rem;padding:1rem;margin:1.25rem 0;background:rgba(148,163,184,0.08);">
            ${imageHtml}
            <h3 style="margin:0.75rem 0 0.35rem 0;font-size:1.05rem;line-height:1.35;">${escapeHtml(
              offerTitle,
            )}</h3>
            ${
              programName
                ? `<p style="margin:0 0 0.55rem 0;font-size:0.9rem;opacity:0.82;">Parceria: ${escapeHtml(
                    programName,
                  )}</p>`
                : ""
            }
            <p style="margin:0 0 0.6rem 0;font-size:0.8rem;opacity:0.75;">Este link pode gerar comissão para o site.</p>
            <a href="${escapeHtml(
              href,
            )}" rel="${rel}" target="_blank" style="display:inline-block;padding:0.55rem 0.9rem;border-radius:0.65rem;background:#0f766e;color:#fff;text-decoration:none;font-weight:600;">${escapeHtml(
              ctaText,
            )}</a>
          </aside>`;
        },
      },
    },
  });
};

const createSanityClient = (includeDrafts: boolean) => {
  const canReadDrafts = includeDrafts && Boolean(SANITY_API_TOKEN);

  return createClient({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
    apiVersion: SANITY_API_VERSION,
    token: SANITY_API_TOKEN || undefined,
    useCdn: !canReadDrafts,
    perspective: canReadDrafts ? "previewDrafts" : "published",
  });
};

export async function GetSanityPosts(
  options: { includeDrafts?: boolean } = {},
): Promise<SanityPost[]> {
  if (!IsSanityEnabled()) return [];

  const includeDrafts = options.includeDrafts === true;
  const canReadDrafts = includeDrafts && Boolean(SANITY_API_TOKEN);
  const client = createSanityClient(includeDrafts);

  try {
    const rawPosts = await client.fetch<RawSanityPost[]>(SANITY_POSTS_QUERY, {
      includeDrafts: canReadDrafts,
    });

    return rawPosts
      .filter((post) => post.slug && post.title && post.published)
      .map((post) => {
        const fallbackCategorySlug = post.category
          ? NormalizeSlug(post.category)
          : undefined;
        const tags = toStringArray(post.tags);
        const tagSlugsRaw = toStringArray(post.tagSlugs);
        const tagSlugs =
          tagSlugsRaw.length === tags.length
            ? tagSlugsRaw
            : tags.map(
                (tag, index) => tagSlugsRaw[index] || NormalizeSlug(tag),
              );

        return {
          id: post.slug as string,
          slug: post.slug as string,
          legacySlugs: toStringArray(post.legacySlugs),
          title: post.title as string,
          published: post.published as string,
          lastModified: post.lastModified,
          draft: post.draft === true,
          description: post.description,
          excerpt: post.excerpt,
          category: post.category,
          categorySlug: post.categorySlug || fallbackCategorySlug,
          categoryImage: post.categoryImage,
          categoryDescription: post.categoryDescription,
          tags,
          tagSlugs,
          cover: post.cover,
          image: post.image,
          attraction_image: post.attraction_image,
          meta_image: post.meta_image,
          keywords: toStringArray(post.keywords),
          author: post.author,
          sourceLink: post.sourceLink,
          licenseName: post.licenseName,
          licenseUrl: post.licenseUrl,
          contentHtml: post.legacyMdx?.trim()
            ? renderMdxContentToHtml(post.legacyMdx, {
                resolveImageSrc: resolveImportedImageSrc,
              })
            : renderPortableText(post.body),
        };
      });
  } catch (error) {
    console.error(
      "Erro ao buscar posts no Sanity. Voltando para conteúdo local.",
      error,
    );
    return [];
  }
}

export async function GetSanityOffers(
  options: { includeInactive?: boolean } = {},
): Promise<SanityOffer[]> {
  if (!IsSanityEnabled()) return [];

  const includeInactive = options.includeInactive === true;
  const client = createSanityClient(false);

  try {
    const rawOffers = await client.fetch<RawSanityOffer[]>(
      SANITY_OFFERS_QUERY,
      {
        includeInactive,
      },
    );

    return rawOffers
      .filter((offer) => offer.slug && offer.title && offer.finalUrl)
      .map((offer) => ({
        id: offer._id,
        title: offer.title as string,
        slug: offer.slug as string,
        legacySlugs: toStringArray(offer.legacySlugs),
        finalUrl: offer.finalUrl as string,
        ctaText: offer.ctaText?.trim() || "Ver oferta",
        description: offer.description,
        image: offer.image,
        destinationName: offer.destinationName,
        destinationSlug: offer.destinationSlug,
        priceFrom:
          typeof offer.priceFrom === "number" ? offer.priceFrom : undefined,
        currency: offer.currency || "BRL",
        tags: toStringArray(offer.tags),
        isFeatured: offer.isFeatured === true,
        priority: typeof offer.priority === "number" ? offer.priority : 100,
        nofollow: offer.nofollow !== false,
        sponsored: offer.sponsored !== false,
        isActive: offer.isActive !== false,
        programName: offer.programName,
        programSlug: offer.programSlug,
      }));
  } catch (error) {
    console.error("Erro ao buscar ofertas no Sanity.", error);
    return [];
  }
}

export async function GetSanityAdSlots(
  placement: SanityAdPlacement,
): Promise<SanityAdSlot[]> {
  if (!IsSanityEnabled()) return [];

  const client = createSanityClient(false);

  try {
    const rawSlots = await client.fetch<RawSanityAdSlot[]>(
      SANITY_AD_SLOTS_QUERY,
      {
        placement,
      },
    );

    return rawSlots
      .filter((slot) => slot.name && slot.slug && slot.placement === placement)
      .map((slot) => ({
        id: slot._id,
        name: slot.name as string,
        slug: slot.slug as string,
        placement,
        provider: slot.provider || "custom_html",
        htmlCode: slot.htmlCode,
        scriptUrl: slot.scriptUrl,
        scriptAsync: slot.scriptAsync !== false,
        device: slot.device || "all",
        priority: typeof slot.priority === "number" ? slot.priority : 100,
      }));
  } catch (error) {
    console.error("Erro ao buscar slots de anúncio no Sanity.", error);
    return [];
  }
}
