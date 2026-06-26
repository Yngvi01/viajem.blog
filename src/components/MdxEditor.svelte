<script lang="ts">
  import { tick, onMount } from 'svelte';
  import { renderMdxContentToHtml } from '../utils/mdxRenderer';

  export let value: string = '';
  export let name: string = 'body';
  export let placeholder: string = 'Escreva seu conteúdo em Markdown...';
  export let rows: number = 16;

  onMount(() => {
    const handleUpdate = (e: CustomEvent<string>) => {
      if (typeof e.detail === 'string') {
        value = e.detail;
      }
    };
    window.addEventListener('mdx-editor-update-value', handleUpdate as EventListener);
    return () => {
      window.removeEventListener('mdx-editor-update-value', handleUpdate as EventListener);
    };
  });

  let mode: 'editor' | 'preview' = 'editor';
  let previewHtml: string = '';
  let textarea: HTMLTextAreaElement;

  $: if (mode === 'preview') {
    previewHtml = renderMdxContentToHtml(value);
  }

  async function showEditor() {
    mode = 'editor';
    await tick();
    textarea?.focus();
  }

  function selectedText(fallback: string): string {
    if (!textarea) return fallback;
    return value.slice(textarea.selectionStart, textarea.selectionEnd) || fallback;
  }

  async function insertSnippet(snippet: string) {
    if (mode !== 'editor') await showEditor();

    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const prefix = before && !before.endsWith('\n') ? '\n\n' : '';
    const suffix = after && !after.startsWith('\n') ? '\n\n' : '';

    value = `${before}${prefix}${snippet}${suffix}${after}`;

    await tick();
    const position = start + prefix.length + snippet.length;
    textarea?.setSelectionRange(position, position);
    textarea?.focus();
  }

  async function wrapSelection(before: string, after = before, fallback = 'texto') {
    if (mode !== 'editor') await showEditor();

    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const text = selectedText(fallback);

    value = `${value.slice(0, start)}${before}${text}${after}${value.slice(end)}`;

    await tick();
    textarea?.setSelectionRange(start + before.length, start + before.length + text.length);
    textarea?.focus();
  }

  async function insertLink() {
    const url = window.prompt('URL do link');
    if (!url) return;
    await wrapSelection('[', `](${url.trim()})`, 'link');
  }

  async function insertImage() {
    const url = window.prompt('URL ou caminho da imagem');
    if (!url) return;

    const alt = window.prompt('Texto alternativo da imagem') || 'Imagem do artigo';
    const caption = window.prompt('Legenda da imagem (opcional)')?.trim();
    const title = caption ? ` "${caption}"` : '';

    await insertSnippet(`![${alt.trim()}](${url.trim()}${title})`);
  }

  async function insertVideo() {
    const url = window.prompt('URL do YouTube, Vimeo ou arquivo .mp4/.webm');
    if (!url) return;

    const title = window.prompt('Título do vídeo') || 'Vídeo do artigo';
    await insertSnippet(`::video[${title.trim()}](${url.trim()})`);
  }
</script>

