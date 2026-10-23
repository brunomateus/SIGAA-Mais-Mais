import { describe, expect, it } from "vitest";
import { normalizarRotulo } from "../../src/comum/texto";

describe("normalizarRotulo", () => {
  it("remove acentos, coloca em minúsculas e colapsa espaços", () => {
    expect(normalizarRotulo("  Docênte   EXTERNO ")).toBe("docente externo");
  });

  it("trata null e undefined como texto vazio", () => {
    expect(normalizarRotulo(undefined)).toBe("");
    expect(normalizarRotulo(null)).toBe("");
  });
});
