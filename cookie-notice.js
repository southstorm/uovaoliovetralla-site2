(function () {
  const key = "uovaOlioCookieNotice";
  if (localStorage.getItem(key) === "dismissed") return;

  const locale = document.documentElement.lang;
  const copy = {
    it: {
      text: "Usiamo solo strumenti tecnici necessari al sito e al carrello. Nessun cookie di profilazione.",
      link: "Cookie policy",
      ok: "Ok"
    },
    en: {
      text: "We only use technical tools needed for the site and cart. No profiling cookies.",
      link: "Cookie policy",
      ok: "OK"
    },
    fr: {
      text: "Nous utilisons uniquement les outils techniques necessaires au site et au panier. Pas de cookies de profilage.",
      link: "Politique cookies",
      ok: "OK"
    },
    nl: {
      text: "We gebruiken alleen technische hulpmiddelen die nodig zijn voor de site en winkelwagen. Geen profileringscookies.",
      link: "Cookiebeleid",
      ok: "OK"
    }
  };
  const strings = copy[locale] || copy.it;
  const notice = document.createElement("div");
  notice.className = "cookie-notice";
  notice.innerHTML = `
    <p>${strings.text} <a href="cookie-policy.html">${strings.link}</a></p>
    <button type="button">${strings.ok}</button>
  `;
  notice.querySelector("button").addEventListener("click", () => {
    localStorage.setItem(key, "dismissed");
    notice.remove();
  });
  document.body.appendChild(notice);
})();
