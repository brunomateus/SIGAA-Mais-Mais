import type { EnviarFormulario } from "../../src/comum/envioFormulario";
import {
  htmlConteudoProgramado,
  type TopicoSimulado,
} from "../suporte/paginaConteudoProgramado";

/** Como o servidor falso responde ao tópico configurado em `falharEm`. */
export type ModoDeFalha = "erroDeRede" | "sessaoExpirada" | "naoRemove";

/**
 * Imita o SIGAA respondendo às remoções da tela Conteúdo Programado: remove o
 * tópico do parâmetro `id`, devolve a tela atualizada e troca o ViewState a cada
 * resposta. Um ViewState antigo recebe a tela de "sessão expirada".
 */
export class ServidorSigaaFalso {
  readonly envios: URLSearchParams[] = [];
  topicos: TopicoSimulado[];
  falharEm: { id: string; modo: ModoDeFalha } | undefined;
  private versao = 1;

  constructor(topicos: TopicoSimulado[]) {
    this.topicos = [...topicos];
  }

  get viewStateAtual(): string {
    return `j_id${this.versao}`;
  }

  readonly enviarFormulario: EnviarFormulario = async (_url, corpo) => {
    this.envios.push(corpo);
    const id = corpo.get("id") ?? "";
    if (this.falharEm?.id === id) return this.falhar(this.falharEm.modo);
    if (corpo.get("javax.faces.ViewState") !== this.viewStateAtual)
      return this.falhar("sessaoExpirada");
    this.topicos = this.topicos.filter((topico) => topico.id !== id);
    this.versao += 1;
    return htmlConteudoProgramado(this.topicos, this.viewStateAtual);
  };

  private falhar(modo: ModoDeFalha): string {
    if (modo === "erroDeRede") throw new Error("Failed to fetch");
    if (modo === "sessaoExpirada")
      return "<html><head><title>Sessão expirada</title></head><body><form id='loginForm'></form></body></html>";
    return htmlConteudoProgramado(this.topicos, this.viewStateAtual);
  }
}
