import type { SinalPosLogin } from "../comum/sinalPosLogin";
import type { AnunciadorDeTransicao } from "../comum/transicao";

const SELETOR_LINK_PORTAL_DOCENTE = 'a[href*="verPortalDocente.do"]';

export interface DependenciasPortalDocente {
  sinalPosLogin: SinalPosLogin;
  anunciarTransicao: AnunciadorDeTransicao;
  /** Navega sem deixar a página atual no histórico (ex.: `location.replace`). */
  navegar: (url: string) => void;
  documento: Document;
}

/**
 * Localiza o link para o Portal do Docente; ele só existe para quem tem acesso ao portal.
 *
 * @example
 * encontrarLinkPortalDocente(document)?.href; // "https://si3.ufc.br/sigaa/verPortalDocente.do"
 */
export function encontrarLinkPortalDocente(
  raiz: ParentNode,
): HTMLAnchorElement | undefined {
  return (
    raiz.querySelector<HTMLAnchorElement>(SELETOR_LINK_PORTAL_DOCENTE) ??
    undefined
  );
}

/**
 * Na primeira chegada à paginaInicial.do após o login, vai direto ao Portal do
 * Docente, se o usuário tiver acesso a ele. Visitas posteriores (ex.: pelo menu
 * "Módulos") não redirecionam, porque o sinal pós-login é consumido.
 *
 * @example
 * abrirPortalDocenteAposLogin({ sinalPosLogin, anunciarTransicao, navegar, documento });
 */
export function abrirPortalDocenteAposLogin(
  dependencias: DependenciasPortalDocente,
): boolean {
  if (!dependencias.sinalPosLogin.consumir()) return false;
  const link = encontrarLinkPortalDocente(dependencias.documento);
  if (!link) return false;
  dependencias.anunciarTransicao("Abrindo Portal do Docente…");
  dependencias.navegar(link.href);
  return true;
}
