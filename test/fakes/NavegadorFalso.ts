/** Registra as URLs para onde o código tentou navegar, no lugar de `location.replace`. */
export class NavegadorFalso {
  readonly urls: string[] = [];

  readonly navegar = (url: string): void => {
    this.urls.push(url);
  };
}
