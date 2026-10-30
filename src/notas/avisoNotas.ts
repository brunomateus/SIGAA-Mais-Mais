import { estilizarBotaoDialogo } from "../comum/dialogo";
import type { ResultadoPreenchimento } from "./aplicacaoNotas";
import type { PlanoDePreenchimento } from "./planoPreenchimento";

const ID_AVISO = "sigga-aviso-notas";

const ESTILO_AVISO: Partial<CSSStyleDeclaration> = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "12px",
  margin: "8px 0",
  padding: "8px 12px",
  borderRadius: "4px",
  background: "#fff8e1",
  border: "1px solid #c9a227",
  color: "#5d4300",
  fontSize: "13px",
};

/**
 * Resumo do preenchimento, só com as partes que aconteceram.
 *
 * @example
 * descreverPreenchimento(plano, resultado);
 * // "28 notas preenchidas · 2 matrículas da planilha não estão na turma. Revise e clique em Salvar."
 */
export function descreverPreenchimento(
  plano: PlanoDePreenchimento,
  resultado: ResultadoPreenchimento,
): string {
  const partes = [
    contar(
      resultado.preenchidas.length,
      "nota preenchida",
      "notas preenchidas",
    ),
    contar(
      plano.matriculasForaDaTurma.length,
      "matrícula da planilha não está na turma",
      "matrículas da planilha não estão na turma",
    ),
    contar(
      plano.alunosSemLinha.length,
      "aluno da turma sem linha na planilha",
      "alunos da turma sem linha na planilha",
    ),
    contar(plano.invalidas.length, "valor inválido", "valores inválidos"),
    contar(
      plano.matriculasRepetidas.length,
      "matrícula repetida na planilha",
      "matrículas repetidas na planilha",
    ),
    contar(
      resultado.foraDaAvaliacaoFinal.length,
      "nota de avaliação final ignorada (aluno fora da avaliação final)",
      "notas de avaliação final ignoradas (alunos fora da avaliação final)",
    ),
  ];
  const [preenchidas, ...demais] = partes;
  return `${[preenchidas, ...demais.filter((p) => !p.startsWith("0 "))].join(" · ")}. Revise e clique em Salvar.`;
}

function contar(quantidade: number, singular: string, plural: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}

/**
 * Mostra o resumo acima da tabela de notas, com o botão "Desfazer preenchimento".
 *
 * @example
 * mostrarAvisoNotas(tabela, "28 notas preenchidas…", () => resultado.desfazer());
 */
export function mostrarAvisoNotas(
  tabela: HTMLTableElement,
  texto: string,
  aoDesfazer: () => void,
): void {
  const documento = tabela.ownerDocument;
  documento.getElementById(ID_AVISO)?.remove();
  const aviso = documento.createElement("div");
  aviso.id = ID_AVISO;
  aviso.setAttribute("role", "status");
  Object.assign(aviso.style, ESTILO_AVISO);
  const mensagem = documento.createElement("span");
  mensagem.textContent = texto;
  const desfazer = documento.createElement("button");
  desfazer.type = "button";
  desfazer.textContent = "Desfazer preenchimento";
  estilizarBotaoDialogo(desfazer, "secundario");
  desfazer.addEventListener("click", () => {
    aoDesfazer();
    mensagem.textContent =
      "Preenchimento desfeito: os campos voltaram aos valores anteriores.";
    desfazer.remove();
  });
  aviso.append(mensagem, desfazer);
  tabela.before(aviso);
}
