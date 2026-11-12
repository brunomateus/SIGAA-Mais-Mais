// Content script das telas da avaliação institucional (/sigaa/avaliacao/*): repetir a autoavaliação do docente
import { RepositorioDeAutoavaliacao } from "../autoavaliacao/autoavaliacaoGuardada";
import { RepeticaoDeAutoavaliacao } from "../autoavaliacao/repeticaoAutoavaliacao";
import { ArmazenamentoChrome } from "../comum/armazenamento";

void new RepeticaoDeAutoavaliacao({
  documento: document,
  guardadas: new RepositorioDeAutoavaliacao(
    new ArmazenamentoChrome(chrome.storage.local),
  ),
  agora: Date.now,
}).iniciar();
