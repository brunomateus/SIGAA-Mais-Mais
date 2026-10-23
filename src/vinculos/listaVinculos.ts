import { FAVORITO_AUTOMATICO } from "../comum/favorito";
import { normalizarRotulo } from "../comum/texto";

/** Um vínculo da tela vinculos.jsf. Ativos e inativos (encerrados) são tratados igualmente. */
export interface Vinculo {
  link: HTMLAnchorElement;
  rotulo: string;
}

/**
 * Lista os vínculos da página: links de lista cujo primeiro `span.col-xs-2` traz o rótulo.
 *
 * @example
 * const vinculos = encontrarVinculos(document); // [{ link, rotulo: "Servidor" }, ...]
 */
export function encontrarVinculos(raiz: ParentNode): Vinculo[] {
  const links = [...raiz.querySelectorAll<HTMLAnchorElement>("ul li a")];
  return links.flatMap((link) => {
    const rotulo = link.querySelector("span.col-xs-2")?.textContent?.trim();
    return rotulo ? [{ link, rotulo }] : [];
  });
}

/**
 * Decide em qual vínculo entrar sem perguntar: o favorito, ou o único vínculo da
 * tela no modo automático. Retorna `undefined` quando o usuário deve escolher.
 *
 * @example
 * selecionarVinculoAutomatico(vinculos, "servidor")?.link.click();
 */
export function selecionarVinculoAutomatico(
  vinculos: Vinculo[],
  favorito: string | undefined,
): Vinculo | undefined {
  if (!favorito) return undefined;
  if (favorito === FAVORITO_AUTOMATICO)
    return vinculos.length === 1 ? vinculos[0] : undefined;
  return vinculos.find(
    (v) => normalizarRotulo(v.rotulo) === normalizarRotulo(favorito),
  );
}

/**
 * Encontra o vínculo cujo link contém `alvo` (ex.: o `target` de um clique num `span` interno).
 *
 * @example
 * document.addEventListener("click", (e) => console.log(vinculoQueContem(vinculos, e.target)));
 */
export function vinculoQueContem(
  vinculos: Vinculo[],
  alvo: EventTarget | null,
): Vinculo | undefined {
  if (!(alvo instanceof Node)) return undefined;
  return vinculos.find((v) => v.link.contains(alvo));
}
