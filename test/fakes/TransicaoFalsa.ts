import type { EncerrarTransicao } from "../../src/comum/transicao";

/** Registra as camadas de transição mostradas e quantas foram encerradas. */
export class TransicaoFalsa {
  readonly mensagens: string[] = [];
  encerradas = 0;

  readonly mostrar = (mensagem: string): EncerrarTransicao => {
    this.mensagens.push(mensagem);
    return () => {
      this.encerradas += 1;
    };
  };
}
