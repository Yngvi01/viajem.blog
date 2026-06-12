<script lang="ts">
  import { onMount } from 'svelte';

  export let value: string = '';
  export let placeholder: string = 'Escreva seu conteúdo em Markdown...';
  export let rows: number = 16;

  let mode: 'editor' | 'preview' = 'editor';
  let previewHtml: string = '';

  function renderMarkdown(mdContent: string): string {
    let html = mdContent
      .split('\n')
      .map((line) => {
        const trimmed = line.trim();

        // Headings
        if (trimmed.startsWith('### ')) {
          return `<h3>${escapeHtml(trimmed.slice(4))}</h3>`;
        }
        if (trimmed.startsWith('## ')) {
          return `<h2>${escapeHtml(trimmed.slice(3))}</h2>`;
        }
        if (trimmed.startsWith('# ')) {
          return `<h1>${escapeHtml(trimmed.slice(2))}</h1>`;
        }

        // Bold and Italic
        let processed = trimmed
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/__(.+?)__/g, '<strong>$1</strong>')
          .replace(/_(.+?)_/g, '<em>$1</em>');

        // Code inline
        processed = processed.replace(/`(.+?)`/g, '<code>$1</code>');

        // Links
        processed = processed.replace(
          /\[(.+?)\]\((.+?)\)/g,
          '<a href="$2" target="_blank" rel="noopener">$1</a>'
        );

        // Line breaks
        if (trimmed === '') {
          return '</p><p>';
        }

        return processed;
      })
      .join('<br />');

    // Wrap in paragraphs
    html = `<p>${html}</p>`;
    html = html.replace(/<\/p><br \/><p>/g, '</p><p>');

    return html;
  }

  function escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  function toggleMode() {
    if (mode === 'editor') {
      previewHtml = renderMarkdown(value);
      mode = 'preview';
    } else {
      mode = 'editor';
    }
  }

  onMount(() => {
    // Atualizar preview quando o valor mudar (oninput via bind)
    const updatePreview = () => {
      if (mode === 'preview') {
        previewHtml = renderMarkdown(value);
      }
    };
    return () => {};
  });

  $: if (mode === 'preview') {
    previewHtml = renderMarkdown(value);
  }
</script>

<div class="mdx-editor-container">
  <div class="editor-header">
    <button
      type="button"
      class="mode-toggle"
      class:active={mode === 'editor'}
      on:click={() => (mode = 'editor')}
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

  {#if mode === 'editor'}
    <textarea
      bind:value
      {placeholder}
      {rows}
      class="editor-textarea"
    />
    <div class="editor-hint">
      <strong>Dicas:</strong> Use <code>#</code> para títulos, <code>**texto**</code> para negrito, <code>*texto*</code>
      para itálico, <code>[link](url)</code> para links
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
    gap: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.01);
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
