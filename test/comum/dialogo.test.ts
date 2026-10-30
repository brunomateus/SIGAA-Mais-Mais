import { afterEach, describe, expect, it } from "vitest";
import {
  confirmarComDialogo,
  prepararDialogo,
  type PedidoConfirmacao,
} from "../../src/comum/dialogo";

const PEDIDO: PedidoConfirmacao = {
  titulo: "Definir vínculo favorito?",
  mensagem: "“Servidor” será selecionado automaticamente.",
  rotuloConfirmar: "Confirmar e entrar",
};

function dialogoAberto(): HTMLDialogElement {
  const dialogo = document.querySelector("dialog");
  if (!dialogo)
    throw new Error("esperado um <dialog> no document.body, nenhum encontrado");
  return dialogo;
}

function clicarBotao(texto: string): void {
  const botoes = [...dialogoAberto().querySelectorAll("button")];
  const botao = botoes.find((b) => b.textContent === texto);
  if (!botao)
    throw new Error(
      `botão "${texto}" não encontrado; há: ${botoes.map((b) => b.textContent)}`,
    );
  botao.click();
}

describe("confirmarComDialogo", () => {
  afterEach(() =>
    document.querySelectorAll("dialog").forEach((d) => d.remove()),
  );

  it("abre um diálogo modal com título, mensagem e foco no botão de confirmar", () => {
    void confirmarComDialogo(PEDIDO);
    const dialogo = dialogoAberto();
    expect(dialogo.hasAttribute("open")).toBe(true);
    expect(dialogo.querySelector("h3")?.textContent).toBe(PEDIDO.titulo);
    expect(dialogo.querySelector("p")?.textContent).toBe(PEDIDO.mensagem);
    expect(document.activeElement?.textContent).toBe(PEDIDO.rotuloConfirmar);
  });

  it("resolve true e remove o diálogo ao confirmar", async () => {
    const resposta = confirmarComDialogo(PEDIDO);
    clicarBotao(PEDIDO.rotuloConfirmar);
    expect(await resposta).toBe(true);
    expect(document.querySelector("dialog")).toBeNull();
  });

  it("resolve false ao clicar em Cancelar", async () => {
    const resposta = confirmarComDialogo(PEDIDO);
    clicarBotao("Cancelar");
    expect(await resposta).toBe(false);
  });

  it("resolve false quando o diálogo é fechado sem botão (Esc)", async () => {
    const resposta = confirmarComDialogo(PEDIDO);
    dialogoAberto().close();
    expect(await resposta).toBe(false);
  });
});

describe("prepararDialogo", () => {
  it("centraliza o diálogo apesar do CSS do SIGAA e escurece o fundo", () => {
    const dialogo = document.createElement("dialog");
    prepararDialogo(dialogo);
    expect(dialogo.style.position).toBe("fixed");
    expect(dialogo.style.margin).toBe("auto");
    const estilo = document.getElementById("sigga-dialogo-estilo");
    expect(estilo?.textContent).toContain("dialog.sigga-dialogo::backdrop");
    expect(dialogo.classList.contains("sigga-dialogo")).toBe(true);
  });

  it("insere a folha de estilo uma única vez", () => {
    prepararDialogo(document.createElement("dialog"));
    prepararDialogo(document.createElement("dialog"));
    expect(document.querySelectorAll("#sigga-dialogo-estilo")).toHaveLength(1);
  });
});
