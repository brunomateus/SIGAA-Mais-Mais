import { describe, expect, it } from "vitest";
import {
  interpretarPlanilhaColada,
  rotularColuna,
  sugerirAssociacao,
} from "../../src/notas/planilhaColada";

const TURMA = new Set(["500001", "500002"]);

describe("interpretarPlanilhaColada", () => {
  it("acha a coluna de matrículas e separa o cabeçalho", () => {
    const planilha = interpretarPlanilhaColada(
      "Nome\tMatrícula\tU1\nA\t500001\t7\nB\t500002\t8",
      TURMA,
    );
    expect(planilha).toEqual({
      cabecalho: ["Nome", "Matrícula", "U1"],
      linhas: [
        ["A", "500001", "7"],
        ["B", "500002", "8"],
      ],
      colunaMatricula: 1,
      quantidadeColunas: 3,
    });
  });

  it("sem cabeçalho, quando a primeira linha já é de um aluno", () => {
    const planilha = interpretarPlanilhaColada("500001\t7\n500002\t8", TURMA);
    expect(planilha?.cabecalho).toBeUndefined();
    expect(planilha?.linhas).toHaveLength(2);
  });

  it("reconhece matrículas que a planilha perdeu os zeros à esquerda ou formatou", () => {
    const planilha = interpretarPlanilhaColada(
      "500.001\t7",
      new Set(["500001"]),
    );
    expect(planilha?.colunaMatricula).toBe(0);
  });

  it("sem nenhuma matrícula da turma, devolve undefined", () => {
    expect(interpretarPlanilhaColada("Nome\tU1\nA\t7", TURMA)).toBeUndefined();
  });
});

describe("rotularColuna", () => {
  it("usa o cabeçalho, ou a letra da coluna sem ele", () => {
    const comCabecalho = interpretarPlanilhaColada(
      "Mat\tU1\n500001\t7",
      TURMA,
    )!;
    const semCabecalho = interpretarPlanilhaColada("500001\t7", TURMA)!;
    expect(rotularColuna(comCabecalho, 1)).toBe("U1");
    expect(rotularColuna(semCabecalho, 1)).toBe("Coluna B");
    expect(rotularColuna(semCabecalho, 27)).toBe("Coluna AB");
  });
});

describe("sugerirAssociacao", () => {
  it.each([
    "Unid. 1",
    "Unidade 1",
    "unid1",
    "U1",
    "N1",
    "Nota 1",
    "AP1",
    "AV 01",
  ])("reconhece %s como a Unid. 1", (titulo) => {
    const planilha = interpretarPlanilhaColada(
      `Matrícula\t${titulo}\n500001\t7`,
      TURMA,
    )!;
    expect(sugerirAssociacao(planilha, [1]).unidades).toEqual([1]);
  });

  it("associa quantas unidades a turma tiver e a avaliação final", () => {
    const planilha = interpretarPlanilhaColada(
      "Matrícula\tNome\tU3\tU1\tU2\tAvaliação Final\n500001\tA\t5\t6\t7\t8",
      TURMA,
    )!;
    expect(sugerirAssociacao(planilha, [1, 2, 3])).toEqual({
      unidades: [3, 4, 2],
      avaliacaoFinal: 5,
    });
  });

  it.each(["AF", "Nota Final", "Recuperação", "Final"])(
    "reconhece %s como avaliação final",
    (titulo) => {
      const planilha = interpretarPlanilhaColada(
        `Matrícula\t${titulo}\n500001\t7`,
        TURMA,
      )!;
      expect(sugerirAssociacao(planilha, [1]).avaliacaoFinal).toBe(1);
    },
  );

  it("sem cabeçalho, não sugere nada", () => {
    const planilha = interpretarPlanilhaColada("500001\t7\t8", TURMA)!;
    expect(sugerirAssociacao(planilha, [1, 2])).toEqual({
      unidades: [undefined, undefined],
      avaliacaoFinal: undefined,
    });
  });
});
