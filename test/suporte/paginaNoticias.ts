// Imitações anonimizadas da página da turma (com o menu JSF de verdade) e da
// listagem de notícias, com a estrutura das páginas reais do SIGAA usada pelos seletores

const FORM_LISTAGEM = "j_id_jsp_1_101";

/** Página da turma com o item "Notícias" do menu e o painel lateral de notícias. */
export function montarTurmaComMenuNoticias(): Document {
  const documento = document.implementation.createHTMLDocument("turma");
  documento.body.innerHTML = `
    <form id="formMenu" name="formMenu" method="post" action="/sigaa/ava/index.jsf">
      <input type="hidden" name="formMenu" value="formMenu">
      <div role="listitem"><a href="#" onclick="if(typeof jsfcljs == 'function'){jsfcljs(document.forms['formMenu'],'formMenu:j_id_jsp_1_34,formMenu:j_id_jsp_1_34','');}return false">
        <div class="itemMenu">Notícias</div></a></div>
      <input type="hidden" name="javax.faces.ViewState" value="j_id1">
    </form>
    <div id="conteudo"><form id="formAva"></form></div>
    <div class="rich-stglpanel-header">Notícias&nbsp;</div>`;
  return documento;
}

/** HTML da listagem de notícias, com o botão "Cadastrar Notícia" no quadro. */
export function htmlListagemNoticias(viewState: string): string {
  return `<html><head><title>SIGAA - Sistema Integrado de Gestão de Atividades Acadêmicas</title></head><body>
    <div id="conteudo">
      <form id="${FORM_LISTAGEM}" name="${FORM_LISTAGEM}" method="post" action="/sigaa/ava/NoticiaTurma/listar.jsf">
        <input type="hidden" name="${FORM_LISTAGEM}" value="${FORM_LISTAGEM}">
        <fieldset><legend>Notícias</legend>
          <aside class="menu-css3-botoes">
            <a href="#" onclick="if(typeof jsfcljs == 'function'){jsfcljs(document.forms['${FORM_LISTAGEM}'],'${FORM_LISTAGEM}:j_id_jsp_1_102,${FORM_LISTAGEM}:j_id_jsp_1_102','');}return false" class="botao-css3-medio">Cadastrar Notícia</a>
          </aside>
          <table><thead><tr><th>Data</th><th>Notificação</th></tr></thead><tbody></tbody></table>
        </fieldset>
        <input type="hidden" name="javax.faces.ViewState" value="${viewState}">
      </form>
    </div></body></html>`;
}
