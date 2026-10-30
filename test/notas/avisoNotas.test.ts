import { describe, expect, it } from "vitest";
import type { ResultadoPreenchimento } from "../../src/notas/aplicacaoNotas";
import {
  descreverPreenchimento,
  mostrarAvisoNotas,
} from "../../src/notas/avisoNotas";
import type {
  AlteracaoDeNota,
  PlanoDePreenchimento,
} from "../../src/notas/planoPreenchimento";
import type { AlunoNaTela } from "../../src/notas/telaLancarNotas";
import {
  criarAlunosSimulados,
  montarTelaLancarNotas,
  tabelaDeNotas,
} from "../suporte/telaLancarNotas";

// Só a quantidade importa para o resumo
function varios<T>(quantidade: number): T[] {
  return Array.from({ length: quantidade }, () => ({}) as T);
}

function plano(parcial: Partial<PlanoDePreenchimento>): PlanoDePreenchimento {
  return {
    alteracoes: [],
    invalidas: [],
    matriculasForaDaTurma: [],
    matriculasRepetidas: [],
    alunosSemLinha: [],
    ...parcial,
  };
}

function resultado(preenchidas: number, fora = 0): ResultadoPreenchimento {
  return {
    preenchidas: varios<AlteracaoDeNota>(preenchidas),
    foraDaAvaliacaoFinal: varios<AlteracaoDeNota>(fora),
    desfazer: () => {},
  };
}

describe("descreverPreenchimento", () => {
  it("mostra só as partes que aconteceram", () => {
    expect(descreverPreenchimento(plano({}), resultado(28))).toBe(
      "28 notas preenchidas. Revise e clique em Salvar.",
    );
  });

  it("lista o que ficou de fora, no singular e no plural", () => {
    const completo = plano({
      matriculasForaDaTurma: ["1", "2"],
      alunosSemLinha: varios<AlunoNaTela>(1),
      invalidas: varios(3),
      matriculasRepetidas: ["4"],
    });
    expect(descreverPreenchimento(completo, resultado(1, 2))).toBe(
      "1 nota preenchida · 2 matrículas da planilha não estão na turma · 1 aluno da turma sem linha na planilha · 3 valores inválidos · 1 matrícula repetida na planilha · 2 notas de avaliação final ignoradas (alunos fora da avaliação final). Revise e clique em Salvar.",
    );
  });
});

describe("mostrarAvisoNotas", () => {
  it("mostra o resumo acima da tabela e desfaz uma única vez", () => {
    const tabela = tabelaDeNotas(
      montarTelaLancarNotas(criarAlunosSimulados(1)),
    );
    let desfeito = 0;
    mostrarAvisoNotas(tabela, "1 nota preenchida.", () => (desfeito += 1));
    const aviso = tabela.previousElementSibling!;
    expect(aviso.textContent).toContain("1 nota preenchida.");
    aviso.querySelector("button")!.click();
    expect(desfeito).toBe(1);
    expect(aviso.textContent).toContain("Preenchimento desfeito");
    expect(aviso.querySelector("button")).toBeNull();
  });
});
