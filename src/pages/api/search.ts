import type { APIRoute } from "astro";
import { createClient } from "@sanity/client";

const SANITY_PROJECT_ID = import.meta.env.SANITY_PROJECT_ID;
const SANITY_DATASET = import.meta.env.SANITY_DATASET;
const SANITY_API_VERSION = import.meta.env.SANITY_API_VERSION || "2025-02-06";

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get("q")?.trim() ?? "";

  if (!query || query.length < 2) {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!SANITY_PROJECT_ID || !SANITY_DATASET) {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const client = createClient({
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      apiVersion: SANITY_API_VERSION,
      useCdn: true,
      perspective: "published",
    });

    // GROQ query: busca por título, description, excerpt e tags
    const groq = `
      *[
        _type == "post" &&
        !coalesce(draft, false) &&
        defined(slug.current) &&
        defined(published) &&
        (
          title match $q + "*" ||
          description match $q + "*" ||
          excerpt match $q + "*" ||
          $q in tags[]->title
        )
      ] | order(published desc) [0...10] {
        title,
        "slug": slug.current,
        description,
        excerpt,
        "cover": coalesce(cover.asset->url, image.asset->url),
        published
      }
    `;

    const results = await client.fetch(groq, { q: query });

    const formatted = (results as any[]).map((item) => ({
      title: item.title ?? "",
      url: `/posts/${item.slug}`,
      excerpt: item.excerpt || item.description || "",
      cover: item.cover ?? null,
    }));

    return new Response(JSON.stringify(formatted), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (err) {
    console.error("Erro na busca Sanity:", err);
    return new Response(JSON.stringify([]), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
