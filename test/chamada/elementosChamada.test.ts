import { describe, expect, it } from "vitest";
import {
  inserirBotoesChamada,
  mostrarAvisoSemAulaHoje,
} from "../../src/chamada/elementosChamada";
import type { DestinoChamada } from "../../src/chamada/intencaoChamada";
import {
  montarPaginaCalendario,
  montarPaginaTurma,
} from "../suporte/paginasAva";

const botoesDa = (documento: Document): HTMLButtonElement[] => [
  ...documento.querySelectorAll<HTMLButtonElement>(
    "#sigga-barra-chamada button",
  ),
];

describe("inserirBotoesChamada", () => {
  it("insere os dois botões no topo do conteúdo da turma", () => {
    const { documento } = montarPaginaTurma();
    inserirBotoesChamada(documento, () => {});
    expect(botoesDa(documento).map((b) => b.textContent)).toEqual([
      "Chamada de hoje",
      "Chamada em outra data",
    ]);
    expect(documento.getElementById("conteudo")?.firstElementChild?.id).toBe(
      "sigga-barra-chamada",
    );
  });

  it("avisa o destino de cada botão", () => {
    const { documento } = montarPaginaTurma();
    const escolhas: DestinoChamada[] = [];
    inserirBotoesChamada(documento, (destino) => escolhas.push(destino));
    botoesDa(documento).forEach((botao) => botao.click());
    expect(escolhas).toEqual(["hoje", "outraData"]);
  });

  it("não duplica os botões se chamado de novo", () => {
    const { documento } = montarPaginaTurma();
    inserirBotoesChamada(documento, () => {});
    inserirBotoesChamada(documento, () => {});
    expect(botoesDa(documento)).toHaveLength(2);
  });
});

describe("mostrarAvisoSemAulaHoje", () => {
  it("avisa, acima do calendário, com a data em dd/mm", () => {
    const { documento } = montarPaginaCalendario([]);
    mostrarAvisoSemAulaHoje(documento, new Date(2026, 9, 3));
    const aviso = documento.getElementById("sigga-aviso-sem-aula");
    expect(aviso?.textContent).toBe(
      "Hoje (03/10) não é data de aula desta turma. Escolha uma data.",
    );
    expect(aviso?.nextElementSibling?.id).toBe("corpo");
  });
});
