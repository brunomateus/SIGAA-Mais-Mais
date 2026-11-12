import { describe, expect, it } from "vitest";
import {
  encontrarFormularioAutoavaliacao,
  estaCompleto,
  lerRespostas,
  lerTurmaAvaliada,
} from "../../src/autoavaliacao/formularioAutoavaliacao";
import {
  montarFormularioAutoavaliacao,
  responder,
} from "../suporte/formularioAutoavaliacao";

describe("lerTurmaAvaliada", () => {
  it("lê o código do componente, a turma e o período, sem o nome", () => {
    expect(
      lerTurmaAvaliada(
        " Disciplina: QXD9001 - NOME - COM HÍFEN - Turma: 02A (2026.2) ",
      ),
    ).toEqual({
      codigoComponente: "QXD9001",
      rotulo: "QXD9001 - Turma 02A (2026.2)",
    });
  });

  it("sem o padrão do SIGAA, devolve undefined", () => {
    expect(lerTurmaAvaliada("Avaliação das condições")).toBeUndefined();
  });
});

describe("encontrarFormularioAutoavaliacao", () => {
  it("reconhece a autoavaliação, suas perguntas e o botão Salvar", () => {
    const formulario = encontrarFormularioAutoavaliacao(
      montarFormularioAutoavaliacao(),
    );
    expect(formulario?.turma.rotulo).toBe("QXD9001 - Turma 01A (2026.2)");
    expect([...formulario!.perguntas.keys()]).toEqual(["p_59", "p_40", "p_60"]);
    expect(formulario?.campoSugestao).toBeDefined();
    expect(formulario?.botaoSalvar?.textContent).toContain("Salvar");
  });

  it("ignora as outras avaliações, como a do alunado", () => {
    const outra = montarFormularioAutoavaliacao({
      titulo: "Avaliação do alunado",
    });
    expect(encontrarFormularioAutoavaliacao(outra)).toBeUndefined();
  });
});

describe("lerRespostas e estaCompleto", () => {
  it("lê as opções marcadas e a questão optativa", () => {
    const documento = montarFormularioAutoavaliacao();
    responder(documento, { p_59: "50", p_40: "29" });
    const formulario = encontrarFormularioAutoavaliacao(documento)!;
    formulario.campoSugestao!.value = "Mais laboratórios.";
    expect(lerRespostas(formulario)).toEqual({
      opcoes: { p_59: "50", p_40: "29" },
      sugestao: "Mais laboratórios.",
    });
    expect(estaCompleto(formulario)).toBe(false);
  });

  it("completo com todas as perguntas de opção, sem a optativa", () => {
    const documento = montarFormularioAutoavaliacao();
    responder(documento, { p_59: "29", p_40: "29", p_60: "30" });
    expect(estaCompleto(encontrarFormularioAutoavaliacao(documento)!)).toBe(
      true,
    );
  });
});
