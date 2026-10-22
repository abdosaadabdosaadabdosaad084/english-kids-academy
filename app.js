// State
let currentCase = 'capital';
let currentLetter = 'A';
let isDrawing = false;
let canvas, ctx;
let deferredPrompt; // PWA Native Prompt Event

const capitalList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const smallList = "abcdefghijklmnopqrstuvwxyz".split("");

// Quiz Bank
const quizQuestions = [
    { q: "ما معنى كلمة 'Cat'؟", opts: ["كلب", "قطة", "عصفور"], correct: 1 },
    { q: "ما معنى كلمة 'Book'؟", opts: ["كتاب", "قلم", "مدرسة"], correct: 0 },
    { q: "ما هي الترجمة الصحيحة لـ 'صباح الخير'؟", opts: ["Good evening", "Good morning", "Good night"], correct: 1 },
    { q: "الضمير المناسب للمفرد المذكر العاقل (هو):", opts: ["She", "He", "They"], correct: 1 },
    { q: "ما معنى كلمة 'Water'؟", opts: ["طعام", "ماء", "عصير"], correct: 1 },
    { q: "ترجمة كلمة 'طبيب' هي:", opts: ["Teacher", "Doctor", "Driver"], correct: 1 },
    { q: "أي كلمة تعني 'سيارة'؟", opts: ["Car", "Bus", "Train"], correct: 0 },
    { q: "ما عكس كلمة 'Happy' (سعيد)؟", opts: ["Sad (حزين)", "Fast (سريع)", "Tall (طويل)"], correct: 0 },
    { q: "ما هو الفعل المساعد الذي يأتي مع الضمير 'I' في المضارع؟", opts: ["is", "are", "am"], correct: 2 },
    { q: "ما معنى كلمة 'Teacher'؟", opts: ["طبيب", "معلم", "مهندس"], correct: 1 }
];

let currentQuizIndex = 0;
const transCache = JSON.parse(localStorage.getItem('offline_trans') || '{}');

window.onload = () => {
    initCanvas();
    renderLettersBar();
    initHistoryNav();
    initPWAInstallPrompt();
};

// Handle Native PWA Installation
function initPWAInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const banner = document.getElementById('installBanner');
        if (banner) banner.style.display = 'block';
    });
}

function triggerPWAInstall() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the PWA install prompt');
            }
            deferredPrompt = null;
        });
    } else {
        alert("تطبيقك جاهز! للتثبيت فوراً: اضغط على خيارات المتصفح (⋮) ثم اختر 'إضافة إلى الشاشة الرئيسية Add to Home Screen' أو 'تثبيت التطبيق Install App'.");
    }
}

// In-App Navigation
function initHistoryNav() {
    window.history.pushState({ page: 'home' }, '');
    window.onpopstate = (e) => {
        if (e.state && e.state.page && e.state.page !== 'home') {
            showView(e.state.page, false);
        } else {
            showView('home', false);
        }
    };
}

function navigateTo(pageId) {
    window.history.pushState({ page: pageId }, '');
    showView(pageId, true);
}

// متوافق مع دالة openSection المستخدمة في واجهة البطاقات
function openSection(pageId) {
    navigateTo(pageId);
}

function showHome() {
    navigateTo('home');
}

function showView(pageId, isPush) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));

    if (pageId === 'home') {
        document.getElementById('homeView').classList.add('active-view');
    } else if (pageId === 'translator') {
        document.getElementById('translatorView').classList.add('active-view');
    } else if (pageId === 'board') {
        document.getElementById('boardView').classList.add('active-view');
        clearBoard();
    } else if (pageId === 'dictionary') {
        document.getElementById('dictionaryView').classList.add('active-view');
    } else if (pageId === 'games') {
        document.getElementById('gamesView').classList.add('active-view');
        startInfiniteKidsGame(); // تشغيل الألعاب اللانهائية الجديدة فور الدخول للقسم
    } else {
        openDetailedContent(pageId);
        document.getElementById('detailsView').classList.add('active-view');
    }
}

