// Content script de vinculos.jsf: monta as dependências reais e inicia a tela
import { ArmazenamentoChrome } from "../comum/armazenamento";
import { confirmarComDialogo } from "../comum/dialogo";
import { tentarAteDomPronto } from "../comum/espera";
import { RepositorioFavorito } from "../comum/favorito";
import { SinalPosLogin } from "../comum/sinalPosLogin";
import { mostrarTransicao } from "../comum/transicao";
import { encontrarVinculos } from "../vinculos/listaVinculos";
import { TelaVinculos } from "../vinculos/telaVinculos";

tentarAteDomPronto(() => {
  const vinculos = encontrarVinculos(document);
  if (vinculos.length === 0) return false;
  const favoritos = new RepositorioFavorito(
    new ArmazenamentoChrome(chrome.storage.local),
  );
  const tela = new TelaVinculos(vinculos, {
    favoritos,
    confirmar: confirmarComDialogo,
    anunciarTransicao: (mensagem) => void mostrarTransicao(document, mensagem),
    sinalPosLogin: new SinalPosLogin(sessionStorage),
    documento: document,
  });
  void tela.iniciar();
  return true;
});
