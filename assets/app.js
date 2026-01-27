(function(){
  const CONFIG = window.CONFIG;
  if (!CONFIG) {
    console.error("Missing window.CONFIG. Check assets/config.js is loaded before assets/app.js");
    return;
  }

  const state = {
    size: CONFIG.sizes[0].id,
    head: CONFIG.headboards[0].id,
    frameColor: (CONFIG.frameColors[0] && CONFIG.frameColors[0].id) ? CONFIG.frameColors[0].id : "bela",
    headColor: (CONFIG.headboardColors[0] && CONFIG.headboardColors[0].id) ? CONFIG.headboardColors[0].id : "siva",
    addons: new Set()
  };

  const € = (n) => new Intl.NumberFormat("sl-SI", { style:"currency", currency: CONFIG.pricing.currency }).format(n);

  function lastDayOfThisMonth(){
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  }
  function promoText(){
    const end = lastDayOfThisMonth();
    const dd = String(end.getDate()).padStart(2,"0");
    const mm = String(end.getMonth()+1).padStart(2,"0");
    const yyyy = end.getFullYear();
    return `Akcija velja do ${dd}.${mm}.${yyyy} (naslednji mesec se ponovi).`;
  }

  function isIveral(){
    return state.head === "iveral";
  }

  function imageKey(){
    if (isIveral()){
      return `${state.size}|${state.head}|${state.frameColor}`;
    }
    return `${state.size}|${state.head}|${state.frameColor}|${state.headColor}`;
  }

  function buildImagePath(){
    const key = imageKey();
    if (CONFIG.image.map && CONFIG.image.map[key]) return CONFIG.image.map[key];

    if (isIveral()){
      return `${CONFIG.image.folder}/${state.size}_${state.head}_${state.frameColor}.${CONFIG.image.ext}`;
    }
    return `${CONFIG.image.folder}/${state.size}_${state.head}_${state.frameColor}_${state.headColor}.${CONFIG.image.ext}`;
  }

  function effectiveHeadColor(){
    return isIveral() ? state.frameColor : state.headColor;
  }

  function addonsTotal(){
    let sum = 0;
    for (const a of CONFIG.addons){
      if (state.addons.has(a.id)) sum += a.price;
    }
    return sum;
  }
  function total(){
    return CONFIG.pricing.base + addonsTotal();
  }
  function selectedAddonsList(){
    return CONFIG.addons.filter(a => state.addons.has(a.id));
  }

  function render(){
    document.getElementById("oldPrice").textContent = €(CONFIG.pricing.old);
    document.getElementById("newPrice").textContent = €(CONFIG.pricing.base);
    document.getElementById("promoText").textContent = promoText();
    document.getElementById("totalPill").textContent = `Skupaj: ${€(total())}`;

    document.getElementById("sizeVal").textContent = state.size;
    document.getElementById("headVal").textContent = state.head;
    document.getElementById("frameColorVal").textContent = state.frameColor;

    const headColorRow = document.getElementById("headColorRow");
    const headColorVal = document.getElementById("headColorVal");
    const headColorNote = document.getElementById("headColorNote");

    if (isIveral()){
      headColorRow.style.display = "none";
      headColorNote.style.display = "block";
      headColorVal.textContent = state.frameColor;
    } else {
      headColorRow.style.display = "block";
      headColorNote.style.display = "none";
      headColorVal.textContent = state.headColor;
    }

    const addCount = state.addons.size;
    document.getElementById("addonsVal").textContent = addCount ? `${addCount} izbrano` : "0 izbrano";

    const img = document.getElementById("bedImg");
    const path = buildImagePath();
    img.src = path;
    img.onerror = () => { img.src = CONFIG.image.fallback; };

    const hint = document.getElementById("imgHint");
    if (isIveral()){
      hint.textContent =
        `Slike daj v /images. Ime: ${state.size}_${state.head}_${state.frameColor}.${CONFIG.image.ext} (fallback: fallback.${CONFIG.image.ext})`;
    } else {
      hint.textContent =
        `Slike daj v /images. Ime: ${state.size}_${state.head}_${state.frameColor}_${state.headColor}.${CONFIG.image.ext} (fallback: fallback.${CONFIG.image.ext})`;
    }

    const addons = selectedAddonsList();
    const baseLine = `<div><strong>Postelja (akcija)</strong>: ${€(CONFIG.pricing.base)}</div>`;
    const addLines = addons.length
      ? addons.map(a => `<div>+ ${a.label}: ${€(a.price)}</div>`).join("")
      : `<div>Brez dodatkov.</div>`;

    const confLine = isIveral()
      ? `<div style="margin-top:8px"><strong>Konfiguracija:</strong> ${state.size}, ${state.head}, okvir: ${state.frameColor}</div>`
      : `<div style="margin-top:8px"><strong>Konfiguracija:</strong> ${state.size}, ${state.head}, okvir: ${state.frameColor}, vzglavje: ${state.headColor}</div>`;

    document.getElementById("cartBox").innerHTML = baseLine + addLines + confLine;
  }

  function mount(){
    const sizesEl = document.getElementById("sizes");
    sizesEl.innerHTML = "";
    for (const s of CONFIG.sizes){
      const b = document.createElement("button");
      b.textContent = s.label;
      b.className = (state.size === s.id) ? "active" : "";
      b.onclick = () => { state.size = s.id; rerenderButtons(); render(); };
      b.dataset.group = "size";
      b.dataset.id = s.id;
      sizesEl.appendChild(b);
    }

    const headsEl = document.getElementById("heads");
    headsEl.innerHTML = "";
    for (let i=0;i<CONFIG.headboards.length;i++){
      const h = CONFIG.headboards[i];
      const b = document.createElement("button");
      b.textContent = h.label;
      b.className = (state.head === h.id) ? "active" : "";
      if (i === CONFIG.headboards.length-1) b.classList.add("wide");
      b.onclick = () => {
        state.head = h.id;
        if (isIveral()) state.headColor = state.frameColor;
        rerenderButtons();
        render();
      };
      b.dataset.group = "head";
      b.dataset.id = h.id;
      headsEl.appendChild(b);
    }

    const frameEl = document.getElementById("frameColors");
    frameEl.innerHTML = "";
    for (const c of CONFIG.frameColors){
      const btn = document.createElement("div");
      btn.className = "colorBtn" + (state.frameColor === c.id ? " active" : "");
      btn.onclick = () => {
        state.frameColor = c.id;
        if (isIveral()) state.headColor = state.frameColor;
        rerenderButtons();
        render();
      };
      btn.dataset.group = "frameColor";
      btn.dataset.id = c.id;

      const dot = document.createElement("div");
      dot.className = "colorDot";
      dot.style.background = c.hex || "#999";

      const label = document.createElement("div");
      label.style.fontWeight = "800";
      label.textContent = c.label;

      btn.appendChild(dot);
      btn.appendChild(label);
      frameEl.appendChild(btn);
    }

    const headColEl = document.getElementById("headColors");
    headColEl.innerHTML = "";
    for (const c of CONFIG.headboardColors){
      const btn = document.createElement("div");
      btn.className = "colorBtn" + (state.headColor === c.id ? " active" : "");
      btn.onclick = () => { state.headColor = c.id; rerenderButtons(); render(); };
      btn.dataset.group = "headColor";
      btn.dataset.id = c.id;

      const dot = document.createElement("div");
      dot.className = "colorDot";
      dot.style.background = c.hex || "#999";

      const label = document.createElement("div");
      label.style.fontWeight = "800";
      label.textContent = c.label;

      btn.appendChild(dot);
      btn.appendChild(label);
      headColEl.appendChild(btn);
    }

    const addonsEl = document.getElementById("addons");
    addonsEl.innerHTML = "";
    for (const a of CONFIG.addons){
      const card = document.createElement("div");
      const active = state.addons.has(a.id);
      card.className = "card" + (active ? " active" : "");
      card.onclick = () => {
        if (state.addons.has(a.id)) state.addons.delete(a.id);
        else state.addons.add(a.id);
        mount();
        render();
      };

      const left = document.createElement("div");
      left.className = "left";
      left.innerHTML = `<div class="title">${a.label}</div><div class="sub">${a.desc} (+${€(a.price)})</div>`;

      const pill = document.createElement("div");
      pill.className = "pill";
      pill.textContent = active ? "V košarici" : "Dodaj";

      card.appendChild(left);
      card.appendChild(pill);
      addonsEl.appendChild(card);
    }

    document.getElementById("payBtn").onclick = pay;
  }

  function rerenderButtons(){
    for (const el of document.querySelectorAll("[data-group='size']")){
      el.classList.toggle("active", el.dataset.id === state.size);
    }
    for (const el of document.querySelectorAll("[data-group='head']")){
      el.classList.toggle("active", el.dataset.id === state.head);
    }
    for (const el of document.querySelectorAll("[data-group='frameColor']")){
      el.classList.toggle("active", el.dataset.id === state.frameColor);
    }
    for (const el of document.querySelectorAll("[data-group='headColor']")){
      el.classList.toggle("active", el.dataset.id === state.headColor);
    }
  }

  async function pay(){
    const payload = {
      config: {
        size: state.size,
        headboard: state.head,
        frame_color: state.frameColor,
        headboard_color: effectiveHeadColor(),
        addons: Array.from(state.addons)
      }
    };

    try{
      const res = await fetch(CONFIG.stripe.endpoint, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok){
        const t = await res.text();
        alert("Stripe backend endpoint ni nastavljen ali je napaka.\n\nPodrobnosti:\n" + t);
        return;
      }

      const data = await res.json();
      if (!data?.url){
        alert("Manjka checkout url iz backenda.");
        return;
      }
      window.location.href = data.url;
    }catch(err){
      alert("Napaka pri povezavi do Stripe endpointa:\n\n" + err.message);
    }
  }

  // Start
  try{
    mount();
    render();
  }catch(e){
    console.error(e);
    alert("JS napaka — odpri Console (F12) in poglej error.");
  }
})();
