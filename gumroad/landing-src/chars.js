// يرسم شخصيات الحزمة كـSVG ثابت باستخدام نفس دوال الكرتون
global.window = { TIMING: { duration: 10, lines: [{ start: 0, end: 10 }] } };
const fs = require('fs');
eval(fs.readFileSync('/home/user/claude-todo-demo/gumroad/kit/eh-elhekaya-animation/engine/styles/cartoon/helpers.js', 'utf8') + `
const out = {
  point: person(70, 175, 0.4, { mood: 'happy', pose: 'point', s: 1.25, shirt: '#c4532c' }),
  cheer: person(70, 175, 0.4, { mood: 'happy', pose: 'cheer', s: 1.25, shirt: '#c4532c' }),
  think: person(70, 175, 0.4, { mood: 'curious', pose: 'think', s: 1.25, shirt: '#46698a' }),
  wave: person(70, 175, 0.4, { mood: 'happy', pose: 'wave', s: 1.25, shirt: '#6b7d3c' })
};
fs.writeFileSync('chars.json', JSON.stringify(out));`);