// Full API In-App Search Dictionary
async function searchInAppDictionary() {
    const query = document.getElementById('dictSearchInput').value.trim();
    const container = document.getElementById('dictResultsList');
    
    if (!query) {
        container.innerHTML = `<p style="text-align:center; padding:15px; color:#aaa;">الرجاء كتابة كلمة في مربع البحث أعلاه.</p>`;
        return;
    }

    container.innerHTML = `<p style="text-align:center; padding:15px; color:#FFDD59;">جاري البحث عن الكلمة ونطقها...</p>`;

    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=ar|en`);
        const data = await res.json();

        if (data && data.responseData && data.responseData.translatedText) {
            let result = data.responseData.translatedText;
            
            container.innerHTML = `
                <div class="dict-card-item">
                    <div>
                        <div style="font-size:14px; color:#aaa;">الكلمة المبحوث عنها: <strong style="color:#fff;">${query}</strong></div>
                        <div style="font-size:20px; font-weight:bold; color:#FFDD59; margin-top:5px;">النتيجة: ${result}</div>
                    </div>
                    <button class="btn-speak-icon" onclick="speak('${result}')"><i class="fa-solid fa-volume-high"></i> نطق</button>
                </div>
            `;
        } else {
            container.innerHTML = `<p style="text-align:center; padding:15px; color:#FF4757;">لم نتمكن من العثور على الكلمة، تحقق من الإملاء.</p>`;
        }
    } catch (e) {
        container.innerHTML = `<p style="text-align:center; padding:15px; color:#FF4757;">يرجى الاتصال بالإنترنت للبحث في القاموس لأول مرة.</p>`;
    }
}

// Sound Effects API
function playSound(type) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (type === 'success') {
            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
            osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
            osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.5);
        } else {
            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140, audioCtx.currentTime);
            osc.frequency.setValueAtTime(90, audioCtx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.35);
        }
    } catch (e) {}
}

// ==========================================
// 🚀 محرك الألعاب اللانهائي الجديد (بدون ملل للأطفال)
// ==========================================
const INF_ANIMALS = [
    { nameEn: "Lion", nameAr: "أسد", emoji: "🦁" },
    { nameEn: "Elephant", nameAr: "فيل", emoji: "🐘" },
    { nameEn: "Monkey", nameAr: "قرد", emoji: "🐒" },
    { nameEn: "Giraffe", nameAr: "زرافة", emoji: "🦒" },
    { nameEn: "Tiger", nameAr: "نمر", emoji: "🐅" },
    { nameEn: "Cat", nameAr: "قطة", emoji: "🐱" },
    { nameEn: "Dog", nameAr: "كلب", emoji: "🐶" },
    { nameEn: "Rabbit", nameAr: "أرنب", emoji: "🐰" },
    { nameEn: "Panda", nameAr: "باندا", emoji: "🐼" },
    { nameEn: "Bird", nameAr: "عصفور", emoji: "🐦" },
    { nameEn: "Duck", nameAr: "بطة", emoji: "🦆" },
    { nameEn: "Frog", nameAr: "ضفدع", emoji: "🐸" }
];

const INF_COLORS = [
    { nameEn: "Red", nameAr: "أحمر", hex: "#ef4444" },
    { nameEn: "Blue", nameAr: "أزرق", hex: "#3b82f6" },
    { nameEn: "Green", nameAr: "أخضر", hex: "#10b981" },
    { nameEn: "Yellow", nameAr: "أصفر", hex: "#f59e0b" },
    { nameEn: "Purple", nameAr: "بنفسجي", hex: "#8b5cf6" },
    { nameEn: "Pink", nameAr: "وردي", hex: "#ec4899" }
];

let infGameMode = 'all';
let infCorrectAnswer = null;
let infWordToSpeak = "";
let infLock = false;

function setGameCategory(mode) {
    infGameMode = mode;
    startInfiniteKidsGame();
}

function startInfiniteKidsGame() {
    infLock = false;
    const speakBtn = document.getElementById('btnSpeakWord');
    if (speakBtn) speakBtn.style.display = 'none';
    infWordToSpeak = "";

    let types = ['animals', 'colors', 'numbers'];
    let chosenType = infGameMode === 'all' ? types[Math.floor(Math.random() * types.length)] : infGameMode;

    if (chosenType === 'animals') {
        generateInfAnimalChallenge();
    } else if (chosenType === 'colors') {
        generateInfColorChallenge();
    } else {
        generateInfNumberChallenge();
    }
}

function generateInfAnimalChallenge() {
    const item = INF_ANIMALS[Math.floor(Math.random() * INF_ANIMALS.length)];
    const isEn = Math.random() > 0.5;

    document.getElementById('gameCategoryTag').innerText = "🦁 تحدي الحيوانات والطيور الذكي";
    document.getElementById('gameVisualArena').innerHTML = `<div style="font-size: 4.5rem;">${item.emoji}</div>`;

    let choices = [item];
    while (choices.length < 4) {
        let rand = INF_ANIMALS[Math.floor(Math.random() * INF_ANIMALS.length)];
        if (!choices.some(c => c.nameEn === rand.nameEn)) choices.push(rand);
    }
    choices = choices.sort(() => Math.random() - 0.5);

    if (isEn) {
        document.getElementById('gameQuestionText').innerText = "ما اسم هذا الكائن باللغة الإنجليزية؟";
        infCorrectAnswer = item.nameEn;
        infWordToSpeak = item.nameEn;
        if (document.getElementById('btnSpeakWord')) document.getElementById('btnSpeakWord').style.display = 'inline-block';
        renderInfOptions(choices.map(c => ({ text: c.nameEn, val: c.nameEn, sub: c.nameAr })));
    } else {
        document.getElementById('gameQuestionText').innerText = `ما هو المعنى العربي لـ '${item.nameEn}'؟`;
        infCorrectAnswer = item.nameAr;
        infWordToSpeak = item.nameEn;
        if (document.getElementById('btnSpeakWord')) document.getElementById('btnSpeakWord').style.display = 'inline-block';
        renderInfOptions(choices.map(c => ({ text: c.nameAr, val: c.nameAr, sub: c.nameEn })));
    }
}

function generateInfColorChallenge() {
    const color = INF_COLORS[Math.floor(Math.random() * INF_COLORS.length)];
    document.getElementById('gameCategoryTag').innerText = "🎨 تحدي الألوان والمربعات المبهجة";
    document.getElementById('gameVisualArena').innerHTML = `<div style="width:75px; height:75px; background-color:${color.hex}; border-radius:18px; border:3px solid #fff; box-shadow:0 6px 15px rgba(0,0,0,0.4);"></div>`;

    let choices = [color];
    while (choices.length < 4) {
        let rand = INF_COLORS[Math.floor(Math.random() * INF_COLORS.length)];
        if (!choices.some(c => c.nameEn === rand.nameEn)) choices.push(rand);
    }
    choices = choices.sort(() => Math.random() - 0.5);

    document.getElementById('gameQuestionText').innerText = "ما هو هذا اللون بالإنجليزية؟";
    infCorrectAnswer = color.nameEn;
    infWordToSpeak = color.nameEn;
    if (document.getElementById('btnSpeakWord')) document.getElementById('btnSpeakWord').style.display = 'inline-block';

    renderInfOptions(choices.map(c => ({ text: c.nameEn, val: c.nameEn, sub: c.nameAr })));
}

function generateInfNumberChallenge() {
    const count = Math.floor(Math.random() * 5) + 2;
    const anim = INF_ANIMALS[Math.floor(Math.random() * INF_ANIMALS.length)];

    document.getElementById('gameCategoryTag').innerText = "🔢 حديقة الأرقام والعد التفاعلية";
    document.getElementById('gameQuestionText').innerText = "كم عدد العناصر الظاهرة في المربع؟";

    let gridHTML = `<div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center;">`;
    for (let i = 0; i < count; i++) {
        gridHTML += `<span style="font-size: 2.3rem;">${anim.emoji}</span>`;
    }
    gridHTML += `</div>`;
    document.getElementById('gameVisualArena').innerHTML = gridHTML;

    let choices = [count];
    while (choices.length < 4) {
        let randNum = Math.floor(Math.random() * 8) + 1;
        if (!choices.includes(randNum)) choices.push(randNum);
    }
    choices = choices.sort(() => Math.random() - 0.5);

    infCorrectAnswer = count.toString();
    renderInfOptions(choices.map(num => ({ text: num.toString(), val: num.toString(), sub: "عنصر" })));
}

