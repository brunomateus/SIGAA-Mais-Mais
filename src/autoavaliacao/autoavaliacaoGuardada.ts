import type { Armazenamento } from "../comum/armazenamento";
import type {
  RespostasDaAutoavaliacao,
  TurmaAvaliada,
} from "./formularioAutoavaliacao";

const CHAVE_AUTOAVALIACAO = "sigga_autoavaliacao_guardada";

/** A última autoavaliação do docente salva no SIGAA, para repetir em outras turmas. */
export interface AutoavaliacaoGuardada {
  turma: TurmaAvaliada;
  respostas: RespostasDaAutoavaliacao;
  /** Momento em que foi guardada (ms desde 1970). */
  guardadaEm: number;
}

function ehTexto(valor: unknown): valor is string {
  return typeof valor === "string";
}

function ehOpcoes(valor: unknown): valor is Record<string, string> {
  if (typeof valor !== "object" || valor === null) return false;
  return Object.values(valor).every(ehTexto);
}

// O armazenamento pode guardar um formato antigo ou corrompido: só aceita o formato atual
function ehAutoavaliacaoGuardada(
  valor: unknown,
): valor is AutoavaliacaoGuardada {
  if (typeof valor !== "object" || valor === null) return false;
  const { turma, respostas, guardadaEm } = valor as Record<string, unknown>;
  const { codigoComponente, rotulo } = (turma ?? {}) as Record<string, unknown>;
  const { opcoes, sugestao } = (respostas ?? {}) as Record<string, unknown>;
  return (
    ehTexto(codigoComponente) &&
    ehTexto(rotulo) &&
    ehOpcoes(opcoes) &&
    ehTexto(sugestao) &&
    typeof guardadaEm === "number"
  );
}

/**
 * Guarda no navegador só a última autoavaliação do docente salva. As respostas são
 * do próprio docente e ficam até ele pedir para esquecê-las.
 *
 * @example
 * const guardadas = new RepositorioDeAutoavaliacao(new ArmazenamentoChrome(chrome.storage.local));
 * await guardadas.guardar({ turma, respostas, guardadaEm: Date.now() });
 */
export class RepositorioDeAutoavaliacao {
  private readonly armazenamento: Armazenamento;

  constructor(armazenamento: Armazenamento) {
    this.armazenamento = armazenamento;
  }

  async ler(): Promise<AutoavaliacaoGuardada | undefined> {
    const valor = await this.armazenamento.ler(CHAVE_AUTOAVALIACAO);
    return ehAutoavaliacaoGuardada(valor) ? valor : undefined;
  }

  guardar(autoavaliacao: AutoavaliacaoGuardada): Promise<void> {
    return this.armazenamento.gravar(CHAVE_AUTOAVALIACAO, autoavaliacao);
  }

  esquecer(): Promise<void> {
    return this.armazenamento.remover(CHAVE_AUTOAVALIACAO);
  }
}
