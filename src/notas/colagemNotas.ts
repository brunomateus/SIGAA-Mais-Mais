import { aplicarPlano } from "./aplicacaoNotas";
import { descreverPreenchimento, mostrarAvisoNotas } from "./avisoNotas";
import type { DialogoDeColagem } from "./dialogoColagem";
import {
  encontrarTabelaNotas,
  lerUnidades,
  listarAlunosNaTela,
} from "./telaLancarNotas";

const ID_BOTAO_COLAR = "sigga-colar-notas";

export interface DependenciasColagemNotas {
  documento: Document;
  dialogo: DialogoDeColagem;
}

/**
 * Colar notas da planilha na tela Lançar Notas: insere o botão acima da tabela,
 * conduz o diálogo e preenche os campos sem salvar. Quem salva é o docente, pelo
 * botão Salvar do SIGAA; "Finalizar (Consolidar)" nunca é tocado.
 *
 * @example
 * new ColagemDeNotas({ documento: document, dialogo }).iniciar();
 */
export class ColagemDeNotas {
  private readonly dependencias: DependenciasColagemNotas;

  constructor(dependencias: DependenciasColagemNotas) {
    this.dependencias = dependencias;
  }

  iniciar(): void {
    const { documento } = this.dependencias;
    const tabela = encontrarTabelaNotas(documento);
    if (!tabela || documento.getElementById(ID_BOTAO_COLAR)) return;
    const botao = documento.createElement("button");
    botao.id = ID_BOTAO_COLAR;
    botao.type = "button";
    botao.textContent = "Colar notas da planilha";
    Object.assign(botao.style, {
      margin: "8px 0",
      padding: "6px 14px",
      fontSize: "14px",
      borderRadius: "4px",
      cursor: "pointer",
      border: "1px solid #1b3a5c",
      background: "#1b3a5c",
      color: "#fff",
    });
    botao.addEventListener("click", () => void this.colar(tabela));
    tabela.before(botao);
  }

  // A tela é lida no clique: o docente pode ter digitado notas depois de abri-la
  private async colar(tabela: HTMLTableElement): Promise<void> {
    const contexto = {
      alunos: listarAlunosNaTela(tabela),
      unidades: lerUnidades(tabela),
    };
    const plano = await this.dependencias.dialogo.obterPlano(contexto);
    if (!plano) return;
    const resultado = aplicarPlano(plano);
    mostrarAvisoNotas(
      tabela,
      descreverPreenchimento(plano, resultado),
      resultado.desfazer,
    );
  }
}
