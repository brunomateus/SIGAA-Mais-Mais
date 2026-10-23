import { normalizarRotulo } from "../comum/texto";

/**
 * Telas da turma virtual (AVA) envolvidas na chamada. São reconhecidas pelo
 * conteúdo: no JSF, a barra de endereço mostra o destino do formulário anterior,
 * não a tela atual.
 */
export type PaginaAva = "turma" | "subturma" | "calendario" | "outra";

/**
 * Identifica em qual tela da chamada o documento está.
 *
 * @example
 * identificarPaginaAva(document); // "subturma"
 */
export function identificarPaginaAva(documento: Document): PaginaAva {
  if (temLegenda(documento, "selecionar sub-turma")) return "subturma";
  if (documento.querySelector("#calendario table")) return "calendario";
  if (documento.querySelector("#conteudo #formAva")) return "turma";
  return "outra";
}

function temLegenda(documento: Document, trecho: string): boolean {
  return [...documento.querySelectorAll("fieldset > legend")].some((legenda) =>
    normalizarRotulo(legenda.textContent).includes(trecho),
  );
}

/**
 * Localiza o item "Lançar Frequência" do menu Alunos, presente em todas as telas da turma.
 *
 * @example
 * encontrarLinkLancarFrequencia(document)?.click();
 */
export function encontrarLinkLancarFrequencia(
  documento: Document,
): HTMLAnchorElement | undefined {
  return [...documento.querySelectorAll<HTMLAnchorElement>("a")].find(
    (link) =>
      normalizarRotulo(link.querySelector(".itemMenu")?.textContent) ===
      "lancar frequencia",
  );
}

/**
 * Lista os links de seleção (seta) de cada subturma.
 *
 * @example
 * const links = listarLinksSubturmas(document);
 * if (links.length === 1) links[0].click();
 */
export function listarLinksSubturmas(documento: Document): HTMLAnchorElement[] {
  return [
    ...documento.querySelectorAll<HTMLAnchorElement>(
      "table.listing tbody td.icon a",
    ),
  ];
}

/**
 * Localiza no calendário o link da data de aula `data`; sem link, o dia não tem aula.
 *
 * @example
 * encontrarLinkDaData(document, new Date(2026, 9, 19))?.href; // "…form.jsf?dia=19&mes=9&ano=2026"
 */
export function encontrarLinkDaData(
  documento: Document,
  data: Date,
): HTMLAnchorElement | undefined {
  const links = documento.querySelectorAll<HTMLAnchorElement>(
    '#calendario a[href*="FrequenciaAluno/form.jsf?"]',
  );
  return [...links].find((link) => linkApontaPara(link, data));
}

// O SIGAA numera os meses a partir de 0, como Date.getMonth()
function linkApontaPara(link: HTMLAnchorElement, data: Date): boolean {
  const consulta = (link.getAttribute("href") ?? "").split("?")[1] ?? "";
  const parametros = new URLSearchParams(consulta);
  return (
    Number(parametros.get("dia")) === data.getDate() &&
    Number(parametros.get("mes")) === data.getMonth() &&
    Number(parametros.get("ano")) === data.getFullYear()
  );
}
