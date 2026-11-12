import { criarAviso } from "../comum/aviso";
import {
  criarBotaoAtalho,
  inserirNaBarraDeAtalhos,
} from "../comum/barraAtalhosTurma";
import type { DestinoChamada } from "./intencaoChamada";

const ID_AVISO = "sigga-aviso-sem-aula";

/**
 * Insere no topo da página da turma os botões "Chamada de hoje" e "Chamada em outra data".
 *
 * @example
 * inserirBotoesChamada(document, (destino) => iniciarChamada(destino));
 */
export function inserirBotoesChamada(
  documento: Document,
  aoEscolher: (destino: DestinoChamada) => void,
): void {
  inserirNaBarraDeAtalhos(documento, "chamada", [
    criarBotaoAtalho(documento, "Chamada de hoje", "principal", () =>
      aoEscolher("hoje"),
    ),
    criarBotaoAtalho(documento, "Chamada em outra data", "secundario", () =>
      aoEscolher("outraData"),
    ),
  ]);
}

/**
 * Avisa, acima do calendário, que hoje (`data`) não é data de aula da turma.
 *
 * @example
 * mostrarAvisoSemAulaHoje(document, new Date()); // "Hoje (23/10) não é data de aula…"
 */
export function mostrarAvisoSemAulaHoje(documento: Document, data: Date): void {
  const corpo = documento.getElementById("corpo");
  if (!corpo || documento.getElementById(ID_AVISO)) return;
  const aviso = criarAviso(
    documento,
    ID_AVISO,
    `Hoje (${formatarDiaMes(data)}) não é data de aula desta turma. Escolha uma data.`,
  );
  corpo.before(aviso);
}

function formatarDiaMes(data: Date): string {
  const doisDigitos = (n: number): string => String(n).padStart(2, "0");
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}`;
}
