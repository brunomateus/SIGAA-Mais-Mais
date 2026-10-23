// Content script de FrequenciaAluno/form.jsf (document_start): aplica a preferência de privacidade
import { ArmazenamentoChrome } from "../comum/armazenamento";
import { PreferenciaPrivacidade } from "../comum/preferenciaPrivacidade";
import { iniciarPrivacidadeFrequencia } from "../frequencia/privacidadeFrequencia";

const preferencia = new PreferenciaPrivacidade(
  new ArmazenamentoChrome(chrome.storage.local),
);
void iniciarPrivacidadeFrequencia(preferencia, document);
