const KEY = "vinculo_favorito";

// Valor especial: entra automaticamente quando há um único vínculo ativo.
export const AUTO = "__AUTO__";

export async function lerFavorito(): Promise<string | undefined> {
  const { [KEY]: valor } = await chrome.storage.local.get(KEY);
  return typeof valor === "string" ? valor : undefined;
}

export function salvarFavorito(valor: string): Promise<void> {
  return chrome.storage.local.set({ [KEY]: valor });
}

export function limparFavorito(): Promise<void> {
  return chrome.storage.local.remove(KEY);
}
