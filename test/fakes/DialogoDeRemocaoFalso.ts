import type { DialogoDeRemocao } from "../../src/topicos/dialogoRemocao";
import type { TopicoDeAula } from "../../src/topicos/paginaConteudoProgramado";
import type { AcompanhamentoNaTela } from "../../src/topicos/progressoRemocao";

/**
 * Acompanhamento que registra o progresso e simula o botão "Parar" clicado
 * durante a remoção de número `pararApos` (a partir de 1).
 */
export class AcompanhamentoFalso implements AcompanhamentoNaTela {
  readonly progresso: number[] = [];
  pararApos: number | undefined;
  finalizado = false;

  atualizar(concluidos: number): void {
    this.progresso.push(concluidos);
  }

  foiParado(): boolean {
    return (
      this.pararApos !== undefined && this.progresso.length >= this.pararApos
    );
  }

  finalizar(): void {
    this.finalizado = true;
  }
}

/** `DialogoDeRemocao` que responde `resposta` e registra os tópicos apresentados. */
export class DialogoDeRemocaoFalso implements DialogoDeRemocao {
  readonly confirmacoes: TopicoDeAula[][] = [];
  readonly acompanhamento = new AcompanhamentoFalso();
  resposta = true;

  async confirmar(topicos: TopicoDeAula[]): Promise<boolean> {
    this.confirmacoes.push(topicos);
    return this.resposta;
  }

  acompanhar(): AcompanhamentoNaTela {
    return this.acompanhamento;
  }
}
