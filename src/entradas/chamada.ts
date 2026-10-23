// Content script das telas da turma virtual (/sigaa/ava/*): atalhos da chamada
import { mostrarTransicao } from "../comum/transicao";
import { FluxoChamada } from "../chamada/fluxoChamada";
import { IntencaoDeChamada } from "../chamada/intencaoChamada";

new FluxoChamada({
  documento: document,
  intencao: new IntencaoDeChamada(sessionStorage),
  anunciarTransicao: (mensagem) => void mostrarTransicao(document, mensagem),
  navegar: (url) => location.assign(url),
  hoje: () => new Date(),
}).iniciar();
