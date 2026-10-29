// Renders ad-rug.html frame by frame. Usage: node render.js <out_dir> [fps] [only=comma-separated seconds]
const { chromium } = require('playwright');
(async () => {
  const [out, fps = '30', only] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  await p.goto('file://' + __dirname + '/ad-rug.html');
  await p.evaluate(() => window.ready);
  const times = only ? only.split(',').map(Number) : Array.from({ length: Math.round(15 * fps) }, (_, i) => i / fps);
  for (let i = 0; i < times.length; i++) {
    await p.evaluate(t => window.render(t), times[i]);
    await p.locator('#c').screenshot({ path: `${out}/f${String(i).padStart(4, '0')}.${only ? 'png' : 'jpg'}`, type: only ? 'png' : 'jpeg', quality: only ? undefined : 92 });
  }
  await b.close();
})();
