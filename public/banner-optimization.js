/**
 * Script de otimização específica para o componente Banner
 * Este script implementa técnicas otimizadas para o carregamento de imagens do banner
 * e melhora o desempenho em dispositivos móveis
 */

document.addEventListener('DOMContentLoaded', function() {
  // Otimização do carregamento de imagens do banner
  const optimizeBannerImages = () => {
    const carouselImgs = document.getElementById('carousel_imgs');
    if (!carouselImgs || carouselImgs.children.length === 0) return;
    
    // Pré-carregamento otimizado para a primeira imagem com prioridade alta
    const firstImage = carouselImgs.children[0];
    const imgUrl = firstImage.getAttribute('data-background-image');
    
    if (imgUrl) {
      // Criar link de preload para a primeira imagem
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = imgUrl;
      document.head.appendChild(preloadLink);
      
      // Aplicar a imagem imediatamente
      firstImage.style.backgroundImage = `url(${imgUrl})`;
      firstImage.classList.add('loaded');
    }
    
    // Configurar lazy loading para as outras imagens
    if ('IntersectionObserver' in window) {
      const lazyImageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const lazyImage = entry.target;
            const imgUrl = lazyImage.getAttribute('data-background-image');
            if (imgUrl) {
              // Carregar a imagem apenas quando estiver próxima de ser exibida
              const tempImage = new Image();
              tempImage.onload = () => {
                lazyImage.style.backgroundImage = `url(${imgUrl})`;
                lazyImage.classList.add('loaded');
              };
              tempImage.src = imgUrl;
            }
            lazyImageObserver.unobserve(lazyImage);
          }
        });
      }, { 
        rootMargin: '200px 0px', // Carregar imagens quando estiverem a 200px da viewport
        threshold: 0.01 // Iniciar carregamento quando pelo menos 1% da imagem estiver visível
      });
      
      // Observar todas as imagens exceto a primeira
      for (let i = 1; i < carouselImgs.children.length; i++) {
        lazyImageObserver.observe(carouselImgs.children[i]);
      }
    } else {
      // Fallback para navegadores que não suportam IntersectionObserver
      // Carregar todas as imagens com um pequeno atraso
      for (let i = 1; i < carouselImgs.children.length; i++) {
        const lazyImage = carouselImgs.children[i];
        const imgUrl = lazyImage.getAttribute('data-background-image');
        if (imgUrl) {
          setTimeout(() => {
            lazyImage.style.backgroundImage = `url(${imgUrl})`;
            lazyImage.classList.add('loaded');
          }, i * 100); // Carregar com um pequeno atraso entre cada imagem
        }
      }
    }
  };
  
  // Otimização das animações do banner para dispositivos móveis
  const optimizeBannerAnimations = () => {
    const isMobile = window.innerWidth < 768;
    const banner = document.getElementById('banner');
    
    if (isMobile && banner) {
      // Reduzir a complexidade das animações em dispositivos móveis
      const waves = banner.querySelectorAll('.parallax use');
      waves.forEach(wave => {
        // Simplificar animações em dispositivos móveis
        const style = wave.getAttribute('style');
        if (style) {
          // Aumentar a duração da animação para reduzir o uso de CPU
          const newStyle = style.replace(/animationDuration: "(\d+)s"/, (match, duration) => {
            return `animationDuration: "${parseInt(duration) * 1.5}s"`;
          });
          wave.setAttribute('style', newStyle);
        }
      });
    }
  };
  
  // Gerar estilos de animação do carrossel de forma otimizada
  const generateCarouselAnimation = () => {
    const carouselImgs = document.getElementById('carousel_imgs');
    const carouselImgsCount = carouselImgs?.children.length ?? 0;
    
    if (carouselImgsCount > 0) {
      const styleElement = document.createElement('style');
      const isMobile = window.innerWidth < 768;
      
      // Animação otimizada para dispositivos móveis
      const carouselAnimation = `
        @keyframes carousel-animation {
          0% {
            opacity: 0;
            transform: scale(${isMobile ? '1' : '1'});
          }
          3% {
            opacity: 1;
          }
          8% {
            opacity: 1;
            animation-timing-function: ease-out;
          }
          ${100 / carouselImgsCount}% {
            opacity: 1;
          }
          ${100 / carouselImgsCount + 50 / carouselImgsCount}% {
            opacity: 0;
            animation-timing-function: ease-out;
          }
          100% {
            opacity: 0;
            transform: scale(${isMobile ? '1.5' : '2'});
          }
        }
      `;
      
      styleElement.textContent = carouselAnimation;
      let bannerElement = document.getElementById('banner');
      if (bannerElement && !bannerElement.querySelector('style')) {
        bannerElement.appendChild(styleElement);
      }
    }
  };
  
  // Executar otimizações
  optimizeBannerImages();
  optimizeBannerAnimations();
  generateCarouselAnimation();
  
  // Reajustar animações quando a orientação do dispositivo mudar
  window.addEventListener('resize', () => {
    optimizeBannerAnimations();
    generateCarouselAnimation();
  });
});