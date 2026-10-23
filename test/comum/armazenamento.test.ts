import { describe, expect, it } from "vitest";
import { ArmazenamentoChrome } from "../../src/comum/armazenamento";
import { AreaChromeEmMemoria } from "../fakes/AreaChromeEmMemoria";

describe("ArmazenamentoChrome", () => {
  it("lê undefined para uma chave que não existe", async () => {
    const armazenamento = new ArmazenamentoChrome(new AreaChromeEmMemoria());
    expect(await armazenamento.ler("ausente")).toBeUndefined();
  });

  it("grava na área e lê o valor de volta", async () => {
    const area = new AreaChromeEmMemoria();
    const armazenamento = new ArmazenamentoChrome(area);
    await armazenamento.gravar("chave", "valor");
    expect(area.itens).toEqual({ chave: "valor" });
    expect(await armazenamento.ler("chave")).toBe("valor");
  });

  it("remove a chave da área", async () => {
    const area = new AreaChromeEmMemoria();
    const armazenamento = new ArmazenamentoChrome(area);
    await armazenamento.gravar("chave", "valor");
    await armazenamento.remover("chave");
    expect(area.itens).toEqual({});
  });
});
