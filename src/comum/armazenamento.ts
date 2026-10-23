/** Armazenamento chave-valor assíncrono, próprio do projeto, para que o código não dependa de `chrome.storage`. */
export interface Armazenamento {
  ler(chave: string): Promise<unknown>;
  gravar(chave: string, valor: unknown): Promise<void>;
  remover(chave: string): Promise<void>;
  /** Chama `ouvinte` com o novo valor (ou `undefined`, se removido) sempre que `chave` mudar. */
  aoMudar(chave: string, ouvinte: (valor: unknown) => void): void;
}

/** O subconjunto síncrono da Web Storage API (`sessionStorage`): por aba e por origem. */
export type ArmazenamentoDaAba = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

/** Mudanças de chaves, no formato de `chrome.storage.onChanged`. */
export type MudancasNoArmazenamento = Record<string, { newValue?: unknown }>;

/** O subconjunto de `chrome.storage.StorageArea` usado por `ArmazenamentoChrome`. */
export interface AreaDeArmazenamentoChrome {
  get(chave: string): Promise<Record<string, unknown>>;
  set(itens: Record<string, unknown>): Promise<void>;
  remove(chave: string): Promise<void>;
  onChanged: {
    addListener(ouvinte: (mudancas: MudancasNoArmazenamento) => void): void;
  };
}

/**
 * `Armazenamento` sobre uma área do `chrome.storage`, compartilhada por todos os
 * contextos da extensão (popup e content scripts), ao contrário do `localStorage`.
 *
 * @example
 * const armazenamento = new ArmazenamentoChrome(chrome.storage.local);
 * await armazenamento.gravar("vinculo_favorito", "Servidor");
 */
export class ArmazenamentoChrome implements Armazenamento {
  private readonly area: AreaDeArmazenamentoChrome;

  constructor(area: AreaDeArmazenamentoChrome) {
    this.area = area;
  }

  async ler(chave: string): Promise<unknown> {
    const itens = await this.area.get(chave);
    return itens[chave];
  }

  gravar(chave: string, valor: unknown): Promise<void> {
    return this.area.set({ [chave]: valor });
  }

  remover(chave: string): Promise<void> {
    return this.area.remove(chave);
  }

  aoMudar(chave: string, ouvinte: (valor: unknown) => void): void {
    this.area.onChanged.addListener((mudancas) => {
      const mudanca = mudancas[chave];
      if (mudanca) ouvinte(mudanca.newValue);
    });
  }
}
