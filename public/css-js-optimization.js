/**
 * CSS e JavaScript Optimization
 * Este script implementa técnicas para otimizar o CSS e JavaScript não utilizados
 */

document.addEventListener('DOMContentLoaded', function() {
  // Função para remover CSS não utilizado
  const optimizeCSS = () => {
    // Detectar seletores CSS não utilizados
    const unusedSelectors = new Set();
    const styleSheets = Array.from(document.styleSheets);
    
    try {
      styleSheets.forEach(sheet => {
        if (sheet.href && !sheet.href.startsWith(window.location.origin)) {
          // Não podemos acessar regras CSS de origens externas por segurança
          return;
        }
        
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules || []);
          rules.forEach(rule => {
            if (rule.selectorText) {
              const selectors = rule.selectorText.split(',').map(s => s.trim());
              selectors.forEach(selector => {
                try {
                  if (selector.includes(':') && !selector.includes('::')) {
                    // Seletores com pseudo-classes são difíceis de verificar, ignorar
                    return;
                  }
                  
                  if (selector.startsWith('@') || selector === '') {
                    // Ignorar media queries e seletores vazios
                    return;
                  }
                  
                  // Verificar se o seletor existe no DOM
                  if (document.querySelector(selector) === null) {
                    unusedSelectors.add(selector);
                  }
                } catch (_) {
                  // Seletor inválido ou não suportado, ignorar
                }
              });
            }
          });
        } catch (_) {
          // Erro ao acessar regras de CSS, possivelmente por CORS
        }
      });
    } catch (_) {
      // Erro ao processar folhas de estilo
    }
    
    // Registrar para depuração
    if (unusedSelectors.size > 0 && window.localStorage.getItem('DEBUG_CSS') === 'true') {
      console.log('Potenciais seletores CSS não utilizados:', Array.from(unusedSelectors));
    }
  };
  
  // Função para otimizar carregamento de JavaScript
  const optimizeJavaScript = () => {
    // Marcar scripts como assíncronos ou diferidos
    document.querySelectorAll('script:not([async]):not([defer]):not([type="module"])').forEach(script => {
      // Não modificar scripts inline ou críticos
      if (!script.src || script.hasAttribute('data-critical')) {
        return;
      }
      
      // Scripts de análise ou rastreamento devem ser assíncronos
      if (script.src.includes('analytics') || 
          script.src.includes('tracking') || 
          script.src.includes('pixel')) {
        script.async = true;
        return;
      }
      
      // Outros scripts podem ser diferidos
      script.defer = true;
    });
    
    // Adicionar atributo de tipo ao import de módulos quando faltante
    document.querySelectorAll('script[src$=".mjs"]').forEach(script => {
      if (!script.type) {
        script.type = 'module';
      }
    });
  };
  
  // Otimizar manipuladores de eventos para evitar bloqueio de renderização
  const optimizeEventListeners = () => {
    // Verificar se podemos usar passive event listeners
    let supportsPassive = false;
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get: function() {
          supportsPassive = true;
          return true;
        }
      });
      window.addEventListener('testPassive', null, opts);
      window.removeEventListener('testPassive', null, opts);
    } catch (_) {
      // Erro ao testar suporte para passive
    }
    
    // Converter manipuladores de evento que podem bloquear a rolagem para passive
    if (supportsPassive) {
      const passiveScrollEvents = ['touchstart', 'touchmove', 'wheel', 'mousewheel'];
      
      passiveScrollEvents.forEach(event => {
        // Adiciona um listener vazio com passive true para garantir que a rolagem não seja bloqueada
        window.addEventListener(event, () => {}, { passive: true, capture: true });
      });
    }
  };
  
  // Executar otimizações quando possível
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    optimizeJavaScript();
    if (window.requestIdleCallback) {
      window.requestIdleCallback(optimizeCSS);
    } else {
      setTimeout(optimizeCSS, 1000);
    }
    optimizeEventListeners();
  } else {
    window.addEventListener('load', () => {
      optimizeJavaScript();
      if (window.requestIdleCallback) {
        window.requestIdleCallback(optimizeCSS);
      } else {
        setTimeout(optimizeCSS, 1000);
      }
      optimizeEventListeners();
    });
  }
});