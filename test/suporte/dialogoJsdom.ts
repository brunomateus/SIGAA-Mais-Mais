// O jsdom não implementa <dialog>. Este suporte reproduz o mínimo de que
// confirmarComDialogo depende: showModal() abre, o envio de um <form method="dialog">
// fecha com o valor do botão clicado, e close() dispara o evento "close".
function instalarDialogoNoJsdom(): void {
  const prototipo = HTMLDialogElement.prototype;
  if (typeof prototipo.showModal === "function") return;

  prototipo.showModal = function (this: HTMLDialogElement): void {
    this.setAttribute("open", "");
  };
  prototipo.close = function (this: HTMLDialogElement, valor?: string): void {
    if (valor !== undefined) this.returnValue = valor;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
  document.addEventListener("submit", fecharDialogoAoEnviar, true);
}

function fecharDialogoAoEnviar(evento: SubmitEvent): void {
  const formulario = evento.target;
  if (!(formulario instanceof HTMLFormElement)) return;
  if (formulario.getAttribute("method") !== "dialog") return;
  evento.preventDefault();
  const valor =
    evento.submitter instanceof HTMLButtonElement ? evento.submitter.value : "";
  formulario.closest("dialog")?.close(valor);
}

instalarDialogoNoJsdom();
