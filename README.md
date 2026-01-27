# Fix za tvoj problem (manjkajo gumbi)
Če gumbov ni, pomeni da JS ni zagnan. Najpogosteje:
- odpreš `index.html` direktno z double-click (file://) in ES-moduli se ne naložijo
- ali GitHub Pages ne servira pravilno module importov

Ta verzija je **NO-MODULE** (navaden JS) in dela:
✅ na `file://` (lokalno)  
✅ na GitHub Pages

---

## Stripe opomba
GitHub Pages nima backenda. Za "Plačaj (Stripe)" še vedno rabiš endpoint (npr. Cloudflare Worker).
V `assets/config.js` nastavi:
`stripe.endpoint = "https://YOUR-WORKER.../create-checkout-session"`

---

## Slike
Tapecirano:
`{size}_{headboard}_{frameColor}_{headboardColor}.jpg`

Iveral:
`{size}_{headboard}_{frameColor}.jpg`
