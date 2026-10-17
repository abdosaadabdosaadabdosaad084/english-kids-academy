// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log(err));
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    let b = document.getElementById('install-banner');
    if(b) b.style.display = 'flex';
});
function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                document.getElementById('install-banner').style.display = 'none';
            }
            deferredPrompt = null;
        });
    }
}

// PIN
const DEFAULT_PIN = "1234";
function getSavedPin() { return localStorage.getItem('app_pin') || DEFAULT_PIN; }
function checkPin() {
    const input = document.getElementById('pin-input').value;
    if (input === getSavedPin()) {
        document.getElementById('pin-overlay').style.display = 'none';
    } else {
        document.getElementById('pin-error').style.display = 'block';
    }
}
function changePin() {
    const newPin = document.getElementById('new-pin-input').value.trim();
    const msg = document.getElementById('change-pin-msg');
    if (newPin.length >= 4) {
        localStorage.setItem('app_pin', newPin);
        msg.style.color = "#22c55e"; msg.innerText = "✅ تم التغيير!";
    } else { msg.style.color = "#ef4444"; msg.innerText = "❌ لازم 4 ارقام"; }
}

// Speech
function speak(text, lang = 'en-US') {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang; u.rate = 0.85;
        window.speechSynthesis.speak(u);
    }
}

let currentLetterCode = 65;
let currentPoints = parseInt(localStorage.getItem('user_points') || '0');
setTimeout(()=>{ let p=document.getElementById('points-display'); if(p) p.innerText = `⭐ ${currentPoints} نقطة`; }, 500);
function addPoints(pts) {
    currentPoints += pts;
    localStorage.setItem('user_points', currentPoints);
    let p=document.getElementById('points-display'); if(p) p.innerText = `⭐ ${currentPoints} نقطة`;
}

function showSection(id) {
    document.querySelectorAll('.section-view').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (id !== 'sec-dashboard') history.pushState({ section: id }, '', `#${id}`);
    window.scrollTo(0,0);
}

const COMPREHENSIVE_DICTIONARY = [
    {en: 'Apple', ar: 'تفاحة', example: 'I eat a fresh red apple every morning.', cat: 'طعام'},
    {en: 'Banana', ar: 'موز', example: 'Monkeys love bananas.', cat: 'طعام'},
    {en: 'Water', ar: 'ماء', example: 'I drink water.', cat: 'طعام'},
    {en: 'Cat', ar: 'قطة', example: 'The cat is sleeping.', cat: 'حيوانات'},
    {en: 'Dog', ar: 'كلب', example: 'The dog is loyal.', cat: 'حيوانات'},
    {en: 'School', ar: 'مدرسة', example: 'Ghazaal goes to school.', cat: 'تعليم'},
    {en: 'Teacher', ar: 'معلم', example: 'Our teacher explains clearly.', cat: 'تعليم'},
    {en: 'Book', ar: 'كتاب', example: 'Reading a book expands knowledge.', cat: 'تعليم'},
    {en: 'Hello', ar: 'مرحبا', example: 'Hello, how are you?', cat: 'تحية'}
];

function renderDictionary(filterText = '') {
    const dictContainer = document.getElementById('dict-container');
    if(!dictContainer) return;
    const cleanFilter = filterText.trim().toLowerCase();
    let filtered = COMPREHENSIVE_DICTIONARY.filter(w => w.en.toLowerCase().includes(cleanFilter) || w.ar.includes(cleanFilter));
    dictContainer.innerHTML = `
        <div style="margin-bottom:15px;">
            <input type="text" value="${filterText}" placeholder="🔍 ابحث انجليزي او عربي..." style="width:100%; padding:12px; border-radius:10px; border:2px solid #06d6a0; background:#121324; color:#fff;" oninput="renderDictionary(this.value)">
        </div>
        <div class="word-list">
            ${filtered.map(w => `
                <div class="word-card" style="background:#191b33; padding:12px; border-radius:10px; margin-bottom:8px; cursor:pointer;" onclick="speak('${w.en}')">
                    <div style="display:flex; justify-content:space-between;"><span style="color:#06d6a0; font-weight:bold;">🔊 ${w.en}</span><span style="color:#facc15;">${w.ar}</span></div>
                    <div style="font-size:0.85rem; color:#aaa; margin-top:5px;">"${w.example}"</div>
                </div>
            `).join('')}
        </div>`;
}

