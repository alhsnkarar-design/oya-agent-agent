import { defineConfig } from "astro/config";

// Static output for Cloudflare Pages. The /api endpoints live in ../functions (Pages Functions).
export default defineConfig({
  output: "static",
  compressHTML: true,
  build: { inlineStylesheets: "always" },
});
