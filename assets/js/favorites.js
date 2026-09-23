/* ============================================================
   favorites.js — раздел «Избранное» и просмотр присланной подборки.
   ============================================================ */
(function () {
  "use strict";
  var U = MR.util, store = MR.store;
  MR.views = MR.views || {};

  MR.views.favorites = function () {
    var root = U.el('<div class="view view-favorites"><div class="wrap" id="favWrap"></div></div>');
    var wrap = root.querySelector("#favWrap");

    function render() {
      var favs = store.favList();
      if (!favs.length) {
        wrap.innerHTML =
          '<div class="fav-head"><h1>Избранное</h1></div>' +
          '<div class="empty-state big">' +
            '<p class="empty-emoji" aria-hidden="true">♥</p>' +
            '<p>Здесь появятся объекты, отмеченные сердечком.</p>' +
            '<p class="muted">Отметьте понравившиеся варианты в каталоге, чтобы собрать личную подборку и отправить её Марианне одним сообщением.</p>' +
            '<a class="btn btn-primary" href="#/" data-link>Перейти в каталог</a>' +
          '</div>';
        return;
      }
      var ids = favs.map(function (o) { return o.id; });
      wrap.innerHTML =
        '<div class="fav-head">' +
          '<h1>Избранное <span class="fav-count">' + favs.length + '</span></h1>' +
          '<p class="muted">Отправьте подборку Марианне одним сообщением или одной ссылкой.</p>' +
          '<div class="fav-actions">' +
            '<button class="btn btn-primary" data-favact="send">Отправить список Марианне</button>' +
            '<button class="btn btn-ghost" data-favact="link">Скопировать ссылку на подборку</button>' +
            '<button class="btn btn-ghost" data-favact="clear">Очистить</button>' +
          '</div>' +
        '</div>' +
        '<div class="grid" id="favGrid"></div>';
      var grid = wrap.querySelector("#favGrid");
      favs.forEach(function (o) { grid.appendChild(MR.components.card(o)); });
    }
    root.addEventListener("click", function (e) {
      var fav = e.target.closest("[data-fav]");
      if (fav) {
        e.preventDefault();
        store.toggleFav(fav.getAttribute("data-fav"));
        U.toast("Убрано из избранного");
        return;
      }
      var act = e.target.closest("[data-favact]");
      if (!act) return;
      var a = act.getAttribute("data-favact");
      if (a === "send") { openList(); }
      else if (a === "link") {
        U.copy(U.sharedUrl(store.favIds()))
          .then(function () { U.toast("Ссылка на подборку скопирована"); });
      }
      else if (a === "clear") {
        U.confirm({ title: "Очистить избранное?", text: "Все отмеченные объекты будут удалены из подборки.", okText: "Очистить", danger: true })
          .then(function (ok) { if (ok) { store.clearFav(); U.toast("Избранное очищено"); } });
      }
    });
    store.onFavChange(function () { if (root.isConnected) render(); });

    function openList() {
      var favs = store.favList();
      if (!favs.length) return;
      var ids = favs.map(function (o) { return o.id; });
      var lines = favs.map(function (o, i) {
        return (i + 1) + ". " + o.title + " — " + U.money(o.price) + "\n" + U.propUrl(o.id);
      }).join("\n\n");
      var msg = "Марианна, здравствуйте! Мне понравились эти объекты:\n\n" + lines +
        "\n\nВся подборка одной ссылкой: " + U.sharedUrl(ids);
      var cfg = store.getConfig(), btns = "";
      if (cfg.telegram) btns += '<a class="btn btn-primary" target="_blank" rel="noopener" href="https://t.me/' + encodeURIComponent(cfg.telegram.replace(/^@/, "")) + '">Открыть Telegram</a>';
      if (cfg.whatsapp) btns += '<a class="btn btn-primary" target="_blank" rel="noopener" href="https://wa.me/' + cfg.whatsapp.replace(/[^0-9]/g, "") + '?text=' + encodeURIComponent(msg) + '">WhatsApp</a>';
      var node = U.el(
        '<div class="discuss"><h3 class="confirm-title">Подборка для Марианны</h3>' +
        '<p class="discuss-hint">Готовое сообщение со списком объектов и ссылками. Скопируйте и отправьте.</p>' +
        '<textarea class="discuss-text" readonly rows="8"></textarea>' +
        '<div class="discuss-actions"><button class="btn btn-primary" data-d="copy">Скопировать сообщение</button>' + btns + '</div>' +
        '<button class="btn btn-ghost btn-sm" data-d="close">Закрыть</button></div>'
      );
      node.querySelector(".discuss-text").value = msg;
      var close = U.modal(node);
      node.querySelector('[data-d="copy"]').addEventListener("click", function () { U.copy(msg).then(function () { U.toast("Сообщение скопировано"); }); });
      node.querySelector('[data-d="close"]').addEventListener("click", close);
    }
    render();
    return root;
  };
  MR.views.shared = function (ids) {
    var root = U.el('<div class="view view-favorites"><div class="wrap"></div></div>');
    var wrap = root.querySelector(".wrap");
    var objs = (ids || []).map(function (id) { return store.get(id); })
      .filter(function (o) { return o && !o.hidden; });
    if (!objs.length) {
      wrap.innerHTML = '<div class="empty-state big"><h1>Подборка</h1>' +
        '<p>Объекты из подборки недоступны или ссылка устарела.</p>' +
        '<a class="btn btn-primary" href="#/" data-link>Открыть каталог</a></div>';
      return root;
    }
    wrap.innerHTML =
      '<div class="fav-head"><p class="hero-kicker">Персональная подборка</p>' +
      '<h1>Объекты, отобранные для вас</h1>' +
      '<p class="muted">Откройте любой объект подробнее или отметьте понравившиеся в своё избранное.</p></div>' +
      '<div class="grid" id="shGrid"></div>';
    var grid = wrap.querySelector("#shGrid");
    objs.forEach(function (o) { grid.appendChild(MR.components.card(o)); });
    root.addEventListener("click", function (e) {
      var fav = e.target.closest("[data-fav]");
      if (fav) {
        e.preventDefault();
        var added = store.toggleFav(fav.getAttribute("data-fav"));
        fav.classList.toggle("is-fav", added);
        fav.setAttribute("aria-pressed", added);
        U.toast(added ? "Добавлено в избранное" : "Убрано из избранного");
      }
    });
    return root;
  };
})();