function renderGrammar() {
    const c = document.getElementById('grammar-container'); if(!c) return;
    c.innerHTML = `<div class="interactive-card"><h3>📌 القواعد الاساسية</h3><p style="color:#aaa; line-height:1.7;">I / He / She / It / We / You / They<br>Present: I play / He plays<br>Past: I visited yesterday<br>Future: I will travel<br></p><button class="stage-btn" onclick="speak('I study English every day.')">🔊 استماع</button></div>`;
}
function renderStories() {
    const c = document.getElementById('stories-container'); if(!c) return;
    c.innerHTML = `<div class="interactive-card"><h3>💬 محادثة تعارف</h3><div style="background:#191b33; padding:10px; border-radius:10px; margin-top:10px; cursor:pointer;" onclick="speak('Hello! What is your name?')">"Hello! What is your name?" - ما اسمك؟ 🔊</div><div style="background:#191b33; padding:10px; border-radius:10px; margin-top:8px; cursor:pointer;" onclick="speak('My name is Ghazaal')">"My name is Ghazaal" - اسمي غزل 🔊</div></div>`;
}
function generateInfiniteQuestion() {
    const box = document.getElementById('quiz-box'); if(!box) return;
    const w = COMPREHENSIVE_DICTIONARY[Math.floor(Math.random()*COMPREHENSIVE_DICTIONARY.length)];
    box.innerHTML = `<h3 style="color:#facc15;">🎮 لعبة النطق</h3><p>ما معنى هذه الكلمة؟</p><button class="btn-action" style="background:#7c3aed; margin:15px 0;" onclick="speak('${w.en}')">🔊 ${w.en}</button><div style="display:flex; flex-direction:column; gap:8px;">${COMPREHENSIVE_DICTIONARY.sort(()=>0.5-Math.random()).slice(0,3).concat(w).sort(()=>0.5-Math.random()).map(o=>`<button class="btn-action" style="background:#2d3154;" onclick="if('${o.en}'==='${w.en}'){speak('Bravo'); addPoints(10);} setTimeout(generateInfiniteQuestion,500)">${o.ar}</button>`).join('')}</div>`;
    setTimeout(()=>speak(w.en),300);
}

// Canvas
let canvas = document.getElementById('draw-canvas'); let ctx = canvas ? canvas.getContext('2d') : null;
function clearCanvas(){
    if(!canvas || !ctx) return;
    let char = String.fromCharCode(currentLetterCode);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="#000"; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.font="bold 110px Segoe UI"; ctx.fillStyle="rgba(255,255,255,0.15)"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText(char, canvas.width/2, canvas.height/2);
}
function nextLetter(){ currentLetterCode++; if(currentLetterCode>90) currentLetterCode=65; document.getElementById('current-letter-title').innerText=`✏️ الحرف: ${String.fromCharCode(currentLetterCode)}`; speak(String.fromCharCode(currentLetterCode)); clearCanvas(); }
if(canvas){
    let isDrawing=false;
    function startDrawing(e){ isDrawing=true; draw(e); } function stopDrawing(){ isDrawing=false; ctx.beginPath(); }
    function draw(e){ if(!isDrawing) return; e.preventDefault(); let rect=canvas.getBoundingClientRect(); let x=(e.touches?e.touches[0].clientX:e.clientX)-rect.left; let y=(e.touches?e.touches[0].clientY:e.clientY)-rect.top; ctx.lineWidth=10; ctx.lineCap='round'; ctx.strokeStyle='#06d6a0'; ctx.lineTo(x,y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x,y); }
    canvas.addEventListener('mousedown', startDrawing); canvas.addEventListener('mouseup', stopDrawing); canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('touchstart', startDrawing); canvas.addEventListener('touchend', stopDrawing); canvas.addEventListener('touchmove', draw);
}
function selectLetterCode(code){ currentLetterCode=code; document.getElementById('current-letter-title').innerText=`✏️ الحرف: ${String.fromCharCode(code)}`; speak(String.fromCharCode(code)); clearCanvas(); }

