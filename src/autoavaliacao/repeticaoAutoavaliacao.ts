import { criarAviso } from "../comum/aviso";
import { criarBotaoAtalho } from "../comum/barraAtalhosTurma";
import {
  type AutoavaliacaoGuardada,
  RepositorioDeAutoavaliacao,
} from "./autoavaliacaoGuardada";
import {
  encontrarFormularioAutoavaliacao,
  estaCompleto,
  lerRespostas,
  type FormularioAutoavaliacao,
} from "./formularioAutoavaliacao";
import {
  descreverCopia,
  preencherAutoavaliacao,
} from "./preenchimentoAutoavaliacao";

export interface DependenciasRepeticao {
  documento: Document;
  guardadas: RepositorioDeAutoavaliacao;
  agora: () => number;
}

const ID_PAINEL = "sigga-repetir-autoavaliacao";
const ID_AVISO = "sigga-aviso-autoavaliacao";

const ESTILO_PAINEL: Partial<CSSStyleDeclaration> = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  margin: "12px 0",
};

/**
 * Repete a autoavaliação do docente entre turmas: guarda as respostas ao salvar
 * uma autoavaliação completa e, no formulário de outra turma, oferece preenchê-lo
 * com elas. Nunca salva: o docente revisa e clica em Salvar.
 *
 * @example
 * void new RepeticaoDeAutoavaliacao({ documento: document, guardadas, agora: Date.now }).iniciar();
 */
export class RepeticaoDeAutoavaliacao {
  private readonly dependencias: DependenciasRepeticao;

  constructor(dependencias: DependenciasRepeticao) {
    this.dependencias = dependencias;
  }

  async iniciar(): Promise<void> {
    const formulario = encontrarFormularioAutoavaliacao(
      this.dependencias.documento,
    );
    if (!formulario) return;
    this.guardarAoSalvar(formulario);
    const guardada = await this.dependencias.guardadas.ler();
    if (guardada) this.mostrarPainel(formulario, guardada);
  }

  // Em captura, antes do jsfcljs do link enviar o formulário e trocar de página
  private guardarAoSalvar(formulario: FormularioAutoavaliacao): void {
    const { documento, guardadas, agora } = this.dependencias;
    const botao = formulario.botaoSalvar;
    if (!botao) return;
    const aoClicar = (evento: Event): void => {
      if (!botao.contains(evento.target as Node | null)) return;
      if (!estaCompleto(formulario)) return;
      const respostas = lerRespostas(formulario);
      void guardadas.guardar({
        turma: formulario.turma,
        respostas,
        guardadaEm: agora(),
      });
    };
    documento.addEventListener("click", aoClicar, true);
  }

  private mostrarPainel(
    formulario: FormularioAutoavaliacao,
    guardada: AutoavaliacaoGuardada,
  ): void {
    const { documento } = this.dependencias;
    const painel = documento.createElement("div");
    painel.id = ID_PAINEL;
    Object.assign(painel.style, ESTILO_PAINEL);
    if (guardada.turma.rotulo !== formulario.turma.rotulo)
      painel.append(this.botaoPreencher(formulario, guardada));
    painel.append(this.botaoEsquecer(painel));
    formulario.cabecalho.after(painel);
  }

  private botaoPreencher(
    formulario: FormularioAutoavaliacao,
    guardada: AutoavaliacaoGuardada,
  ): HTMLButtonElement {
    const { documento } = this.dependencias;
    const texto = `Preencher com as respostas de ${guardada.turma.rotulo}`;
    return criarBotaoAtalho(documento, texto, "principal", () => {
      const resultado = preencherAutoavaliacao(formulario, guardada.respostas);
      this.avisar(descreverCopia(resultado));
    });
  }

  private botaoEsquecer(painel: HTMLElement): HTMLButtonElement {
    const { documento, guardadas } = this.dependencias;
    const texto = "Esquecer respostas guardadas";
    return criarBotaoAtalho(documento, texto, "secundario", () => {
      void guardadas.esquecer();
      this.avisar("Respostas guardadas esquecidas.");
      painel.replaceChildren();
    });
  }

  private avisar(texto: string): void {
    const { documento } = this.dependencias;
    documento.getElementById(ID_AVISO)?.remove();
    documento
      .getElementById(ID_PAINEL)
      ?.after(criarAviso(documento, ID_AVISO, texto));
  }
}
