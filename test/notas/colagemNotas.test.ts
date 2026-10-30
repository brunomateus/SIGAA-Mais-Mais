import { describe, expect, it } from "vitest";
import { ColagemDeNotas } from "../../src/notas/colagemNotas";
import { CalculoDeMediaFalso } from "../fakes/CalculoDeMediaFalso";
import { DialogoDeColagemFalso } from "../fakes/DialogoDeColagemFalso";
import { montarConteudoProgramado } from "../suporte/paginaConteudoProgramado";
import {
  criarAlunosSimulados,
  montarTelaLancarNotas,
  tabelaDeNotas,
} from "../suporte/telaLancarNotas";

function abrirTela(quantidade: number) {
  const tela = montarTelaLancarNotas(criarAlunosSimulados(quantidade));
  new CalculoDeMediaFalso().instalar(tabelaDeNotas(tela));
  const dialogo = new DialogoDeColagemFalso();
  new ColagemDeNotas({ documento: tela, dialogo }).iniciar();
  return { tela, dialogo };
}

// O clique abre o diálogo assíncrono; espera as promessas pendentes
async function clicarColar(tela: Document): Promise<void> {
  tela.getElementById("sigga-colar-notas")!.click();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function valor(tela: Document, nome: string): string {
  return tela.querySelector<HTMLInputElement>(`input[name="${nome}"]`)!.value;
}

describe("ColagemDeNotas", () => {
  it("insere o botão acima da tabela de notas", () => {
    const { tela } = abrirTela(1);
    const botao = tela.getElementById("sigga-colar-notas")!;
    expect(botao.nextElementSibling).toBe(tabelaDeNotas(tela));
  });

  it("preenche as notas confirmadas e mostra o resumo, sem salvar", async () => {
    const { tela, dialogo } = abrirTela(2);
    dialogo.textoColado = "Matrícula\tU1\tU2\n500001\t7\t8\n999999\t5\t5";
    await clicarColar(tela);
    expect(valor(tela, "nota_00")).toBe("7,0");
    expect(valor(tela, "nota_01")).toBe("8,0");
    expect(tela.getElementById("sigga-aviso-notas")?.textContent).toContain(
      "2 notas preenchidas · 1 matrícula da planilha não está na turma · 1 aluno da turma sem linha na planilha",
    );
  });

  it("lê a tela no clique, com as notas digitadas depois de abri-la", async () => {
    const { tela, dialogo } = abrirTela(1);
    tela.querySelector<HTMLInputElement>('input[name="nota_00"]')!.value =
      "3,0";
    dialogo.textoColado = "Matrícula\tU1\n500001\t7";
    await clicarColar(tela);
    expect(dialogo.contextos[0]!.alunos[0]!.camposUnidade[0]!.value).toBe(
      "7,0",
    );
    expect(tela.getElementById("sigga-aviso-notas")?.textContent).toContain(
      "1 nota preenchida",
    );
  });

  it("ao desistir, não preenche nada", async () => {
    const { tela, dialogo } = abrirTela(1);
    dialogo.desistir = true;
    await clicarColar(tela);
    expect(valor(tela, "nota_00")).toBe("");
    expect(tela.getElementById("sigga-aviso-notas")).toBeNull();
  });

  it("não age em outras telas", () => {
    const outra = montarConteudoProgramado([]);
    new ColagemDeNotas({
      documento: outra,
      dialogo: new DialogoDeColagemFalso(),
    }).iniciar();
    expect(outra.getElementById("sigga-colar-notas")).toBeNull();
  });
});