// ================== الجديد: المترجم الصوتي عربي -> انجليزي ==================
function startArabicTranslator(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ alert("لازم تفتح من Google Chrome على الموبايل"); return; }
  const rec = new SR(); rec.lang = 'ar-EG'; rec.interimResults = false;
  let btn = document.getElementById('btn-record-ar');
  let arBox = document.getElementById('ar-result');
  let enBox = document.getElementById('en-result');
  btn.innerHTML = "🎧 بسمعك... اتكلم"; btn.style.background="#facc15"; btn.style.color="#000";
  arBox.innerText="..."; enBox.innerText="...";
  rec.onresult = async (e)=>{
    let saidAr = e.results[0][0].transcript;
    arBox.innerText = saidAr;
    btn.innerHTML="⏳ بترجم...";
    try{
      let res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(saidAr)}&langpair=ar|en`);
      let data = await res.json();
      let translated = data.responseData.translatedText;
      if(!translated) translated = simpleArToEn(saidAr);
      enBox.innerText = translated;
      speak(translated,'en-US'); addPoints(10);
    }catch(err){ enBox.innerText = simpleArToEn(saidAr); speak(enBox.innerText,'en-US'); }
    btn.innerHTML="🎤 اضغط وتكلم عربي"; btn.style.background="#ef4444"; btn.style.color="#fff";
  };
  rec.onerror = ()=>{ btn.innerHTML="🎤 اضغط وتكلم عربي"; btn.style.background="#ef4444"; document.getElementById('ar-result').innerText="❌ مسمعتش كويس"; };
  rec.onend = ()=>{ btn.innerHTML="🎤 اضغط وتكلم عربي"; btn.style.background="#ef4444"; btn.style.color="#fff"; };
  rec.start();
}
function simpleArToEn(text){
  let dict = {"مرحبا":"Hello","السلام عليكم":"Peace be upon you","كيف حالك":"How are you","ماء":"Water","تفاحة":"Apple","كتاب":"Book","مدرسة":"School","انا اسمي":"My name is","شكرا":"Thank you"};
  for(let k in dict){ if(text.includes(k)) return dict[k]; } return text;
}

// ================== تقييم نطق انجليزي (بدون فيديو نهائي) ==================
function similarity(s1,s2){
  s1=s1.toLowerCase().trim(); s2=s2.toLowerCase().trim();
  if(s1===s2) return 100; if(s1.includes(s2)||s2.includes(s1)) return 85; return 40;
}
function startHearoRec(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ alert("افتح بـ Chrome"); return; }
  const rec = new SR(); rec.lang='en-US';
  let r=document.getElementById('result'); if(r){ r.innerHTML="🎤 اسمعك..."; r.style.color="#facc15"; }
  rec.onresult=(e)=>{
    let said=e.results[0][0].transcript.toLowerCase().trim();
    let target=(document.getElementById('word')?.innerText||"hello").toLowerCase().trim();
    let score=similarity(said,target);
    if(!r) return;
    if(score>=80){ r.innerHTML=`✅ ممتاز ${score}%<br>قلت: "${said}"`; r.style.color="#22c55e"; speak("Excellent! "+target); addPoints(20); }
    else { r.innerHTML=`❌ حاول ${score}%<br>قلت: "${said}"<br>الصح: "${target}"`; r.style.color="#ef4444"; setTimeout(()=>speak(target),500); }
  }; rec.start();
}

setTimeout(()=>{ renderDictionary(); renderGrammar(); renderStories(); generateInfiniteQuestion(); if(canvas) clearCanvas(); },500);
