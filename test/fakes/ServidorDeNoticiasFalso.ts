import type { EnviarFormulario } from "../../src/comum/envioFormulario";
import { htmlListagemNoticias } from "../suporte/paginaNoticias";

/** Como o servidor falso responde ao pedido da listagem. */
export type RespostaDeNoticias = "listagem" | "erroDeRede" | "sessaoExpirada";

/**
 * Imita o SIGAA respondendo ao item "Notícias" do menu: devolve a listagem com o
 * ViewState seguinte (`j_id2`), a tela de login ou um erro de rede.
 */
export class ServidorDeNoticiasFalso {
  readonly envios: { url: string; corpo: URLSearchParams }[] = [];
  resposta: RespostaDeNoticias = "listagem";

  readonly enviarFormulario: EnviarFormulario = async (url, corpo) => {
    this.envios.push({ url, corpo });
    if (this.resposta === "erroDeRede") throw new Error("Failed to fetch");
    if (this.resposta === "sessaoExpirada")
      return "<html><head><title>Sessão expirada</title></head><body><form id='loginForm'></form></body></html>";
    return htmlListagemNoticias("j_id2");
  };
}
