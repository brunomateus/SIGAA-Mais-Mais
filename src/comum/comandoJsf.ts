/**
 * Um envio de formulário JSF: o que o `jsfcljs` de um link do SIGAA mandaria ao
 * servidor. `acao` é o atributo `action` do formulário, como está no HTML.
 */
export interface ComandoJsf {
  acao: string;
  campos: [string, string][];
}

// Ex.: jsfcljs(document.forms['form101'],'form101:cmd,form101:cmd,id,79533231','')
const PADRAO_JSFCLJS = /jsfcljs\(document\.forms\['([^']+)'\],'([^']*)'/;

/**
 * Lê do `onclick` de um link JSF o envio que ele faria: os campos do formulário
 * (inclusive o ViewState) mais os pares nome/valor que o `jsfcljs` acrescenta.
 *
 * @example
 * const comando = lerComandoJsf(linkDaLixeira);
 * comando?.campos; // [["form101", "form101"], ["javax.faces.ViewState", "j_id5"], ["id", "79533231"], …]
 */
export function lerComandoJsf(link: HTMLAnchorElement): ComandoJsf | undefined {
  const encontrado = PADRAO_JSFCLJS.exec(link.getAttribute("onclick") ?? "");
  if (!encontrado) return undefined;
  const formulario = link.ownerDocument.forms.namedItem(encontrado[1]!);
  if (!(formulario instanceof HTMLFormElement)) return undefined;
  return {
    acao: formulario.getAttribute("action") ?? "",
    campos: [
      ...camposDoFormulario(formulario),
      ...paresDoJsfcljs(encontrado[2]!),
    ],
  };
}

// Caixas sem `name` (como as que a extensão insere) ficam de fora, como no envio do navegador
function camposDoFormulario(formulario: HTMLFormElement): [string, string][] {
  return [...formulario.querySelectorAll<HTMLInputElement>("input[name]")]
    .filter((campo) => !ehMarcavelDesmarcado(campo))
    .map((campo) => [campo.name, campo.value]);
}

function ehMarcavelDesmarcado(campo: HTMLInputElement): boolean {
  const marcavel = campo.type === "checkbox" || campo.type === "radio";
  return marcavel && !campo.checked;
}

// "a,b,c,d" → [["a", "b"], ["c", "d"]]
function paresDoJsfcljs(lista: string): [string, string][] {
  const partes = lista.split(",").filter((parte) => parte !== "");
  const pares: [string, string][] = [];
  for (let i = 0; i + 1 < partes.length; i += 2)
    pares.push([partes[i]!, partes[i + 1]!]);
  return pares;
}

/**
 * Corpo `application/x-www-form-urlencoded` do comando, para envio em segundo plano.
 *
 * @example
 * await enviarFormulario(comando.acao, corpoDoComando(comando));
 */
export function corpoDoComando(comando: ComandoJsf): URLSearchParams {
  return new URLSearchParams(comando.campos);
}

/**
 * Monta, em `documento`, um formulário oculto equivalente ao comando, para que
 * ele seja enviado como uma navegação comum.
 *
 * @example
 * montarFormularioJsf(document, comando).submit();
 */
export function montarFormularioJsf(
  documento: Document,
  comando: ComandoJsf,
): HTMLFormElement {
  const formulario = documento.createElement("form");
  formulario.method = "post";
  formulario.setAttribute("action", comando.acao);
  formulario.hidden = true;
  for (const [nome, valor] of comando.campos) {
    const campo = documento.createElement("input");
    Object.assign(campo, { type: "hidden", name: nome, value: valor });
    formulario.append(campo);
  }
  documento.body.append(formulario);
  return formulario;
}
