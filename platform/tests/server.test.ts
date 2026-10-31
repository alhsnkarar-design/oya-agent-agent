import { test } from "node:test";
import assert from "node:assert/strict";
import { parseProjectBody, validId, validSlug } from "../lib/server/validate.ts";
import { buildPreview } from "../lib/preview.ts";

const PNG = "data:image/png;base64,iVBORw0KGgo=";

test("slug rules", () => {
  for (const ok of ["my-site", "abc", "a1-b2"]) assert.ok(validSlug(ok), ok);
  for (const bad of ["ab", "-abc", "abc-", "My-Site", "a b", "api", "admin", "x".repeat(41), "مطعم"]) assert.ok(!validSlug(bad), bad);
});

test("project ids", () => {
  assert.ok(validId("abc123xyz"));
  assert.ok(!validId("../etc"));
  assert.ok(!validId("abc-123"));
});

test("project body validation", () => {
  const ok = parseProjectBody({ name: " My site ", files: { "index.html": "<h1>" }, assets: { "assets/a.png": PNG }, versions: Array(30).fill({}) });
  assert.ok(typeof ok !== "string");
  if (typeof ok !== "string") {
    assert.equal(ok.name, "My site");
    assert.equal(ok.data.versions.length, 10);
  }
  assert.match(parseProjectBody({ files: { a: 1 } }) as string, /Invalid files/);
  assert.match(parseProjectBody({ files: {}, assets: { "x.png": PNG } }) as string, /Invalid asset/);
  assert.match(parseProjectBody({ files: {}, assets: { "assets/x.html": "data:text/html;base64,PHNjcmlwdD4=" } }) as string, /Invalid asset/);
  assert.match(parseProjectBody({ files: { "a.html": "x".repeat(6_100_000) } }) as string, /6MB/);
});

test("preview inlines css, js and assets and injects the bridge", () => {
  const html = buildPreview(
    {
      "index.html": '<html><head><link rel="stylesheet" href="css/s.css"></head><body><img src="./assets/logo.png"><script src="js/a.js"></script></body></html>',
      "css/s.css": "body{background:url(../assets/logo.png)}",
      "js/a.js": "console.log('</script>')",
    },
    "index.html",
    { "assets/logo.png": PNG },
  );
  assert.ok(html.includes('<style data-file="css/s.css">'));
  assert.ok(html.includes(`url(${PNG})`));
  assert.ok(html.includes(`src="${PNG}"`));
  assert.ok(html.includes("<\\/script"), "inline script must not close early");
  assert.ok(html.includes("bannaa-preview"));
});
