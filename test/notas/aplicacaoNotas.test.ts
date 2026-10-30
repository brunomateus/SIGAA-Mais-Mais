import { describe, expect, it } from "vitest";
import { aplicarPlano } from "../../src/notas/aplicacaoNotas";
import { interpretarPlanilhaColada } from "../../src/notas/planilhaColada";
import { planejarPreenchimento } from "../../src/notas/planoPreenchimento";
import { listarAlunosNaTela } from "../../src/notas/telaLancarNotas";
import { CalculoDeMediaFalso } from "../fakes/CalculoDeMediaFalso";
import {
  criarAlunosSimulados,
  montarTelaLancarNotas,
  tabelaDeNotas,
  type AlunoSimulado,
} from "../suporte/telaLancarNotas";

function preparar(alunosSimulados: AlunoSimulado[], linhas: string[]) {
  const tela = montarTelaLancarNotas(alunosSimulados);
  const tabela = tabelaDeNotas(tela);
  const calculo = new CalculoDeMediaFalso();
  calculo.instalar(tabela);
  const alunos = listarAlunosNaTela(tabela);
  const matriculas = new Set(alunos.map((a) => a.matricula));
  const planilha = interpretarPlanilhaColada(
    ["Matrícula\tU1\tU2\tAF", ...linhas].join("\n"),
    matriculas,
  )!;
  const associacao = { unidades: [1, 2], avaliacaoFinal: 3 };
  const plano = planejarPreenchimento({
    alunos,
    unidades: [1, 2],
    planilha,
    associacao,
  });
  const valores = (indice: number) => {
    const aluno = alunos[indice]!;
    return [...aluno.camposUnidade, aluno.campoAvaliacaoFinal!].map(
      (c) => c.value,
    );
  };
  return { plano, calculo, alunos, valores };
}

describe("aplicarPlano", () => {
  it("escreve as notas, dispara o recálculo do SIGAA e destaca os campos", () => {
    const { plano, calculo, alunos, valores } = preparar(
      criarAlunosSimulados(1),
      ["500001\t8\t9\t"],
    );
    const resultado = aplicarPlano(plano);
    expect(valores(0)).toEqual(["8,0", "9,0", ""]);
    expect(calculo.recalculos).toEqual(["nota_00", "nota_01"]);
    expect(alunos[0]!.camposUnidade[0]!.style.backgroundColor).not.toBe("");
    expect(resultado.preenchidas).toHaveLength(2);
  });

  it("nunca dispara o blur, que mostraria o alert do SIGAA", () => {
    const { plano, calculo } = preparar(criarAlunosSimulados(1), [
      "500001\t8\t9\t",
    ]);
    aplicarPlano(plano);
    expect(calculo.blurs).toEqual([]);
  });

  it("preenche a avaliação final depois das unidades, quando o SIGAA a habilita", () => {
    const { plano, valores, calculo } = preparar(criarAlunosSimulados(1), [
      "500001\t5\t5\t8",
    ]);
    const resultado = aplicarPlano(plano);
    expect(valores(0)).toEqual(["5,0", "5,0", "8,0"]);
    expect(calculo.recalculos.at(-1)).toBe("recup_0");
    expect(resultado.foraDaAvaliacaoFinal).toEqual([]);
  });

  it("ignora a avaliação final de quem não ficou em avaliação final", () => {
    const { plano, valores } = preparar(criarAlunosSimulados(1), [
      "500001\t9\t9\t8",
    ]);
    const resultado = aplicarPlano(plano);
    expect(valores(0)).toEqual(["9,0", "9,0", ""]);
    expect(resultado.foraDaAvaliacaoFinal.map((a) => a.nova)).toEqual(["8,0"]);
  });

  it("desfazer devolve todos os campos, inclusive a avaliação final apagada pelo recálculo", () => {
    const simulados = criarAlunosSimulados(1);
    simulados[0]!.notas = ["5,0", "5,0"];
    simulados[0]!.avaliacaoFinal = "6,0";
    const { plano, valores, alunos } = preparar(simulados, ["500001\t9\t9\t"]);
    const resultado = aplicarPlano(plano);
    expect(valores(0)).toEqual(["9,0", "9,0", ""]);
    resultado.desfazer();
    expect(valores(0)).toEqual(["5,0", "5,0", "6,0"]);
    expect(alunos[0]!.camposUnidade[0]!.style.backgroundColor).toBe("");
  });
});
