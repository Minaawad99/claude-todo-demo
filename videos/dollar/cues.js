// Sound cues from the line timings: node cues.js → cues.json
// Synthesized effects only (audio/sfx.py); no recorded clip fits a market-and-money story better than these.
global.window = {}; eval(require('fs').readFileSync(__dirname + '/timing.js', 'utf8'));
const T = window.TIMING.lines, L = i => i >= T.length ? window.TIMING.duration : T[i].start, D = i => L(i + 1) - L(i), c = [];
const a = (t, fx, gain, dur) => c.push(Object.assign({ t: +t.toFixed(2), fx, gain }, dur ? { dur } : {}));
const coins = (t, n, g) => { for (let k = 0; k < n; k++) a(t + k * 0.12, 'clink', g * (k % 2 ? 0.8 : 1)); };
for (let i = 1; i < T.length; i++) a(L(i) - 0.08, 'whoosh', 0.3);
// 0: the phone buzzes with the same headline
a(L(0) + 0.2, 'notify', 0.6); a(L(0) + 1.2, 'beep', 0.3); a(L(0) + 1.6, 'pop', 0.6);
// 1: we earn in pounds
a(L(1) + 0.8, 'pop', 0.5); a(L(1) + 1.8, 'pop', 0.5); coins(L(1) + 0.3, 3, 0.3);
// 2: the seesaw tips
a(L(2) + 0.4, 'creak', 0.4); a(L(2) + 1.5, 'thud', 0.5); a(L(2) + 0.6, 'pop', 0.5); a(L(2) + 1.4, 'pop', 0.5);
// 3: brand
a(L(3) + 0.05, 'pop', 0.9); a(L(3) + 0.2, 'chime', 0.5);
// 4: the market stall and the queue
a(L(4) + 0.7, 'pop', 0.6); a(L(4) + 1.8, 'pop', 0.6); a(L(4) + 1.5, 'wind', 0.15, 2);
// 5: the price climbs every second
for (let k = 1; k < 4; k++) { a(L(5) + k, 'tick', 0.5); a(L(5) + k + 0.05, 'ping', 0.3); } a(L(5) + 1.2, 'pop', 0.6); coins(L(5) + 2.4, 4, 0.3);
// 6: the tomato turns into a dollar, the scale wobbles
a(L(6) + 0.5, 'spark', 0.3); a(L(6) + 1.2, 'pop', 0.6); a(L(6) + 2.1, 'creak', 0.35);
// 7: who are the customers?
a(L(7) + 0.3, 'pop', 0.6); coins(L(7) + 0.6, 3, 0.25);
// 8: the wheat ship comes in, the counter runs up to 13
a(L(8) + 0.1, 'waves', 0.3, D(8)); for (let k = 0; k < 13; k++) a(L(8) + 1 + k * 0.15, 'tick', 0.25); a(L(8) + 0.6, 'pop', 0.6); a(L(8) + 2.6, 'pop', 0.6); coins(L(8) + 3, 4, 0.3);
// 9: the imports pop up on the belt
a(L(9), 'motor', 0.2, D(9)); for (let k = 0; k < 5; k++) { a(L(9) + 0.3 + k * 0.6, 'pop', 0.5); a(L(9) + 0.35 + k * 0.6, 'clink', 0.25); }
// 10: a dollar inside the loaf
a(L(10) + 1.2, 'charge', 0.35); a(L(10) + 1.6, 'chime', 0.5); a(L(10) + 1.7, 'pop', 0.6);
// 11: where do dollars come from?
a(L(11) + 0.2, 'pop', 0.5); a(L(11) + 0.5, 'bump', 0.3);
// 12: the money flies home, the counter to 40
a(L(12), 'waves', 0.25, D(12)); for (let k = 0; k < 20; k++) a(L(12) + 1.4 + k * 0.12, 'tick', 0.2); a(L(12) + 0.6, 'pop', 0.6); a(L(12) + 3.6, 'pop', 0.6); a(L(12) + 3.8, 'chime', 0.4);
// 13: tourism, exports, the canal
a(L(13) + 0.2, 'jet', 0.25, 1.2); a(L(13) + 0.3, 'pop', 0.5); a(L(13) + 1.0, 'pop', 0.5); a(L(13) + 1.7, 'pop', 0.5); a(L(13) + 1.7, 'bell', 0.2);
// 14: the import bar grows, then the export bar
a(L(14) + 0.4, 'fill', 0.3, 1.6); a(L(14) + 2.4, 'fill', 0.3, 1.4); a(L(14) + 0.4, 'pop', 0.5); a(L(14) + 2.4, 'pop', 0.5);
// 15: back to the market
a(L(15) + 0.3, 'pop', 0.6); a(L(15) + 1.0, 'pop', 0.6); coins(L(15) + 0.5, 3, 0.25);
// 16: the Red Sea, the canal bar drops
a(L(16), 'waves', 0.3, D(16)); a(L(16) + 0.4, 'pop', 0.6); a(L(16) + 0.8, 'boom', 0.25); a(L(16) + 1.6, 'drop', 0.4);
// 17: the bank shuts, the black market
a(L(17) + 0.3, 'clank', 0.4); a(L(17) + 0.5, 'beep', 0.3); for (let k = 0; k < 4; k++) a(L(17) + 0.5 + k * 0.6, 'tick', 0.25); a(L(17) + 1.0, 'pop', 0.6);
// 18: the chain lets go, the dollar floats
a(L(18) + 0.6, 'pop', 0.5); a(L(18) + 1.4, 'snip', 0.5); a(L(18) + 1.5, 'clank', 0.4); a(L(18) + 1.6, 'wind', 0.25, 2.5); a(L(18) + 2.2, 'pop', 0.7);
// 19: 2016, the line jumps
a(L(19) + 0.2, 'pop', 0.6); a(L(19) + 1.6, 'spool', 0.35); a(L(19) + 2.4, 'boom', 0.3);
// 20: 2024, again
a(L(20) + 0.2, 'pop', 0.6); a(L(20) + 1.6, 'spool', 0.35); a(L(20) + 2.2, 'boom', 0.3);
// 21: Ras El Hekma, 35 billion
a(L(21), 'waves', 0.3, D(21)); a(L(21) + 0.6, 'pop', 0.6); for (let k = 0; k < 18; k++) a(L(21) + 1.4 + k * 0.13, 'tick', 0.2); a(L(21) + 3.8, 'chime', 0.5); a(L(21) + 2.8, 'pop', 0.5);
// 22: grow more tomatoes
for (let k = 0; k < 6; k++) a(L(22) + 0.3 + k * 0.25, 'plunk', 0.3); a(L(22) + 2.0, 'pop', 0.5); a(L(22) + 3.0, 'pop', 0.5); a(L(22) + 2.5, 'jet', 0.2, 1.5);
// 23: payoff, the market again
a(L(23) + 0.4, 'notify', 0.4); a(L(23) + 2.2, 'pop', 0.6); a(L(23) + 3.2, 'pop', 0.6); coins(L(23) + 1.0, 3, 0.25);
// 24: outro
a(L(24) + 0.4, 'pop', 0.8); a(L(24) + 0.6, 'chime', 0.5);
c.sort((x, y) => x.t - y.t);
require('fs').writeFileSync(__dirname + '/cues.json', JSON.stringify({ bed: false, cues: c }, null, 1)); console.log(c.length, 'cues');
