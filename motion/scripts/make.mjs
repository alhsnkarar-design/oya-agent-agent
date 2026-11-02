#!/usr/bin/env node
// Sentence in, motion-graphics MP4 out.
//   npm run make -- "المونتاج الحلو *محدش* بياخد باله منه" --style build --ratio 9:16 --handle @haraka
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function args(argv) {
  const out = { sentence: "", style: "build", ratio: "9:16", handle: "", out: "" };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--style") out.style = argv[++i];
    else if (a === "--ratio") out.ratio = argv[++i];
    else if (a === "--handle") out.handle = argv[++i];
    else if (a === "--out") out.out = argv[++i];
    else rest.push(a);
  }
  out.sentence = rest.join(" ").trim();
  return out;
}

const opts = args(process.argv.slice(2));
if (!opts.sentence) {
  console.error('Usage: npm run make -- "الجملة" [--style build|punch|reveal] [--ratio 9:16|1:1|16:9] [--handle @name] [--out file.mp4]');
  process.exit(1);
}
if (!["build", "punch", "reveal"].includes(opts.style)) { console.error("--style must be build, punch or reveal"); process.exit(1); }
if (!["9:16", "1:1", "16:9"].includes(opts.ratio)) { console.error("--ratio must be 9:16, 1:1 or 16:9"); process.exit(1); }

// Use a locally installed Chrome when present (no download needed); otherwise Remotion fetches its own.
const candidates = [
  process.env.REMOTION_BROWSER,
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell",
].filter(Boolean);
const browserExecutable = candidates.find((p) => existsSync(p)) ?? null;

mkdirSync(path.join(root, "out"), { recursive: true });
const file = opts.out || path.join(root, "out", `${opts.style}-${opts.ratio.replace(":", "x")}-${Date.now()}.mp4`);

const inputProps = { sentence: opts.sentence, style: opts.style, ratio: opts.ratio, handle: opts.handle };
console.log("Bundling…");
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
const composition = await selectComposition({ serveUrl, id: "Kinetic", inputProps, browserExecutable });
console.log(`Rendering ${composition.width}x${composition.height}, ${(composition.durationInFrames / composition.fps).toFixed(1)}s…`);
let last = -1;
await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  outputLocation: file,
  inputProps,
  browserExecutable,
  crf: 18,
  pixelFormat: "yuv420p",
  onProgress: ({ progress }) => {
    const p = Math.floor(progress * 10);
    if (p !== last) { last = p; process.stdout.write(`${p * 10}% `); }
  },
});
console.log(`\nDone: ${file}`);
