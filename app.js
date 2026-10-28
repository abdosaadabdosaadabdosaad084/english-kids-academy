const API_BASE = "https://round-king-d129.mohamedelashri14.workers.dev";
let DB = JSON.parse(localStorage.getItem('pro_db')||'{}');
function saveDB(){ localStorage.setItem('pro_db', JSON.stringify(DB)); let el=document.getElementById('savedCount'); if(el) el.innerText=Object.keys(DB).length; renderHistory(); }
function renderHistory(){ let list=document.getElementById('historyList'); if(!list) return; list.innerHTML=Object.keys(DB).slice(-20).reverse().map(k=>`<div class="history-item" onclick="askBoard('${k.replace(/'/g,"")}')">${k}</div>`).join(''); }
saveDB();
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredPrompt=e; document.getElementById('installBtn').classList.add('show'); });
document.getElementById('installBtn').onclick = async ()=>{ if(deferredPrompt){ deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; document.getElementById('installBtn').classList.remove('show'); } };
history.pushState(null,null,location.href);
window.addEventListener('popstate',()=>{ switchTab('board'); history.pushState(null,null,location.href); });
function switchTab(t){
  document.querySelectorAll('.tab').forEach(el=>el.classList.remove('active'));
  document.getElementById('tab-'+t).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  let btn=document.querySelector(`[data-tab="${t}"]`); if(btn) btn.classList.add('active');
  if(t==='letters') renderLetters();
}
document.querySelectorAll('.nav-btn').forEach(b=> b.onclick = ()=> switchTab(b.dataset.tab));
const colors = [['#f43f5e','#fb7185'],['#8b5cf6','#a78bfa'],['#06b6d4','#22d3ee'],['#f59e0b','#fbbf24'],['#10b981','#34d399'],['#ec4899','#f472b6']];
function renderLetters(){
  let lg=document.getElementById('lettersGrid'); if(!lg || lg.childElementCount>0) return;
  let letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  lg.innerHTML=letters.map((l,i)=>{ let c=colors[i%colors.length]; return `<div style="--c1:${c[0]};--c2:${c[1]}" onclick="speakText('${l}')">${l}</div>`; }).join('');
  let ng=document.getElementById('numbersGrid'); let nums=[0,1,2,3,4,5,6,7,8,9,10]; let names=['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten'];
  ng.innerHTML=nums.map((n,i)=>{ let c=colors[i%colors.length]; return `<div style="--c1:${c[0]};--c2:${c[1]}" onclick="speakText('${names[i]} ${n}')"><div style="font-size:22px">${n}</div><small>${names[i]}</small></div>`; }).join('');
}
async function askBoard(q){
  if(!q){ q=document.getElementById('searchInput').value.trim(); }
  if(!q) return toast('اكتب سؤال أولا');
  document.getElementById('searchInput').value=q;
  let board=document.getElementById('boardContent'); let status=document.getElementById('teacherStatus');
  status.innerText='المعلم يفكر في: '+q+'...';
  if(DB[q]){ showOnBoard(q,DB[q]); status.innerText='من الذاكرة (بدون نت) - '+q; speakText(DB[q].replace(/<[^>]*>/g,' ').slice(0,120)); return; }
  board.innerHTML=`<div style="text-align:center;padding:40px"><div style="font-size:40px">🤔</div><p>أبحث عن <b>${q}</b>...</p><small>أجلب المعلومة ذاتيا</small></div>`;
  try{
    let result='';
    try{ let r=await fetch(API_BASE+'?q='+encodeURIComponent(q)); if(r.ok){ let j=await r.json(); if(j.answer) result=j.answer; } }catch(e){}
    if(!result){
      let lang=/[a-zA-Z]/.test(q)?'en|ar':'ar|en';
      let resp=await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=${lang}`);
      let data=await resp.json();
      if(data.responseData){
        let trans=data.responseData.translatedText;
        result=`<b>${q}</b> = ${trans}<br><br>⭐ مثال: ${q} is beautiful<br>🔊 النطق: ${trans}<br><br>💡 معلم: هذه الكلمة مهمة جدا، احفظها!`;
        if(/[a-zA-Z]/.test(q)){
          try{ let def=await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${q}`); if(def.ok){ let d=await def.json(); let m=d[0].meanings[0].definitions[0].definition; result=`<b>${q}</b> = ${trans}<br><br>📖 المعنى: ${m}<br><br>💡 مثال: I love ${q}`; } }catch(e){}
        }
      }
    }
    if(!result) result=`<b>${q}</b> تعني: Come here = تعالى هنا - تم حفظها بدون نت`;
    DB[q]=result; saveDB(); showOnBoard(q,result); status.innerText='المعلم شرح: '+q; speakText(result.replace(/<[^>]*>/g,' ').slice(0,150));
  }catch(err){ board.innerHTML=`<div style="color:#f87171">⚠️ لا يوجد نت</div>`; }
}
function showOnBoard(q, html){ document.getElementById('boardContent').innerHTML=`<div><div style="background:rgba(255,255,255,.06);padding:16px;border-radius:14px;border-right:4px solid #fde047"><div style="color:#fde047;font-weight:800;font-size:18px;margin-bottom:10px">📝 ${q}</div><div style="line-height:2">${html}</div></div></div>`; }
function clearBoard(){ document.getElementById('boardContent').innerHTML='<div class="welcome-msg"><h2>تم المسح 🧹</h2><p>اسأل سؤال جديد</p></div>'; }
function saveBoard(){ toast('تم الحفظ بدون نت 💾'); }
function speakBoard(){ speakText(document.getElementById('boardContent').innerText); }
document.getElementById('searchBtn').onclick=()=>askBoard();
let si=document.getElementById('searchInput'); if(si) si.addEventListener('keydown', e=>{ if(e.key==='Enter') askBoard(); });
let transTimer;
let ti=document.getElementById('transInput'); if(ti) ti.addEventListener('input', ()=>{ clearTimeout(transTimer); transTimer=setTimeout(()=>doTranslate(),600); });
async function doTranslate(){
  let text=document.getElementById('transInput').value.trim(); if(!text){ document.getElementById('transOutput').innerText='الترجمة ستظهر هنا...'; return; }
  let from=document.getElementById('fromLang').value; let to=document.getElementById('toLang').value;
  document.getElementById('transOutput').innerText='⏳ أترجم...';
  try{ let r=await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`); let d=await r.json(); document.getElementById('transOutput').innerText=d.responseData.translatedText||'...'; DB['trans_'+text]=d.responseData.translatedText; saveDB(); }catch(e){ document.getElementById('transOutput').innerText=DB['trans_'+text]||'لا يوجد نت'; }
}
let swapBtn=document.getElementById('swapBtn'); if(swapBtn) swapBtn.onclick=()=>{ let a=document.getElementById('fromLang'), b=document.getElementById('toLang'); let tmp=a.value; a.value=b.value; b.value=tmp; };
function copyTrans(){ navigator.clipboard.writeText(document.getElementById('transOutput').innerText); toast('تم النسخ 📋'); }
function speakTrans(which){ let t=which==='input'?document.getElementById('transInput').value:document.getElementById('transOutput').innerText; speakText(t); }
const QUIZ=[{q:'ما معنى تعالى؟',opts:['Come','Go','Eat'],a:0},{q:'ما معنى مكان؟',opts:['Place','Book','Water'],a:0},{q:'Cat تعني؟',opts:['قطة','كلب','بيت'],a:0},{q:'Apple لونها؟',opts:['Red','Blue','Black'],a:0},{q:'1+1 = ?',opts:['2','3','5'],a:0},{q:'Book تعني؟',opts:['كتاب','قلم','مدرسة'],a:0},{q:'Water تعني؟',opts:['ماء','نار','هواء'],a:0}];
function nextGame(){ let item=QUIZ[Math.floor(Math.random()*QUIZ.length)]; document.getElementById('gameQuestion').innerText=item.q; let box=document.getElementById('gameOptions'); box.innerHTML=item.opts.map((o,i)=>`<button onclick="checkAns(this,${i},${item.a})">${o}</button>`).join(''); }
function checkAns(btn,chosen,ans){
  let buttons=document.querySelectorAll('#gameOptions button'); buttons.forEach(b=>b.disabled=true);
  let correctEl=document.getElementById('correctCount'), wrongEl=document.getElementById('wrongCount'), scoreEl=document.getElementById('gameScore');
  let correct=parseInt(correctEl.innerText||0), wrong=parseInt(wrongEl.innerText||0), score=parseInt(scoreEl.innerText||0);
  if(chosen===ans){ btn.classList.add('correct'); correct++; score+=10; speakText('ممتاز صحيح'); }else{ btn.classList.add('wrong'); buttons[ans].classList.add('correct'); wrong++; speakText('خطأ'); }
  correctEl.innerText=correct; wrongEl.innerText=wrong; scoreEl.innerText=score; setTimeout(nextGame,1500);
}
nextGame();
function speakText(t){ if(!t) return; try{ speechSynthesis.cancel(); let clean=t.replace(/<[^>]*>/g,' ').substring(0,200); let u=new SpeechSynthesisUtterance(clean); u.lang=/[ء-ي]/.test(clean)?'ar-SA':'en-US'; u.rate=0.9; speechSynthesis.speak(u); }catch(e){} }
function toast(m){ let el=document.getElementById('toast'); el.innerText=m; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2500); }
let vb=document.getElementById('voiceBtn'); if(vb) vb.onclick=()=>{ let rec=new (window.SpeechRecognition||window.webkitSpeechRecognition)(); rec.lang='ar-SA'; rec.start(); rec.onresult=e=>{ document.getElementById('searchInput').value=e.results[0][0].transcript; askBoard(); }; };
function updateOnline(){ let d=document.getElementById('onlineDot'); if(d) d.className=navigator.onLine?'online-dot':'online-dot offline'; }
window.addEventListener('online',updateOnline); window.addEventListener('offline',updateOnline); updateOnline();
