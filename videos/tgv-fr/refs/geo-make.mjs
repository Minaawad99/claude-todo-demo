// Projects real France (Natural Earth 1:50m via world-atlas countries-50m) and the LGV Paris → Marseille route into the
// 640×800 panel world, once. Run from a folder with d3-geo, topojson-client and world-atlas installed:
//   node geo-make.mjs <out geo.js>
import fs from 'fs'; import * as d3 from 'd3-geo'; import * as topo from 'topojson-client';
const C = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json'));
const all = topo.feature(C, C.objects.countries).features, fr = all.find(f => f.properties.name === 'France');
// metropolitan France only (drop overseas polygons)
const metro = { type: 'Feature', geometry: { type: 'MultiPolygon', coordinates: fr.geometry.coordinates.filter(p => { const [x, y] = p[0][0]; return x > -6 && x < 10 && y > 41 && y < 52; }) } };
const near = all.filter(f => ['Spain', 'Italy', 'Switzerland', 'Germany', 'Belgium', 'Luxembourg', 'United Kingdom', 'Andorra', 'Monaco'].includes(f.properties.name));
const proj = d3.geoConicConformal().parallels([44, 49]).rotate([-2.5, 0]).fitExtent([[120, 110], [520, 690]], metro);
const g = d3.geoPath(proj), r1 = s => s.replace(/(\d+\.\d)\d+/g, '$1'), pt = p => proj(p).map(v => +v.toFixed(1));
const P = { PAR: [2.35, 48.86], LYS: [4.85, 45.76], MRS: [5.37, 43.3] };
const LGV = [[2.35, 48.86], [2.9, 48.3], [4.45, 46.77], [4.75, 46.29], [5.08, 45.72], [4.97, 44.99], [4.79, 43.92], [5.32, 43.45], [5.37, 43.3]];
const line = a => { const s = []; for (let i = 0; i < a.length - 1; i++) for (let k = 0; k < 6; k++) s.push(pt(d3.geoInterpolate(a[i], a[i + 1])(k / 6))); s.push(pt(a[a.length - 1])); return s; };
const GEO = { fr: r1(g(metro)), near: r1(near.map(f => g(f)).join('')), pts: Object.fromEntries(Object.entries(P).map(([k, v]) => [k, pt(v)])), lgv: line(LGV) };
fs.writeFileSync(process.argv[2], '  // real France (Natural Earth 1:50m via world-atlas) and the LGV Paris → Marseille route, projected once by refs/geo-make.mjs\n  var GEO = ' + JSON.stringify(GEO) + ';\n');
console.log('fr', GEO.fr.length, GEO.pts);
