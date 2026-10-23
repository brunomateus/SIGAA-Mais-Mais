import { describe, expect, it } from "vitest";
import { SinalPosLogin } from "../../src/comum/sinalPosLogin";
import { ArmazenamentoDaAbaEmMemoria } from "../fakes/ArmazenamentoDaAbaEmMemoria";

describe("SinalPosLogin", () => {
  it("consumir retorna false quando o sinal não foi marcado", () => {
    const sinal = new SinalPosLogin(new ArmazenamentoDaAbaEmMemoria());
    expect(sinal.consumir()).toBe(false);
  });

  it("é de uso único: consumir retorna true uma vez após marcar", () => {
    const sinal = new SinalPosLogin(new ArmazenamentoDaAbaEmMemoria());
    sinal.marcar();
    expect(sinal.consumir()).toBe(true);
    expect(sinal.consumir()).toBe(false);
  });

  it("é compartilhado por instâncias sobre o mesmo armazenamento (páginas da aba)", () => {
    const armazenamento = new ArmazenamentoDaAbaEmMemoria();
    new SinalPosLogin(armazenamento).marcar();
    expect(new SinalPosLogin(armazenamento).consumir()).toBe(true);
  });
});
