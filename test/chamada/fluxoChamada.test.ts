import { describe, expect, it } from "vitest";
import { FluxoChamada } from "../../src/chamada/fluxoChamada";
import {
  IntencaoDeChamada,
  type DestinoChamada,
} from "../../src/chamada/intencaoChamada";
import { AnunciadorFalso } from "../fakes/AnunciadorFalso";
import { ArmazenamentoDaAbaEmMemoria } from "../fakes/ArmazenamentoDaAbaEmMemoria";
import { NavegadorFalso } from "../fakes/NavegadorFalso";
import {
  montarOutraPaginaAva,
  montarPaginaCalendario,
  montarPaginaSubturma,
  montarPaginaTurma,
  type PaginaAvaSimulada,
} from "../suporte/paginasAva";

const HOJE = new Date(2026, 9, 20);
const ONTEM = new Date(2026, 9, 19);

// Uma aba: o sessionStorage é compartilhado pelas páginas visitadas em sequência
function novaAba() {
  const armazenamento = new ArmazenamentoDaAbaEmMemoria();
  const anunciador = new AnunciadorFalso();
  const navegador = new NavegadorFalso();
  const abrir = (pagina: PaginaAvaSimulada): PaginaAvaSimulada => {
    new FluxoChamada({
      documento: pagina.documento,
      intencao: new IntencaoDeChamada(armazenamento),
      anunciarTransicao: anunciador.anunciar,
      navegar: navegador.navegar,
      hoje: () => HOJE,
    }).iniciar();
    return pagina;
  };
  const intencao = () => new IntencaoDeChamada(armazenamento).consultar();
  return { abrir, intencao, anunciador, navegador, armazenamento };
}

function clicarBotao(pagina: PaginaAvaSimulada, texto: string): void {
  const botoes = [...pagina.documento.querySelectorAll("button")];
  const botao = botoes.find((b) => b.textContent === texto);
  if (!botao)
    throw new Error(
      `botão "${texto}" ausente; há: ${botoes.map((b) => b.textContent)}`,
    );
  botao.click();
}

function registrarIntencao(
  aba: ReturnType<typeof novaAba>,
  destino: DestinoChamada,
) {
  new IntencaoDeChamada(aba.armazenamento).registrar(destino);
}

describe("FluxoChamada na página da turma", () => {
  it("mostra os botões de chamada", () => {
    const turma = novaAba().abrir(montarPaginaTurma());
    expect(
      turma.documento.getElementById("sigga-barra-chamada"),
    ).not.toBeNull();
  });

  it("'Chamada de hoje' registra a intenção, anuncia e aciona o menu Lançar Frequência", () => {
    const aba = novaAba();
    const turma = aba.abrir(montarPaginaTurma());
    clicarBotao(turma, "Chamada de hoje");
    expect(aba.intencao()).toBe("hoje");
    expect(aba.anunciador.mensagens).toEqual(["Abrindo a chamada de hoje…"]);
    expect(turma.cliques).toEqual(["menu:lancar-frequencia"]);
  });

  it("'Chamada em outra data' registra a intenção de ir ao calendário", () => {
    const aba = novaAba();
    clicarBotao(aba.abrir(montarPaginaTurma()), "Chamada em outra data");
    expect(aba.intencao()).toBe("outraData");
    expect(aba.anunciador.mensagens).toEqual([
      "Abrindo o calendário de chamada…",
    ]);
  });

  it("um clique manual no menu também registra a intenção de ir ao calendário", () => {
    const aba = novaAba();
    const forum = aba.abrir(montarOutraPaginaAva());
    forum.documento
      .querySelector<HTMLElement>('[data-clique="menu:lancar-frequencia"]')!
      .click();
    expect(aba.intencao()).toBe("outraData");
  });

  it("não mostra os botões fora da página da turma", () => {
    const forum = novaAba().abrir(montarOutraPaginaAva());
    expect(forum.documento.getElementById("sigga-barra-chamada")).toBeNull();
  });
});

describe("FluxoChamada na seleção de subturma", () => {
  it("com intenção e subturma única, seleciona-a sozinho", () => {
    const aba = novaAba();
    registrarIntencao(aba, "hoje");
    const subturma = aba.abrir(montarPaginaSubturma(1));
    expect(subturma.cliques).toEqual(["subturma:1"]);
    expect(aba.anunciador.mensagens).toEqual(["Abrindo a chamada de hoje…"]);
  });

  it("com várias subturmas, deixa o docente escolher e mantém a intenção", () => {
    const aba = novaAba();
    registrarIntencao(aba, "hoje");
    const subturma = aba.abrir(montarPaginaSubturma(2));
    expect(subturma.cliques).toEqual([]);
    expect(aba.intencao()).toBe("hoje");
  });

  it("sem intenção (ex.: voltou pelo histórico), não faz nada", () => {
    const subturma = novaAba().abrir(montarPaginaSubturma(1));
    expect(subturma.cliques).toEqual([]);
  });
});

describe("FluxoChamada no calendário", () => {
  it("com intenção 'hoje', abre a data de hoje e consome a intenção", () => {
    const aba = novaAba();
    registrarIntencao(aba, "hoje");
    aba.abrir(montarPaginaCalendario([ONTEM, HOJE]));
    expect(aba.navegador.urls).toEqual([
      "/sigaa/ava/FrequenciaAluno/form.jsf?dia=20&mes=9&ano=2026",
    ]);
    expect(aba.anunciador.mensagens).toEqual(["Abrindo a chamada de hoje…"]);
    expect(aba.intencao()).toBeUndefined();
  });

  it("se hoje não é data de aula, fica no calendário com um aviso", () => {
    const aba = novaAba();
    registrarIntencao(aba, "hoje");
    const calendario = aba.abrir(montarPaginaCalendario([ONTEM]));
    expect(aba.navegador.urls).toEqual([]);
    expect(
      calendario.documento.getElementById("sigga-aviso-sem-aula")?.textContent,
    ).toContain("Hoje (20/10)");
  });

  it("com intenção 'outraData', fica no calendário sem aviso e consome a intenção", () => {
    const aba = novaAba();
    registrarIntencao(aba, "outraData");
    const calendario = aba.abrir(montarPaginaCalendario([HOJE]));
    expect(aba.navegador.urls).toEqual([]);
    expect(
      calendario.documento.getElementById("sigga-aviso-sem-aula"),
    ).toBeNull();
    expect(aba.intencao()).toBeUndefined();
  });

  it("sem intenção, não faz nada", () => {
    const aba = novaAba();
    aba.abrir(montarPaginaCalendario([HOJE]));
    expect(aba.navegador.urls).toEqual([]);
  });
});

describe("FluxoChamada: caminho completo", () => {
  it("da turma à chamada de hoje, passando pela subturma única", () => {
    const aba = novaAba();
    clicarBotao(aba.abrir(montarPaginaTurma()), "Chamada de hoje");
    aba.abrir(montarPaginaSubturma(1));
    aba.abrir(montarPaginaCalendario([HOJE]));
    expect(aba.navegador.urls).toHaveLength(1);
    expect(aba.anunciador.mensagens).toEqual([
      "Abrindo a chamada de hoje…",
      "Abrindo a chamada de hoje…",
      "Abrindo a chamada de hoje…",
    ]);
  });
});
