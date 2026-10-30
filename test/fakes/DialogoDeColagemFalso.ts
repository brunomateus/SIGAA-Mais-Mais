import type {
  ContextoDaColagem,
  DialogoDeColagem,
} from "../../src/notas/dialogoColagem";
import { planejarPreenchimento } from "../../src/notas/planoPreenchimento";
import type { PlanoDePreenchimento } from "../../src/notas/planoPreenchimento";
import {
  interpretarPlanilhaColada,
  sugerirAssociacao,
} from "../../src/notas/planilhaColada";

/**
 * `DialogoDeColagem` que "cola" `textoColado` e aceita a associação sugerida,
 * como um docente que confirma a prévia sem mudar nada. Com `desistir`, cancela.
 */
export class DialogoDeColagemFalso implements DialogoDeColagem {
  readonly contextos: ContextoDaColagem[] = [];
  textoColado = "";
  desistir = false;

  async obterPlano(
    contexto: ContextoDaColagem,
  ): Promise<PlanoDePreenchimento | undefined> {
    this.contextos.push(contexto);
    if (this.desistir) return undefined;
    const matriculas = new Set(contexto.alunos.map((aluno) => aluno.matricula));
    const planilha = interpretarPlanilhaColada(this.textoColado, matriculas);
    if (!planilha)
      throw new Error(
        `textoColado sem matrículas da turma (${[...matriculas].join(", ")}): ${this.textoColado}`,
      );
    const associacao = sugerirAssociacao(planilha, contexto.unidades);
    return planejarPreenchimento({ ...contexto, planilha, associacao });
  }
}
