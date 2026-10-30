import type { LinhaDeTopico, TopicoDeAula } from "./paginaConteudoProgramado";

const ID_BOTAO_REMOVER = "sigga-remover-topicos";
const ID_BARRA = "sigga-barra-remocao-topicos";

// sticky: a barra acompanha a rolagem enquanto a tabela está na tela e, no fim, assenta logo abaixo dela
const ESTILO_BARRA: Partial<CSSStyleDeclaration> = {
  position: "sticky",
  bottom: "0",
  zIndex: "10",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "8px 12px",
  background: "#fff",
  borderTop: "1px solid #ccc",
  boxShadow: "0 -2px 8px rgba(0,0,0,.12)",
  fontSize: "12px",
  color: "#555",
};

const ESTILO_BOTAO: Partial<CSSStyleDeclaration> = {
  padding: "6px 14px",
  fontSize: "14px",
  borderRadius: "4px",
  border: "1px solid #b3261e",
  background: "#fff",
  color: "#b3261e",
  cursor: "pointer",
};

/**
 * Seleção de tópicos de aula na tabela da tela Conteúdo Programado: uma caixa
 * por linha, "selecionar todos" no cabeçalho, Shift+clique para marcar um
 * intervalo e o botão "Remover selecionados (N)" numa barra abaixo da tabela,
 * fixa no rodapé da tela enquanto a tabela estiver visível. A barra só aparece
 * com pelo menos um tópico marcado.
 *
 * @example
 * new SelecaoDeTopicos(tabela, linhas, (topicos) => removerEmLote(topicos)).instalar();
 */
export class SelecaoDeTopicos {
  private readonly tabela: HTMLTableElement;
  private readonly linhas: LinhaDeTopico[];
  private readonly aoRemover: (topicos: TopicoDeAula[]) => void;
  private readonly caixas: HTMLInputElement[] = [];
  private caixaTodos: HTMLInputElement | undefined;
  private botao: HTMLButtonElement | undefined;
  private barra: HTMLDivElement | undefined;
  private ultimoIndiceClicado: number | undefined;

  constructor(
    tabela: HTMLTableElement,
    linhas: LinhaDeTopico[],
    aoRemover: (topicos: TopicoDeAula[]) => void,
  ) {
    this.tabela = tabela;
    this.linhas = linhas;
    this.aoRemover = aoRemover;
  }

  instalar(): void {
    const documento = this.tabela.ownerDocument;
    if (documento.getElementById(ID_BOTAO_REMOVER)) return;
    this.inserirCaixaTodos();
    this.linhas.forEach((linha, indice) =>
      this.inserirCaixaNaLinha(linha, indice),
    );
    this.botao = this.criarBotaoRemover();
    this.barra = this.criarBarra(this.botao);
    this.tabela.after(this.barra);
    this.atualizar();
  }

  /** Os tópicos de aula marcados, na ordem da tabela. */
  selecionados(): TopicoDeAula[] {
    return this.linhas
      .filter((_, indice) => this.caixas[indice]!.checked)
      .map(({ topico }) => topico);
  }

  private inserirCaixaTodos(): void {
    const celula = this.tabela.ownerDocument.createElement("th");
    this.caixaTodos = criarCaixa(celula, "Selecionar todos os tópicos de aula");
    this.caixaTodos.addEventListener("click", () => this.marcarTodas());
    this.tabela.querySelector("thead tr")?.prepend(celula);
  }

  private inserirCaixaNaLinha(
    { topico, linha }: LinhaDeTopico,
    indice: number,
  ): void {
    const celula = this.tabela.ownerDocument.createElement("td");
    const caixa = criarCaixa(celula, `Selecionar “${topico.descricao}”`);
    caixa.addEventListener("click", (evento) =>
      this.aoClicarCaixa(indice, evento),
    );
    this.caixas.push(caixa);
    linha.prepend(celula);
  }

  // O clique nativo já inverteu a caixa; com Shift, o intervalo copia o novo estado
  private aoClicarCaixa(indice: number, evento: MouseEvent): void {
    const anterior = this.ultimoIndiceClicado;
    this.ultimoIndiceClicado = indice;
    if (evento.shiftKey && anterior !== undefined) {
      const [inicio, fim] = [
        Math.min(anterior, indice),
        Math.max(anterior, indice),
      ];
      const marcado = this.caixas[indice]!.checked;
      this.caixas
        .slice(inicio, fim + 1)
        .forEach((caixa) => (caixa.checked = marcado));
    }
    this.atualizar();
  }

  private marcarTodas(): void {
    const marcado = this.caixaTodos!.checked;
    this.caixas.forEach((caixa) => (caixa.checked = marcado));
    this.atualizar();
  }

  private atualizar(): void {
    const quantidade = this.selecionados().length;
    // display, e não o atributo hidden: o display:flex inline venceria o [hidden]
    this.barra!.style.display = quantidade === 0 ? "none" : "flex";
    this.botao!.textContent = `Remover selecionados (${quantidade})`;
    this.caixaTodos!.checked = quantidade === this.caixas.length;
    this.caixaTodos!.indeterminate =
      quantidade > 0 && quantidade < this.caixas.length;
  }

  private criarBarra(botao: HTMLButtonElement): HTMLDivElement {
    const barra = this.tabela.ownerDocument.createElement("div");
    barra.id = ID_BARRA;
    Object.assign(barra.style, ESTILO_BARRA);
    const dica = this.tabela.ownerDocument.createElement("span");
    dica.textContent = "Dica: Shift+clique marca um intervalo de tópicos.";
    barra.append(botao, dica);
    return barra;
  }

  private criarBotaoRemover(): HTMLButtonElement {
    const botao = this.tabela.ownerDocument.createElement("button");
    botao.id = ID_BOTAO_REMOVER;
    botao.type = "button";
    Object.assign(botao.style, ESTILO_BOTAO);
    botao.addEventListener("click", () => this.aoRemover(this.selecionados()));
    return botao;
  }
}

// Sem `name`: a caixa fica de fora dos envios do formulário JSF que contém a tabela
function criarCaixa(celula: HTMLElement, rotulo: string): HTMLInputElement {
  const caixa = celula.ownerDocument.createElement("input");
  caixa.type = "checkbox";
  caixa.setAttribute("aria-label", rotulo);
  caixa.style.cursor = "pointer";
  celula.style.width = "24px";
  celula.append(caixa);
  return caixa;
}
