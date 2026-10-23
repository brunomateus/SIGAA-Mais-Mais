// Content script de paginaInicial.do: monta as dependências reais e abre o Portal Docente
import { SinalPosLogin } from "../comum/sinalPosLogin";
import { mostrarTransicao } from "../comum/transicao";
import { abrirPortalDocenteAposLogin } from "../portal/portalDocente";

abrirPortalDocenteAposLogin({
  sinalPosLogin: new SinalPosLogin(sessionStorage),
  anunciarTransicao: (mensagem) => void mostrarTransicao(document, mensagem),
  // replace: o botão Voltar não deve levar de novo à paginaInicial.do
  navegar: (url) => location.replace(url),
  documento: document,
});
