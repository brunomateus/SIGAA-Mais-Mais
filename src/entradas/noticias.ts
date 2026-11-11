// Content script das telas da turma virtual (/sigaa/ava/*): atalho "Nova notícia"
import { criarEnvioDeFormulario } from "../comum/envioFormulario";
import { mostrarTransicao } from "../comum/transicao";
import { AtalhoNovaNoticia } from "../noticias/atalhoNovaNoticia";

new AtalhoNovaNoticia({
  documento: document,
  enviarFormulario: criarEnvioDeFormulario((url, opcoes) => fetch(url, opcoes)),
  interpretarHtml: (html) => new DOMParser().parseFromString(html, "text/html"),
  submeter: (formulario) => formulario.submit(),
  mostrarTransicao: (mensagem) => mostrarTransicao(document, mensagem),
  registrarFalha: (motivo) =>
    console.error(
      JSON.stringify({ evento: "sigga.nova_noticia_falhou", motivo }),
    ),
}).iniciar();
