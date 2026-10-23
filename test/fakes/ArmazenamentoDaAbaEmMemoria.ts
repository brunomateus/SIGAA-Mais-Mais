import type { ArmazenamentoDaAba } from "../../src/comum/armazenamento";

/** Imita o `sessionStorage` (`getItem`/`setItem`/`removeItem`) em memória. */
export class ArmazenamentoDaAbaEmMemoria implements ArmazenamentoDaAba {
  readonly itens = new Map<string, string>();

  getItem(chave: string): string | null {
    return this.itens.get(chave) ?? null;
  }

  setItem(chave: string, valor: string): void {
    this.itens.set(chave, valor);
  }

  removeItem(chave: string): void {
    this.itens.delete(chave);
  }
}
