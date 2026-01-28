# Floating Bed Configurator (EN) — GitHub Pages ready

- Frame color: ALWAYS WHITE (no selection)
- Headboard: UPHOLSTERED ONLY
- English UI
- Stripe button calls a backend endpoint (required, because GitHub Pages is static)

## Deploy on GitHub Pages
Put these files in your repo ROOT:
- index.html, success.html, cancel.html
- assets/ , images/

Then GitHub -> Settings -> Pages -> Deploy from branch -> main + /(root)

## Stripe
Set your backend endpoint in:
assets/config.js -> stripe.endpoint

Recommended backend: Cloudflare Worker
See /server for a ready Worker you can deploy.
