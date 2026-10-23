import { describe, expect, it } from "vitest";
import { IntencaoDeChamada } from "../../src/chamada/intencaoChamada";
import { ArmazenamentoDaAbaEmMemoria } from "../fakes/ArmazenamentoDaAbaEmMemoria";
import { RelogioFalso } from "../fakes/RelogioFalso";

function novaIntencao() {
  const armazenamento = new ArmazenamentoDaAbaEmMemoria();
  const relogio = new RelogioFalso();
  const intencao = new IntencaoDeChamada(armazenamento, relogio.agora);
  return { armazenamento, relogio, intencao };
}

describe("IntencaoDeChamada", () => {
  it("não tem destino antes de registrar", () => {
    expect(novaIntencao().intencao.consultar()).toBeUndefined();
  });

  it("devolve o destino registrado, sem consumi-lo", () => {
    const { intencao } = novaIntencao();
    intencao.registrar("hoje");
    expect(intencao.consultar()).toBe("hoje");
    expect(intencao.consultar()).toBe("hoje");
  });

  it("é compartilhada entre páginas da mesma aba", () => {
    const { armazenamento, relogio, intencao } = novaIntencao();
    intencao.registrar("outraData");
    const naProximaPagina = new IntencaoDeChamada(armazenamento, relogio.agora);
    expect(naProximaPagina.consultar()).toBe("outraData");
  });

  it("expira depois de 5 minutos", () => {
    const { relogio, intencao } = novaIntencao();
    intencao.registrar("hoje");
    relogio.avancarMinutos(5);
    expect(intencao.consultar()).toBe("hoje");
    relogio.avancarMinutos(0.01);
    expect(intencao.consultar()).toBeUndefined();
  });

  it("deixa de existir ao ser descartada", () => {
    const { intencao } = novaIntencao();
    intencao.registrar("hoje");
    intencao.descartar();
    expect(intencao.consultar()).toBeUndefined();
  });

  it("ignora valores salvos corrompidos", () => {
    const { armazenamento, intencao } = novaIntencao();
    armazenamento.setItem("sigga_intencao_chamada", "{não é json");
    expect(intencao.consultar()).toBeUndefined();
    armazenamento.setItem("sigga_intencao_chamada", '{"destino":"amanha"}');
    expect(intencao.consultar()).toBeUndefined();
  });
});
