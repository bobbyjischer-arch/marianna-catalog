/* ============================================================
   admin.js — демо-панель управления каталогом (/admin).
   Показывает, что Марианна ведёт каталог сама, без кода.
   Данные — в localStorage; в рабочей версии — защищённая база.
   ============================================================ */
(function () {
  "use strict";
  var U = MR.util, store = MR.store, el = U.el;
  MR.views = MR.views || {};

  MR.views.admin = function () {
    var root = el('<div class="view view-admin"><div class="wrap" id="adminWrap"></div></div>');
    var wrap = root.querySelector("#adminWrap");

    function fillList() {
      var list = store.list(true);
      var stats = root.querySelector("#adminStats");
      var visible = list.filter(function (o) { return !o.hidden; }).length;
      stats.innerHTML =
        '<span>Всего: <b>' + list.length + '</b></span>' +
        '<span>В каталоге: <b>' + visible + '</b></span>' +
        '<span>Скрыто: <b>' + (list.length - visible) + '</b></span>';
      var box = root.querySelector("#adminList");
      if (!list.length) {
        box.innerHTML = '<div class="empty-state">Каталог пуст. Нажмите «Добавить объект».</div>';
        return;
      }
      box.innerHTML = list.map(rowHtml).join("");
    }

    function rowHtml(o) {
      var sm = U.statusMeta(o.status);
      var media = (o.photos && o.photos[0])
        ? '<img src="' + U.esc(o.photos[0]) + '" alt="" />'
        : '<div class="media-empty sm"><span>нет фото</span></div>';
      var meta = [o.type, o.city, U.area(o.area)].filter(Boolean).join(" · ");
      return '<div class="arow' + (o.hidden ? " is-hidden" : "") + '" data-id="' + U.esc(o.id) + '">' +
        '<div class="arow-media">' + media + '</div>' +
        '<div class="arow-main"><div class="arow-title">' + U.esc(o.title) + '</div>' +
          '<div class="arow-meta">' + U.esc(meta) + '</div>' +
          '<div class="arow-price">' + U.money(o.price) + '</div></div>' +
        '<div class="arow-status"><span class="badge ' + sm.cls + '">' + sm.label + '</span>' +
          (o.hidden ? '<span class="chip">Скрыт</span>' : '') + '</div>' +
        '<div class="arow-actions">' +
          '<button class="ico" data-a="up" title="Поднять">▲</button>' +
          '<button class="ico" data-a="down" title="Опустить">▼</button>' +
          '<button data-a="view">Просмотр</button>' +
          '<button data-a="edit">Изменить</button>' +
          '<button data-a="dup">Дублировать</button>' +
          '<button data-a="hide">' + (o.hidden ? "Показать" : "Скрыть") + '</button>' +
          '<button class="danger" data-a="del">Удалить</button>' +
        '</div></div>';
    }

    wrap.innerHTML =
      '<header class="admin-head"><div>' +
        '<p class="hero-kicker">Демо-режим · только для Марианны</p>' +
        '<h1>Управление каталогом</h1>' +
        '<p class="admin-sub">Добавляйте и редактируйте объекты без разработчика. Изменения сразу видны в каталоге.</p>' +
      '</div><a class="btn btn-ghost" href="#/" data-link>← К каталогу</a></header>' +
      '<div class="admin-note"><strong>Это демонстрация.</strong> Данные сохраняются локально в этом браузере. ' +
        'В рабочей версии объекты хранятся в защищённой базе данных с доступом по паролю.</div>' +
      '<div class="admin-hint">💡 Чтобы добавить объект, нажмите кнопку, загрузите фотографии, заполните основные данные и нажмите «Опубликовать». Это занимает около минуты.</div>' +
      '<div class="admin-toolbar">' +
        '<button class="btn btn-primary btn-lg" data-a="add">＋ Добавить объект</button>' +
        '<button class="btn btn-ghost" data-a="contacts">Контакты и профиль</button>' +
        '<button class="btn btn-ghost" data-a="reset">Сбросить демо-данные</button>' +
      '</div>' +
      '<div class="admin-stats" id="adminStats"></div>' +
      '<div class="admin-list" id="adminList"></div>';

    wrap.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-a]");
      if (!btn) return;
      var a = btn.getAttribute("data-a");
      var row = btn.closest(".arow");
      var id = row && row.getAttribute("data-id");
      if (a === "add") return openForm(null);
      if (a === "contacts") return openContacts();
      if (a === "reset") {
        return U.confirm({ title: "Сбросить демо-данные?", text: "Каталог вернётся к исходным демонстрационным объектам. Изменения в демо будут потеряны.", okText: "Сбросить", danger: true })
          .then(function (ok) { if (ok) { store.resetDemo(); U.toast("Демо-данные восстановлены"); } });
      }
      if (!id) return;
      var obj = store.get(id);
      if (!obj) return;
      if (a === "edit") openForm(obj);
      else if (a === "view") previewObject(obj, true);
      else if (a === "dup") { store.duplicate(id); U.toast("Объект дублирован"); }
      else if (a === "hide") { store.setHidden(id, !obj.hidden); U.toast(obj.hidden ? "Объект снова в каталоге" : "Объект скрыт из каталога"); }
      else if (a === "up") move(id, -1);
      else if (a === "down") move(id, 1);
      else if (a === "del") {
        U.confirm({ title: "Удалить объект?", text: "«" + obj.title + "» будет удалён без возможности восстановления.", okText: "Удалить", danger: true })
          .then(function (ok) { if (ok) { store.remove(id); U.toast("Объект удалён"); } });
      }
    });

    function move(id, dir) {
      var list = store.list(true);
      var i = list.findIndex(function (o) { return o.id === id; });
      var j = i + dir;
      if (j < 0 || j >= list.length) return;
      var a = list[i], b = list[j];
      var ao = a.order, bo = b.order;
      store.update(a.id, { order: bo });
      store.update(b.id, { order: ao });
    }
    fillList();
    store.onChange(function () { if (root.isConnected) fillList(); });
    return root;

    function openForm(existing) {
      var isNew = !existing;
      var data = existing ? JSON.parse(JSON.stringify(existing)) : {
        title: "", city: "", address: "", type: "Квартира", price: "", area: "", rooms: "",
        floor: "", plot: "", description: "", advantages: [], photos: [], status: "Актуально", contacts: ""
      };
      var photos = (data.photos || []).slice();
      var typeOpts = MR.PROPERTY_TYPES.map(function (t) { return '<option' + (t === data.type ? " selected" : "") + '>' + U.esc(t) + '</option>'; }).join("");
      var statusOpts = MR.STATUSES.map(function (s) { return '<option' + (s === data.status ? " selected" : "") + '>' + U.esc(s) + '</option>'; }).join("");
      var node = el(
        '<form class="obj-form">' +
          '<h3 class="confirm-title">' + (isNew ? "Новый объект" : "Редактирование объекта") + '</h3>' +
          '<div class="form-scroll"><div class="form-grid">' +
            '<label class="fld span2">Название<input name="title" required></label>' +
            '<label class="fld">Город / район<input name="city" required></label>' +
            '<label class="fld">Адрес (необязательно)<input name="address"></label>' +
            '<label class="fld">Тип недвижимости<select name="type">' + typeOpts + '</select></label>' +
            '<label class="fld">Статус<select name="status">' + statusOpts + '</select></label>' +
            '<label class="fld">Цена, ₽<input name="price" type="number" min="0" required></label>' +
            '<label class="fld">Площадь, м²<input name="area" type="number" min="0" step="0.1"></label>' +
            '<label class="fld">Комнат<input name="rooms" type="number" min="0"></label>' +
            '<label class="fld">Этаж<input name="floor" placeholder="напр. 5/12"></label>' +
            '<label class="fld">Участок<input name="plot" placeholder="напр. 6 сот."></label>' +
            '<label class="fld span2">Описание<textarea name="description" rows="3"></textarea></label>' +
            '<label class="fld span2">Преимущества (по одному в строке)<textarea name="advantages" rows="3"></textarea></label>' +
            '<label class="fld span2">Контакты для связи (необязательно)<input name="contacts" placeholder="Telegram @… / +7…"></label>' +
          '</div>' +
          '<div class="photos-block"><div class="photos-head"><span>Фотографии</span><div class="photos-add">' +
            '<label class="btn btn-ghost btn-sm file-btn">＋ Загрузить фото<input type="file" accept="image/*" multiple hidden id="photoFile"></label>' +
            '<input id="photoUrl" class="photo-url" placeholder="или вставьте ссылку на фото">' +
            '<button type="button" class="btn btn-ghost btn-sm" id="photoUrlAdd">Добавить</button>' +
          '</div></div><div class="photos-grid" id="photosGrid"></div>' +
          '<p class="muted sm">Первое фото — главное. Порядок меняйте стрелками. Демоверсия уменьшает фото для хранения в браузере.</p></div>' +
          '</div>' +
          '<div class="form-actions">' +
            '<button type="button" class="btn btn-ghost" data-f="cancel">Отмена</button>' +
            '<button type="button" class="btn btn-ghost" data-f="preview">Предпросмотр</button>' +
            '<button type="submit" class="btn btn-primary">' + (isNew ? "Опубликовать" : "Сохранить") + '</button>' +
          '</div>' +
        '</form>'
      );
      function setv(name, val) { var elm = node.querySelector('[name="' + name + '"]'); if (elm) elm.value = (val == null ? "" : val); }
      setv("title", data.title); setv("city", data.city); setv("address", data.address);
      setv("type", data.type); setv("status", data.status); setv("price", data.price);
      setv("area", data.area); setv("rooms", data.rooms); setv("floor", data.floor);
      setv("plot", data.plot); setv("description", data.description);
      setv("advantages", (data.advantages || []).join("\n")); setv("contacts", data.contacts);

      var grid = node.querySelector("#photosGrid");
      function renderPhotos() {
        if (!photos.length) { grid.innerHTML = '<div class="muted sm">Фото пока не добавлены.</div>'; return; }
        grid.innerHTML = photos.map(function (p, i) {
          return '<div class="pcell' + (i === 0 ? " main" : "") + '" data-i="' + i + '">' +
            '<img src="' + U.esc(p) + '" alt="Фото ' + (i + 1) + '">' +
            (i === 0 ? '<span class="pmain">Главное</span>' : '') +
            '<div class="pctrl">' +
              '<button type="button" data-p="left" title="Левее">←</button>' +
              '<button type="button" data-p="main" title="Сделать главным">★</button>' +
              '<button type="button" data-p="right" title="Правее">→</button>' +
              '<button type="button" data-p="del" title="Удалить">×</button>' +
            '</div></div>';
        }).join("");
      }
      grid.addEventListener("click", function (e) {
        var b = e.target.closest("button[data-p]"); if (!b) return;
        var i = Number(b.closest(".pcell").getAttribute("data-i")), p = b.getAttribute("data-p"), m;
        if (p === "del") photos.splice(i, 1);
        else if (p === "left" && i > 0) { m = photos.splice(i, 1)[0]; photos.splice(i - 1, 0, m); }
        else if (p === "right" && i < photos.length - 1) { m = photos.splice(i, 1)[0]; photos.splice(i + 1, 0, m); }
        else if (p === "main" && i > 0) { m = photos.splice(i, 1)[0]; photos.unshift(m); }
        renderPhotos();
      });
      node.querySelector("#photoFile").addEventListener("change", function (e) {
        var files = Array.prototype.slice.call(e.target.files || []);
        if (!files.length) return;
        Promise.all(files.map(function (f) { return U.readImageResized(f, 1400); })).then(function (urls) {
          urls.forEach(function (u) { photos.push(u); });
          renderPhotos();
          U.toast(urls.length + " " + U.plural(urls.length, ["фото добавлено", "фото добавлено", "фото добавлено"]));
        });
        e.target.value = "";
      });
      function addUrl() {
        var inp = node.querySelector("#photoUrl"), v = inp.value.trim();
        if (!v) return; photos.push(v); inp.value = ""; renderPhotos();
      }
      node.querySelector("#photoUrlAdd").addEventListener("click", addUrl);
      node.querySelector("#photoUrl").addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); addUrl(); }
      });

      renderPhotos();
      var close = U.modal(node, { dismissable: false });

      function collect() {
        function val(n) { var x = node.querySelector('[name="' + n + '"]'); return x ? x.value.trim() : ""; }
        function num(n) { var v = val(n); return v === "" ? null : Number(v); }
        return {
          title: val("title"), city: val("city"), address: val("address"),
          type: val("type"), status: val("status"), price: num("price"),
          area: num("area"), rooms: num("rooms"), floor: val("floor"), plot: val("plot"),
          description: val("description"), contacts: val("contacts"),
          advantages: val("advantages").split("\n").map(function (s) { return s.trim(); }).filter(Boolean),
          photos: photos.slice()
        };
      }
      function validate(d) {
        if (!d.title) return "Укажите название объекта";
        if (!d.city) return "Укажите город или район";
        if (d.price == null || isNaN(d.price)) return "Укажите цену";
        return null;
      }
      node.querySelector('[data-f="cancel"]').addEventListener("click", close);
      node.querySelector('[data-f="preview"]').addEventListener("click", function () {
        var d = collect(); d.id = data.id || "preview"; previewObject(d, false);
      });
      node.addEventListener("submit", function (e) {
        e.preventDefault();
        var d = collect(), err = validate(d);
        if (err) { U.toast(err, "err"); return; }
        if (isNew) { store.add(d); U.toast("Объект опубликован"); }
        else { store.update(data.id, d); U.toast("Изменения сохранены"); }
        close();
      });
    }
    function previewObject(obj, isReal) {
      var specs = [];
      if (obj.area) specs.push(U.area(obj.area));
      if (obj.rooms) specs.push(U.roomsLabel(obj.rooms));
      if (obj.floor) specs.push("эт. " + obj.floor);
      if (obj.plot) specs.push("уч. " + obj.plot);
      var node = el('<div class="preview-wrap"></div>');
      node.innerHTML =
        '<h3 class="confirm-title">Предпросмотр</h3>' +
        '<p class="muted sm">' + (isReal ? "Так объект отображается клиенту в каталоге." : "Так объект будет выглядеть после публикации.") + '</p>';
      var holder = el('<div class="preview-card"></div>');
      holder.appendChild(MR.components.card(obj));
      holder.addEventListener("click", function (e) { if (e.target.closest("a") || e.target.closest("[data-fav]")) e.preventDefault(); });
      node.appendChild(holder);
      node.insertAdjacentHTML("beforeend",
        '<div class="preview-details"><p><b>' + U.esc(obj.title || "Без названия") + '</b> — ' + U.money(obj.price) + '</p>' +
        '<p class="muted">' + U.esc([obj.type, obj.city].filter(Boolean).join(" · ")) + (specs.length ? " · " + U.esc(specs.join(" · ")) : "") + '</p>' +
        '<p>' + U.esc(obj.description || "") + '</p></div>' +
        '<div class="form-actions"><button class="btn btn-ghost" data-x>Закрыть</button></div>');
      var close = U.modal(node);
      node.querySelector("[data-x]").addEventListener("click", close);
    }
    function openContacts() {
      var cfg = store.getConfig();
      var keys = ["agentName", "role", "region", "about", "credentials", "responseTime", "instagram", "telegram", "whatsapp", "phone"];
      var node = el(
        '<form class="obj-form contacts-form"><h3 class="confirm-title">Контакты и профиль</h3>' +
        '<p class="muted sm">Эти данные видит клиент: профиль на главной, имя в шапке и кнопки «написать». Добавьте Telegram или WhatsApp — на странице объекта и в блоке «Обо мне» появятся кнопки связи.</p>' +
        '<div class="profile-photo">' +
          '<div class="pp-preview" id="ppPreview"></div>' +
          '<div class="pp-controls">' +
            '<label class="btn btn-ghost btn-sm file-btn">＋ Загрузить фото<input type="file" accept="image/*" hidden id="ppFile"></label>' +
            '<input id="ppUrl" class="photo-url" placeholder="или ссылка на фото">' +
            '<button type="button" class="btn btn-ghost btn-sm" id="ppUrlAdd">Применить</button>' +
            '<button type="button" class="btn btn-ghost btn-sm" id="ppClear">Убрать</button>' +
          '</div>' +
        '</div>' +
        '<div class="form-grid">' +
          '<label class="fld span2">Имя<input name="agentName"></label>' +
          '<label class="fld">Роль / статус<input name="role" placeholder="Риелтор-эксперт"></label>' +
          '<label class="fld">Регион работы<input name="region" placeholder="Геленджик и побережье"></label>' +
          '<label class="fld span2">О себе (блок «Обо мне» на главной)<textarea name="about" rows="3"></textarea></label>' +
          '<label class="fld span2">Гарантии / статус<input name="credentials" placeholder="Работаю официально, документы проверены"></label>' +
          '<label class="fld span2">Время ответа<input name="responseTime" placeholder="Отвечаю в течение дня"></label>' +
          '<label class="fld span2">Instagram (ссылка)<input name="instagram"></label>' +
          '<label class="fld">Telegram (@username)<input name="telegram" placeholder="@marianna_realty"></label>' +
          '<label class="fld">WhatsApp (номер)<input name="whatsapp" placeholder="+7…"></label>' +
          '<label class="fld span2">Телефон (необязательно)<input name="phone"></label>' +
        '</div>' +
        '<div class="form-actions"><button type="button" class="btn btn-ghost" data-f="cancel">Отмена</button>' +
        '<button type="submit" class="btn btn-primary">Сохранить</button></div></form>'
      );
      keys.forEach(function (k) { var i = node.querySelector('[name="' + k + '"]'); if (i) i.value = cfg[k] || ""; });

      var photoVal = cfg.photo || "";
      var ppPreview = node.querySelector("#ppPreview");
      function renderPP() {
        ppPreview.innerHTML = photoVal
          ? '<img src="' + U.esc(photoVal) + '" alt="Фото">'
          : '<span class="muted sm">Нет фото</span>';
      }
      node.querySelector("#ppFile").addEventListener("change", function (e) {
        var f = (e.target.files || [])[0];
        if (!f) return;
        U.readImageResized(f, 600).then(function (u) { photoVal = u; renderPP(); U.toast("Фото загружено"); });
        e.target.value = "";
      });
      node.querySelector("#ppUrlAdd").addEventListener("click", function () {
        var inp = node.querySelector("#ppUrl"), v = inp.value.trim();
        if (v) { photoVal = v; inp.value = ""; renderPP(); }
      });
      node.querySelector("#ppClear").addEventListener("click", function () { photoVal = ""; renderPP(); });
      renderPP();

      var close = U.modal(node);
      node.querySelector('[data-f="cancel"]').addEventListener("click", close);
      node.addEventListener("submit", function (e) {
        e.preventDefault();
        var patch = {};
        keys.forEach(function (k) { patch[k] = node.querySelector('[name="' + k + '"]').value.trim(); });
        patch.photo = photoVal;
        store.setConfig(patch);
        U.toast("Контакты сохранены");
        close();
      });
    }
  };
})();
