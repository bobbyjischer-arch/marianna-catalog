/* ============================================================
   property.js — страница объекта: галерея, характеристики,
   описание, преимущества, расположение и действия.
   ============================================================ */
(function () {
  "use strict";
  var U = MR.util, store = MR.store;
  MR.views = MR.views || {};

  MR.views.property = function (id) {
    var obj = store.get(id);
    var root = U.el('<div class="view view-property"></div>');

    if (!obj || obj.hidden) {
      root.innerHTML =
        '<div class="wrap notfound">' +
          '<h1>Объект недоступен</h1>' +
          '<p>Возможно, он скрыт или удалён из каталога.</p>' +
          '<a class="btn btn-primary" href="#/" data-link>Вернуться в каталог</a>' +
        '</div>';
      return root;
    }

    var html = "";
    var sm = U.statusMeta(obj.status);
    var photos = (obj.photos && obj.photos.length) ? obj.photos : [];
    var mainImg = photos.length
      ? '<img id="galMain" src="' + U.esc(photos[0]) + '" alt="' + U.esc(obj.title) + '" />'
      : '<div class="media-empty"><span>Фотографии добавятся позже</span></div>';
    var nav = photos.length > 1
      ? '<button class="gnav prev" data-g="-1" aria-label="Предыдущее фото">‹</button>' +
        '<button class="gnav next" data-g="1" aria-label="Следующее фото">›</button>' : "";
    var thumbs = photos.map(function (p, i) {
      return '<button class="thumb' + (i === 0 ? " active" : "") + '" data-i="' + i + '">' +
        '<img src="' + U.esc(p) + '" alt="Фото ' + (i + 1) + '" /></button>';
    }).join("");

    var chars = [["Тип недвижимости", obj.type], ["Город / район", obj.city]];
    if (obj.address) chars.push(["Адрес", obj.address]);
    if (obj.area) chars.push(["Площадь", U.area(obj.area)]);
    if (obj.rooms) chars.push(["Комнат", String(obj.rooms)]);
    if (obj.floor) chars.push(["Этаж", obj.floor]);
    if (obj.plot) chars.push(["Участок", obj.plot]);
    var charsHtml = chars.map(function (c) {
      return '<div class="char"><dt>' + U.esc(c[0]) + '</dt><dd>' + U.esc(c[1]) + '</dd></div>';
    }).join("");

    html +=
      '<section class="pdp"><div class="wrap">' +
        '<a class="back-link" href="#/" data-link>← Вернуться в каталог</a>' +
        '<div class="pdp-grid">' +
          '<div class="gallery">' +
            '<div class="gallery-main">' + nav + mainImg +
              '<span class="badge ' + sm.cls + '">' + sm.label + '</span></div>' +
            (thumbs ? '<div class="thumbs">' + thumbs + '</div>' : '') +
          '</div>' +
          '<aside class="pdp-info">' +
            '<div class="pdp-type">' + U.esc(obj.type) + ' · ' + U.esc(obj.city) + '</div>' +
            '<h1 class="pdp-title">' + U.esc(obj.title) + '</h1>' +
            '<div class="pdp-price">' + U.money(obj.price) + '</div>' +
            '<dl class="chars">' + charsHtml + '</dl>' +
            '<div class="pdp-actions">' +
              '<button class="btn btn-primary btn-lg" data-act="discuss">Обсудить с Марианной</button>' +
              '<button class="btn btn-ghost fav-toggle' + (store.isFav(obj.id) ? " is-fav" : "") + '" data-act="fav" aria-pressed="' + store.isFav(obj.id) + '"><span class="h">♥</span> <span class="ft-text">' + (store.isFav(obj.id) ? "В избранном" : "В избранное") + '</span></button>' +
              '<div class="pdp-actions-row">' +
                '<button class="btn btn-ghost btn-sm" data-act="copy">Скопировать ссылку</button>' +
                '<button class="btn btn-ghost btn-sm" data-act="share">Поделиться</button>' +
              '</div>' +
            '</div>' +
          '</aside>' +
        '</div>';
    var advHtml = (obj.advantages && obj.advantages.length)
      ? '<ul class="adv-list">' + obj.advantages.map(function (a) {
          return '<li>' + U.esc(a) + '</li>'; }).join("") + '</ul>'
      : '<p class="muted">Преимущества не указаны.</p>';

    html +=
        '<div class="pdp-details">' +
          '<section class="pdp-block"><h2>Описание</h2><p>' + U.esc(obj.description || "Описание не заполнено.") + '</p></section>' +
          '<section class="pdp-block"><h2>Преимущества</h2>' + advHtml + '</section>' +
          '<section class="pdp-block"><h2>Расположение</h2><p>' + U.esc(obj.location || "Расположение уточняется.") + '</p></section>' +
          '<div class="pdp-foot"><a class="btn btn-ghost" href="#/" data-link>← Вернуться в каталог</a></div>' +
        '</div>' +
      '</div></section>';
    /*__P_HTML2__*/
    root.innerHTML = html;
    var idx = 0;
    var galMain = root.querySelector("#galMain");
    var thumbEls = Array.prototype.slice.call(root.querySelectorAll(".thumb"));
    function show(i) {
      if (!photos.length) return;
      idx = (i + photos.length) % photos.length;
      if (galMain) galMain.src = photos[idx];
      thumbEls.forEach(function (t, k) { t.classList.toggle("active", k === idx); });
    }
    root.querySelectorAll("[data-g]").forEach(function (b) {
      b.addEventListener("click", function () { show(idx + Number(b.getAttribute("data-g"))); });
    });
    thumbEls.forEach(function (t) {
      t.addEventListener("click", function () { show(Number(t.getAttribute("data-i"))); });
    });
    if (galMain) galMain.addEventListener("click", function () { openLightbox(); });

    root.addEventListener("click", function (e) {
      var a = e.target.closest("[data-act]");
      if (!a) return;
      var act = a.getAttribute("data-act");
      if (act === "discuss") { openDiscuss(obj); }
      else if (act === "fav") {
        var added = store.toggleFav(obj.id);
        a.classList.toggle("is-fav", added);
        a.setAttribute("aria-pressed", added);
        a.querySelector(".ft-text").textContent = added ? "В избранном" : "В избранное";
        U.toast(added ? "Добавлено в избранное" : "Убрано из избранного");
      }
      else if (act === "copy") {
        U.copy(U.propUrl(obj.id))
          .then(function () { U.toast("Ссылка на объект скопирована"); })
          .catch(function () { U.toast("Не удалось скопировать", "err"); });
      }
      else if (act === "share") {
        U.share({ title: obj.title, text: obj.title, url: U.propUrl(obj.id) });
      }
    });
    function openLightbox() {
      if (!photos.length) return;
      var li = idx;
      var showNav = photos.length > 1;
      var node = U.el(
        '<div class="lightbox">' +
          '<button class="lb-close" aria-label="Закрыть">×</button>' +
          (showNav ? '<button class="lb-nav lb-prev" aria-label="Назад">‹</button>' : '') +
          '<img class="lb-img" src="' + U.esc(photos[li]) + '" alt="' + U.esc(obj.title) + '" />' +
          (showNav ? '<button class="lb-nav lb-next" aria-label="Вперёд">›</button>' : '') +
          '<div class="lb-count"></div>' +
        '</div>'
      );
      var imgEl = node.querySelector(".lb-img"), cnt = node.querySelector(".lb-count");
      function upd() { imgEl.src = photos[li]; cnt.textContent = (li + 1) + " / " + photos.length; }
      function go(d) { li = (li + d + photos.length) % photos.length; upd(); }
      upd();
      var close = U.modal(node, {});
      node.querySelector(".lb-close").addEventListener("click", close);
      if (showNav) {
        node.querySelector(".lb-prev").addEventListener("click", function (e) { e.stopPropagation(); go(-1); });
        node.querySelector(".lb-next").addEventListener("click", function (e) { e.stopPropagation(); go(1); });
      }
    }
    function openDiscuss(o) {
      var cfg = store.getConfig();
      var msg = U.discussMessage(o);
      var btns = "";
      if (cfg.telegram) {
        btns += '<a class="btn btn-primary" target="_blank" rel="noopener" href="https://t.me/' +
          encodeURIComponent(cfg.telegram.replace(/^@/, "")) + '">Открыть Telegram</a>';
      }
      if (cfg.whatsapp) {
        btns += '<a class="btn btn-primary" target="_blank" rel="noopener" href="https://wa.me/' +
          cfg.whatsapp.replace(/[^0-9]/g, "") + '?text=' + encodeURIComponent(msg) + '">WhatsApp</a>';
      }
      if (cfg.instagram) {
        btns += '<a class="btn btn-ghost" target="_blank" rel="noopener" href="' + U.esc(cfg.instagram) + '">Instagram</a>';
      }
      var noMsgr = !cfg.telegram && !cfg.whatsapp;
      var node = U.el(
        '<div class="discuss">' +
          '<h3 class="confirm-title">Сообщение для Марианны</h3>' +
          '<p class="discuss-hint">Сообщение уже содержит название объекта и ссылку. Скопируйте и отправьте удобным способом.</p>' +
          '<textarea class="discuss-text" readonly rows="4"></textarea>' +
          '<div class="discuss-actions"><button class="btn btn-primary" data-d="copy">Скопировать сообщение</button>' + btns + '</div>' +
          (noMsgr ? '<p class="discuss-demo">Демо: мессенджеры не заданы. Укажите Telegram или WhatsApp в панели управления — здесь появятся кнопки «написать».</p>' : '') +
          '<button class="btn btn-ghost btn-sm discuss-close" data-d="close">Закрыть</button>' +
        '</div>'
      );
      node.querySelector(".discuss-text").value = msg;
      var close = U.modal(node, {});
      node.querySelector('[data-d="copy"]').addEventListener("click", function () {
        U.copy(msg).then(function () { U.toast("Сообщение скопировано"); });
      });
      node.querySelector('[data-d="close"]').addEventListener("click", close);
    }
    return root;
  };
})();
