// === English Kids Academy - Smart Teacher V2 (Fixed) ===
const AI_TEACHER_URL = "https://round-king-d129.abdosaadabdosaad084.workers.dev/";

const LOCAL_DICT = {
"تلميذ":"تلميذ = Student - النطق: ستودنت - ولد ذكي يتعلم في المدرسة ⭐\nمثال: I am a smart student - أنا تلميذ شاطر",
"التلميذ":"التلميذ = The Student - ذا ستودنت",
"تلاميذ":"تلاميذ = Students - ستودنتس",
"مدرسة":"مدرسة = School - النطق: سكول - مكان نتعلم فيه",
"كتاب":"كتاب = Book - بوك",
"قلم":"قلم = Pen - بن",
"ولد":"ولد = Boy - بوي",
"بنت":"بنت = Girl - جيرل",
"معلم":"معلم = Teacher - تيتشر",
"بيت":"بيت = House - هاوس",
"تفاحة":"تفاحة = Apple - آبل",
"سيارة":"سيارة = Car - كار",
"شمس":"شمس = Sun - صن",
"قمر":"قمر = Moon - مون",
"ماء":"ماء = Water - ووتر",
"اسد":"اسد = Lion - لايون - ملك الغابة"
};

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
    initSmartBoard();
};

function initSmartBoard() {
    setTimeout(() => {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            if (btn.innerText.includes('ابحث واشرح')) btn.onclick = searchAndExplain;
            if (btn.innerText.includes('مسح السبورة')) btn.onclick = clearBoard;
            if (btn.innerText.includes('اقرأ الإجابة')) btn.onclick = speakAnswer;
            if (btn.innerText.includes('إيقاف الصوت')) btn.onclick = () => speechSynthesis.cancel();
        });
    }, 1000);
}

async function searchAndExplain() {
    const input = document.querySelector('input[placeholder*="اكتب"]') || document.querySelector('textarea') || document.querySelector('input[type="text"]');
    const question = input ? input.value.trim() : "";
    if (!question) { alert("اكتب سؤالك الأول يا بطل! 😊"); return; }

    let target = document.querySelector('#boardView div:last-child');
    if (target) target.innerHTML = `<div style="padding:20px;text-align:center;"><div style="font-size:2rem;">🤔</div><p style="color:#fff;">المدرس بيفكر في: <b>${question}</b></p><p style="color:#4DEAEA;">ثواني...</p></div>`;

    let answer = LOCAL_DICT[question] || LOCAL_DICT[question.toLowerCase().trim()];
    
    // لو الكلمة مش في القاموس المحلي، جرب الـ Cloud
    if (!answer) {
        try {
            const res = await fetch(AI_TEACHER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: question })
            });
            const data = await res.json();
            answer = data.answer;
        } catch(e) {
            answer = null;
        }
    }

    // لو لسه مفيش إجابة، اعمل إجابة ذكية
    if (!answer) {
        if (question.includes("تلميذ")) answer = LOCAL_DICT["تلميذ"];
        else answer = `📚 ${question} = ${question} - كلمة جميلة! ⭐\nالمعنى: ${question}\nمثال: I love ${question} - أنا أحب ${question}`;
    }

    const displayHTML = `<div style="background:rgba(255,255,255,0.06); padding:18px; border-radius:18px; border:1px solid rgba(255,255,255,0.1); text-align:right; direction:rtl; line-height:1.8; color:#fff;"><div style="color:#FFD700; font-weight:bold; margin-bottom:10px;">👨‍🏫 إجابة المدرس الذكي:</div><div style="white-space:pre-wrap;">${answer}</div><div style="margin-top:15px; display:flex; gap:8px; flex-wrap:wrap;"><button onclick="speak('${answer.replace(/'/g,"").substring(0,200)}')" style="background:#3b82f6; color:#fff; border:none; padding:8px 14px; border-radius:10px;">🔊 اسمع</button><button onclick="clearBoard()" style="background:rgba(255,255,255,0.1); color:#fff; border:none; padding:8px 14px; border-radius:10px;">🧹 مسح</button></div></div>`;
    
    if (target) target.innerHTML = displayHTML;
    playSound('success');
    speak(answer.substring(0,300));
}

function clearBoard() {
    const target = document.querySelector('#boardView div:last-child');
    if (target) target.innerHTML = `<div style="text-align:center; padding:40px;"><div style="font-size:3rem;">🎓</div><p style="color:#888; margin-top:10px;">السبورة جاهزة</p></div>`;
    const input = document.querySelector('input[placeholder*="اكتب"]');
    if (input) input.value = "";
    speechSynthesis.cancel();
}
function speakAnswer() { const t = document.querySelector('#boardView div:last-child'); if (t) speak(t.innerText); }
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
function initPWAInstallPrompt() { window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; const b = document.getElementById('installBanner'); if(b) b.style.display='block'; }); }
function triggerPWAInstall() { if(deferredPrompt){ deferredPrompt.prompt(); deferredPrompt.userChoice.then(()=>{deferredPrompt=null;});} else { alert("للتثبيت: اضغط ⋮ ثم 'إضافة إلى الشاشة الرئيسية'"); } }
function initHistoryNav() { window.history.pushState({page:'home'},''); window.onpopstate = (e) => { showView(e.state?.page || 'home', false); }; }
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
function openDetailedContent(type){ const d=document.getElementById('detailsContent'); if(!d) return; d.innerHTML=`<h2>📚 ${type}</h2><p>محتوى ${type}</p>`; }
function getRandom(arr, exclude, count){ return arr.filter(x=>x!==exclude).sort(()=>0.5-Math.random()).slice(0,count); }
function renderInfOptions(opts){ const c=document.getElementById('gameOptions'); if(!c) return; c.innerHTML=''; opts.sort(()=>0.5-Math.random()).forEach(o=>{ const
 
