import { describe, expect, it } from "vitest";
import { encontrarFormularioAutoavaliacao } from "../../src/autoavaliacao/formularioAutoavaliacao";
import {
  descreverCopia,
  preencherAutoavaliacao,
} from "../../src/autoavaliacao/preenchimentoAutoavaliacao";
import {
  marcadas,
  montarFormularioAutoavaliacao,
} from "../suporte/formularioAutoavaliacao";

function abrir() {
  const documento = montarFormularioAutoavaliacao();
  return {
    documento,
    formulario: encontrarFormularioAutoavaliacao(documento)!,
  };
}

describe("preencherAutoavaliacao", () => {
  it("marca as opções guardadas e destaca as linhas", () => {
    const { documento, formulario } = abrir();
    const resultado = preencherAutoavaliacao(formulario, {
      opcoes: { p_59: "50", p_40: "29", p_60: "31" },
      sugestao: "",
    });
    expect(resultado).toEqual({ preenchidas: 3, naoPreenchidas: 0 });
    expect(marcadas(documento)).toEqual({ p_59: "50", p_40: "29", p_60: "31" });
    expect(
      documento.querySelector<HTMLElement>("li")!.style.backgroundColor,
    ).not.toBe("");
  });

  // Ex.: "Não se aplica" guardado para uma pergunta que, aqui, não tem essa opção
  it("conta como não preenchida a pergunta sem resposta ou sem a opção guardada", () => {
    const { documento, formulario } = abrir();
    const resultado = preencherAutoavaliacao(formulario, {
      opcoes: { p_59: "29", p_40: "50", p_99: "29" },
      sugestao: "",
    });
    expect(resultado).toEqual({ preenchidas: 1, naoPreenchidas: 2 });
    expect(marcadas(documento)).toEqual({ p_59: "29" });
  });

  it("avisa o SIGAA de cada opção marcada", () => {
    const { documento, formulario } = abrir();
    const mudancas: string[] = [];
    documento.addEventListener("change", (e) =>
      mudancas.push((e.target as HTMLInputElement).name),
    );
    preencherAutoavaliacao(formulario, {
      opcoes: { p_40: "30" },
      sugestao: "",
    });
    expect(mudancas).toEqual(["p_40"]);
  });

  it("copia a questão optativa até o limite de 500 caracteres", () => {
    const { formulario } = abrir();
    preencherAutoavaliacao(formulario, {
      opcoes: {},
      sugestao: "a".repeat(600),
    });
    expect(formulario.campoSugestao!.value).toHaveLength(500);
  });

  it("não apaga a questão optativa quando a guardada está vazia", () => {
    const { formulario } = abrir();
    formulario.campoSugestao!.value = "já escrito";
    preencherAutoavaliacao(formulario, { opcoes: {}, sugestao: "" });
    expect(formulario.campoSugestao!.value).toBe("já escrito");
  });
});

describe("descreverCopia", () => {
  it("só menciona as não preenchidas quando há alguma", () => {
    expect(descreverCopia({ preenchidas: 14, naoPreenchidas: 0 })).toBe(
      "14 perguntas preenchidas. Revise e clique em Salvar Formulário de Avaliação.",
    );
  });

  it("no singular e no plural", () => {
    expect(descreverCopia({ preenchidas: 1, naoPreenchidas: 1 })).toBe(
      "1 pergunta preenchida · 1 pergunta não preenchida; responda-a à mão. Revise e clique em Salvar Formulário de Avaliação.",
    );
    expect(descreverCopia({ preenchidas: 12, naoPreenchidas: 2 })).toContain(
      "2 perguntas não preenchidas; responda-as à mão",
    );
  });
});
