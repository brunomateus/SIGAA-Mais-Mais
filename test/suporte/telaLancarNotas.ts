// Imitação anonimizada da tela Lançar Notas (ensino/consolidacao/detalhesTurma.jsf),
// com a estrutura da página real usada pelos seletores: tabela "Alunos matriculados",
// marcadores das unidades no cabeçalho, um campo nota_ por unidade e o campo da
// avaliação final (classe "recuperacao"), desabilitado até a média pedir.

export interface AlunoSimulado {
  matricula: string;
  nome: string;
  /** Uma nota por unidade, no formato do SIGAA ("7,5"); "" para vazio. */
  notas: string[];
  avaliacaoFinal?: string;
}

/** Alunos fictícios, com matrículas a partir de 500001 e notas vazias. */
export function criarAlunosSimulados(
  quantidade: number,
  unidades = 2,
): AlunoSimulado[] {
  return Array.from({ length: quantidade }, (_, i) => ({
    matricula: String(500001 + i),
    nome: `ALUNO FICTÍCIO ${i + 1}`,
    notas: Array.from({ length: unidades }, () => ""),
  }));
}

function cabecalho(unidades: number): string {
  const colunas = Array.from(
    { length: unidades },
    (_, i) =>
      `<th colspan="1">Unid. ${i + 1} <input type="hidden" class="unidade-tmp" value="${i + 1}"></th>`,
  ).join("");
  return `<thead><tr><th>Matrícula</th><th>Nome <input type="hidden" name="unidade" id="unidade"></th>${colunas}<th>Nota Final</th><th>Resultado</th><th>Faltas</th><th>Sit.</th></tr></thead>`;
}

function linha(aluno: AlunoSimulado, indice: number): string {
  const notas = aluno.notas
    .map(
      (nota, u) =>
        `<td><input type="text" maxlength="4" name="nota_${indice}${u}" class="1" value="${nota}" size="3"></td>`,
    )
    .join("");
  const desabilitada = aluno.avaliacaoFinal ? "" : " disabled";
  return `<tr id="linha_${indice}">
    <td>${aluno.matricula} <label title=""> </label></td>
    <td> ${aluno.nome} <div><span><img alt="Deficiência física"><span>(Deficiência física)</span></span></div></td>
    ${notas}
    <td><input type="text" maxlength="4" name="recup_${indice}" value="${aluno.avaliacaoFinal ?? ""}" class="recuperacao"${desabilitada}></td>
    <td><label class="resultado">--</label></td>
    <td><input type="text" name="faltas_${indice}" class="faltas" value=""></td>
    <td><label class="situacao">--</label></td>
  </tr>`;
}

/** A tela Lançar Notas com os alunos dados; todos com o mesmo número de unidades. */
export function montarTelaLancarNotas(alunos: AlunoSimulado[]): Document {
  const unidades = alunos[0]?.notas.length ?? 2;
  const documento = document.implementation.createHTMLDocument("notas");
  documento.body.innerHTML = `<form id="form" name="form" method="post" action="/sigaa/ensino/consolidacao/detalhesTurma.jsf">
    <div class="notas"><table class="listagem" id="notas-turma">
      <caption>Alunos matriculados</caption>
      ${cabecalho(unidades)}
      <tbody>${alunos.map(linha).join("")}</tbody>
    </table></div>
  </form>`;
  return documento;
}

/** A tabela de notas da tela simulada. */
export function tabelaDeNotas(documento: Document): HTMLTableElement {
  const tabela = documento.querySelector<HTMLTableElement>("#notas-turma");
  if (!tabela) throw new Error("#notas-turma ausente da tela simulada");
  return tabela;
}
