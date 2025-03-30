// Importação dinâmica de todas as imagens disponíveis
import defaultAttraction from '../images/default-attraction.jpg';
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
imageMap['logo.png'] = logoImage;
imageMap['images/logo.png'] = logoImage;

/**
 * Função para obter a imagem importada corretamente
 * @param imagePath Caminho da imagem (pode ser um caminho relativo ou URL)
 * @returns A imagem importada ou o caminho original se for uma URL externa
 */
export function getImageSource(imagePath: string | undefined) {
  if (!imagePath) return defaultAttraction;
  
  // Se for uma URL externa, retorna o caminho diretamente
  if (imagePath && (imagePath.startsWith('http') || imagePath.startsWith('data:'))) {
    return imagePath;
  }
  
  // Verificação direta no mapa de imagens
  if (imagePath && imageMap[imagePath]) {
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
  
  // Tratamento para caminhos absolutos
  if (imagePath.startsWith('/')) {
    // Se o caminho contém '/src/images/', normalizamos para o formato 'images/nome-do-arquivo'
    if (imagePath.includes('/src/images/')) {
      const normalizedPath = normalizeToImagesPath(imagePath);
      if (normalizedPath in imageMap) {
        return imageMap[normalizedPath];
      }
      return '/' + normalizedPath;
    }
    
    // Para outros caminhos absolutos, retornamos como está
    return imagePath;
  }
  
  // Tratamento para caminhos que começam com 'src/images/'
  if (imagePath.startsWith('src/images/')) {
    const normalizedPath = imagePath.replace('src/', '');
    if (normalizedPath in imageMap) {
      return imageMap[normalizedPath];
    }
    return '/' + normalizedPath;
  }
  
  // Tratamento para caminhos que contêm 'src/images/' em qualquer posição
  if (imagePath.includes('src/images/')) {
    const normalizedPath = normalizeToImagesPath(imagePath);
    if (normalizedPath in imageMap) {
      return imageMap[normalizedPath];
    }
    return '/' + normalizedPath;
  }
  
  // Tentativa final: verificar se o caminho existe no mapa após normalização
  const normalizedPath = normalizeToImagesPath(imagePath);
  if (normalizedPath in imageMap) {
    return imageMap[normalizedPath];
  }
  
  // Tenta verificar se existe com o caminho completo (para compatibilidade)
  if (imagePath in imageMap) {
    return imageMap[imagePath];
  }
  
  // Tenta encontrar a imagem removendo barras iniciais
  if (imagePath && imagePath.startsWith('/')) {
    const pathWithoutSlash = imagePath.substring(1);
    if (imageMap[pathWithoutSlash]) {
      return imageMap[pathWithoutSlash];
    }
  }
  
  // Log para debug (apenas em desenvolvimento)
  if (import.meta.env.DEV) {
    console.log(`Imagem não encontrada: ${imagePath}`);
  }
  
  // Fallback para imagem padrão
  return defaultAttraction;
}