#!/usr/bin/env node
// Renders the Zifidit promo (9:16) to out/promo.mp4.  Optional: --frames 0-200 to render a range.
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const i = process.argv.indexOf("--frames");
const frameRange = i > -1 ? process.argv[i + 1].split("-").map(Number) : null;
const browserExecutable = [process.env.REMOTION_BROWSER, "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell"].filter(Boolean).find((p) => existsSync(p)) ?? null;
mkdirSync(path.join(root, "out"), { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
const composition = await selectComposition({ serveUrl, id: "Promo", browserExecutable });
console.log(`Promo ${composition.width}x${composition.height}, ${(composition.durationInFrames / composition.fps).toFixed(1)}s`);
let last = -1;
await renderMedia({
  composition, serveUrl, codec: "h264", crf: 18, pixelFormat: "yuv420p", browserExecutable,
  outputLocation: path.join(root, "out", "promo.mp4"), frameRange: frameRange ?? undefined,
  onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; process.stdout.write(`${p * 10}% `); } },
});
console.log("\nDone: out/promo.mp4");
