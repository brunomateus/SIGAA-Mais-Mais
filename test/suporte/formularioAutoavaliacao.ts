// Imitação anonimizada do formulário de autoavaliação do docente, com a estrutura
// da página real do SIGAA usada pelos seletores

/** Uma pergunta de opção: o nome (`p_NN`) e os valores das opções. */
export interface PerguntaSimulada {
  nome: string;
  opcoes: string[];
}

export interface FormularioSimulado {
  titulo?: string;
  turma?: string;
  perguntas?: PerguntaSimulada[];
}

// Nota 5 a Nota 2 e, em algumas perguntas, "Não se aplica" (50)
export const PERGUNTAS_PADRAO: PerguntaSimulada[] = [
  { nome: "p_59", opcoes: ["29", "30", "31", "32", "50"] },
  { nome: "p_40", opcoes: ["29", "30", "31", "32"] },
  { nome: "p_60", opcoes: ["29", "30", "31", "32"] },
];

export const TURMA_A =
  "Disciplina: QXD9001 - COMPONENTE FICTÍCIO - Turma: 01A (2026.2)";
export const TURMA_B =
  "Disciplina: QXD9001 - COMPONENTE FICTÍCIO - Turma: 02A (2026.2)";

function htmlPergunta({ nome, opcoes }: PerguntaSimulada, i: number): string {
  const botoes = opcoes
    .map(
      (valor) =>
        `<input class="col-xs" type="radio" id="${nome}${valor}" name="${nome}" value="${valor}" required=""><label for="${nome}${valor}">Opção ${valor}</label>`,
    )
    .join("");
  return `<li class="row"><span class="perg_personalizado">${i + 1}. Pergunta fictícia.</span>${botoes}</li>`;
}

/** Monta o formulário; por padrão, a autoavaliação da TURMA_A com PERGUNTAS_PADRAO. */
export function montarFormularioAutoavaliacao(
  simulado: FormularioSimulado = {},
): Document {
  const {
    titulo = "Autoavaliação docente",
    turma = TURMA_A,
    perguntas = PERGUNTAS_PADRAO,
  } = simulado;
  const documento = document.implementation.createHTMLDocument("SIGAA - UFC");
  documento.body.innerHTML = `
    <form id="j_id_jsp_1_1" name="j_id_jsp_1_1" method="post" action="/sigaa/avaliacao/lista_dimensoes/docente_lista_turmas_dimensoes.jsf">
      <div class="cabecalho_introducao_avaliacao">
        <h3 id="descricao_dimensao_avaliacao">${titulo}</h3>
        <h4 id="descricao_turma"> ${turma} </h4>
      </div>
      <section><ul>${perguntas.map(htmlPergunta).join("")}</ul></section>
      <fieldset><section><header><h4>Questão optativa</h4></header>
        <textarea id="j_id_jsp_1_1:sugestao" name="j_id_jsp_1_1:sugestao" class="sugestao_avaliacao"></textarea>
      </section></fieldset>
      <div class="botoes_esquerdo_direito">
        <a href="#" class="botao-css3 with-icon botao_finalizar"><img alt="Sinal de visto com fundo em verde."> <span>Salvar Formulário de Avaliação</span></a>
      </div>
      <input type="hidden" name="javax.faces.ViewState" value="j_id3">
    </form>`;
  return documento;
}

/** Marca, no formulário, a opção `valor` de cada pergunta indicada. */
export function responder(
  documento: Document,
  respostas: Record<string, string>,
): void {
  for (const [nome, valor] of Object.entries(respostas))
    documento.querySelector<HTMLInputElement>(
      `input[name="${nome}"][value="${valor}"]`,
    )!.checked = true;
}

/** O valor marcado em cada pergunta do formulário. */
export function marcadas(documento: Document): Record<string, string> {
  const opcoes = documento.querySelectorAll<HTMLInputElement>(
    'input[type="radio"]:checked',
  );
  return Object.fromEntries([...opcoes].map((o) => [o.name, o.value]));
}
