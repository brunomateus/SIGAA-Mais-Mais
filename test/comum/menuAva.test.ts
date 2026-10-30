import { describe, expect, it } from "vitest";
import { encontrarItemMenuAva } from "../../src/comum/menuAva";
import { montarConteudoProgramado } from "../suporte/paginaConteudoProgramado";

describe("encontrarItemMenuAva", () => {
  it("encontra o item pelo rótulo sem acentos e em minúsculas", () => {
    const link = encontrarItemMenuAva(
      montarConteudoProgramado([]),
      "conteudo programado",
    );
    expect(link?.textContent?.trim()).toBe("Conteúdo Programado");
  });

  it("retorna undefined para um item inexistente", () => {
    expect(
      encontrarItemMenuAva(montarConteudoProgramado([]), "inexistente"),
    ).toBeUndefined();
  });
});
