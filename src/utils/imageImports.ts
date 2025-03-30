// Importação dinâmica de todas as imagens disponíveis
import defaultAttraction from '../images/default-attraction.jpg';

// Importação automática de todas as imagens na pasta src/images
const imageModules = import.meta.glob('../images/**/*.{png,jpg,jpeg,gif,webp,avif,svg}', { eager: true });

// Mapa de imagens para acesso rápido
const imageMap: Record<string, any> = {};

// Preenche o mapa de imagens automaticamente
Object.entries(imageModules).forEach(([path, module]) => {
  // Converte o caminho para o formato usado no blog (src/images/...)
  const normalizedPath = path.replace('../', 'src/');
  imageMap[normalizedPath] = (module as any).default;
});

// Garante que a imagem padrão esteja sempre disponível
imageMap['src/images/default-attraction.jpg'] = defaultAttraction;

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
  
  // Verifica se a imagem existe no mapa de importações
  if (imagePath in imageMap) {
    return imageMap[imagePath as keyof typeof imageMap];
  }
  
  // Fallback para imagem padrão
  return defaultAttraction;
}