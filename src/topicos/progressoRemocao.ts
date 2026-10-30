import { estilizarBotaoDialogo } from "../comum/dialogo";
import type { AcompanhamentoRemocao } from "./removedorTopicos";

/** Acompanhamento exibido na tela, que também avisa quando a página vai recarregar. */
export interface AcompanhamentoNaTela extends AcompanhamentoRemocao {
  finalizar(): void;
}

/**
 * Transforma o diálogo de confirmação em progresso do lote: "Removendo 3 de 12…",
 * barra e botão "Parar". Esc não fecha o diálogo enquanto o lote roda.
 *
 * @example
 * const progresso = new ProgressoNoDialogo(dialogo, 12);
 * progresso.atualizar(2); // "Removendo 3 de 12…"
 */
export class ProgressoNoDialogo implements AcompanhamentoNaTela {
  private readonly total: number;
  private readonly texto: HTMLParagraphElement;
  private readonly barra: HTMLProgressElement;
  private readonly botaoParar: HTMLButtonElement;
  private parado = false;

  constructor(dialogo: HTMLDialogElement, total: number) {
    const documento = dialogo.ownerDocument;
    this.total = total;
    this.texto = documento.createElement("p");
    this.barra = documento.createElement("progress");
    this.barra.max = total;
    Object.assign(this.barra.style, { width: "100%", margin: "4px 0 16px" });
    this.botaoParar = this.criarBotaoParar(documento);
    dialogo.addEventListener("cancel", (evento) => evento.preventDefault());
    dialogo.replaceChildren(
      this.criarTitulo(documento),
      this.texto,
      this.barra,
      this.botaoParar,
    );
    this.botaoParar.focus();
  }

  atualizar(concluidos: number): void {
    this.barra.value = concluidos;
    const atual = Math.min(concluidos + 1, this.total);
    this.texto.textContent = this.parado
      ? "Parando após a remoção em andamento…"
      : `Removendo ${atual} de ${this.total}…`;
  }

  foiParado(): boolean {
    return this.parado;
  }

  finalizar(): void {
    this.texto.textContent = "Atualizando a página…";
    this.botaoParar.hidden = true;
  }

  private parar(): void {
    this.parado = true;
    this.botaoParar.disabled = true;
    this.texto.textContent = "Parando após a remoção em andamento…";
  }

  private criarBotaoParar(documento: Document): HTMLButtonElement {
    const botao = documento.createElement("button");
    botao.type = "button";
    botao.textContent = "Parar";
    estilizarBotaoDialogo(botao, "secundario");
    botao.addEventListener("click", () => this.parar());
    return botao;
  }

  private criarTitulo(documento: Document): HTMLHeadingElement {
    const titulo = documento.createElement("h3");
    titulo.textContent = "Removendo tópicos de aula";
    Object.assign(titulo.style, { margin: "0 0 10px", fontSize: "17px" });
    return titulo;
  }
}
