import { afterEach, describe, expect, it, vi } from "vitest";
import { mostrarTransicao } from "../../src/comum/transicao";

const camada = (): HTMLElement | null =>
  document.getElementById("sigga-transicao");

function eventoPageshow(persisted: boolean): Event {
  return new PageTransitionEvent("pageshow", { persisted });
}

describe("mostrarTransicao", () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
    document.head.innerHTML = "";
  });

  it("cobre a página com a mensagem, anunciada a leitores de tela", () => {
    mostrarTransicao(document, "Entrando como Servidor…");
    expect(camada()?.textContent).toBe("Entrando como Servidor…");
    expect(camada()?.getAttribute("role")).toBe("status");
    expect(camada()?.style.position).toBe("fixed");
  });

  it("chamada de novo, substitui a camada e não duplica o estilo", () => {
    mostrarTransicao(document, "primeira");
    mostrarTransicao(document, "segunda");
    expect(document.querySelectorAll("#sigga-transicao")).toHaveLength(1);
    expect(document.querySelectorAll("#sigga-transicao-estilo")).toHaveLength(
      1,
    );
    expect(camada()?.textContent).toBe("segunda");
  });

  it("remove a camada ao encerrar", () => {
    const encerrar = mostrarTransicao(document, "Entrando…");
    encerrar();
    expect(camada()).toBeNull();
  });

  it("remove a camada sozinha após o prazo, se a navegação não acontecer", () => {
    vi.useFakeTimers();
    mostrarTransicao(document, "Entrando…", 1000);
    vi.advanceTimersByTime(999);
    expect(camada()).not.toBeNull();
    vi.advanceTimersByTime(1);
    expect(camada()).toBeNull();
  });

  it("remove a camada quando a página volta do back/forward cache", () => {
    mostrarTransicao(document, "Entrando…");
    window.dispatchEvent(eventoPageshow(false));
    expect(camada()).not.toBeNull();
    window.dispatchEvent(eventoPageshow(true));
    expect(camada()).toBeNull();
  });
});
