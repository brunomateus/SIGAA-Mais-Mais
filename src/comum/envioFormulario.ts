/** Envia um formulário por POST e devolve o HTML da resposta. */
export type EnviarFormulario = (
  url: string,
  corpo: URLSearchParams,
) => Promise<string>;

/** O subconjunto de `fetch` usado aqui. */
export type Buscar = (url: string, opcoes: RequestInit) => Promise<Response>;

// O SIGAA declara windows-1252 só na <meta>; ler como UTF-8 estragaria os acentos
const PADRAO_CHARSET = /charset=["']?([\w-]+)/i;
const BYTES_PARA_META = 2048;

/**
 * `EnviarFormulario` sobre `fetch`, com os cookies da sessão do SIGAA e o texto
 * decodificado no charset da página.
 *
 * @example
 * const enviar = criarEnvioDeFormulario((url, opcoes) => fetch(url, opcoes));
 * const html = await enviar("/sigaa/ava/TopicoAula/listar.jsf", corpo);
 */
export function criarEnvioDeFormulario(buscar: Buscar): EnviarFormulario {
  return async (url, corpo) => {
    const resposta = await buscar(url, {
      method: "POST",
      body: corpo,
      credentials: "same-origin",
    });
    if (!resposta.ok)
      throw new Error(
        `POST ${url} respondeu ${resposta.status}; esperado um status 2xx`,
      );
    return decodificar(resposta);
  };
}

async function decodificar(resposta: Response): Promise<string> {
  const bytes = new Uint8Array(await resposta.arrayBuffer());
  const charset = detectarCharset(
    resposta.headers.get("content-type") ?? "",
    bytes,
  );
  return new TextDecoder(charset).decode(bytes);
}

/**
 * Charset da resposta: o do cabeçalho Content-Type, senão o da `<meta>`, senão UTF-8.
 *
 * @example
 * detectarCharset("text/html", bytesDaPagina); // "windows-1252"
 */
export function detectarCharset(
  contentType: string,
  bytes: Uint8Array,
): string {
  const inicio = new TextDecoder("latin1").decode(
    bytes.subarray(0, BYTES_PARA_META),
  );
  const rotulo =
    PADRAO_CHARSET.exec(contentType)?.[1] ?? PADRAO_CHARSET.exec(inicio)?.[1];
  return rotulo && ehCharsetConhecido(rotulo) ? rotulo : "utf-8";
}

function ehCharsetConhecido(rotulo: string): boolean {
  try {
    new TextDecoder(rotulo);
    return true;
  } catch {
    return false;
  }
}
