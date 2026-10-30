import type { AlunoNaTela } from "./telaLancarNotas";
import {
  rotularAlvo,
  type AlteracaoDeNota,
  type PlanoDePreenchimento,
} from "./planoPreenchimento";

const ESTILO_LISTA: Partial<CSSStyleDeclaration> = {
  maxHeight: "180px",
  overflowY: "auto",
  margin: "4px 0 12px",
  padding: "6px 12px 6px 28px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  fontSize: "13px",
  lineHeight: "1.5",
};

/**
 * Monta a prévia do plano: notas a preencher (antes → depois) e, em seções
 * separadas, o que fica de fora. Seções vazias não aparecem.
 *
 * @example
 * container.replaceChildren(...montarPrevia(document, plano));
 */
export function montarPrevia(
  documento: Document,
  plano: PlanoDePreenchimento,
): HTMLElement[] {
  const secao = (titulo: string, itens: string[]): HTMLElement[] =>
    itens.length === 0
      ? []
      : criarSecao(documento, `${titulo} (${itens.length})`, itens);
  return [
    ...secao(
      "Notas a preencher",
      descreverAlteracoesPorAluno(plano.alteracoes),
    ),
    ...secao(
      "Valores inválidos, que não serão preenchidos",
      plano.invalidas.map(
        (i) => `${identificar(i.aluno)}: ${rotularAlvo(i.alvo)}: ${i.motivo}`,
      ),
    ),
    ...secao(
      "Matrículas da planilha que não estão na turma",
      plano.matriculasForaDaTurma,
    ),
    ...secao(
      "Matrículas repetidas na planilha (não usadas)",
      plano.matriculasRepetidas,
    ),
    ...secao(
      "Alunos da turma sem linha na planilha",
      plano.alunosSemLinha.map(identificar),
    ),
  ];
}

function descreverAlteracoesPorAluno(alteracoes: AlteracaoDeNota[]): string[] {
  const porAluno = new Map<AlunoNaTela, AlteracaoDeNota[]>();
  for (const alteracao of alteracoes)
    porAluno.set(alteracao.aluno, [
      ...(porAluno.get(alteracao.aluno) ?? []),
      alteracao,
    ]);
  return [...porAluno].map(
    ([aluno, doAluno]) =>
      `${identificar(aluno)}: ${doAluno.map(descreverAlteracao).join("; ")}`,
  );
}

/**
 * Uma alteração como "Unid. 1: 7,0 → 8,0", com o valor da planilha quando truncado.
 *
 * @example
 * descreverAlteracao(alteracao); // "Unid. 2: — → 7,3 (planilha: 7,39)"
 */
export function descreverAlteracao(alteracao: AlteracaoDeNota): string {
  const { alvo, anterior, nova, original } = alteracao;
  const emNumero = (texto: string): number => Number(texto.replace(",", "."));
  const truncada =
    emNumero(original) !== emNumero(nova) ? ` (planilha: ${original})` : "";
  const condicao =
    alvo.tipo === "avaliacaoFinal"
      ? ", se o aluno ficar em avaliação final"
      : "";
  return `${rotularAlvo(alvo)}: ${anterior || "—"} → ${nova}${truncada}${condicao}`;
}

function identificar(aluno: AlunoNaTela): string {
  return `${aluno.nome} (${aluno.matricula})`;
}

function criarSecao(
  documento: Document,
  titulo: string,
  itens: string[],
): HTMLElement[] {
  const cabecalho = documento.createElement("h4");
  cabecalho.textContent = titulo;
  Object.assign(cabecalho.style, { margin: "8px 0 0", fontSize: "14px" });
  const lista = documento.createElement("ul");
  Object.assign(lista.style, ESTILO_LISTA);
  for (const item of itens) {
    const linha = documento.createElement("li");
    linha.textContent = item;
    lista.append(linha);
  }
  return [cabecalho, lista];
}
