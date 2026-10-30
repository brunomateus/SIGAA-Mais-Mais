import { describe, expect, it } from "vitest";
import { recarregarConteudoProgramado } from "../../src/topicos/recarregamento";
import { NavegacaoJsfFalsa } from "../fakes/NavegacaoJsfFalsa";
import { montarConteudoProgramado } from "../suporte/paginaConteudoProgramado";

describe("recarregarConteudoProgramado", () => {
  it("envia o item de menu Conteúdo Programado com o ViewState da resposta mais recente", () => {
    const navegacao = new NavegacaoJsfFalsa();
    recarregarConteudoProgramado(
      { documentoVivo: document, ...navegacao },
      montarConteudoProgramado([], "j_id9"),
    );
    const [formulario] = navegacao.formularios;
    expect(Object.fromEntries(new FormData(formulario!))).toEqual({
      formMenu: "formMenu",
      "javax.faces.ViewState": "j_id9",
      "formMenu:j_id_29": "formMenu:j_id_29",
    });
    expect(formulario!.ownerDocument).toBe(document);
    formulario!.remove();
  });

  it("sem o menu, reabre o endereço atual", () => {
    const navegacao = new NavegacaoJsfFalsa();
    const semMenu = new DOMParser().parseFromString("<p>erro</p>", "text/html");
    recarregarConteudoProgramado(
      { documentoVivo: document, ...navegacao },
      semMenu,
    );
    expect(navegacao.urls).toEqual([document.location.href]);
  });
});
