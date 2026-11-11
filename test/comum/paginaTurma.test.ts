import { describe, expect, it } from "vitest";
import { ehPaginaDaTurma } from "../../src/comum/paginaTurma";
import { montarConteudoProgramado } from "../suporte/paginaConteudoProgramado";
import { montarPaginaTurma } from "../suporte/paginasAva";

describe("ehPaginaDaTurma", () => {
  it("reconhece a página da turma pelo conteúdo", () => {
    expect(ehPaginaDaTurma(montarPaginaTurma().documento)).toBe(true);
    expect(ehPaginaDaTurma(montarConteudoProgramado([]))).toBe(false);
  });
});
