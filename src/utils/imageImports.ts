// Importação dinâmica de todas as imagens disponíveis
import defaultAttraction from '../images/default-attraction.jpg';

// Importação automática de todas as imagens na pasta src/images
const imageModules = import.meta.glob('../images/**/*.{png,jpg,jpeg,gif,webp,avif,svg}', { eager: true });

// Mapa de imagens para acesso rápido
const imageMap: Record<string, any> = {};

// Preenche o mapa de imagens automaticamente
Object.entries(imageModules).forEach(([path, module]) => {
  // Mantém o caminho original para referência interna
  const normalizedPath = path.replace('../', '');
  imageMap[normalizedPath] = (module as any).default;
});

// Garante que a imagem padrão esteja sempre disponível
imageMap['images/default-attraction.jpg'] = defaultAttraction;

/**
 * Função para obter a imagem importada corretamente
 * @param imagePath Caminho da imagem (pode ser um caminho relativo ou URL)
 * @returns A imagem importada ou o caminho original se for uma URL externa
 */
export function getImageSource(imagePath: string | undefined) {
  if (!imagePath) return defaultAttraction;
  
  // Se for uma URL externa, retorna o caminho diretamente
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Se for um caminho absoluto, corrige para não incluir o prefixo '/posts'
  if (imagePath.startsWith('/')) {
    // Remove o prefixo '/posts' se existir
    if (imagePath.startsWith('/posts/')) {
      imagePath = imagePath.replace('/posts/', '/');
    }
    return imagePath;
  }
  
  // Verifica se o caminho começa com 'src/' e converte para um caminho absoluto
  if (imagePath.startsWith('src/')) {
    // Verifica se o caminho contém 'src/images/'
    if (imagePath.startsWith('src/images/')) {
      // Usa o imageMap para obter a imagem importada diretamente
      const normalizedPath = imagePath.replace('src/', '');
      if (normalizedPath in imageMap) {
        return imageMap[normalizedPath];
      }
      // Se não encontrar no mapa, retorna o caminho absoluto
      return '/' + imagePath;
    } else {
      // Para outros caminhos que começam com 'src/' mas não são imagens
      return '/' + imagePath;
    }
  }
  
  // Normaliza o caminho removendo 'src/' se existir
  const normalizedPath = imagePath.replace('src/', '');
  
  // Verifica se a imagem existe no mapa de importações
  if (normalizedPath in imageMap) {
    return imageMap[normalizedPath];
  }
  
  // Tenta verificar se existe com o caminho completo (para compatibilidade)
  if (imagePath in imageMap) {
    return imageMap[imagePath];
  }
  
  // Log para debug
  console.log(`Imagem não encontrada: ${imagePath}. Caminhos disponíveis:`, Object.keys(imageMap));
  
  // Fallback para imagem padrão
  return defaultAttraction;
}