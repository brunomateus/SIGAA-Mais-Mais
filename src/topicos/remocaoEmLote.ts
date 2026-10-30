import { mostrarAvisoRemocao } from "./avisoRemocao";
import type { DialogoDeRemocao } from "./dialogoRemocao";
import {
  encontrarQuadroConteudoProgramado,
  listarLinhasTopicos,
  type TopicoDeAula,
} from "./paginaConteudoProgramado";
import type { PedidoRemocao, ResultadoRemocao } from "./removedorTopicos";
import { resumirRemocao, type RegistroDeResumoRemocao } from "./resumoRemocao";
import { SelecaoDeTopicos } from "./selecaoTopicos";

export interface DependenciasRemocaoEmLote {
  documento: Document;
  dialogo: DialogoDeRemocao;
  removedor: { remover(pedido: PedidoRemocao): Promise<ResultadoRemocao> };
  resumo: RegistroDeResumoRemocao;
  /** Reabre a tela a partir da resposta mais recente do SIGAA. */
  recarregar: (documentoAtualizado: Document) => void;
  registrarFalha: (falha: NonNullable<ResultadoRemocao["falha"]>) => void;
}

/**
 * Remoção de tópicos de aula em lote na tela Conteúdo Programado: instala a
 * seleção, confirma, remove em segundo plano e recarrega a tela uma única vez,
 * onde o resumo do lote é exibido.
 *
 * @example
 * new RemocaoDeTopicosEmLote(dependencias).iniciar();
 */
export class RemocaoDeTopicosEmLote {
  private readonly dependencias: DependenciasRemocaoEmLote;

  constructor(dependencias: DependenciasRemocaoEmLote) {
    this.dependencias = dependencias;
  }

  iniciar(): void {
    const quadro = encontrarQuadroConteudoProgramado(
      this.dependencias.documento,
    );
    if (!quadro) return;
    const resumo = this.dependencias.resumo.consumir();
    if (resumo) mostrarAvisoRemocao(quadro, resumo);
    const tabela = quadro.querySelector<HTMLTableElement>("table.listing");
    const linhas = tabela ? listarLinhasTopicos(tabela) : [];
    if (!tabela || linhas.length === 0) return;
    new SelecaoDeTopicos(
      tabela,
      linhas,
      (topicos) => void this.remover(topicos),
    ).instalar();
  }

  private async remover(topicos: TopicoDeAula[]): Promise<void> {
    const { dialogo, removedor, resumo, documento } = this.dependencias;
    if (topicos.length === 0 || !(await dialogo.confirmar(topicos))) return;
    const acompanhamento = dialogo.acompanhar(topicos.length);
    const resultado = await removedor.remover({
      topicos,
      documento,
      acompanhamento,
    });
    if (resultado.falha) this.dependencias.registrarFalha(resultado.falha);
    resumo.guardar(resumirRemocao(resultado));
    acompanhamento.finalizar();
    this.dependencias.recarregar(resultado.documentoFinal);
  }
}
