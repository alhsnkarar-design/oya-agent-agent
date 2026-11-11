import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The built site goes to ../deploy/site, which the zifidit Worker serves.
export default defineConfig({
  plugins: [react()],
  build: { outDir: "../deploy/site", emptyOutDir: true, assetsInlineLimit: 0, chunkSizeWarningLimit: 1200 },
  server: { proxy: { "/api": "https://zifidit.com" } },
});
