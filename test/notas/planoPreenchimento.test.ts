import { describe, expect, it } from "vitest";
import {
  interpretarPlanilhaColada,
  type AssociacaoDeColunas,
} from "../../src/notas/planilhaColada";
import {
  planejarPreenchimento,
  rotularAlvo,
} from "../../src/notas/planoPreenchimento";
import { listarAlunosNaTela } from "../../src/notas/telaLancarNotas";
import {
  criarAlunosSimulados,
  montarTelaLancarNotas,
  tabelaDeNotas,
  type AlunoSimulado,
} from "../suporte/telaLancarNotas";

// Planilha colada com as colunas Matrícula, U1, U2, AF
function planejar(
  alunosSimulados: AlunoSimulado[],
  linhas: string[],
  associacao: AssociacaoDeColunas = { unidades: [1, 2], avaliacaoFinal: 3 },
) {
  const tela = montarTelaLancarNotas(alunosSimulados);
  const alunos = listarAlunosNaTela(tabelaDeNotas(tela));
  const texto = ["Matrícula\tU1\tU2\tAF", ...linhas].join("\n");
  const matriculas = new Set(alunos.map((a) => a.matricula));
  const planilha = interpretarPlanilhaColada(texto, matriculas)!;
  return planejarPreenchimento({
    alunos,
    unidades: [1, 2],
    planilha,
    associacao,
  });
}

function resumir(plano: ReturnType<typeof planejar>) {
  return plano.alteracoes.map(
    (a) =>
      `${a.aluno.matricula} ${rotularAlvo(a.alvo)}: ${a.anterior || "—"} → ${a.nova}`,
  );
}

describe("planejarPreenchimento", () => {
  it("planeja uma alteração por nota nova, com o valor anterior", () => {
    const alunos = criarAlunosSimulados(2);
    alunos[1]!.notas = ["5,0", ""];
    const plano = planejar(alunos, ["500001\t7\t8,5\t", "500002\t6\t9\t"]);
    expect(resumir(plano)).toEqual([
      "500001 Unid. 1: — → 7,0",
      "500001 Unid. 2: — → 8,5",
      "500002 Unid. 1: 5,0 → 6,0",
      "500002 Unid. 2: — → 9,0",
    ]);
  });

  it("célula vazia não apaga, e nota igual à do SIGAA não gera alteração", () => {
    const alunos = criarAlunosSimulados(1);
    alunos[0]!.notas = ["7", "8,0"];
    expect(resumir(planejar(alunos, ["500001\t7,0\t\t"]))).toEqual([]);
  });

  it("inclui a avaliação final por último, mesmo com o campo desabilitado", () => {
    const plano = planejar(criarAlunosSimulados(1), ["500001\t5\t5\t8"]);
    expect(resumir(plano).at(-1)).toBe("500001 Avaliação final: — → 8,0");
  });

  it("lista valores inválidos sem gerar alteração", () => {
    const plano = planejar(criarAlunosSimulados(1), ["500001\tF\t11\t"]);
    expect(plano.alteracoes).toEqual([]);
    expect(plano.invalidas.map((i) => rotularAlvo(i.alvo))).toEqual([
      "Unid. 1",
      "Unid. 2",
    ]);
  });

  it("separa matrículas fora da turma, repetidas e alunos sem linha", () => {
    const plano = planejar(criarAlunosSimulados(3), [
      "500001\t7\t7\t",
      "500001\t8\t8\t",
      "500002\t9\t9\t",
      "999999\t5\t5\t",
    ]);
    expect(plano.matriculasForaDaTurma).toEqual(["999999"]);
    expect(plano.matriculasRepetidas).toEqual(["500001"]);
    expect(plano.alunosSemLinha.map((a) => a.matricula)).toEqual(["500003"]);
    expect(resumir(plano)).toEqual([
      "500002 Unid. 1: — → 9,0",
      "500002 Unid. 2: — → 9,0",
    ]);
  });

  it("colunas não associadas não são preenchidas", () => {
    const plano = planejar(criarAlunosSimulados(1), ["500001\t7\t8\t9"], {
      unidades: [undefined, 2],
      avaliacaoFinal: undefined,
    });
    expect(resumir(plano)).toEqual(["500001 Unid. 2: — → 8,0"]);
  });

  it("ignora linhas sem matrícula, como totais ao pé da planilha", () => {
    const plano = planejar(criarAlunosSimulados(1), [
      "500001\t7\t7\t",
      "Média\t7\t7\t",
    ]);
    expect(plano.matriculasForaDaTurma).toEqual([]);
  });
});
