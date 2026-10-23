import type { Armazenamento } from "./armazenamento";

// Chave mantida desde o esboço em JS, para preservar favoritos já salvos
const CHAVE_FAVORITO = "vinculo_favorito";

/** Valor especial de favorito: entra automaticamente quando a tela tem um único vínculo. */
export const FAVORITO_AUTOMATICO = "__AUTO__";

/**
 * Lê e grava o vínculo favorito: o rótulo de um vínculo, `FAVORITO_AUTOMATICO`
 * ou nenhum (`undefined`).
 *
 * @example
 * const favoritos = new RepositorioFavorito(new ArmazenamentoChrome(chrome.storage.local));
 * await favoritos.salvar("Servidor");
 */
export class RepositorioFavorito {
  private readonly armazenamento: Armazenamento;

  constructor(armazenamento: Armazenamento) {
    this.armazenamento = armazenamento;
  }

  async ler(): Promise<string | undefined> {
    const valor = await this.armazenamento.ler(CHAVE_FAVORITO);
    return typeof valor === "string" ? valor : undefined;
  }

  salvar(rotulo: string): Promise<void> {
    return this.armazenamento.gravar(CHAVE_FAVORITO, rotulo);
  }

  limpar(): Promise<void> {
    return this.armazenamento.remover(CHAVE_FAVORITO);
  }
}
