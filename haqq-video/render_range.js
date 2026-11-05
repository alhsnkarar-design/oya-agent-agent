// Re-render one frame range into a segment file (parallel), e.g.:
// FROM=635 TO=1270 SEG=out/seg_1.mp4 PAGE=voice.html node render_range.js
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { spawn, execFileSync } = require('child_process');
const ROOT = __dirname, FROM = +process.env.FROM, TO = +process.env.TO, SEG = path.join(ROOT, process.env.SEG), PAGE = process.env.PAGE || 'index.html', N = +(process.env.WORKERS || 4);
const MIME = { '.html': 'text/html', '.ttf': 'font/ttf', '.png': 'image/png', '.js': 'text/javascript', '.wav': 'audio/wav' };
const srv = http.createServer((q, s) => {
  const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(s);
});
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const b = await chromium.launch(), per = Math.ceil((TO - FROM) / N), parts = [];
  await Promise.all(Array.from({ length: N }, async (_, w) => {
    const a = FROM + w * per, e = Math.min(TO, a + per), out = `${SEG}.part${w}.mp4`; parts[w] = out;
    const pg = await b.newPage();
    await pg.goto(`http://127.0.0.1:${srv.address().port}/${PAGE}?render=1`); await pg.waitForFunction('window.READY === true');
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-tune', 'film', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = a; i < e; i++) {
      const d = await pg.evaluate(t => window.frameJPEG(t, .94), i / 30);
      if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }));
  await b.close(); srv.close();
  const list = `${SEG}.txt`; fs.writeFileSync(list, parts.map(p => `file '${p}'`).join('\n'));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', SEG]);
  parts.forEach(p => fs.unlinkSync(p)); fs.unlinkSync(list); console.log('segment done', SEG);
})();
