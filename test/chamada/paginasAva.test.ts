import { describe, expect, it } from "vitest";
import {
  encontrarLinkDaData,
  encontrarLinkLancarFrequencia,
  identificarPaginaAva,
  listarLinksSubturmas,
} from "../../src/chamada/paginasAva";
import {
  montarOutraPaginaAva,
  montarPaginaCalendario,
  montarPaginaSubturma,
  montarPaginaTurma,
} from "../suporte/paginasAva";

const SEGUNDA = new Date(2026, 9, 19);
const TERCA = new Date(2026, 9, 20);
const SEXTA = new Date(2026, 9, 23);

describe("identificarPaginaAva", () => {
  it("reconhece cada tela pelo conteúdo", () => {
    expect(identificarPaginaAva(montarPaginaTurma().documento)).toBe("turma");
    expect(identificarPaginaAva(montarPaginaSubturma(1).documento)).toBe(
      "subturma",
    );
    expect(identificarPaginaAva(montarPaginaCalendario([]).documento)).toBe(
      "calendario",
    );
    expect(identificarPaginaAva(montarOutraPaginaAva().documento)).toBe(
      "outra",
    );
  });
});

describe("encontrarLinkLancarFrequencia", () => {
  it("encontra o item do menu Alunos pelo texto, ignorando os demais itens", () => {
    const { documento } = montarPaginaTurma();
    expect(encontrarLinkLancarFrequencia(documento)?.dataset.clique).toBe(
      "menu:lancar-frequencia",
    );
  });

  it("retorna undefined quando o menu não está na página", () => {
    const documento = document.implementation.createHTMLDocument("");
    expect(encontrarLinkLancarFrequencia(documento)).toBeUndefined();
  });
});

describe("listarLinksSubturmas", () => {
  it("lista um link de seleção por subturma", () => {
    expect(
      listarLinksSubturmas(montarPaginaSubturma(1).documento),
    ).toHaveLength(1);
    expect(
      listarLinksSubturmas(montarPaginaSubturma(3).documento),
    ).toHaveLength(3);
  });
});

describe("encontrarLinkDaData", () => {
  const { documento } = montarPaginaCalendario([SEGUNDA, TERCA]);

  it("encontra o link da data, com o mês contado a partir de 0", () => {
    expect(encontrarLinkDaData(documento, TERCA)?.getAttribute("href")).toBe(
      "/sigaa/ava/FrequenciaAluno/form.jsf?dia=20&mes=9&ano=2026",
    );
  });

  it("retorna undefined para um dia sem aula", () => {
    expect(encontrarLinkDaData(documento, SEXTA)).toBeUndefined();
  });

  it("não confunde o mesmo dia em outro mês ou ano", () => {
    expect(
      encontrarLinkDaData(documento, new Date(2026, 8, 19)),
    ).toBeUndefined();
    expect(
      encontrarLinkDaData(documento, new Date(2025, 9, 19)),
    ).toBeUndefined();
  });
});
