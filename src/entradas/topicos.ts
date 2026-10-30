// Content script das telas da turma virtual (/sigaa/ava/*): remoção de tópicos de aula em lote
import { criarEnvioDeFormulario } from "../comum/envioFormulario";
import { DialogoDeRemocaoNativo } from "../topicos/dialogoRemocao";
import { recarregarConteudoProgramado } from "../topicos/recarregamento";
import { RemocaoDeTopicosEmLote } from "../topicos/remocaoEmLote";
import { RemovedorDeTopicos } from "../topicos/removedorTopicos";
import { RegistroDeResumoRemocao } from "../topicos/resumoRemocao";

new RemocaoDeTopicosEmLote({
  documento: document,
  dialogo: new DialogoDeRemocaoNativo(document),
  removedor: new RemovedorDeTopicos({
    enviarFormulario: criarEnvioDeFormulario((url, opcoes) =>
      fetch(url, opcoes),
    ),
    interpretarHtml: (html) =>
      new DOMParser().parseFromString(html, "text/html"),
  }),
  resumo: new RegistroDeResumoRemocao(sessionStorage),
  recarregar: (documentoAtualizado) =>
    recarregarConteudoProgramado(
      {
        documentoVivo: document,
        submeter: (formulario) => formulario.submit(),
        irPara: (url) => location.assign(url),
      },
      documentoAtualizado,
    ),
  registrarFalha: ({ topico, motivo }) =>
    console.error(
      JSON.stringify({
        evento: "sigga.remocao_topico_falhou",
        id: topico.id,
        motivo,
      }),
    ),
}).iniciar();
