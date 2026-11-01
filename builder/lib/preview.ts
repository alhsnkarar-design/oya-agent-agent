// Builds the HTML page that runs a project's React Native code in the
// browser: Babel compiles each file, a tiny module loader wires imports,
// react-native-web renders it. Errors are reported to the editor.

function escapeForScript(json: string) {
  return json.replace(/</g, "\\u003c").replace(/ /g, "\\u2028").replace(/ /g, "\\u2029");
}

export function previewHtml(files: Record<string, string>): string {
  const data = escapeForScript(JSON.stringify(files));
  return `<!DOCTYPE html>
<html lang="ar">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Preview</title>
<style>
  html, body, #root { height: 100%; margin: 0; }
  body { font-family: system-ui, -apple-system, "Segoe UI", Tahoma, sans-serif; background: #fff; }
  #root { display: flex; }
  .err { font: 13px/1.5 ui-monospace, Menlo, monospace; color: #b00020; background: #fff0f0; padding: 16px; white-space: pre-wrap; direction: ltr; overflow: auto; }
  .empty { margin: auto; color: #888; font: 15px system-ui; text-align: center; padding: 24px; }
</style>
<script src="/runtime/babel.min.js"></script>
<script src="/runtime/rt.js"></script>
</head>
<body>
<div id="root"></div>
<script id="files" type="application/json">${data}</script>
<script>
(function () {
  var files = JSON.parse(document.getElementById("files").textContent);
  var root = document.getElementById("root");
  function report(msg) {
    root.innerHTML = "";
    var pre = document.createElement("pre");
    pre.className = "err";
    pre.textContent = msg;
    root.appendChild(pre);
    try { parent.postMessage({ source: "bannaa-preview", type: "error", message: msg }, "*"); } catch (e) {}
  }
  window.addEventListener("error", function (e) { report(String(e.error && e.error.stack || e.message)); });
  window.addEventListener("unhandledrejection", function (e) { report(String(e.reason && e.reason.stack || e.reason)); });

  var entry = ["App.js", "App.jsx", "App.tsx", "App.ts"].filter(function (f) { return files[f] != null; })[0];
  if (!entry) { root.innerHTML = '<div class="empty">لا يوجد تطبيق بعد.<br/>اكتب وصفاً في المحادثة.</div>'; return; }

  var RT = window.__RT;
  function asModule(ns) { var m = Object.assign({ __esModule: true }, ns); if (!("default" in m)) m.default = ns; return m; }
  var builtins = {
    "react": asModule(RT.React),
    "react-native": asModule(RT.RN),
    "react-native-web": asModule(RT.RN),
    "expo-status-bar": asModule({ StatusBar: function () { return null; } })
  };
  var exts = ["", ".js", ".jsx", ".ts", ".tsx", "/index.js", "/index.tsx"];
  function resolve(from, spec) {
    var base = from.split("/").slice(0, -1);
    spec.split("/").forEach(function (part) {
      if (part === "..") base.pop(); else if (part !== ".") base.push(part);
    });
    var p = base.join("/");
    for (var i = 0; i < exts.length; i++) if (files[p + exts[i]] != null) return p + exts[i];
    throw new Error("Cannot find file '" + spec + "' imported from " + from);
  }
  var cache = {};
  function load(path) {
    if (cache[path]) return cache[path].exports;
    var out;
    try {
      out = Babel.transform(files[path], {
        filename: path,
        presets: [["env", { modules: "commonjs" }], "react", ["typescript", { allExtensions: true, isTSX: true }]]
      }).code;
    } catch (e) { throw new Error(path + ": " + e.message); }
    var module = { exports: {} };
    cache[path] = module;
    var require = function (spec) {
      if (builtins[spec]) return builtins[spec];
      if (spec.charAt(0) === ".") return load(resolve(path, spec));
      throw new Error("Package '" + spec + "' is not available in the preview (" + path + "). Use only react and react-native.");
    };
    new Function("require", "module", "exports", out)(require, module, module.exports);
    return module.exports;
  }
  try {
    var mod = load(entry);
    var App = mod.default || mod.App;
    if (typeof App !== "function") throw new Error(entry + " must default-export a component.");
    RT.RN.AppRegistry.registerComponent("main", function () { return App; });
    RT.RN.AppRegistry.runApplication("main", { rootTag: root });
    parent.postMessage({ source: "bannaa-preview", type: "ready" }, "*");
  } catch (e) { report(String(e && e.stack || e)); }
})();
</script>
</body>
</html>`;
}
