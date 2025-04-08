/**
 * Script de otimização avançada de imagens para dispositivos móveis
 * Este script implementa técnicas específicas para melhorar o carregamento de imagens
 * em dispositivos móveis, seguindo as recomendações do Google Speed Insights.
 */

// Executar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Detectar se é um dispositivo móvel
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
  
  // Se não for dispositivo móvel, não executar otimizações específicas
  if (!isMobile) return;
  
  // Otimização avançada de imagens para dispositivos móveis
  const optimizeMobileImages = () => {
    // Implementar carregamento progressivo de imagens
    const setupProgressiveLoading = () => {
      const images = document.querySelectorAll('img:not([loading="eager"])');
      
      images.forEach(img => {
        // Verificar se a imagem já tem atributos de otimização
        if (img.hasAttribute('data-optimized')) return;
        
        // Marcar como otimizada
        img.setAttribute('data-optimized', 'true');
        
        // Adicionar decoding async para todas as imagens
        if (!img.hasAttribute('decoding')) {
          img.setAttribute('decoding', 'async');
        }
        
        // Verificar se a imagem está fora da viewport
        const rect = img.getBoundingClientRect();
        const isOffscreen = rect.top > window.innerHeight + 100;
        
        if (isOffscreen) {
          // Usar lazy loading para imagens fora da viewport
          img.setAttribute('loading', 'lazy');
          
          // Adicionar classe para animação de fade-in quando carregada
          img.classList.add('lazy-image');
          img.addEventListener('load', () => {
            requestAnimationFrame(() => {
              img.classList.add('loaded');
            });
          });
        }
      });
    };
    
    // Otimizar imagens responsivas para dispositivos móveis
    const optimizeResponsiveImages = () => {
      const images = document.querySelectorAll('img[srcset], img[sizes]');
      
      images.forEach(img => {
        // Verificar se a imagem já tem atributos de otimização
        if (img.hasAttribute('data-responsive-optimized')) return;
        
        // Marcar como otimizada
        img.setAttribute('data-responsive-optimized', 'true');
        
        // Garantir que o atributo sizes esteja otimizado para mobile
        if (img.hasAttribute('sizes') && !img.getAttribute('sizes').includes('100vw')) {
          // Adicionar tamanho específico para viewport mobile
          const currentSizes = img.getAttribute('sizes');
          img.setAttribute('sizes', `(max-width: 768px) 100vw, ${currentSizes}`);
        }
        
        // Se não tiver sizes, adicionar um valor otimizado
        if (img.hasAttribute('srcset') && !img.hasAttribute('sizes')) {
          img.setAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
        }
      });
    };
    
    // Converter imagens de fundo para formato otimizado
    const optimizeBackgroundImages = () => {
      // Identificar elementos com imagens de fundo
      const elementsWithBgImage = Array.from(document.querySelectorAll('*'))
        .filter(el => {
          const style = window.getComputedStyle(el);
          return style.backgroundImage !== 'none' && style.backgroundImage.includes('url');
        });
      
      elementsWithBgImage.forEach(el => {
        // Verificar se o elemento já foi otimizado
        if (el.hasAttribute('data-bg-optimized')) return;
        
        // Marcar como otimizado
        el.setAttribute('data-bg-optimized', 'true');
        
        // Adicionar classe para otimização mobile
        el.classList.add('mobile-bg-optimized');
        
        // Verificar se o elemento está fora da viewport
        const rect = el.getBoundingClientRect();
        const isOffscreen = rect.top > window.innerHeight + 200;
        
        if (isOffscreen && !el.classList.contains('critical-bg')) {
          // Adiar o carregamento de imagens de fundo não críticas
          const originalBg = window.getComputedStyle(el).backgroundImage;
          
          // Armazenar a imagem original como atributo de dados
          el.setAttribute('data-original-bg', originalBg);
          
          // Remover temporariamente a imagem de fundo
          el.style.backgroundImage = 'none';
          
          // Usar IntersectionObserver para carregar quando visível
          if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  const target = entry.target;
                  const originalBg = target.getAttribute('data-original-bg');
                  
                  // Restaurar a imagem de fundo quando visível
                  if (originalBg) {
                    target.style.backgroundImage = originalBg;
                  }
                  
                  observer.unobserve(target);
                }
              });
            }, { rootMargin: '200px 0px' });
            
            observer.observe(el);
          } else {
            // Fallback para navegadores sem suporte a IntersectionObserver
            setTimeout(() => {
              el.style.backgroundImage = originalBg;
            }, 1000);
          }
        }
      });
    };
    
    // Otimizar imagens em elementos picture
    const optimizePictureElements = () => {
      const pictures = document.querySelectorAll('picture');
      
      pictures.forEach(picture => {
        // Verificar se o elemento já foi otimizado
        if (picture.hasAttribute('data-optimized')) return;
        
        // Marcar como otimizado
        picture.setAttribute('data-optimized', 'true');
        
        // Verificar se já existe source para mobile
        const hasMobileSource = Array.from(picture.querySelectorAll('source'))
          .some(source => {
            const media = source.getAttribute('media');
            return media && (media.includes('max-width') || media.includes('mobile'));
          });
        
        // Se não tiver source específico para mobile, verificar se podemos otimizar
        if (!hasMobileSource) {
          const img = picture.querySelector('img');
          const sources = picture.querySelectorAll('source');
          
          // Verificar se a imagem está fora da viewport
          if (img) {
            const rect = img.getBoundingClientRect();
            const isOffscreen = rect.top > window.innerHeight + 100;
            
            if (isOffscreen) {
              // Adicionar lazy loading para a imagem
              img.setAttribute('loading', 'lazy');
              img.setAttribute('decoding', 'async');
            }
          }
          
          // Otimizar os sources existentes
          sources.forEach(source => {
            // Garantir que o atributo sizes esteja otimizado para mobile
            if (source.hasAttribute('sizes') && !source.getAttribute('sizes').includes('100vw')) {
              const currentSizes = source.getAttribute('sizes');
              source.setAttribute('sizes', `(max-width: 768px) 100vw, ${currentSizes}`);
            }
            
            // Se não tiver sizes, adicionar um valor otimizado
            if (source.hasAttribute('srcset') && !source.hasAttribute('sizes')) {
              source.setAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
            }
          });
        }
      });
    };
    
    // Executar otimizações
    setupProgressiveLoading();
    optimizeResponsiveImages();
    optimizeBackgroundImages();
    optimizePictureElements();
  };
  
  // Adicionar estilos CSS para otimizações de imagens
  const addOptimizationStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
      /* Estilos para imagens com carregamento lazy */
      .lazy-image {
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
      }
      
      .lazy-image.loaded {
        opacity: 1;
      }
      
      /* Otimização de imagens de fundo para mobile */
      .mobile-bg-optimized {
        background-size: cover;
        background-position: center;
      }
      
      /* Reduzir qualidade de imagens de fundo em dispositivos móveis para melhor performance */
      @media (max-width: 768px) {
        .mobile-bg-optimized:not(.critical-bg) {
          background-image: var(--mobile-bg-image, inherit) !important;
        }
      }
    `;
    document.head.appendChild(style);
  };
  
  // Executar otimizações
  addOptimizationStyles();
  
  // Usar requestIdleCallback para não bloquear a renderização
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      optimizeMobileImages();
    }, { timeout: 1000 });
  } else {
    // Fallback para navegadores sem suporte a requestIdleCallback
    setTimeout(() => {
      optimizeMobileImages();
    }, 200);
  }
  
  // Adicionar listener para orientação do dispositivo
  window.addEventListener('orientationchange', () => {
    // Reotimizar após mudança de orientação
    setTimeout(() => {
      optimizeMobileImages();
    }, 300);
  });
});