export interface VinculoDaPagina {
  rotulo: string;
  inativo?: boolean;
}

export interface PaginaVinculos {
  documento: Document;
  links: HTMLAnchorElement[];
  /** Rótulos dos vínculos cujo clique chegou ao link, como faria o onclick do SIGAA. */
  navegacoes: string[];
}

/**
 * Monta, num documento novo e isolado, uma imitação da tela vinculos.jsf com a
 * mesma estrutura usada pelos seletores: `ul li a > span.col-xs-2` + `span.col-xs-6`.
 */
export function montarPaginaVinculos(
  vinculos: VinculoDaPagina[],
): PaginaVinculos {
  const documento = document.implementation.createHTMLDocument("vinculos.jsf");
  const lista = documento.createElement("ul");
  const navegacoes: string[] = [];
  const links = vinculos.map((v) => criarItem(documento, lista, v, navegacoes));
  documento.body.appendChild(lista);
  return { documento, links, navegacoes };
}

function criarItem(
  documento: Document,
  lista: HTMLUListElement,
  vinculo: VinculoDaPagina,
  navegacoes: string[],
): HTMLAnchorElement {
  const item = documento.createElement("li");
  if (vinculo.inativo) item.classList.add("disabled");
  item.innerHTML = `<a href="#"><span class="col-xs-2">${vinculo.rotulo}</span><span class="col-xs-6">detalhes</span></a>`;
  const link = item.querySelector("a")!;
  link.addEventListener("click", (e) => {
    e.preventDefault();
    navegacoes.push(vinculo.rotulo);
  });
  lista.appendChild(item);
  return link;
}

/** Aguarda as Promises pendentes (storage, confirmação) se resolverem. */
export function aguardarTarefasPendentes(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
