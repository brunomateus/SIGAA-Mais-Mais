import type { AnunciadorDeTransicao } from "../comum/transicao";
import {
  inserirBotoesChamada,
  mostrarAvisoSemAulaHoje,
} from "./elementosChamada";
import type { DestinoChamada, IntencaoDeChamada } from "./intencaoChamada";
import {
  encontrarLinkDaData,
  encontrarLinkLancarFrequencia,
  identificarPaginaAva,
  listarLinksSubturmas,
} from "./paginasAva";

export interface DependenciasFluxoChamada {
  documento: Document;
  intencao: IntencaoDeChamada;
  anunciarTransicao: AnunciadorDeTransicao;
  /** Navega para uma URL comum (ex.: `location.assign`). */
  navegar: (url: string) => void;
  hoje: () => Date;
}

const MENSAGENS: Record<DestinoChamada, string> = {
  hoje: "Abrindo a chamada de hoje…",
  outraData: "Abrindo o calendário de chamada…",
};

/**
 * Atalhos da chamada nas telas da turma virtual: botões na página da turma,
 * seleção automática da subturma única e abertura da data de hoje no calendário.
 * Cada tela faz a sua parte guiada pela intenção registrada na página da turma.
 *
 * @example
 * new FluxoChamada(dependencias).iniciar();
 */
export class FluxoChamada {
  private readonly dependencias: DependenciasFluxoChamada;
  private cliqueDaExtensao = false;

  constructor(dependencias: DependenciasFluxoChamada) {
    this.dependencias = dependencias;
  }

  iniciar(): void {
    this.observarMenuLancarFrequencia();
    const pagina = identificarPaginaAva(this.dependencias.documento);
    if (pagina === "turma") this.prepararPaginaTurma();
    if (pagina === "subturma") this.avancarSubturmaUnica();
    if (pagina === "calendario") this.concluirNoCalendario();
  }

  // Quem chega pelo menu também deve pular a subturma única
  private observarMenuLancarFrequencia(): void {
    const link = encontrarLinkLancarFrequencia(this.dependencias.documento);
    link?.addEventListener("click", () => {
      if (!this.cliqueDaExtensao)
        this.dependencias.intencao.registrar("outraData");
    });
  }

  private prepararPaginaTurma(): void {
    inserirBotoesChamada(this.dependencias.documento, (destino) =>
      this.abrirChamada(destino),
    );
  }

  private abrirChamada(destino: DestinoChamada): void {
    const link = encontrarLinkLancarFrequencia(this.dependencias.documento);
    if (!link) return;
    this.dependencias.intencao.registrar(destino);
    this.dependencias.anunciarTransicao(MENSAGENS[destino]);
    this.cliqueDaExtensao = true;
    link.click();
    this.cliqueDaExtensao = false;
  }

  private avancarSubturmaUnica(): void {
    const destino = this.dependencias.intencao.consultar();
    const links = listarLinksSubturmas(this.dependencias.documento);
    if (!destino || links.length !== 1) return;
    this.dependencias.anunciarTransicao(MENSAGENS[destino]);
    links[0]!.click();
  }

  private concluirNoCalendario(): void {
    const destino = this.dependencias.intencao.consultar();
    this.dependencias.intencao.descartar();
    if (destino !== "hoje") return;
    const { documento, hoje } = this.dependencias;
    const data = hoje();
    const link = encontrarLinkDaData(documento, data);
    if (!link) return mostrarAvisoSemAulaHoje(documento, data);
    this.dependencias.anunciarTransicao(MENSAGENS.hoje);
    this.dependencias.navegar(link.href);
  }
}
