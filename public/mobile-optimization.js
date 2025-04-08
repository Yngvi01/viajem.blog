/**
 * Script de otimização específica para dispositivos móveis
 * Este script implementa técnicas para melhorar o desempenho em dispositivos móveis
 * sem afetar a funcionalidade ou SEO.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Detectar se é um dispositivo móvel
  const isMobile = window.innerWidth < 768;
  if (!isMobile) return; // Executar apenas em dispositivos móveis
  
  // Otimização de imagens para dispositivos móveis
  const optimizeMobileImages = () => {
    // Reduzir qualidade de imagens de fundo em dispositivos móveis
    const backgroundImages = document.querySelectorAll('.carousel .item');
    backgroundImages.forEach(img => {
      // Adicionar classe específica para otimização em dispositivos móveis
      img.classList.add('mobile-optimized');
    });
    
    // Adiar carregamento de imagens fora da viewport
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      if (!img.hasAttribute('fetchpriority') || img.getAttribute('fetchpriority') !== 'high') {
        img.setAttribute('loading', 'lazy');
      }
    });
  };
  
  // Reduzir o CSS não utilizado em dispositivos móveis
  const optimizeMobileCSS = () => {
    // Adicionar classe ao body para estilos específicos de dispositivos móveis
    document.body.classList.add('mobile-device');
    
    // Desativar animações complexas em dispositivos móveis
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      document.body.classList.add('reduced-motion');
    }
  };
  
  // Otimizar o JavaScript para dispositivos móveis
  const optimizeMobileJS = () => {
    // Adiar execução de scripts não críticos
    const deferNonCriticalOperations = () => {
      // Lista de operações não críticas para adiar
      const nonCriticalOperations = [
        // Adicionar aqui funções não críticas
      ];
      
      // Executar operações não críticas quando o navegador estiver ocioso
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          nonCriticalOperations.forEach(operation => {
            if (typeof operation === 'function') {
              operation();
            }
          });
        }, { timeout: 2000 });
      } else {
        // Fallback para navegadores que não suportam requestIdleCallback
        setTimeout(() => {
          nonCriticalOperations.forEach(operation => {
            if (typeof operation === 'function') {
              operation();
            }
          });
        }, 1000);
      }
    };
    
    deferNonCriticalOperations();
  };
  
  // Otimizar recursos de terceiros para dispositivos móveis
  const optimizeThirdPartyResources = () => {
    // Adiar carregamento de recursos de terceiros não críticos
    const thirdPartyScripts = document.querySelectorAll('script[src*="cdn."], script[src*="api."]');
    thirdPartyScripts.forEach(script => {
      if (!script.hasAttribute('data-critical')) {
        script.setAttribute('defer', '');
      }
    });
  };
  
  // Executar otimizações para dispositivos móveis
  optimizeMobileImages();
  optimizeMobileCSS();
  optimizeMobileJS();
  optimizeThirdPartyResources();
  
  // Adicionar listener para orientação do dispositivo
  window.addEventListener('orientationchange', () => {
    // Reotimizar após mudança de orientação
    setTimeout(() => {
      optimizeMobileImages();
      optimizeMobileCSS();
    }, 300);
  });
});