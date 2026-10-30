import { normalizarRotulo } from "../comum/texto";

/** Um aluno da tabela "Alunos matriculados" da tela Lançar Notas, com seus campos. */
export interface AlunoNaTela {
  matricula: string;
  nome: string;
  /** Um campo por unidade, na ordem das unidades do cabeçalho. */
  camposUnidade: HTMLInputElement[];
  /** Habilitado pelo SIGAA só quando a média pede avaliação final. */
  campoAvaliacaoFinal: HTMLInputElement | undefined;
}

/**
 * Localiza a tabela "Alunos matriculados" da tela Lançar Notas. A tela é
 * reconhecida pelo conteúdo, pois no JSF a barra de endereço pode mostrar outra página.
 *
 * @example
 * encontrarTabelaNotas(document)?.id; // "notas-turma"
 */
export function encontrarTabelaNotas(
  documento: Document,
): HTMLTableElement | undefined {
  return [...documento.querySelectorAll("table")].find(
    (tabela) =>
      normalizarRotulo(tabela.caption?.textContent) === "alunos matriculados" &&
      tabela.querySelector('input[name^="nota_"]') !== null,
  );
}

/**
 * Números das unidades da turma, na ordem das colunas ("Unid. 1", "Unid. 2"…).
 *
 * @example
 * lerUnidades(tabela); // [1, 2, 3]
 */
export function lerUnidades(tabela: HTMLTableElement): number[] {
  const marcadores =
    tabela.tHead?.querySelectorAll<HTMLInputElement>("input.unidade-tmp") ?? [];
  return [...marcadores].map((marcador) => Number(marcador.value));
}

/**
 * Lê os alunos da tabela com os campos de nota de cada um.
 *
 * @example
 * listarAlunosNaTela(tabela)[0]?.camposUnidade.length; // 2
 */
export function listarAlunosNaTela(tabela: HTMLTableElement): AlunoNaTela[] {
  const linhas = tabela.querySelectorAll<HTMLTableRowElement>(
    'tbody tr[id^="linha_"]',
  );
  return [...linhas].map((linha) => ({
    matricula: normalizarMatricula(linha.cells[0]?.textContent ?? ""),
    nome: lerNome(linha.cells[1]),
    camposUnidade: [
      ...linha.querySelectorAll<HTMLInputElement>('input[name^="nota_"]'),
    ],
    campoAvaliacaoFinal:
      linha.querySelector<HTMLInputElement>("input.recuperacao") ?? undefined,
  }));
}

// Só o primeiro texto da célula: depois dele vêm os indicadores de necessidades especiais
function lerNome(celula: HTMLTableCellElement | undefined): string {
  const texto = [...(celula?.childNodes ?? [])].find(
    (no) => no.nodeType === Node.TEXT_NODE && no.textContent?.trim(),
  );
  return texto?.textContent?.trim().replace(/\s+/g, " ") ?? "";
}

/**
 * Matrícula só com dígitos e sem zeros à esquerda, que planilhas costumam
 * perder ao tratar a matrícula como número.
 *
 * @example
 * normalizarMatricula(" 0512345 "); // "512345"
 */
export function normalizarMatricula(texto: string): string {
  return texto.replace(/\D/g, "").replace(/^0+/, "");
}
