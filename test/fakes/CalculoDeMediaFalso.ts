/**
 * Imita o `calculaMedia` do SIGAA, que roda no `keyup` dos campos de nota: com
 * todas as unidades preenchidas e média de 4 a 6,9, habilita a avaliação final;
 * fora disso, a desabilita e, se o evento veio de uma unidade, a apaga.
 * Registra os campos que receberam `keyup` e os que receberam `blur`.
 */
export class CalculoDeMediaFalso {
  readonly recalculos: string[] = [];
  readonly blurs: string[] = [];

  instalar(tabela: HTMLTableElement): void {
    tabela.addEventListener("keyup", (evento) => this.aoDigitar(evento));
    tabela.addEventListener(
      "blur",
      (evento) => this.blurs.push(nomeDoCampo(evento)),
      true,
    );
  }

  private aoDigitar(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    this.recalculos.push(campo.name);
    const linha = campo.closest("tr")!;
    const final = linha.querySelector<HTMLInputElement>("input.recuperacao")!;
    const media = mediaDasUnidades(linha);
    const emAvaliacaoFinal = media !== undefined && media >= 4 && media < 7;
    final.disabled = !emAvaliacaoFinal;
    if (!emAvaliacaoFinal && campo !== final) final.value = "";
  }
}

function mediaDasUnidades(linha: HTMLTableRowElement): number | undefined {
  const campos = [
    ...linha.querySelectorAll<HTMLInputElement>('input[name^="nota_"]'),
  ];
  const notas = campos.map((campo) =>
    parseFloat(campo.value.replace(",", ".")),
  );
  if (notas.some(Number.isNaN)) return undefined;
  return notas.reduce((soma, nota) => soma + nota, 0) / notas.length;
}

function nomeDoCampo(evento: Event): string {
  return (evento.target as HTMLInputElement).name;
}
