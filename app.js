const API_BASE = "https://round-king-d129.mohamedelashri14.workers.dev";
let DB = JSON.parse(localStorage.getItem('pro_db')||'{}');
let lastTranslation = "";

function saveDB(){ localStorage.setItem('pro_db', JSON.stringify(DB)); }
saveDB();

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredPrompt=e; document.getElementById('installBtn').classList.add('show'); });
document.getElementById('installBtn').onclick = async ()=>{ if(deferredPrompt){ deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; document.getElementById('installBtn').classList.remove('show'); } };

const colors = [['#f43f5e','#fb7185'],['#8b5cf6','#a78bfa'],['#06b6d4','#22d3ee'],['#f59e0b','#fbbf24'],['#10b981','#34d399'],['#ec4899','#f472b6']];

function renderLetters(){
  let lg=document.getElementById('lettersGrid'); 
  let letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  lg.innerHTML=letters.map((l,i)=>{ let c=colors[i%colors.length]; return `<div style="--c1:${c[0]};--c2:${c[1]}" onclick="speakText('${l}')">${l}</div>`; }).join('');
  let ng=document.getElementById('numbersGrid'); 
  let nums=['0','1','2','3','4','5','6','7','8','9','10']; 
  ng.innerHTML=nums.map((n,i)=>{ let c=colors[i%colors.length]; return `<div style="--c1:${c[0]};--c2:${c[1]}" onclick="speakText('${n}')">${n}</div>`; }).join('');
}
renderLetters();

async function askBoard(q){
  if(!q){ q=document.getElementById('searchInput').value.trim(); }
  if(!q) return toast('اكتب سؤال أولا');
  document.getElementById('searchInput').value=q;
  let board=document.getElementById('boardContent'); 
  let status=document.getElementById('teacherStatus');
  status.innerText='يفكر في: '+q+'...';
  
  if(DB[q] && DB[q].html){ 
    showOnBoard(q, DB[q].html); 
    lastTranslation = DB[q].speak;
    status.innerText='من الذاكرة - '+q; 
    return; 
  }
  
  board.innerHTML=`<div style="text-align:center;padding:30px">🤔<br>أبحث عن <b>${q}</b>...</div>`;
  try{
    let resultHTML='';
    let speakOnly='';
    
    try{ 
      let r=await fetch(API_BASE+'?q='+encodeURIComponent(q)); 
      if(r.ok){ let j=await r.json(); if(j.answer){ resultHTML=j.answer; speakOnly=q; } } 
    }catch(e){}

    if(!resultHTML){
      let lang=/[a-zA-Z]/.test(q)?'en|ar':'ar|en';
      let resp=await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=${lang}`);
      let data=await resp.json();
      if(data.responseData){
        let trans=data.responseData.translatedText;
        resultHTML=`<b>${q}</b> = ${trans}<br><br>⭐ مثال: ${q}<br>🔊 النطق: ${trans}`;
        speakOnly=`${q} يساوي ${trans}`;
      }
    }
    
    if(!resultHTML){ resultHTML=`<b>${q}</b> = ${q}`; speakOnly=q; }
    
    lastTranslation = speakOnly;
    DB[q]={html:resultHTML, speak:speakOnly};
    saveDB(); 
    showOnBoard(q,resultHTML); 
    status.innerText='تم الشرح: '+q;
  }catch(err){ board.innerHTML=`<div style="color:#f87171">⚠️ لا يوجد نت</div>`; }
}

function showOnBoard(q, html){ 
  document.getElementById('boardContent').innerHTML=`<div style="background:rgba(255,255,255,.06);padding:14px;border-radius:14px;border-right:4px solid #fde047"><div style="color:#fde047;font-weight:800;margin-bottom:8px">📝 ${q}</div><div style="line-height:2">${html}</div></div>`; 
}
function clearBoard(){ document.getElementById('boardContent').innerHTML='<div class="welcome-msg"><h3>تم المسح 🧹</h3></div>'; lastTranslation=""; }
function speakBoard(){ 
  if(lastTranslation){ speakText(lastTranslation); } 
  else { toast('لا يوجد ترجمة'); }
}

document.getElementById('searchBtn').onclick=()=>askBoard();
document.getElementById('searchInput').addEventListener('keydown', e=>{ if(e.key==='Enter') askBoard(); });

async function doTranslate(){
  let text=document.getElementById('transInput').value.trim(); 
  if(!text){ document.getElementById('transOutput').innerText='الترجمة ستظهر هنا...'; return; }
  let from=document.getElementById('fromLang').value; let to=document.getElementById('toLang').value;
  document.getElementById('transOutput').innerText='⏳ أترجم...';
  try{ 
    let r=await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`); 
    let d=await r.json(); 
    document.getElementById('transOutput').innerText=d.responseData.translatedText||'...'; 
  }catch(e){ document.getElementById('transOutput').innerText='لا يوجد نت'; }
}
let ti=document.getElementById('transInput'); 
if(ti) ti.addEventListener('input', ()=>{ clearTimeout(window.transTimer); window.transTimer=setTimeout(()=>doTranslate(),600); });
document.getElementById('swapBtn').onclick=()=>{ let a=document.getElementById('fromLang'), b=document.getElementById('toLang'); let tmp=a.value; a.value=b.value; b.value=tmp; };

const QUIZ=[{q:'ما معنى تعالى؟',opts:['Come','Go','Eat'],a:0},{q:'مكان؟',opts:['Place','Book','Water'],a:0},{q:'Cat؟',opts:['قطة','كلب','بيت'],a:0},{q:'Apple؟',opts:['تفاحة','كتاب','ماء'],a:0},{q:'Book؟',opts:['كتاب','قلم','مدرسة'],a:0}];
function nextGame(){ let item=QUIZ[Math.floor(Math.random()*QUIZ.length)]; document.getElementById('gameQuestion').innerText=item.q; let box=document.getElementById('gameOptions'); box.innerHTML=item.opts.map((o,i)=>`<button onclick="checkAns(this,${i},${item.a})">${o}</button>`).join(''); }
function checkAns(btn,chosen,ans){
  let buttons=document.querySelectorAll('#gameOptions button'); buttons.forEach(b=>b.disabled=true);
  let correctEl=document.getElementById('correctCount'), wrongEl=document.getElementById('wrongCount'), scoreEl=document.getElementById('gameScore');
  let correct=parseInt(correctEl.innerText||0), wrong=parseInt(wrongEl.innerText||0), score=parseInt(scoreEl.innerText||0);
  if(chosen===ans){ btn.classList.add('correct'); correct++; score+=10; speakText('ممتاز'); }else{ btn.classList.add('wrong'); buttons[ans].classList.add('correct'); wrong++; speakText('خطأ'); }
  correctEl.innerText=correct; wrongEl.innerText=wrong; scoreEl.innerText=score; setTimeout(nextGame,1200);
}
nextGame();

function speakText(t){ if(!t) return; try{ speechSynthesis.cancel(); let clean=t.replace(/<[^>]*>/g,' ').substring(0,180); let u=new SpeechSynthesisUtterance(clean); u.lang=/[ء-ي]/.test(clean)?'ar-SA':'en-US'; u.rate=0.9; speechSynthesis.speak(u); }catch(e){} }
function toast(m){ let el=document.getElementById('toast'); el.innerText=m; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2500); }
document.getElementById('voiceBtn').onclick=()=>{ let rec=new (window.SpeechRecognition||window.webkitSpeechRecognition)(); rec.lang='ar-SA'; rec.start(); rec.onresult=e=>{ document.getElementById('searchInput').value=e.results[0][0].transcript; askBoard(); }; };
