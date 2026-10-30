// Imitação anonimizada da tela Conteúdo Programado (TopicoAula/listar.jsf), com a
// estrutura da página real usada pelos seletores: menu da turma, formulário JSF com
// ViewState e, em cada linha, a lixeira com confirm() seguido de jsfcljs.

export interface TopicoSimulado {
  id: string;
  descricao: string;
  data: string;
}

const FORM = "j_id_jsp_1_101";
const ACAO = "/sigaa/ava/TopicoAula/listar.jsf";

/** Tópicos de aula fictícios, com ids sequenciais a partir de 79533231. */
export function criarTopicosSimulados(quantidade: number): TopicoSimulado[] {
  return Array.from({ length: quantidade }, (_, i) => ({
    id: String(79533231 + i),
    descricao: `${String(i + 1).padStart(2, "0")} - Assunto ${i + 1}`,
    data: `${String(10 + i).padStart(2, "0")}/08/2026`,
  }));
}

function jsfcljs(formulario: string, pares: string): string {
  return `if(typeof jsfcljs == 'function'){jsfcljs(document.forms['${formulario}'],'${pares}','');}return false`;
}

function linkMenu(): string {
  return `<form id="formMenu" name="formMenu" method="post" action="${ACAO}">
    <input type="hidden" name="formMenu" value="formMenu">
    <a href="#" onclick="${jsfcljs("formMenu", "formMenu:j_id_29,formMenu:j_id_29")}"><div class="itemMenu">Conteúdo Programado</div></a>
    <a href="#" onclick="${jsfcljs("formMenu", "formMenu:j_id_30,formMenu:j_id_30")}"><div class="itemMenu">Lançar Frequência</div></a>
  </form>`;
}

function linha(topico: TopicoSimulado, indice: number): string {
  const sufixo = indice === 0 ? "" : `j_id_${indice}`;
  const excluir = `var a=function(){return(confirm('Deseja realmente excluir este item?'));};var b=function(){${jsfcljs(FORM, `${FORM}:j_id_132${sufixo},${FORM}:j_id_132${sufixo},id,${topico.id}`).replace("return false", "")}return false};return (a()==false) ? false : b();`;
  return `<tr>
    <td class="first">${topico.descricao}</td>
    <td class="width75">${topico.data}</td><td class="width75">${topico.data}</td>
    <td class="icon"><a href="#" onclick="${jsfcljs(FORM, `${FORM}:j_id_126${sufixo},${FORM}:j_id_126${sufixo},id,${topico.id}`)}"><img alt="Visualizar"></a></td>
    <td class="icon"><a href="#" onclick="${excluir}"><img alt="Excluir"></a></td>
  </tr>`;
}

function tabela(topicos: TopicoSimulado[]): string {
  if (topicos.length === 0)
    return `<p class="empty-listing">Nenhum item foi encontrado</p>`;
  return `<table class="listing">
    <thead><tr><th>Descrição</th><th>Início</th><th>Fim</th><th></th><th></th></tr></thead>
    <tbody>${topicos.map(linha).join("")}</tbody>
  </table>`;
}

/** HTML completo da tela, como o SIGAA devolveria (inclusive após uma remoção). */
export function htmlConteudoProgramado(
  topicos: TopicoSimulado[],
  viewState = "j_id1",
): string {
  const estado = `<input type="hidden" name="javax.faces.ViewState" value="${viewState}">`;
  return `<html><head><title>SIGAA</title></head><body>
    ${linkMenu().replace("</form>", `${estado}</form>`)}
    <div id="conteudo">
      <form id="${FORM}" name="${FORM}" method="post" action="${ACAO}">
        <input type="hidden" name="${FORM}" value="${FORM}">
        <fieldset><legend>Conteúdo Programado</legend>${tabela(topicos)}</fieldset>
        ${estado}
      </form>
    </div>
  </body></html>`;
}

/** Interpreta o HTML como o DOMParser do content script faria. */
export function interpretarHtml(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

/** A tela Conteúdo Programado aberta na aba. */
export function montarConteudoProgramado(
  topicos: TopicoSimulado[],
  viewState = "j_id1",
): Document {
  return interpretarHtml(htmlConteudoProgramado(topicos, viewState));
}
