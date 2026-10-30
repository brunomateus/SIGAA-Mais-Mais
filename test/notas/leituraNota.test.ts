import { describe, expect, it } from "vitest";
import { lerNota, normalizarValorDoCampo } from "../../src/notas/leituraNota";

describe("lerNota", () => {
  it.each([
    ["7,5", "7,5"],
    ["7.5", "7,5"],
    ["7", "7,0"],
    ["07", "7,0"],
    ["10", "10,0"],
    ["10,00", "10,0"],
    ["0", "0,0"],
    [" 8,25 ", "8,2"],
    ["7,39", "7,3"],
    // 7,3 × 10 vale 72,999… em ponto flutuante: o corte precisa ser no texto
    ["7,3", "7,3"],
    ["6,99999", "6,9"],
  ])("%s → %s (truncada em uma casa)", (texto, nota) => {
    expect(lerNota(texto)).toEqual({ tipo: "valida", nota });
  });

  it("célula em branco é vazia", () => {
    expect(lerNota("  ")).toEqual({ tipo: "vazia" });
  });

  it.each(["F", "-", "faltou", "-1", "7,5,1", "1e1"])(
    "%s não é uma nota",
    (texto) => {
      const leitura = lerNota(texto);
      expect(leitura.tipo).toBe("invalida");
      expect(leitura.tipo === "invalida" && leitura.motivo).toContain(texto);
    },
  );

  it.each(["10,5", "11", "10,01"])("%s passa de 10", (texto) => {
    expect(lerNota(texto)).toEqual({
      tipo: "invalida",
      motivo: `"${texto}" passa de 10`,
    });
  });
});

describe("normalizarValorDoCampo", () => {
  it("põe o valor do SIGAA no formato de lerNota para comparar", () => {
    expect(normalizarValorDoCampo("7")).toBe("7,0");
    expect(normalizarValorDoCampo("")).toBe("");
  });
});
