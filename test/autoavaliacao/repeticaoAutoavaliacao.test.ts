import { describe, expect, it } from "vitest";
import {
  RepositorioDeAutoavaliacao,
  type AutoavaliacaoGuardada,
} from "../../src/autoavaliacao/autoavaliacaoGuardada";
import { RepeticaoDeAutoavaliacao } from "../../src/autoavaliacao/repeticaoAutoavaliacao";
import { ArmazenamentoEmMemoria } from "../fakes/ArmazenamentoEmMemoria";
import {
  marcadas,
  montarFormularioAutoavaliacao,
  responder,
  TURMA_B,
} from "../suporte/formularioAutoavaliacao";

const DA_TURMA_A: AutoavaliacaoGuardada = {
  turma: {
    codigoComponente: "QXD9001",
    rotulo: "QXD9001 - Turma 01A (2026.2)",
  },
  respostas: { opcoes: { p_59: "29", p_40: "30", p_60: "31" }, sugestao: "" },
  guardadaEm: 1,
};

async function abrir(documento: Document, guardada?: AutoavaliacaoGuardada) {
  const guardadas = new RepositorioDeAutoavaliacao(
    new ArmazenamentoEmMemoria(),
  );
  if (guardada) await guardadas.guardar(guardada);
  await new RepeticaoDeAutoavaliacao({
    documento,
    guardadas,
    agora: () => 42,
  }).iniciar();
  return guardadas;
}

function clicar(documento: Document, texto: string): void {
  const elementos = [...documento.querySelectorAll<HTMLElement>("button, a")];
  const alvo = elementos.find((e) => e.textContent?.trim().startsWith(texto));
  if (!alvo)
    throw new Error(
      `"${texto}" ausente; há: ${elementos.map((e) => e.textContent?.trim())}`,
    );
  alvo.click();
}

const textosDosBotoes = (documento: Document): (string | null)[] =>
  [...documento.querySelectorAll("#sigga-repetir-autoavaliacao button")].map(
    (b) => b.textContent,
  );

// O armazenamento é assíncrono e o clique não espera a gravação
const gravacoesPendentes = () => new Promise((r) => setTimeout(r, 0));

describe("RepeticaoDeAutoavaliacao ao salvar", () => {
  it("guarda as respostas e a turma ao salvar um formulário completo", async () => {
    const documento = montarFormularioAutoavaliacao();
    const guardadas = await abrir(documento);
    responder(documento, { p_59: "50", p_40: "29", p_60: "29" });
    clicar(documento, "Salvar Formulário de Avaliação");
    await gravacoesPendentes();
    expect(await guardadas.ler()).toEqual({
      turma: {
        codigoComponente: "QXD9001",
        rotulo: "QXD9001 - Turma 01A (2026.2)",
      },
      respostas: {
        opcoes: { p_59: "50", p_40: "29", p_60: "29" },
        sugestao: "",
      },
      guardadaEm: 42,
    });
  });

  it("não guarda um formulário incompleto, que o SIGAA recusaria", async () => {
    const documento = montarFormularioAutoavaliacao();
    const guardadas = await abrir(documento, DA_TURMA_A);
    responder(documento, { p_59: "29" });
    clicar(documento, "Salvar Formulário de Avaliação");
    await gravacoesPendentes();
    expect(await guardadas.ler()).toEqual(DA_TURMA_A);
  });
});

describe("RepeticaoDeAutoavaliacao no formulário de outra turma", () => {
  it("oferece preencher com as respostas guardadas, citando a turma", async () => {
    const documento = montarFormularioAutoavaliacao({ turma: TURMA_B });
    await abrir(documento, DA_TURMA_A);
    expect(textosDosBotoes(documento)).toEqual([
      "Preencher com as respostas de QXD9001 - Turma 01A (2026.2)",
      "Esquecer respostas guardadas",
    ]);
  });

  it("preenche sem salvar e mostra o resumo", async () => {
    const documento = montarFormularioAutoavaliacao({ turma: TURMA_B });
    await abrir(documento, DA_TURMA_A);
    clicar(documento, "Preencher com as respostas");
    expect(marcadas(documento)).toEqual(DA_TURMA_A.respostas.opcoes);
    expect(
      documento.getElementById("sigga-aviso-autoavaliacao")?.textContent,
    ).toBe(
      "3 perguntas preenchidas. Revise e clique em Salvar Formulário de Avaliação.",
    );
  });

  it("esquece as respostas e tira os botões", async () => {
    const documento = montarFormularioAutoavaliacao({ turma: TURMA_B });
    const guardadas = await abrir(documento, DA_TURMA_A);
    clicar(documento, "Esquecer respostas guardadas");
    await gravacoesPendentes();
    expect(await guardadas.ler()).toBeUndefined();
    expect(textosDosBotoes(documento)).toEqual([]);
    expect(
      documento.getElementById("sigga-aviso-autoavaliacao")?.textContent,
    ).toBe("Respostas guardadas esquecidas.");
  });
});

describe("RepeticaoDeAutoavaliacao: quando não oferecer", () => {
  it("na própria turma de origem, só oferece esquecer", async () => {
    const documento = montarFormularioAutoavaliacao();
    await abrir(documento, DA_TURMA_A);
    expect(textosDosBotoes(documento)).toEqual([
      "Esquecer respostas guardadas",
    ]);
  });

  it("sem respostas guardadas, não mostra botões", async () => {
    const documento = montarFormularioAutoavaliacao({ turma: TURMA_B });
    await abrir(documento);
    expect(documento.getElementById("sigga-repetir-autoavaliacao")).toBeNull();
  });

  it("na avaliação do alunado, não age", async () => {
    const documento = montarFormularioAutoavaliacao({
      titulo: "Avaliação do alunado",
      turma: TURMA_B,
    });
    await abrir(documento, DA_TURMA_A);
    expect(documento.getElementById("sigga-repetir-autoavaliacao")).toBeNull();
  });
});
