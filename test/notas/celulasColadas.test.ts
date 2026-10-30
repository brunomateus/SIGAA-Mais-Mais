import { describe, expect, it } from "vitest";
import { lerCelulasColadas } from "../../src/notas/celulasColadas";

describe("lerCelulasColadas", () => {
  it("separa linhas por quebra de linha e células por tabulação", () => {
    expect(lerCelulasColadas("Matrícula\tU1\n500001\t7,5\n")).toEqual([
      ["Matrícula", "U1"],
      ["500001", "7,5"],
    ]);
  });

  it("aceita quebras de linha do Windows e descarta linhas vazias", () => {
    expect(lerCelulasColadas("a\tb\r\n\r\nc\td\r\n")).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  it("mantém células vazias no meio da linha", () => {
    expect(lerCelulasColadas("500001\t\t8")).toEqual([["500001", "", "8"]]);
  });

  it("lê células entre aspas com quebra de linha e aspas dobradas", () => {
    expect(lerCelulasColadas('"Nota\nfinal"\t"diz ""oi"""\nx\ty')).toEqual([
      ["Nota\nfinal", 'diz "oi"'],
      ["x", "y"],
    ]);
  });

  it("trata aspas sem par como texto comum", () => {
    expect(lerCelulasColadas('"abc\t1')).toEqual([['"abc', "1"]]);
  });
});
