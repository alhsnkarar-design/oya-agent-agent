// Render index.html to MP4 frame-by-frame (deterministic, parallel workers).
// usage: node render.js                 -> full video  (out/musa.mp4)
//        node render.js --stills 3,15,40 -> PNG stills  (out/still_*.png)
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { spawn, execFileSync } = require('child_process');

const ROOT = __dirname, OUT = path.join(ROOT, 'out');
fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const WORKERS = +(process.env.WORKERS || 4);

const MIME = { '.html': 'text/html', '.ttf': 'font/ttf', '.wav': 'audio/wav', '.js': 'text/javascript' };
const server = http.createServer((q, s) => {
  const p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(s);
});

async function openPage(browser, port) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await page.goto(`http://127.0.0.1:${port}/${process.env.PAGE || 'index.html'}?render=1`);
  await page.waitForFunction('window.READY === true', null, { timeout: 60000 });
  return page;
}

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const browser = await chromium.launch({ args: ['--disable-gpu-vsync', '--force-color-profile=srgb'] });

  if (args[0] === '--stills') {
    const page = await openPage(browser, port);
    for (const t of args[1].split(',').map(Number)) {
      const data = await page.evaluate(t => window.frameJPEG(t, .9), t);
      fs.writeFileSync(path.join(OUT, `still_${String(t).padStart(5, '0')}.jpg`), Buffer.from(data.split(',')[1], 'base64'));
      console.log('still', t);
    }
    await browser.close(); server.close(); return;
  }

  const meta = await (await openPage(browser, port)).evaluate(() => ({ DUR: window.DUR, FPS: window.FPS }));
  const total = Math.round(meta.DUR * meta.FPS), per = Math.ceil(total / WORKERS);
  const t0 = Date.now(); let done = 0;
  const segs = await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
    const a = w * per, b = Math.min(total, a + per), seg = path.join(OUT, `seg_${w}.mp4`);
    const page = await openPage(browser, port);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(meta.FPS), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p', '-tune', 'film', seg], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = a; i < b; i++) {
      const data = await page.evaluate(t => window.frameJPEG(t, .94), i / meta.FPS);
      const ok = ff.stdin.write(Buffer.from(data.split(',')[1], 'base64'));
      if (!ok) await new Promise(r => ff.stdin.once('drain', r));
      if (++done % 150 === 0) console.log(`frames ${done}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
    return seg;
  }));
  await browser.close(); server.close();

  const list = path.join(OUT, 'segs.txt');
  fs.writeFileSync(list, segs.map(s => `file '${s}'`).join('\n'));
  const video = path.join(OUT, 'video_only.mp4');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', video]);
  const wav = path.join(ROOT, process.env.WAV || 'soundtrack.wav'), final = path.join(ROOT, 'video', (process.env.OUTNAME || 'muflis.mp4'));
  if (fs.existsSync(wav)) execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', video, '-i', wav, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final]);
  else fs.copyFileSync(video, final);
  segs.forEach(s => fs.unlinkSync(s)); fs.unlinkSync(list); fs.unlinkSync(video);
  console.log('DONE', final, ((Date.now() - t0) / 1000).toFixed(0) + 's');
})();
