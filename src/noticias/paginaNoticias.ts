import { encontrarItemMenuAva } from "../comum/menuAva";
import { normalizarRotulo } from "../comum/texto";

/**
 * Localiza o item "Notícias" do menu da turma, presente em todas as telas da turma.
 *
 * @example
 * encontrarItemMenuNoticias(document)?.getAttribute("onclick"); // "…jsfcljs(…)…"
 */
export function encontrarItemMenuNoticias(
  documento: Document,
): HTMLAnchorElement | undefined {
  return encontrarItemMenuAva(documento, "noticias");
}

/**
 * Localiza o botão "Cadastrar Notícia" do quadro "Notícias" da listagem. O painel
 * lateral de notícias da turma não é um quadro (fieldset) e fica de fora.
 *
 * @example
 * encontrarLinkCadastrarNoticia(listagem)?.textContent; // "Cadastrar Notícia"
 */
export function encontrarLinkCadastrarNoticia(
  documento: Document,
): HTMLAnchorElement | undefined {
  const quadro = [...documento.querySelectorAll("fieldset > legend")].find(
    (legenda) => normalizarRotulo(legenda.textContent) === "noticias",
  )?.parentElement;
  const links = quadro?.querySelectorAll<HTMLAnchorElement>("a") ?? [];
  return [...links].find(
    (link) => normalizarRotulo(link.textContent) === "cadastrar noticia",
  );
}
