/**
 * Performance Optimizations for Mobile
 * Este script implementa correções para os problemas identificados no PageSpeed Insights
 */

document.addEventListener('DOMContentLoaded', function() {
  // Pré-conectar a origens necessárias para melhorar o tempo de carregamento
  const preconnectOrigins = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    // Adicione outras origens importantes aqui
  ];
  
  preconnectOrigins.forEach(origin => {
    if (!document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      document.head.appendChild(link);
    }
  });
  
  // Otimização para atrasar carregamento de recursos não críticos
  const deferNonCriticalResources = () => {
    // Adiar scripts não críticos
    document.querySelectorAll('script[data-defer]').forEach(script => {
      script.setAttribute('defer', '');
      script.removeAttribute('data-defer');
    });
    
    // Adiar imagens fora da tela
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
              }
              img.removeAttribute('data-src');
              img.removeAttribute('data-srcset');
            }
            observer.unobserve(img);
          }
        });
      });
      
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  };
  
  // Reduzir redirecionamentos múltiplos
  const fixRedirects = () => {
    document.querySelectorAll('a[href]').forEach(link => {
      // Corrigir links que podem causar redirecionamentos
      if (link.href.includes('//www.') && !link.hostname.startsWith('www.')) {
        link.href = link.href.replace('//www.', '//');
      }
    });
  };
  
  // Evitar tarefas longas da linha de execução principal
  const optimizeMainThread = () => {
    // Quebrar tarefas longas em pedaços menores
    if ('requestIdleCallback' in window) {
      const tasks = [];
      
      const enqueueTask = (task) => {
        tasks.push(task);
        processTaskQueue();
      };
      
      const processTaskQueue = () => {
        if (tasks.length === 0) return;
        
        requestIdleCallback((deadline) => {
          while (deadline.timeRemaining() > 0 && tasks.length > 0) {
            const task = tasks.shift();
            task();
          }
          
          if (tasks.length > 0) {
            processTaskQueue();
          }
        });
      };
      
      // Expor função para adicionar tarefas
      window.enqueueOptimizedTask = enqueueTask;
    }
  };
  
  // Executar otimizações
  deferNonCriticalResources();
  fixRedirects();
  optimizeMainThread();
});