import { describe, expect, it } from "vitest";
import { criarAviso } from "../../src/comum/aviso";

describe("criarAviso", () => {
  it("cria um aviso de status com o id e o texto", () => {
    const aviso = criarAviso(document, "sigga-aviso-x", "Algo não deu certo.");
    expect(aviso.id).toBe("sigga-aviso-x");
    expect(aviso.getAttribute("role")).toBe("status");
    expect(aviso.textContent).toBe("Algo não deu certo.");
  });
});
