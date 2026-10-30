import { describe, expect, it } from "vitest";
import { listarLinhasTopicos } from "../../src/topicos/paginaConteudoProgramado";
import { RemovedorDeTopicos } from "../../src/topicos/removedorTopicos";
import { AcompanhamentoFalso } from "../fakes/DialogoDeRemocaoFalso";
import { ServidorSigaaFalso } from "../fakes/ServidorSigaaFalso";
import {
  criarTopicosSimulados,
  interpretarHtml,
  montarConteudoProgramado,
} from "../suporte/paginaConteudoProgramado";

function prepararLote(quantidade: number) {
  const simulados = criarTopicosSimulados(quantidade);
  const servidor = new ServidorSigaaFalso(simulados);
  const documento = montarConteudoProgramado(
    simulados,
    servidor.viewStateAtual,
  );
  const tabela = documento.querySelector<HTMLTableElement>("table.listing")!;
  const topicos = listarLinhasTopicos(tabela).map((l) => l.topico);
  const removedor = new RemovedorDeTopicos({
    enviarFormulario: servidor.enviarFormulario,
    interpretarHtml,
  });
  const acompanhamento = new AcompanhamentoFalso();
  const remover = () =>
    removedor.remover({ topicos, documento, acompanhamento });
  return { servidor, topicos, acompanhamento, remover };
}

describe("RemovedorDeTopicos", () => {
  it("remove todos, um após o outro, com o ViewState de cada resposta", async () => {
    const lote = prepararLote(3);
    const resultado = await lote.remover();
    expect(resultado).toMatchObject({
      total: 3,
      removidos: 3,
      situacao: "concluida",
    });
    expect(lote.servidor.topicos).toEqual([]);
    expect(
      lote.servidor.envios.map((c) => c.get("javax.faces.ViewState")),
    ).toEqual(["j_id1", "j_id2", "j_id3"]);
    expect(lote.acompanhamento.progresso).toEqual([0, 1, 2, 3]);
  });

  it("envia os campos que a lixeira enviaria", async () => {
    const lote = prepararLote(1);
    await lote.remover();
    expect(Object.fromEntries(lote.servidor.envios[0]!)).toMatchObject({
      j_id_jsp_1_101: "j_id_jsp_1_101",
      "j_id_jsp_1_101:j_id_132": "j_id_jsp_1_101:j_id_132",
      id: "79533231",
    });
  });

  it("devolve a resposta mais recente para o recarregamento final", async () => {
    const resultado = await prepararLote(2).remover();
    const viewState = resultado.documentoFinal.querySelector<HTMLInputElement>(
      'input[name="javax.faces.ViewState"]',
    );
    expect(viewState?.value).toBe("j_id3");
  });

  it.each([
    ["erroDeRede", "Failed to fetch"],
    ["sessaoExpirada", "não é a tela Conteúdo Programado"],
    ["naoRemove", "continua na lista"],
  ] as const)(
    "para na primeira falha (%s) sem tentar os seguintes",
    async (modo, motivo) => {
      const lote = prepararLote(4);
      lote.servidor.falharEm = { id: lote.topicos[1]!.id, modo };
      const resultado = await lote.remover();
      expect(resultado).toMatchObject({ removidos: 1, situacao: "falha" });
      expect(resultado.falha?.topico).toEqual(lote.topicos[1]);
      expect(resultado.falha?.motivo).toContain(motivo);
      expect(lote.servidor.envios).toHaveLength(2);
    },
  );

  it("interrompe quando o docente para, sem iniciar a próxima remoção", async () => {
    const lote = prepararLote(4);
    lote.acompanhamento.pararApos = 2;
    const resultado = await lote.remover();
    expect(resultado).toMatchObject({ removidos: 2, situacao: "interrompida" });
    expect(lote.servidor.topicos.map((t) => t.id)).toEqual(
      lote.topicos.slice(2).map((t) => t.id),
    );
  });
});
