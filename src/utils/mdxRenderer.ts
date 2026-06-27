export interface RenderMdxOptions {
  resolveImageSrc?: (src: string) => string | undefined;
}

const iframeHosts = new Set([
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "youtube-nocookie.com",
  "player.vimeo.com",
]);

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stripHtml = (value: string): string => value.replace(/<[^>]*>/g, "");

const stripFrontmatter = (value: string): string =>
  value.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "");

const isSafeHref = (href: string): boolean =>
  /^(https?:|mailto:|tel:|\/|#)/i.test(href.trim());

const isSafeMediaSrc = (src: string, allowDataImage = false): boolean => {
  const value = src.trim();
  if (!value) return false;
  if (/^(https?:|\/)/i.test(value)) return true;
  if (
    allowDataImage &&
    /^data:image\/(png|gif|jpe?g|webp|avif|svg\+xml);base64,/i.test(value)
  ) {
    return true;
  }
  return !/^[a-z][a-z0-9+.-]*:/i.test(value);
};

const getSafeUrl = (url: string): string | undefined => {
  const value = url.trim();
  return isSafeHref(value) ? value : undefined;
};

const parseAttributes = (tag: string): Record<string, string> => {
  const attrs: Record<string, string> = {};
  const pattern =
    /([A-Za-z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\}|([^\s"'=<>`]+))/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(tag))) {
    const [, name, doubleQuoted, singleQuoted, braced, bare] = match;
    const value = doubleQuoted ?? singleQuoted ?? braced ?? bare ?? "";
    attrs[name] = value.replace(/^["'`]|["'`]$/g, "").trim();
  }

  return attrs;
};

const parseMarkdownDestination = (
  value: string,
): { url: string; title?: string } => {
  const trimmed = value.trim();
  const titled = trimmed.match(/^(.+?)\s+["']([^"']+)["']$/);

  if (titled) {
    return {
      url: titled[1].trim(),
      title: titled[2].trim(),
    };
  }

  return { url: trimmed };
};

const renderInlineMarkdown = (text: string): string => {
  const codeSpans: string[] = [];
  let escaped = escapeHtml(text).replace(/`([^`]+)`/g, (_match, code) => {
    const token = `@@CODE_${codeSpans.length}@@`;
    codeSpans.push(`<code>${code}</code>`);
    return token;
  });

  escaped = escaped
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, destination) => {
      const { url } = parseMarkdownDestination(destination);
      const safeUrl = getSafeUrl(url);
      if (!safeUrl) return label;

      const external = /^https?:\/\//i.test(safeUrl);
      const target = external ? ' target="_blank"' : "";
      const rel = external ? ' rel="noopener noreferrer"' : "";

      return `<a href="${escapeHtml(safeUrl)}"${target}${rel}>${label}</a>`;
    });

  codeSpans.forEach((html, index) => {
    escaped = escaped.replace(`@@CODE_${index}@@`, html);
  });

  return escaped;
};

const renderImage = (
  rawSrc: string,
  rawAlt: string,
  rawCaption: string | undefined,
  options: RenderMdxOptions,
): string => {
  const src = options.resolveImageSrc?.(rawSrc.trim()) ?? rawSrc.trim();
  if (!isSafeMediaSrc(src, true)) return "";

  const caption = rawCaption?.trim();
  const captionHtml = caption
    ? `<figcaption>${renderInlineMarkdown(stripHtml(caption))}</figcaption>`
    : "";

  return `<figure class="mdx-media mdx-image"><img src="${escapeHtml(src)}" alt="${escapeHtml(
    rawAlt.trim() || "Imagem do artigo",
  )}" loading="lazy" decoding="async" />${captionHtml}</figure>`;
};

const getYoutubeId = (url: URL): string | undefined => {
  if (url.hostname === "youtu.be")
    return url.pathname.split("/").filter(Boolean)[0];
  if (url.pathname.startsWith("/shorts/"))
    return url.pathname.split("/").filter(Boolean)[1];
  if (url.pathname.startsWith("/embed/"))
    return url.pathname.split("/").filter(Boolean)[1];
  return url.searchParams.get("v") ?? undefined;
};

const getVideoEmbed = (
  rawUrl: string,
): { type: "iframe" | "video"; src: string } | undefined => {
  const source = rawUrl.trim();
  if (!isSafeMediaSrc(source)) return undefined;

  try {
    const url = new URL(source, "https://example.com");
    const hostname = url.hostname.replace(/^www\./, "");

    if (
      hostname === "youtu.be" ||
      hostname === "youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      const videoId = getYoutubeId(url);
      if (!videoId) return undefined;
      return {
        type: "iframe",
        src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`,
      };
    }

    if (hostname === "vimeo.com" || hostname === "player.vimeo.com") {
      const videoId = url.pathname.split("/").filter(Boolean).pop();
      if (!videoId) return undefined;
      return {
        type: "iframe",
        src: `https://player.vimeo.com/video/${encodeURIComponent(videoId)}`,
      };
    }
  } catch {
    // Relative URLs for direct video files are handled below.
  }

  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(source)) {
    return { type: "video", src: source };
  }

  return undefined;
};

const renderVideo = (rawSrc: string, rawTitle = "Vídeo do artigo"): string => {
  const embed = getVideoEmbed(rawSrc);
  if (!embed) {
    const safeUrl = getSafeUrl(rawSrc);
    return safeUrl
      ? `<p><a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
          rawTitle,
        )}</a></p>`
      : "";
  }

  if (embed.type === "video") {
    return `<figure class="mdx-media mdx-video"><video controls preload="metadata" src="${escapeHtml(
      embed.src,
    )}"></video></figure>`;
  }

  return `<figure class="mdx-media mdx-video"><iframe src="${escapeHtml(
    embed.src,
  )}" title="${escapeHtml(rawTitle)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></figure>`;
};

const renderIframeTag = (tag: string): string => {
  const attrs = parseAttributes(tag);
  const src = attrs.src?.trim();
  if (!src) return "";

  try {
    const url = new URL(src);
    if (!iframeHosts.has(url.hostname)) return "";
  } catch {
    return "";
  }

  return renderVideo(src, attrs.title || "Vídeo do artigo");
};

const renderVideoTag = (tag: string): string => {
  const attrs = parseAttributes(tag);
  return attrs.src
    ? renderVideo(attrs.src, attrs.title || "Vídeo do artigo")
    : "";
};

const renderImageTag = (
  tag: string,
  caption: string | undefined,
  options: RenderMdxOptions,
): string => {
  const attrs = parseAttributes(tag);
  const src = attrs.src?.trim();
  if (!src) return "";
  return renderImage(src, attrs.alt || attrs.title || "", caption, options);
};

const renderFigureBlock = (
  block: string,
  options: RenderMdxOptions,
): string => {
  const captionMatch = block.match(
    /<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i,
  );
  const caption = captionMatch ? captionMatch[1] : undefined;
  const optimizedImage = block.match(/<OptimizedImage\b[\s\S]*?\/>/i);
  const image = block.match(/<img\b[^>]*>/i);
  const iframe = block.match(/<iframe\b[\s\S]*?<\/iframe>/i);
  const video = block.match(/<video\b[\s\S]*?<\/video>/i);

  if (optimizedImage)
    return renderImageTag(optimizedImage[0], caption, options);
  if (image) return renderImageTag(image[0], caption, options);
  if (iframe) return renderIframeTag(iframe[0]);
  if (video) return renderVideoTag(video[0]);

  return "";
};

const renderMediaLine = (
  line: string,
  options: RenderMdxOptions,
): string | undefined => {
  const markdownImage = line.match(/^!\[([^\]]*)\]\((.+)\)$/);
  if (markdownImage) {
    const { url, title } = parseMarkdownDestination(markdownImage[2]);
    return renderImage(url, markdownImage[1], title, options);
  }

  const videoShortcode = line.match(/^::video(?:\[([^\]]*)\])?\((.+)\)$/);
  if (videoShortcode) {
    const title = videoShortcode[1] || "Vídeo do artigo";
    const { url } = parseMarkdownDestination(videoShortcode[2]);
    return renderVideo(url, title);
  }

  if (/^<OptimizedImage\b/i.test(line) || /^<img\b/i.test(line))
    return renderImageTag(line, undefined, options);
  if (/^<iframe\b/i.test(line)) return renderIframeTag(line);
  if (/^<video\b/i.test(line)) return renderVideoTag(line);

  return undefined;
};

