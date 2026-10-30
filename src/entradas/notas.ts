// Content script da tela Lançar Notas: colar notas da planilha. A tela é reconhecida
// pelo conteúdo, pois quem chega pelo menu da turma vê um endereço de /sigaa/ava/
import { ColagemDeNotas } from "../notas/colagemNotas";
import { DialogoDeColagemNativo } from "../notas/dialogoColagem";

new ColagemDeNotas({
  documento: document,
  dialogo: new DialogoDeColagemNativo(document),
}).iniciar();
