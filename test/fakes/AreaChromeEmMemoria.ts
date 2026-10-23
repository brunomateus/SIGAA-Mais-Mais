import type {
  AreaDeArmazenamentoChrome,
  MudancasNoArmazenamento,
} from "../../src/comum/armazenamento";

type OuvinteDeMudancas = (mudancas: MudancasNoArmazenamento) => void;

/** Imita uma área do `chrome.storage` (`get`/`set`/`remove`/`onChanged`) em memória. */
export class AreaChromeEmMemoria implements AreaDeArmazenamentoChrome {
  readonly itens: Record<string, unknown> = {};
  private readonly ouvintes: OuvinteDeMudancas[] = [];

  readonly onChanged = {
    addListener: (ouvinte: OuvinteDeMudancas): void => {
      this.ouvintes.push(ouvinte);
    },
  };

  async get(chave: string): Promise<Record<string, unknown>> {
    return chave in this.itens ? { [chave]: this.itens[chave] } : {};
  }

  async set(novos: Record<string, unknown>): Promise<void> {
    Object.assign(this.itens, novos);
    const mudancas = Object.fromEntries(
      Object.entries(novos).map(([chave, valor]) => [
        chave,
        { newValue: valor },
      ]),
    );
    this.ouvintes.forEach((ouvinte) => ouvinte(mudancas));
  }

  async remove(chave: string): Promise<void> {
    delete this.itens[chave];
    this.ouvintes.forEach((ouvinte) => ouvinte({ [chave]: {} }));
  }
}
