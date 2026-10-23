import { AUTO, lerFavorito, limparFavorito, salvarFavorito } from "./favorito";

function elemento<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Elemento #${id} não encontrado em popup.html`);
  return el as T;
}

const atual = elemento("atual");

async function render(): Promise<void> {
  const favorito = await lerFavorito();
  atual.textContent =
    favorito === AUTO ? "Automático: entra quando houver um único vínculo." :
    favorito ? `Favorito atual: ${favorito}` :
    "Nenhum favorito salvo ainda.";
}

elemento<HTMLButtonElement>("auto").addEventListener("click", async () => {
  await salvarFavorito(AUTO);
  await render();
});

elemento<HTMLButtonElement>("limpar").addEventListener("click", async () => {
  await limparFavorito();
  await render();
});

render();
