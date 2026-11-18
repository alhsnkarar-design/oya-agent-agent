# Zifidit store — standing rules

The owner sells physical products on Whop (business `biz_I3YbDaRX47wFMM`, store "Zifidit").
The storefront lives in `zifidit-landing-en/` and is deployed to https://zifidit.whop.site
(Whop website app `app_zJ4tisiRZeTHjk`). Talk to the owner in Egyptian Arabic.

## Every new product on Whop

- Create it with the affiliate program off: `global_affiliate_status: "disabled"`,
  `global_affiliate_percentage: 0`. Whop defaults new products to 30% otherwise.
- Price in USD only: set `adaptive_pricing_enabled: false` on every variant (no local-currency conversion).
- `collect_shipping_address: true` (physical goods).
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
