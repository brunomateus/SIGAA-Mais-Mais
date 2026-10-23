import { describe, expect, it, vi } from "vitest";
import {
  criarBotaoFavorito,
  marcarBotaoDoFavorito,
  pintarBotaoFavorito,
} from "../../src/vinculos/botaoFavorito";

describe("criarBotaoFavorito", () => {
  it("cria um botão com o rótulo do vínculo e a aparência pedida", () => {
    const botao = criarBotaoFavorito("Servidor", true, () => {});
    expect(botao.dataset.extFav).toBe("Servidor");
    expect(botao.textContent).toBe("★ Favorito ✓");
  });

  it("avisa a escolha sem deixar o clique chegar ao link do vínculo", () => {
    const link = document.createElement("a");
    const cliqueNoLink = vi.fn();
    link.addEventListener("click", cliqueNoLink);
    const aoEscolher = vi.fn();
    link.appendChild(criarBotaoFavorito("Servidor", false, aoEscolher));
    link.querySelector("button")!.click();
    expect(aoEscolher).toHaveBeenCalledWith("Servidor");
    expect(cliqueNoLink).not.toHaveBeenCalled();
  });
});

describe("pintarBotaoFavorito", () => {
  it("alterna entre marcado e desmarcado", () => {
    const botao = document.createElement("button");
    pintarBotaoFavorito(botao, true);
    expect(botao.textContent).toBe("★ Favorito ✓");
    pintarBotaoFavorito(botao, false);
    expect(botao.textContent).toBe("★ Favorito");
  });
});

describe("marcarBotaoDoFavorito", () => {
  it("marca apenas o botão do rótulo informado, ignorando acentos e caixa", () => {
    const raiz = document.createElement("div");
    raiz.append(
      criarBotaoFavorito("Servidor", true, () => {}),
      criarBotaoFavorito("Discênte", false, () => {}),
    );
    marcarBotaoDoFavorito(raiz, "discente");
    const textos = [...raiz.querySelectorAll("button")].map(
      (b) => b.textContent,
    );
    expect(textos).toEqual(["★ Favorito", "★ Favorito ✓"]);
  });
});
