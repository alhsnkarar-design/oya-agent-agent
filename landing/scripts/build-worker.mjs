// Writes deploy/index.html: the built page as one self-contained file for zifidit.com.
// The Worker (deploy/worker.js) serves this file from the public GitHub repo and handles
// POST /api/waitlist with the D1 binding DB. Run after `npm run build`:  npm run build:worker
// Then commit and push: the live site picks the new page up within about 5 minutes.
import { readFileSync, writeFileSync } from "node:fs";

let html = readFileSync("dist/index.html", "utf8");
// Fonts come from Google Fonts so the page is a single file.
html = html.replace(/@font-face\{[^}]*\}/g, "");
html = html.replace("<head>", '<head><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300..800&family=Readex+Pro:wght@300..700&display=swap">');
html = html.replaceAll('"Alexandria Variable", ', "").replaceAll('"Readex Pro Variable", ', "");
html = html.replace(/<meta property="og:image[^>]*>/g, "").replace("summary_large_image", "summary");
writeFileSync("deploy/index.html", html);
console.log(`deploy/index.html ${(html.length / 1024).toFixed(1)} KB`);
