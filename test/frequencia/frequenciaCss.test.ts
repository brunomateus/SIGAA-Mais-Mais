import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

// O Vitest roda a partir da raiz do projeto
const CSS_FREQUENCIA = readFileSync(
  join(process.cwd(), "public", "frequencia.css"),
  "utf8",
);

const ICONE = "/sigaa/img/necessidades_especiais/fisica.png";

// Imitação de uma linha da tabela #frequencia: nome do aluno + indicador
const TABELA = `
  <table id="frequencia"><tbody><tr>
    <td>
      <span id="nome">Maria da Silva</span>
      <div><img id="icone" src="${ICONE}"><span id="descricao">(Deficiência física)</span></div>
      <div id="vazio"></div>
      <img id="outra-imagem" src="/sigaa/img/foto.png"><span id="outro-texto">Presente</span>
    </td>
  </tr></tbody></table>`;

const exibicao = (id: string): string => {
  const elemento = document.getElementById(id);
  if (!elemento) throw new Error(`elemento #${id} ausente da tabela de teste`);
  return getComputedStyle(elemento).display;
};

describe("frequencia.css", () => {
  beforeEach(() => {
    document.head.innerHTML = `<style>${CSS_FREQUENCIA}</style>`;
    document.body.innerHTML = TABELA;
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-sigga-necessidades");
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("oculta o ícone de necessidades especiais", () => {
    expect(exibicao("icone")).toBe("none");
  });

  it("oculta o texto descritivo logo após o ícone", () => {
    expect(exibicao("descricao")).toBe("none");
  });

  it("oculta contêineres vazios", () => {
    expect(exibicao("vazio")).toBe("none");
  });

  it("mantém visíveis o nome do aluno, outras imagens e outros textos", () => {
    expect(exibicao("nome")).not.toBe("none");
    expect(exibicao("outra-imagem")).not.toBe("none");
    expect(exibicao("outro-texto")).not.toBe("none");
  });

  it("não afeta elementos fora da tabela #frequencia", () => {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<img id="fora" src="${ICONE}">`,
    );
    expect(exibicao("fora")).not.toBe("none");
  });

  it("mostra os indicadores quando o docente desliga a ocultação", () => {
    document.documentElement.setAttribute(
      "data-sigga-necessidades",
      "visiveis",
    );
    expect(exibicao("icone")).not.toBe("none");
    expect(exibicao("descricao")).not.toBe("none");
  });
});
