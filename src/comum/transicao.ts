/** Avisa o usuário de que uma navegação começou (ex.: "Entrando como Servidor…"). */
export type AnunciadorDeTransicao = (mensagem: string) => void;

/** Remove a camada de transição antes do prazo. */
export type EncerrarTransicao = () => void;

const ID_CAMADA = "sigga-transicao";
const ID_ESTILO = "sigga-transicao-estilo";

// Se a navegação não acontecer (erro do SIGAA, sessão expirada), a página volta a ser usável
const PRAZO_TRANSICAO_MS = 10000;

const CSS_TRANSICAO = `
  @keyframes sigga-surgir { from { opacity: 0; } }
  @keyframes sigga-girar { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) {
    #${ID_CAMADA}, #${ID_CAMADA} * { animation-duration: 0s !important; }
  }
`;

const ESTILO_CAMADA: Partial<CSSStyleDeclaration> = {
  position: "fixed",
  inset: "0",
  zIndex: "2147483647",
  background: "rgba(27, 58, 92, 0.94)",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "18px",
  fontFamily: "Arial, sans-serif",
  fontSize: "18px",
  fontWeight: "600",
  animation: "sigga-surgir 200ms ease-out",
};

const ESTILO_SPINNER: Partial<CSSStyleDeclaration> = {
  width: "34px",
  height: "34px",
  borderRadius: "50%",
  border: "3px solid rgba(255, 255, 255, 0.25)",
  borderTopColor: "#fff",
  animation: "sigga-girar 0.8s linear infinite",
};

/**
 * Cobre a página com uma camada de "carregando" enquanto o SIGAA navega. A camada
 * bloqueia novos cliques, some sozinha após o prazo e também quando o Chrome
 * restaura a página pelo botão Voltar (back/forward cache).
 *
 * @example
 * mostrarTransicao(document, "Entrando como Servidor…");
 * link.click();
 */
export function mostrarTransicao(
  documento: Document,
  mensagem: string,
  prazoMs: number = PRAZO_TRANSICAO_MS,
): EncerrarTransicao {
  documento.getElementById(ID_CAMADA)?.remove();
  inserirEstilo(documento);
  const camada = criarCamada(documento, mensagem);
  documento.body.appendChild(camada);
  return agendarRemocao(camada, prazoMs);
}

function inserirEstilo(documento: Document): void {
  if (documento.getElementById(ID_ESTILO)) return;
  const estilo = documento.createElement("style");
  estilo.id = ID_ESTILO;
  estilo.textContent = CSS_TRANSICAO;
  documento.head.appendChild(estilo);
}

function criarCamada(documento: Document, mensagem: string): HTMLElement {
  const camada = documento.createElement("div");
  camada.id = ID_CAMADA;
  camada.setAttribute("role", "status");
  camada.setAttribute("aria-live", "polite");
  Object.assign(camada.style, ESTILO_CAMADA);
  const texto = documento.createElement("div");
  texto.textContent = mensagem;
  const spinner = documento.createElement("div");
  Object.assign(spinner.style, ESTILO_SPINNER);
  camada.append(texto, spinner);
  return camada;
}

function agendarRemocao(
  camada: HTMLElement,
  prazoMs: number,
): EncerrarTransicao {
  const janela = camada.ownerDocument.defaultView;
  const aoVoltarDoHistorico = (evento: PageTransitionEvent): void => {
    if (evento.persisted) remover();
  };
  const temporizador = setTimeout(remover, prazoMs);
  function remover(): void {
    clearTimeout(temporizador);
    janela?.removeEventListener("pageshow", aoVoltarDoHistorico);
    camada.remove();
  }
  janela?.addEventListener("pageshow", aoVoltarDoHistorico);
  return remover;
}
