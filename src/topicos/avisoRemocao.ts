import { descreverResumo, type ResumoRemocao } from "./resumoRemocao";

const ID_AVISO = "sigga-aviso-remocao-topicos";

const CORES: Record<"sucesso" | "alerta", Partial<CSSStyleDeclaration>> = {
  sucesso: {
    background: "#e8f5e9",
    border: "1px solid #2e7d32",
    color: "#1b5e20",
  },
  alerta: {
    background: "#fff8e1",
    border: "1px solid #c9a227",
    color: "#5d4300",
  },
};

/**
 * Mostra, logo abaixo do título do quadro Conteúdo Programado, o resultado do
 * último lote: verde quando tudo foi removido, amarelo quando falhou ou parou.
 *
 * @example
 * mostrarAvisoRemocao(quadro, { total: 12, removidos: 12, situacao: "concluida" });
 */
export function mostrarAvisoRemocao(
  quadro: HTMLFieldSetElement,
  resumo: ResumoRemocao,
): void {
  const documento = quadro.ownerDocument;
  documento.getElementById(ID_AVISO)?.remove();
  const aviso = documento.createElement("div");
  aviso.id = ID_AVISO;
  aviso.setAttribute("role", "status");
  aviso.textContent = descreverResumo(resumo);
  Object.assign(aviso.style, {
    margin: "8px 0",
    padding: "8px 12px",
    borderRadius: "4px",
    ...CORES[resumo.situacao === "concluida" ? "sucesso" : "alerta"],
  });
  quadro.querySelector(":scope > legend")?.after(aviso);
}
