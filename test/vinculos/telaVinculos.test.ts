import { describe, expect, it } from "vitest";
import {
  FAVORITO_AUTOMATICO,
  RepositorioFavorito,
} from "../../src/comum/favorito";
import { encontrarVinculos } from "../../src/vinculos/listaVinculos";
import { TelaVinculos } from "../../src/vinculos/telaVinculos";
import { ArmazenamentoEmMemoria } from "../fakes/ArmazenamentoEmMemoria";
import { ConfirmadorFalso } from "../fakes/ConfirmadorFalso";
import {
  aguardarTarefasPendentes,
  montarPaginaVinculos,
  type VinculoDaPagina,
} from "../suporte/paginaVinculos";

const VINCULOS: VinculoDaPagina[] = [
  { rotulo: "Servidor" },
  { rotulo: "Discente", inativo: true },
];

async function abrirTela(
  favoritoSalvo?: string,
  vinculos: VinculoDaPagina[] = VINCULOS,
) {
  const pagina = montarPaginaVinculos(vinculos);
  const favoritos = new RepositorioFavorito(new ArmazenamentoEmMemoria());
  if (favoritoSalvo) await favoritos.salvar(favoritoSalvo);
  const confirmador = new ConfirmadorFalso();
  const dependencias = {
    favoritos,
    confirmar: confirmador.confirmar,
    documento: pagina.documento,
  };
  await new TelaVinculos(
    encontrarVinculos(pagina.documento),
    dependencias,
  ).iniciar();
  return { pagina, favoritos, confirmador };
}

const textosDosBotoes = (documento: Document) =>
  [...documento.querySelectorAll("[data-ext-fav]")].map((b) => b.textContent);

describe("TelaVinculos com favorito salvo", () => {
  it("entra no favorito e marca o botão dele", async () => {
    const { pagina } = await abrirTela("servidor");
    expect(pagina.navegacoes).toEqual(["Servidor"]);
    expect(textosDosBotoes(pagina.documento)).toEqual([
      "★ Favorito ✓",
      "★ Favorito",
    ]);
  });

  it("entra num favorito inativo como em qualquer outro", async () => {
    const { pagina } = await abrirTela("Discente");
    expect(pagina.navegacoes).toEqual(["Discente"]);
  });

  it("no modo automático, entra quando há um único vínculo", async () => {
    const { pagina } = await abrirTela(FAVORITO_AUTOMATICO, [
      { rotulo: "Servidor" },
    ]);
    expect(pagina.navegacoes).toEqual(["Servidor"]);
  });

  it("no modo automático com vários vínculos, deixa escolher sem pedir confirmação", async () => {
    const { pagina, confirmador } = await abrirTela(FAVORITO_AUTOMATICO);
    pagina.links[1]!.click();
    expect(confirmador.pedidos).toHaveLength(0);
    expect(pagina.navegacoes).toEqual(["Discente"]);
  });
});

describe("TelaVinculos no primeiro acesso (sem favorito)", () => {
  it("não entra em nenhum vínculo sozinha", async () => {
    const { pagina } = await abrirTela();
    expect(pagina.navegacoes).toEqual([]);
  });

  it("segura o clique num vínculo até o usuário confirmar o favorito", async () => {
    const { pagina, confirmador } = await abrirTela();
    pagina.links[1]!.click();
    expect(pagina.navegacoes).toEqual([]);
    expect(confirmador.pedidos[0]?.mensagem).toContain("“Discente”");
  });

  it("ao confirmar, salva o favorito e entra no vínculo", async () => {
    const { pagina, favoritos, confirmador } = await abrirTela();
    pagina.links[0]!.click();
    confirmador.responder(true);
    await aguardarTarefasPendentes();
    expect(await favoritos.ler()).toBe("Servidor");
    expect(pagina.navegacoes).toEqual(["Servidor"]);
    expect(textosDosBotoes(pagina.documento)).toEqual([
      "★ Favorito ✓",
      "★ Favorito",
    ]);
  });

  it("ao cancelar, permanece na tela sem salvar e pergunta de novo no próximo clique", async () => {
    const { pagina, favoritos, confirmador } = await abrirTela();
    pagina.links[0]!.click();
    confirmador.responder(false);
    await aguardarTarefasPendentes();
    pagina.links[0]!.click();
    expect(await favoritos.ler()).toBeUndefined();
    expect(pagina.navegacoes).toEqual([]);
    expect(confirmador.pedidos).toHaveLength(2);
  });

  it("o botão ★ define o favorito sem navegar, e o clique seguinte não pede confirmação", async () => {
    const { pagina, favoritos, confirmador } = await abrirTela();
    pagina.documento.querySelectorAll("button")[1]!.click();
    await aguardarTarefasPendentes();
    expect(await favoritos.ler()).toBe("Discente");
    pagina.links[0]!.click();
    expect(confirmador.pedidos).toHaveLength(0);
    expect(pagina.navegacoes).toEqual(["Servidor"]);
  });
});
