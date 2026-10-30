import { describe, expect, it } from "vitest";
import {
  listarLinhasTopicos,
  type TopicoDeAula,
} from "../../src/topicos/paginaConteudoProgramado";
import { SelecaoDeTopicos } from "../../src/topicos/selecaoTopicos";
import {
  criarTopicosSimulados,
  montarConteudoProgramado,
} from "../suporte/paginaConteudoProgramado";

function instalar(quantidade: number) {
  const documento = montarConteudoProgramado(criarTopicosSimulados(quantidade));
  const tabela = documento.querySelector<HTMLTableElement>("table.listing")!;
  const pedidos: TopicoDeAula[][] = [];
  const selecao = new SelecaoDeTopicos(
    tabela,
    listarLinhasTopicos(tabela),
    (t) => pedidos.push(t),
  );
  selecao.instalar();
  const caixas = [
    ...tabela.querySelectorAll<HTMLInputElement>("tbody input[type=checkbox]"),
  ];
  const todos = tabela.querySelector<HTMLInputElement>(
    "thead input[type=checkbox]",
  )!;
  const botao = documento.getElementById(
    "sigga-remover-topicos",
  ) as HTMLButtonElement;
  const clicar = (indice: number, shiftKey = false) =>
    caixas[indice]!.dispatchEvent(
      new MouseEvent("click", { bubbles: true, shiftKey }),
    );
  const ids = () => selecao.selecionados().map((t) => t.id.slice(-1));
  return { documento, selecao, caixas, todos, botao, clicar, ids, pedidos };
}

describe("SelecaoDeTopicos", () => {
  it("insere uma caixa por linha e a barra de remoção, oculta, abaixo da tabela", () => {
    const tela = instalar(3);
    expect(tela.caixas).toHaveLength(3);
    const barra = tela.botao.parentElement!;
    expect(barra.style.display).toBe("none");
    expect(barra.previousElementSibling?.matches("table.listing")).toBe(true);
    expect(barra.style.position).toBe("sticky");
    expect(barra.style.bottom).toBe("0px");
  });

  it("as caixas não têm name, para não entrar nos envios do formulário JSF", () => {
    expect(instalar(2).caixas.every((caixa) => caixa.name === "")).toBe(true);
  });

  it("mostra a barra ao marcar um tópico e a oculta ao desmarcar todos", () => {
    const tela = instalar(3);
    const barra = tela.botao.parentElement!;
    tela.clicar(1);
    expect(barra.style.display).toBe("flex");
    tela.clicar(1);
    expect(barra.style.display).toBe("none");
  });

  it("conta os marcados no botão", () => {
    const tela = instalar(3);
    tela.clicar(0);
    tela.clicar(2);
    expect(tela.botao.textContent).toBe("Remover selecionados (2)");
    expect(tela.todos.indeterminate).toBe(true);
  });

  it("Shift+clique marca o intervalo desde o último clique", () => {
    const tela = instalar(6);
    tela.clicar(1);
    tela.clicar(4, true);
    expect(tela.ids()).toEqual(["2", "3", "4", "5"]);
  });

  it("Shift+clique numa caixa marcada desmarca o intervalo", () => {
    const tela = instalar(5);
    tela.todos.click();
    tela.clicar(1);
    tela.clicar(3, true);
    expect(tela.ids()).toEqual(["1", "5"]);
  });

  it("'selecionar todos' marca e desmarca todas as linhas", () => {
    const tela = instalar(3);
    tela.todos.click();
    expect(tela.selecao.selecionados()).toHaveLength(3);
    tela.todos.click();
    expect(tela.selecao.selecionados()).toHaveLength(0);
  });

  it("o botão entrega os tópicos marcados, na ordem da tabela", () => {
    const tela = instalar(3);
    tela.clicar(2);
    tela.clicar(0);
    tela.botao.click();
    expect(tela.pedidos.map((p) => p.map((t) => t.descricao))).toEqual([
      ["01 - Assunto 1", "03 - Assunto 3"],
    ]);
  });
});
