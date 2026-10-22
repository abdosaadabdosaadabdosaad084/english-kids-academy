// State
let currentCase = 'capital';
let currentLetter = 'A';
let isDrawing = false;
let canvas, ctx;
let deferredPrompt; // PWA Native Prompt Event

const capitalList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const smallList = "abcdefghijklmnopqrstuvwxyz".split("");

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

// Navigation
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
    } else if (pageId === 'games') {
        document.getElementById('gamesView').classList.add('active-view');
        startInfiniteKidsGame();
    } else {
        openDetailedContent(pageId);
        document.getElementById('detailsView').classList.add('active-view');
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
// 🚀 موسوعة المحتوى المطور (قواعد، أدوات، صوتيات، قاموس مصور)
// ==========================================
function openDetailedContent(type) {
    const details = document.getElementById('detailsContent');
    if (!details) return;
    
    if (type === 'grammar') {
        details.innerHTML = `
            <h2>📖 الموسوعة الشاملة لقواعد اللغة الإنجليزية</h2>
            
            <div class="dialogue-box">
                <h3>1. الضمائر الشخصية (Personal Pronouns)</h3>
                <p>• <b>I (أنا):</b> للمتكلم المفرد. <i>I am a teacher.</i></p>
                <p>• <b>He (هو):</b> للمفرد المذكر العاقل. <i>He is smart.</i></p>
                <p>• <b>She (هي):</b> للمفرد المؤنث العاقل. <i>She is reading.</i></p>
                <p>• <b>It (هو/هي لغير العاقل):</b> للجماد والحيوان. <i>It is a book.</i></p>
                <p>• <b>We (نحن):</b> للمتكلم الجمع. <i>We play tennis.</i></p>
                <p>• <b>They (هم):</b> للجمع الغائب. <i>They are happy.</i></p>
            </div>

            <div class="dialogue-box">
                <h3>2. الأفعال المساعدة (Verb to Be & Do & Have)</h3>
                <p>• <b>Verb to Be (يكون):</b> (Am, Is, Are) في المضارع | (Was, Were) في الماضي.</p>
                <p>• <b>Verb to Do (يفعل):</b> (Do, Does) في المضارع | (Did) في الماضي.</p>
                <p>• <b>Verb to Have (يملك):</b> (Have, Has) في المضارع | (Had) في الماضي.</p>
            </div>

            <div class="dialogue-box">
                <h3>3. الأزمنة الأساسية (Basic Tenses)</h3>
                <p>• <b>المضارع البسيط (Present Simple):</b> للتعبير عن العادات والحقائق. نضع (s) مع He/She/It.</p>
                <p>• <b>المضارع المستمر (Present Continuous):</b> للتعبير عن حدث يقع الآن (Am/Is/Are + Verb + ing).</p>
                <p>• <b>الماضي البسيط (Past Simple):</b> للتعبير عن حدث انتهى في الماضي (التصريف الثاني للفعل).</p>
            </div>
        `;
    } else if (type === 'tools') {
        details.innerHTML = `
            <h2>🛠️ قسم أدوات اللغة الإنجليزية والشرط</h2>

            <div class="dialogue-box">
                <h3>1. أدوات الشرط (Conditionals - If Cases)</h3>
                <p>• <b>الحالة الصفرية (Zero Conditional):</b> للحقائق الثابتة (If + مضارع بسيط ➔ مضارع بسيط).</p>
                <p style="color:#4DEAEA;">مثال: <i>If you heat ice, it melts.</i> (إذا سخنت الثلج فإنه يذوب)</p>
                <p>• <b>الحالة الأولى (First Conditional):</b> أحداث محتملة في المستقبل (If + مضارع بسيط ➔ Will + المصدر).</p>
                <p style="color:#4DEAEA;">مثال: <i>If you study hard, you will pass.</i> (إذا ذاكرت بجد ستنجح)</p>
                <p>• <b>الحالة الثانية (Second Conditional):</b> خيال أو افتراض غير واقعي (If + ماضي بسيط ➔ Would + المصدر).</p>
                <p style="color:#4DEAEA;">مثال: <i>If I had money, I would buy a car.</i> (لو كان لدي مال لاشتريت سيارة)</p>
                <button class="btn-act audio-btn" style="margin-top:8px;" onclick="speak('If you study hard, you will pass.')">🔊 استمع للأمثلة</button>
            </div>

            <div class="dialogue-box">
                <h3>2. أدوات التعريف والنكرة (Articles)</h3>
                <p>• <b>a:</b> تأتي قبل الاسم المفرد المعدود المبتدئ بحرف ساكن (a book, a cat).</p>
                <p>• <b>an:</b> تأتي قبل الاسم المفرد المبتدئ بحرف متحرك a, e, i, o, u (an apple, an elephant).</p>
                <p>• <b>the:</b> أداة التعريف للإشارة إلى شيء محدد ومعروف لدى السامع (the sun, the school).</p>
            </div>

            <div class="dialogue-box">
                <h3>3. أدوات الربط (Linking Words)</h3>
                <p>• <b>And (و):</b> لربط فكرتين متشابهتين (I like tea and coffee).</p>
                <p>• <b>But (ولكن):</b> للتعبير عن التناقض (He is rich but unhappy).</p>
                <p>• <b>Because (لأن):</b> لبيان السبب (I stayed home because it was raining).</p>
                <p>• <b>So (لذلك):</b> لبيان النتيجة (She was sick so she went to the doctor).</p>
            </div>
        `;
    } else if (type === 'phonics') {
        details.innerHTML = `
            <h2>🔊 قسم الصوتيات وتدريب النطق (Phonics)</h2>
            <div class="dialogue-box">
                <h3>الحروف المركبة (Digraphs)</h3>
                <p>• <b>SH:</b> تُنطق مثل حرف (ش). مثال: <i>Fish, Shop, Ship</i></p>
                <p>• <b>CH:</b> تُنطق مثل (تش). مثال: <i>Chair, Cheese, Teacher</i></p>
                <p>• <b>TH:</b> تُنطق (ث) أو (ذ). مثال: <i>Think (ث), This (ذ)</i></p>
                <p>• <b>PH:</b> تُنطق مثل حرف (ف). مثال: <i>Phone, Elephant</i></p>
                <button class="btn-act audio-btn" style="margin-top:10px;" onclick="speak('Fish, Chair, Think, Phone')">🔊 استمع لنطق الأصوات المركبة</button>
            </div>
        `;
    } else if (type === 'visual_dict') {
        details.innerHTML = `
            <h2>🖼️ القاموس المصور الناطق للأطفال</h2>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                <div style="background:rgba(255,255,255,0.1); padding:10px; border-radius:12px; text-align:center;" onclick="speak('Apple')">
                    <span style="font-size:3rem;">🍎</span>
                    <div><b>Apple</b></div>
                    <small>تفاحة</small>
                </div>
                <div style="background:rgba(255,255,255,0.1); padding:10px; border-radius:12px; text-align:center;" onclick="speak('Car')">
                    <span style="font-size:3rem;">🚗</span>
                    <div><b>Car</b></div>
                    <small>سيارة</small>
                </div>
                <div style="background:rgba(255,255,255,0.1); padding:10px; border-radius:12px; text-align:center;" onclick="speak('House')">
                    <span style="font-size:3rem;">🏠</span>
                    <div><b>House</b></div>
                    <small>منزل</small>
                </div>
                <div style="background:rgba(255,255,255,0.1); padding:10px; border-radius:12px; text-align:center;" onclick="speak('Sun')">
                    <span style="font-size:3rem;">☀️</span>
                    <div><b>Sun</b></div>
                    <small>شمس</small>
                </div>
            </div>
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

// ==========================================
// 🚀 محرك الألعاب اللانهائي
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
        const SpeechRecognition = window.Sp
