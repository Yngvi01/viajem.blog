/**
 * Script de otimização de recursos críticos
 * Este script implementa técnicas avançadas para eliminar recursos que bloqueiam a renderização
 * e melhorar o desempenho em dispositivos móveis conforme recomendações do Google Speed Insights.
 */

// Executar imediatamente para otimizar o carregamento inicial
(function() {
  // Detectar se é um dispositivo móvel
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  
  // Otimização de recursos críticos para todos os dispositivos, com foco em mobile
  const optimizeCriticalResources = () => {
    // Identificar recursos que bloqueiam a renderização
    const identifyRenderBlockingResources = () => {
      // Verificar stylesheets que bloqueiam a renderização
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      stylesheets.forEach(stylesheet => {
        // Não modificar folhas de estilo já otimizadas ou críticas
        if (stylesheet.hasAttribute('data-critical') || 
            stylesheet.hasAttribute('media') && stylesheet.getAttribute('media') !== 'all') {
          return;
        }
        
        // Obter o href do stylesheet
        const href = stylesheet.getAttribute('href');
        if (!href) return;
        
        // Verificar se é um recurso externo (terceiros)
        const isExternal = href.startsWith('http') && !href.includes(window.location.hostname);
        
        // Aplicar técnica de carregamento assíncrono para evitar bloqueio de renderização
        stylesheet.setAttribute('media', 'print');
        stylesheet.setAttribute('onload', `this.media='all'`);
        
        // Para recursos externos, adicionar preload para iniciar o download mais cedo
        if (isExternal) {
          const preload = document.createElement('link');
          preload.rel = 'preload';
          preload.as = 'style';
          preload.href = href;
          document.head.appendChild(preload);
        }
      });
      
      // Verificar scripts que bloqueiam a renderização
      const scripts = document.querySelectorAll('script[src]:not([async]):not([defer])');
      scripts.forEach(script => {
        // Não modificar scripts críticos
        if (script.hasAttribute('data-critical')) return;
        
        // Adicionar defer para evitar bloqueio de renderização
        script.setAttribute('defer', '');
      });
    };
    
    // Otimizar carregamento de fontes
    const optimizeFontLoading = () => {
      // Adicionar preload para fontes críticas
      const fontFiles = [
        // Detectar fontes usadas no site
        ...Array.from(document.querySelectorAll('link[rel="stylesheet"][href*="font"]')),
        ...Array.from(document.querySelectorAll('style'))
          .filter(style => style.textContent.includes('@font-face'))
      ];
      
      // Extrair URLs de fontes de elementos style
      const extractFontUrls = (styleElement) => {
        const fontUrls = [];
        const fontFaceRegex = /@font-face\s*{[^}]*?src\s*:\s*url\(['"]?([^'")]+)['"]?\)/g;
        let match;
        
        while ((match = fontFaceRegex.exec(styleElement.textContent)) !== null) {
          fontUrls.push(match[1]);
        }
        
        return fontUrls;
      };
      
      // Coletar todas as URLs de fontes
      const fontUrls = new Set();
      fontFiles.forEach(element => {
        if (element.tagName === 'LINK') {
          fontUrls.add(element.href);
        } else if (element.tagName === 'STYLE') {
          extractFontUrls(element).forEach(url => fontUrls.add(url));
        }
      });
      
      // Adicionar preload para fontes críticas (limitado a 2 fontes para não sobrecarregar)
      let count = 0;
      fontUrls.forEach(url => {
        if (count < 2) {
          const preload = document.createElement('link');
          preload.rel = 'preload';
          preload.as = 'font';
          preload.href = url;
          preload.crossOrigin = 'anonymous';
          document.head.appendChild(preload);
          count++;
        }
      });
      
      // Adicionar font-display: swap para todas as fontes
      const fontDisplayStyle = document.createElement('style');
      fontDisplayStyle.textContent = `
        @font-face {
          font-display: swap !important;
        }
      `;
      document.head.appendChild(fontDisplayStyle);
    };
    
    // Otimizar carregamento de imagens críticas
    const optimizeCriticalImages = () => {
      // Identificar imagens acima da dobra
      const viewportHeight = window.innerHeight;
      const images = document.querySelectorAll('img:not([loading="lazy"])');
      
      images.forEach(img => {
        const rect = img.getBoundingClientRect();
        const isAboveFold = rect.top < viewportHeight;
        
        if (isAboveFold) {
          // Priorizar imagens acima da dobra
          img.setAttribute('fetchpriority', 'high');
          
          // Adicionar preload para imagens críticas
          if (img.src && !document.querySelector(`link[rel="preload"][href="${img.src}"]`)) {
            const preload = document.createElement('link');
            preload.rel = 'preload';
            preload.as = 'image';
            preload.href = img.src;
            document.head.appendChild(preload);
          }
        } else {
          // Usar lazy loading para imagens abaixo da dobra
          img.setAttribute('loading', 'lazy');
          img.setAttribute('decoding', 'async');
        }
      });
    };
    
    // Otimização específica para dispositivos móveis
    const optimizeMobileSpecific = () => {
      if (!isMobile) return;
      
      // Reduzir o impacto de scripts de terceiros em dispositivos móveis
      const thirdPartyScripts = document.querySelectorAll('script[src*="cdn."], script[src*="api."]');
      thirdPartyScripts.forEach(script => {
        // Adicionar atributo async para scripts de terceiros não críticos
        if (!script.hasAttribute('data-critical')) {
          script.setAttribute('defer', '');
        }
      });
      
      // Otimizar elementos de mídia para dispositivos móveis
      const mediaElements = document.querySelectorAll('video, audio');
      mediaElements.forEach(media => {
        // Desativar reprodução automática em dispositivos móveis
        if (media.hasAttribute('autoplay')) {
          media.removeAttribute('autoplay');
          media.setAttribute('preload', 'none');
        }
      });
    };
    
    // Executar otimizações
    identifyRenderBlockingResources();
    optimizeFontLoading();
    optimizeCriticalImages();
    optimizeMobileSpecific();
  };
  
  // Executar otimizações imediatamente
  optimizeCriticalResources();
})();