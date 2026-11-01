// Bundles the in-browser preview runtime (React + react-native-web + Babel)
// into public/runtime so previews need no outside CDN.
import { build } from "esbuild";
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";

mkdirSync("public/runtime", { recursive: true });
writeFileSync(
  "scripts/.rt-entry.js",
  `import * as React from "react";
import * as ReactDOMClient from "react-dom/client";
import * as JSXRuntime from "react/jsx-runtime";
import * as RN from "react-native-web";
window.__RT = { React, ReactDOMClient, JSXRuntime, RN };`,
);
await build({
  entryPoints: ["scripts/.rt-entry.js"],
  bundle: true,
  minify: true,
  format: "iife",
  outfile: "public/runtime/rt.js",
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
});
copyFileSync("node_modules/@babel/standalone/babel.min.js", "public/runtime/babel.min.js");
console.log("preview runtime built");
