const {chromium}=require('playwright');const {spawn}=require('child_process');
const [,,html,audio,out]=process.argv; const FPS=30;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:360,height:640},deviceScaleFactor:2});
await p.goto('file://'+html);await p.waitForTimeout(3000);
const end=await p.evaluate(()=>window.VIDEO_END)+2.3; const N=Math.ceil(end*FPS);
const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-i',audio,
 '-af','apad,afade=t=out:st='+(end-0.8)+':d=0.8','-map','0:v','-map','1:a','-t',String(N/FPS),
 '-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-vf','fade=t=out:st='+(end-0.6)+':d=0.6',
 '-c:a','aac','-b:a','160k','-movflags','+faststart',out],{stdio:['pipe','inherit','inherit']});
for(let i=0;i<N;i++){await p.evaluate(t=>renderAt(t),i/FPS);const buf=await p.screenshot({type:'jpeg',quality:95});
 if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); if(i%300===0) console.log('frame',i,'/',N);}
ff.stdin.end(); await new Promise(r=>ff.on('close',r)); console.log('done',N); await b.close();})();
