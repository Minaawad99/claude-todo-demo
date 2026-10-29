const WATER = '#9fdcff', POWER = '#ffb21e';
const ALL = [
  { key: 'intro', img: 'lake2', w: 1280, h: 853, dur: 6,
    from: { x: 640, y: 426, s: 1.0 }, to: { x: 560, y: 500, s: 1.3, ry: -4 },
    card: { title: 'رحلة الكهربا من السد العالي', sub: 'من ميّة النيل… لحد نور بيتك', at: .4 } },

  { key: 'lake', img: 'lake', w: 1280, h: 960, dur: 9, step: 1, title: 'بحيرة ناصر', volt: 'طاقة مخزّنة',
    from: { x: 640, y: 610, s: 1.05, rx: 5 }, to: { x: 720, y: 650, s: 1.3 },
    flows: [
      { d: 'M80 760 Q500 745 1200 770', color: '#d8f3ff', w: 2, dash: '40 60', speed: 50, from: 1 },
      { d: 'M40 850 Q600 830 1260 860', color: '#d8f3ff', w: 2, dash: '50 80', speed: 60, from: 1.4 }
    ],
    callouts: [{ at: [985, 662], label: [985, 540], text: 'بحيرة ناصر', sub: 'حوالي ١٦٢ مليار متر مكعب ميّة', time: 1.8 }],
    text: 'ورا السد العالي اتكوّنت بحيرة ناصر. ميّتها أعلى من النيل اللي بعد السد بحوالي ٧٠ متر، والميّة العالية دي فيها طاقة مخزّنة.' },

  { key: 'dam', img: 'dam1', w: 1280, h: 846, dur: 9, step: 2, title: 'السد العالي ومحطة الكهربا',
    from: { x: 640, y: 520, s: 1.0, ry: 5 }, to: { x: 700, y: 560, s: 1.2, ry: -3 },
    callouts: [
      { at: [1010, 700], label: [1060, 610], text: 'جسم السد', sub: 'طوله حوالي ٣٫٨ كم', time: 1.4 },
      { at: [850, 505], label: [850, 410], text: 'محطة توليد الكهربا', sub: '١٢ توربينة', time: 2.8 },
      { at: [300, 560], label: [300, 455], text: 'ساحة المحولات', time: 4.2 }
    ],
    text: 'تحت السد فيه محطة الكهربا. الميّة بتعدّي في ٦ أنفاق جوه جسم السد، وكل نفق بيوصّل الميّة لتوربينتين.' },

  { key: 'outlets', img: 'plant1', w: 1280, h: 853, dur: 8, step: 3, title: 'الميّة بتلف التوربينات',
    from: { x: 900, y: 430, s: 1.15 }, to: { x: 780, y: 470, s: 1.4, ry: -4 },
    flows: [
      { d: 'M965 400 Q900 480 760 530 L420 552', color: WATER, w: 6, speed: 160, from: .8 },
      { d: 'M1040 400 Q1000 490 820 545 L520 560', color: WATER, w: 6, speed: 160, from: 1.1 }
    ],
    callouts: [{ at: [1000, 365], label: [1000, 255], text: 'هنا الميّة بتطلع من التوربينات', time: 2 }],
    text: 'الميّة نازلة بقوة من البحيرة بتخبط في ريش التوربينات فتلفها، وبعدها بتطلع من هنا وتكمّل في مجرى النيل.' },

  { key: 'runner', img: 'runner', w: 1280, h: 853, dur: 8, step: 3, title: 'التوربينة',
    from: { x: 700, y: 430, s: 1.0, ry: -7 }, to: { x: 720, y: 420, s: 1.22, ry: 5 },
    flows: [
      { d: 'M60 230 Q300 230 450 330', color: WATER, w: 7, speed: 170, from: .6 },
      { d: 'M60 470 Q280 450 430 450', color: WATER, w: 7, speed: 170, from: .9 },
      { d: 'M1075 250 A 350 330 -15 0 1 960 690', color: '#ffffff', w: 5, dash: '26 22', speed: 140, from: 1.6 }
    ],
    callouts: [{ at: [740, 230], label: [380, 210], text: 'عجلة توربينة فرانسيس', sub: 'نفس نوع توربينات السد العالي', time: 2.2 }],
    text: 'دي عجلة توربينة حقيقية من نفس النوع. الميّة بتدخل بين الريش فتلف العجلة، والعجلة متوصلة بعمود طويل بالمولّد.' },

  { key: 'generator', w: 1280, h: 720, dur: 9, step: 4, title: 'المولّد', volt: 'حوالي ١٥ كيلو فولت',
    from: { x: 640, y: 360, s: 1, ry: -10, rx: 6 }, to: { x: 640, y: 360, s: 1.06, ry: 8, rx: 2 },
    build(svg, el) {
      const bg = el('defs', {}, svg);
      const g = el('radialGradient', { id: 'gbg', cx: '50%', cy: '45%', r: '70%' }, bg);
      el('stop', { offset: 0, 'stop-color': '#1d3346' }, g); el('stop', { offset: 1, 'stop-color': '#070c11' }, g);
      const cu = el('linearGradient', { id: 'cu', x1: 0, y1: 0, x2: 1, y2: 1 }, bg);
      el('stop', { offset: 0, 'stop-color': '#f2a15a' }, cu); el('stop', { offset: 1, 'stop-color': '#8a4a1c' }, cu);
      el('rect', { width: 1280, height: 720, fill: 'url(#gbg)' }, svg);
      const cx = 430, cy = 320;
      el('circle', { cx, cy, r: 230, fill: '#2a3b4a', stroke: '#5b7184', 'stroke-width': 6 }, svg);
      el('circle', { cx, cy, r: 170, fill: '#0f1922' }, svg);
      for (let i = 0; i < 12; i++) {
        const a = i * 30;
        const c = el('g', { transform: `rotate(${a} ${cx} ${cy})` }, svg);
        el('rect', { x: cx - 26, y: cy - 222, width: 52, height: 46, rx: 8, fill: 'url(#cu)', stroke: '#5a2c0c', 'stroke-width': 2 }, c);
        for (let k = 0; k < 4; k++) el('line', { x1: cx - 26, x2: cx + 26, y1: cy - 214 + k * 10, y2: cy - 214 + k * 10, stroke: '#6e3814', 'stroke-width': 2 }, c);
      }
      const mag = el('g', { id: 'magnet' }, svg);
      el('rect', { x: cx - 40, y: cy - 150, width: 80, height: 150, rx: 10, fill: '#d64541' }, mag);
      el('rect', { x: cx - 40, y: cy, width: 80, height: 150, rx: 10, fill: '#2f7fd6' }, mag);
      const n = el('text', { x: cx, y: cy - 95, 'text-anchor': 'middle', fill: '#fff', 'font-size': 44, 'font-weight': 700, 'font-family': 'sans-serif' }, mag); n.textContent = 'N';
      const s = el('text', { x: cx, y: cy + 120, 'text-anchor': 'middle', fill: '#fff', 'font-size': 44, 'font-weight': 700, 'font-family': 'sans-serif' }, mag); s.textContent = 'S';
      el('circle', { cx, cy, r: 16, fill: '#c9d3db' }, svg);
      const lab = (x, y, t, size = 26, fill = '#fff') => { const e = el('text', { x, y, 'text-anchor': 'middle', fill, 'font-size': size, 'font-weight': 700, 'font-family': 'IBM Plex Sans Arabic' }, svg); e.textContent = t; };
      lab(cx, 62, 'مغناطيس بيلف وسط ملفات نحاس');
      // wave panel
      el('rect', { x: 760, y: 90, width: 440, height: 240, rx: 16, fill: 'rgba(255,255,255,.05)', stroke: 'rgba(255,255,255,.18)' }, svg);
      el('line', { x1: 780, x2: 1180, y1: 210, y2: 210, stroke: 'rgba(255,255,255,.25)', 'stroke-dasharray': '6 6' }, svg);
      el('path', { id: 'wave', d: '', fill: 'none', stroke: POWER, 'stroke-width': 5, filter: 'url(#glow-generator)' }, svg);
      lab(980, 372, 'تيار متردد: ٥٠ مرة في الثانية', 24, '#ffd37a');
      // bulb
      el('circle', { id: 'bulbglow', cx: 980, cy: 470, r: 60, fill: '#ffd37a', opacity: 0, filter: 'url(#glow-generator)' }, svg);
      el('path', { d: 'M950 470 a30 30 0 1 1 60 0 c0 18 -14 24 -14 40 h-32 c0 -16 -14 -22 -14 -40z', fill: '#fff6d6', stroke: '#c9b37a', 'stroke-width': 3 }, svg);
      el('rect', { x: 962, y: 512, width: 36, height: 22, rx: 4, fill: '#8a95a0' }, svg);
      el('path', { d: `M${cx + 230} ${cy} C 700 ${cy}, 720 480, 950 485`, fill: 'none', stroke: '#8a95a0', 'stroke-width': 4 }, svg);
    },
    flows: [{ d: 'M660 320 C 700 320, 720 480, 950 485', color: POWER, w: 5, speed: 160, from: 2.5 }],
    tick(t, svg) {
      const ang = t * 200;
      svg.querySelector('#magnet').setAttribute('transform', `rotate(${ang.toFixed(1)} 430 320)`);
      let d = '';
      for (let x = 0; x <= 400; x += 4) {
        const ph = (ang * Math.PI / 180) - x / 40;
        d += (x ? 'L' : 'M') + (780 + x) + ' ' + (210 - Math.sin(ph) * 90 * Math.min(1, t / 1.5)).toFixed(1);
      }
      svg.querySelector('#wave').setAttribute('d', d);
      svg.querySelector('#bulbglow').setAttribute('opacity', (Math.min(1, Math.max(0, (t - 3) / 1)) * .8).toFixed(2));
    },
    text: 'جوه المولّد مغناطيس ضخم بيلف وسط ملفات نحاس. كل ما المغناطيس يلف، بيتولّد تيار كهربي في الملفات. كده الحركة اتحوّلت لكهربا.' },

  { key: 'stepup', img: 'plant1', w: 1280, h: 853, dur: 9, step: 5, title: 'رفع الجهد', volt: 'لحد ٥٠٠ كيلو فولت',
    from: { x: 260, y: 640, s: 1.6, ry: 4 }, to: { x: 330, y: 560, s: 1.3, ry: -3 },
    flows: [
      { d: 'M40 750 L55 480 L120 385', color: POWER, w: 5, speed: 150, from: .8 },
      { d: 'M215 755 L225 520 L300 470 L360 455', color: POWER, w: 5, speed: 150, from: 1.0 },
      { d: 'M125 745 L140 440 L250 420 L440 445', color: POWER, w: 5, speed: 150, from: 1.2 }
    ],
    callouts: [{ at: [60, 740], label: [330, 640], text: 'المحوّلات الرافعة', sub: 'بتعلّي الجهد جدًا', time: 1.8 }],
    text: 'الكهربا بتطلع من المولدات على المحوّلات الرافعة. بتعلّي الجهد لحد ٥٠٠ ألف فولت، عشان الكهربا تمشي مسافات طويلة من غير ما يضيع منها كتير.' },

  { key: 'lines', img: 'dam2', w: 1280, h: 849, dur: 10, step: 6, title: 'خطوط الضغط العالي', volt: '٥٠٠ كيلو فولت',
    from: { x: 700, y: 480, s: 1.05, ry: 4 }, to: { x: 820, y: 320, s: 1.3, ry: -3 },
    flows: [
      { d: 'M590 560 Q660 480 740 430 Q840 280 928 150', color: POWER, w: 5, speed: 170, from: .8 },
      { d: 'M300 640 Q340 420 385 100', color: POWER, w: 5, speed: 170, from: 1.0 },
      { d: 'M1150 345 Q1110 250 1080 130', color: POWER, w: 5, speed: 170, from: 1.2 },
      { d: 'M960 360 Q950 250 990 130', color: POWER, w: 5, speed: 170, from: 1.4 }
    ],
    callouts: [{ at: [928, 150], label: [760, 250], text: 'خطوط الضغط العالي طالعة من السد', time: 1.6 }],
    overlay: 'map',
    text: 'أبراج الضغط العالي بتشيل الكهربا حوالي ٨٠٠ كيلومتر على طول وادي النيل، من أسوان لحد القاهرة والدلتا، ومتوصلة بالشبكة القومية.' },

  { key: 'pylons', img: 'pylon1', w: 1280, h: 960, dur: 8, step: 6, title: 'في الطريق للقاهرة', volt: '٥٠٠ / ٢٢٠ كيلو فولت',
    from: { x: 640, y: 480, s: 1.0, ry: -4 }, to: { x: 640, y: 420, s: 1.2, ry: 4 },
    text: 'الكهربا بتوصل لحد القاهرة في حوالي ٣ أجزاء من الألف من الثانية، لأنها بتمشي في السلك بسرعة قريبة من سرعة الضوء.' },

  { key: 'sub', img: 'dam1', w: 1280, h: 846, dur: 8, step: 7, title: 'محطة المحولات', volt: 'من ٥٠٠ إلى ٦٦ أو ٢٢ ك.ف',
    from: { x: 330, y: 600, s: 1.9, ry: 5 }, to: { x: 400, y: 580, s: 1.5, ry: -3 },
    flows: [
      { d: 'M110 525 L330 525', color: POWER, w: 5, speed: 150, from: .8 },
      { d: 'M400 532 L640 532 L775 512', color: POWER, w: 5, speed: 150, from: 1 }
    ],
    callouts: [{ at: [270, 640], label: [470, 450], text: 'محوّلات خافضة', sub: 'بتنزّل الجهد خطوة بخطوة', time: 1.8 }],
    text: 'قبل ما الكهربا تدخل أي مدينة بتعدّي على محطة محولات زي دي. هنا المحوّلات الخافضة بتنزّل الجهد خطوة بخطوة.' },

  { key: 'street', w: 1280, h: 900, dur: 12, step: 8, title: 'الحي والبيت', volt: '٣٨٠ / ٢٢٠ فولت',
    from: { x: 700, y: 470, s: 1.07, ry: -9, rx: 4 }, to: { x: 760, y: 470, s: 1.15, ry: 7 },
    build(svg, el) {
      const d = el('defs', {}, svg);
      const sky = el('linearGradient', { id: 'nsky', x1: 0, y1: 0, x2: 0, y2: 1 }, d);
      el('stop', { offset: 0, 'stop-color': '#060d18' }, sky); el('stop', { offset: 1, 'stop-color': '#1d3552' }, sky);
      el('rect', { width: 1280, height: 900, fill: 'url(#nsky)' }, svg);
      for (let i = 0; i < 40; i++) el('circle', { cx: (i * 337) % 1280, cy: (i * 151) % 260, r: i % 3 ? 1.2 : 2, fill: '#cfe3ff', opacity: .7 }, svg);
      el('circle', { cx: 180, cy: 110, r: 34, fill: '#f3f0e2' }, svg);
      el('rect', { y: 560, width: 1280, height: 340, fill: '#24262c' }, svg);
      el('rect', { y: 556, width: 1280, height: 8, fill: '#3a3d45' }, svg);
      const blds = [[560, 220, 200, '#c8b796'], [790, 300, 170, '#b9a487'], [990, 180, 210, '#d0c2a4']];
      const wins = [];
      blds.forEach(([x, top, w, col], bi) => {
        el('rect', { x, y: top, width: w, height: 560 - top, fill: col, stroke: '#4a4236', 'stroke-width': 2 }, svg);
        el('rect', { x: x - 6, y: top - 10, width: w + 12, height: 12, fill: '#6b5d4a' }, svg);
        for (let r = 0; top + 30 + r * 58 < 500; r++) for (let c = 0; c < 3; c++) {
          const wx = x + 22 + c * ((w - 44) / 3) + 4, wy = top + 30 + r * 58;
          const wr = el('rect', { x: wx, y: wy, width: (w - 44) / 3 - 8, height: 34, fill: '#2b3440', stroke: '#4a4236', 'stroke-width': 2 }, svg);
          wins.push({ el: wr, at: 4 + bi * .6 + ((r * 7 + c * 3 + bi * 5) % 11) * .12 });
        }
        el('rect', { x: x + w / 2 - 16, y: 510, width: 32, height: 50, fill: '#3b3128' }, svg);
        el('rect', { x: x + 10, y: 515, width: 26, height: 30, rx: 3, fill: '#e9ecef', stroke: '#555', 'stroke-width': 2 }, svg);
      });
      svg.wins = wins;
      // kiosk transformer
      el('rect', { x: 320, y: 450, width: 140, height: 110, rx: 4, fill: '#2f6b4f', stroke: '#1d4533', 'stroke-width': 3 }, svg);
      for (let i = 0; i < 6; i++) el('line', { x1: 335, x2: 445, y1: 470 + i * 9, y2: 470 + i * 9, stroke: '#1d4533', 'stroke-width': 3 }, svg);
      el('polygon', { points: '390,515 372,545 408,545', fill: '#ffd400', stroke: '#222', 'stroke-width': 2 }, svg);
      const bolt = el('text', { x: 390, y: 542, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: '#222', 'font-family': 'sans-serif' }, svg); bolt.textContent = '!';
      // underground cables
      [['M0 610 L320 610', '#8a95a0'], ['M460 600 L583 600 L583 545', '#8a95a0'], ['M460 615 L813 615 L813 545', '#8a95a0'], ['M460 630 L1013 630 L1013 545', '#8a95a0']]
        .forEach(([p, c]) => el('path', { d: p, stroke: c, 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '2 6', opacity: .6 }, svg));
    },
    flows: [
      { d: 'M0 610 L320 610', color: '#f0b93a', w: 6, speed: 160, from: .6 },
      { d: 'M460 600 L583 600 L583 545', color: '#ff9a3a', w: 5, speed: 110, from: 2.2 },
      { d: 'M460 615 L813 615 L813 545', color: '#ff9a3a', w: 5, speed: 110, from: 2.6 },
      { d: 'M460 630 L1013 630 L1013 545', color: '#ff9a3a', w: 5, speed: 110, from: 3 }
    ],
    callouts: [
      { at: [390, 450], label: [300, 330], text: 'كشك الكهربا', sub: 'محوّل الحي', time: 1.4 },
      { at: [583, 530], label: [690, 330], text: 'العداد', sub: 'بيحسب استهلاك كل شقة', time: 3.4 }
    ],
    tick(t, svg) {
      for (const w of svg.wins) {
        const on = t > w.at;
        w.el.setAttribute('fill', on ? '#ffd27a' : '#2b3440');
        w.el.setAttribute('filter', on ? 'url(#glow-street)' : '');
      }
    },
    text: 'الكهربا بتوصل لكشك الكهربا اللي في الحي، وده بينزّل الجهد لـ ٢٢٠ فولت. ومنه كابلات تحت الأرض لكل عمارة، تعدّي على العداد وبعدين البريزة… والبيت ينوّر!' },

  { key: 'outro', img: 'lake2', w: 1280, h: 853, dur: 6,
    from: { x: 560, y: 500, s: 1.3, ry: -4 }, to: { x: 640, y: 426, s: 1.0 },
    card: { title: 'من ميّة النيل… لنور بيتك', sub: 'السد العالي · أسوان', at: .5 } },

  { key: 'credits', w: 1280, h: 720, dur: 6, credits: true, overlap: 0,
    from: { x: 640, y: 360, s: 1 }, to: { x: 640, y: 360, s: 1 } }
];
const SCENES = ALL.filter(s => !s.img || HAVE.includes(s.img));
