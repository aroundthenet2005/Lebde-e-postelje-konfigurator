// Global config (no ES modules)
window.CONFIG = {
  "pricing": { "old": 2999, "base": 1999, "currency": "EUR" },

  "sizes": [
    { "id": "160x200", "label": "160×200" },
    { "id": "180x200", "label": "180×200" },
    { "id": "200x200", "label": "200×200" }
  ],

  "headboards": [
    { "id": "gladko", "label": "Gladko" },
    { "id": "kvadratno", "label": "Kvadratno" },
    { "id": "diamantno", "label": "Diamantno" },
    { "id": "vertikalno", "label": "Vertikalno" },
    { "id": "iveral", "label": "Brez tapeciranja (iveral)" }
  ],

  // Okvir je vedno bel (ni UI izbire)
  "frameColorFixed": "bela",

  "headboardColors": [
    { "id": "siva", "label": "Siva", "hex": "#8b9099" },
    { "id": "bez", "label": "Bež", "hex": "#d2b48c" },
    { "id": "temno_modra", "label": "Temno modra", "hex": "#1a2a4a" }
  ],

  "addons": [
    { "id": "senzor", "label": "Senzor za LED", "price": 50, "desc": "Samodejni vklop" },
    { "id": "daljinec", "label": "Daljinski upravljalnik", "price": 60, "desc": "Upravljanje LED" }
  ],

  "image": {
    "folder": "images",
    "ext": "jpg",
    "fallback": "images/fallback.jpg",
    "map": {}
  },

  "stripe": {
    "endpoint": "https://YOUR-WORKER.SUBDOMAIN.workers.dev/create-checkout-session",
    "allowedCountries": ["SI"]
  }
};
