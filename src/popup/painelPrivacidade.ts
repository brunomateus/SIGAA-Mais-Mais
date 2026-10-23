import type { PreferenciaPrivacidade } from "../comum/preferenciaPrivacidade";

/**
 * Seção do popup com a opção de ocultar os indicadores de necessidades especiais
 * na lista de frequência.
 *
 * @example
 * await new PainelPrivacidade(preferencia, caixaDeSelecao).iniciar();
 */
export class PainelPrivacidade {
  private readonly preferencia: PreferenciaPrivacidade;
  private readonly caixaOcultar: HTMLInputElement;

  constructor(
    preferencia: PreferenciaPrivacidade,
    caixaOcultar: HTMLInputElement,
  ) {
    this.preferencia = preferencia;
    this.caixaOcultar = caixaOcultar;
  }

  async iniciar(): Promise<void> {
    this.caixaOcultar.checked = await this.preferencia.lerOcultar();
    this.caixaOcultar.addEventListener(
      "change",
      () => void this.preferencia.salvarOcultar(this.caixaOcultar.checked),
    );
  }
}
