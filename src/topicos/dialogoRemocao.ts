import { estilizarBotaoDialogo, prepararDialogo } from "../comum/dialogo";
import type { TopicoDeAula } from "./paginaConteudoProgramado";
import {
  ProgressoNoDialogo,
  type AcompanhamentoNaTela,
} from "./progressoRemocao";

/** O diálogo da remoção em lote: confirmação seguida de progresso. */
export interface DialogoDeRemocao {
  /** Resolve true só se o docente confirmar; ao cancelar, o diálogo fecha. */
  confirmar(topicos: TopicoDeAula[]): Promise<boolean>;
  /** Mostra o progresso no lugar da confirmação. */
  acompanhar(total: number): AcompanhamentoNaTela;
}

const ESTILO_LISTA: Partial<CSSStyleDeclaration> = {
  maxHeight: "220px",
  overflowY: "auto",
  margin: "0 0 12px",
  padding: "8px 12px 8px 28px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  fontSize: "13px",
  lineHeight: "1.5",
};

const ESTILO_AVISO: Partial<CSSStyleDeclaration> = {
  margin: "0 0 18px",
  padding: "8px 12px",
  borderRadius: "4px",
  background: "#fdecea",
  color: "#7a1a14",
  fontSize: "13px",
};

/**
 * `DialogoDeRemocao` com um `<dialog>` modal nativo. O foco começa em "Cancelar",
 * porque a ação é destrutiva; Esc cancela a confirmação.
 *
 * @example
 * const dialogo = new DialogoDeRemocaoNativo(document);
 * if (await dialogo.confirmar(topicos)) dialogo.acompanhar(topicos.length);
 */
export class DialogoDeRemocaoNativo implements DialogoDeRemocao {
  private readonly documento: Document;
  private dialogo: HTMLDialogElement | undefined;

  constructor(documento: Document) {
    this.documento = documento;
  }

  confirmar(topicos: TopicoDeAula[]): Promise<boolean> {
    const dialogo = this.abrir();
    const cancelar = this.criarBotao("Cancelar", "secundario");
    const remover = this.criarBotao(`Remover ${topicos.length}`, "perigo");
    dialogo.replaceChildren(
      ...this.criarConteudo(topicos),
      agruparBotoes(cancelar, remover),
    );
    cancelar.focus();
    return new Promise((resolve) => {
      dialogo.addEventListener("close", () => resolve(false), { once: true });
      cancelar.addEventListener("click", () => dialogo.close());
      remover.addEventListener("click", () => resolve(true));
    });
  }

  acompanhar(total: number): AcompanhamentoNaTela {
    return new ProgressoNoDialogo(this.abrir(), total);
  }

  private abrir(): HTMLDialogElement {
    if (this.dialogo?.isConnected) return this.dialogo;
    const dialogo = this.documento.createElement("dialog");
    prepararDialogo(dialogo);
    Object.assign(dialogo.style, { maxWidth: "480px", width: "90%" });
    dialogo.addEventListener("close", () => dialogo.remove());
    this.documento.body.append(dialogo);
    dialogo.showModal();
    this.dialogo = dialogo;
    return dialogo;
  }

  private criarConteudo(topicos: TopicoDeAula[]): HTMLElement[] {
    const plural = topicos.length === 1 ? "tópico de aula" : "tópicos de aula";
    const titulo = this.criarTexto(
      "h3",
      `Remover ${topicos.length} ${plural}?`,
    );
    Object.assign(titulo.style, { margin: "0 0 10px", fontSize: "17px" });
    const lista = this.documento.createElement("ol");
    Object.assign(lista.style, ESTILO_LISTA);
    lista.append(
      ...topicos.map((topico) =>
        this.criarTexto("li", descreverTopico(topico)),
      ),
    );
    const aviso = this.criarTexto(
      "p",
      "Esta ação não pode ser desfeita. Os materiais vinculados a esses tópicos (arquivos, tarefas, fóruns…) também serão removidos.",
    );
    Object.assign(aviso.style, ESTILO_AVISO);
    return [titulo, lista, aviso];
  }

  private criarTexto(tag: "h3" | "li" | "p", texto: string): HTMLElement {
    const elemento = this.documento.createElement(tag);
    elemento.textContent = texto;
    return elemento;
  }

  private criarBotao(
    texto: string,
    variante: "secundario" | "perigo",
  ): HTMLButtonElement {
    const botao = this.documento.createElement("button");
    botao.type = "button";
    botao.textContent = texto;
    estilizarBotaoDialogo(botao, variante);
    return botao;
  }
}

function descreverTopico(topico: TopicoDeAula): string {
  const periodo =
    topico.inicio === topico.fim
      ? topico.inicio
      : `${topico.inicio} a ${topico.fim}`;
  return `${topico.descricao} (${periodo})`;
}

function agruparBotoes(...botoes: HTMLButtonElement[]): HTMLDivElement {
  const grupo = botoes[0]!.ownerDocument.createElement("div");
  Object.assign(grupo.style, {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  });
  grupo.append(...botoes);
  return grupo;
}
