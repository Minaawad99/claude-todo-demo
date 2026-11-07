// every 0.1 s of a diagram/cartoon build, in node: no thrown errors and no NaN/undefined/Infinity in the SVG
// node nancheck.js <episode dir> <build dir name, e.g. diagram>
const fs = require('fs'), vm = require('vm'), path = require('path');
const base = path.resolve(process.argv[2]), build = process.argv[3] || 'diagram';
const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(base + '/timing.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync(base + '/' + build + '/scenes.js', 'utf8'), ctx);
const D = ctx.TIMING.duration; let bad = 0, n = 0;
for (let t = 0; t < D; t += 0.1) {
  const svg = { innerHTML: '' };
  try { ctx.__panel(svg, t); } catch (e) { bad++; if (bad < 5) console.log('ERR', t.toFixed(2), e.message); continue; }
  n++; const m = svg.innerHTML.match(/.{0,50}(NaN|undefined|Infinity).{0,20}/); if (m) { bad++; if (bad < 8) console.log('BAD', t.toFixed(2), m[0]); }
}
for (const [name, fn] of [['intro', s => ctx.__intro && ctx.__intro(s, 1.0)], ['outro', s => ctx.__outro && ctx.__outro(s, 1.0, 1.0)]]) {
  const s = { innerHTML: '', style: {} }; try { fn(s); if (/NaN|undefined/.test(s.innerHTML)) { bad++; console.log(name, 'bad'); } } catch (e) { bad++; console.log(name, e.message); }
}
console.log('frames', n, 'bad', bad, 'duration', D); process.exit(bad ? 1 : 0);
