import YukinaConfig from "../../yukina.config";
import CryptoJS from "crypto-js";

/**
 * Converte um slug fornecido para um slug hasheado ou retorna o slug bruto
 * com base na configuração.
 *
 * @param slug - O slug de entrada.
 * @returns O slug hasheado se a configuração for "HASH", caso contrário, o slug bruto.
 */
export function IdToSlug(slug: string): string {
  switch (YukinaConfig.slugMode) {
    case "HASH": {
      const hash = CryptoJS.SHA256(slug);
      const hasedSlug = hash.toString(CryptoJS.enc.Hex).slice(0, 8);
      return hasedSlug;
    }
    case "RAW":
      return slug;
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
