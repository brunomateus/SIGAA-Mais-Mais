import {
  rotularColuna,
  type AssociacaoDeColunas,
  type PlanilhaColada,
} from "./planilhaColada";

const VALOR_NAO_PREENCHER = "";

/**
 * Listas de escolha "coluna da planilha → coluna do SIGAA": uma por unidade e
 * uma para a avaliação final, já com a sugestão marcada.
 *
 * @example
 * const seletores = new SeletoresDeColunas(document, planilha, [1, 2], sugestao, atualizarPrevia);
 * container.append(seletores.elemento);
 */
export class SeletoresDeColunas {
  readonly elemento: HTMLDivElement;
  private readonly listasUnidades: HTMLSelectElement[];
  private readonly listaAvaliacaoFinal: HTMLSelectElement;

  constructor(
    documento: Document,
    planilha: PlanilhaColada,
    unidades: number[],
    sugestao: AssociacaoDeColunas,
    aoMudar: () => void,
  ) {
    const criar = (
      rotulo: string,
      coluna: number | undefined,
    ): HTMLSelectElement =>
      criarLista(documento, planilha, rotulo, coluna, aoMudar);
    this.listasUnidades = unidades.map((numero, indice) =>
      criar(`Unid. ${numero}`, sugestao.unidades[indice]),
    );
    this.listaAvaliacaoFinal = criar(
      "Avaliação final",
      sugestao.avaliacaoFinal,
    );
    this.elemento = documento.createElement("div");
    Object.assign(this.elemento.style, {
      display: "grid",
      gridTemplateColumns: "max-content 1fr",
      gap: "6px 12px",
      alignItems: "center",
      margin: "8px 0",
      fontSize: "13px",
    });
    for (const lista of [...this.listasUnidades, this.listaAvaliacaoFinal])
      this.elemento.append(criarRotulo(documento, lista), lista);
  }

  associacao(): AssociacaoDeColunas {
    return {
      unidades: this.listasUnidades.map(colunaEscolhida),
      avaliacaoFinal: colunaEscolhida(this.listaAvaliacaoFinal),
    };
  }
}

function colunaEscolhida(lista: HTMLSelectElement): number | undefined {
  return lista.value === VALOR_NAO_PREENCHER ? undefined : Number(lista.value);
}

function criarLista(
  documento: Document,
  planilha: PlanilhaColada,
  rotulo: string,
  sugerida: number | undefined,
  aoMudar: () => void,
): HTMLSelectElement {
  const lista = documento.createElement("select");
  lista.setAttribute("aria-label", rotulo);
  lista.append(criarOpcao(documento, VALOR_NAO_PREENCHER, "— não preencher —"));
  for (let coluna = 0; coluna < planilha.quantidadeColunas; coluna += 1) {
    if (coluna === planilha.colunaMatricula) continue;
    lista.append(
      criarOpcao(documento, String(coluna), descreverColuna(planilha, coluna)),
    );
  }
  lista.value = sugerida === undefined ? VALOR_NAO_PREENCHER : String(sugerida);
  lista.addEventListener("change", aoMudar);
  return lista;
}

// Exemplos ajudam a reconhecer a coluna quando a planilha não tem cabeçalho
function descreverColuna(planilha: PlanilhaColada, coluna: number): string {
  const exemplos = planilha.linhas
    .map((linha) => linha[coluna]?.trim() ?? "")
    .filter((valor) => valor !== "")
    .slice(0, 2);
  const sufixo = exemplos.length > 0 ? ` (ex.: ${exemplos.join(", ")})` : "";
  return `${rotularColuna(planilha, coluna)}${sufixo}`;
}

function criarOpcao(
  documento: Document,
  valor: string,
  texto: string,
): HTMLOptionElement {
  const opcao = documento.createElement("option");
  opcao.value = valor;
  opcao.textContent = texto;
  return opcao;
}

function criarRotulo(
  documento: Document,
  lista: HTMLSelectElement,
): HTMLLabelElement {
  const rotulo = documento.createElement("label");
  rotulo.textContent = lista.getAttribute("aria-label");
  rotulo.style.fontWeight = "bold";
  return rotulo;
}
