import { visit } from 'unist-util-visit';
import path from 'path';

/**
 * Rehype plugin that transforms standard img tags in markdown 
 * into Astro's Image component for optimized image handling
 */
export function rehypeAstroImage() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      // Process only img elements
      if (node.tagName === 'img' && node.properties && node.properties.src) {
        const src = node.properties.src;
        const alt = node.properties.alt || '';
        const width = node.properties.width || 1080;
        const height = node.properties.height || 720;
        
        // Skip processing for external URLs or data URLs
        if (src.startsWith('http') || src.startsWith('data:')) return;
        
        // Clean source path for internal images
        let processedSrc = src;
        if (src.startsWith('/src/images/')) {
          const filename = path.basename(src);
          processedSrc = `src/images/${filename}`;
        }
        
        // Transform the img tag into an Astro component
        node.type = 'raw';
        node.value = `<MarkdownImage src="${processedSrc}" alt="${alt}" width={${width}} height={${height}} />`;
        delete node.tagName;
        delete node.children;
        delete node.properties;
      }
    });
  };
} 