export function renderMdxContentToHtml(
  source: string,
  options: RenderMdxOptions = {},
): string {
  const lines = stripFrontmatter(source).replace(/\r\n?/g, "\n").split("\n");
  const html: string[] = [];
  let paragraph: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | undefined;
  let codeFence: string[] | undefined;

  const flushParagraph = () => {
    const text = paragraph.join(" ").replace(/\s+/g, " ").trim();
    paragraph = [];
    if (text) html.push(`<p>${renderInlineMarkdown(text)}</p>`);
  };

  const flushList = () => {
    if (!list) return;
    const items = list.items
      .map((item) => `<li>${renderInlineMarkdown(item)}</li>`)
      .join("");
    html.push(`<${list.type}>${items}</${list.type}>`);
    list = undefined;
  };

  const flushTextBlocks = () => {
    flushParagraph();
    flushList();
  };

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const trimmed = rawLine.trim();

    if (trimmed.startsWith("```")) {
      if (codeFence) {
        html.push(
          `<pre><code>${escapeHtml(codeFence.join("\n"))}</code></pre>`,
        );
        codeFence = undefined;
      } else {
        flushTextBlocks();
        codeFence = [];
      }
      continue;
    }

    if (codeFence) {
      codeFence.push(rawLine);
      continue;
    }

    if (
      /^\s*import\s.+from\s.+;?\s*$/.test(rawLine) ||
      /^\s*export\s.+/.test(rawLine)
    ) {
      continue;
    }

    if (!trimmed) {
      flushTextBlocks();
      continue;
    }

    if (/^<figure\b/i.test(trimmed)) {
      flushTextBlocks();
      const block = [rawLine];
      while (index + 1 < lines.length && !/<\/figure>/i.test(lines[index])) {
        index += 1;
        block.push(lines[index]);
      }
      const rendered = renderFigureBlock(block.join("\n"), options);
      if (rendered) html.push(rendered);
      continue;
    }

    const mediaHtml = renderMediaLine(trimmed, options);
    if (mediaHtml !== undefined) {
      flushTextBlocks();
      if (mediaHtml) html.push(mediaHtml);
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      flushTextBlocks();
      html.push("<hr />");
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushTextBlocks();
      const level = Math.min(heading[1].length, 6);
      html.push(
        `<h${level}>${renderInlineMarkdown(heading[2].trim())}</h${level}>`,
      );
      continue;
    }

    const bullet = trimmed.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      if (list?.type !== "ul") flushList();
      if (!list) list = { type: "ul", items: [] };
      list.items.push(bullet[1].trim());
      continue;
    }

    const ordered = trimmed.match(/^\d+\.\s+(.*)$/);
    if (ordered) {
      flushParagraph();
      if (list?.type !== "ol") flushList();
      if (!list) list = { type: "ol", items: [] };
      list.items.push(ordered[1].trim());
      continue;
    }

    const quote = trimmed.match(/^>\s?(.*)$/);
    if (quote) {
      flushTextBlocks();
      html.push(
        `<blockquote><p>${renderInlineMarkdown(quote[1].trim())}</p></blockquote>`,
      );
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  if (codeFence)
    html.push(`<pre><code>${escapeHtml(codeFence.join("\n"))}</code></pre>`);
  flushTextBlocks();

  return html.join("\n");
}
