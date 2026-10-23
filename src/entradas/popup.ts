// Script do popup.html: localiza os elementos, monta as dependências reais e inicia os painéis
import { ArmazenamentoChrome } from "../comum/armazenamento";
import { RepositorioFavorito } from "../comum/favorito";
import { PreferenciaPrivacidade } from "../comum/preferenciaPrivacidade";
import { PainelPopup } from "../popup/painelPopup";
import { PainelPrivacidade } from "../popup/painelPrivacidade";

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

const armazenamento = new ArmazenamentoChrome(chrome.storage.local);
const favoritos = new RepositorioFavorito(armazenamento);
void new PainelPopup(favoritos, {
  status: elementoPorId("atual", HTMLElement),
  botaoAutomatico: elementoPorId("auto", HTMLButtonElement),
  botaoLimpar: elementoPorId("limpar", HTMLButtonElement),
}).iniciar();
void new PainelPrivacidade(
  new PreferenciaPrivacidade(armazenamento),
  elementoPorId("ocultar-necessidades", HTMLInputElement),
).iniciar();
