import type {
  AlteracaoDeNota,
  PlanoDePreenchimento,
} from "./planoPreenchimento";

/** O que o preenchimento fez, e como voltar atrás antes de salvar. */
export interface ResultadoPreenchimento {
  preenchidas: AlteracaoDeNota[];
  /** Notas de avaliação final de alunos que o SIGAA não pôs em avaliação final. */
  foraDaAvaliacaoFinal: AlteracaoDeNota[];
  desfazer(): void;
}

const DESTAQUE: Partial<CSSStyleDeclaration> = {
  backgroundColor: "#fff59d",
  outline: "2px solid #f9a825",
};

/**
 * Escreve as notas do plano nos campos do SIGAA, sem salvar. Cada escrita dispara
 * o `keyup` que o SIGAA usa para recalcular média e situação (o `blur` não, pois
 * mostraria um alert). As unidades vêm antes da avaliação final, que o recálculo
 * habilita ou apaga.
 *
 * @example
 * const resultado = aplicarPlano(plano);
 * resultado.desfazer(); // devolve os valores anteriores
 */
export function aplicarPlano(
  plano: PlanoDePreenchimento,
): ResultadoPreenchimento {
  const anteriores = registrarValores(plano.alteracoes);
  const unidades = plano.alteracoes.filter((a) => a.alvo.tipo === "unidade");
  const finais = plano.alteracoes.filter(
    (a) => a.alvo.tipo === "avaliacaoFinal",
  );
  unidades.forEach(escrever);
  const habilitadas = finais.filter((alteracao) => !alteracao.campo.disabled);
  habilitadas.forEach(escrever);
  return {
    preenchidas: [...unidades, ...habilitadas],
    foraDaAvaliacaoFinal: finais.filter((a) => !habilitadas.includes(a)),
    desfazer: () => restaurar(anteriores),
  };
}

// Guarda todos os campos dos alunos afetados: o recálculo pode apagar a avaliação final
function registrarValores(
  alteracoes: AlteracaoDeNota[],
): Map<HTMLInputElement, string> {
  const valores = new Map<HTMLInputElement, string>();
  for (const { aluno } of alteracoes) {
    const campos = [...aluno.camposUnidade, aluno.campoAvaliacaoFinal];
    for (const campo of campos)
      if (campo && !valores.has(campo)) valores.set(campo, campo.value);
  }
  return valores;
}

// O destaque vem depois do recálculo, que repinta o fundo da avaliação final
function escrever({ campo, nova }: AlteracaoDeNota): void {
  campo.value = nova;
  recalcular(campo);
  Object.assign(campo.style, DESTAQUE);
}

function restaurar(valores: Map<HTMLInputElement, string>): void {
  for (const [campo, valor] of valores) {
    Object.assign(campo.style, { backgroundColor: "", outline: "" });
    campo.value = valor;
    recalcular(campo);
  }
}

function recalcular(campo: HTMLInputElement): void {
  campo.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
}
