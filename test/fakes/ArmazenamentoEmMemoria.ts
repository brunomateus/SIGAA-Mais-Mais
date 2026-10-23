import type { Armazenamento } from "../../src/comum/armazenamento";

/** `Armazenamento` em memória, para testes sem `chrome.storage`. */
export class ArmazenamentoEmMemoria implements Armazenamento {
  readonly itens = new Map<string, unknown>();
  private readonly ouvintes: Array<[string, (valor: unknown) => void]> = [];

  async ler(chave: string): Promise<unknown> {
    return this.itens.get(chave);
  }

  async gravar(chave: string, valor: unknown): Promise<void> {
    this.itens.set(chave, valor);
    this.notificar(chave, valor);
  }

  async remover(chave: string): Promise<void> {
    this.itens.delete(chave);
    this.notificar(chave, undefined);
  }

  aoMudar(chave: string, ouvinte: (valor: unknown) => void): void {
    this.ouvintes.push([chave, ouvinte]);
  }

  private notificar(chave: string, valor: unknown): void {
    for (const [chaveOuvida, ouvinte] of this.ouvintes) {
      if (chaveOuvida === chave) ouvinte(valor);
    }
  }
}
