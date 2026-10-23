import type { Confirmador, PedidoConfirmacao } from "../../src/comum/dialogo";

/**
 * `Confirmador` controlado pelo teste: registra cada pedido e só responde quando o
 * teste chama `responder`, permitindo verificar o estado enquanto o "diálogo" está aberto.
 */
export class ConfirmadorFalso {
  readonly pedidos: PedidoConfirmacao[] = [];
  private respostaPendente: ((confirmado: boolean) => void) | undefined;

  readonly confirmar: Confirmador = (pedido) => {
    this.pedidos.push(pedido);
    return new Promise((resolve) => {
      this.respostaPendente = resolve;
    });
  };

  responder(confirmado: boolean): void {
    if (!this.respostaPendente) {
      throw new Error(
        `ConfirmadorFalso.responder(${confirmado}): nenhum pedido pendente`,
      );
    }
    this.respostaPendente(confirmado);
    this.respostaPendente = undefined;
  }
}
