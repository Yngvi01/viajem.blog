// Importação dinâmica de todas as imagens disponíveis
import defaultAttraction from '../images/default-attraction.jpg';
import defaultImage from '../images/default-image.jpg';
import logoImage from '../images/logo.png';

// Importação automática de todas as imagens na pasta src/images
const imageModules = import.meta.glob('../images/**/*.{png,jpg,jpeg,gif,webp,avif,svg}', { eager: true });

// Mapa de imagens para acesso rápido
const imageMap: Record<string, any> = {};

// Preenche o mapa de imagens automaticamente
Object.entries(imageModules).forEach(([path, module]) => {
  // Mantém o caminho original para referência interna
  const normalizedPath = path.replace('../', '');
  imageMap[normalizedPath] = (module as any).default;
  
  // Adiciona também versões sem o prefixo 'src/'
  if (normalizedPath.startsWith('images/')) {
    const withoutSrcPrefix = normalizedPath.replace('images/', '');
    imageMap[withoutSrcPrefix] = (module as any).default;
  }
});

// Garante que imagens essenciais estejam sempre disponíveis
imageMap['images/default-attraction.jpg'] = defaultAttraction;
imageMap['images/default-image.jpg'] = defaultImage;
imageMap['logo.png'] = logoImage;
imageMap['images/logo.png'] = logoImage;

/**
 * Função para obter a imagem importada corretamente
 * @param imagePath Caminho da imagem (pode ser um caminho relativo ou URL)
 * @param fallbackImage Imagem padrão a ser usada se a imagem principal não for encontrada
 * @returns A imagem importada ou o caminho original se for uma URL externa
 */
export function getImageSource(imagePath: string | undefined, fallbackImage: string = 'images/default-attraction.jpg') {
  if (!imagePath) {
    return imageMap[fallbackImage] || defaultAttraction;
  }
  
  // Se for uma URL externa, retorna o caminho diretamente
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Verificação direta no mapa de imagens 
  if (imageMap[imagePath]) {
    return imageMap[imagePath];
  }
  
  // Função auxiliar para extrair o nome do arquivo de um caminho
  const extractImageName = (path: string) => {
    return path.split('/').pop() || '';
  };
  
  // Função auxiliar para normalizar o caminho para o formato 'images/nome-do-arquivo'
  const normalizeToImagesPath = (path: string) => {
    // Se o caminho já contém 'src/images/', extraímos apenas o nome do arquivo
    if (path.includes('src/images/')) {
      return 'images/' + extractImageName(path);
    }
    
    // Se o caminho já começa com 'images/', retornamos como está
    if (path.startsWith('images/')) {
      return path;
    }
    
    // Se o caminho começa com '/images/', removemos a barra inicial
    if (path.startsWith('/images/')) {
      return path.substring(1);
    }
    
    // Para outros casos, tentamos normalizar removendo prefixos comuns
    return path
      .replace('/posts/', '/')
      .replace('src/', '')
      .replace(/^\//, ''); // Remove a barra inicial se existir
  };
  
  // Lista de tentativas de normalização de caminho para encontrar a imagem
  const attemptPaths = [
    imagePath,
    'images/' + extractImageName(imagePath),
    normalizeToImagesPath(imagePath),
    imagePath.replace('src/', ''),
    imagePath.startsWith('/') ? imagePath.substring(1) : imagePath
  ];
  
  // Tenta cada uma das opções de caminho
  for (const path of attemptPaths) {
    if (path in imageMap) {
      return imageMap[path];
    }
  }
  
  // Log para debug (apenas em desenvolvimento)
  if (import.meta.env.DEV) {
    console.log(`Imagem não encontrada: ${imagePath}, usando imagem padrão.`);
  }
  
  // Fallback para imagem padrão
  return imageMap[fallbackImage] || defaultAttraction;
}