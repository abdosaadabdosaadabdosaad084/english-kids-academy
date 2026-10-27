// === English Kids Academy - Full Smart Board Connected ===
const AI_TEACHER_URL = "https://english-kids-teacher-84.abdosaadabdosaad084.workers.dev/";

let currentCase = 'capital';
let currentLetter = 'A';
let isDrawing = false;
let canvas, ctx;
let deferredPrompt;
const capitalList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const smallList = "abcdefghijklmnopqrstuvwxyz".split("");

window.onload = () => {
    initCanvas();
    if (typeof renderLettersBar === 'function') renderLettersBar();
    initHistoryNav();
    initPWAInstallPrompt();
    initSmartBoard(); // ربط السبورة
};

// === ربط السبورة الذكية ===
function initSmartBoard() {
    // نلاقي زرار "ابحث واشرح" ونربطه
    setTimeout(() => {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            if (btn.innerText.includes('ابحث واشرح')) {
                btn.onclick = searchAndExplain;
            }
            if (btn.innerText.includes('مسح السبورة')) {
                btn.onclick = clearBoard;
            }
            if (btn.innerText.includes('اقرأ الإجابة')) {
                btn.onclick = speakAnswer;
            }
            if (btn.innerText.includes('إيقاف الصوت')) {
                btn.onclick = () => speechSynthesis.cancel();
            }
        });
    }, 1000);
}

async function searchAndExplain() {
    const input = document.querySelector('input[placeholder*="اكتب"]') || document.querySelector('textarea') || document.querySelector('input[type="text"]');
    const question = input ? input.value.trim() : "";
    
    if (!question) {
        alert("اكتب سؤالك الأول يا بطل! 😊\nمثال: ما معنى Apple؟");
        return;
    }

    // نلاقي مكان عرض الإجابة
    let outputDiv = document.getElementById('boardResult');
    if (!outputDiv) {
        // ندور على الصندوق الأسود اللي فيه الطاقية 🎓
        outputDiv = document.querySelector('[class*="Smart Teacher"]')?.parentElement?.parentElement;
        if (!outputDiv) {
            outputDiv = document.querySelectorAll('div')[document.querySelectorAll('div').length - 10];
        }
    }
    const boardBox = document.querySelector('div:has(> div > span)') || document.getElementById('smartBoardBox');
    const target = document.querySelector('#boardView div:last-child') || outputDiv;

    // نعرض حالة تحميل
    if (target) {
        target.innerHTML = `
        <div style="padding:20px; text-align:center;">
            <div style="font-size:2rem;">🤔</div>
            <p style="color:#aaa; margin-top:10px;">المدرس الذكي بيفكر في: <b style="color:#fff;">${question}</b></p>
            <p style="color:#4DEAEA;">ثواني يا بطل...</p>
        </div>`;
    }

    try {
        const res = await fetch(AI_TEACHER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: question })
        });
        const data = await res.json();
        const answer = data.answer || "حاول مرة تانية يا بطل!";

        // اعرض الإجابة في السبورة
        const displayHTML = `
        <div style="background:rgba(255,255,255,0.06); padding:18px; border-radius:18px; border:1px solid rgba(255,255,255,0.1); text-align:right; direction:rtl; line-height:1.8; color:#fff;">
            <div style="color:#FFD700; font-weight:bold; margin-bottom:10px;">👨‍🏫 إجابة المدرس الذكي:</div>
            <div style="white-space:pre-wrap;">${answer}</div>
            <div style="margin-top:15px; display:flex; gap:8px; flex-wrap:wrap;">
                <button onclick="speak('${answer.replace(/'/g,"").substring(0,200)}')" style="background:#3b82f6; color:#fff; border:none; padding:8px 14px; border-radius:10px;">🔊 اسمع</button>
                <button onclick="clearBoard()" style="background:rgba(255,255,255,0.1); color:#fff; border:none; padding:8px 14px; border-radius:10px;">🧹 مسح</button>
            </div>
        </div>`;

        if (target) target.innerHTML = displayHTML;
        else alert(answer);
        
        playSound('success');
        speak(answer.substring(0,300));

    } catch (e) {
        console.error(e);
        if (target) target.innerHTML = `<p style="color:#ff6b6b; text-align:center;">😅 النت ضعيف، جرب تاني يا بطل!</p>`;
    }
}

