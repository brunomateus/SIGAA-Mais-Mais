import { normalizarRotulo } from "../comum/texto";

/** Um tópico de aula como listado na tela Conteúdo Programado. */
export interface TopicoDeAula {
  /** Identificador do SIGAA, enviado no parâmetro `id` da remoção. */
  id: string;
  descricao: string;
  inicio: string;
  fim: string;
}

/** Um tópico de aula e a linha da tabela que o exibe. */
export interface LinhaDeTopico {
  topico: TopicoDeAula;
  linha: HTMLTableRowElement;
}

// Ex.: …,'form101:cmd,form101:cmd,id,79533231','')
const PADRAO_ID_TOPICO = /,id,(\d+)'/;

/**
 * Localiza o quadro (fieldset) "Conteúdo Programado". Reconhece a tela pelo conteúdo,
 * pois no JSF a barra de endereço mostra o destino do formulário anterior. Sem
 * tópicos, o quadro existe mas não tem tabela.
 *
 * @example
 * encontrarQuadroConteudoProgramado(document) !== undefined; // true na tela
 */
export function encontrarQuadroConteudoProgramado(
  documento: Document,
): HTMLFieldSetElement | undefined {
  const legenda = [...documento.querySelectorAll("fieldset > legend")].find(
    (elemento) =>
      normalizarRotulo(elemento.textContent) === "conteudo programado",
  );
  return (legenda?.parentElement as HTMLFieldSetElement | null) ?? undefined;
}

/**
 * Lista os tópicos de aula da tabela que podem ser removidos (os que têm lixeira).
 *
 * @example
 * listarLinhasTopicos(tabela).map(({ topico }) => topico.descricao); // ["01 - Apresentação", …]
 */
export function listarLinhasTopicos(tabela: HTMLTableElement): LinhaDeTopico[] {
  const linhas = tabela.querySelectorAll<HTMLTableRowElement>("tbody > tr");
  return [...linhas].flatMap((linha) => {
    const id = idDoLinkRemocao(primeiroLinkRemocao(linha));
    return id ? [{ linha, topico: lerTopico(linha, id) }] : [];
  });
}

// As colunas são reconhecidas pela classe: a extensão insere uma coluna de seleção
function lerTopico(linha: HTMLTableRowElement, id: string): TopicoDeAula {
  const texto = (elemento: Element | null | undefined): string =>
    elemento?.textContent?.trim() ?? "";
  const datas = linha.querySelectorAll("td.width75");
  return {
    id,
    descricao: texto(linha.querySelector("td.first")),
    inicio: texto(datas[0]),
    fim: texto(datas[1]),
  };
}

function primeiroLinkRemocao(raiz: ParentNode): HTMLAnchorElement | undefined {
  return linksDeRemocao(raiz)[0];
}

// Só a lixeira pede confirmação antes do jsfcljs
function linksDeRemocao(raiz: ParentNode): HTMLAnchorElement[] {
  return [
    ...raiz.querySelectorAll<HTMLAnchorElement>('a[onclick*="confirm("]'),
  ];
}

function idDoLinkRemocao(
  link: HTMLAnchorElement | undefined,
): string | undefined {
  return PADRAO_ID_TOPICO.exec(link?.getAttribute("onclick") ?? "")?.[1];
}

/**
 * Localiza a lixeira do tópico de aula `id`; ausente se o tópico não está na página.
 *
 * @example
 * encontrarLinkRemocao(document, "79533231");
 */
export function encontrarLinkRemocao(
  raiz: ParentNode,
  id: string,
): HTMLAnchorElement | undefined {
  return linksDeRemocao(raiz).find((link) => idDoLinkRemocao(link) === id);
}
