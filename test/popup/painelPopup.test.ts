import { describe, expect, it } from "vitest";
import {
  FAVORITO_AUTOMATICO,
  RepositorioFavorito,
} from "../../src/comum/favorito";
import { descreverFavorito, PainelPopup } from "../../src/popup/painelPopup";
import { ArmazenamentoEmMemoria } from "../fakes/ArmazenamentoEmMemoria";
import { aguardarTarefasPendentes } from "../suporte/paginaVinculos";

async function abrirPopup(favoritoSalvo?: string) {
  const favoritos = new RepositorioFavorito(new ArmazenamentoEmMemoria());
  if (favoritoSalvo) await favoritos.salvar(favoritoSalvo);
  const elementos = {
    status: document.createElement("div"),
    botaoAutomatico: document.createElement("button"),
    botaoLimpar: document.createElement("button"),
  };
  await new PainelPopup(favoritos, elementos).iniciar();
  return { favoritos, elementos };
}

describe("descreverFavorito", () => {
  it("descreve cada estado do favorito", () => {
    expect(descreverFavorito(undefined)).toBe("Nenhum favorito salvo ainda.");
    expect(descreverFavorito("Servidor")).toBe("Favorito atual: Servidor");
    expect(descreverFavorito(FAVORITO_AUTOMATICO)).toMatch(/^Automático/);
  });
});

describe("PainelPopup", () => {
  it("exibe o favorito salvo ao abrir", async () => {
    const { elementos } = await abrirPopup("Servidor");
    expect(elementos.status.textContent).toBe("Favorito atual: Servidor");
  });

  it("ativa o modo automático", async () => {
    const { favoritos, elementos } = await abrirPopup("Servidor");
    elementos.botaoAutomatico.click();
    await aguardarTarefasPendentes();
    expect(await favoritos.ler()).toBe(FAVORITO_AUTOMATICO);
    expect(elementos.status.textContent).toMatch(/^Automático/);
  });

  it("limpa o favorito", async () => {
    const { favoritos, elementos } = await abrirPopup("Servidor");
    elementos.botaoLimpar.click();
    await aguardarTarefasPendentes();
    expect(await favoritos.ler()).toBeUndefined();
    expect(elementos.status.textContent).toBe("Nenhum favorito salvo ainda.");
  });
});
