const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  p.on('console', m => console.log('console:', m.text()));
  p.on('pageerror', e => console.log('err:', e.message));
  for (const mode of ['game','home']) {
    await p.goto('file:///home/user/oya-agent-agent/design/cargo-3d/scene.html?m=' + mode);
    await p.waitForFunction(() => window.DONE === true, null, { timeout: 60000 });
    const data = await p.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
    require('fs').writeFileSync(`/home/user/oya-agent-agent/design/cargo-3d/render-${mode}.png`, Buffer.from(data.split(',')[1], 'base64'));
  }
  await b.close();
})();
