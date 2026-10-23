// vinculos.ts — content script de vinculos.jsf: botões "★ Favorito" e seleção automática
import { confirmar } from "./dialogo";
import { AUTO, lerFavorito, salvarFavorito } from "./favorito";
import { norm, quandoPronto } from "./util";

interface Vinculo {
  link: HTMLAnchorElement;
  rotulo: string;
}

// Favorito em memória, mantido em sincronia com o storage pelos botões e pela confirmação.
let favoritoAtual: string | undefined;

function encontrarVinculos(): Vinculo[] {
  return [...document.querySelectorAll<HTMLAnchorElement>("ul li a")].flatMap(link => {
    const rotulo = link.querySelector("span.col-xs-2")?.textContent?.trim();
    return rotulo ? [{ link, rotulo }] : [];
  });
}

function escolherAlvo(vinculos: Vinculo[], favorito: string | undefined): Vinculo | undefined {
  if (!favorito) return undefined;
  if (favorito === AUTO) return vinculos.length === 1 ? vinculos[0] : undefined;
  return vinculos.find(v => norm(v.rotulo) === norm(favorito));
}

async function definirFavorito(rotulo: string): Promise<void> {
  await salvarFavorito(rotulo);
  favoritoAtual = rotulo;
  document.querySelectorAll<HTMLButtonElement>("[data-ext-fav]")
    .forEach(b => pintar(b, norm(b.dataset.extFav) === norm(rotulo)));
}

/* ---------- Botões "★ Favorito" ---------- */

function pintar(btn: HTMLButtonElement, marcado: boolean): void {
  btn.textContent = marcado ? "★ Favorito ✓" : "★ Favorito";
  btn.style.background = marcado ? "#ffd54f" : "#fff";
  btn.style.borderColor = marcado ? "#c9a227" : "#999";
}

function adicionarBotoes(vinculos: Vinculo[]): void {
  for (const v of vinculos) {
    if (v.link.querySelector("[data-ext-fav]")) continue;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.extFav = v.rotulo;
    Object.assign(btn.style, {
      marginLeft: "8px", padding: "2px 8px", fontSize: "12px",
      cursor: "pointer", borderRadius: "4px", border: "1px solid #999",
      color: "#333", whiteSpace: "nowrap"
    });
    pintar(btn, norm(favoritoAtual) === norm(v.rotulo));

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      definirFavorito(v.rotulo);
    });

    (v.link.querySelector("span.col-xs-6") ?? v.link).appendChild(btn);
  }
}

/* ---------- Primeiro acesso: confirmar o favorito antes de entrar ---------- */

function exigirFavoritoNaPrimeiraEscolha(vinculos: Vinculo[]): void {
  let liberado = false;

  // Fase de captura no document: roda antes do onclick do SIGAA no próprio link
  document.addEventListener("click", async (e) => {
    if (favoritoAtual || liberado || !(e.target instanceof Element)) return;
    if (e.target.closest("[data-ext-fav]")) return;
    const v = vinculos.find(v => v.link.contains(e.target as Node));
    if (!v) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const ok = await confirmar(
      "Definir vínculo favorito?",
      `“${v.rotulo}” será selecionado automaticamente nos próximos acessos. ` +
      "Você pode alterar isso depois pelo botão ★ ou pelo ícone da extensão.",
      "Confirmar e entrar"
    );
    if (!ok) return;

    await definirFavorito(v.rotulo);
    liberado = true;
    v.link.click();
  }, true);
}

/* ---------- Fluxo principal ---------- */

function iniciar(): boolean {
  const vinculos = encontrarVinculos();
  if (vinculos.length === 0) return false;

  lerFavorito().then(favorito => {
    favoritoAtual = favorito;
    adicionarBotoes(vinculos);
    exigirFavoritoNaPrimeiraEscolha(vinculos);
    escolherAlvo(vinculos, favorito)?.link.click();
  });
  return true;
}

quandoPronto(iniciar);
