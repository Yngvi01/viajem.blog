import { defineConfig } from "astro/config";

import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";
import react from "@astrojs/react";
import swup from "@swup/astro";
import compress from "astro-compress";
import mdx from "@astrojs/mdx";

import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkMath from "remark-math";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";
import { rehypeAstroImage } from "./src/plugins/rehype-astro-image.mjs";

import YukinaConfig from "./yukina.config";
import pagefind from "astro-pagefind";

// https://astro.build/config
export default defineConfig({
  site: YukinaConfig.site,
  compressHTML: true,
  build: {
    inlineStylesheets: "auto",
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark-default",
    },
    remarkPlugins: [remarkReadingTime, remarkMath],
    rehypePlugins: [
      rehypeSlug,
      rehypeKatex,
      rehypeAstroImage,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "prepend",
        },
      ],
    ],
  },
  image: {
    domains: ["cdn.pixabay.com"],
    remotePatterns: [{ protocol: "https" }],
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
  integrations: [
    tailwind(),
    svelte(),
    react(),
    icon(),
    mdx({
      remarkPlugins: [remarkReadingTime, remarkMath],
      rehypePlugins: [
        rehypeSlug,
        rehypeKatex,
        rehypeAstroImage,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "prepend",
          },
        ],
      ],
    }),
    swup({
      theme: false,
      containers: ["#banner", "main", "footer"],
      animateHistoryBrowsing: true,
      cache: true,
      preload: true,
      globalInstance: true,
      animationSelector: '[class*="transition-"]',
      plugins: [],
      linkSelector: 'a[href^="/"]:not([data-no-swup]), a[href^="' + YukinaConfig.site + '"]:not([data-no-swup])',
    }),
    sitemap(),
    pagefind(),
    compress({
      css: true,
      html: true,
      img: true,
      js: true,
      svg: true,
    })
  ],
});
