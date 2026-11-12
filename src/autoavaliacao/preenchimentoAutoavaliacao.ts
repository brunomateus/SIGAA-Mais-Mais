import { destacarPreenchido } from "../comum/destaque";
import type {
  FormularioAutoavaliacao,
  RespostasDaAutoavaliacao,
} from "./formularioAutoavaliacao";

/** Quantas perguntas de opção a cópia marcou e quantas ficaram para o docente. */
export interface ResultadoDaCopia {
  preenchidas: number;
  naoPreenchidas: number;
}

// O SIGAA corta a questão optativa em 500 caracteres no onkeyup
const LIMITE_SUGESTAO = 500;

/**
 * Marca no formulário as respostas guardadas de outra turma, sem salvar. Uma
 * pergunta sem resposta guardada, ou cuja opção não existe neste formulário,
 * fica como está e é contada em `naoPreenchidas`.
 *
 * @example
 * preencherAutoavaliacao(formulario, guardada.respostas); // { preenchidas: 14, naoPreenchidas: 0 }
 */
export function preencherAutoavaliacao(
  formulario: FormularioAutoavaliacao,
  respostas: RespostasDaAutoavaliacao,
): ResultadoDaCopia {
  let preenchidas = 0;
  for (const [nome, botoes] of formulario.perguntas) {
    const opcao = botoes.find(
      (botao) => botao.value === respostas.opcoes[nome],
    );
    if (!opcao) continue;
    marcar(opcao);
    preenchidas += 1;
  }
  copiarSugestao(formulario.campoSugestao, respostas.sugestao);
  return {
    preenchidas,
    naoPreenchidas: formulario.perguntas.size - preenchidas,
  };
}

// A linha inteira é destacada: o botão de opção sozinho quase não mostra o fundo
function marcar(opcao: HTMLInputElement): void {
  opcao.checked = true;
  opcao.dispatchEvent(new Event("change", { bubbles: true }));
  destacarPreenchido(opcao.closest("li") ?? opcao);
}

// O keyup atualiza o contador de caracteres do SIGAA
function copiarSugestao(
  campo: HTMLTextAreaElement | undefined,
  sugestao: string,
): void {
  if (!campo || sugestao === "") return;
  campo.value = sugestao.slice(0, LIMITE_SUGESTAO);
  campo.dispatchEvent(new Event("input", { bubbles: true }));
  campo.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
  destacarPreenchido(campo);
}

/**
 * Resumo da cópia para o docente, terminando no próximo passo.
 *
 * @example
 * descreverCopia({ preenchidas: 13, naoPreenchidas: 1 });
 * // "13 perguntas preenchidas · 1 pergunta não preenchida; responda-a à mão. Revise e clique em Salvar Formulário de Avaliação."
 */
export function descreverCopia(resultado: ResultadoDaCopia): string {
  const { preenchidas, naoPreenchidas } = resultado;
  const partes = [
    preenchidas === 1
      ? "1 pergunta preenchida"
      : `${preenchidas} perguntas preenchidas`,
  ];
  if (naoPreenchidas === 1)
    partes.push("1 pergunta não preenchida; responda-a à mão");
  if (naoPreenchidas > 1)
    partes.push(
      `${naoPreenchidas} perguntas não preenchidas; responda-as à mão`,
    );
  return `${partes.join(" · ")}. Revise e clique em Salvar Formulário de Avaliação.`;
}
