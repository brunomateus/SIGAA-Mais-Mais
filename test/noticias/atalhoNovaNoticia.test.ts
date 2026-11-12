import { describe, expect, it } from "vitest";
import { inserirBotoesChamada } from "../../src/chamada/elementosChamada";
import { AtalhoNovaNoticia } from "../../src/noticias/atalhoNovaNoticia";
import { NavegacaoJsfFalsa } from "../fakes/NavegacaoJsfFalsa";
import { ServidorDeNoticiasFalso } from "../fakes/ServidorDeNoticiasFalso";
import { TransicaoFalsa } from "../fakes/TransicaoFalsa";
import { montarConteudoProgramado } from "../suporte/paginaConteudoProgramado";
import { montarTurmaComMenuNoticias } from "../suporte/paginaNoticias";

function abrirTurma(documento = montarTurmaComMenuNoticias()) {
  const servidor = new ServidorDeNoticiasFalso();
  const navegacao = new NavegacaoJsfFalsa();
  const transicao = new TransicaoFalsa();
  const falhas: string[] = [];
  const atalho = new AtalhoNovaNoticia({
    documento,
    enviarFormulario: servidor.enviarFormulario,
    interpretarHtml: (html) =>
      new DOMParser().parseFromString(html, "text/html"),
    submeter: navegacao.submeter,
    mostrarTransicao: transicao.mostrar,
    registrarFalha: (motivo) => falhas.push(motivo),
  });
  atalho.iniciar();
  return { documento, servidor, navegacao, transicao, falhas, atalho };
}

const textosDosBotoes = (documento: Document): (string | null)[] =>
  [...documento.querySelectorAll("#sigga-barra-atalhos button")].map(
    (botao) => botao.textContent,
  );

const campos = (formulario: HTMLFormElement): [string, string][] =>
  [...formulario.querySelectorAll("input")].map((campo) => [
    campo.name,
    campo.value,
  ]);

describe("AtalhoNovaNoticia na página da turma", () => {
  it("põe o botão Nova notícia depois dos botões da chamada", () => {
    const documento = montarTurmaComMenuNoticias();
    inserirBotoesChamada(documento, () => {});
    abrirTurma(documento);
    expect(textosDosBotoes(documento)).toEqual([
      "Chamada de hoje",
      "Chamada em outra data",
      "Nova notícia",
    ]);
  });

  it("não age em outras telas da turma", () => {
    const { documento } = abrirTurma(montarConteudoProgramado([]));
    expect(documento.getElementById("sigga-barra-atalhos")).toBeNull();
  });
});

describe("AtalhoNovaNoticia.abrirCadastro", () => {
  it("busca a listagem em segundo plano com o comando do menu Notícias", async () => {
    const { servidor, atalho } = abrirTurma();
    await atalho.abrirCadastro();
    const [envio] = servidor.envios;
    expect(envio?.url).toBe("/sigaa/ava/index.jsf");
    expect(envio?.corpo.get("formMenu:j_id_jsp_1_34")).toBe(
      "formMenu:j_id_jsp_1_34",
    );
    expect(envio?.corpo.get("javax.faces.ViewState")).toBe("j_id1");
  });

  it("navega para o cadastro com o ViewState da listagem, sob a transição", async () => {
    const { navegacao, transicao, atalho } = abrirTurma();
    await atalho.abrirCadastro();
    const [formulario] = navegacao.formularios;
    expect(formulario?.getAttribute("action")).toBe(
      "/sigaa/ava/NoticiaTurma/listar.jsf",
    );
    expect(campos(formulario!)).toEqual([
      ["j_id_jsp_1_101", "j_id_jsp_1_101"],
      ["javax.faces.ViewState", "j_id2"],
      ["j_id_jsp_1_101:j_id_jsp_1_102", "j_id_jsp_1_101:j_id_jsp_1_102"],
    ]);
    expect(transicao.mensagens).toEqual(["Abrindo o cadastro de notícia…"]);
    expect(transicao.encerradas).toBe(0);
  });

  it.each([
    ["erroDeRede", "Failed to fetch"],
    ["sessaoExpirada", 'título: "Sessão expirada"'],
  ] as const)(
    "com %s, encerra a transição, avisa abaixo da barra e registra o motivo",
    async (resposta, trechoDoMotivo) => {
      const { documento, servidor, navegacao, transicao, falhas, atalho } =
        abrirTurma();
      servidor.resposta = resposta;
      await atalho.abrirCadastro();
      expect(navegacao.formularios).toEqual([]);
      expect(transicao.encerradas).toBe(1);
      expect(falhas[0]).toContain(trechoDoMotivo);
      const aviso = documento.getElementById("sigga-aviso-noticia");
      expect(aviso?.textContent).toBe(
        "Não foi possível abrir o cadastro de notícia. Use o item Notícias do menu.",
      );
      expect(aviso?.previousElementSibling?.id).toBe("sigga-barra-atalhos");
    },
  );

  it("não acumula avisos ao tentar de novo", async () => {
    const { documento, servidor, atalho } = abrirTurma();
    servidor.resposta = "erroDeRede";
    await atalho.abrirCadastro();
    await atalho.abrirCadastro();
    expect(documento.querySelectorAll("#sigga-aviso-noticia")).toHaveLength(1);
  });
});
