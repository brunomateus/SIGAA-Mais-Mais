import { corpoDoComando, lerComandoJsf } from "../comum/comandoJsf";
import type { EnviarFormulario } from "../comum/envioFormulario";
import {
  encontrarLinkRemocao,
  encontrarQuadroConteudoProgramado,
  type TopicoDeAula,
} from "./paginaConteudoProgramado";

/** Quem acompanha o lote: recebe o progresso e pode pedir para parar. */
export interface AcompanhamentoRemocao {
  /** `concluidos` tópicos de aula já foram removidos. */
  atualizar(concluidos: number): void;
  foiParado(): boolean;
}

export interface PedidoRemocao {
  topicos: TopicoDeAula[];
  /** A tela Conteúdo Programado de onde parte a primeira remoção. */
  documento: Document;
  acompanhamento: AcompanhamentoRemocao;
}

export type SituacaoRemocao = "concluida" | "falha" | "interrompida";

export interface ResultadoRemocao {
  total: number;
  removidos: number;
  situacao: SituacaoRemocao;
  falha?: { topico: TopicoDeAula; motivo: string };
  /** A tela mais recente devolvida pelo SIGAA, com o ViewState válido. */
  documentoFinal: Document;
}

export interface DependenciasRemovedor {
  enviarFormulario: EnviarFormulario;
  interpretarHtml: (html: string) => Document;
}

type Tentativa =
  { ok: true; documento: Document } | { ok: false; motivo: string };

/**
 * Remove tópicos de aula um após o outro, em segundo plano, enviando o mesmo POST
 * que a lixeira enviaria. Cada resposta traz o ViewState e os links da remoção
 * seguinte. Para na primeira falha (ver docs/adr/0001).
 *
 * @example
 * const resultado = await removedor.remover({ topicos, documento, acompanhamento });
 */
export class RemovedorDeTopicos {
  private readonly dependencias: DependenciasRemovedor;

  constructor(dependencias: DependenciasRemovedor) {
    this.dependencias = dependencias;
  }

  async remover(pedido: PedidoRemocao): Promise<ResultadoRemocao> {
    const { topicos, acompanhamento } = pedido;
    const resultado = (situacao: SituacaoRemocao, removidos: number) => ({
      total: topicos.length,
      removidos,
      situacao,
      documentoFinal: documento,
    });
    let documento = pedido.documento;
    for (const [indice, topico] of topicos.entries()) {
      if (acompanhamento.foiParado()) return resultado("interrompida", indice);
      acompanhamento.atualizar(indice);
      const tentativa = await this.removerUm(documento, topico);
      if (!tentativa.ok)
        return {
          ...resultado("falha", indice),
          falha: { topico, motivo: tentativa.motivo },
        };
      documento = tentativa.documento;
    }
    acompanhamento.atualizar(topicos.length);
    return resultado("concluida", topicos.length);
  }

  private async removerUm(
    documento: Document,
    topico: TopicoDeAula,
  ): Promise<Tentativa> {
    const link = encontrarLinkRemocao(documento, topico.id);
    const comando = link && lerComandoJsf(link);
    if (!comando)
      return {
        ok: false,
        motivo: `lixeira do tópico id=${topico.id} ausente; esperado a[onclick*="confirm("] com jsfcljs e ",id,${topico.id}"`,
      };
    try {
      const html = await this.dependencias.enviarFormulario(
        comando.acao,
        corpoDoComando(comando),
      );
      return conferirResposta(this.dependencias.interpretarHtml(html), topico);
    } catch (erro) {
      return { ok: false, motivo: String(erro) };
    }
  }
}

// A resposta de sucesso é a própria tela, já sem o tópico; qualquer outra (ex.: login) é falha
function conferirResposta(resposta: Document, topico: TopicoDeAula): Tentativa {
  if (!encontrarQuadroConteudoProgramado(resposta))
    return {
      ok: false,
      motivo: `resposta não é a tela Conteúdo Programado (título: "${resposta.title}"); sessão expirada?`,
    };
  if (encontrarLinkRemocao(resposta, topico.id))
    return {
      ok: false,
      motivo: `tópico id=${topico.id} continua na lista; esperado que sumisse após a remoção`,
    };
  return { ok: true, documento: resposta };
}
