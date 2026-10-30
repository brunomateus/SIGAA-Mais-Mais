/**
 * Lê o texto colado de uma planilha (Google Sheets, Excel, LibreOffice): linhas
 * separadas por quebra de linha e células por tabulação. Células com quebra de
 * linha ou aspas vêm entre aspas, com aspas internas dobradas. Linhas vazias
 * são descartadas.
 *
 * @example
 * lerCelulasColadas("Matrícula\tUnid 1\n512345\t7,5"); // [["Matrícula", "Unid 1"], ["512345", "7,5"]]
 */
export function lerCelulasColadas(texto: string): string[][] {
  const linhas: string[][] = [];
  let linha: string[] = [];
  let posicao = 0;
  while (posicao <= texto.length) {
    const { valor, fim } = lerCelula(texto, posicao);
    linha.push(valor);
    posicao = fim + tamanhoDoSeparador(texto, fim);
    if (texto[fim] === "\t") continue;
    linhas.push(linha);
    linha = [];
  }
  return linhas.filter((celulas) => celulas.some((c) => c.trim() !== ""));
}

interface CelulaLida {
  valor: string;
  /** Posição do separador (tabulação, quebra de linha) ou do fim do texto. */
  fim: number;
}

function lerCelula(texto: string, inicio: number): CelulaLida {
  const entreAspas =
    texto[inicio] === '"' ? lerEntreAspas(texto, inicio) : undefined;
  if (entreAspas) return entreAspas;
  const fim = proximoSeparador(texto, inicio);
  return { valor: texto.slice(inicio, fim), fim };
}

// Aspas sem par ou seguidas de texto não são delimitadores: a célula é lida como está
function lerEntreAspas(texto: string, inicio: number): CelulaLida | undefined {
  let busca = inicio + 1;
  for (;;) {
    const aspa = texto.indexOf('"', busca);
    if (aspa === -1) return undefined;
    if (texto[aspa + 1] === '"') {
      busca = aspa + 2;
      continue;
    }
    if (!ehSeparadorOuFim(texto, aspa + 1)) return undefined;
    return {
      valor: texto.slice(inicio + 1, aspa).replaceAll('""', '"'),
      fim: aspa + 1,
    };
  }
}

function proximoSeparador(texto: string, inicio: number): number {
  let posicao = inicio;
  while (!ehSeparadorOuFim(texto, posicao)) posicao += 1;
  return posicao;
}

function ehSeparadorOuFim(texto: string, posicao: number): boolean {
  const caractere = texto[posicao];
  return caractere === undefined || "\t\r\n".includes(caractere);
}

function tamanhoDoSeparador(texto: string, posicao: number): number {
  return texto[posicao] === "\r" && texto[posicao + 1] === "\n" ? 2 : 1;
}
