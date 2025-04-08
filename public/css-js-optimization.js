/**
 * Script de otimização de CSS e JavaScript
 * Este script implementa técnicas para melhorar o carregamento de CSS e JavaScript
 * sem afetar a funcionalidade ou SEO.
 */

// Função para otimizar o carregamento de CSS
function optimizeCSS() {
  // Identificar folhas de estilo não críticas
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical="true"])');
  
  // Converter para carregamento assíncrono
  stylesheets.forEach(stylesheet => {
    // Guardar o href original
    const href = stylesheet.getAttribute('href');
    
    // Remover o atributo href para evitar o bloqueio de renderização
    stylesheet.removeAttribute('href');
    
    // Adicionar como preload com onload para aplicar depois
    stylesheet.setAttribute('rel', 'preload');
    stylesheet.setAttribute('as', 'style');
    stylesheet.setAttribute('onload', `this.onload=null;this.rel='stylesheet';this.href='${href}'`);
    
    // Adicionar fallback para navegadores que não suportam onload
    const noscript = document.createElement('noscript');
    const fallbackLink = document.createElement('link');
    fallbackLink.setAttribute('rel', 'stylesheet');
    fallbackLink.setAttribute('href', href);
    noscript.appendChild(fallbackLink);
    
    // Inserir após o stylesheet original
    if (stylesheet.parentNode) {
      stylesheet.parentNode.insertBefore(noscript, stylesheet.nextSibling);
    }
  });
}

// Função para otimizar o carregamento de JavaScript
function optimizeJS() {
  // Identificar scripts não críticos (sem o atributo data-critical)
  const scripts = document.querySelectorAll('script:not([data-critical="true"])');
  
  scripts.forEach(script => {
    // Adicionar defer para scripts com src
    if (script.src && !script.defer && !script.async) {
      script.defer = true;
    }
  });
  
  // Remover JavaScript não utilizado
  // Esta função identifica e desativa scripts que não são utilizados na página atual
  const removeUnusedJS = () => {
    // Lista de seletores que, se não existirem na página, indicam que o script relacionado não é necessário
    const scriptSelectors = [
      { selector: '.carousel', scriptId: 'carousel-script' },
      { selector: '.lightbox', scriptId: 'lightbox-script' },
      { selector: '.animation', scriptId: 'animation-script' }
    ];
    
    scriptSelectors.forEach(item => {
      // Se o seletor não existir na página
      if (document.querySelectorAll(item.selector).length === 0) {
        // Procurar o script pelo ID e desativá-lo
        const script = document.getElementById(item.scriptId);
        if (script) {
          script.setAttribute('data-disabled', 'true');
          script.setAttribute('type', 'text/disabled');
        }
      }
    });
  };
  
  // Executar remoção de JS não utilizado
  if (document.readyState === 'complete') {
    removeUnusedJS();
  } else {
    window.addEventListener('load', removeUnusedJS);
  }
}

// Executar otimizações quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    optimizeCSS();
    optimizeJS();
  });
} else {
  optimizeCSS();
  optimizeJS();
}