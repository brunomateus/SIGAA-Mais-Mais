// Normaliza um texto para comparação: sem acentos, minúsculo, espaços colapsados.
export function norm(s: string | null | undefined): string {
  return (s ?? "").trim().toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ");
}

// Executa `tentar` imediatamente e, enquanto ela retornar false, de novo a cada
// mutação do DOM — útil quando o SIGAA monta a página depois do document_idle.
export function quandoPronto(tentar: () => boolean, prazoMs = 15000): void {
  if (tentar()) return;
  const obs = new MutationObserver(() => { if (tentar()) obs.disconnect(); });
  obs.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => obs.disconnect(), prazoMs);
}
