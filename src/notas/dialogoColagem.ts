import {
  estilizarBotaoDialogo,
  prepararDialogo,
  type VarianteBotao,
} from "../comum/dialogo";
import {
  interpretarPlanilhaColada,
  rotularColuna,
  sugerirAssociacao,
  type PlanilhaColada,
} from "./planilhaColada";
import {
  planejarPreenchimento,
  type PlanoDePreenchimento,
} from "./planoPreenchimento";
import { montarPrevia } from "./previaNotas";
import { SeletoresDeColunas } from "./seletoresColunas";
import type { AlunoNaTela } from "./telaLancarNotas";

/** O que o diálogo precisa saber da tela Lançar Notas. */
export interface ContextoDaColagem {
  alunos: AlunoNaTela[];
  unidades: number[];
}

/** Conduz a colagem até um plano confirmado, ou `undefined` se o docente desistir. */
export interface DialogoDeColagem {
  obterPlano(
    contexto: ContextoDaColagem,
  ): Promise<PlanoDePreenchimento | undefined>;
}

const INSTRUCOES =
  "Na sua planilha, selecione as células com a coluna de matrículas e as colunas de notas (de preferência com a linha de títulos), copie com Ctrl+C e cole abaixo com Ctrl+V.";

const SEM_MATRICULAS =
  "Nenhuma coluna com matrículas desta turma foi encontrada. Copie também a coluna de matrículas.";

/**
 * `DialogoDeColagem` com um `<dialog>` nativo em dois passos: colar as células e,
 * depois, associar as colunas vendo a prévia. Esc ou "Cancelar" desistem.
 *
 * @example
 * const plano = await new DialogoDeColagemNativo(document).obterPlano({ alunos, unidades });
 */
export class DialogoDeColagemNativo implements DialogoDeColagem {
  private readonly documento: Document;
  private dialogo: HTMLDialogElement | undefined;
  private responder: (plano: PlanoDePreenchimento | undefined) => void =
    () => {};

  constructor(documento: Document) {
    this.documento = documento;
  }

  obterPlano(
    contexto: ContextoDaColagem,
  ): Promise<PlanoDePreenchimento | undefined> {
    const dialogo = this.abrir();
    const resposta = new Promise<PlanoDePreenchimento | undefined>(
      (resolve) => {
        this.responder = resolve;
        dialogo.addEventListener("close", () => resolve(undefined), {
          once: true,
        });
      },
    );
    this.mostrarPassoColar(contexto, "");
    return resposta;
  }

  private abrir(): HTMLDialogElement {
    const dialogo = this.documento.createElement("dialog");
    prepararDialogo(dialogo);
    Object.assign(dialogo.style, { maxWidth: "720px", width: "92%" });
    dialogo.addEventListener("close", () => dialogo.remove());
    this.documento.body.append(dialogo);
    dialogo.showModal();
    this.dialogo = dialogo;
    return dialogo;
  }

  private mostrarPassoColar(
    contexto: ContextoDaColagem,
    textoAnterior: string,
  ): void {
    const caixa = this.documento.createElement("textarea");
    caixa.value = textoAnterior;
    caixa.setAttribute("aria-label", "Células copiadas da planilha");
    Object.assign(caixa.style, {
      width: "100%",
      height: "180px",
      boxSizing: "border-box",
      fontFamily: "monospace",
      fontSize: "12px",
    });
    const erro = this.criarTexto("p", "");
    Object.assign(erro.style, {
      color: "#b3261e",
      fontSize: "13px",
      minHeight: "1em",
    });
    const continuar = this.criarBotao("Continuar", "primario", () =>
      this.continuarComTexto(contexto, caixa.value, erro),
    );
    this.mostrar(
      [
        this.criarTitulo("Colar notas da planilha"),
        this.criarTexto("p", INSTRUCOES),
        caixa,
        erro,
      ],
      [this.criarBotaoCancelar(), continuar],
    );
    caixa.focus();
  }

  private continuarComTexto(
    contexto: ContextoDaColagem,
    texto: string,
    erro: HTMLElement,
  ): void {
    const matriculas = new Set(contexto.alunos.map((aluno) => aluno.matricula));
    const planilha = interpretarPlanilhaColada(texto, matriculas);
    if (!planilha) {
      erro.textContent = SEM_MATRICULAS;
      return;
    }
    this.mostrarPassoAssociar(contexto, planilha, texto);
  }

  private mostrarPassoAssociar(
    contexto: ContextoDaColagem,
    planilha: PlanilhaColada,
    texto: string,
  ): void {
    const previa = this.documento.createElement("div");
    const preencher = this.criarBotao("", "primario", () => {
      this.responder(planoAtual());
      this.dialogo?.close();
    });
    const seletores = new SeletoresDeColunas(
      this.documento,
      planilha,
      contexto.unidades,
      sugerirAssociacao(planilha, contexto.unidades),
      () => atualizar(),
    );
    const planoAtual = (): PlanoDePreenchimento =>
      planejarPreenchimento({
        ...contexto,
        planilha,
        associacao: seletores.associacao(),
      });
    const atualizar = (): void => {
      const plano = planoAtual();
      previa.replaceChildren(...montarPrevia(this.documento, plano));
      preencher.textContent = `Preencher ${plano.alteracoes.length} ${plano.alteracoes.length === 1 ? "nota" : "notas"}`;
      preencher.disabled = plano.alteracoes.length === 0;
    };
    const voltar = this.criarBotao("Voltar", "secundario", () =>
      this.mostrarPassoColar(contexto, texto),
    );
    const matricula = this.criarTexto(
      "p",
      `Matrículas lidas da coluna “${rotularColuna(planilha, planilha.colunaMatricula)}”. Escolha a coluna da planilha para cada coluna do SIGAA:`,
    );
    this.mostrar(
      [
        this.criarTitulo("Associar colunas"),
        matricula,
        seletores.elemento,
        previa,
      ],
      [voltar, this.criarBotaoCancelar(), preencher],
    );
    atualizar();
  }

  private mostrar(conteudo: HTMLElement[], botoes: HTMLButtonElement[]): void {
    const grupo = this.documento.createElement("div");
    Object.assign(grupo.style, {
      display: "flex",
      justifyContent: "flex-end",
      gap: "8px",
      marginTop: "12px",
    });
    grupo.append(...botoes);
    this.dialogo!.replaceChildren(...conteudo, grupo);
  }

  private criarBotaoCancelar(): HTMLButtonElement {
    return this.criarBotao("Cancelar", "secundario", () =>
      this.dialogo?.close(),
    );
  }

  private criarBotao(
    texto: string,
    variante: VarianteBotao,
    aoClicar: () => void,
  ): HTMLButtonElement {
    const botao = this.documento.createElement("button");
    botao.type = "button";
    botao.textContent = texto;
    estilizarBotaoDialogo(botao, variante);
    botao.addEventListener("click", aoClicar);
    return botao;
  }

  private criarTitulo(texto: string): HTMLElement {
    const titulo = this.criarTexto("h3", texto);
    Object.assign(titulo.style, { margin: "0 0 10px", fontSize: "17px" });
    return titulo;
  }

  private criarTexto(tag: "h3" | "p", texto: string): HTMLElement {
    const elemento = this.documento.createElement(tag);
    elemento.textContent = texto;
    Object.assign(elemento.style, {
      fontSize: tag === "p" ? "13px" : "",
      lineHeight: "1.4",
    });
    return elemento;
  }
}
