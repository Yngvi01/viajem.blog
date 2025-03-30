import YukinaConfig from "../../yukina.config";

// Armazenar a instância CryptoJS após ser carregada
let CryptoJS: any = null;

// Carregar CryptoJS sob demanda quando necessário
const loadCryptoJS = async () => {
  if (!CryptoJS) {
    try {
      const module = await import("crypto-js");
      CryptoJS = module.default;
    } catch (error) {
      console.warn("Erro ao carregar CryptoJS:", error);
    }
  }
  return CryptoJS;
};

// Pré-carregar CryptoJS se estiver em modo HASH
if (YukinaConfig.slugMode === "HASH") {
  loadCryptoJS();
}

/**
 * Converte um slug fornecido para um slug hasheado ou retorna o slug bruto
 * com base na configuração.
 * Versão síncrona, usada principalmente por getStaticPaths.
 *
 * @param slug - O slug de entrada.
 * @returns O slug hasheado se a configuração for "HASH" e CryptoJS estiver disponível, caso contrário, o slug bruto.
 */
export function IdToSlug(slug: string): string {
  switch (YukinaConfig.slugMode) {
    case "HASH": {
      if (CryptoJS) {
        const hash = CryptoJS.SHA256(slug);
        const hasedSlug = hash.toString(CryptoJS.enc.Hex).slice(0, 8);
        return hasedSlug;
      } else {
        // Se CryptoJS não estiver disponível, usar slug bruto
        // Também inicia o carregamento para uso futuro
        loadCryptoJS();
        return slug;
      }
    }
    case "RAW":
    default:
      return slug;
  }
}

/**
 * Versão assíncrona de IdToSlug que espera o carregamento de CryptoJS.
 * Ideal para uso em contextos não-críticos onde a espera é aceitável.
 * 
 * @param slug - O slug de entrada.
 * @returns Uma Promise com o slug hasheado ou o slug bruto.
 */
export async function IdToSlugAsync(slug: string): Promise<string> {
  switch (YukinaConfig.slugMode) {
    case "HASH": {
      try {
        const crypto = await loadCryptoJS();
        if (crypto) {
          const hash = crypto.SHA256(slug);
          const hasedSlug = hash.toString(crypto.enc.Hex).slice(0, 8);
          return hasedSlug;
        }
        return slug;
      } catch (error) {
        console.warn("Erro ao gerar hash para slug:", error);
        return slug;
      }
    }
    case "RAW":
    default:
      return slug;
  }
}

/**
 * Calcula um índice a partir de uma string de ID de slug utilizando um algoritmo de hash personalizado.
 *
 * Cada caractere é convertido para seu código ASCII, multiplicado por 31 elevado a uma potência decrescente.
 * O somatório é então reduzido pelo comprimento da lista. O índice retornado estará no intervalo [0, listLength - 1].
 *
 * @param id - A string de ID do slug a ser hasheada.
 * @param listLength - O comprimento da lista para o qual o índice é calculado.
 * @returns Um índice zero-based dentro da lista.
 */
export function GetIndexFromSlugID(id: string, listLength: number): number {
  let hashValue = 0;
  for (let i = 0; i < id.length; i++) {
    hashValue += id.charCodeAt(i) * 31 ** (id.length - 1 - i);
  }
  const index = hashValue % listLength;
  return index;
}
