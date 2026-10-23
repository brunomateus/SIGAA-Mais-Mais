// vinculos.ts — content script de vinculos.jsf: botões "★ Favorito" e seleção automática
import { AUTO, lerFavorito, salvarFavorito } from "./favorito";
import { norm, quandoPronto } from "./util";

interface Vinculo {
  link: HTMLAnchorElement;
  item: HTMLLIElement;
  rotulo: string;
  inativo: boolean;
}

function ehInativo(item: HTMLLIElement): boolean {
  return item.classList.contains("disabled") ||
         !!item.querySelector(".withoutFormatInativo, .icon-disabled");
}

function encontrarVinculos(): Vinculo[] {
  return [...document.querySelectorAll<HTMLAnchorElement>("ul li a")].flatMap(link => {
    const rotulo = link.querySelector("span.col-xs-2")?.textContent?.trim();
    const item = link.closest("li");
    if (!rotulo || !item) return [];
    return [{ link, item, rotulo, inativo: ehInativo(item) }];
  });
}

function escolherAlvo(vinculos: Vinculo[], favorito: string | undefined): Vinculo | undefined {
  const ativos = vinculos.filter(v => !v.inativo);
  if (!favorito) return undefined;
  if (favorito === AUTO) return ativos.length === 1 ? ativos[0] : undefined;
  return ativos.find(v => norm(v.rotulo) === norm(favorito));
}

/* ---------- Botões "★ Favorito" ---------- */

function pintar(btn: HTMLButtonElement, marcado: boolean): void {
  btn.textContent = marcado ? "★ Favorito ✓" : "★ Favorito";
  btn.style.background = marcado ? "#ffd54f" : "#fff";
  btn.style.borderColor = marcado ? "#c9a227" : "#999";
}

function adicionarBotoes(vinculos: Vinculo[], favorito: string | undefined): void {
  for (const v of vinculos) {
    if (v.item.querySelector("[data-ext-fav]")) continue;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.extFav = "1";
    Object.assign(btn.style, {
      marginLeft: "8px", padding: "2px 8px", fontSize: "12px",
      cursor: "pointer", borderRadius: "4px", border: "1px solid #999",
      color: "#333", whiteSpace: "nowrap"
    });
    pintar(btn, norm(favorito) === norm(v.rotulo));

    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await salvarFavorito(v.rotulo);
      document.querySelectorAll<HTMLButtonElement>("[data-ext-fav]").forEach(b => pintar(b, b === btn));
    });

    (v.link.querySelector("span.col-xs-6") ?? v.link).appendChild(btn);
  }
}

/* ---------- Fluxo principal ---------- */

function iniciar(): boolean {
  const vinculos = encontrarVinculos();
  if (vinculos.length === 0) return false;

  lerFavorito().then(favorito => {
    adicionarBotoes(vinculos, favorito);
    escolherAlvo(vinculos, favorito)?.link.click();
  });
  return true;
}

quandoPronto(iniciar);
