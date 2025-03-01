import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapURL: URL) => `
# Astro generated robots.txt
User-agent: *
Allow: /_astro/
Allow: /assets/
Allow: /fonts/
Allow: /images/
Allow: /_slds/
Disallow: /api/
Disallow: /admin/
Disallow: /private/
Disallow: /node_modules/

User-agent: AdsBot-Google
Allow: /

User-agent: Googlebot-Image
Allow: /

Sitemap: ${sitemapURL.href}
`;

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL("sitemap-index.xml", site);
  return new Response(getRobotsTxt(sitemapURL), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600" // 1 hora de cache
    }
  });
};