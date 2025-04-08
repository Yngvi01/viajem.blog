/**
 * Script de otimização de imagens
 * Este script implementa várias técnicas para melhorar o carregamento de imagens
 * sem afetar a qualidade visual ou SEO.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Função para otimizar imagens
  const optimizeImages = () => {
    // Converter imagens para WebP quando possível
    const supportsWebP = () => {
      const elem = document.createElement('canvas');
      if (elem.getContext && elem.getContext('2d')) {
        return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      }
      return false;
    };
    
    // Se o navegador suporta WebP, adicionar classe ao body
    if (supportsWebP()) {
      document.body.classList.add('webp-support');
    }
    
    // Definir tamanhos adequados para imagens
    const setImageDimensions = () => {
      const images = document.querySelectorAll('img:not([width]):not([height])');
      images.forEach(img => {
        // Definir dimensões com base no tamanho natural da imagem
        if (img.naturalWidth && img.naturalHeight) {
          img.width = img.naturalWidth;
          img.height = img.naturalHeight;
        }
      });
    };
    
    // Adicionar atributo loading="lazy" para imagens que não estão na viewport
    const addLazyLoading = () => {
      if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
          // Verificar se a imagem está fora da viewport
          const rect = img.getBoundingClientRect();
          if (rect.top > window.innerHeight) {
            img.loading = 'lazy';
          }
        });
      }
    };
    
    // Executar otimizações
    setImageDimensions();
    addLazyLoading();
  };
  
  // Executar otimizações de imagem
  optimizeImages();
  
  // Reotimizar imagens quando o conteúdo mudar (útil para SPAs)
  const observer = new MutationObserver((mutations) => {
    let hasNewImages = false;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeName === 'IMG' || 
              (node.nodeType === 1 && node.querySelector('img'))) {
            hasNewImages = true;
          }
        });
      }
    });
    
    if (hasNewImages) {
      optimizeImages();
    }
  });
  
  // Observar mudanças no DOM
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});