/**
 * Reconhece a página principal da turma virtual pelo conteúdo: no JSF, a barra de
 * endereço mostra o destino do formulário anterior (ex.: docente.jsf), não a tela atual.
 *
 * @example
 * if (ehPaginaDaTurma(document)) inserirNaBarraDeAtalhos(document, "noticias", botoes);
 */
export function ehPaginaDaTurma(documento: Document): boolean {
  return documento.querySelector("#conteudo #formAva") !== null;
}