function clearBoard() {
    const target = document.querySelector('#boardView div:last-child');
    if (target) {
        target.innerHTML = `<div style="text-align:center; padding:40px;"><div style="font-size:3rem;">🎓</div><p style="color:#888; margin-top:10px;">السبورة جاهزة</p></div>`;
    }
    const input = document.querySelector('input[placeholder*="اكتب"]');
    if (input) input.value = "";
    speechSynthesis.cancel();
}

function speakAnswer() {
    const target = document.querySelector('#boardView div:last-child');
    if (target) speak(target.innerText);
}

function speak(text) {
    if (!text) return;
    try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = /[ء-ي]/.test(text) ? 'ar-SA' : 'en-US';
        u.rate = 0.9;
        speechSynthesis.speak(u);
    } catch(e){}
}

// === باقي وظائف الموقع الأصلية ===
function initPWAInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; const b = document.getElementById('installBanner'); if(b) b.style.display='block'; });
}
function triggerPWAInstall() { if(deferredPrompt){ deferredPrompt.prompt(); deferredPrompt.userChoice.then(()=>{deferredPrompt=null;});} else { alert("للتثبيت: اضغط ⋮ ثم 'إضافة إلى الشاشة الرئيسية'"); } }
function initHistoryNav() {
    window.history.pushState({page:'home'},'');
    window.onpopstate = (e) => { showView(e.state?.page || 'home', false); };
}
function navigateTo(p){ window.history.pushState({page:p},''); showView(p,true); }
function openSection(p){ navigateTo(p); }
function showHome(){ navigateTo('home'); }
function showView(pageId){
    document.querySelectorAll('.view').forEach(v=>{ v.classList.remove('active-view'); v.style.display='none'; });
    const map = { home:'homeView', translator:'translatorView', board:'boardView', games:'gamesView' };
    const id = map[pageId] || 'detailsView';
    const el = document.getElementById(id);
    if(el){ el.classList.add('active-view'); el.style.display='block'; }
    if(pageId==='board') clearBoard();
    if(pageId==='games' && typeof startInfiniteKidsGame==='function') startInfiniteKidsGame();
    if(!map[pageId] && typeof openDetailedContent==='function'){ openDetailedContent(pageId); }
}
function playSound(type){
    try{
        const ac = new (window.AudioContext||window.webkitAudioContext)();
        let o=ac.createOscillator(), g=ac.createGain();
        o.type= type==='success'?'sine':'sawtooth';
        o.frequency.setValueAtTime(type==='success'?523:140,ac.currentTime);
        g.gain.setValueAtTime(0.1,ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.4);
        o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime+0.4);
    }catch(e){}
}
function initCanvas(){ canvas=document.getElementById('drawCanvas'); if(!canvas) return; ctx=canvas.getContext('2d'); }
function openDetailedContent(type){
    const details=document.getElementById('detailsContent'); if(!details) return;
    details.innerHTML=`<h2>📚 ${type}</h2><p>محتوى ${type} - سيتم تحميله قريباً...</p>`;
}
function getRandom(arr, exclude, count){ return arr.filter(x=>x!==exclude).sort(()=>0.5-Math.random()).slice(0,count); }
function renderInfOptions(opts){ const c=document.getElementById('gameOptions'); if(!c) return; c.innerHTML=''; opts.sort(()=>0.5-Math.random()).forEach(o=>{ const b=document.createElement('button'); b.innerText=o.text+' - '+o.sub; b.style.cssText='background:rgba(255,255,255,0.1); color:#fff; border:none; padding:12px; border-radius:12px; margin:5px;'; b.onclick=()=>{ if(o.val===window.infCorrectAnswer||o.text===window.infCorrectAnswer){ playSound('success'); b.style.background='#22c55e'; setTimeout(()=>startInfiniteKidsGame(),800);} else { b.style.background='#ef4444'; }}; c.appendChild(b);});}
function startInfiniteKidsGame(){ /* لعبة مبسطة */ }
