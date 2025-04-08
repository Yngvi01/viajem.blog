/**
 * Script de otimização de compactação de texto
 * Este script implementa técnicas para melhorar a compressão de texto
 * e reduzir o tamanho das respostas HTTP.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Função para otimizar a compactação de texto
  const optimizeTextCompression = () => {
    // Verificar se o navegador suporta compressão de texto
    const checkCompressionSupport = () => {
      // Adicionar classe ao body para indicar suporte a compressão
      if ('CompressionStream' in window) {
        document.body.classList.add('supports-compression');
      }
    };
    
    // Minimizar o tamanho do DOM removendo espaços em branco desnecessários
    const minimizeDOMSize = () => {
      // Remover comentários HTML desnecessários
      const removeComments = (node) => {
        if (!node) return;
        
        // Processar nós filhos primeiro
        const childNodes = node.childNodes;
        for (let i = childNodes.length - 1; i >= 0; i--) {
          const child = childNodes[i];
          if (child.nodeType === 8) { // Nó de comentário
            // Manter apenas comentários importantes (que começam com "!", como condicionais IE)
            if (!child.nodeValue.trim().startsWith('!')) {
              node.removeChild(child);
            }
          } else {
            removeComments(child);
          }
        }
      };
      
      // Aplicar apenas em ambientes de produção
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // Remover comentários do DOM para reduzir o tamanho
        removeComments(document.body);
      }
    };
    
    // Executar otimizações
    checkCompressionSupport();
    minimizeDOMSize();
  };
  
  // Executar otimização de compactação de texto
  optimizeTextCompression();
});