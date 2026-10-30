import { describe, expect, it } from "vitest";
import {
  corpoDoComando,
  lerComandoJsf,
  montarFormularioJsf,
} from "../../src/comum/comandoJsf";

function montarDocumento(): Document {
  return new DOMParser().parseFromString(
    `<form id="f1" name="f1" method="post" action="/sigaa/ava/x.jsf">
      <input type="hidden" name="f1" value="f1">
      <input type="checkbox" name="desmarcada" value="1">
      <input type="checkbox" value="sem-nome" checked>
      <input type="hidden" name="javax.faces.ViewState" value="j_id5">
      <a id="link" href="#" onclick="if(typeof jsfcljs == 'function'){jsfcljs(document.forms['f1'],'f1:cmd,f1:cmd,id,42','');}return false">x</a>
      <a id="comum" href="/outra">y</a>
    </form>`,
    "text/html",
  );
}

function link(documento: Document, id: string): HTMLAnchorElement {
  const elemento = documento.querySelector<HTMLAnchorElement>(`#${id}`);
  if (!elemento) throw new Error(`link #${id} ausente do documento de teste`);
  return elemento;
}

describe("lerComandoJsf", () => {
  it("junta os campos do formulário e os pares do jsfcljs", () => {
    const comando = lerComandoJsf(link(montarDocumento(), "link"));
    expect(comando).toEqual({
      acao: "/sigaa/ava/x.jsf",
      campos: [
        ["f1", "f1"],
        ["javax.faces.ViewState", "j_id5"],
        ["f1:cmd", "f1:cmd"],
        ["id", "42"],
      ],
    });
  });

  it("ignora links sem jsfcljs", () => {
    expect(lerComandoJsf(link(montarDocumento(), "comum"))).toBeUndefined();
  });
});

describe("corpoDoComando", () => {
  it("codifica os campos como formulário", () => {
    const corpo = corpoDoComando({
      acao: "/x",
      campos: [
        ["id", "42"],
        ["a", "b c"],
      ],
    });
    expect(corpo.toString()).toBe("id=42&a=b+c");
  });
});

describe("montarFormularioJsf", () => {
  it("cria um formulário POST oculto com os campos do comando", () => {
    const formulario = montarFormularioJsf(document, {
      acao: "/sigaa/ava/y.jsf",
      campos: [
        ["formMenu", "formMenu"],
        ["javax.faces.ViewState", "j_id9"],
      ],
    });
    expect(formulario.getAttribute("action")).toBe("/sigaa/ava/y.jsf");
    expect(formulario.method).toBe("post");
    expect(formulario.hidden).toBe(true);
    expect([...new FormData(formulario).entries()]).toEqual([
      ["formMenu", "formMenu"],
      ["javax.faces.ViewState", "j_id9"],
    ]);
    formulario.remove();
  });
});
