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
  
  // Se for uma URL externa ou caminho absoluto, retorna o caminho diretamente
  if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
    return imagePath;
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