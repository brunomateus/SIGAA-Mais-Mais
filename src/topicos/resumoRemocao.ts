import type { ArmazenamentoDaAba } from "../comum/armazenamento";
import type { ResultadoRemocao, SituacaoRemocao } from "./removedorTopicos";

/** O que sobrevive ao recarregamento final para ser mostrado ao docente. */
export interface ResumoRemocao {
  total: number;
  removidos: number;
  situacao: SituacaoRemocao;
  /** Descrição do tópico de aula em que a remoção falhou. */
  topicoComFalha?: string;
}

const CHAVE_RESUMO = "sigga_resumo_remocao_topicos";
const SITUACOES: SituacaoRemocao[] = ["concluida", "falha", "interrompida"];

/**
 * Reduz o resultado do lote ao que o aviso precisa.
 *
 * @example
 * resumirRemocao(resultado); // { total: 12, removidos: 5, situacao: "falha", topicoComFalha: "09 - Herança" }
 */
export function resumirRemocao(resultado: ResultadoRemocao): ResumoRemocao {
  const { total, removidos, situacao, falha } = resultado;
  const resumo: ResumoRemocao = { total, removidos, situacao };
  if (falha) resumo.topicoComFalha = falha.topico.descricao;
  return resumo;
}

function ehResumoRemocao(valor: unknown): valor is ResumoRemocao {
  if (typeof valor !== "object" || valor === null) return false;
  const { total, removidos, situacao } = valor as Record<string, unknown>;
  return (
    typeof total === "number" &&
    typeof removidos === "number" &&
    SITUACOES.includes(situacao as SituacaoRemocao)
  );
}

/**
 * Guarda o resumo do lote entre o recarregamento final e a próxima exibição da
 * tela Conteúdo Programado, na mesma aba. É de uso único.
 *
 * @example
 * registro.guardar(resumirRemocao(resultado)); // antes de recarregar
 * registro.consumir(); // na tela recarregada
 */
export class RegistroDeResumoRemocao {
  private readonly armazenamento: ArmazenamentoDaAba;

  constructor(armazenamento: ArmazenamentoDaAba) {
    this.armazenamento = armazenamento;
  }

  guardar(resumo: ResumoRemocao): void {
    this.armazenamento.setItem(CHAVE_RESUMO, JSON.stringify(resumo));
  }

  consumir(): ResumoRemocao | undefined {
    const bruto = this.armazenamento.getItem(CHAVE_RESUMO);
    this.armazenamento.removeItem(CHAVE_RESUMO);
    try {
      const valor: unknown = JSON.parse(bruto ?? "null");
      return ehResumoRemocao(valor) ? valor : undefined;
    } catch {
      return undefined;
    }
  }
}

/**
 * Texto do aviso exibido após o recarregamento.
 *
 * @example
 * descreverResumo({ total: 12, removidos: 12, situacao: "concluida" }); // "12 tópicos de aula removidos."
 */
export function descreverResumo(resumo: ResumoRemocao): string {
  const { total, removidos, situacao, topicoComFalha } = resumo;
  if (situacao === "concluida")
    return `${contarTopicos(removidos)} removido${removidos === 1 ? "" : "s"}.`;
  const parcial = `${removidos} de ${contarTopicos(total)} removidos.`;
  if (situacao === "interrompida")
    return `${parcial} A remoção foi interrompida; os demais continuam na lista.`;
  return `${parcial} A remoção falhou em “${topicoComFalha ?? "?"}”; ele e os seguintes continuam na lista.`;
}

function contarTopicos(quantidade: number): string {
  return `${quantidade} ${quantidade === 1 ? "tópico de aula" : "tópicos de aula"}`;
}
