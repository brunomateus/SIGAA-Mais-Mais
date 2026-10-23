import type { AnunciadorDeTransicao } from "../../src/comum/transicao";

/**
 * `AnunciadorDeTransicao` que só registra as mensagens. `aoAnunciar` permite ao
 * teste inspecionar o estado da página no exato momento do anúncio.
 */
export class AnunciadorFalso {
  readonly mensagens: string[] = [];
  aoAnunciar: (() => void) | undefined;

  readonly anunciar: AnunciadorDeTransicao = (mensagem) => {
    this.mensagens.push(mensagem);
    this.aoAnunciar?.();
  };
}
