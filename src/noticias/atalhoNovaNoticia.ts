import { criarAviso } from "../comum/aviso";
import {
  criarBotaoAtalho,
  inserirNaBarraDeAtalhos,
} from "../comum/barraAtalhosTurma";
import {
  corpoDoComando,
  lerComandoJsf,
  montarFormularioJsf,
  type ComandoJsf,
} from "../comum/comandoJsf";
import type { EnviarFormulario } from "../comum/envioFormulario";
import { ehPaginaDaTurma } from "../comum/paginaTurma";
import type { EncerrarTransicao } from "../comum/transicao";
import {
  encontrarItemMenuNoticias,
  encontrarLinkCadastrarNoticia,
} from "./paginaNoticias";

export interface DependenciasNovaNoticia {
  /** A página aberta na aba, onde ficam o botão e a navegação. */
  documento: Document;
  enviarFormulario: EnviarFormulario;
  interpretarHtml: (html: string) => Document;
  /** Envia o formulário como navegação comum (ex.: `formulario.submit()`). */
  submeter: (formulario: HTMLFormElement) => void;
  mostrarTransicao: (mensagem: string) => EncerrarTransicao;
  registrarFalha: (motivo: string) => void;
}

const ID_AVISO = "sigga-aviso-noticia";
const MENSAGEM_TRANSICAO = "Abrindo o cadastro de notícia…";
const MENSAGEM_FALHA =
  "Não foi possível abrir o cadastro de notícia. Use o item Notícias do menu.";

/**
 * Atalho "Nova notícia" na página da turma: abre direto o formulário de cadastro
 * de notícia. O SIGAA só aceita o "Cadastrar Notícia" com o ViewState da
 * listagem, então a listagem é buscada em segundo plano e nunca exibida.
 *
 * @example
 * new AtalhoNovaNoticia(dependencias).iniciar();
 */
export class AtalhoNovaNoticia {
  private readonly dependencias: DependenciasNovaNoticia;
  private barra: HTMLElement | undefined;

  constructor(dependencias: DependenciasNovaNoticia) {
    this.dependencias = dependencias;
  }

  iniciar(): void {
    const { documento } = this.dependencias;
    if (!ehPaginaDaTurma(documento)) return;
    const botao = criarBotaoAtalho(
      documento,
      "Nova notícia",
      "secundario",
      () => void this.abrirCadastro(),
    );
    this.barra = inserirNaBarraDeAtalhos(documento, "noticias", [botao]);
  }

  async abrirCadastro(): Promise<void> {
    const { documento, mostrarTransicao, submeter } = this.dependencias;
    documento.getElementById(ID_AVISO)?.remove();
    const encerrarTransicao = mostrarTransicao(MENSAGEM_TRANSICAO);
    try {
      const comando = await this.buscarComandoCadastrar();
      submeter(montarFormularioJsf(documento, comando));
    } catch (erro) {
      encerrarTransicao();
      this.avisarFalha(String(erro));
    }
  }

  // A listagem buscada traz o "Cadastrar Notícia" com o ViewState que o servidor espera
  private async buscarComandoCadastrar(): Promise<ComandoJsf> {
    const { documento, enviarFormulario, interpretarHtml } = this.dependencias;
    const item = encontrarItemMenuNoticias(documento);
    const comandoMenu = item && lerComandoJsf(item);
    if (!comandoMenu)
      throw new Error(
        'item "Notícias" do menu ausente; esperado a > .itemMenu com jsfcljs',
      );
    const html = await enviarFormulario(
      comandoMenu.acao,
      corpoDoComando(comandoMenu),
    );
    return lerComandoCadastrar(interpretarHtml(html));
  }

  private avisarFalha(motivo: string): void {
    const { documento, registrarFalha } = this.dependencias;
    registrarFalha(motivo);
    this.barra?.after(criarAviso(documento, ID_AVISO, MENSAGEM_FALHA));
  }
}

function lerComandoCadastrar(listagem: Document): ComandoJsf {
  const link = encontrarLinkCadastrarNoticia(listagem);
  const comando = link && lerComandoJsf(link);
  if (!comando)
    throw new Error(
      `"Cadastrar Notícia" ausente na resposta (título: "${listagem.title}"); esperado o quadro "Notícias" com o link; sessão expirada?`,
    );
  return comando;
}
