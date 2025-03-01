import { defineConfig } from "astro/config";

import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";
import swup from "@swup/astro";

import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkMath from "remark-math";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";

import YukinaConfig from "./yukina.config";
import pagefind from "astro-pagefind";

export default defineConfig({
  site: YukinaConfig.site,
  base: '/',
  trailingSlash: 'ignore',
  build: {
    format: 'file',
    assetsPrefix: '/',
    inlineStylesheets: 'never'
  },
  integrations: [
    tailwind(),
    svelte({
      compilerOptions: {
        hydratable: true,
        customElement: false
      }
    }),
    icon(),
    swup({
      theme: false,
      containers: ["main", "footer", ".banner-inner"],
      smoothScrolling: true,
      progress: true,
      cache: true,
      preload: true,
      updateHead: true,
      updateBodyClass: false,
      globalInstance: true,
    }),
    sitemap(),
    pagefind(),
  ],
  markdown: {
    shikiConfig: {
      theme: "github-dark-default",
      wrap: true
    },
    remarkPlugins: [remarkReadingTime, remarkMath],
    rehypePlugins: [
      rehypeSlug,
      rehypeKatex,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "prepend",
          properties: {
            class: "heading-anchor",
            ariaHidden: true
          }
        }
      ],
    ],
  },
  vite: {
    build: {
      sourcemap: process.env.NODE_ENV !== 'production',
      minify: true
    },
    resolve: {
      preserveSymlinks: true
    }
  }
});