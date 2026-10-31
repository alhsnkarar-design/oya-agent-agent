import { test } from "node:test";
import assert from "node:assert/strict";
import { applyChanges, parseOutput, safePath } from "../lib/parse.ts";

const OUT = `=== PLAN ===
سأبني موقعاً
=== FILE: index.html ===
<html>
=== not a marker ===
</html>
=== END FILE ===
=== FILE: css/style.css ===
\`\`\`css
body{}
\`\`\`
=== END FILE ===
=== DELETE: old.html ===
=== NOTES ===
تم`;

test("parses plan, files, deletes and notes", () => {
  const p = parseOutput(OUT);
  assert.equal(p.plan, "سأبني موقعاً");
  assert.equal(p.notes, "تم");
  assert.equal(p.files["index.html"], "<html>\n=== not a marker ===\n</html>\n");
  assert.equal(p.files["css/style.css"], "body{}\n");
  assert.deepEqual(p.deleted, ["old.html"]);
  assert.equal(p.writing, null);
});

test("reports the file being streamed", () => {
  const p = parseOutput("=== PLAN ===\nx\n=== FILE: js/app.js ===\nconsole.log(1)");
  assert.equal(p.writing, "js/app.js");
  assert.equal(p.writingContent, "console.log(1)");
  assert.deepEqual(p.files, {});
});

test("tolerates a missing END FILE", () => {
  const p = parseOutput("=== FILE: a.html ===\nA\n=== FILE: b.html ===\nB\n=== END FILE ===");
  assert.deepEqual(Object.keys(p.files).sort(), ["a.html", "b.html"]);
});

test("rejects path traversal and keeps dotfiles", () => {
  assert.equal(safePath("../etc/passwd"), null);
  assert.equal(safePath("/abs/x.js"), "abs/x.js");
  assert.equal(safePath(".env.example"), ".env.example");
  assert.deepEqual(parseOutput("=== FILE: ../x ===\nx\n=== END FILE ===").files, {});
});

test("applyChanges merges and deletes", () => {
  const next = applyChanges({ "a.html": "1", "old.html": "x" }, parseOutput(OUT));
  assert.deepEqual(Object.keys(next).sort(), ["a.html", "css/style.css", "index.html"]);
});
