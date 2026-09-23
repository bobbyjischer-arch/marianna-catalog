/* ============================================================
   data.js — демонстрационные данные каталога
   Реальные объекты, цены и характеристики взяты из прежнего
   демо. Фотографии и часть описаний — обозначенные ДЕМО-данные,
   которые Марианна заменяет в панели управления.
   ============================================================ */
(function () {
  "use strict";
  window.MR = window.MR || {};

  MR.PROPERTY_TYPES = ["Квартира", "Дом", "Апартаменты"];
  MR.STATUSES = ["Актуально", "Забронировано", "Продано"];
  MR.STORAGE_KEY = "mr_catalog_v1";
  MR.CONFIG_KEY = "mr_config_v1";
  MR.FAV_KEY = "mr_favorites_v1";

  // Демо-фотографии (Unsplash). В рабочей версии заменяются на фото объектов.
  function img(id) {
    return "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=1400&q=80";
  }
  MR.img = img;

  var PH = {
    penthouse: [img("1512917774080-9991f1c4c750"), img("1493809842364-78817add7ffb"), img("1502672260266-1c1ef2d93688"), img("1600607687939-ce8a6c25118c")],
    villa: [img("1568605114967-8130f3a36994"), img("1613490493576-7fde63acd811"), img("1580587771525-78b9dba3b914"), img("1449844908441-8829872d2607")],
    villaSea: [img("1512917774080-9991f1c4c750"), img("1449844908441-8829872d2607"), img("1507525428034-b723cf961d3e"), img("1568605114967-8130f3a36994")],
    apt1: [img("1600585154340-be6161a56a0c"), img("1600566753086-00f18fb6b3ea"), img("1600210492486-724fe5c67fb0")],
    apt2: [img("1522708323590-d24dbb6b0267"), img("1512699355324-f07e3106dae5"), img("1520250497591-112f2f40a3f4")],
    apt3: [img("1560448204-e02f11c3d0e2"), img("1600585152220-90363fe7e115"), img("1600585154526-990dced4db0d")]
  };
  MR.DEMO_PHOTO_POOLS = PH;

  // Глобальные демо-контакты (нет в исходных материалах — обозначены как ДЕМО).
  MR.DEFAULT_CONFIG = {
    agentName: "Марианна Антонова",
    tagline: "Персональный каталог недвижимости",
    instagram: "https://instagram.com/marianna_realty",
    telegram: "",   // ДЕМО: укажите @username в панели управления
    whatsapp: "",    // ДЕМО: укажите номер в панели управления
    phone: ""        // ДЕМО: укажите телефон в панели управления
  };

  var NOTE = " Демонстрационное описание — заменяется в панели управления.";

  MR.SEED_LISTINGS = [
    {
      id: "penthouse-250", title: "3-комнатная квартира, 250 м²", city: "Геленджик · побережье",
      type: "Квартира", price: 280000000, area: 250, rooms: 3, floor: "12/16", plot: "", address: "",
      status: "Актуально", featured: true, hidden: false, order: 1, createdAt: "2026-01-15", photos: PH.penthouse,
      advantages: ["Панорамный вид на море", "Закрытая охраняемая территория", "Юридическая чистота проверена до показа"],
      location: "Геленджик, первая береговая линия. Демо-ориентир расположения.",
      description: "Просторная 3-комнатная квартира 250 м² в Геленджике на побережье, этаж 12/16." + NOTE
    },
    {
      id: "house-316", title: "Дом 316 м² с участком", city: "Геленджик",
      type: "Дом", price: 250000000, area: 316, rooms: null, floor: "", plot: "5,9 сот.", address: "",
      status: "Актуально", featured: false, hidden: false, order: 2, createdAt: "2026-01-20", photos: PH.villa,
      advantages: ["Собственный участок 5,9 сотки", "Для круглогодичного проживания", "Юридическая чистота проверена"],
      location: "Геленджик. Демо-ориентир расположения.",
      description: "Отдельно стоящий дом 316 м² с участком 5,9 сотки в Геленджике." + NOTE
    },
    {
      id: "house-288", title: "Дом 288 м² у моря", city: "Дивноморское",
      type: "Дом", price: 155000000, area: 288, rooms: null, floor: "", plot: "26,1 сот.", address: "",
      status: "Актуально", featured: false, hidden: false, order: 3, createdAt: "2026-01-22", photos: PH.villaSea,
      advantages: ["Большой участок 26,1 сотки", "Рядом с морем", "Юридическая чистота проверена"],
      location: "Дивноморское, рядом с морем. Демо-ориентир расположения.",
      description: "Дом 288 м² у моря в Дивноморском, участок 26,1 сотки." + NOTE
    },
    {
      id: "apt-98", title: "Апартаменты 98 м²", city: "Геленджик",
      type: "Апартаменты", price: 90000000, area: 98.3, rooms: 2, floor: "2/5", plot: "", address: "",
      status: "Актуально", featured: false, hidden: false, order: 4, createdAt: "2026-02-01", photos: PH.apt1,
      advantages: ["Видовые окна", "Развитая инфраструктура рядом", "Юридическая чистота проверена"],
      location: "Геленджик. Демо-ориентир расположения.",
      description: "Апартаменты 98,3 м², 2 комнаты, этаж 2/5, Геленджик." + NOTE
    },
    {
      id: "flat-110", title: "2-комнатная квартира, 110 м²", city: "Геленджик",
      type: "Квартира", price: 68000000, area: 110.4, rooms: 2, floor: "11/12", plot: "", address: "",
      status: "Забронировано", featured: false, hidden: false, order: 5, createdAt: "2026-02-05", photos: PH.apt2,
      advantages: ["Высокий этаж", "Видовые окна", "Юридическая чистота проверена"],
      location: "Геленджик. Демо-ориентир расположения.",
      description: "2-комнатная квартира 110,4 м², этаж 11/12, Геленджик." + NOTE
    },
    {
      id: "apt-92", title: "Апартаменты 92 м²", city: "Геленджик",
      type: "Апартаменты", price: 57000000, area: 92, rooms: 2, floor: "1/5", plot: "", address: "",
      status: "Актуально", featured: false, hidden: false, order: 6, createdAt: "2026-02-08", photos: PH.apt3,
      advantages: ["Отдельный вход", "Терраса", "Юридическая чистота проверена"],
      location: "Геленджик. Демо-ориентир расположения.",
      description: "Апартаменты 92 м², 2 комнаты, этаж 1/5, Геленджик." + NOTE
    },
    {
      id: "flat-106", title: "2-комнатная квартира, 106 м²", city: "Геленджик",
      type: "Квартира", price: 46350000, area: 106, rooms: 2, floor: "3/12", plot: "", address: "",
      status: "Актуально", featured: false, hidden: false, order: 7, createdAt: "2026-02-10", photos: PH.apt1,
      advantages: ["Просторная планировка", "Развитая инфраструктура рядом", "Юридическая чистота проверена"],
      location: "Геленджик. Демо-ориентир расположения.",
      description: "2-комнатная квартира 106 м², этаж 3/12, Геленджик." + NOTE
    },
    {
      id: "flat-72", title: "2-комнатная квартира, 72 м²", city: "Геленджик",
      type: "Квартира", price: 26700000, area: 72, rooms: 2, floor: "7/10", plot: "", address: "",
      status: "Продано", featured: false, hidden: false, order: 8, createdAt: "2026-02-12", photos: PH.apt2,
      advantages: ["Удобная планировка", "Развитая инфраструктура рядом", "Юридическая чистота проверена"],
      location: "Геленджик. Демо-ориентир расположения.",
      description: "2-комнатная квартира 72 м², этаж 7/10, Геленджик." + NOTE
    },
    {
      id: "flat-57", title: "1-комнатная квартира, 56,9 м²", city: "Геленджик",
      type: "Квартира", price: 24500000, area: 56.9, rooms: 1, floor: "8/20", plot: "", address: "",
      status: "Актуально", featured: false, hidden: false, order: 9, createdAt: "2026-02-14", photos: PH.apt3,
      advantages: ["Высокий этаж", "Видовые окна", "Юридическая чистота проверена"],
      location: "Геленджик. Демо-ориентир расположения.",
      description: "1-комнатная квартира 56,9 м², этаж 8/20, Геленджик." + NOTE
    },
    {
      id: "apt-51", title: "Апартаменты 50,9 м²", city: "Геленджик",
      type: "Апартаменты", price: 22000000, area: 50.9, rooms: 1, floor: "8/8", plot: "", address: "",
      status: "Актуально", featured: false, hidden: false, order: 10, createdAt: "2026-02-16", photos: PH.apt1,
      advantages: ["Верхний этаж", "Панорамные окна", "Юридическая чистота проверена"],
      location: "Геленджик. Демо-ориентир расположения.",
      description: "Апартаменты 50,9 м², 1 комната, этаж 8/8, Геленджик." + NOTE
    },
    {
      id: "apt-61", title: "Апартаменты 60,7 м²", city: "Геленджик",
      type: "Апартаменты", price: 20500000, area: 60.7, rooms: 2, floor: "1/8", plot: "", address: "",
      status: "Актуально", featured: false, hidden: false, order: 11, createdAt: "2026-02-18", photos: PH.apt2,
      advantages: ["Отдельный вход", "Удобная планировка", "Юридическая чистота проверена"],
      location: "Геленджик. Демо-ориентир расположения.",
      description: "Апартаменты 60,7 м², 2 комнаты, этаж 1/8, Геленджик." + NOTE
    }
  ];
})();
