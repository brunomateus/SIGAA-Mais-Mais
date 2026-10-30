import { afterEach, describe, expect, it } from "vitest";
import { DialogoDeRemocaoNativo } from "../../src/topicos/dialogoRemocao";
import type { TopicoDeAula } from "../../src/topicos/paginaConteudoProgramado";

const TOPICOS: TopicoDeAula[] = [
  {
    id: "1",
    descricao: "01 - Apresentação",
    inicio: "10/08/2026",
    fim: "10/08/2026",
  },
  {
    id: "2",
    descricao: "02 - Modularidade",
    inicio: "11/08/2026",
    fim: "13/08/2026",
  },
];

function dialogoAberto(): HTMLDialogElement {
  const dialogo = document.querySelector("dialog");
  if (!dialogo)
    throw new Error("esperado um <dialog> no document.body, nenhum encontrado");
  return dialogo;
}

function botao(texto: string): HTMLButtonElement {
  const botoes = [...dialogoAberto().querySelectorAll("button")];
  const encontrado = botoes.find((b) => b.textContent === texto);
  if (!encontrado)
    throw new Error(
      `botão "${texto}" ausente; há: ${botoes.map((b) => b.textContent)}`,
    );
  return encontrado;
}

function textoDe(seletor: string): string {
  return dialogoAberto().querySelector(seletor)?.textContent ?? "";
}

describe("DialogoDeRemocaoNativo: confirmação", () => {
  afterEach(() =>
    document.querySelectorAll("dialog").forEach((d) => d.remove()),
  );

  it("lista os tópicos, avisa sobre os materiais e foca em Cancelar", () => {
    void new DialogoDeRemocaoNativo(document).confirmar(TOPICOS);
    expect(textoDe("h3")).toBe("Remover 2 tópicos de aula?");
    expect(
      [...dialogoAberto().querySelectorAll("li")].map((li) => li.textContent),
    ).toEqual([
      "01 - Apresentação (10/08/2026)",
      "02 - Modularidade (11/08/2026 a 13/08/2026)",
    ]);
    expect(textoDe("p")).toContain("não pode ser desfeita");
    expect(textoDe("p")).toContain("materiais vinculados");
    expect(document.activeElement?.textContent).toBe("Cancelar");
  });

  it("resolve true ao clicar em Remover N, mantendo o diálogo aberto para o progresso", async () => {
    const resposta = new DialogoDeRemocaoNativo(document).confirmar(TOPICOS);
    botao("Remover 2").click();
    expect(await resposta).toBe(true);
    expect(dialogoAberto().hasAttribute("open")).toBe(true);
  });

  it("resolve false e fecha ao cancelar ou com Esc", async () => {
    const porBotao = new DialogoDeRemocaoNativo(document).confirmar(TOPICOS);
    botao("Cancelar").click();
    expect(await porBotao).toBe(false);
    expect(document.querySelector("dialog")).toBeNull();
    const porEsc = new DialogoDeRemocaoNativo(document).confirmar(TOPICOS);
    dialogoAberto().close();
    expect(await porEsc).toBe(false);
  });
});

describe("DialogoDeRemocaoNativo: progresso", () => {
  afterEach(() =>
    document.querySelectorAll("dialog").forEach((d) => d.remove()),
  );

  async function iniciarProgresso() {
    const dialogo = new DialogoDeRemocaoNativo(document);
    const resposta = dialogo.confirmar(TOPICOS);
    botao("Remover 2").click();
    await resposta;
    return dialogo.acompanhar(2);
  }

  it("mostra o tópico em andamento e a barra", async () => {
    const progresso = await iniciarProgresso();
    progresso.atualizar(1);
    expect(textoDe("p")).toBe("Removendo 2 de 2…");
    expect(dialogoAberto().querySelector("progress")?.value).toBe(1);
  });

  it("Esc não fecha o diálogo enquanto o lote roda", async () => {
    await iniciarProgresso();
    const cancelamento = new Event("cancel", { cancelable: true });
    dialogoAberto().dispatchEvent(cancelamento);
    expect(cancelamento.defaultPrevented).toBe(true);
  });

  it("Parar pede a interrupção e avisa que termina a remoção em andamento", async () => {
    const progresso = await iniciarProgresso();
    botao("Parar").click();
    expect(progresso.foiParado()).toBe(true);
    expect(textoDe("p")).toBe("Parando após a remoção em andamento…");
  });

  it("finalizar avisa que a página vai ser atualizada", async () => {
    const progresso = await iniciarProgresso();
    progresso.finalizar();
    expect(textoDe("p")).toBe("Atualizando a página…");
    expect(botao("Parar").hidden).toBe(true);
  });
});
