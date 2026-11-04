// node make_cover.js <frame.jpg> <out.jpg>
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = __dirname, [frame, out] = process.argv.slice(2);
const T = { '.html': 'text/html', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg' };
const srv = http.createServer((q, s) => { const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!p.startsWith(ROOT) || !fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': T[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(s); });
(async () => { await new Promise(r => srv.listen(0, '127.0.0.1', r)); const b = await chromium.launch(), pg = await b.newPage();
  await pg.goto(`http://127.0.0.1:${srv.address().port}/cover.html`); await pg.waitForFunction('window.READY === true');
  const d = await pg.evaluate(f => makeCover(f), frame); fs.writeFileSync(path.join(ROOT, out), Buffer.from(d.split(',')[1], 'base64'));
  await b.close(); srv.close(); console.log('written', out); })();
