import { lerComandoJsf, montarFormularioJsf } from "../comum/comandoJsf";
import { encontrarItemMenuAva } from "../comum/menuAva";

export interface DependenciasRecarregamento {
  /** A página aberta na aba, onde a navegação acontece. */
  documentoVivo: Document;
  /** Envia o formulário como navegação comum (ex.: `formulario.submit()`). */
  submeter: (formulario: HTMLFormElement) => void;
  /** Navegação de último recurso (ex.: `location.assign`). */
  irPara: (url: string) => void;
}

/**
 * Reabre a tela Conteúdo Programado pelo item do menu, usando o ViewState da
 * resposta mais recente. Recarregar a página reenviaria o POST que a abriu, com o
 * ViewState antigo e o aviso de reenvio do navegador.
 *
 * @example
 * recarregarConteudoProgramado({ documentoVivo: document, submeter, irPara }, resultado.documentoFinal);
 */
export function recarregarConteudoProgramado(
  dependencias: DependenciasRecarregamento,
  documentoAtualizado: Document,
): void {
  const { documentoVivo, submeter, irPara } = dependencias;
  const link = encontrarItemMenuAva(documentoAtualizado, "conteudo programado");
  const comando = link && lerComandoJsf(link);
  if (!comando) return irPara(documentoVivo.location.href);
  submeter(montarFormularioJsf(documentoVivo, comando));
}
