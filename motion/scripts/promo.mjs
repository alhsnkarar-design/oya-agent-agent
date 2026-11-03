#!/usr/bin/env node
// Renders a 9:16 reel. Default: the Zifidit promo to out/promo.mp4.
// Options: --id Ep0 (composition, output out/ep0.mp4) · --frames 0-200 (range only).
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const idArg = process.argv.indexOf("--id");
const id = idArg > -1 ? process.argv[idArg + 1] : "Promo";
const outFile = `${id.toLowerCase()}.mp4`;
const i = process.argv.indexOf("--frames");
const frameRange = i > -1 ? process.argv[i + 1].split("-").map(Number) : null;
const browserExecutable = [process.env.REMOTION_BROWSER, "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell"].filter(Boolean).find((p) => existsSync(p)) ?? null;
mkdirSync(path.join(root, "out"), { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
const composition = await selectComposition({ serveUrl, id, browserExecutable });
console.log(`${id} ${composition.width}x${composition.height}, ${(composition.durationInFrames / composition.fps).toFixed(1)}s`);
let last = -1;
await renderMedia({
  composition, serveUrl, codec: "h264", crf: 18, pixelFormat: "yuv420p", browserExecutable,
  outputLocation: path.join(root, "out", outFile), frameRange: frameRange ?? undefined,
  onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; process.stdout.write(`${p * 10}% `); } },
});
console.log(`\nDone: out/${outFile}`);
