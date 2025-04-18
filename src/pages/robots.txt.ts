import type { APIRoute } from "astro";

const getRobotsTxt = (sitemapURL: URL) => `
# Guia de Viagem - Regras para Robots

User-agent: *
Allow: /  
Allow: /_astro/
Allow: /assets/
Allow: /fonts/
Allow: /images/
Allow: /_slds/
Disallow: /api/
Disallow: /admin/
Disallow: /private/
Disallow: /node_modules/
Disallow: /404
Disallow: /error

# Google Bots
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Googlebot-Image
Allow: /
Crawl-delay: 1

User-agent: Googlebot-Mobile
Allow: /
Crawl-delay: 1

User-agent: Googlebot-News
Allow: /

User-agent: AdsBot-Google
Allow: /

# Bing Bots
User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Yandex Bots
User-agent: Yandex
Allow: /
Crawl-delay: 1

# DuckDuckGo Bot
User-agent: DuckDuckBot
Allow: /

# Sitemap
Sitemap: ${sitemapURL.href}

# Host
Host: ${new URL(sitemapURL).hostname}
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