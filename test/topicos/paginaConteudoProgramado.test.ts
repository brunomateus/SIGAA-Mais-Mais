import { describe, expect, it } from "vitest";
import {
  encontrarLinkRemocao,
  encontrarQuadroConteudoProgramado,
  listarLinhasTopicos,
} from "../../src/topicos/paginaConteudoProgramado";
import {
  criarTopicosSimulados,
  montarConteudoProgramado,
} from "../suporte/paginaConteudoProgramado";
import { montarPaginaTurma } from "../suporte/paginasAva";

function tabelaDe(documento: Document): HTMLTableElement {
  const tabela = documento.querySelector<HTMLTableElement>("table.listing");
  if (!tabela) throw new Error("table.listing ausente da tela simulada");
  return tabela;
}

describe("encontrarQuadroConteudoProgramado", () => {
  it("reconhece a tela pela legenda, mesmo sem tópicos", () => {
    expect(
      encontrarQuadroConteudoProgramado(montarConteudoProgramado([])),
    ).toBeDefined();
  });

  it("não reconhece outras telas da turma", () => {
    expect(
      encontrarQuadroConteudoProgramado(montarPaginaTurma().documento),
    ).toBeUndefined();
  });
});

describe("listarLinhasTopicos", () => {
  it("lê id, descrição e datas de cada tópico de aula", () => {
    const [primeiro] = criarTopicosSimulados(1);
    const linhas = listarLinhasTopicos(
      tabelaDe(montarConteudoProgramado([primeiro!])),
    );
    expect(linhas.map((l) => l.topico)).toEqual([
      {
        id: "79533231",
        descricao: "01 - Assunto 1",
        inicio: "10/08/2026",
        fim: "10/08/2026",
      },
    ]);
  });

  it("continua lendo as colunas depois que a extensão insere a coluna de seleção", () => {
    const tabela = tabelaDe(montarConteudoProgramado(criarTopicosSimulados(1)));
    tabela.querySelector("tbody tr")!.prepend(document.createElement("td"));
    expect(listarLinhasTopicos(tabela)[0]!.topico.descricao).toBe(
      "01 - Assunto 1",
    );
  });
});

describe("encontrarLinkRemocao", () => {
  it("encontra a lixeira do tópico pelo id, e não os outros ícones", () => {
    const link = encontrarLinkRemocao(
      montarConteudoProgramado(criarTopicosSimulados(3)),
      "79533232",
    );
    expect(link?.querySelector("img")?.alt).toBe("Excluir");
  });

  it("retorna undefined para um tópico ausente", () => {
    expect(
      encontrarLinkRemocao(montarConteudoProgramado([]), "79533231"),
    ).toBeUndefined();
  });
});
