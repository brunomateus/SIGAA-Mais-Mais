/** Relógio controlado pelo teste, no lugar de `Date.now`. */
export class RelogioFalso {
  private instante: number;

  constructor(instanteInicial: number = 0) {
    this.instante = instanteInicial;
  }

  readonly agora = (): number => this.instante;

  avancarMinutos(minutos: number): void {
    this.instante += minutos * 60 * 1000;
  }
}
