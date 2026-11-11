import { describe, expect, it } from "vitest";
import {
  encontrarItemMenuNoticias,
  encontrarLinkCadastrarNoticia,
} from "../../src/noticias/paginaNoticias";
import {
  htmlListagemNoticias,
  montarTurmaComMenuNoticias,
} from "../suporte/paginaNoticias";

const interpretar = (html: string): Document =>
  new DOMParser().parseFromString(html, "text/html");

describe("encontrarItemMenuNoticias", () => {
  it("acha o item do menu, e não o painel lateral de notícias", () => {
    const item = encontrarItemMenuNoticias(montarTurmaComMenuNoticias());
    expect(item?.getAttribute("onclick")).toContain("formMenu:j_id_jsp_1_34");
  });
});

describe("encontrarLinkCadastrarNoticia", () => {
  it("acha o botão no quadro Notícias da listagem", () => {
    const link = encontrarLinkCadastrarNoticia(
      interpretar(htmlListagemNoticias("j_id2")),
    );
    expect(link?.textContent).toBe("Cadastrar Notícia");
  });

  it("fora da listagem, não acha nada", () => {
    expect(
      encontrarLinkCadastrarNoticia(montarTurmaComMenuNoticias()),
    ).toBeUndefined();
  });
});
