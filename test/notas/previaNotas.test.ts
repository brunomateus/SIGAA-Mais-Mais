import { describe, expect, it } from "vitest";
import { interpretarPlanilhaColada } from "../../src/notas/planilhaColada";
import { planejarPreenchimento } from "../../src/notas/planoPreenchimento";
import { descreverAlteracao, montarPrevia } from "../../src/notas/previaNotas";
import { listarAlunosNaTela } from "../../src/notas/telaLancarNotas";
import {
  criarAlunosSimulados,
  montarTelaLancarNotas,
  tabelaDeNotas,
} from "../suporte/telaLancarNotas";

function planejar(linhas: string[]) {
  const alunos = listarAlunosNaTela(
    tabelaDeNotas(montarTelaLancarNotas(criarAlunosSimulados(2))),
  );
  const matriculas = new Set(alunos.map((a) => a.matricula));
  const planilha = interpretarPlanilhaColada(
    ["Matrícula\tU1\tU2\tAF", ...linhas].join("\n"),
    matriculas,
  )!;
  return planejarPreenchimento({
    alunos,
    unidades: [1, 2],
    planilha,
    associacao: { unidades: [1, 2], avaliacaoFinal: 3 },
  });
}

describe("descreverAlteracao", () => {
  it("mostra o valor da planilha quando a nota foi truncada", () => {
    const [alteracao] = planejar(["500001\t7,39\t\t"]).alteracoes;
    expect(descreverAlteracao(alteracao!)).toBe(
      "Unid. 1: — → 7,3 (planilha: 7,39)",
    );
  });

  it("não repete o valor da planilha quando só mudou o formato", () => {
    const [alteracao] = planejar(["500001\t7\t\t"]).alteracoes;
    expect(descreverAlteracao(alteracao!)).toBe("Unid. 1: — → 7,0");
  });

  it("avisa que a avaliação final depende da situação do aluno", () => {
    const [alteracao] = planejar(["500001\t\t\t8"]).alteracoes;
    expect(descreverAlteracao(alteracao!)).toBe(
      "Avaliação final: — → 8,0, se o aluno ficar em avaliação final",
    );
  });
});

describe("montarPrevia", () => {
  it("agrupa as notas por aluno e mostra só as seções com itens", () => {
    const plano = planejar(["500001\t7\t8\t", "999999\t5\t5\t"]);
    const titulos = montarPrevia(document, plano)
      .filter((e) => e.tagName === "H4")
      .map((e) => e.textContent);
    expect(titulos).toEqual([
      "Notas a preencher (1)",
      "Matrículas da planilha que não estão na turma (1)",
      "Alunos da turma sem linha na planilha (1)",
    ]);
    const [, lista] = montarPrevia(document, plano);
    expect(lista!.textContent).toBe(
      "ALUNO FICTÍCIO 1 (500001): Unid. 1: — → 7,0; Unid. 2: — → 8,0",
    );
  });
});
