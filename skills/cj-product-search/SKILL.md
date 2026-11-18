---
name: cj-product-search
display_name: "CJ Product Search"
description: "Search CJ Dropshipping products by keyword, category or SKU, or get one product's full details"
category: ecommerce
icon: search
skill_type: sandbox
catalog_type: addon
tool_schema:
  name: cj_product_search
  description: "Search the CJ Dropshipping catalog, or fetch one product's details (variants, prices, images) by pid"
  parameters:
    type: object
    properties:
      keyword:
        type: "string"
        description: "Product name to search for, in English (e.g. 'wireless earbuds')"
      category_id:
        type: "string"
        description: "CJ category ID to filter by"
      sku:
        type: "string"
        description: "CJ product SKU to look up"
      pid:
        type: "string"
        description: "CJ product ID. If set, returns this product's full details instead of a search"
      min_price:
        type: "number"
        description: "Minimum sell price in USD (filters the returned page)"
      max_price:
        type: "number"
        description: "Maximum sell price in USD (filters the returned page)"
      page:
        type: "integer"
        description: "Page number (default 1)"
        default: 1
      page_size:
        type: "integer"
        description: "Results per page, 1-50 (default 10)"
        default: 10
    required: []
---
# CJ Product Search

Searches the CJ Dropshipping catalog through the API 2.0.

- Search: `GET /api2.0/v1/product/list` (`productNameEn`, `categoryId`, `productSku`, `pageNum`, `pageSize`)
- Details: `GET /api2.0/v1/product/query?pid=...`

Authentication is automatic: it reuses the token cached by the
`cj-dropshipping-auth` skill (`/tmp/cj_token.json`), refreshes it when
needed, or requests a new one with the `CJ_API_KEY` environment variable.

Search results return for each product: `pid`, name, SKU, sell price
(USD), image, category and weight. Use `pid` to fetch full details,
including variants (`vid`, variant SKU, price, stock).

Search keywords must be in English. Translate the user's request before
calling the tool, and present prices in USD.
