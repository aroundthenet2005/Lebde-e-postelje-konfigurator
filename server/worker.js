/**
 * Cloudflare Worker: /create-checkout-session
 *
 * Env vars (Workers -> Settings -> Variables):
 * - STRIPE_SECRET_KEY  (sk_live_... or sk_test_...)
 * - SITE_URL           (npr. https://USERNAME.github.io/REPO)
 *
 * Route:
 * - https://YOUR-WORKER.SUBDOMAIN.workers.dev/create-checkout-session
 */
export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    if (!env.STRIPE_SECRET_KEY) {
      return new Response("Missing STRIPE_SECRET_KEY", { status: 400, headers: corsHeaders });
    }
    if (!env.SITE_URL) {
      return new Response("Missing SITE_URL", { status: 400, headers: corsHeaders });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON body", { status: 400, headers: corsHeaders });
    }

    const config = body.config || {};
    const BASE_PRICE_EUR = 1999;
    const ADDON_PRICES = { senzor: 50, daljinec: 60 };

    // Stripe expects application/x-www-form-urlencoded
    const params = new URLSearchParams();
    params.set("mode", "payment");

    // success/cancel URLs must be absolute
    params.set("success_url", `${env.SITE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", `${env.SITE_URL}/cancel.html`);

    // Address collection
    params.set("billing_address_collection", "required");
    // Allowed countries (repeat key for each)
    const allowed = ["SI"];
    for (const c of allowed) {
      params.append("shipping_address_collection[allowed_countries][]", c);
    }

    // Line item: base product
    params.set("line_items[0][price_data][currency]", "eur");
    params.set("line_items[0][price_data][product_data][name]", "Lebdeča postelja na ključ (akcija)");
    params.set("line_items[0][price_data][unit_amount]", String(BASE_PRICE_EUR * 100));
    params.set("line_items[0][quantity]", "1");

    const addons = Array.isArray(config.addons) ? config.addons : [];
    let idx = 1;
    for (const a of addons) {
      const p = ADDON_PRICES[a];
      if (!p) continue;
      params.set(`line_items[${idx}][price_data][currency]`, "eur");
      params.set(`line_items[${idx}][price_data][product_data][name]`, `Dodatek: ${a}`);
      params.set(`line_items[${idx}][price_data][unit_amount]`, String(p * 100));
      params.set(`line_items[${idx}][quantity]`, "1");
      idx++;
    }

    // Metadata (configuration)
    const md = {
      size: String(config.size || ""),
      headboard: String(config.headboard || ""),
      frame_color: String(config.frame_color || ""),
      headboard_color: String(config.headboard_color || ""),
      addons: addons.join(","),
    };
    for (const [k, v] of Object.entries(md)) {
      params.set(`metadata[${k}]`, v);
    }

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    const text = await stripeRes.text();
    if (!stripeRes.ok) {
      return new Response(text, { status: 400, headers: corsHeaders });
    }

    // Stripe returns url in JSON
    let session;
    try {
      session = JSON.parse(text);
    } catch {
      return new Response("Stripe response parse error", { status: 400, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};
