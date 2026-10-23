// Script do popup.html: localiza os elementos, monta as dependências reais e inicia o painel
import { ArmazenamentoChrome } from "../comum/armazenamento";
import { RepositorioFavorito } from "../comum/favorito";
import { PainelPopup } from "../popup/painelPopup";

function elementoPorId<T extends HTMLElement>(
  id: string,
  tipo: new () => T,
): T {
  const elemento = document.getElementById(id);
  if (elemento instanceof tipo) return elemento;
  throw new Error(
    `popup.html: esperado #${id} do tipo ${tipo.name}, encontrado ${elemento?.constructor.name ?? "nenhum elemento"}`,
  );
}

const favoritos = new RepositorioFavorito(
  new ArmazenamentoChrome(chrome.storage.local),
);
void new PainelPopup(favoritos, {
  status: elementoPorId("atual", HTMLElement),
  botaoAutomatico: elementoPorId("auto", HTMLButtonElement),
  botaoLimpar: elementoPorId("limpar", HTMLButtonElement),
}).iniciar();
