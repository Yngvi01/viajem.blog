/**
 * Script de otimização crítica para dispositivos móveis
 * Este script implementa técnicas avançadas para melhorar o desempenho em dispositivos móveis
 * focando nos problemas específicos identificados pelo Google Speed Insights.
 */

// Executar imediatamente para otimizar o carregamento inicial
(function() {
  // Detectar se é um dispositivo móvel
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  
  // Se não for dispositivo móvel, não executar otimizações específicas
  if (!isMobile) return;
  
  // Otimização de CSS crítico para dispositivos móveis
  const optimizeCriticalCSS = () => {
    // Identificar e priorizar CSS crítico
    const styleSheets = document.querySelectorAll('link[rel="stylesheet"]');
    styleSheets.forEach(styleSheet => {
      // Verificar se é um CSS crítico para o primeiro render
      const isCritical = styleSheet.hasAttribute('data-critical');
      
      if (isCritical) {
        // Adicionar atributo fetchpriority para CSS crítico
        styleSheet.setAttribute('fetchpriority', 'high');
      } else {
        // Converter CSS não-crítico para carregamento assíncrono
        const href = styleSheet.getAttribute('href');
        if (href) {
          styleSheet.setAttribute('media', 'print');
          styleSheet.setAttribute('onload', `this.media='all'`);
        }
      }
    });
  };
  
  // Otimização de JavaScript crítico para dispositivos móveis
  const optimizeCriticalJS = () => {
    // Identificar scripts críticos e não-críticos
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      // Verificar se é um script crítico
      const isCritical = script.hasAttribute('data-critical');
      
      if (!isCritical && !script.hasAttribute('type')) {
        // Adicionar atributo async para scripts não-críticos sem dependências
        if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
          script.setAttribute('defer', '');
        }
      }
    });
  };
  
  // Otimização de renderização para dispositivos móveis
  const optimizeMobileRendering = () => {
    // Adicionar hint de pré-conexão para domínios críticos
    const addPreconnect = (url) => {
      if (!url) return;
      
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      
      // Adicionar também DNS-prefetch como fallback
      const dnsPrefetch = document.createElement('link');
      dnsPrefetch.rel = 'dns-prefetch';
      dnsPrefetch.href = url;
      document.head.appendChild(dnsPrefetch);
    };
    
    // Adicionar preconnect para domínios de recursos críticos
    // Analisar scripts e links existentes para identificar domínios externos
    const resourceElements = [...document.querySelectorAll('script[src], link[href], img[src]')];
    const domains = new Set();
    
    resourceElements.forEach(el => {
      let url;
      if (el.tagName === 'SCRIPT') url = el.src;
      else if (el.tagName === 'LINK') url = el.href;
      else if (el.tagName === 'IMG') url = el.src;
      
      if (url) {
        try {
          const domain = new URL(url).origin;
          // Apenas adicionar domínios externos
          if (domain !== window.location.origin) {
            domains.add(domain);
          }
        } catch (e) {
          // Ignorar URLs inválidas
        }
      }
    });
    
    // Adicionar preconnect para cada domínio externo (limitado aos 3 mais importantes)
    let count = 0;
    domains.forEach(domain => {
      if (count < 3) {
        addPreconnect(domain);
        count++;
      }
    });
  };
  
  // Otimização de imagens para dispositivos móveis
  const optimizeCriticalImages = () => {
    // Identificar imagens críticas (acima da dobra)
    const viewportHeight = window.innerHeight;
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      const rect = img.getBoundingClientRect();
      
      // Verificar se a imagem está acima da dobra
      const isAboveFold = rect.top < viewportHeight;
      
      if (isAboveFold) {
        // Priorizar imagens acima da dobra
        img.setAttribute('fetchpriority', 'high');
        img.setAttribute('loading', 'eager');
      } else {
        // Usar lazy loading para imagens abaixo da dobra
        if (!img.hasAttribute('loading')) {
          img.setAttribute('loading', 'lazy');
        }
        
        // Adicionar decoding async para melhorar performance
        if (!img.hasAttribute('decoding')) {
          img.setAttribute('decoding', 'async');
        }
      }
    });
  };
  
  // Otimização de fontes para dispositivos móveis
  const optimizeFonts = () => {
    // Adicionar font-display: swap para todas as fontes
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-display: swap !important;
      }
    `;
    document.head.appendChild(style);
    
    // Verificar fontes carregadas via link
    const fontLinks = document.querySelectorAll('link[rel="stylesheet"][href*="font"]');
    fontLinks.forEach(link => {
      // Adicionar preload para fontes críticas
      link.setAttribute('media', 'print');
      link.setAttribute('onload', "this.media='all'");
    });
  };
  
  // Executar otimizações críticas imediatamente
  optimizeCriticalCSS();
  optimizeCriticalJS();
  optimizeMobileRendering();
  
  // Executar otimizações de imagens e fontes após o carregamento do DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeCriticalImages();
      optimizeFonts();
    });
  } else {
    optimizeCriticalImages();
    optimizeFonts();
  }
})();