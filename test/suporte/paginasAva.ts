// Imitações anonimizadas das telas da turma virtual, com a estrutura das páginas
// reais do SIGAA usada pelos seletores. Os links JSF (onclick com jsfcljs) viram
// links que registram o clique em `cliques`.

export interface PaginaAvaSimulada {
  documento: Document;
  /** Identificação de cada link JSF clicado, na ordem. */
  cliques: string[];
}

const MENU_ALUNOS = `
  <div class="itemMenuHeaderAlunos">Alunos</div>
  <form id="formMenu">
    <div role="listitem"><a href="#" data-clique="menu:lancar-frequencia">
      <div class="itemMenu">Lançar Frequência</div>
    </a></div>
    <div role="listitem"><a href="#" data-clique="menu:outro">
      <div class="itemMenu">Lançar Notas</div>
    </a></div>
  </form>`;

function montar(titulo: string, conteudo: string): PaginaAvaSimulada {
  const documento = document.implementation.createHTMLDocument(titulo);
  documento.body.innerHTML = `${MENU_ALUNOS}<div id="conteudo">${conteudo}</div>`;
  const cliques: string[] = [];
  documento.querySelectorAll<HTMLElement>("[data-clique]").forEach((link) => {
    link.addEventListener("click", (evento) => {
      evento.preventDefault();
      cliques.push(link.dataset.clique!);
    });
  });
  return { documento, cliques };
}

/** Página da turma (entrarTurma.jsf), com notícia e um tópico de aula. */
export function montarPaginaTurma(): PaginaAvaSimulada {
  return montar(
    "turma",
    `<form id="formAva">
      <div class="descricaoOperacao" id="ultimaNoticia"><h4>Última Notícia</h4></div>
      <div class="topico-aula"><div class="titulo">01 - Apresentação (10/08/2026)</div></div>
    </form>`,
  );
}

/** Seleção de subturma (FrequenciaAluno/subturmas.jsf) com `quantidade` linhas. */
export function montarPaginaSubturma(quantidade: number): PaginaAvaSimulada {
  const linhas = Array.from(
    { length: quantidade },
    (_, i) =>
      `<tr><td class="first">TURMA FICTÍCIA - Turma: 0${i + 1}A (2026.2)</td>
       <td class="icon"><a href="#" data-clique="subturma:${i + 1}"><img src="/sigaa/img/seta.gif"></a></td></tr>`,
  ).join("");
  return montar(
    "subturma",
    `<form><fieldset>
      <legend>Lançar Frequência &gt; Selecionar Sub-Turma</legend>
      <table class="listing"><thead><tr><th>Sub-Turma</th><th></th></tr></thead>
      <tbody>${linhas}</tbody></table>
    </fieldset></form>`,
  );
}

/** Calendário de frequência (FrequenciaAluno/form.jsf) com links nas datas de aula. */
export function montarPaginaCalendario(datasDeAula: Date[]): PaginaAvaSimulada {
  // Como no SIGAA: o mês do link começa em 0
  const celulas = datasDeAula
    .map(
      (d) =>
        `<td><a href="/sigaa/ava/FrequenciaAluno/form.jsf?dia=${d.getDate()}&amp;mes=${d.getMonth()}&amp;ano=${d.getFullYear()}">${d.getDate()}</a></td>`,
    )
    .join("");
  return montar(
    "calendario",
    `<form><fieldset>
      <legend>Lançar Frequência da Turma</legend>
      <div id="corpo">
        <div id="calendario"><div id="calendarios"><table><caption>Outubro/2026</caption>
          <tbody><tr><td style="color: red">12</td>${celulas}</tr></tbody></table></div></div>
        <div id="frequencia"></div>
      </div>
    </fieldset></form>`,
  );
}

/** Outra tela da turma (ex.: um fórum), sem relação com a chamada. */
export function montarOutraPaginaAva(): PaginaAvaSimulada {
  return montar("forum", `<form id="formForum"><h2>Fórum</h2></form>`);
}
