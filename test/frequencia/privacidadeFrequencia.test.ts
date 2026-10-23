import { describe, expect, it } from "vitest";
import { PreferenciaPrivacidade } from "../../src/comum/preferenciaPrivacidade";
import {
  aplicarPrivacidade,
  iniciarPrivacidadeFrequencia,
} from "../../src/frequencia/privacidadeFrequencia";
import { ArmazenamentoEmMemoria } from "../fakes/ArmazenamentoEmMemoria";

const novoDocumento = (): Document =>
  document.implementation.createHTMLDocument("form.jsf");

const atributo = (documento: Document): string | null =>
  documento.documentElement.getAttribute("data-sigga-necessidades");

describe("aplicarPrivacidade", () => {
  it("ocultar remove o atributo, deixando o CSS do manifest agir", () => {
    const documento = novoDocumento();
    aplicarPrivacidade(documento, false);
    aplicarPrivacidade(documento, true);
    expect(atributo(documento)).toBeNull();
  });

  it("mostrar marca o <html> com data-sigga-necessidades=visiveis", () => {
    const documento = novoDocumento();
    aplicarPrivacidade(documento, false);
    expect(atributo(documento)).toBe("visiveis");
  });
});

describe("iniciarPrivacidadeFrequencia", () => {
  it("aplica a preferência salva ao carregar a página", async () => {
    const preferencia = new PreferenciaPrivacidade(
      new ArmazenamentoEmMemoria(),
    );
    await preferencia.salvarOcultar(false);
    const documento = novoDocumento();
    await iniciarPrivacidadeFrequencia(preferencia, documento);
    expect(atributo(documento)).toBe("visiveis");
  });

  it("acompanha mudanças feitas no popup sem recarregar", async () => {
    const preferencia = new PreferenciaPrivacidade(
      new ArmazenamentoEmMemoria(),
    );
    const documento = novoDocumento();
    await iniciarPrivacidadeFrequencia(preferencia, documento);
    await preferencia.salvarOcultar(false);
    expect(atributo(documento)).toBe("visiveis");
    await preferencia.salvarOcultar(true);
    expect(atributo(documento)).toBeNull();
  });
});
