import { afterEach, describe, expect, it, vi } from "vitest";
import { tentarAteDomPronto } from "../../src/comum/espera";

const aguardarMutacoes = (): Promise<void> =>
  new Promise((resolve) => queueMicrotask(resolve));

describe("tentarAteDomPronto", () => {
  afterEach(() => vi.useRealTimers());

  it("executa uma única vez quando a primeira tentativa já dá certo", async () => {
    const raiz = document.createElement("div");
    const tentar = vi.fn(() => true);
    tentarAteDomPronto(tentar, raiz);
    raiz.appendChild(document.createElement("span"));
    await aguardarMutacoes();
    expect(tentar).toHaveBeenCalledTimes(1);
  });

  it("tenta de novo a cada mutação até dar certo, e então para", async () => {
    const raiz = document.createElement("div");
    const tentar = vi.fn(() => raiz.querySelector("a") !== null);
    tentarAteDomPronto(tentar, raiz);
    raiz.appendChild(document.createElement("a"));
    await aguardarMutacoes();
    raiz.appendChild(document.createElement("b"));
    await aguardarMutacoes();
    expect(tentar).toHaveBeenCalledTimes(2);
  });

  it("para de observar depois do prazo", async () => {
    vi.useFakeTimers();
    const raiz = document.createElement("div");
    const tentar = vi.fn(() => false);
    tentarAteDomPronto(tentar, raiz, 1000);
    vi.advanceTimersByTime(1000);
    raiz.appendChild(document.createElement("a"));
    await aguardarMutacoes();
    expect(tentar).toHaveBeenCalledTimes(1);
  });
});