<div class="mdx-editor-container">
  <input type="hidden" {name} value={value} />

  <div class="editor-header">
    <div class="mode-group">
      <button
        type="button"
        class="mode-toggle"
        class:active={mode === 'editor'}
        on:click={showEditor}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Editor
      </button>
      <button
        type="button"
        class="mode-toggle"
        class:active={mode === 'preview'}
        on:click={() => (mode = 'preview')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        Preview
      </button>
    </div>

    <div class="toolbar" aria-label="Ferramentas do conteúdo">
      <button type="button" class="tool-button" title="Título" aria-label="Inserir título" on:click={() => insertSnippet('## Novo título')}>
        H2
      </button>
      <button type="button" class="tool-button" title="Negrito" aria-label="Aplicar negrito" on:click={() => wrapSelection('**', '**', 'texto em negrito')}>
        <strong>B</strong>
      </button>
      <button type="button" class="tool-button" title="Link" aria-label="Inserir link" on:click={insertLink}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>
      <button type="button" class="tool-button" title="Imagem" aria-label="Inserir imagem" on:click={insertImage}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </button>
      <button type="button" class="tool-button" title="Vídeo" aria-label="Inserir vídeo" on:click={insertVideo}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="5" width="15" height="14" rx="2" ry="2" />
          <path d="m18 10 4-2v8l-4-2" />
        </svg>
      </button>
    </div>
  </div>

  {#if mode === 'editor'}
    <textarea
      bind:value
      bind:this={textarea}
      {placeholder}
      {rows}
      class="editor-textarea"
    ></textarea>
    <div class="editor-hint">
      <strong>Dicas:</strong> Use <code>#</code> para títulos, <code>**texto**</code> para negrito, <code>*texto*</code>
      para itálico, <code>[link](url)</code> para links, <code>![alt](url)</code> para imagens e <code>::video[Título](url)</code> para vídeos
    </div>
  {:else}
    <div class="preview-panel">
      {#if value.trim()}
        <div class="preview-content" role="region" aria-live="polite">
          {@html previewHtml}
        </div>
      {:else}
        <div class="preview-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M15 13H9m4-4H9m6 4h-2a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2z" />
            <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
          </svg>
          <p>Nenhum conteúdo para visualizar</p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .mdx-editor-container {
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.02);
  }

  .editor-header {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.01);
  }

  .mode-group,
  .toolbar {
    display: flex;
    align-items: center;
  }

  .toolbar {
    gap: 4px;
    padding: 6px;
  }

  .mode-toggle {
    flex: 0 0 auto;
    padding: 10px 16px;
    background: transparent;
    border: none;
    border-right: 1px solid rgba(255, 255, 255, 0.06);
    color: #64748b;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s;
  }

  .mode-toggle:last-child {
    border-right: none;
  }

  .mode-toggle:hover {
    background: rgba(99, 102, 241, 0.08);
    color: #94a3b8;
  }

  .mode-toggle.active {
    background: rgba(99, 102, 241, 0.15);
    color: #818cf8;
    border-bottom: 2px solid #818cf8;
  }

  .tool-button {
    width: 32px;
    height: 32px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 7px;
    background: rgba(255, 255, 255, 0.04);
    color: #94a3b8;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }

  .tool-button:hover {
    background: rgba(99, 102, 241, 0.12);
    border-color: rgba(99, 102, 241, 0.3);
    color: #c4b5fd;
  }

  .editor-textarea {
    width: 100%;
    padding: 16px;
    background: rgba(255, 255, 255, 0.04);
    border: none;
    color: #e2e8f0;
    font-size: 13px;
    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
    line-height: 1.6;
    resize: vertical;
    outline: none;
  }

  .editor-textarea:focus {
    background: rgba(255, 255, 255, 0.06);
  }

  .editor-hint {
    padding: 10px 16px;
    background: rgba(99, 102, 241, 0.08);
    border-top: 1px solid rgba(99, 102, 241, 0.15);
    font-size: 11px;
    color: #64748b;
    line-height: 1.5;
  }

  .editor-hint code {
    background: rgba(0, 0, 0, 0.2);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    color: #94a3b8;
  }

  .preview-panel {
    min-height: 300px;
    padding: 20px;
    overflow-y: auto;
  }

  .preview-content {
    color: #e2e8f0;
    line-height: 1.7;
    word-wrap: break-word;
  }

  .preview-content :global(h1),
  .preview-content :global(h2),
  .preview-content :global(h3) {
    margin: 24px 0 12px 0;
    color: #f1f5f9;
    font-weight: 700;
    line-height: 1.3;
  }

  .preview-content :global(h1) {
    font-size: 28px;
  }

  .preview-content :global(h2) {
    font-size: 22px;
  }

  .preview-content :global(h3) {
    font-size: 18px;
  }

  .preview-content :global(p),
  .preview-content :global(ul),
  .preview-content :global(ol),
  .preview-content :global(blockquote),
  .preview-content :global(figure) {
    margin: 14px 0;
  }

  .preview-content :global(ul),
  .preview-content :global(ol) {
    padding-left: 22px;
  }

  .preview-content :global(a) {
    color: #a5b4fc;
  }

  .preview-content :global(code) {
    padding: 2px 5px;
    border-radius: 5px;
    background: rgba(0, 0, 0, 0.24);
    color: #c4b5fd;
  }

  .preview-content :global(pre) {
    padding: 14px;
    border-radius: 8px;
    overflow: auto;
    background: rgba(0, 0, 0, 0.28);
  }

  .preview-content :global(blockquote) {
    padding: 10px 14px;
    border-left: 3px solid #818cf8;
    border-radius: 6px;
    background: rgba(99, 102, 241, 0.09);
  }

  .preview-content :global(.mdx-media) {
    overflow: hidden;
    border-radius: 8px;
  }

  .preview-content :global(.mdx-image img),
  .preview-content :global(.mdx-video video),
  .preview-content :global(.mdx-video iframe) {
    display: block;
    width: 100%;
    border: 0;
    border-radius: 8px;
  }

  .preview-content :global(.mdx-video iframe) {
    aspect-ratio: 16 / 9;
    min-height: 240px;
  }

  .preview-content :global(figcaption) {
    margin-top: 7px;
    color: #94a3b8;
    font-size: 12px;
    line-height: 1.5;
  }

  @media (max-width: 720px) {
    .editor-header {
      flex-direction: column;
      gap: 0;
    }

    .toolbar {
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
  }

  .preview-content :global(h2) {
    font-size: 22px;
  }

  .preview-content :global(h3) {
    font-size: 18px;
  }

  .preview-content :global(p) {
    margin: 12px 0;
  }

  .preview-content :global(code) {
    background: rgba(15, 23, 42, 0.6);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 12px;
    color: #7dd3fc;
  }

  .preview-content :global(strong) {
    font-weight: 700;
    color: #f1f5f9;
  }

  .preview-content :global(em) {
    font-style: italic;
  }

  .preview-content :global(a) {
    color: #818cf8;
    text-decoration: underline;
    cursor: pointer;
  }

  .preview-content :global(a:hover) {
    color: #a5b4fc;
  }

  .preview-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: #475569;
    gap: 12px;
  }

  .preview-empty p {
    font-size: 13px;
    margin: 0;
  }
</style>
