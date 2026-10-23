import { describe, expect, it } from "vitest";
import { FAVORITO_AUTOMATICO } from "../../src/comum/favorito";
import {
  encontrarVinculos,
  selecionarVinculoAutomatico,
  vinculoQueContem,
} from "../../src/vinculos/listaVinculos";
import { montarPaginaVinculos } from "../suporte/paginaVinculos";

const vinculosDaPagina = (pagina: ReturnType<typeof montarPaginaVinculos>) =>
  encontrarVinculos(pagina.documento);

describe("encontrarVinculos", () => {
  it("lista ativos e inativos, com o rótulo do span.col-xs-2", () => {
    const pagina = montarPaginaVinculos([
      { rotulo: "Servidor" },
      { rotulo: "Discente", inativo: true },
    ]);
    expect(vinculosDaPagina(pagina).map((v) => v.rotulo)).toEqual([
      "Servidor",
      "Discente",
    ]);
  });

  it("ignora links de lista sem rótulo", () => {
    const pagina = montarPaginaVinculos([{ rotulo: "Servidor" }]);
    pagina.documento.body.insertAdjacentHTML(
      "beforeend",
      "<ul><li><a href='#'>Menu</a></li></ul>",
    );
    expect(vinculosDaPagina(pagina)).toHaveLength(1);
  });
});

describe("selecionarVinculoAutomatico", () => {
  const vinculos = encontrarVinculos(
    montarPaginaVinculos([
      { rotulo: "Servidor" },
      { rotulo: "Discente", inativo: true },
    ]).documento,
  );

  it("não seleciona nada sem favorito", () => {
    expect(selecionarVinculoAutomatico(vinculos, undefined)).toBeUndefined();
  });

  it("seleciona o favorito ignorando acentos, caixa e espaços", () => {
    expect(selecionarVinculoAutomatico(vinculos, " servidor ")?.rotulo).toBe(
      "Servidor",
    );
  });

  it("seleciona um favorito inativo como qualquer outro", () => {
    expect(selecionarVinculoAutomatico(vinculos, "Discente")?.rotulo).toBe(
      "Discente",
    );
  });

  it("não seleciona nada se o favorito não está na tela", () => {
    expect(
      selecionarVinculoAutomatico(vinculos, "Docente Externo"),
    ).toBeUndefined();
  });

  it("no modo automático, só seleciona quando há um único vínculo", () => {
    expect(
      selecionarVinculoAutomatico(vinculos, FAVORITO_AUTOMATICO),
    ).toBeUndefined();
    expect(
      selecionarVinculoAutomatico(vinculos.slice(1), FAVORITO_AUTOMATICO)
        ?.rotulo,
    ).toBe("Discente");
  });
});

describe("vinculoQueContem", () => {
  const pagina = montarPaginaVinculos([
    { rotulo: "Servidor" },
    { rotulo: "Discente" },
  ]);
  const vinculos = encontrarVinculos(pagina.documento);

  it("encontra o vínculo a partir de um elemento interno do link", () => {
    const span = pagina.links[1]!.querySelector("span")!;
    expect(vinculoQueContem(vinculos, span)?.rotulo).toBe("Discente");
  });

  it("retorna undefined para alvos fora dos vínculos", () => {
    expect(vinculoQueContem(vinculos, pagina.documento.body)).toBeUndefined();
    expect(vinculoQueContem(vinculos, null)).toBeUndefined();
  });
});
