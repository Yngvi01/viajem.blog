/**
 * Script de otimização de performance
 * Este script implementa várias técnicas para melhorar o desempenho do site
 * sem afetar a funcionalidade ou SEO.
 */

// Função para adiar o carregamento de recursos não críticos
function deferNonCriticalResources() {
  // Adiar carregamento de imagens fora da viewport
  const deferImages = () => {
    const imgDefer = document.querySelectorAll('img[data-src]');
    if (!imgDefer.length) return;
    
    const loadImage = (img) => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        delete img.dataset.src;
      }
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
        delete img.dataset.srcset;
      }
    };

    if ('IntersectionObserver' in window) {
      const imgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadImage(entry.target);
            imgObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '200px 0px' });

      imgDefer.forEach(img => imgObserver.observe(img));
    } else {
      // Fallback para navegadores sem suporte a IntersectionObserver
      imgDefer.forEach(img => loadImage(img));
    }
  };

  // Adiar carregamento de scripts não críticos
  const deferScripts = () => {
    const scriptDefer = document.querySelectorAll('script[data-src]');
    scriptDefer.forEach(script => {
      const newScript = document.createElement('script');
      Array.from(script.attributes).forEach(attr => {
        if (attr.name !== 'data-src') {
          newScript.setAttribute(attr.name, attr.value);
        }
      });
      newScript.src = script.dataset.src;
      script.parentNode.replaceChild(newScript, script);
    });
  };

  // Executar otimizações quando o conteúdo principal estiver carregado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      deferImages();
      // Adiar scripts para depois que as imagens críticas carregarem
      setTimeout(deferScripts, 100);
    });
  } else {
    deferImages();
    setTimeout(deferScripts, 100);
  }
}

// Função para otimizar recursos de terceiros
function optimizeThirdPartyResources() {
  // Adiar carregamento de iframes
  const iframes = document.querySelectorAll('iframe[data-src]');
  if (iframes.length > 0) {
    const iframeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const iframe = entry.target;
          iframe.src = iframe.dataset.src;
          delete iframe.dataset.src;
          iframeObserver.unobserve(iframe);
        }
      });
    }, { rootMargin: '200px 0px' });

    iframes.forEach(iframe => iframeObserver.observe(iframe));
  }
}

// Iniciar otimizações
document.addEventListener('DOMContentLoaded', function() {
  // Executar otimizações principais
  deferNonCriticalResources();
  
  // Adiar otimizações de terceiros para depois do carregamento da página
  window.addEventListener('load', function() {
    setTimeout(optimizeThirdPartyResources, 100);
  });
});