function renderInfOptions(opts) {
    const container = document.getElementById('gameOptionsGrid');
    if (!container) return;
    container.innerHTML = '';

    opts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'tab-b';
        btn.style.cssText = "background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 12px; border-radius: 14px; font-weight: bold; font-size: 1.1rem; cursor: pointer;";
        btn.innerHTML = `<div>${opt.text}</div><small style="opacity:0.7; font-size:0.8rem; display:block;">${opt.sub || ''}</small>`;
        btn.onclick = () => checkInfAnswer(opt.val, btn);
        container.appendChild(btn);
    });
}

function checkInfAnswer(selectedVal, btnElement) {
    if (infLock) return;
    infLock = true;

    if (selectedVal === infCorrectAnswer) {
        btnElement.style.background = "#10b981";
        playSound('success');
        let scoreElem = document.getElementById('userScore');
        if (scoreElem) scoreElem.innerText = parseInt(scoreElem.innerText) + 15;
        if (infWordToSpeak) speak(infWordToSpeak);
    } else {
        btnElement.style.background = "#ef4444";
        playSound('error');
        document.querySelectorAll('#gameOptionsGrid button').forEach(b => {
            if (b.innerText.includes(infCorrectAnswer)) b.style.background = "#10b981";
        });
    }

    setTimeout(() => {
        startInfiniteKidsGame();
    }, 1500);
}

