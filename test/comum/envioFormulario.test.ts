import { describe, expect, it } from "vitest";
import {
  criarEnvioDeFormulario,
  detectarCharset,
} from "../../src/comum/envioFormulario";
import { BuscaFalsa } from "../fakes/BuscaFalsa";

// "Conteúdo" em windows-1252: o "ú" é o byte 0xFA
const CONTEUDO_1252 = new Uint8Array([
  ...new TextEncoder().encode(
    '<meta http-equiv="Content-Type" content="text/html; charset=windows-1252">Conte',
  ),
  0xfa,
  ...new TextEncoder().encode("do"),
]);

describe("criarEnvioDeFormulario", () => {
  it("envia POST com os cookies da sessão e o corpo do formulário", async () => {
    const busca = new BuscaFalsa();
    const corpo = new URLSearchParams({ id: "42" });
    await criarEnvioDeFormulario(busca.buscar)("/sigaa/ava/x.jsf", corpo);
    expect(busca.chamadas).toEqual([
      {
        url: "/sigaa/ava/x.jsf",
        opcoes: { method: "POST", body: corpo, credentials: "same-origin" },
      },
    ]);
  });

  it("decodifica a resposta no charset declarado na <meta>", async () => {
    const busca = new BuscaFalsa();
    busca.bytes = CONTEUDO_1252;
    const html = await criarEnvioDeFormulario(busca.buscar)(
      "/x",
      new URLSearchParams(),
    );
    expect(html.endsWith("Conteúdo")).toBe(true);
  });

  it("rejeita respostas de erro informando o status", async () => {
    const busca = new BuscaFalsa();
    busca.status = 500;
    await expect(
      criarEnvioDeFormulario(busca.buscar)("/x", new URLSearchParams()),
    ).rejects.toThrow("POST /x respondeu 500");
  });
});

describe("detectarCharset", () => {
  it("prefere o charset do cabeçalho", () => {
    expect(
      detectarCharset("text/html; charset=ISO-8859-1", CONTEUDO_1252),
    ).toBe("ISO-8859-1");
  });

  it("usa a <meta> quando o cabeçalho não declara charset", () => {
    expect(detectarCharset("text/html", CONTEUDO_1252)).toBe("windows-1252");
  });

  it("cai para UTF-8 sem declaração ou com charset desconhecido", () => {
    expect(detectarCharset("text/html", new Uint8Array())).toBe("utf-8");
    expect(
      detectarCharset("text/html; charset=inventado", new Uint8Array()),
    ).toBe("utf-8");
  });
});
