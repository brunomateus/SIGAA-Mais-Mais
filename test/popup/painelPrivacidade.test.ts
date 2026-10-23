import { afterEach, describe, expect, it } from "vitest";
import { PreferenciaPrivacidade } from "../../src/comum/preferenciaPrivacidade";
import { PainelPrivacidade } from "../../src/popup/painelPrivacidade";
import { ArmazenamentoEmMemoria } from "../fakes/ArmazenamentoEmMemoria";
import { aguardarTarefasPendentes } from "../suporte/paginaVinculos";

async function abrirPainel(ocultarSalvo?: boolean) {
  const preferencia = new PreferenciaPrivacidade(new ArmazenamentoEmMemoria());
  if (ocultarSalvo !== undefined) await preferencia.salvarOcultar(ocultarSalvo);
  const caixa = document.createElement("input");
  caixa.type = "checkbox";
  // Fora do documento, o clique num checkbox não dispara "change" (especificação HTML)
  document.body.appendChild(caixa);
  await new PainelPrivacidade(preferencia, caixa).iniciar();
  return { preferencia, caixa };
}

describe("PainelPrivacidade", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("abre com a opção marcada por padrão", async () => {
    const { caixa } = await abrirPainel();
    expect(caixa.checked).toBe(true);
  });

  it("reflete a preferência salva", async () => {
    const { caixa } = await abrirPainel(false);
    expect(caixa.checked).toBe(false);
  });

  it("salva a escolha ao marcar ou desmarcar", async () => {
    const { preferencia, caixa } = await abrirPainel();
    caixa.click();
    await aguardarTarefasPendentes();
    expect(await preferencia.lerOcultar()).toBe(false);
    caixa.click();
    await aguardarTarefasPendentes();
    expect(await preferencia.lerOcultar()).toBe(true);
  });
});
