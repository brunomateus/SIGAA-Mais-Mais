const ID_BARRA = "sigga-barra-atalhos";

const ESTILO_BARRA: Partial<CSSStyleDeclaration> = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  margin: "8px 0 12px",
};

/** "principal" é o atalho em destaque da barra; os demais são "secundario". */
export type DestaqueDoAtalho = "principal" | "secundario";

/**
 * Cria um botão no estilo da barra de atalhos da turma.
 *
 * @example
 * criarBotaoAtalho(document, "Nova notícia", "secundario", () => abrirCadastro());
 */
export function criarBotaoAtalho(
  documento: Document,
  texto: string,
  destaque: DestaqueDoAtalho,
  aoClicar: () => void,
): HTMLButtonElement {
  const principal = destaque === "principal";
  const botao = documento.createElement("button");
  botao.type = "button";
  botao.textContent = texto;
  Object.assign(botao.style, {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: principal ? "bold" : "normal",
    borderRadius: "4px",
    cursor: "pointer",
    border: "1px solid #1b3a5c",
    background: principal ? "#1b3a5c" : "#fff",
    color: principal ? "#fff" : "#1b3a5c",
  });
  botao.addEventListener("click", aoClicar);
  return botao;
}

/**
 * Acrescenta os botões de uma funcionalidade (`grupo`) à barra no topo da página
 * da turma, criando a barra se preciso. Cada funcionalidade roda num content
 * script próprio; a barra é compartilhada e a ordem é a de injeção no manifest.
 * Devolve a barra, ou `undefined` fora da página da turma.
 *
 * @example
 * inserirNaBarraDeAtalhos(document, "noticias", [botaoNovaNoticia]);
 */
export function inserirNaBarraDeAtalhos(
  documento: Document,
  grupo: string,
  botoes: HTMLButtonElement[],
): HTMLElement | undefined {
  const barra = obterBarra(documento);
  if (!barra) return undefined;
  if (barra.querySelector(`[data-atalho="${grupo}"]`)) return barra;
  for (const botao of botoes) botao.dataset.atalho = grupo;
  barra.append(...botoes);
  return barra;
}

function obterBarra(documento: Document): HTMLElement | undefined {
  const existente = documento.getElementById(ID_BARRA);
  if (existente) return existente;
  const conteudo = documento.getElementById("conteudo");
  if (!conteudo) return undefined;
  const barra = documento.createElement("div");
  barra.id = ID_BARRA;
  Object.assign(barra.style, ESTILO_BARRA);
  conteudo.prepend(barra);
  return barra;
}
