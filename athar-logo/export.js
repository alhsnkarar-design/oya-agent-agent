// Export logo PNGs: node export.js A,B,C dark,light 1080 out/
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname;
const [concepts = 'A,B,C', modes = 'dark,light', size = '1080', outDir = 'out'] = process.argv.slice(2);
const server = http.createServer((q, s) => { const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!p.startsWith(ROOT) || !fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.ttf') ? 'font/ttf' : 'text/html' }); fs.createReadStream(p).pipe(s); });
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const b = await chromium.launch(), pg = await b.newPage();
  await pg.goto(`http://127.0.0.1:${server.address().port}/logo.html?render=1`); await pg.waitForFunction('window.READY === true');
  fs.mkdirSync(path.join(ROOT, outDir), { recursive: true });
  for (const k of concepts.split(',')) for (const m of modes.split(',')) {
    const d = await pg.evaluate(([k, s, m]) => drawLogo(k, s, m), [k, +size, m]);
    const f = path.join(ROOT, outDir, `athar_${k}_${m}_${size}.png`); fs.writeFileSync(f, Buffer.from(d.split(',')[1], 'base64')); console.log(f);
  }
  await b.close(); server.close();
})();
