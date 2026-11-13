# Zifidit Store (zifidit.com)

English storefront served by the Cloudflare Worker `zifidit-store` on `zifidit.com` and `www.zifidit.com` (www redirects to the apex).

- `public/` holds the site: `index.html`, `styles.css`, `app.js`, `products.json`.
- `worker.js` serves `public/` from this repo at the commit in the `SITE_REF` binding, and handles `/api/subscribe`, `/api/contact`, `/api/order` and `/api/track`.
- Data goes to the D1 database `zifidit-store` (binding `DB`), in the tables `subscribers`, `messages` and `orders`.

## Adding products

The catalog is empty on purpose. To add a product, put an object in `public/products.json`:

```json
[
  { "id": "zf-001", "name": "Product name", "price": 21.64, "compareAt": 39.99,
    "category": "Home & Living", "images": ["/img/zf-001-1.webp"],
    "description": "Short description.", "details": ["Point one", "Point two"],
    "rating": 4.8, "reviews": 21, "stock": 50, "badge": "-45%" }
]
```

Put images in `public/img/`. Then commit and push, and update the worker's `SITE_REF` binding to the new commit SHA.

## Payments

Card, PayPal, Apple Pay and Google Pay are not connected yet. Checkout records the order with the status `new`, and the customer is told a payment link will follow by email. Before taking real orders, connect a payment provider such as Stripe or PayPal, or send those links yourself.
