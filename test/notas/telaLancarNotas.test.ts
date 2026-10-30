import { describe, expect, it } from "vitest";
import {
  encontrarTabelaNotas,
  lerUnidades,
  listarAlunosNaTela,
  normalizarMatricula,
} from "../../src/notas/telaLancarNotas";
import { montarConteudoProgramado } from "../suporte/paginaConteudoProgramado";
import {
  criarAlunosSimulados,
  montarTelaLancarNotas,
  tabelaDeNotas,
} from "../suporte/telaLancarNotas";

describe("encontrarTabelaNotas", () => {
  it("reconhece a tabela Alunos matriculados com campos de nota", () => {
    const tela = montarTelaLancarNotas(criarAlunosSimulados(1));
    expect(encontrarTabelaNotas(tela)?.id).toBe("notas-turma");
  });

  it("não reconhece outras telas", () => {
    expect(encontrarTabelaNotas(montarConteudoProgramado([]))).toBeUndefined();
  });
});

describe("lerUnidades", () => {
  it("lê quantas unidades a turma tiver", () => {
    const tela = montarTelaLancarNotas(criarAlunosSimulados(1, 3));
    expect(lerUnidades(tabelaDeNotas(tela))).toEqual([1, 2, 3]);
  });
});

describe("listarAlunosNaTela", () => {
  it("lê matrícula, nome sem os indicadores e os campos de cada aluno", () => {
    const tela = montarTelaLancarNotas(criarAlunosSimulados(2, 3));
    const [aluno] = listarAlunosNaTela(tabelaDeNotas(tela));
    expect(aluno!.matricula).toBe("500001");
    expect(aluno!.nome).toBe("ALUNO FICTÍCIO 1");
    expect(aluno!.camposUnidade.map((c) => c.name)).toEqual([
      "nota_00",
      "nota_01",
      "nota_02",
    ]);
    expect(aluno!.campoAvaliacaoFinal?.name).toBe("recup_0");
  });
});

describe("normalizarMatricula", () => {
  it("mantém só os dígitos e tira zeros à esquerda", () => {
    expect(normalizarMatricula(" 0512.345 ")).toBe("512345");
  });
});
