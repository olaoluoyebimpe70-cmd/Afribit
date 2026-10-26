# AfriBit Cards — Demo Prototype

A modern, multi-page demo website for a **Bitcoin gift card / voucher** platform targeted at Africa.

## What it does

- Users select any major African currency
- Choose or enter an amount
- Simulate payment via Flutterwave / Mobile Money / Bank Transfer
- Receive an instant unique gift-card code
- Codes are stored locally and shown on the “My Cards” page

## Important Disclaimer

This is a **frontend prototype only**.

- No real payments are processed
- Codes cannot be redeemed for actual Bitcoin
- A live product would require VASP / digital-asset licensing, KYC/AML, payment partner agreements, and liquidity arrangements in each target country

## How to view

Open `index.html` in any modern browser, or serve the folder with a simple static server:

```bash
npx serve .
# or
python -m http.server 8000
```

## Pages

- `index.html` — Homepage
- `buy.html` — Purchase flow + payment modal
- `how-it-works.html` — 4-step explanation
- `faq.html` — Common questions
- `my-cards.html` — List of codes generated in this browser

## Tech

- Pure HTML + CSS + vanilla JavaScript
- No build step required
- Dark modern crypto aesthetic
- Responsive design

---

Built as a demonstration for product exploration and investor conversations.