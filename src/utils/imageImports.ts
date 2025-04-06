// Importação dinâmica de todas as imagens disponíveis na pasta src/assets/images
import defaultAttraction from '../assets/images/default-attraction.jpg';
import defaultImage from '../assets/images/default-image.jpg';
import logoImage from '../assets/images/logo.png';

// Importação automática de todas as imagens em src/assets/images
const imageModules = import.meta.glob('../assets/images/**/*.{png,jpg,jpeg,gif,webp,avif,svg}', { eager: true });

// Mapa de imagens para acesso rápido
const imageMap: Record<string, any> = {};

// Preenche o mapa de imagens automaticamente
Object.entries(imageModules).forEach(([path, module]) => {
  // Normaliza o caminho removendo '../assets/' para manter a referência interna
  const normalizedPath = path.replace('../assets/', '');
  imageMap[normalizedPath] = (module as any).default;

  // Adiciona versões sem o prefixo 'images/' para compatibilidade com referências anteriores
  if (normalizedPath.startsWith('images/')) {
    const withoutImagesPrefix = normalizedPath.replace('images/', '');
    imageMap[withoutImagesPrefix] = (module as any).default;
  }
});

// Garante que imagens essenciais estejam sempre disponíveis
imageMap['images/default-attraction.jpg'] = defaultAttraction;
imageMap['images/default-image.jpg'] = defaultImage;
imageMap['logo.png'] = logoImage;
imageMap['images/logo.png'] = logoImage;

/**
 * Função para obter a imagem importada corretamente
 * @param imagePath Caminho da imagem (nome do arquivo ou URL)
 * @param fallbackImage Imagem padrão caso a principal não seja encontrada
 * @returns Caminho da imagem otimizada ou fallback
 */
export function getImageSource(imagePath: string | undefined, fallbackImage: string = 'images/default-attraction.jpg') {
  if (!imagePath) {
    return imageMap[fallbackImage] || defaultAttraction;
  }

  // Se for uma URL externa ou base64, retorna o caminho diretamente
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  // Verifica diretamente no mapa de imagens
  if (imageMap[imagePath]) {
    return imageMap[imagePath];
  }

  // Normaliza caminho para garantir compatibilidade
  const normalizeImagePath = (path: string) => {
    if (path.includes('src/assets/images/')) {
      return 'images/' + path.split('/').pop();
    }

    if (path.startsWith('images/')) {
      return path;
    }

    if (path.startsWith('/images/')) {
      return path.substring(1);
    }

    return 'images/' + path.split('/').pop();
  };

  // Tenta encontrar a imagem com diferentes formatos de caminho
  const attemptPaths = [
    imagePath,
    normalizeImagePath(imagePath),
    imagePath.replace('src/', ''),
    imagePath.startsWith('/') ? imagePath.substring(1) : imagePath
  ];

  for (const path of attemptPaths) {
    if (imageMap[path]) {
      return imageMap[path];
    }
  }

  // Log de erro em ambiente de desenvolvimento
  if (import.meta.env.DEV) {
    console.warn(`Imagem não encontrada: ${imagePath}, usando fallback.`);
  }

  // Retorna a imagem padrão
  return imageMap[fallbackImage] || defaultAttraction;
}
