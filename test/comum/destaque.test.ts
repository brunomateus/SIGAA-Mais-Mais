import { describe, expect, it } from "vitest";
import { destacarPreenchido, removerDestaque } from "../../src/comum/destaque";

describe("destacarPreenchido e removerDestaque", () => {
  it("destaca em amarelo e depois volta ao normal", () => {
    const campo = document.createElement("input");
    destacarPreenchido(campo);
    expect(campo.style.backgroundColor).not.toBe("");
    removerDestaque(campo);
    expect(campo.style.backgroundColor).toBe("");
    expect(campo.style.outline).toBe("");
  });
});
