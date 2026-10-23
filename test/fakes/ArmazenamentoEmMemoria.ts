import type { Armazenamento } from "../../src/comum/armazenamento";

/** `Armazenamento` em memória, para testes sem `chrome.storage`. */
export class ArmazenamentoEmMemoria implements Armazenamento {
  readonly itens = new Map<string, unknown>();

  async ler(chave: string): Promise<unknown> {
    return this.itens.get(chave);
  }

  async gravar(chave: string, valor: unknown): Promise<void> {
    this.itens.set(chave, valor);
  }

  async remover(chave: string): Promise<void> {
    this.itens.delete(chave);
  }
}
