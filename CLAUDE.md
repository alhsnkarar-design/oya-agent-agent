# Zifidit store — standing rules

The owner sells physical products on Whop (business `biz_I3YbDaRX47wFMM`, store "Zifidit").
The storefront lives in `zifidit-landing-en/` and is deployed to https://zifidit.whop.site
(Whop website app `app_zJ4tisiRZeTHjk`). Talk to the owner in Egyptian Arabic.

## Every new product on Whop

- Create it with the affiliate program off: `global_affiliate_status: "disabled"`,
  `global_affiliate_percentage: 0`. Whop defaults new products to 30% otherwise.
- Price in USD only: set `adaptive_pricing_enabled: false` on every variant (no local-currency conversion).
- `collect_shipping_address: true` (physical goods). Whop's checkout then requires the email and
  the full shipping address (country, address, city, state/governorate in each country's format).
- Add a required phone field on every variant: `custom_fields: [{field_type: "text",
  name: "Phone number with country code (for delivery)", placeholder: "+1 555 123 4567",
  required: true, order: 1}]`. Whop clears custom fields on any variant update that omits
  `custom_fields`, so include this list in EVERY variants_update call, then read it back.
- No bank wire and no crypto: set `payment_method_configuration` with `disabled: ["bank_wire",
  "international_bank_wire", "crypto", "crypto_subscription", "coinbase"]` (keep the other methods enabled).
- Title, headline and description in English, matching the storefront.
- Only add products the owner has a real supplier for, with real photos and a cost price
  from the owner. Never publish sample/placeholder products, invented reviews, fake
  countdowns or claims the owner did not give.
- After creating, read the product back and confirm the affiliate rate is 0% and pricing is USD-only.

## Storefront

- Source: `zifidit-landing-en/page.src.html`. Build with the scratchpad `build.py` pattern:
  `preview.html` (claude.ai preview, all products) and `index.html` (production, only products
  with a Whop `plan` id; sample products are stripped).
- Checkout is the Whop Checkout element embedded in the page (`cdn.whop.com/elements`), with
  Add to Cart and Buy it now. Keep the page simple: the owner removes anything that feels like clutter.
- Palette: white background, mist panels `#eef2f4`, deep teal accent `#0e4f5c`, pill buttons
  ("Add to Cart" filled, "Buy it now" outlined).
- Policies (shipping, refund, contact `info@zifidit.com`) are in the page and as PDFs in
  `zifidit-landing-en/policies/`, attached to the Whop account. Keep both in sync.
- Show the owner a preview before changing the live site, unless they say to deploy.
