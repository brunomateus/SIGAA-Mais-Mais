import { describe, expect, it } from "vitest";
import { PreferenciaPrivacidade } from "../../src/comum/preferenciaPrivacidade";
import { ArmazenamentoEmMemoria } from "../fakes/ArmazenamentoEmMemoria";

describe("PreferenciaPrivacidade", () => {
  it("oculta por padrão quando nada foi salvo", async () => {
    const preferencia = new PreferenciaPrivacidade(
      new ArmazenamentoEmMemoria(),
    );
    expect(await preferencia.lerOcultar()).toBe(true);
  });

  it("lê de volta a escolha salva", async () => {
    const preferencia = new PreferenciaPrivacidade(
      new ArmazenamentoEmMemoria(),
    );
    await preferencia.salvarOcultar(false);
    expect(await preferencia.lerOcultar()).toBe(false);
  });

  it("volta a ocultar quando o valor salvo não é booleano", async () => {
    const armazenamento = new ArmazenamentoEmMemoria();
    await armazenamento.gravar("ocultar_necessidades_frequencia", "não");
    expect(await new PreferenciaPrivacidade(armazenamento).lerOcultar()).toBe(
      true,
    );
  });

  it("avisa mudanças, tratando a remoção como o padrão (ocultar)", async () => {
    const armazenamento = new ArmazenamentoEmMemoria();
    const preferencia = new PreferenciaPrivacidade(armazenamento);
    const avisos: boolean[] = [];
    preferencia.aoMudar((ocultar) => avisos.push(ocultar));
    await preferencia.salvarOcultar(false);
    await armazenamento.remover("ocultar_necessidades_frequencia");
    expect(avisos).toEqual([false, true]);
  });
});