function speakCurrentGameWord() {
    if (infWordToSpeak) speak(infWordToSpeak);
}

// DETAILED CONTENT (الشرح الموسع والتفصيل الممل)
function openDetailedContent(type) {
    const details = document.getElementById('detailsContent');
    if (!details) return;
    
    if (type === 'grammar') {
        details.innerHTML = `
            <h2>📖 موسوعة قواعد اللغة الإنجليزية (شرح وافٍ وتفصيل ممل)</h2>
            <h3>1. الضمائر الشخصية الشاملة (Personal Pronouns)</h3>
            <p>الضمائر هي الكلمات التي تحل محل الاسم لتجنب تكراره في الجملة:</p>
            <ul>
                <li><b>I (أنا):</b> مثال: <i>I am a student.</i></li>
                <li><b>He (هو) / She (هي) / It (لغير العاقل):</b> أمثلة: <i>He is a doctor.</i> | <i>She is reading.</i> | <i>It is a cat.</i></li>
                <li><b>We (نحن) / They (هم) / You (أنتم):</b> أمثلة: <i>We learn English.</i> | <i>They play football.</i></li>
            </ul>
            <h3>2. زمن المضارع البسيط (Present Simple Tense)</h3>
            <p>للتعبير عن العادات والحقائق. مع (He, She, It) نضيف دائماً حرف (s) لنهاية الفعل، ومع باقي الضمائر يبقى الفعل في المصدر.</p>
        `;
    } else if (type === 'dialogues') {
        details.innerHTML = `
            <h2>💬 موسوعة محادثات الحياة اليومية الشاملة</h2>
            <div class="dialogue-box">
                <h3>🏫 1. في المدرسة والتعارف</h3>
                <p><b>Omar:</b> Hello! My name is Omar.</p>
                <p style="color:#4DEAEA;">(مرحباً! اسمي عمر.)</p>
                <p><b>Youssef:</b> Welcome Omar! I am Youssef.</p>
                <p style="color:#4DEAEA;">(أهلاً بك يا عمر! أنا يوسف.)</p>
                <button class="btn-act audio-btn" style="margin-top:10px;" onclick="speak('Hello! My name is Omar. Welcome Omar! I am Youssef.')">🔊 استمع للمحادثة</button>
            </div>
        `;
    } else if (type === 'stories') {
        details.innerHTML = `
            <h2>📕 القصص التعليمية الموسعة</h2>
            <div class="dialogue-box">
                <h3>1. The Thirsty Crow (قصة الغراب العطشان والذكاء) 🐦</h3>
                <p>On a hot summer day, a crow became very thirsty and found a pitcher with low water...</p>
                <button class="btn-act audio-btn" style="margin-top:10px;" onclick="speak('On a hot summer day, a crow became very thirsty and dropped stones into the pitcher.')">🔊 استمع للقصة</button>
            </div>
        `;
    }
}

