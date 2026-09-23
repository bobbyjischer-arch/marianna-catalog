/* ============================================================
   catalog.js — карточка объекта (общий компонент), первый экран,
   фильтры, поиск, сортировка и сетка каталога.
   ============================================================ */
(function () {
  "use strict";
  var U = MR.util, store = MR.store;
  MR.components = MR.components || {};

  function cardPhoto(obj) {
    var src = (obj.photos && obj.photos[0]) || "";
    if (!src) {
      return '<div class="media-empty" aria-hidden="true"><span>Фото добавятся позже</span></div>';
    }
    return '<img loading="lazy" src="' + U.esc(src) + '" alt="' + U.esc(obj.title) + '" />';
  }

  // Общий компонент карточки объекта (используется в каталоге и избранном).
  MR.components.card = function (obj) {
    var sm = U.statusMeta(obj.status);
    var fav = store.isFav(obj.id);
    var specs = [];
    if (obj.area) specs.push(U.area(obj.area));
    if (obj.rooms) specs.push(U.roomsLabel(obj.rooms));
    if (obj.floor) specs.push("эт. " + obj.floor);
    if (obj.plot) specs.push("уч. " + obj.plot);

    return U.el(
      '<article class="card" data-id="' + U.esc(obj.id) + '">' +
        '<a class="card-media" href="#/object/' + U.esc(obj.id) + '" data-link>' +
          cardPhoto(obj) +
          '<span class="badge ' + sm.cls + '">' + sm.label + '</span>' +
        '</a>' +
        '<button class="fav-btn' + (fav ? " is-fav" : "") + '" data-fav="' + U.esc(obj.id) + '" ' +
          'aria-pressed="' + fav + '" aria-label="В избранное" title="В избранное">♥</button>' +
        '<div class="card-body">' +
          '<div class="card-type">' + U.esc(obj.type) + ' · ' + U.esc(obj.city) + '</div>' +
          '<h3 class="card-title"><a href="#/object/' + U.esc(obj.id) + '" data-link>' + U.esc(obj.title) + '</a></h3>' +
          '<div class="card-specs">' + specs.map(function (s) { return '<span>' + U.esc(s) + '</span>'; }).join("") + '</div>' +
          '<p class="card-desc">' + U.esc(obj.description || "") + '</p>' +
          '<div class="card-foot">' +
            '<span class="card-price">' + U.money(obj.price) + '</span>' +
            '<a class="btn btn-sm btn-primary" href="#/object/' + U.esc(obj.id) + '" data-link>Подробнее</a>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  };

  MR.views = MR.views || {};
  MR.views.catalog = function () {
    var root = U.el('<div class="view view-catalog"></div>');
    root.innerHTML =
      '<section class="hero"><div class="wrap">' +
        '<p class="hero-kicker">Персональный каталог · Марианна Антонова</p>' +
        '<h1 class="hero-title">Актуальные объекты в одном каталоге</h1>' +
        '<p class="hero-sub">Подборка квартир, домов и инвестиционных объектов. Выберите подходящий вариант и отправьте его Марианне для уточнения деталей.</p>' +
        '<div class="hero-actions"><button class="btn btn-primary btn-lg" data-scroll="catalog">Смотреть объекты</button></div>' +
        '<p class="hero-note">Актуальность каталога Марианна ведёт самостоятельно. Отметьте понравившиеся объекты сердечком.</p>' +
      '</div></section>' +
      '<section class="catalog-section" id="catalog"><div class="wrap">' +
        '<div class="section-head"><h2 class="section-title">Каталог объектов</h2>' +
          '<span class="results-count" id="resultsCount"></span></div>' +
        '<div class="toolbar">' +
          '<div class="search"><input id="fSearch" type="search" placeholder="Поиск: название, город, тип…" autocomplete="off" /></div>' +
          '<div class="filters">' +
            '<select id="fCity" aria-label="Город или район"></select>' +
            '<select id="fType" aria-label="Тип недвижимости"><option value="">Все типы</option></select>' +
            '<select id="fRooms" aria-label="Комнаты"><option value="">Любые комнаты</option><option value="1">1 комната</option><option value="2">2 комнаты</option><option value="3">3+ комнаты</option></select>' +
            '<select id="fStatus" aria-label="Статус"><option value="">Любой статус</option><option>Актуально</option><option>Забронировано</option><option>Продано</option></select>' +
            '<input id="fMin" class="price-in" type="number" min="0" placeholder="Цена от, ₽" />' +
            '<input id="fMax" class="price-in" type="number" min="0" placeholder="до, ₽" />' +
            '<select id="fSort" aria-label="Сортировка"><option value="new">Сначала новые</option><option value="old">Сначала старые</option><option value="asc">Сначала дешевле</option><option value="desc">Сначала дороже</option></select>' +
            '<button id="fReset" class="btn btn-ghost btn-sm" type="button">Сбросить</button>' +
          '</div>' +
        '</div>' +
        '<div class="grid" id="grid"></div>' +
        '<div class="empty-state" id="emptyState" hidden>По заданным условиям ничего не найдено. Измените фильтры или сбросьте их.</div>' +
      '</div></section>';
    var $ = function (sel) { return root.querySelector(sel); };
    var grid = $("#grid"), countEl = $("#resultsCount"), emptyEl = $("#emptyState");

    // Города/районы — из видимых объектов.
    (function fillCities() {
      var cities = {}, sel = $("#fCity");
      store.list(false).forEach(function (o) { if (o.city) cities[o.city] = 1; });
      sel.innerHTML = '<option value="">Все города и районы</option>' +
        Object.keys(cities).sort().map(function (c) {
          return '<option value="' + U.esc(c) + '">' + U.esc(c) + '</option>';
        }).join("");
    })();
    (function fillTypes() {
      var sel = $("#fType");
      MR.PROPERTY_TYPES.forEach(function (t) {
        sel.insertAdjacentHTML("beforeend", '<option value="' + U.esc(t) + '">' + U.esc(t) + '</option>');
      });
    })();

    var state = { q: "", city: "", type: "", rooms: "", status: "", min: "", max: "", sort: "new" };

    function applyFilters(list) {
      var q = state.q.trim().toLowerCase();
      var out = list.filter(function (o) {
        if (q) {
          var hay = (o.title + " " + o.city + " " + o.type + " " + (o.description || "")).toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        if (state.city && o.city !== state.city) return false;
        if (state.type && o.type !== state.type) return false;
        if (state.status && o.status !== state.status) return false;
        if (state.rooms) {
          var r = o.rooms || 0;
          if (state.rooms === "3") { if (r < 3) return false; }
          else if (String(r) !== state.rooms) return false;
        }
        if (state.min !== "" && o.price < Number(state.min)) return false;
        if (state.max !== "" && o.price > Number(state.max)) return false;
        return true;
      });
      out.sort(function (a, b) {
        if (state.sort === "asc") return a.price - b.price;
        if (state.sort === "desc") return b.price - a.price;
        var da = a.createdAt || "", db = b.createdAt || "";
        return state.sort === "old" ? (da < db ? -1 : 1) : (da > db ? -1 : 1);
      });
      return out;
    }

    function renderGrid() {
      var items = applyFilters(store.list(false));
      grid.innerHTML = "";
      items.forEach(function (o) { grid.appendChild(MR.components.card(o)); });
      countEl.textContent = items.length + " " + MR.util.plural(items.length, ["объект", "объекта", "объектов"]);
      emptyEl.hidden = items.length !== 0;
    }
    // Привязка фильтров
    function bind(id, key, ev) {
      var node = $("#" + id);
      node.addEventListener(ev || "change", function () { state[key] = node.value; renderGrid(); });
    }
    bind("fSearch", "q", "input");
    bind("fCity", "city"); bind("fType", "type"); bind("fRooms", "rooms");
    bind("fStatus", "status"); bind("fSort", "sort");
    bind("fMin", "min", "input"); bind("fMax", "max", "input");

    $("#fReset").addEventListener("click", function () {
      state = { q: "", city: "", type: "", rooms: "", status: "", min: "", max: "", sort: "new" };
      ["fSearch", "fCity", "fType", "fRooms", "fStatus", "fMin", "fMax"].forEach(function (i) { $("#" + i).value = ""; });
      $("#fSort").value = "new";
      renderGrid();
    });

    root.addEventListener("click", function (e) {
      var sc = e.target.closest("[data-scroll]");
      if (sc) { var t = document.getElementById(sc.getAttribute("data-scroll")); if (t) t.scrollIntoView({ behavior: "smooth" }); return; }
      var fb = e.target.closest("[data-fav]");
      if (fb) {
        e.preventDefault();
        var id = fb.getAttribute("data-fav");
        var added = store.toggleFav(id);
        U.toast(added ? "Добавлено в избранное" : "Убрано из избранного");
      }
    });

    // Синхронизация состояния сердечек без перерисовки сетки
    store.onFavChange(function () {
      grid.querySelectorAll("[data-fav]").forEach(function (b) {
        var f = store.isFav(b.getAttribute("data-fav"));
        b.classList.toggle("is-fav", f);
        b.setAttribute("aria-pressed", f);
      });
    });
    // Перерисовка при изменении данных (из админки)
    store.onChange(renderGrid);

    renderGrid();
    return root;
  };
})();
