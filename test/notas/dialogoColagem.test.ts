import { afterEach, describe, expect, it } from "vitest";
import { DialogoDeColagemNativo } from "../../src/notas/dialogoColagem";
import { listarAlunosNaTela } from "../../src/notas/telaLancarNotas";
import {
  criarAlunosSimulados,
  montarTelaLancarNotas,
  tabelaDeNotas,
} from "../suporte/telaLancarNotas";

function abrir() {
  const alunos = listarAlunosNaTela(
    tabelaDeNotas(montarTelaLancarNotas(criarAlunosSimulados(2))),
  );
  return new DialogoDeColagemNativo(document).obterPlano({
    alunos,
    unidades: [1, 2],
  });
}

function dialogoAberto(): HTMLDialogElement {
  const dialogo = document.querySelector("dialog");
  if (!dialogo)
    throw new Error("esperado um <dialog> no document.body, nenhum encontrado");
  return dialogo;
}

function botao(texto: string): HTMLButtonElement {
  const botoes = [...dialogoAberto().querySelectorAll("button")];
  const encontrado = botoes.find((b) => b.textContent?.startsWith(texto));
  if (!encontrado)
    throw new Error(
      `botão "${texto}" ausente; há: ${botoes.map((b) => b.textContent)}`,
    );
  return encontrado;
}

function colar(texto: string): void {
  dialogoAberto().querySelector("textarea")!.value = texto;
  botao("Continuar").click();
}

function listas(): HTMLSelectElement[] {
  return [...dialogoAberto().querySelectorAll("select")];
}

describe("DialogoDeColagemNativo", () => {
  afterEach(() =>
    document.querySelectorAll("dialog").forEach((d) => d.remove()),
  );

  it("começa pela caixa de colar, com o foco nela", () => {
    void abrir();
    expect(document.activeElement?.tagName).toBe("TEXTAREA");
  });

  it("sem matrículas da turma, mostra o erro e continua no passo de colar", () => {
    void abrir();
    colar("Nome\tU1\nA\t7");
    expect(dialogoAberto().textContent).toContain(
      "Nenhuma coluna com matrículas desta turma",
    );
    expect(dialogoAberto().querySelector("textarea")).not.toBeNull();
  });

  it("sugere as colunas, mostra a prévia e devolve o plano ao preencher", async () => {
    const resposta = abrir();
    colar("Matrícula\tU1\tU2\n500001\t7\t8");
    expect(listas().map((l) => l.getAttribute("aria-label"))).toEqual([
      "Unid. 1",
      "Unid. 2",
      "Avaliação final",
    ]);
    expect(listas().map((l) => l.value)).toEqual(["1", "2", ""]);
    expect(dialogoAberto().textContent).toContain("Unid. 1: — → 7,0");
    botao("Preencher 2 notas").click();
    expect((await resposta)?.alteracoes).toHaveLength(2);
    expect(document.querySelector("dialog")).toBeNull();
  });

  it("refaz a prévia ao trocar a coluna", () => {
    void abrir();
    colar("Matrícula\tU1\tU2\n500001\t7\t8");
    listas()[1]!.value = "";
    listas()[1]!.dispatchEvent(new Event("change"));
    expect(botao("Preencher").textContent).toBe("Preencher 1 nota");
  });

  it("sem notas a preencher, o botão Preencher fica desabilitado", () => {
    void abrir();
    colar("500001\t7");
    expect(botao("Preencher").disabled).toBe(true);
  });

  it("Voltar mantém o texto colado", () => {
    void abrir();
    colar("500001\t7");
    botao("Voltar").click();
    expect(dialogoAberto().querySelector("textarea")!.value).toBe("500001\t7");
  });

  it("Cancelar e Esc devolvem undefined", async () => {
    const porBotao = abrir();
    botao("Cancelar").click();
    expect(await porBotao).toBeUndefined();
    const porEsc = abrir();
    dialogoAberto().close();
    expect(await porEsc).toBeUndefined();
  });
});
