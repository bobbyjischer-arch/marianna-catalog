/* ============================================================
   app.js — инициализация, hash-роутер, шапка (бейдж избранного,
   активная навигация, имя из настроек).
   ============================================================ */
(function () {
  "use strict";
  var U = MR.util, store = MR.store;

  store.ensureSeed();

  var appEl = document.getElementById("app");
  var modalRoot = document.getElementById("modalRoot");

  function parse() {
    var h = location.hash.replace(/^#\/?/, "");
    var qi = h.indexOf("?"), query = "";
    if (qi >= 0) { query = h.slice(qi + 1); h = h.slice(0, qi); }
    var parts = h.split("/").filter(Boolean);
    return { name: parts[0] || "catalog", param: parts[1] || "", query: query };
  }

  function parseIds(q) {
    var m = /ids=([^&]*)/.exec(q || "");
    if (!m) return [];
    return decodeURIComponent(m[1]).split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function setActive(name) {
    var map = { catalog: 'a[href="#/"]', favorites: 'a[href="#/favorites"]', admin: 'a[href="#/admin"]' };
    document.querySelectorAll(".nav-link").forEach(function (a) { a.classList.remove("active"); });
    var sel = map[name];
    if (sel) { var a = document.querySelector(".header-nav " + sel); if (a) a.classList.add("active"); }
  }

  function render() {
    modalRoot.innerHTML = "";
    document.body.classList.remove("no-scroll");
    var r = parse(), view;
    if (r.name === "object" && r.param) view = MR.views.property(r.param);
    else if (r.name === "favorites") view = MR.views.favorites();
    else if (r.name === "shared") view = MR.views.shared(parseIds(r.query));
    else if (r.name === "admin") view = MR.views.admin();
    else view = MR.views.catalog();
    appEl.innerHTML = "";
    appEl.appendChild(view);
    setActive(r.name);
    window.scrollTo(0, 0);
  }

  function updateBadge() {
    var badge = document.getElementById("favBadge");
    if (!badge) return;
    var n = store.favIds().length;
    badge.textContent = n;
    badge.hidden = n === 0;
  }

  function updateBrand() {
    var cfg = store.getConfig();
    var name = document.querySelector(".brand-name");
    var sub = document.querySelector(".brand-sub");
    var fname = document.querySelector(".footer-name");
    var ig = document.querySelector(".footer-ig");
    if (name && cfg.agentName) name.textContent = cfg.agentName;
    if (sub && cfg.tagline) sub.textContent = cfg.tagline;
    if (fname && cfg.agentName) fname.textContent = cfg.agentName;
    if (ig) {
      if (cfg.instagram) { ig.href = cfg.instagram; ig.hidden = false; }
      else { ig.hidden = true; }
    }
    var mark = document.querySelector(".brand-mark");
    if (mark) {
      if (cfg.photo) {
        mark.classList.add("has-photo");
        mark.innerHTML = '<img class="brand-photo" src="' + U.esc(cfg.photo) + '" alt="' + U.esc(cfg.agentName || "") + '">';
      } else {
        mark.classList.remove("has-photo");
        var parts = (cfg.agentName || "").trim().split(/\s+/);
        mark.textContent = (parts[0] ? parts[0][0] : "") + (parts[1] ? parts[1][0] : "");
      }
    }
  }

  updateBadge();
  updateBrand();
  store.onFavChange(updateBadge);
  store.onChange(updateBrand);

  window.addEventListener("hashchange", render);
  render();
})();
