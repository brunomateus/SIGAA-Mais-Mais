// Diálogo modal de confirmação sobre a página. Resolve true só se o usuário confirmar;
// "Cancelar" ou Esc resolvem false.
export function confirmar(titulo: string, mensagem: string, rotuloOk: string): Promise<boolean> {
  return new Promise(resolve => {
    const dlg = document.createElement("dialog");
    Object.assign(dlg.style, {
      maxWidth: "380px", padding: "20px 24px", border: "none", borderRadius: "8px",
      boxShadow: "0 8px 32px rgba(0,0,0,.3)", fontFamily: "Arial, sans-serif", color: "#222"
    });

    const h = document.createElement("h3");
    h.textContent = titulo;
    Object.assign(h.style, { margin: "0 0 10px", fontSize: "17px" });

    const p = document.createElement("p");
    p.textContent = mensagem;
    Object.assign(p.style, { margin: "0 0 18px", fontSize: "14px", lineHeight: "1.4" });

    // method="dialog": o botão clicado fecha o diálogo e vira o returnValue, sem enviar nada
    const form = document.createElement("form");
    form.method = "dialog";
    Object.assign(form.style, { display: "flex", justifyContent: "flex-end", gap: "8px" });

    const botao = (texto: string, valor: string, primario: boolean) => {
      const b = document.createElement("button");
      b.value = valor;
      b.textContent = texto;
      Object.assign(b.style, {
        padding: "6px 14px", fontSize: "14px", borderRadius: "4px", cursor: "pointer",
        border: primario ? "1px solid #1b3a5c" : "1px solid #999",
        background: primario ? "#1b3a5c" : "#fff", color: primario ? "#fff" : "#333"
      });
      return b;
    };
    const ok = botao(rotuloOk, "ok", true);
    form.append(botao("Cancelar", "cancelar", false), ok);

    dlg.append(h, p, form);
    dlg.addEventListener("close", () => {
      resolve(dlg.returnValue === "ok");
      dlg.remove();
    });

    document.body.appendChild(dlg);
    dlg.showModal();
    ok.focus();
  });
}
