// Global config (no ES modules)
window.CONFIG = {
  pricing: { old: 2999, base: 1999, currency: "EUR" },

  sizes: [
    { id: "160x200", label: "160×200" },
    { id: "180x200", label: "180×200" },
    { id: "200x200", label: "200×200" }
  ],

  // Headboard styles (UPHOLSTERED ONLY)
  headboards: [
    { id: "gladko", label: "Smooth" },
    { id: "kvadratno", label: "Square" },
    { id: "diamantno", label: "Diamond" },
    { id: "vertikalno", label: "Vertical" }
  ],

  // Frame is always white (no UI selection).
  // Keep ID "bela" so your image naming stays the same.
  frameColorFixed: "bela",
  frameColorLabel: "White",

  // Upholstery colors (labels in English, IDs kept for image filenames)
  headboardColors: [
    { id: "siva", label: "Gray", hex: "#8b9099" },
    { id: "bez", label: "Beige", hex: "#d2b48c" },
    { id: "temno_modra", label: "Dark Blue", hex: "#1a2a4a" }
  ],

  addons: [
    { id: "senzor", label: "LED Motion Sensor", price: 50, desc: "Automatic turn-on" },
    { id: "daljinec", label: "LED Remote Control", price: 60, desc: "Control the LED lighting" }
  ],

  image: {
    folder: "images",
    ext: "jpg",
    fallback: "images/fallback.jpg",
    map: {}
  },

  // GitHub Pages is static → Stripe needs a backend endpoint (Cloudflare Worker recommended)
  stripe: {
    endpoint: "https://YOUR-WORKER.SUBDOMAIN.workers.dev/create-checkout-session",
    allowedCountries: ["SI"]
  }
};
