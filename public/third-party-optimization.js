/**
 * Third-Party Resources Optimization
 * Este script implementa técnicas para otimizar o carregamento de recursos de terceiros
 */

document.addEventListener('DOMContentLoaded', function() {
  // Função para otimizar recursos de terceiros
  const optimizeThirdPartyResources = () => {
    // Adiar o carregamento de iframes
    const lazyLoadIframes = () => {
      const iframes = document.querySelectorAll('iframe[data-src]');
      
      if (!iframes.length) return;
      
      if ('IntersectionObserver' in window) {
        const iframeObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const iframe = entry.target;
              if (iframe.dataset.src) {
                iframe.src = iframe.dataset.src;
                iframe.removeAttribute('data-src');
              }
              observer.unobserve(iframe);
            }
          });
        }, { rootMargin: '200px 0px' });
        
        iframes.forEach(iframe => {
          iframeObserver.observe(iframe);
        });
      } else {
        // Fallback para navegadores sem suporte a IntersectionObserver
        iframes.forEach(iframe => {
          if (iframe.dataset.src) {
            iframe.src = iframe.dataset.src;
            iframe.removeAttribute('data-src');
          }
        });
      }
    };
    
    // Adicionar atributo de preconexão para domínios terceiros frequentemente utilizados
    const addPreconnect = () => {
      const thirdPartyDomains = new Set();
      
      // Coletar domínios de terceiros de scripts, links, iframes, etc.
      const elements = document.querySelectorAll('script[src], link[href], iframe[src], img[src]');
      elements.forEach(el => {
        const src = el.src || el.href;
        if (!src) return;
        
        try {
          const url = new URL(src);
          if (url.hostname !== window.location.hostname) {
            thirdPartyDomains.add(url.origin);
          }
        } catch {
          // URL inválida, ignorar
        }
      });
      
      // Adicionar links de preconexão para cada domínio de terceiros
      thirdPartyDomains.forEach(domain => {
        if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
          const link = document.createElement('link');
          link.rel = 'preconnect';
          link.href = domain;
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        }
      });
    };
    
    // Carregar recursos de terceiros sob demanda
    const loadThirdPartyOnDemand = () => {
      // Botões ou elementos que acionam carregamento de recursos de terceiros
      const thirdPartyTriggers = document.querySelectorAll('[data-load-third-party]');
      
      thirdPartyTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          const resourceId = trigger.dataset.loadThirdParty;
          const resource = document.getElementById(resourceId);
          
          if (resource && resource.dataset.src) {
            resource.src = resource.dataset.src;
            resource.removeAttribute('data-src');
            trigger.setAttribute('disabled', 'true');
            trigger.classList.add('loaded');
          }
        });
      });
    };
    
    // Implementar carregamento condicional de scripts de terceiros
    const conditionalThirdPartyLoad = () => {
      // Para cada script de terceiros com carregamento condicional
      document.querySelectorAll('script[data-condition]').forEach(script => {
        const condition = script.dataset.condition;
        
        if (!condition) return;
        
        switch(condition) {
          case 'visible':
            // Carregar apenas quando o elemento associado estiver visível
            if (script.dataset.element) {
              const element = document.querySelector(script.dataset.element);
              if (element) {
                const observer = new IntersectionObserver((entries) => {
                  if (entries[0].isIntersecting && script.dataset.src) {
                    script.src = script.dataset.src;
                    script.removeAttribute('data-src');
                    script.removeAttribute('data-condition');
                    script.removeAttribute('data-element');
                    observer.disconnect();
                  }
                });
                observer.observe(element);
              }
            }
            break;
            
          case 'userInteraction':
            // Carregar após a primeira interação do usuário
            const loadOnInteraction = () => {
              if (script.dataset.src) {
                script.src = script.dataset.src;
                script.removeAttribute('data-src');
                script.removeAttribute('data-condition');
                
                // Remover os listeners após o carregamento
                ['click', 'touchstart', 'scroll'].forEach(event => {
                  document.removeEventListener(event, loadOnInteraction);
                });
              }
            };
            
            ['click', 'touchstart', 'scroll'].forEach(event => {
              document.addEventListener(event, loadOnInteraction, {once: true});
            });
            break;
            
          case 'idle':
            // Carregar quando o navegador estiver ocioso
            if (window.requestIdleCallback) {
              window.requestIdleCallback(() => {
                if (script.dataset.src) {
                  script.src = script.dataset.src;
                  script.removeAttribute('data-src');
                  script.removeAttribute('data-condition');
                }
              });
            } else {
              setTimeout(() => {
                if (script.dataset.src) {
                  script.src = script.dataset.src;
                  script.removeAttribute('data-src');
                  script.removeAttribute('data-condition');
                }
              }, 5000); // Fallback, carregar após 5 segundos
            }
            break;
        }
      });
    };
    
    // Executar as funções de otimização
    lazyLoadIframes();
    addPreconnect();
    loadThirdPartyOnDemand();
    conditionalThirdPartyLoad();
  };
  
  // Executar otimizações após o carregamento principal
  if (document.readyState === 'complete') {
    optimizeThirdPartyResources();
  } else {
    window.addEventListener('load', () => {
      // Adiar para não competir com o carregamento inicial
      setTimeout(optimizeThirdPartyResources, 1000);
    });
  }
});