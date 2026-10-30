import { describe, expect, it } from "vitest";
import type { ResultadoRemocao } from "../../src/topicos/removedorTopicos";
import {
  descreverResumo,
  RegistroDeResumoRemocao,
  resumirRemocao,
} from "../../src/topicos/resumoRemocao";
import { ArmazenamentoDaAbaEmMemoria } from "../fakes/ArmazenamentoDaAbaEmMemoria";

describe("resumirRemocao", () => {
  it("guarda a descrição do tópico em que falhou", () => {
    const resultado: ResultadoRemocao = {
      total: 12,
      removidos: 5,
      situacao: "falha",
      falha: {
        topico: { id: "1", descricao: "09 - Herança", inicio: "", fim: "" },
        motivo: "x",
      },
      documentoFinal: document,
    };
    expect(resumirRemocao(resultado)).toEqual({
      total: 12,
      removidos: 5,
      situacao: "falha",
      topicoComFalha: "09 - Herança",
    });
  });
});

describe("RegistroDeResumoRemocao", () => {
  it("devolve o resumo guardado uma única vez", () => {
    const registro = new RegistroDeResumoRemocao(
      new ArmazenamentoDaAbaEmMemoria(),
    );
    registro.guardar({ total: 2, removidos: 2, situacao: "concluida" });
    expect(registro.consumir()).toEqual({
      total: 2,
      removidos: 2,
      situacao: "concluida",
    });
    expect(registro.consumir()).toBeUndefined();
  });

  it("ignora valores corrompidos", () => {
    const armazenamento = new ArmazenamentoDaAbaEmMemoria();
    armazenamento.setItem("sigga_resumo_remocao_topicos", "{quebrado");
    expect(
      new RegistroDeResumoRemocao(armazenamento).consumir(),
    ).toBeUndefined();
  });
});

describe("descreverResumo", () => {
  it.each([
    [
      { total: 12, removidos: 12, situacao: "concluida" },
      "12 tópicos de aula removidos.",
    ],
    [
      { total: 1, removidos: 1, situacao: "concluida" },
      "1 tópico de aula removido.",
    ],
    [
      { total: 12, removidos: 5, situacao: "interrompida" },
      "5 de 12 tópicos de aula removidos. A remoção foi interrompida; os demais continuam na lista.",
    ],
    [
      {
        total: 12,
        removidos: 8,
        situacao: "falha",
        topicoComFalha: "09 - Herança",
      },
      "8 de 12 tópicos de aula removidos. A remoção falhou em “09 - Herança”; ele e os seguintes continuam na lista.",
    ],
  ] as const)("%j → %s", (resumo, texto) => {
    expect(descreverResumo(resumo)).toBe(texto);
  });
});
