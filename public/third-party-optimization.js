/**
 * Script de otimização de recursos de terceiros
 * Este script implementa técnicas para melhorar o carregamento de recursos de terceiros
 * sem afetar a funcionalidade ou SEO.
 */

// Função para otimizar recursos de terceiros
function optimizeThirdPartyResources() {
  // Lista de domínios de terceiros que são carregados no site
  const thirdPartyDomains = [
    'www.googletagmanager.com',
    'pagead2.googlesyndication.com',
    'cdn.pixabay.com'
  ];
  
  // Pré-conectar a domínios de terceiros importantes
  thirdPartyDomains.forEach(domain => {
    // Verificar se já existe uma tag de preconnect para este domínio
    const existingPreconnect = document.querySelector(`link[rel="preconnect"][href="https://${domain}"]`);
    if (!existingPreconnect) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = `https://${domain}`;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  });
  
  // Adiar carregamento de scripts de terceiros não críticos
  const deferThirdPartyScripts = () => {
    // Identificar scripts de terceiros pelo domínio
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      // Verificar se o script é de um domínio de terceiros
      if (src && thirdPartyDomains.some(domain => src.includes(domain))) {
        // Se não for crítico e não tiver defer ou async
        if (!script.hasAttribute('data-critical') && !script.defer && !script.async) {
          script.defer = true;
        }
      }
    });
  };
  
  // Adiar carregamento de iframes de terceiros
  const deferIframes = () => {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      const src = iframe.getAttribute('src');
      // Se o iframe tiver src e não estiver marcado como crítico
      if (src && !iframe.hasAttribute('data-critical')) {
        // Substituir src por data-src para carregar depois
        iframe.setAttribute('data-src', src);
        iframe.removeAttribute('src');
        
        // Adicionar um placeholder para manter o layout
        iframe.style.backgroundColor = '#f1f1f1';
      }
    });
    
    // Carregar iframes quando estiverem próximos da viewport
    if ('IntersectionObserver' in window) {
      const iframeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const iframe = entry.target;
            if (iframe.hasAttribute('data-src')) {
              iframe.src = iframe.getAttribute('data-src');
              iframe.removeAttribute('data-src');
              iframeObserver.unobserve(iframe);
            }
          }
        });
      }, { rootMargin: '200px 0px' });
      
      document.querySelectorAll('iframe[data-src]').forEach(iframe => {
        iframeObserver.observe(iframe);
      });
    }
  };
  
  // Executar otimizações
  deferThirdPartyScripts();
  deferIframes();
}

// Executar otimizações quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', optimizeThirdPartyResources);
} else {
  optimizeThirdPartyResources();
}