const PRAZO_PADRAO_MS = 15000;

/**
 * Executa `tentar` imediatamente e, enquanto ela retornar false, de novo a cada
 * mutação do DOM sob `raiz`, até o prazo. Necessário porque o SIGAA (JSF) pode
 * montar a página depois do `document_idle` em que o content script roda.
 *
 * @example
 * tentarAteDomPronto(() => document.querySelector("ul li a") !== null);
 */
export function tentarAteDomPronto(
  tentar: () => boolean,
  raiz: Node = document.documentElement,
  prazoMs: number = PRAZO_PADRAO_MS,
): void {
  if (tentar()) return;
  const observador = new MutationObserver(() => {
    if (tentar()) observador.disconnect();
  });
  observador.observe(raiz, { childList: true, subtree: true });
  setTimeout(() => observador.disconnect(), prazoMs);
}
