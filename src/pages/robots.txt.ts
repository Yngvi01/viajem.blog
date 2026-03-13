import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapURL: URL) => `
# Guia de Viagem - Robots

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/
Disallow: /node_modules/

# Sitemaps
Sitemap: ${sitemapURL.href}
Sitemap: ${new URL("rss.xml", sitemapURL).href}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site);
  return new Response(getRobotsTxt(sitemapURL), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
};
