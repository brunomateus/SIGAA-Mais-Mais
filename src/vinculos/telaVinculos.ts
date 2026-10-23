import type { Confirmador } from "../comum/dialogo";
import type { RepositorioFavorito } from "../comum/favorito";
import type { SinalPosLogin } from "../comum/sinalPosLogin";
import { normalizarRotulo } from "../comum/texto";
import type { AnunciadorDeTransicao } from "../comum/transicao";
import {
  criarBotaoFavorito,
  marcarBotaoDoFavorito,
  SELETOR_BOTAO_FAVORITO,
} from "./botaoFavorito";
import {
  selecionarVinculoAutomatico,
  vinculoQueContem,
  type Vinculo,
} from "./listaVinculos";

export interface DependenciasTelaVinculos {
  favoritos: RepositorioFavorito;
  confirmar: Confirmador;
  anunciarTransicao: AnunciadorDeTransicao;
  sinalPosLogin: SinalPosLogin;
  documento: Document;
}

/**
 * Comportamento da tela vinculos.jsf: botões "★ Favorito", entrada automática no
 * favorito, confirmação do favorito no primeiro acesso e aviso de transição a cada
 * entrada num vínculo, deixando o sinal pós-login para a página seguinte.
 *
 * @example
 * await new TelaVinculos(encontrarVinculos(document), dependencias).iniciar();
 */
export class TelaVinculos {
  private readonly vinculos: Vinculo[];
  private readonly dependencias: DependenciasTelaVinculos;
  private favoritoAtual: string | undefined;

  constructor(vinculos: Vinculo[], dependencias: DependenciasTelaVinculos) {
    this.vinculos = vinculos;
    this.dependencias = dependencias;
  }

  async iniciar(): Promise<void> {
    this.favoritoAtual = await this.dependencias.favoritos.ler();
    this.inserirBotoesFavorito();
    // Captura no document: roda antes do onclick do SIGAA no próprio link
    this.dependencias.documento.addEventListener(
      "click",
      (e) => this.aoClicar(e),
      true,
    );
    selecionarVinculoAutomatico(
      this.vinculos,
      this.favoritoAtual,
    )?.link.click();
  }

  private inserirBotoesFavorito(): void {
    for (const vinculo of this.vinculos) {
      if (vinculo.link.querySelector(SELETOR_BOTAO_FAVORITO)) continue;
      const marcado =
        normalizarRotulo(this.favoritoAtual) ===
        normalizarRotulo(vinculo.rotulo);
      const botao = criarBotaoFavorito(
        vinculo.rotulo,
        marcado,
        (r) => void this.definirFavorito(r),
      );
      (vinculo.link.querySelector("span.col-xs-6") ?? vinculo.link).appendChild(
        botao,
      );
    }
  }

  private async definirFavorito(rotulo: string): Promise<void> {
    await this.dependencias.favoritos.salvar(rotulo);
    this.favoritoAtual = rotulo;
    marcarBotaoDoFavorito(this.dependencias.documento, rotulo);
  }

  // Todo clique num vínculo passa por aqui, inclusive o automático e o liberado após confirmar
  private aoClicar(evento: MouseEvent): void {
    const vinculo = this.vinculoClicado(evento.target);
    if (!vinculo) return;
    if (this.favoritoAtual) {
      this.dependencias.sinalPosLogin.marcar();
      this.dependencias.anunciarTransicao(`Entrando como ${vinculo.rotulo}…`);
      return;
    }
    evento.preventDefault();
    evento.stopImmediatePropagation();
    void this.confirmarFavoritoEEntrar(vinculo);
  }

  private vinculoClicado(alvo: EventTarget | null): Vinculo | undefined {
    if (alvo instanceof Element && alvo.closest(SELETOR_BOTAO_FAVORITO))
      return undefined;
    return vinculoQueContem(this.vinculos, alvo);
  }

  private async confirmarFavoritoEEntrar(vinculo: Vinculo): Promise<void> {
    const confirmado = await this.dependencias.confirmar({
      titulo: "Definir vínculo favorito?",
      mensagem:
        `“${vinculo.rotulo}” será selecionado automaticamente nos próximos acessos. ` +
        "Você pode alterar isso depois pelo botão ★ ou pelo ícone da extensão.",
      rotuloConfirmar: "Confirmar e entrar",
    });
    if (!confirmado) return;
    await this.definirFavorito(vinculo.rotulo);
    vinculo.link.click();
  }
}
