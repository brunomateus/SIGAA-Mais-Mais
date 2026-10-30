import { lerNota, normalizarValorDoCampo } from "./leituraNota";
import type { AssociacaoDeColunas, PlanilhaColada } from "./planilhaColada";
import { normalizarMatricula, type AlunoNaTela } from "./telaLancarNotas";

/** Onde a nota vai: uma unidade (pelo número) ou a avaliação final. */
export type AlvoDaNota =
  { tipo: "unidade"; numero: number } | { tipo: "avaliacaoFinal" };

export interface AlteracaoDeNota {
  aluno: AlunoNaTela;
  alvo: AlvoDaNota;
  campo: HTMLInputElement;
  anterior: string;
  nova: string;
  /** O texto da célula, para mostrar o truncamento ("7,39 → 7,3"). */
  original: string;
}

export interface NotaInvalida {
  aluno: AlunoNaTela;
  alvo: AlvoDaNota;
  motivo: string;
}

/** O que o preenchimento fará e o que ficará de fora, para a prévia. */
export interface PlanoDePreenchimento {
  alteracoes: AlteracaoDeNota[];
  invalidas: NotaInvalida[];
  matriculasForaDaTurma: string[];
  matriculasRepetidas: string[];
  alunosSemLinha: AlunoNaTela[];
}

export interface EntradaDoPlano {
  alunos: AlunoNaTela[];
  unidades: number[];
  planilha: PlanilhaColada;
  associacao: AssociacaoDeColunas;
}

interface Destino {
  alvo: AlvoDaNota;
  coluna: number;
  campo: HTMLInputElement | undefined;
}

/**
 * Compara a planilha de notas com a tela e decide o que preencher. Células
 * vazias e notas iguais às do SIGAA não geram alteração; matrículas repetidas
 * na planilha não são usadas.
 *
 * @example
 * planejarPreenchimento({ alunos, unidades, planilha, associacao }).alteracoes.length; // 28
 */
export function planejarPreenchimento(
  entrada: EntradaDoPlano,
): PlanoDePreenchimento {
  const linhasPorMatricula = agruparPorMatricula(entrada.planilha);
  const doAluno = new Set(entrada.alunos.map((aluno) => aluno.matricula));
  const plano: PlanoDePreenchimento = {
    alteracoes: [],
    invalidas: [],
    matriculasForaDaTurma: [...linhasPorMatricula.keys()].filter(
      (m) => !doAluno.has(m),
    ),
    matriculasRepetidas: [...linhasPorMatricula]
      .filter(([m, linhas]) => doAluno.has(m) && linhas.length > 1)
      .map(([m]) => m),
    alunosSemLinha: entrada.alunos.filter(
      (a) => !linhasPorMatricula.has(a.matricula),
    ),
  };
  for (const aluno of entrada.alunos) {
    const linhas = linhasPorMatricula.get(aluno.matricula);
    if (linhas?.length === 1) planejarAluno(plano, aluno, linhas[0]!, entrada);
  }
  return plano;
}

function agruparPorMatricula(
  planilha: PlanilhaColada,
): Map<string, string[][]> {
  const grupos = new Map<string, string[][]>();
  for (const linha of planilha.linhas) {
    const matricula = normalizarMatricula(
      linha[planilha.colunaMatricula] ?? "",
    );
    if (matricula === "") continue;
    grupos.set(matricula, [...(grupos.get(matricula) ?? []), linha]);
  }
  return grupos;
}

function planejarAluno(
  plano: PlanoDePreenchimento,
  aluno: AlunoNaTela,
  linha: string[],
  entrada: EntradaDoPlano,
): void {
  for (const { alvo, coluna, campo } of destinosDoAluno(aluno, entrada)) {
    const original = linha[coluna] ?? "";
    const leitura = lerNota(original);
    if (leitura.tipo === "invalida")
      plano.invalidas.push({ aluno, alvo, motivo: leitura.motivo });
    if (leitura.tipo !== "valida" || !campo) continue;
    const anterior = campo.value.trim();
    if (normalizarValorDoCampo(anterior) === leitura.nota) continue;
    plano.alteracoes.push({
      aluno,
      alvo,
      campo,
      anterior,
      nova: leitura.nota,
      original: original.trim(),
    });
  }
}

// A avaliação final vem por último: o SIGAA a habilita a partir das unidades
function destinosDoAluno(
  aluno: AlunoNaTela,
  entrada: EntradaDoPlano,
): Destino[] {
  const { unidades, associacao } = entrada;
  const destinos: Destino[] = unidades.flatMap((numero, indice) => {
    const coluna = associacao.unidades[indice];
    if (coluna === undefined) return [];
    return [
      {
        alvo: { tipo: "unidade", numero },
        coluna,
        campo: aluno.camposUnidade[indice],
      },
    ];
  });
  if (associacao.avaliacaoFinal !== undefined)
    destinos.push({
      alvo: { tipo: "avaliacaoFinal" },
      coluna: associacao.avaliacaoFinal,
      campo: aluno.campoAvaliacaoFinal,
    });
  return destinos;
}

/**
 * Nome do alvo como aparece na tela.
 *
 * @example
 * rotularAlvo({ tipo: "unidade", numero: 2 }); // "Unid. 2"
 */
export function rotularAlvo(alvo: AlvoDaNota): string {
  return alvo.tipo === "unidade" ? `Unid. ${alvo.numero}` : "Avaliação final";
}
