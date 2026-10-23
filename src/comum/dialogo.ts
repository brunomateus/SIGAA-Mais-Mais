export interface PedidoConfirmacao {
  titulo: string;
  mensagem: string;
  rotuloConfirmar: string;
}

/** Pergunta algo ao usuário; resolve true só se ele confirmar. */
export type Confirmador = (pedido: PedidoConfirmacao) => Promise<boolean>;

const VALOR_CONFIRMAR = "confirmar";
const VALOR_CANCELAR = "cancelar";

const ESTILO_DIALOGO: Partial<CSSStyleDeclaration> = {
  maxWidth: "380px",
  padding: "20px 24px",
  border: "none",
  borderRadius: "8px",
  boxShadow: "0 8px 32px rgba(0,0,0,.3)",
  fontFamily: "Arial, sans-serif",
  color: "#222",
};

/**
 * `Confirmador` com um `<dialog>` modal nativo, que já traz fundo escurecido,
 * Esc para cancelar e foco preso no diálogo. "Cancelar" ou Esc resolvem false.
 *
 * @example
 * const ok = await confirmarComDialogo({
 *   titulo: "Definir vínculo favorito?",
 *   mensagem: "“Servidor” será selecionado automaticamente.",
 *   rotuloConfirmar: "Confirmar e entrar",
 * });
 */
export function confirmarComDialogo(
  pedido: PedidoConfirmacao,
): Promise<boolean> {
  const dialogo = montarDialogo(pedido);
  const fechamento = aguardarFechamento(dialogo);
  document.body.appendChild(dialogo);
  dialogo.showModal();
  dialogo
    .querySelector<HTMLButtonElement>(`button[value="${VALOR_CONFIRMAR}"]`)
    ?.focus();
  return fechamento;
}

function aguardarFechamento(dialogo: HTMLDialogElement): Promise<boolean> {
  return new Promise((resolve) => {
    const aoFechar = (): void => {
      resolve(dialogo.returnValue === VALOR_CONFIRMAR);
      dialogo.remove();
    };
    dialogo.addEventListener("close", aoFechar, { once: true });
  });
}

function montarDialogo(pedido: PedidoConfirmacao): HTMLDialogElement {
  const dialogo = document.createElement("dialog");
  Object.assign(dialogo.style, ESTILO_DIALOGO);
  dialogo.append(
    criarTexto("h3", pedido.titulo, { margin: "0 0 10px", fontSize: "17px" }),
    criarTexto("p", pedido.mensagem, {
      margin: "0 0 18px",
      fontSize: "14px",
      lineHeight: "1.4",
    }),
    criarBotoes(pedido.rotuloConfirmar),
  );
  return dialogo;
}

function criarTexto(
  tag: "h3" | "p",
  texto: string,
  estilo: Partial<CSSStyleDeclaration>,
): HTMLElement {
  const elemento = document.createElement(tag);
  elemento.textContent = texto;
  Object.assign(elemento.style, estilo);
  return elemento;
}

// method="dialog": o botão clicado fecha o diálogo e vira o returnValue, sem enviar nada
function criarBotoes(rotuloConfirmar: string): HTMLFormElement {
  const formulario = document.createElement("form");
  formulario.method = "dialog";
  Object.assign(formulario.style, {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  });
  formulario.append(
    criarBotao("Cancelar", VALOR_CANCELAR, false),
    criarBotao(rotuloConfirmar, VALOR_CONFIRMAR, true),
  );
  return formulario;
}

function criarBotao(
  texto: string,
  valor: string,
  primario: boolean,
): HTMLButtonElement {
  const botao = document.createElement("button");
  botao.value = valor;
  botao.textContent = texto;
  Object.assign(botao.style, {
    padding: "6px 14px",
    fontSize: "14px",
    borderRadius: "4px",
    cursor: "pointer",
    border: primario ? "1px solid #1b3a5c" : "1px solid #999",
    background: primario ? "#1b3a5c" : "#fff",
    color: primario ? "#fff" : "#333",
  });
  return botao;
}
