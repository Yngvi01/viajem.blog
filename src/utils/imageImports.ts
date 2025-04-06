import type { ImageMetadata } from 'astro';

// Importação direta de imagens essenciais
import defaultAttraction from '../assets/images/default-attraction.jpg';
import defaultImage from '../assets/images/default-image.jpg';
import logoImage from '../assets/images/logo.png';

// Importação automática de todas as imagens em src/assets/images
const imageModules = import.meta.glob('../assets/images/**/*.{png,jpg,jpeg,gif,webp,avif,svg}', { eager: true });

// Mapeamento de imagens
const imageMap: Record<string, ImageMetadata> = {};

// Preenche o mapa automaticamente
Object.entries(imageModules).forEach(([path, module]) => {
  const normalizedPath = path.replace('../assets/', '');
  const image = (module as any).default;

  imageMap[normalizedPath] = image;

  if (normalizedPath.startsWith('images/')) {
    const withoutPrefix = normalizedPath.replace('images/', '');
    imageMap[withoutPrefix] = image;
  }
});

// Imagens padrão garantidas
imageMap['images/default-attraction.jpg'] = defaultAttraction;
imageMap['images/default-image.jpg'] = defaultImage;
imageMap['logo.png'] = logoImage;
imageMap['images/logo.png'] = logoImage;

/**
 * Retorna uma imagem do sistema de importação estática ou externa
 * @param imagePath Caminho ou objeto da imagem
 * @param fallback Fallback em caso de imagem inválida
 * @returns Caminho da imagem otimizada (ImageMetadata ou string)
 */
export function getImageSource(
  imagePath?: string | ImageMetadata,
  fallback?: string | ImageMetadata
): string | ImageMetadata {
  // Se já for uma imagem processada
  if (typeof imagePath === 'object' && imagePath?.src) return imagePath;
  if (typeof fallback === 'object' && fallback?.src) return fallback;

  // Se for externa ou base64
  if (typeof imagePath === 'string' && (imagePath.startsWith('http') || imagePath.startsWith('data:'))) {
    return imagePath;
  }

  const resolvePath = (path: string): ImageMetadata | undefined => {
    if (imageMap[path]) return imageMap[path];

    const normalized = path.replace(/^\/?src\/assets\/images\//, 'images/');
    const short = path.split('/').pop();
    const attempts = [path, normalized, `images/${short}`, short];

    for (const key of attempts) {
      if (key && imageMap[key]) return imageMap[key];
    }
    
    return undefined;
  };

  const resolvedImage = imagePath && typeof imagePath === 'string' ? resolvePath(imagePath) : undefined;
  const resolvedFallback = fallback && typeof fallback === 'string' ? resolvePath(fallback) : defaultAttraction;

  if (!resolvedImage && import.meta.env.DEV && imagePath) {
    console.warn(`Imagem não encontrada: ${imagePath}, usando fallback.`);
  }

  return resolvedImage ?? resolvedFallback ?? defaultAttraction;

  
}
