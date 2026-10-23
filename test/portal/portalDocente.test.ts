import { describe, expect, it } from "vitest";
import { SinalPosLogin } from "../../src/comum/sinalPosLogin";
import {
  abrirPortalDocenteAposLogin,
  encontrarLinkPortalDocente,
} from "../../src/portal/portalDocente";
import { AnunciadorFalso } from "../fakes/AnunciadorFalso";
import { ArmazenamentoDaAbaEmMemoria } from "../fakes/ArmazenamentoDaAbaEmMemoria";
import { NavegadorFalso } from "../fakes/NavegadorFalso";

const URL_PORTAL = "https://si3.ufc.br/sigaa/verPortalDocente.do";

function montarPaginaInicial(comLinkDoPortal: boolean): Document {
  const documento =
    document.implementation.createHTMLDocument("paginaInicial.do");
  const link = comLinkDoPortal
    ? `<a href="${URL_PORTAL}">Portal do Docente</a>`
    : "";
  documento.body.innerHTML = `<a href="/sigaa/portais/discente/discente.jsf">Portal do Discente</a>${link}`;
  return documento;
}

function chegarNaPaginaInicial(
  comLinkDoPortal: boolean,
  sinalMarcado: boolean,
) {
  const sinalPosLogin = new SinalPosLogin(new ArmazenamentoDaAbaEmMemoria());
  if (sinalMarcado) sinalPosLogin.marcar();
  const anunciador = new AnunciadorFalso();
  const navegador = new NavegadorFalso();
  const redirecionou = abrirPortalDocenteAposLogin({
    sinalPosLogin,
    anunciarTransicao: anunciador.anunciar,
    navegar: navegador.navegar,
    documento: montarPaginaInicial(comLinkDoPortal),
  });
  return { redirecionou, sinalPosLogin, anunciador, navegador };
}

describe("encontrarLinkPortalDocente", () => {
  it("encontra o link para verPortalDocente.do", () => {
    expect(encontrarLinkPortalDocente(montarPaginaInicial(true))?.href).toBe(
      URL_PORTAL,
    );
  });

  it("retorna undefined quando o usuário não tem acesso ao portal", () => {
    expect(
      encontrarLinkPortalDocente(montarPaginaInicial(false)),
    ).toBeUndefined();
  });
});

describe("abrirPortalDocenteAposLogin", () => {
  it("logo após o login, anuncia e navega para o endereço do link do portal", () => {
    const { redirecionou, anunciador, navegador } = chegarNaPaginaInicial(
      true,
      true,
    );
    expect(redirecionou).toBe(true);
    expect(anunciador.mensagens).toEqual(["Abrindo Portal do Docente…"]);
    expect(navegador.urls).toEqual([URL_PORTAL]);
  });

  it("consome o sinal: uma visita posterior não redireciona", () => {
    const { sinalPosLogin } = chegarNaPaginaInicial(true, true);
    expect(sinalPosLogin.consumir()).toBe(false);
  });

  it("sem o sinal pós-login (ex.: menu Módulos), não redireciona", () => {
    const { redirecionou, anunciador, navegador } = chegarNaPaginaInicial(
      true,
      false,
    );
    expect(redirecionou).toBe(false);
    expect(anunciador.mensagens).toEqual([]);
    expect(navegador.urls).toEqual([]);
  });

  it("sem acesso ao portal, não redireciona e ainda assim consome o sinal", () => {
    const { redirecionou, sinalPosLogin, navegador } = chegarNaPaginaInicial(
      false,
      true,
    );
    expect(redirecionou).toBe(false);
    expect(navegador.urls).toEqual([]);
    expect(sinalPosLogin.consumir()).toBe(false);
  });
});
