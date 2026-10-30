import { describe, expect, it } from "vitest";
import type { ResultadoRemocao } from "../../src/topicos/removedorTopicos";
import { RemovedorDeTopicos } from "../../src/topicos/removedorTopicos";
import { RemocaoDeTopicosEmLote } from "../../src/topicos/remocaoEmLote";
import { RegistroDeResumoRemocao } from "../../src/topicos/resumoRemocao";
import { ArmazenamentoDaAbaEmMemoria } from "../fakes/ArmazenamentoDaAbaEmMemoria";
import { DialogoDeRemocaoFalso } from "../fakes/DialogoDeRemocaoFalso";
import { ServidorSigaaFalso } from "../fakes/ServidorSigaaFalso";
import {
  criarTopicosSimulados,
  interpretarHtml,
  montarConteudoProgramado,
} from "../suporte/paginaConteudoProgramado";
import { montarPaginaTurma } from "../suporte/paginasAva";

// Uma aba: o sessionStorage sobrevive ao recarregamento da tela
function novaAba(quantidade: number) {
  const servidor = new ServidorSigaaFalso(criarTopicosSimulados(quantidade));
  const armazenamento = new ArmazenamentoDaAbaEmMemoria();
  const dialogo = new DialogoDeRemocaoFalso();
  const recarregamentos: Document[] = [];
  const falhas: NonNullable<ResultadoRemocao["falha"]>[] = [];
  const abrir = (documento: Document): Document => {
    new RemocaoDeTopicosEmLote({
      documento,
      dialogo,
      removedor: new RemovedorDeTopicos({
        enviarFormulario: servidor.enviarFormulario,
        interpretarHtml,
      }),
      resumo: new RegistroDeResumoRemocao(armazenamento),
      recarregar: (atualizado) => recarregamentos.push(atualizado),
      registrarFalha: (falha) => falhas.push(falha),
    }).iniciar();
    return documento;
  };
  const telaAtual = () =>
    montarConteudoProgramado(servidor.topicos, servidor.viewStateAtual);
  return { servidor, dialogo, recarregamentos, falhas, abrir, telaAtual };
}

// O clique dispara uma remoção assíncrona; espera as promessas pendentes
async function removerSelecionados(
  tela: Document,
  indices: number[],
): Promise<void> {
  const caixas = tela.querySelectorAll<HTMLInputElement>(
    "tbody input[type=checkbox]",
  );
  indices.forEach((indice) => caixas[indice]!.click());
  tela.getElementById("sigga-remover-topicos")!.click();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function aviso(tela: Document): string | null | undefined {
  return tela.getElementById("sigga-aviso-remocao-topicos")?.textContent;
}

describe("RemocaoDeTopicosEmLote", () => {
  it("remove os selecionados, recarrega uma vez e mostra o aviso de sucesso", async () => {
    const aba = novaAba(4);
    await removerSelecionados(aba.abrir(aba.telaAtual()), [0, 2]);
    expect(aba.servidor.topicos.map((t) => t.descricao)).toEqual([
      "02 - Assunto 2",
      "04 - Assunto 4",
    ]);
    expect(aba.recarregamentos).toHaveLength(1);
    expect(aba.dialogo.acompanhamento.finalizado).toBe(true);
    expect(aviso(aba.abrir(aba.telaAtual()))).toBe(
      "2 tópicos de aula removidos.",
    );
  });

  it("o aviso aparece só na primeira exibição após o lote", async () => {
    const aba = novaAba(2);
    await removerSelecionados(aba.abrir(aba.telaAtual()), [0]);
    aba.abrir(aba.telaAtual());
    expect(aviso(aba.abrir(aba.telaAtual()))).toBeUndefined();
  });

  it("ao cancelar a confirmação, nada é enviado nem recarregado", async () => {
    const aba = novaAba(3);
    aba.dialogo.resposta = false;
    await removerSelecionados(aba.abrir(aba.telaAtual()), [0, 1]);
    expect(aba.servidor.envios).toEqual([]);
    expect(aba.recarregamentos).toEqual([]);
  });

  it("numa falha, registra o motivo e mostra o resumo parcial após recarregar", async () => {
    const aba = novaAba(3);
    aba.servidor.falharEm = { id: "79533232", modo: "sessaoExpirada" };
    await removerSelecionados(aba.abrir(aba.telaAtual()), [0, 1, 2]);
    expect(aba.falhas.map((f) => f.topico.id)).toEqual(["79533232"]);
    expect(aba.recarregamentos).toHaveLength(1);
    expect(aviso(aba.abrir(aba.telaAtual()))).toContain(
      "1 de 3 tópicos de aula removidos",
    );
  });

  it("não instala a seleção em outras telas nem sem tópicos", () => {
    const aba = novaAba(1);
    const turma = aba.abrir(montarPaginaTurma().documento);
    expect(turma.getElementById("sigga-remover-topicos")).toBeNull();
    const vazia = aba.abrir(montarConteudoProgramado([]));
    expect(vazia.getElementById("sigga-remover-topicos")).toBeNull();
  });
});
