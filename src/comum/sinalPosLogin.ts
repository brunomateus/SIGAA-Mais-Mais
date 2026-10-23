import type { ArmazenamentoDaAba } from "./armazenamento";

const CHAVE_SINAL = "sigga_pos_login";

/**
 * Sinal de uso único que a tela de vínculos deixa ao entrar num vínculo, para que
 * a página seguinte saiba que é a primeira chegada após o login. Usa o
 * `sessionStorage` da página: é por aba e compartilhado entre as páginas do SIGAA.
 *
 * @example
 * const sinal = new SinalPosLogin(sessionStorage);
 * sinal.marcar(); // em vinculos.jsf
 * if (sinal.consumir()) abrirPortal(); // em paginaInicial.do
 */
export class SinalPosLogin {
  private readonly armazenamento: ArmazenamentoDaAba;

  constructor(armazenamento: ArmazenamentoDaAba) {
    this.armazenamento = armazenamento;
  }

  marcar(): void {
    this.armazenamento.setItem(CHAVE_SINAL, "1");
  }

  /** Retorna se o sinal estava marcado, removendo-o. */
  consumir(): boolean {
    const marcado = this.armazenamento.getItem(CHAVE_SINAL) !== null;
    this.armazenamento.removeItem(CHAVE_SINAL);
    return marcado;
  }
}
