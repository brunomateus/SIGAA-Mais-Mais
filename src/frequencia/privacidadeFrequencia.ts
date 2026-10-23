import type { PreferenciaPrivacidade } from "../comum/preferenciaPrivacidade";

// Atributo no <html> que desativa as regras de public/frequencia.css
const ATRIBUTO_NECESSIDADES = "data-sigga-necessidades";
const VALOR_VISIVEIS = "visiveis";

/**
 * Mostra ou oculta os indicadores de necessidades especiais. Ocultar é o estado
 * sem o atributo, de modo que o CSS do manifest já protege a página antes de
 * qualquer JavaScript rodar.
 *
 * @example
 * aplicarPrivacidade(document, false); // indicadores visíveis
 */
export function aplicarPrivacidade(
  documento: Document,
  ocultar: boolean,
): void {
  const raiz = documento.documentElement;
  if (ocultar) raiz.removeAttribute(ATRIBUTO_NECESSIDADES);
  else raiz.setAttribute(ATRIBUTO_NECESSIDADES, VALOR_VISIVEIS);
}

/**
 * Aplica a preferência salva e acompanha mudanças feitas no popup, sem recarregar.
 *
 * @example
 * await iniciarPrivacidadeFrequencia(preferencia, document);
 */
export async function iniciarPrivacidadeFrequencia(
  preferencia: PreferenciaPrivacidade,
  documento: Document,
): Promise<void> {
  preferencia.aoMudar((ocultar) => aplicarPrivacidade(documento, ocultar));
  aplicarPrivacidade(documento, await preferencia.lerOcultar());
}
