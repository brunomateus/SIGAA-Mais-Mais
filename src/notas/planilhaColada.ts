import { normalizarRotulo } from "../comum/texto";
import { lerCelulasColadas } from "./celulasColadas";
import { normalizarMatricula } from "./telaLancarNotas";

/** A planilha de notas colada, já com a coluna de matrículas identificada. */
export interface PlanilhaColada {
  cabecalho: string[] | undefined;
  linhas: string[][];
  colunaMatricula: number;
  quantidadeColunas: number;
}

/** Coluna da planilha escolhida para cada unidade (na ordem das unidades) e para a avaliação final. */
export interface AssociacaoDeColunas {
  unidades: (number | undefined)[];
  avaliacaoFinal: number | undefined;
}

// "Unid. 1", "Unidade 1", "U1", "N1", "Nota 1", "AP1", "AV 1"… depois de normalizados
const PADRAO_UNIDADE = /^(?:unid(?:ade)?|u|n|nota|ap|av|avaliacao)0*(\d+)$/;
const PADRAO_AVALIACAO_FINAL =
  /^(?:af|avaliacaofinal|notafinal|nf|final|recuperacao|rec)$/;

/**
 * Interpreta o texto colado: acha a coluna de matrículas (a que mais bate com a
 * turma) e decide se a primeira linha é cabeçalho. Sem coluna de matrículas da
 * turma, devolve `undefined`.
 *
 * @example
 * interpretarPlanilhaColada("Matrícula\tU1\n512345\t7,5", new Set(["512345"]))?.colunaMatricula; // 0
 */
export function interpretarPlanilhaColada(
  texto: string,
  matriculasDaTurma: ReadonlySet<string>,
): PlanilhaColada | undefined {
  const celulas = lerCelulasColadas(texto);
  const quantidadeColunas = Math.max(
    0,
    ...celulas.map((linha) => linha.length),
  );
  const colunaMatricula = acharColunaMatricula(
    celulas,
    quantidadeColunas,
    matriculasDaTurma,
  );
  if (colunaMatricula === undefined) return undefined;
  const primeira = celulas[0] ?? [];
  const temCabecalho = !matriculasDaTurma.has(
    normalizarMatricula(primeira[colunaMatricula] ?? ""),
  );
  return {
    cabecalho: temCabecalho ? primeira : undefined,
    linhas: temCabecalho ? celulas.slice(1) : celulas,
    colunaMatricula,
    quantidadeColunas,
  };
}

function acharColunaMatricula(
  celulas: string[][],
  quantidadeColunas: number,
  matriculasDaTurma: ReadonlySet<string>,
): number | undefined {
  const acertos = Array.from(
    { length: quantidadeColunas },
    (_, coluna) =>
      celulas.filter((linha) =>
        matriculasDaTurma.has(normalizarMatricula(linha[coluna] ?? "")),
      ).length,
  );
  const maior = Math.max(0, ...acertos);
  return maior === 0 ? undefined : acertos.indexOf(maior);
}

/**
 * Nome exibido de uma coluna: o cabeçalho, ou "Coluna A", "Coluna B"… sem ele.
 *
 * @example
 * rotularColuna(planilhaSemCabecalho, 1); // "Coluna B"
 */
export function rotularColuna(
  planilha: PlanilhaColada,
  coluna: number,
): string {
  const titulo = planilha.cabecalho?.[coluna]?.trim();
  return titulo ? titulo : `Coluna ${letraDaColuna(coluna)}`;
}

// 0 → A, 25 → Z, 26 → AA, como nas planilhas
function letraDaColuna(coluna: number): string {
  const letra = String.fromCharCode(65 + (coluna % 26));
  return coluna < 26
    ? letra
    : letraDaColuna(Math.floor(coluna / 26) - 1) + letra;
}

/**
 * Sugere a coluna de cada unidade e da avaliação final pelo cabeçalho. Sem
 * cabeçalho, nada é sugerido.
 *
 * @example
 * sugerirAssociacao(planilha, [1, 2]); // { unidades: [1, 2], avaliacaoFinal: 3 }
 */
export function sugerirAssociacao(
  planilha: PlanilhaColada,
  unidades: number[],
): AssociacaoDeColunas {
  const titulos = (planilha.cabecalho ?? []).map((titulo, coluna) =>
    coluna === planilha.colunaMatricula ? "" : compactar(titulo),
  );
  const procurar = (
    padrao: (titulo: string) => boolean,
  ): number | undefined => {
    const coluna = titulos.findIndex(padrao);
    return coluna === -1 ? undefined : coluna;
  };
  return {
    unidades: unidades.map((numero) =>
      procurar((titulo) => Number(PADRAO_UNIDADE.exec(titulo)?.[1]) === numero),
    ),
    avaliacaoFinal: procurar((titulo) => PADRAO_AVALIACAO_FINAL.test(titulo)),
  };
}

// "Unid. 1" → "unid1"; "Avaliação Final" → "avaliacaofinal"
function compactar(titulo: string): string {
  return normalizarRotulo(titulo).replace(/[^a-z0-9]/g, "");
}
