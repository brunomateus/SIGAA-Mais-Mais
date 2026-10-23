import type { AreaDeArmazenamentoChrome } from "../../src/comum/armazenamento";

/** Imita uma área do `chrome.storage` (`get`/`set`/`remove`) em memória. */
export class AreaChromeEmMemoria implements AreaDeArmazenamentoChrome {
  readonly itens: Record<string, unknown> = {};

  async get(chave: string): Promise<Record<string, unknown>> {
    return chave in this.itens ? { [chave]: this.itens[chave] } : {};
  }

  async set(novos: Record<string, unknown>): Promise<void> {
    Object.assign(this.itens, novos);
  }

  async remove(chave: string): Promise<void> {
    delete this.itens[chave];
  }
}
