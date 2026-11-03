// Projects real land (Natural Earth via world-atlas) and real cable routes into the 640×800 panel world, once.
import fs from 'fs'; import * as d3 from 'd3-geo'; import * as topo from 'topojson-client';
const out = process.argv[2];
const L110 = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-110m.json')), L50 = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-50m.json'));
const land110 = topo.feature(L110, L110.objects.land), land50 = topo.feature(L50, L50.objects.land);
const r1 = s => s.replace(/(\d+\.\d)\d+/g, '$1');
const P = {
  CAI: [31.24, 30.04], ALX: [29.92, 31.2], MRS: [5.37, 43.3], FRA: [8.68, 50.11], PAL: [13.36, 38.12],
};
// SEA-ME-WE 4 style route Alexandria → Palermo → Marseille (sea), then Marseille → Lyon → Frankfurt (land)
const SEA = [[29.92, 31.2], [27.5, 32.6], [23, 34.0], [18.5, 35.3], [15.2, 36.6], [13.36, 38.12], [10.6, 39.4], [7.9, 40.6], [6.6, 42.4], [5.37, 43.3]];
const LANDR = [[5.37, 43.3], [4.83, 45.76], [6.15, 46.8], [7.6, 48.6], [8.68, 50.11]];
const OTHER = [
  [[32.3, 31.27], [29, 33.4], [25.2, 34.5], [19.5, 36.3], [15.6, 37.3], [15.09, 37.5]],               // Port Said → Catania
  [[32.55, 29.95], [33.6, 28.2], [34.6, 26.6], [37.2, 22.5], [39.6, 19.0], [41.6, 15.6], [43.4, 12.6], [45.0, 12.2]], // Suez → Red Sea → Aden
  [[5.37, 43.3], [3.5, 41.6], [1.2, 39.6], [-1.5, 37.2], [-5.6, 35.95], [-9.5, 36.6]],               // Marseille → Gibraltar → Atlantic
  [[29.92, 31.2], [30.8, 33.5], [32.4, 34.7], [34.0, 35.3]],                                           // Alexandria → Cyprus
];
function pack(proj, land, sphere) {
  const g = d3.geoPath(proj), pt = p => proj(p).map(v => +v.toFixed(1));
  const line = a => { const s = []; for (let i = 0; i < a.length - 1; i++) { const n = 6; for (let k = 0; k < n; k++) { const q = d3.geoInterpolate(a[i], a[i + 1])(k / n); s.push(pt(q)); } } s.push(pt(a[a.length - 1])); return s; };
  const o = { land: r1(g(land)), pts: Object.fromEntries(Object.entries(P).map(([k, v]) => [k, pt(v)])), sea: line(SEA), landr: line(LANDR), other: OTHER.map(line) };
  if (sphere) o.sphere = r1(g({ type: 'Sphere' }));
  return o;
}
const globe = d3.geoOrthographic().rotate([-18, -36]).scale(340).translate([320, 430]).clipAngle(90).precision(0.3);
const med = d3.geoMercator().center([18, 40]).scale(1350).translate([320, 400]).clipExtent([[-500, -500], [1140, 1300]]);
const GEO = { globe: pack(globe, land110, true), med: pack(med, land50) };
// graticule for the globe rim
GEO.globe.grat = r1(d3.geoPath(globe)(d3.geoGraticule10()));
fs.writeFileSync(out, '  // real land (Natural Earth 1:110m / 1:50m via world-atlas) and real cable routes, projected once by refs/geo-make.mjs\n  var GEO = ' + JSON.stringify(GEO) + ';\n');
console.log('globe', GEO.globe.land.length, 'med', GEO.med.land.length);
