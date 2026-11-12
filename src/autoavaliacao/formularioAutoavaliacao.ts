import { normalizarRotulo } from "../comum/texto";

/** A turma de uma autoavaliação do docente, como o cabeçalho do formulário a mostra. */
export interface TurmaAvaliada {
  /** Código do componente curricular (ex.: "QXD0253"). */
  codigoComponente: string;
  /** Identifica a turma e é mostrado ao docente (ex.: "QXD0253 - Turma 02A (2026.2)"). */
  rotulo: string;
}

/** As respostas de uma autoavaliação: a opção de cada pergunta e a questão optativa. */
export interface RespostasDaAutoavaliacao {
  /** Valor da opção marcada, pelo nome da pergunta (ex.: { p_59: "29" }). */
  opcoes: Record<string, string>;
  sugestao: string;
}

/** O formulário de autoavaliação do docente aberto na página. */
export interface FormularioAutoavaliacao {
  turma: TurmaAvaliada;
  /** Os botões de opção de cada pergunta, pelo nome da pergunta. */
  perguntas: Map<string, HTMLInputElement[]>;
  campoSugestao: HTMLTextAreaElement | undefined;
  botaoSalvar: HTMLAnchorElement | undefined;
  /** O cabeçalho com o título e a turma, abaixo do qual a extensão age. */
  cabecalho: HTMLElement;
}

// Ex.: "Disciplina: QXD0253 - DESENVOLVIMENTO … - Turma: 02A (2026.2)"
const PADRAO_TURMA =
  /Disciplina:\s*(\S+)\s+-.*-\s*Turma:\s*(\S+)\s*\(([^)]+)\)/;

/**
 * Lê a turma do cabeçalho do formulário; o nome do componente fica de fora do rótulo.
 *
 * @example
 * lerTurmaAvaliada("Disciplina: QXD0253 - WEB - Turma: 02A (2026.2)");
 * // { codigoComponente: "QXD0253", rotulo: "QXD0253 - Turma 02A (2026.2)" }
 */
export function lerTurmaAvaliada(texto: string): TurmaAvaliada | undefined {
  const encontrado = PADRAO_TURMA.exec(texto.replace(/\s+/g, " "));
  if (!encontrado) return undefined;
  const [, codigo, turma, periodo] = encontrado;
  return {
    codigoComponente: codigo!,
    rotulo: `${codigo} - Turma ${turma} (${periodo})`,
  };
}

/**
 * Reconhece o formulário de autoavaliação do docente pelo conteúdo (título e
 * turma); a avaliação do alunado e as demais dimensões ficam de fora.
 *
 * @example
 * encontrarFormularioAutoavaliacao(document)?.turma.rotulo; // "QXD0253 - Turma 02A (2026.2)"
 */
export function encontrarFormularioAutoavaliacao(
  documento: Document,
): FormularioAutoavaliacao | undefined {
  const titulo = documento.getElementById("descricao_dimensao_avaliacao");
  if (normalizarRotulo(titulo?.textContent) !== "autoavaliacao docente")
    return undefined;
  const turma = lerTurmaAvaliada(
    documento.getElementById("descricao_turma")?.textContent ?? "",
  );
  const cabecalho = titulo?.parentElement;
  if (!turma || !cabecalho) return undefined;
  return {
    turma,
    perguntas: agruparPerguntas(documento),
    campoSugestao:
      documento.querySelector<HTMLTextAreaElement>(
        "textarea.sugestao_avaliacao",
      ) ?? undefined,
    botaoSalvar: encontrarBotaoSalvar(documento),
    cabecalho,
  };
}

function agruparPerguntas(
  documento: Document,
): Map<string, HTMLInputElement[]> {
  const perguntas = new Map<string, HTMLInputElement[]>();
  const opcoes = documento.querySelectorAll<HTMLInputElement>(
    'input[type="radio"][name^="p_"]',
  );
  for (const opcao of opcoes)
    perguntas.set(opcao.name, [...(perguntas.get(opcao.name) ?? []), opcao]);
  return perguntas;
}

function encontrarBotaoSalvar(
  documento: Document,
): HTMLAnchorElement | undefined {
  return [...documento.querySelectorAll<HTMLAnchorElement>("a")].find(
    (link) =>
      normalizarRotulo(link.textContent) === "salvar formulario de avaliacao",
  );
}

/**
 * Lê as opções marcadas e o texto da questão optativa.
 *
 * @example
 * lerRespostas(formulario); // { opcoes: { p_59: "29", … }, sugestao: "" }
 */
export function lerRespostas(
  formulario: FormularioAutoavaliacao,
): RespostasDaAutoavaliacao {
  const opcoes: Record<string, string> = {};
  for (const [nome, botoes] of formulario.perguntas) {
    const marcada = botoes.find((botao) => botao.checked);
    if (marcada) opcoes[nome] = marcada.value;
  }
  return { opcoes, sugestao: formulario.campoSugestao?.value ?? "" };
}

/**
 * Diz se todas as perguntas de opção estão respondidas; a questão optativa não conta.
 *
 * @example
 * if (estaCompleto(formulario)) guardar(lerRespostas(formulario));
 */
export function estaCompleto(formulario: FormularioAutoavaliacao): boolean {
  return [...formulario.perguntas.values()].every((botoes) =>
    botoes.some((botao) => botao.checked),
  );
}
