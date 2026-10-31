// cover.js <projectDir>: renders out/cover.jpg from <projectDir>/cover.json
// cover.json: {"bg":"path/to/intro_cover_bg.jpg","cardTop":230,"kicker":"…","title":"line1<br>line2","tiles":[["img_key","label",-5],["img_key","label",0],["img_key","label",5]],"pill":"…"}
// cardTop: 230 for intro 1, 90 for intro 2, 960 (card under the pointing finger) for intro 3
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const P=path.resolve(process.argv[2]);const C=JSON.parse(fs.readFileSync(P+'/cover.json'));
const F=path.resolve(__dirname,'../fonts');const f=u=>'file://'+(u.startsWith('/')?u:P+'/'+u);
const low=C.cardTop>500;
const tile=([img,label,rot])=>`<div class="tile" style="transform:rotate(${rot}deg)"><img src="${f('img/'+img+'.jpg')}"><span>${label}</span></div>`;
const html=`<html><head><meta charset="utf-8"><style>
@font-face{font-family:Almarai;src:url('file://${F}/Almarai-ExtraBold.ttf');font-weight:800 1000}@font-face{font-family:Almarai;src:url('file://${F}/Almarai-Bold.ttf');font-weight:100 799}
*{margin:0;box-sizing:border-box}html{overflow:hidden}
body{width:1080px;height:1920px;position:relative;font-family:Almarai,'Noto Color Emoji',sans-serif;background:#000}
.bg{position:absolute;inset:0;background:url('${f(C.bg)}') center/cover}
.sh{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,0) 30%,rgba(0,0,0,0) 55%,rgba(0,0,0,.85) 100%)}
.card{direction:rtl;position:absolute;top:${C.cardTop}px;left:50%;transform:translateX(-50%);width:940px;background:#fff;border-radius:40px;padding:34px 40px 40px;text-align:center;box-shadow:0 16px 50px rgba(0,0,0,.5)}
.k{font-weight:800;font-size:46px;color:#d62828}.t{font-weight:1000;font-size:96px;line-height:1.2;color:#111}
.row{position:absolute;top:${low?1430:1240}px;left:0;right:0;display:flex;justify-content:center;gap:26px}
.tile{width:310px;height:310px;border-radius:28px;border:8px solid #fff;overflow:hidden;position:relative;box-shadow:0 14px 40px rgba(0,0,0,.6);background:#222}
.tile img{width:100%;height:100%;object-fit:cover}
.tile span{white-space:nowrap;position:absolute;bottom:10px;left:50%;transform:translateX(-50%);background:#ffd60a;color:#111;font-weight:900;font-size:44px;padding:0 22px;border-radius:14px}
.pill{direction:rtl;position:absolute;top:${low?1790:1615}px;left:50%;transform:translateX(-50%);background:#d62828;color:#fff;font-weight:900;font-size:54px;padding:8px 46px;border-radius:60px;white-space:nowrap}
</style></head><body><div class="bg"></div><div class="sh"></div>
<div class="card"><div class="k">${C.kicker}</div><div class="t">${C.title}</div></div>
<div class="row">${C.tiles.map(tile).join('')}</div><div class="pill">${C.pill}</div></body></html>`;
(async()=>{fs.mkdirSync(P+'/out',{recursive:true});fs.writeFileSync(P+'/cover.html',html);const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+P+'/cover.html',{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:P+'/out/cover.jpg',type:'jpeg',quality:92});await b.close()})();
