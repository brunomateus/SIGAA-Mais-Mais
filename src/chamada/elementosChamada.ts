import type { DestinoChamada } from "./intencaoChamada";

const ID_BARRA = "sigga-barra-chamada";
const ID_AVISO = "sigga-aviso-sem-aula";

const ESTILO_BARRA: Partial<CSSStyleDeclaration> = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  margin: "8px 0 12px",
};

/**
 * Insere no topo da página da turma os botões "Chamada de hoje" e "Chamada em outra data".
 *
 * @example
 * inserirBotoesChamada(document, (destino) => iniciarChamada(destino));
 */
export function inserirBotoesChamada(
  documento: Document,
  aoEscolher: (destino: DestinoChamada) => void,
): void {
  const conteudo = documento.getElementById("conteudo");
  if (!conteudo || documento.getElementById(ID_BARRA)) return;
  const barra = documento.createElement("div");
  barra.id = ID_BARRA;
  Object.assign(barra.style, ESTILO_BARRA);
  barra.append(
    criarBotao(documento, "Chamada de hoje", true, () => aoEscolher("hoje")),
    criarBotao(documento, "Chamada em outra data", false, () =>
      aoEscolher("outraData"),
    ),
  );
  conteudo.prepend(barra);
}

function criarBotao(
  documento: Document,
  texto: string,
  principal: boolean,
  aoClicar: () => void,
): HTMLButtonElement {
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
 * Avisa, acima do calendário, que hoje (`data`) não é data de aula da turma.
 *
 * @example
 * mostrarAvisoSemAulaHoje(document, new Date()); // "Hoje (23/10) não é data de aula…"
 */
export function mostrarAvisoSemAulaHoje(documento: Document, data: Date): void {
  const corpo = documento.getElementById("corpo");
  if (!corpo || documento.getElementById(ID_AVISO)) return;
  const aviso = documento.createElement("div");
  aviso.id = ID_AVISO;
  aviso.setAttribute("role", "status");
  aviso.textContent = `Hoje (${formatarDiaMes(data)}) não é data de aula desta turma. Escolha uma data.`;
  Object.assign(aviso.style, {
    margin: "8px 0",
    padding: "8px 12px",
    borderRadius: "4px",
    background: "#fff8e1",
    border: "1px solid #c9a227",
    color: "#5d4300",
  });
  corpo.before(aviso);
}

function formatarDiaMes(data: Date): string {
  const doisDigitos = (n: number): string => String(n).padStart(2, "0");
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}`;
}
