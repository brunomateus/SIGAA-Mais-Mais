import type { Armazenamento } from "./armazenamento";

const CHAVE_OCULTAR_NECESSIDADES = "ocultar_necessidades_frequencia";

// Sem preferência salva (ou com valor inválido), protege a privacidade
const OCULTAR_POR_PADRAO = true;

function comoOcultar(valor: unknown): boolean {
  return typeof valor === "boolean" ? valor : OCULTAR_POR_PADRAO;
}

/**
 * Preferência de ocultar os indicadores de necessidades especiais na lista de
 * frequência. Ocultar é o padrão.
 *
 * @example
 * const preferencia = new PreferenciaPrivacidade(new ArmazenamentoChrome(chrome.storage.local));
 * preferencia.aoMudar((ocultar) => console.log(ocultar ? "ocultos" : "visíveis"));
 * await preferencia.salvarOcultar(false);
 */
export class PreferenciaPrivacidade {
  private readonly armazenamento: Armazenamento;

  constructor(armazenamento: Armazenamento) {
    this.armazenamento = armazenamento;
  }

  async lerOcultar(): Promise<boolean> {
    return comoOcultar(
      await this.armazenamento.ler(CHAVE_OCULTAR_NECESSIDADES),
    );
  }

  salvarOcultar(ocultar: boolean): Promise<void> {
    return this.armazenamento.gravar(CHAVE_OCULTAR_NECESSIDADES, ocultar);
  }

  aoMudar(ouvinte: (ocultar: boolean) => void): void {
    this.armazenamento.aoMudar(CHAVE_OCULTAR_NECESSIDADES, (valor) =>
      ouvinte(comoOcultar(valor)),
    );
  }
}
