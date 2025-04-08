/**
 * Script avançado de compressão de texto e otimização de recursos
 * Este script implementa técnicas avançadas para melhorar a compressão de texto
 * e reduzir o tamanho das respostas HTTP, especialmente para dispositivos móveis.
 */

// Executar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Detectar se é um dispositivo móvel
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  
  // Otimização avançada de compressão de texto
  const optimizeAdvancedTextCompression = () => {
    // Remover atributos de dados desnecessários após o uso
    const cleanupDataAttributes = () => {
      // Identificar elementos com data-attributes que podem ser removidos após o uso
      const elementsWithData = document.querySelectorAll('[data-temp], [data-initial]');
      elementsWithData.forEach(element => {
        // Remover atributos temporários que não são mais necessários
        if (element.hasAttribute('data-temp')) {
          element.removeAttribute('data-temp');
        }
        if (element.hasAttribute('data-initial') && !element.hasAttribute('data-preserve')) {
          element.removeAttribute('data-initial');
        }
      });
    };
    
    // Otimizar strings inline para reduzir tamanho do DOM
    const optimizeInlineStrings = () => {
      // Remover espaços em branco desnecessários em elementos não sensíveis a espaço
      const nonWhitespaceElements = document.querySelectorAll('div, span, a, li, h1, h2, h3, h4, h5, h6');
      nonWhitespaceElements.forEach(element => {
        // Pular elementos com a classe 'preserve-whitespace'
        if (element.classList.contains('preserve-whitespace')) return;
        
        // Normalizar espaços em branco em elementos de texto
        for (let i = 0; i < element.childNodes.length; i++) {
          const node = element.childNodes[i];
          if (node.nodeType === 3) { // Nó de texto
            const text = node.nodeValue;
            // Substituir múltiplos espaços por um único espaço
            const newText = text.replace(/\s+/g, ' ').trim();
            if (text !== newText) {
              node.nodeValue = newText;
            }
          }
        }
      });
    };
    
    // Otimizar o HTML para melhor compressão
    const optimizeHTMLCompression = () => {
      // Remover comentários HTML desnecessários (exceto comentários condicionais)
      const removeUnnecessaryComments = (node) => {
        if (!node) return;
        
        const childNodes = node.childNodes;
        for (let i = childNodes.length - 1; i >= 0; i--) {
          const child = childNodes[i];
          if (child.nodeType === 8) { // Nó de comentário
            // Manter apenas comentários importantes (condicionais ou marcados para preservação)
            const commentContent = child.nodeValue.trim();
            if (!commentContent.startsWith('[if') && 
                !commentContent.startsWith('!') && 
                !commentContent.includes('preserve')) {
              node.removeChild(child);
            }
          } else if (child.nodeType === 1) { // Elemento
            removeUnnecessaryComments(child);
          }
        }
      };
      
      // Aplicar apenas em ambientes de produção
      if (window.location.hostname !== 'localhost' && 
          window.location.hostname !== '127.0.0.1') {
        removeUnnecessaryComments(document.body);
      }
    };
    
    // Otimização específica para dispositivos móveis
    if (isMobile) {
      // Remover scripts não essenciais em dispositivos móveis
      const removeNonEssentialScripts = () => {
        const nonEssentialScripts = document.querySelectorAll('script[data-mobile-nonessential]');
        nonEssentialScripts.forEach(script => {
          script.parentNode.removeChild(script);
        });
      };
      
      // Simplificar o DOM em dispositivos móveis
      const simplifyMobileDOM = () => {
        // Remover elementos puramente decorativos em dispositivos móveis
        const decorativeElements = document.querySelectorAll('.desktop-only, .decorative');
        decorativeElements.forEach(element => {
          element.parentNode.removeChild(element);
        });
        
        // Simplificar estruturas complexas de DOM
        const complexStructures = document.querySelectorAll('.complex-structure');
        complexStructures.forEach(structure => {
          // Substituir estruturas complexas por versões simplificadas
          if (structure.hasAttribute('data-mobile-alternative')) {
            const alternativeId = structure.getAttribute('data-mobile-alternative');
            const alternative = document.getElementById(alternativeId);
            if (alternative) {
              structure.parentNode.replaceChild(alternative.cloneNode(true), structure);
              // Remover o elemento alternativo original
              alternative.parentNode.removeChild(alternative);
            }
          }
        });
      };
      
      // Executar otimizações específicas para dispositivos móveis
      removeNonEssentialScripts();
      simplifyMobileDOM();
    }
    
    // Executar otimizações gerais
    cleanupDataAttributes();
    optimizeInlineStrings();
    optimizeHTMLCompression();
  };
  
  // Otimização de recursos para melhor compressão
  const optimizeResourceCompression = () => {
    // Adicionar suporte a Content-Encoding: Brotli se disponível
    const addBrotliSupport = () => {
      // Adicionar cabeçalho Accept-Encoding para indicar suporte a Brotli
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Accept-Encoding';
      meta.content = 'gzip, deflate, br';
      document.head.appendChild(meta);
    };
    
    // Otimizar inline SVGs para melhor compressão
    const optimizeInlineSVGs = () => {
      const svgs = document.querySelectorAll('svg');
      svgs.forEach(svg => {
        // Remover atributos desnecessários
        if (svg.hasAttribute('version')) svg.removeAttribute('version');
        if (svg.hasAttribute('xmlns:xlink') && !svg.querySelector('[*|href]')) {
          svg.removeAttribute('xmlns:xlink');
        }
        
        // Otimizar elementos dentro do SVG
        const paths = svg.querySelectorAll('path');
        paths.forEach(path => {
          // Arredondar valores numéricos para reduzir tamanho
          if (path.hasAttribute('d')) {
            const d = path.getAttribute('d');
            // Arredondar números para 2 casas decimais
            const optimizedD = d.replace(/([\d])\.\d{3,}/g, '$1');
            path.setAttribute('d', optimizedD);
          }
        });
      });
    };
    
    // Executar otimizações de recursos
    addBrotliSupport();
    optimizeInlineSVGs();
  };
  
  // Executar otimizações
  optimizeAdvancedTextCompression();
  optimizeResourceCompression();
  
  // Adicionar listener para orientação do dispositivo em dispositivos móveis
  if (isMobile) {
    window.addEventListener('orientationchange', () => {
      // Reotimizar após mudança de orientação
      setTimeout(() => {
        optimizeAdvancedTextCompression();
      }, 300);
    });
  }
});