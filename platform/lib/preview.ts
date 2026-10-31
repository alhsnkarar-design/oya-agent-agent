import type { FileMap } from "./parse";
import { safePath } from "./parse";

/**
 * Turn a multi-file project into a single HTML document for the sandboxed preview iframe.
 * - inlines local CSS/JS
 * - injects a bridge that reports runtime errors and intercepts navigation between pages
 */

function resolve(from: string, ref: string): string | null {
  if (/^(https?:|data:|mailto:|tel:|#|\/\/)/i.test(ref)) return null;
  const dir = from.includes("/") ? from.slice(0, from.lastIndexOf("/") + 1) : "";
  const clean = ref.split(/[?#]/)[0];
  const parts: string[] = [];
  for (const seg of (dir + clean).split("/")) {
    if (seg === "..") parts.pop();
    else if (seg && seg !== ".") parts.push(seg);
  }
  return safePath(parts.join("/"));
}

const BRIDGE = `<script>
(function(){
  var send=function(m){try{parent.postMessage(Object.assign({source:'bannaa-preview'},m),'*')}catch(e){}};
  window.addEventListener('error',function(e){send({type:'error',message:String(e.message||'Error'),line:e.lineno||0})});
  window.addEventListener('unhandledrejection',function(e){send({type:'error',message:'Unhandled promise: '+String(e.reason&&e.reason.message||e.reason)})});
  var ce=console.error;console.error=function(){send({type:'error',message:Array.prototype.map.call(arguments,String).join(' ')});ce.apply(console,arguments)};
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;
    var h=a.getAttribute('href')||'';
    if(/^(https?:|mailto:|tel:|\\/\\/)/i.test(h)){e.preventDefault();window.open(h,'_blank','noopener');return}
    if(h.charAt(0)==='#'||h==='')return;
    e.preventDefault();send({type:'navigate',href:h});
  },true);
  window.addEventListener('submit',function(e){e.preventDefault();});
})();
</script>`;

export function buildPreview(files: FileMap, page = "index.html"): string {
  const html = files[page] ?? files["index.html"];
  if (html == null) {
    return `<!doctype html><html dir="rtl"><body style="font-family:system-ui;display:grid;place-items:center;height:100vh;color:#64748b">لا توجد صفحة لعرضها بعد</body></html>`;
  }
  let doc = html.replace(/<link\b[^>]*\bhref=["']([^"']+\.css)["'][^>]*>/gi, (tag, href: string) => {
    const p = resolve(page, href);
    return p && files[p] != null ? `<style data-file="${p}">\n${files[p]}\n</style>` : tag;
  });
  doc = doc.replace(/<script\b([^>]*)\bsrc=["']([^"']+\.js)["']([^>]*)>\s*<\/script>/gi, (tag, a: string, src: string, b: string) => {
    const p = resolve(page, src);
    if (!p || files[p] == null) return tag;
    const type = /type=["']module["']/i.test(a + b) ? ' type="module"' : "";
    return `<script${type} data-file="${p}">\n${files[p].replace(/<\/script/gi, "<\\/script")}\n</script>`;
  });
  return /<head[^>]*>/i.test(doc) ? doc.replace(/<head[^>]*>/i, (h) => h + BRIDGE) : BRIDGE + doc;
}

export function resolveNavigation(from: string, href: string): string | null {
  return resolve(from, href);
}

export function htmlPages(files: FileMap): string[] {
  return Object.keys(files)
    .filter((p) => p.endsWith(".html"))
    .sort((a, b) => (a === "index.html" ? -1 : b === "index.html" ? 1 : a.localeCompare(b)));
}
