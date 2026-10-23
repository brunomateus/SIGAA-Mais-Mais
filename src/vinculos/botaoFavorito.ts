import { normalizarRotulo } from "../comum/texto";

/** Seletor dos botões "★ Favorito"; o atributo guarda o rótulo do vínculo do botão. */
export const SELETOR_BOTAO_FAVORITO = "[data-ext-fav]";

const ESTILO_BOTAO: Partial<CSSStyleDeclaration> = {
  marginLeft: "8px",
  padding: "2px 8px",
  fontSize: "12px",
  cursor: "pointer",
  borderRadius: "4px",
  border: "1px solid #999",
  color: "#333",
  whiteSpace: "nowrap",
};

/**
 * Cria o botão "★ Favorito" de um vínculo. O clique não propaga até o link do
 * vínculo, para marcar o favorito sem navegar.
 *
 * @example
 * link.appendChild(criarBotaoFavorito("Servidor", false, (rotulo) => salvar(rotulo)));
 */
export function criarBotaoFavorito(
  rotulo: string,
  marcado: boolean,
  aoEscolher: (rotulo: string) => void,
): HTMLButtonElement {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.dataset.extFav = rotulo;
  Object.assign(botao.style, ESTILO_BOTAO);
  pintarBotaoFavorito(botao, marcado);
  botao.addEventListener("click", (evento) => {
    evento.preventDefault();
    evento.stopPropagation();
    aoEscolher(rotulo);
  });
  return botao;
}

/**
 * Atualiza a aparência de um botão para marcado (amarelo, com ✓) ou não.
 *
 * @example
 * pintarBotaoFavorito(botao, true); // "★ Favorito ✓"
 */
export function pintarBotaoFavorito(
  botao: HTMLButtonElement,
  marcado: boolean,
): void {
  botao.textContent = marcado ? "★ Favorito ✓" : "★ Favorito";
  botao.style.background = marcado ? "#ffd54f" : "#fff";
  botao.style.borderColor = marcado ? "#c9a227" : "#999";
}

/**
 * Marca o botão do vínculo `rotulo` e desmarca todos os outros sob `raiz`.
 *
 * @example
 * marcarBotaoDoFavorito(document, "Servidor");
 */
export function marcarBotaoDoFavorito(raiz: ParentNode, rotulo: string): void {
  const alvo = normalizarRotulo(rotulo);
  raiz
    .querySelectorAll<HTMLButtonElement>(SELETOR_BOTAO_FAVORITO)
    .forEach((botao) => {
      pintarBotaoFavorito(
        botao,
        normalizarRotulo(botao.dataset.extFav) === alvo,
      );
    });
}
