/**
 * Plugin rehype para processar imagens em arquivos Astro/MDX
 * 
 * Este plugin permite o processamento de imagens em arquivos Markdown/MDX
 * para otimização e responsividade.
 */

export function rehypeAstroImage() {
  return function (tree) {
    // Aqui seria implementada a lógica para processar imagens
    // Por enquanto, este é um plugin mínimo que não altera o conteúdo
    return tree;
  };
}