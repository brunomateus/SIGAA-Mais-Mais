const ESTILO_DESTAQUE: Partial<CSSStyleDeclaration> = {
  backgroundColor: "#fff59d",
  outline: "2px solid #f9a825",
};

/**
 * Destaca em amarelo um campo que a extensão preencheu, para o docente revisar
 * antes de salvar no SIGAA.
 *
 * @example
 * campo.value = "7,5";
 * destacarPreenchido(campo);
 */
export function destacarPreenchido(elemento: HTMLElement): void {
  Object.assign(elemento.style, ESTILO_DESTAQUE);
}

/**
 * Tira o destaque de `destacarPreenchido`, ao desfazer um preenchimento.
 *
 * @example
 * removerDestaque(campo);
 */
export function removerDestaque(elemento: HTMLElement): void {
  Object.assign(elemento.style, { backgroundColor: "", outline: "" });
}
