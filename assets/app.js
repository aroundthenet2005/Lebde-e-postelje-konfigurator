(function () {
  var CONFIG = window.CONFIG;
  if (!CONFIG) {
    console.error("Missing window.CONFIG. Check assets/config.js is loaded before assets/app.js");
    return;
  }

  var FIXED_FRAME = CONFIG.frameColorFixed || "bela";

  var state = {
    size: CONFIG.sizes[0].id,
    head: CONFIG.headboards[0].id,
    frameColor: FIXED_FRAME,
    headColor: (CONFIG.headboardColors[0] && CONFIG.headboardColors[0].id) ? CONFIG.headboardColors[0].id : "siva",
    addons: new Set()
  };

  function formatEUR(n) {
    return new Intl.NumberFormat("sl-SI", { style: "currency", currency: CONFIG.pricing.currency }).format(n);
  }

  function lastDayOfThisMonth() {
    var d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  }

  function promoText() {
    var end = lastDayOfThisMonth();
    var dd = String(end.getDate()).padStart(2, "0");
    var mm = String(end.getMonth() + 1).padStart(2, "0");
    var yyyy = end.getFullYear();
    return "Akcija velja do " + dd + "." + mm + "." + yyyy + " (naslednji mesec se ponovi).";
  }

  function imageKey() {
    return state.size + "|" + state.head + "|" + state.frameColor + "|" + state.headColor;
  }

  function buildImagePath() {
    var key = imageKey();
    if (CONFIG.image.map && CONFIG.image.map[key]) return CONFIG.image.map[key];
    return CONFIG.image.folder + "/" + state.size + "_" + state.head + "_" + state.frameColor + "_" + state.headColor + "." + CONFIG.image.ext;
  }

  function addonsTotal() {
    var sum = 0;
    for (var i = 0; i < CONFIG.addons.length; i++) {
      var a = CONFIG.addons[i];
      if (state.addons.has(a.id)) sum += a.price;
    }
    return sum;
  }

  function total() {
    return CONFIG.pricing.base + addonsTotal();
  }

  function selectedAddonsList() {
    return CONFIG.addons.filter(function (a) { return state.addons.has(a.id); });
  }

  function render() {
    document.getElementById("oldPrice").textContent = formatEUR(CONFIG.pricing.old);
    document.getElementById("newPrice").textContent = formatEUR(CONFIG.pricing.base);
    document.getElementById("promoText").textContent = promoText();
    document.getElementById("totalPill").textContent = "Skupaj: " + formatEUR(total());

    document.getElementById("sizeVal").textContent = state.size;
    document.getElementById("headVal").textContent = state.head;
    document.getElementById("headColorVal").textContent = state.headColor;

    var addCount = state.addons.size;
    document.getElementById("addonsVal").textContent = addCount ? (addCount + " izbrano") : "0 izbrano";

    var img = document.getElementById("bedImg");
    var path = buildImagePath();
    img.src = path;
    img.onerror = function () { img.src = CONFIG.image.fallback; };

    document.getElementById("imgHint").textContent =
      "Slike: /images | Ime: " + state.size + "_" + state.head + "_" + state.frameColor + "_" + state.headColor + "." + CONFIG.image.ext +
      " (fallback: fallback." + CONFIG.image.ext + ")";

    var addons = selectedAddonsList();
    var baseLine = "<div><strong>Postelja (akcija)</strong>: " + formatEUR(CONFIG.pricing.base) + "</div>";
    var addLines = addons.length
      ? addons.map(function (a) { return "<div>+ " + a.label + ": " + formatEUR(a.price) + "</div>"; }).join("")
      : "<div>Brez dodatkov.</div>";

    var confLine =
      '<div style="margin-top:8px"><strong>Konfiguracija:</strong> ' +
      state.size + ", " + state.head + ", okvir: bela, vzglavje: " + state.headColor + "</div>";

    document.getElementById("cartBox").innerHTML = baseLine + addLines + confLine;
  }

  function mount() {
    var sizesEl = document.getElementById("sizes");
    sizesEl.innerHTML = "";
    CONFIG.sizes.forEach(function (s) {
      var b = document.createElement("button");
      b.textContent = s.label;
      b.className = (state.size === s.id) ? "active" : "";
      b.onclick = function () { state.size = s.id; rerenderButtons(); render(); };
      b.dataset.group = "size";
      b.dataset.id = s.id;
      sizesEl.appendChild(b);
    });

    var headsEl = document.getElementById("heads");
    headsEl.innerHTML = "";
    CONFIG.headboards.forEach(function (h) {
      var b = document.createElement("button");
      b.textContent = h.label;
      b.className = (state.head === h.id) ? "active" : "";
      b.onclick = function () { state.head = h.id; rerenderButtons(); render(); };
      b.dataset.group = "head";
      b.dataset.id = h.id;
      headsEl.appendChild(b);
    });

    var headColEl = document.getElementById("headColors");
    headColEl.innerHTML = "";
    CONFIG.headboardColors.forEach(function (c) {
      var btn = document.createElement("div");
      btn.className = "colorBtn" + (state.headColor === c.id ? " active" : "");
      btn.onclick = function () { state.headColor = c.id; rerenderButtons(); render(); };
      btn.dataset.group = "headColor";
      btn.dataset.id = c.id;

      var dot = document.createElement("div");
      dot.className = "colorDot";
      dot.style.background = c.hex || "#999";

      var label = document.createElement("div");
      label.style.fontWeight = "800";
      label.textContent = c.label;

      btn.appendChild(dot);
      btn.appendChild(label);
      headColEl.appendChild(btn);
    });

    var addonsEl = document.getElementById("addons");
    addonsEl.innerHTML = "";
    CONFIG.addons.forEach(function (a) {
      var card = document.createElement("div");
      var active = state.addons.has(a.id);
      card.className = "card" + (active ? " active" : "");
      card.onclick = function () {
        if (state.addons.has(a.id)) state.addons.delete(a.id);
        else state.addons.add(a.id);
        mount();
        render();
      };

      var left = document.createElement("div");
      left.className = "left";
      left.innerHTML = '<div class="title">' + a.label + '</div><div class="sub">' + a.desc + " (+" + formatEUR(a.price) + ")</div>";

      var pill = document.createElement("div");
      pill.className = "pill";
      pill.textContent = active ? "V kosarici" : "Dodaj";

      card.appendChild(left);
      card.appendChild(pill);
      addonsEl.appendChild(card);
    });

    document.getElementById("payBtn").onclick = pay;
  }

  function rerenderButtons() {
    document.querySelectorAll("[data-group='size']").forEach(function (el) {
      el.classList.toggle("active", el.dataset.id === state.size);
    });
    document.querySelectorAll("[data-group='head']").forEach(function (el) {
      el.classList.toggle("active", el.dataset.id === state.head);
    });
    document.querySelectorAll("[data-group='headColor']").forEach(function (el) {
      el.classList.toggle("active", el.dataset.id === state.headColor);
    });
  }

  async function pay() {
    var payload = {
      config: {
        size: state.size,
        headboard: state.head,
        frame_color: state.frameColor,      // vedno "bela"
        headboard_color: state.headColor,   // vedno relevantno
        addons: Array.from(state.addons)
      }
    };

    try {
      var res = await fetch(CONFIG.stripe.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        var t = await res.text();
        alert("Stripe backend endpoint ni nastavljen ali je napaka.\n\nDetails:\n" + t);
        return;
      }

      var data = await res.json();
      if (!data || !data.url) {
        alert("Missing checkout url from backend.");
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      alert("Napaka pri povezavi do Stripe endpointa:\n\n" + err.message);
    }
  }

  try {
    mount();
    render();
  } catch (e) {
    console.error(e);
    alert("JS error. Open Console (F12).");
  }
})();
