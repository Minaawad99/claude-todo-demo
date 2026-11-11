  function confetti(t, t0, n) {
    var u = t - t0; if (u < 0 || u > 3.2) return ""; var s = "", cols = ["#ff5a4e", "#ffd23f", "#4fc3f7", "#6ee07a", "#c77dff", "#ff9f1c"];
    for (var i = 0; i < (n || 70); i++) { var a = -1.57 + (hash(i) - .5) * 2.4, v = 260 + hash(i + 3) * 260, x = 180 + Math.cos(a) * v * u * .5 + Math.sin(u * 4 + i) * 10, y = 420 + Math.sin(a) * v * u + 260 * u * u;
      var r = u * 9 + i, w = 6 + hash(i + 7) * 5; s += '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(w * .45) + '" fill="' + cols[i % 6] + '" transform="rotate(' + f(r * 40) + ' ' + f(x) + ' ' + f(y) + ')" opacity="' + f(clamp(3.2 - u)) + '"/>'; }
    return s;
  }
  function tag(c, w2, text, t0, t, o) {
    o = o || {}; var u = t - t0, dur = o.dur || 2.4; if (u < 0 || u > dur) return "";
    var p = proj(c, w2[0], w2[1]), sc = pop(u) * clamp((dur - u) / .25), w = text.length * 8.6 + 26, col = o.red ? RED : (o.col || YEL);
    var x = Math.max(w / 2 + 8, Math.min(352 - w / 2, p[0])), y = Math.max(214, Math.min(600, p[1] - 22));
    return '<g transform="translate(' + f(x) + ' ' + f(y) + ') scale(' + f(sc) + ')"><path d="M0 22 l-6 -10 h12 z" fill="#1b1a1f" transform="translate(' + f(Math.max(-w / 2 + 12, Math.min(w / 2 - 12, p[0] - x))) + ' -2)"/><rect x="' + f(-w / 2) + '" y="-16" width="' + f(w) + '" height="30" rx="15" fill="#1b1a1f"/><text x="0" y="5" text-anchor="middle" class="tg" fill="' + col + '">' + text + '</text></g>';
  }
  function panelAt(y, k, inner, w, h) { return '<g transform="translate(180 ' + y + ') scale(' + f(pop(k)) + ')" opacity="' + f(clamp(k * 3)) + '"><rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="14" fill="#14232f" stroke="' + INK + '" stroke-width="2"/>' + inner + '</g>'; }
  function voteCard(t, ev) {
    var k = after(t, ev.vote, .45); if (k <= 0) return "";
    var s = '<rect width="360" height="640" fill="#0b1520" opacity="' + f(.6 * k) + '"/><g transform="translate(180 250) scale(' + f(pop(after(t, ev.vote, .9))) + ')">';
    s += '<rect x="-120" y="-122" width="240" height="64" rx="18" fill="#ff8c1a" stroke="' + INK + '" stroke-width="3"/><path d="M-20 -60 l14 18 l8 -18 z" fill="#ff8c1a" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M-22 -61 h26" stroke="#ff8c1a" stroke-width="5"/>';
    s += '<text x="0" y="-80" text-anchor="middle" class="hd" fill="#fff">اكتب فكرتك!</text><text x="0" y="-26" text-anchor="middle" class="sm" fill="#f1e6cf">الأكثر إعجابًا = الفيديو القادم</text>';
    var rows = [["مصعد", 214], ["فكرتك أنت!", 603], ["جسر معلّق", 361], ["قطار", 128]];
    for (var r = 0; r < 4; r++) { var y = 8 + r * 50, u = after(t, ev.vote + .25 + r * .18, .5), grow = after(t, ev.vote + 1, 3.5), n = Math.round(rows[r][1] * (1 + (r === 1 ? .65 : .12) * grow));
      s += '<g transform="translate(' + f((1 - ease(u)) * 260) + ' ' + y + ')"><rect x="-125" y="-19" width="250" height="40" rx="12" fill="#fff" stroke="' + INK + '" stroke-width="2.4"/><text x="102" y="7" text-anchor="end" class="tg" fill="' + INK + '">' + rows[r][0] + '</text>';
      s += '<rect x="-115" y="-11" width="62" height="24" rx="12" fill="#1b1a1f"/><text x="-70" y="6" text-anchor="end" class="sm" fill="#fff">' + n + '</text><path d="M-104 -1 a4 4 0 0 1 7 -3 a4 4 0 0 1 7 3 l-7 8 z" fill="' + RED + '"/></g>'; }
    for (var h = 0; h < 6; h++) { var hu = ((t - ev.vote) * .5 + h / 6) % 1; s += '<path transform="translate(' + f(-90 + h * 34 + Math.sin(t * 2 + h) * 8) + ' ' + f(230 - hu * 140) + ') scale(1.4)" d="M-4 -1 a4 4 0 0 1 7 -3 a4 4 0 0 1 7 3 l-7 8 z" fill="' + RED + '" opacity="' + f((1 - hu) * k) + '"/>'; }
    return s + '</g>';
  }
