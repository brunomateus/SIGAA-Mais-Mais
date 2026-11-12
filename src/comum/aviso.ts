/**
 * Cria um aviso amarelo de status, para o docente saber por que um atalho não
 * chegou ao destino. Quem chama decide onde inseri-lo.
 *
 * @example
 * calendario.before(criarAviso(document, "sigga-aviso-sem-aula", "Hoje não é data de aula."));
 */
export function criarAviso(
  documento: Document,
  id: string,
  texto: string,
): HTMLElement {
  const aviso = documento.createElement("div");
  aviso.id = id;
  aviso.setAttribute("role", "status");
  aviso.textContent = texto;
  Object.assign(aviso.style, {
    margin: "8px 0",
    padding: "8px 12px",
    borderRadius: "4px",
    background: "#fff8e1",
    border: "1px solid #c9a227",
    color: "#5d4300",
  });
  return aviso;
}
