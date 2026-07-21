// Unico script della pagina: apre e chiude il pannello mobile.
// Le voci di menu non sono link (le pagine non esistono ancora), quindi qui
// non c'è routing da gestire — solo lo stato aperto/chiuso.
(function () {
  var burger = document.querySelector("[data-burger]");
  var sheet = document.querySelector("[data-sheet]");
  if (!burger || !sheet) return;

  function set(open) {
    if (open) sheet.setAttribute("data-open", "");
    else sheet.removeAttribute("data-open");
    burger.setAttribute("aria-expanded", String(open));
  }

  burger.addEventListener("click", function () {
    set(!sheet.hasAttribute("data-open"));
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") set(false);
  });
})();