// Clean Real Translator
async function translateText(text) {
    let clean = text.trim();
    if (!clean) return;

    if (transCache[clean]) {
        document.getElementById('enText').innerText = transCache[clean];
        return;
    }

    document.getElementById('enText').innerText = "جاري الترجمة الفورية...";

    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=ar|en`);
        const data = await response.json();
        
        if (data && data.responseData && data.responseData.translatedText) {
            let translatedResult = data.responseData.translatedText;
            document.getElementById('enText').innerText = translatedResult;
            transCache[clean] = translatedResult;
            localStorage.setItem('offline_trans', JSON.stringify(transCache));
        } else {
            document.getElementById('enText').innerText = "تعذر الحصول على الترجمة";
        }
    } catch (error) {
        document.getElementById('enText').innerText = "خطأ في الاتصال بالشبكة للترجمة الفورية";
    }
}

// Speech Recognition
function toggleSpeech() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recog = new SpeechRecognition();
        recog.lang = 'ar-SA';
        
        recog.onstart = () => { document.getElementById('micBtn').innerText = '🎙️ جاري الاستماع بتركيز...'; };
        recog.onresult = (e) => {
            const text = e.results[0][0].transcript;
            document.getElementById('arText').innerText = text;
            translateText(text);
            document.getElementById('micBtn').innerText = '🎙️ اضغط وتحدث بالعربية';
        };
        recog.onerror = () => { document.getElementById('micBtn').innerText = '🎙️ اضغط وتحدث بالعربية'; };
        recog.start();
    } else {
        alert('المتصفح الحالي لا يدعم التعرف الصوتي المباشر.');
    }
}

function speakEnglish() { speak(document.getElementById('enText').innerText); }
function speak(text) {
    if ('speechSynthesis' in window) {
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = 'en-US';
        utt.rate = 0.85;
        window.speechSynthesis.speak(utt);
    }
}

// Canvas Trace Logic
function initCanvas() {
    canvas = document.getElementById('traceCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2ED573';

    canvas.addEventListener('mousedown', startD);
    canvas.addEventListener('mousemove', drawD);
    canvas.addEventListener('mouseup', stopD);

    canvas.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        const r = canvas.getBoundingClientRect();
        startD({ clientX: t.clientX - r.left, clientY: t.clientY - r.top });
    });

    canvas.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        const r = canvas.getBoundingClientRect();
        drawD({ clientX: t.clientX - r.left, clientY: t.clientY - r.top });
    });

    canvas.addEventListener('touchend', stopD);
}

function startD(e) { isDrawing = true; ctx.beginPath(); ctx.moveTo(e.clientX || e.offsetX, e.clientY || e.offsetY); }
function drawD(e) { if (!isDrawing) return; ctx.lineTo(e.clientX || e.offsetX, e.clientY || e.offsetY); ctx.stroke(); }
function stopD() { isDrawing = false; }
function clearBoard() { if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height); }

function setLetterCase(type) {
    currentCase = type;
    document.getElementById('tabCap').classList.toggle('active', type === 'capital');
    document.getElementById('tabSmall').classList.toggle('active', type === 'small');
    currentLetter = type === 'capital' ? 'A' : 'a';
    renderLettersBar();
}

function renderLettersBar() {
    const bar = document.getElementById('lettersBar');
    if (!bar) return;
    bar.innerHTML = '';
    const list = currentCase === 'capital' ? capitalList : smallList;

    list.forEach(l => {
        const b = document.createElement('button');
        b.className = `l-btn ${l === currentLetter ? 'active' : ''}`;
        b.innerText = l;
        b.onclick = () => selectLetter(l);
        bar.appendChild(b);
    });

    const ghost = document.getElementById('ghostLetter');
    if (ghost) ghost.innerText = currentLetter;
}

function selectLetter(l) {
    currentLetter = l;
    renderLettersBar();
    clearBoard();
    speak(currentLetter);
}

function nextLetter() {
    const list = currentCase === 'capital' ? capitalList : smallList;
    let idx = list.indexOf(currentLetter);
    if (idx < list.length - 1) selectLetter(list[idx + 1]);
    else selectLetter(list[0]);
}

function speakCurrentLetter() { speak(currentLetter); }

function searchGoogleTrans() {
    const arText = document.getElementById('arText').innerText;
    window.open(`https://translate.google.com/?sl=ar&tl=en&text=${encodeURIComponent(arText)}&op=translate`, '_blank');
}
