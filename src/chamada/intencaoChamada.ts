import type { ArmazenamentoDaAba } from "../comum/armazenamento";

/** Aonde o docente quer chegar: a chamada da data de hoje ou o calendário. */
export type DestinoChamada = "hoje" | "outraData";

const CHAVE_INTENCAO = "sigga_intencao_chamada";

// Uma intenção esquecida (fluxo interrompido) não pode disparar ações mais tarde
const VALIDADE_MS = 5 * 60 * 1000;

interface IntencaoSalva {
  destino: DestinoChamada;
  registradaEm: number;
}

function ehIntencaoSalva(valor: unknown): valor is IntencaoSalva {
  if (typeof valor !== "object" || valor === null) return false;
  const { destino, registradaEm } = valor as Record<string, unknown>;
  return (
    (destino === "hoje" || destino === "outraData") &&
    typeof registradaEm === "number"
  );
}

/**
 * Lembra, entre as páginas do SIGAA que se sucedem na aba, o destino escolhido
 * pelo docente ao iniciar uma chamada. Expira em 5 minutos.
 *
 * @example
 * const intencao = new IntencaoDeChamada(sessionStorage);
 * intencao.registrar("hoje"); // na página da turma
 * intencao.consultar(); // "hoje", nas páginas seguintes
 */
export class IntencaoDeChamada {
  private readonly armazenamento: ArmazenamentoDaAba;
  private readonly agora: () => number;

  constructor(
    armazenamento: ArmazenamentoDaAba,
    agora: () => number = Date.now,
  ) {
    this.armazenamento = armazenamento;
    this.agora = agora;
  }

  registrar(destino: DestinoChamada): void {
    const intencao: IntencaoSalva = { destino, registradaEm: this.agora() };
    this.armazenamento.setItem(CHAVE_INTENCAO, JSON.stringify(intencao));
  }

  /** O destino registrado, se ainda estiver dentro da validade. */
  consultar(): DestinoChamada | undefined {
    const intencao = this.lerIntencao();
    if (!intencao) return undefined;
    const expirada = this.agora() - intencao.registradaEm > VALIDADE_MS;
    return expirada ? undefined : intencao.destino;
  }

  descartar(): void {
    this.armazenamento.removeItem(CHAVE_INTENCAO);
  }

  private lerIntencao(): IntencaoSalva | undefined {
    try {
      const valor: unknown = JSON.parse(
        this.armazenamento.getItem(CHAVE_INTENCAO) ?? "null",
      );
      return ehIntencaoSalva(valor) ? valor : undefined;
    } catch {
      return undefined;
    }
  }
}
