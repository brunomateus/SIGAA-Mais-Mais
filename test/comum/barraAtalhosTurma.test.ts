import { describe, expect, it } from "vitest";
import {
  criarBotaoAtalho,
  inserirNaBarraDeAtalhos,
} from "../../src/comum/barraAtalhosTurma";
import { montarPaginaTurma } from "../suporte/paginasAva";

const botao = (documento: Document, texto: string): HTMLButtonElement =>
  criarBotaoAtalho(documento, texto, "secundario", () => {});

describe("inserirNaBarraDeAtalhos", () => {
  it("cria a barra no topo do conteúdo e junta os grupos na ordem", () => {
    const { documento } = montarPaginaTurma();
    inserirNaBarraDeAtalhos(documento, "a", [botao(documento, "A")]);
    const barra = inserirNaBarraDeAtalhos(documento, "b", [
      botao(documento, "B"),
    ]);
    expect(documento.getElementById("conteudo")?.firstElementChild).toBe(barra);
    expect([...barra!.children].map((b) => b.textContent)).toEqual(["A", "B"]);
  });

  it("não repete um grupo já inserido", () => {
    const { documento } = montarPaginaTurma();
    inserirNaBarraDeAtalhos(documento, "a", [botao(documento, "A")]);
    const barra = inserirNaBarraDeAtalhos(documento, "a", [
      botao(documento, "A"),
    ]);
    expect(barra?.children).toHaveLength(1);
  });

  it("sem #conteudo, não insere nada", () => {
    const documento = document.implementation.createHTMLDocument("x");
    expect(
      inserirNaBarraDeAtalhos(documento, "a", [botao(documento, "A")]),
    ).toBeUndefined();
  });
});

describe("criarBotaoAtalho", () => {
  it("destaca só o principal e chama a ação no clique", () => {
    let cliques = 0;
    const principal = criarBotaoAtalho(document, "P", "principal", () => {
      cliques += 1;
    });
    principal.click();
    expect(cliques).toBe(1);
    expect(principal.style.fontWeight).toBe("bold");
    expect(botao(document, "S").style.fontWeight).toBe("normal");
  });
});
