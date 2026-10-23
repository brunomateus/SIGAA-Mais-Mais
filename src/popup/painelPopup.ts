import {
  FAVORITO_AUTOMATICO,
  type RepositorioFavorito,
} from "../comum/favorito";

export interface ElementosPopup {
  status: HTMLElement;
  botaoAutomatico: HTMLButtonElement;
  botaoLimpar: HTMLButtonElement;
}

/**
 * Popup da extensão: mostra o favorito atual, ativa o modo automático e limpa o favorito.
 *
 * @example
 * await new PainelPopup(new RepositorioFavorito(armazenamento), elementos).iniciar();
 */
export class PainelPopup {
  private readonly favoritos: RepositorioFavorito;
  private readonly elementos: ElementosPopup;

  constructor(favoritos: RepositorioFavorito, elementos: ElementosPopup) {
    this.favoritos = favoritos;
    this.elementos = elementos;
  }

  async iniciar(): Promise<void> {
    this.elementos.botaoAutomatico.addEventListener(
      "click",
      () => void this.usarAutomatico(),
    );
    this.elementos.botaoLimpar.addEventListener(
      "click",
      () => void this.limpar(),
    );
    await this.exibirFavorito();
  }

  private async usarAutomatico(): Promise<void> {
    await this.favoritos.salvar(FAVORITO_AUTOMATICO);
    await this.exibirFavorito();
  }

  private async limpar(): Promise<void> {
    await this.favoritos.limpar();
    await this.exibirFavorito();
  }

  private async exibirFavorito(): Promise<void> {
    this.elementos.status.textContent = descreverFavorito(
      await this.favoritos.ler(),
    );
  }
}

/**
 * Texto do popup para um valor de favorito.
 *
 * @example
 * descreverFavorito("Servidor"); // "Favorito atual: Servidor"
 */
export function descreverFavorito(favorito: string | undefined): string {
  if (favorito === FAVORITO_AUTOMATICO)
    return "Automático: entra quando houver um único vínculo.";
  if (favorito) return `Favorito atual: ${favorito}`;
  return "Nenhum favorito salvo ainda.";
}
