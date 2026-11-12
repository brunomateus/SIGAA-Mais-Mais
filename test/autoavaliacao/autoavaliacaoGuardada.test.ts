import { describe, expect, it } from "vitest";
import {
  RepositorioDeAutoavaliacao,
  type AutoavaliacaoGuardada,
} from "../../src/autoavaliacao/autoavaliacaoGuardada";
import { ArmazenamentoEmMemoria } from "../fakes/ArmazenamentoEmMemoria";

const GUARDADA: AutoavaliacaoGuardada = {
  turma: {
    codigoComponente: "QXD9001",
    rotulo: "QXD9001 - Turma 01A (2026.2)",
  },
  respostas: { opcoes: { p_59: "29" }, sugestao: "" },
  guardadaEm: 1,
};

describe("RepositorioDeAutoavaliacao", () => {
  it("guarda, lê e esquece a última autoavaliação", async () => {
    const guardadas = new RepositorioDeAutoavaliacao(
      new ArmazenamentoEmMemoria(),
    );
    await guardadas.guardar(GUARDADA);
    expect(await guardadas.ler()).toEqual(GUARDADA);
    await guardadas.esquecer();
    expect(await guardadas.ler()).toBeUndefined();
  });

  it.each([
    ["texto solto", "x"],
    ["sem turma", { ...GUARDADA, turma: undefined }],
    [
      "opção não textual",
      { ...GUARDADA, respostas: { opcoes: { p_1: 2 }, sugestao: "" } },
    ],
  ])("ignora um valor em formato inesperado (%s)", async (_caso, valor) => {
    const armazenamento = new ArmazenamentoEmMemoria();
    armazenamento.itens.set("sigga_autoavaliacao_guardada", valor);
    expect(
      await new RepositorioDeAutoavaliacao(armazenamento).ler(),
    ).toBeUndefined();
  });
});
