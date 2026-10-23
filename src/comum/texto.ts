/**
 * Normaliza o rótulo de um vínculo para comparação: sem acentos, minúsculo e com
 * espaços colapsados. O favorito é salvo como o texto visível na página, e o SIGAA
 * não é consistente em acentuação, caixa e espaçamento.
 *
 * @example
 * normalizarRotulo("  Docênte  Externo ") === "docente externo"; // true
 */
export function normalizarRotulo(texto: string | null | undefined): string {
  return (texto ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}
