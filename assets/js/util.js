/* ============================================================
   util.js — вспомогательные функции и UI-примитивы
   ============================================================ */
(function () {
  "use strict";
  var U = {};

  U.money = function (n) {
    if (n == null || isNaN(n)) return "Цена по запросу";
    return new Intl.NumberFormat("ru-RU").format(Math.round(n)) + " ₽";
  };
  U.area = function (n) {
    if (n == null || n === "" || isNaN(n)) return "";
    return String(n).replace(".", ",") + " м²";
  };
  U.roomsLabel = function (r) {
    if (!r) return "";
    return r + "-комн.";
  };
  U.plural = function (n, forms) {
    var a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return forms[2];
    if (b > 1 && b < 5) return forms[1];
    if (b === 1) return forms[0];
    return forms[2];
  };
  U.esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };
  U.el = function (html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };
  U.statusMeta = function (status) {
    switch (status) {
      case "Забронировано": return { label: "Забронировано", cls: "st-booked" };
      case "Продано": return { label: "Продано", cls: "st-sold" };
      default: return { label: "Актуально", cls: "st-active" };
    }
  };

  // Абсолютная ссылка на страницу объекта (для «поделиться» и сообщений).
  U.propUrl = function (id) {
    var base = location.href.split("#")[0];
    return base + "#/object/" + id;
  };
  U.discussMessage = function (obj) {
    return "Марианна, здравствуйте! Хочу уточнить детали по объекту: " +
      obj.title + " — " + U.propUrl(obj.id);
  };
  U.sharedUrl = function (ids) {
    return location.href.split("#")[0] + "#/shared?ids=" + ids.join(",");
  };

  // Чтение изображения с уменьшением размера (чтобы не переполнять localStorage).
  U.readImageResized = function (file, maxW) {
    maxW = maxW || 1400;
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var scale = Math.min(1, maxW / img.width);
          var w = Math.round(img.width * scale), h = Math.round(img.height * scale);
          var c = document.createElement("canvas");
          c.width = w; c.height = h;
          c.getContext("2d").drawImage(img, 0, 0, w, h);
          try { resolve(c.toDataURL("image/jpeg", 0.82)); }
          catch (e) { resolve(reader.result); }
        };
        img.onerror = function () { resolve(reader.result); };
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  U.toast = function (msg, type) {
    var root = document.getElementById("toastRoot");
    if (!root) return;
    var t = U.el('<div class="toast ' + (type === "err" ? "toast-err" : "") + '">' + U.esc(msg) + '</div>');
    root.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("show"); });
    setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () { t.remove(); }, 300);
    }, 2600);
  };

  U.copy = function (text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); ta.remove(); resolve();
      } catch (e) { reject(e); }
    });
  };

  U.share = function (data) {
    if (navigator.share) {
      return navigator.share(data).catch(function () {});
    }
    return U.copy(data.url || data.text || "").then(function () {
      U.toast("Ссылка скопирована — можно вставить в переписку");
    });
  };

  // Модальное окно. content — DOM-узел. Возвращает функцию закрытия.
  U.modal = function (content, opts) {
    opts = opts || {};
    var root = document.getElementById("modalRoot");
    var overlay = U.el('<div class="modal-overlay"></div>');
    var box = U.el('<div class="modal-box" role="dialog" aria-modal="true"></div>');
    box.appendChild(content);
    overlay.appendChild(box);
    root.appendChild(overlay);
    document.body.classList.add("no-scroll");
    requestAnimationFrame(function () { overlay.classList.add("show"); });

    function close() {
      overlay.classList.remove("show");
      document.body.classList.remove("no-scroll");
      setTimeout(function () { overlay.remove(); }, 220);
      document.removeEventListener("keydown", onKey);
      if (opts.onClose) opts.onClose();
    }
    function onKey(e) { if (e.key === "Escape") close(); }
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay && opts.dismissable !== false) close();
    });
    document.addEventListener("keydown", onKey);
    return close;
  };

  // Диалог подтверждения. Возвращает Promise<boolean>.
  U.confirm = function (o) {
    o = o || {};
    return new Promise(function (resolve) {
      var node = U.el(
        '<div class="confirm">' +
        '<h3 class="confirm-title">' + U.esc(o.title || "Подтвердите действие") + '</h3>' +
        '<p class="confirm-text">' + U.esc(o.text || "") + '</p>' +
        '<div class="confirm-actions">' +
        '<button class="btn btn-ghost" data-c="no">' + U.esc(o.cancelText || "Отмена") + '</button>' +
        '<button class="btn ' + (o.danger ? "btn-danger" : "btn-primary") + '" data-c="yes">' +
        U.esc(o.okText || "Подтвердить") + '</button>' +
        '</div></div>'
      );
      var close = U.modal(node);
      node.querySelector('[data-c="no"]').addEventListener("click", function () { close(); resolve(false); });
      node.querySelector('[data-c="yes"]').addEventListener("click", function () { close(); resolve(true); });
    });
  };

  MR.util = U;
})();
