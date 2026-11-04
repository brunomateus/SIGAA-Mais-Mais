import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

interface ContentScriptDeclarado {
  matches: string[];
  js?: string[];
}

interface ConfiguracaoFirefox {
  id: string;
  strict_min_version: string;
  data_collection_permissions: { required: string[] };
}

// O Vitest roda a partir da raiz do projeto
const MANIFEST = JSON.parse(
  readFileSync(join(process.cwd(), "public", "manifest.json"), "utf8"),
) as {
  content_scripts: ContentScriptDeclarado[];
  browser_specific_settings?: { gecko?: ConfiguracaoFirefox };
};

// Versão reduzida dos match patterns do Chrome: "*" casa qualquer trecho
function casaPadrao(padrao: string, url: string): boolean {
  const escapado = padrao.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^${escapado.replace(/\*/g, ".*")}$`);
  return regex.test(url);
}

function scriptsInjetadosEm(url: string): string[] {
  return MANIFEST.content_scripts
    .filter((script) => script.matches.some((p) => casaPadrao(p, url)))
    .flatMap((script) => script.js ?? []);
}

describe("manifest: atalhos da chamada", () => {
  it("injeta chamada.js nas telas da turma virtual", () => {
    expect(
      scriptsInjetadosEm("https://si3.ufc.br/sigaa/ava/index.jsf"),
    ).toContain("chamada.js");
  });

  // No JSF, ao entrar na turma pelo Portal Docente, a barra de endereço continua
  // em docente.jsf (destino do formulário do portal), e os botões não apareciam
  it("injeta chamada.js na turma aberta a partir do Portal Docente", () => {
    expect(
      scriptsInjetadosEm(
        "https://si3.ufc.br/sigaa/portais/docente/docente.jsf",
      ),
    ).toContain("chamada.js");
  });
});

describe("manifest: remoção de tópicos de aula em lote", () => {
  it("injeta topicos.js nas telas da turma virtual", () => {
    expect(
      scriptsInjetadosEm("https://si3.ufc.br/sigaa/ava/TopicoAula/listar.jsf"),
    ).toContain("topicos.js");
  });
});

describe("manifest: colar notas da planilha", () => {
  it.each([
    "https://si3.ufc.br/sigaa/ensino/consolidacao/detalhesTurma.jsf",
    // Pelo menu da turma, a barra de endereço mostra o destino do formulário anterior
    "https://si3.ufc.br/sigaa/ava/index.jsf",
  ])("injeta notas.js em %s", (url) => {
    expect(scriptsInjetadosEm(url)).toContain("notas.js");
  });
});

describe("manifest: Firefox", () => {
  // O ID liga as atualizações e os dados guardados: mudá-lo equivale a outra extensão
  it("declara o ID fixo, a versão mínima e que não coleta dados", () => {
    expect(MANIFEST.browser_specific_settings?.gecko).toEqual({
      id: "sigga-mais-mais@brunomateus.github.io",
      // A partir da 127, o Firefox concede na instalação as permissões dos content scripts MV3
      strict_min_version: "128.0",
      data_collection_permissions: { required: ["none"] },
    });
  });
});
