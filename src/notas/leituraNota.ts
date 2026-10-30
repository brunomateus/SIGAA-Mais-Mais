/** O que uma célula da planilha de notas diz sobre uma nota. */
export type LeituraDeNota =
  | { tipo: "vazia" }
  | { tipo: "valida"; nota: string }
  | { tipo: "invalida"; motivo: string };

const PADRAO_NOTA = /^(\d{1,2})(?:[.,](\d+))?$/;

/**
 * Lê uma nota da planilha no formato do SIGAA ("7,5"): aceita vírgula ou ponto e
 * trunca em uma casa decimal. O corte é feito no texto, pois em ponto flutuante
 * 7,3 × 10 vale 72,999… e um corte numérico daria 7,2.
 *
 * @example
 * lerNota("7.39"); // { tipo: "valida", nota: "7,3" }
 * lerNota("F"); // { tipo: "invalida", motivo: "…" }
 */
export function lerNota(texto: string): LeituraDeNota {
  const limpo = texto.trim();
  if (limpo === "") return { tipo: "vazia" };
  const partes = PADRAO_NOTA.exec(limpo);
  if (!partes)
    return {
      tipo: "invalida",
      motivo: `"${limpo}" não é uma nota; esperado um número de 0 a 10, como 7,5`,
    };
  const inteiro = Number(partes[1]);
  const decimal = (partes[2] ?? "0")[0]!;
  if (inteiro > 10 || (inteiro === 10 && /[1-9]/.test(partes[2] ?? "")))
    return { tipo: "invalida", motivo: `"${limpo}" passa de 10` };
  return { tipo: "valida", nota: `${inteiro},${decimal}` };
}

/**
 * Valor de um campo do SIGAA no mesmo formato de `lerNota`, para comparar.
 *
 * @example
 * normalizarValorDoCampo("7"); // "7,0"
 */
export function normalizarValorDoCampo(valor: string): string {
  const leitura = lerNota(valor);
  return leitura.tipo === "valida" ? leitura.nota : valor.trim();
}
