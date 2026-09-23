/* ============================================================
   store.js — слой данных (localStorage)
   В рабочей версии заменяется на защищённую базу данных / CMS.
   ============================================================ */
(function () {
  "use strict";
  var S = MR.STORAGE_KEY, C = MR.CONFIG_KEY, F = MR.FAV_KEY;

  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function read(key, fallback) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { console.warn("Не удалось сохранить:", e); return false; }
  }

  var listeners = [];
  function emit() { listeners.forEach(function (fn) { try { fn(); } catch (e) {} }); }

  var store = {
    onChange: function (fn) { listeners.push(fn); },

    // ---- Инициализация демо-данных ----
    ensureSeed: function () {
      if (!localStorage.getItem(S)) write(S, clone(MR.SEED_LISTINGS));
      if (!localStorage.getItem(C)) write(C, clone(MR.DEFAULT_CONFIG));
    },
    resetDemo: function () {
      write(S, clone(MR.SEED_LISTINGS));
      write(C, clone(MR.DEFAULT_CONFIG));
      emit();
    },

    // ---- Конфигурация (контакты, имя) ----
    getConfig: function () {
      var cfg = read(C, {});
      return Object.assign({}, MR.DEFAULT_CONFIG, cfg);
    },
    setConfig: function (patch) {
      var cfg = Object.assign(this.getConfig(), patch);
      write(C, cfg); emit(); return cfg;
    },

    // ---- Объекты ----
    _all: function () { return read(S, []); },
    _persist: function (list) { write(S, list); emit(); },

    /** Все объекты. includeHidden=false — только видимые (клиентская часть). */
    list: function (includeHidden) {
      var all = this._all();
      if (!includeHidden) all = all.filter(function (o) { return !o.hidden; });
      return all.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    },
    get: function (id) {
      return this._all().filter(function (o) { return o.id === id; })[0] || null;
    },
    _uid: function (title) {
      var base = (title || "obj").toString().toLowerCase()
        .replace(/[^a-zа-я0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 24) || "obj";
      return base + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    },
    _maxOrder: function () {
      return this._all().reduce(function (m, o) { return Math.max(m, o.order || 0); }, 0);
    },

    add: function (data) {
      var list = this._all();
      var obj = Object.assign({
        id: this._uid(data.title), photos: [], advantages: [], hidden: false,
        featured: false, order: this._maxOrder() + 1, createdAt: new Date().toISOString().slice(0, 10)
      }, data);
      if (!obj.id) obj.id = this._uid(data.title);
      list.push(obj); this._persist(list); return obj;
    },
    update: function (id, patch) {
      var list = this._all(), out = null;
      list = list.map(function (o) {
        if (o.id === id) { out = Object.assign({}, o, patch); return out; }
        return o;
      });
      this._persist(list); return out;
    },
    remove: function (id) {
      this._persist(this._all().filter(function (o) { return o.id !== id; }));
    },
    duplicate: function (id) {
      var src = this.get(id); if (!src) return null;
      var copy = JSON.parse(JSON.stringify(src));
      copy.id = this._uid(src.title); copy.title = src.title + " (копия)";
      copy.featured = false; copy.order = this._maxOrder() + 1;
      copy.createdAt = new Date().toISOString().slice(0, 10);
      var list = this._all(); list.push(copy); this._persist(list); return copy;
    },
    setHidden: function (id, hidden) { return this.update(id, { hidden: !!hidden }); },

    movePhoto: function (id, from, to) {
      var o = this.get(id); if (!o || !o.photos) return;
      var p = o.photos.slice();
      if (to < 0 || to >= p.length) return;
      var m = p.splice(from, 1)[0]; p.splice(to, 0, m);
      this.update(id, { photos: p });
    },
    // ---- Избранное ----
    _favListeners: [],
    onFavChange: function (fn) { this._favListeners.push(fn); },
    _emitFav: function () { this._favListeners.forEach(function (fn) { try { fn(); } catch (e) {} }); },
    favIds: function () { return read(F, []); },
    isFav: function (id) { return this.favIds().indexOf(id) !== -1; },
    toggleFav: function (id) {
      var ids = this.favIds(), i = ids.indexOf(id);
      if (i === -1) ids.push(id); else ids.splice(i, 1);
      write(F, ids); this._emitFav(); return i === -1;
    },
    removeFav: function (id) {
      write(F, this.favIds().filter(function (x) { return x !== id; }));
      this._emitFav();
    },
    clearFav: function () { write(F, []); this._emitFav(); },
    /** Объекты из избранного (только существующие и видимые). */
    favList: function () {
      var self = this;
      return this.favIds().map(function (id) { return self.get(id); })
        .filter(function (o) { return o && !o.hidden; });
    }
  };

  MR.store = store;
})();
