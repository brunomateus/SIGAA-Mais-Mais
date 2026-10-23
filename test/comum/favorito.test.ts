import { describe, expect, it } from "vitest";
import { RepositorioFavorito } from "../../src/comum/favorito";
import { ArmazenamentoEmMemoria } from "../fakes/ArmazenamentoEmMemoria";

describe("RepositorioFavorito", () => {
  it("lê undefined quando não há favorito salvo", async () => {
    const favoritos = new RepositorioFavorito(new ArmazenamentoEmMemoria());
    expect(await favoritos.ler()).toBeUndefined();
  });

  it("salva sob a chave do esboço, preservando favoritos já existentes", async () => {
    const armazenamento = new ArmazenamentoEmMemoria();
    await new RepositorioFavorito(armazenamento).salvar("Servidor");
    expect(armazenamento.itens.get("vinculo_favorito")).toBe("Servidor");
  });

  it("ignora um valor salvo que não seja texto", async () => {
    const armazenamento = new ArmazenamentoEmMemoria();
    await armazenamento.gravar("vinculo_favorito", 42);
    expect(await new RepositorioFavorito(armazenamento).ler()).toBeUndefined();
  });

  it("limpa o favorito salvo", async () => {
    const favoritos = new RepositorioFavorito(new ArmazenamentoEmMemoria());
    await favoritos.salvar("Servidor");
    await favoritos.limpar();
    expect(await favoritos.ler()).toBeUndefined();
  });
});
