/** Registra os formulários enviados e as URLs abertas, no lugar de navegar de verdade. */
export class NavegacaoJsfFalsa {
  readonly formularios: HTMLFormElement[] = [];
  readonly urls: string[] = [];

  readonly submeter = (formulario: HTMLFormElement): void => {
    this.formularios.push(formulario);
  };

  readonly irPara = (url: string): void => {
    this.urls.push(url);
  };
}
