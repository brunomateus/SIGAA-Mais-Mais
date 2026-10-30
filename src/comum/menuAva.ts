import { normalizarRotulo } from "./texto";

/**
 * Localiza um item do menu lateral da turma virtual pelo rótulo normalizado
 * (sem acentos e em minúsculas). O menu está presente em todas as telas da turma.
 *
 * @example
 * encontrarItemMenuAva(document, "lancar frequencia")?.click();
 */
export function encontrarItemMenuAva(
  documento: Document,
  rotulo: string,
): HTMLAnchorElement | undefined {
  return [...documento.querySelectorAll<HTMLAnchorElement>("a")].find(
    (link) =>
      normalizarRotulo(link.querySelector(".itemMenu")?.textContent) === rotulo,
  );
}
