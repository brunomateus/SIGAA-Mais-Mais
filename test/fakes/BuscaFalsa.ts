/** Imita `fetch`: registra as chamadas e devolve a resposta configurada. */
export class BuscaFalsa {
  readonly chamadas: { url: string; opcoes: RequestInit }[] = [];
  status = 200;
  contentType = "text/html";
  bytes: Uint8Array<ArrayBuffer> = new Uint8Array();

  readonly buscar = async (
    url: string,
    opcoes: RequestInit,
  ): Promise<Response> => {
    this.chamadas.push({ url, opcoes });
    return new Response(this.bytes, {
      status: this.status,
      headers: { "content-type": this.contentType },
    });
  };
}
