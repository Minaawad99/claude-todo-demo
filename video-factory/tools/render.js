// render.js <projectDir> [idPrefix]: renders slides from <projectDir>/$SLIDES (default slides.json) to <projectDir>/$OUTDIR (default out/slides); hook slide -> out/hook_overlay_transparent.png. Env HOOKTOP=card top px for hook (170 intro1, 235 intro2, 990 intro3).
const {chromium}=require('playwright');const fs=require('fs');
const P=process.argv[2];const only=process.argv[3];const slides=JSON.parse(fs.readFileSync(P+'/'+(process.env.SLIDES||'slides.json')));
const f=u=>'file://'+P+'/'+u;
function html(s,transparent){
 const imgs=s.imgs||[];const big=s.hook||s.cta;const bg=imgs.length?f('img/'+imgs[0][0]+'.jpg'):'';
 const boxH=imgs.length>1?640:1100;
 const figs=imgs.map(([k,t])=>`<div class="box"><div class="fig"><img src="${f('img/'+k+'.jpg')}" style="max-height:${boxH}px">${t&&!s.cta?`<span class="tag">${t}</span>`:''}</div></div>`).join('');
 return `<html><head><meta charset="utf-8"><style>
@font-face{font-family:Almarai;src:url('${'file://'+require('path').resolve(__dirname,'../fonts/Almarai-ExtraBold.ttf')}');font-weight:800 1000}@font-face{font-family:Almarai;src:url('${'file://'+require('path').resolve(__dirname,'../fonts/Almarai-Bold.ttf')}');font-weight:100 799}
*{margin:0;box-sizing:border-box}html{overflow:hidden}
body{width:1080px;height:1920px;overflow:hidden;position:relative;font-family:Almarai,'Noto Color Emoji',sans-serif;background:${transparent?'transparent':'#111'}}
.bg{position:absolute;inset:0;background:url('${bg}') center/cover;filter:blur(40px) brightness(.6);transform:scale(1.15)}
.pair{position:absolute;top:${big?720:500}px;left:0;right:0;bottom:50px;display:flex;flex-direction:column;justify-content:center;gap:34px}
.box{display:flex;justify-content:center}
.fig{position:relative;display:inline-block}
.fig img{display:block;max-width:1000px;border:6px solid #fff;border-radius:20px;box-shadow:0 18px 50px rgba(0,0,0,.6)}
.tag{direction:rtl;white-space:nowrap;position:absolute;bottom:14px;right:14px;background:#ffd60a;color:#111;font-weight:900;font-size:34px;line-height:1.5;padding:2px 18px;border-radius:12px;box-shadow:0 4px 14px rgba(0,0,0,.4)}
.card{direction:rtl;position:absolute;left:50%;transform:translateX(-50%);top:${s.hook?(process.env.HOOKTOP||110):(big?250:190)}px;${s.hook&&process.env.HOOKLEFT?'left:'+process.env.HOOKLEFT+'px;':''};width:${big?900:1010}px;background:#fff;border-radius:34px;padding:${big?'40px 50px':'28px 36px 34px'};text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.35)}
.t{font-weight:900;color:#111;font-size:${big?78:50}px;line-height:1.35}
.b{font-weight:700;color:#222;font-size:${s.cta?42:38}px;line-height:1.55;margin-top:12px}
</style></head><body>${transparent||!bg?'':`<div class="bg"></div><div class="pair">${figs}</div>`}
<div class="card"><div class="t">${s.title}</div>${s.body?`<div class="b">${s.body}</div>`:''}</div></body></html>`}
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
const OD=process.env.OUTDIR||'out/slides';fs.mkdirSync(P+'/'+OD,{recursive:true});
for(const s of slides){ if(only&&!s.id.startsWith(only))continue;
 const tr=!!s.hook; fs.writeFileSync(P+'/tmp.html',html(s,tr));await p.goto(f('tmp.html'),{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);
 await p.evaluate(()=>{for(const im of document.querySelectorAll('.fig img')){const mh=parseFloat(im.style.maxHeight)||1100;const k=Math.min(1000/im.naturalWidth,mh/im.naturalHeight);im.style.width=Math.round(im.naturalWidth*k)+'px';im.style.height=Math.round(im.naturalHeight*k)+'px';im.style.maxWidth='none';im.style.maxHeight='none';}});
 const info=await p.evaluate(()=>{const b=document.querySelector('.b');const c=document.querySelector('.card');const tags=[...document.querySelectorAll('.tag')].map(t=>t.offsetHeight>60?'TAGWRAP':'');return {L:b?Math.round(b.offsetHeight/parseFloat(getComputedStyle(b).lineHeight)):0,bottom:c.offsetTop+c.offsetHeight,tags:tags.join('')}});
 console.log(s.id,JSON.stringify(info));
 await p.screenshot({path:P+(tr?'/out/hook_overlay_transparent.png':'/'+OD+'/'+s.id+'.png'),omitBackground:tr});}
await b.close()})();
