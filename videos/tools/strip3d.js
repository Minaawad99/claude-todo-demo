// node strip3d.js <abs html> <out.png> <cols> <t...>  — like tools/strip.js but with software WebGL
const { chromium } = require('playwright'); const { execFileSync } = require('child_process'); const fs = require('fs'); const os = require('os'); const path = require('path');
(async () => { const [, , html, out, cols, ...ts] = process.argv;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  await p.goto('file://' + html); await p.waitForTimeout(2500);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'strip')); 
  for (let i = 0; i < ts.length; i++) { await p.evaluate(t => renderAt(t), +ts[i]); await p.screenshot({ path: path.join(dir, String(i).padStart(3, '0') + '.png') }); }
  await b.close();
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-i', path.join(dir, '%03d.png'), '-vf', `scale=240:-1,drawtext=text='%{n}':x=4:y=4:fontsize=14:fontcolor=yellow,tile=${cols}x${Math.ceil(ts.length / cols)}:padding=3:color=white`, '-frames:v', '1', out]);
  fs.rmSync(dir, { recursive: true }); })();
