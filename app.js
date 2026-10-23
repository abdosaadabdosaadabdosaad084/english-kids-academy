// State
let currentCase = 'capital';
let currentLetter = 'A';
let isDrawing = false;
let canvas, ctx;
let deferredPrompt;

const capitalList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const smallList = "abcdefghijklmnopqrstuvwxyz".split("");
const transCache = JSON.parse(localStorage.getItem('offline_trans') || '{}');

window.onload = () => {
    initCanvas();
    if (typeof renderLettersBar === 'function') renderLettersBar();
    initHistoryNav();
    initPWAInstallPrompt();
};

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
            deferredPrompt = null;
        });
    } else {
        alert("تطبيقك جاهز! للتثبيت فوراً: اضغط على خيارات المتصفح (⋮) ثم اختر 'إضافة إلى الشاشة الرئيسية'.");
    }
}

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
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active-view');
        v.style.display = 'none';
    });

    if (pageId === 'home') {
        const home = document.getElementById('homeView');
        if (home) { home.classList.add('active-view'); home.style.display = 'block'; }
    } else if (pageId === 'translator') {
        const trans = document.getElementById('translatorView');
        if (trans) { trans.classList.add('active-view'); trans.style.display = 'block'; }
    } else if (pageId === 'board') {
        const board = document.getElementById('boardView');
        if (board) { board.classList.add('active-view'); board.style.display = 'block'; }
        clearBoard();
    } else if (pageId === 'games') {
        const games = document.getElementById('gamesView');
        if (games) { games.classList.add('active-view'); games.style.display = 'block'; }
        startInfiniteKidsGame();
    } else if (pageId === 'dictionary') {
        window.open('https://www.google.com/search?q=' + encodeURIComponent('قاموس ترجمة إنجليزي عربي'), '_blank');
        const home = document.getElementById('homeView');
        if (home) { home.classList.add('active-view'); home.style.display = 'block'; }
    } else {
        openDetailedContent(pageId);
        const details = document.getElementById('detailsView');
        if (details) { details.classList.add('active-view'); details.style.display = 'block'; }
    }
}

function playSound(type) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        if (type === 'success') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
            osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
        } else {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140, audioCtx.currentTime);
        }
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {}
}

// ==========================================
// 📚 الموسوعة الشاملة الموسعة (قواعد، أدوات الشرط، محادثات، قصص)
// ==========================================
function openDetailedContent(type) {
    const details = document.getElementById('detailsContent');
    if (!details) return;
    
    if (type === 'grammar') {
        details.innerHTML = `
            <h2>📖 الموسوعة الشاملة لقواعد اللغة الإنجليزية</h2>
            <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:15px; margin-bottom:15px;">
                <h3>1. الضمائر الشخصية (Personal Pronouns)</h3>
                <p>• <b>I (أنا):</b> للمتكلم المفرد. (I am happy)</p>
                <p>• <b>He / She / It (هو / هي / لغير العاقل):</b> للمفرد الغائب.</p>
                <p>• <b>We / They / You (نحن / هم / أنتم):</b> للجمع والمخاطب.</p>
            </div>
            <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:15px; margin-bottom:15px;">
                <h3>2. أفعال الكينونة والمساعدة (Verb to Be, Do, Have)</h3>
                <p>• <b>Verb to Be:</b> (Am, Is, Are) للمضارع | (Was, Were) للماضي.</p>
                <p>• <b>Verb to Do:</b> (Do, Does) للمضارع | (Did) للماضي.</p>
                <p>• <b>Verb to Have:</b> (Have, Has) للمضارع | (Had) للماضي.</p>
            </div>
            <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:15px;">
                <h3>3. الأزمنة الأساسية (Tenses)</h3>
                <p>• <b>المضارع البسيط:</b> للعادات والحقائق (يضاف s مع المفرد الغائب).</p>
                <p>• <b>المضارع المستمر:</b> حدث يحدث الآن (Am/Is/Are + Verb + ing).</p>
                <p>• <b>الماضي البسيط:</b> حدث انتهى (التصريف الثاني للفعل).</p>
            </div>
        `;
    } else if (type === 'tools') {
        details.innerHTML = `
            <h2>🛠️ أدوات اللغة الإنجليزية والشرط (Conditionals & Tools)</h2>
            <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:15px; margin-bottom:15px;">
                <h3>1. أدوات الشرط (If Conditionals)</h3>
                <p><b>• الحالة الصفرية (Zero Conditional):</b> للحقائق العلمية الثابتة.<br>
                القاعدة: <i>If + مضارع بسيط ➔ مضارع بسيط</i><br>
                مثال: <span style="color:#4DEAEA;">If you heat water, it boils.</span></p>
                <p style="margin-top:10px;"><b>• الحالة الأولى (First Conditional):</b> أحداث محتملة الحدوث في المستقبل.<br>
                القاعدة: <i>If + مضارع بسيط ➔ Will + المصدر</i><br>
                مثال: <span style="color:#4DEAEA;">If you study hard, you will succeed.</span></p>
                <button style="margin-top:10px; background:#3b82f6; color:#fff; border:none; padding:8px 15px; border-radius:10px; cursor:pointer;" onclick="speak('If you study hard, you will succeed.')">🔊 استمع لأدوات الشرط</button>
            </div>
            <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:15px;">
                <h3>2. أدوات التعريف (Articles)</h3>
                <p>• <b>a / an:</b> تستخدم قبل الاسم المفرد المعدود النكرة.</p>
                <p>• <b>the:</b> أداة التعريف للإشارة إلى شيء معروف ومحدد.</p>
            </div>
        `;
    } else if (type === 'phonics') {
        details.innerHTML = `
            <h2>🔊 تعليم الصوتيات والنطق الصحيح (Phonics)</h2>
            <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:15px;">
                <h3>أهم الحروف والأصوات المركبة:</h3>
                <p>• <b>SH:</b> تُنطق (ش) مثل <i>Fish, Shop</i></p>
                <p>• <b>CH:</b> تُنطق (تش) مثل <i>Chair, Watch</i></p>
                <p>• <b>TH:</b> تُنطق (ث) أو (ذ) مثل <i>Think, This</i></p>
                <button style="margin-top:12px; background:#3b82f6; color:#fff; border:none; padding:8px 15px; border-radius:10px; cursor:pointer;" onclick="speak('Fish, Chair, Think')">🔊 استمع للأصوات</button>
            </div>
        `;
    } else if (type === 'visual_dict') {
        details.innerHTML = `
            <h2>🖼️ القاموس المصور الناطق للأطفال</h2>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:10px;">
                <div style="background:rgba(255,255,255,0.08); padding:15px; border-radius:15px; text-align:center; cursor:pointer;" onclick="speak('Apple')">
                    <span style="font-size:3rem;">🍎</span>
                    <div style="font-weight:bold; margin-top:5px;">Apple</div>
                    <small>تفاحة</small>
                </div>
                <div style="background:rgba(255,255,255,0.08); padding:15px; border-radius:15px; text-align:center; cursor:pointer;" onclick="speak('Car')">
                    <span style="font-size:3rem;">🚗</span>
                    <div style="font-weight:bold; margin-top:5px;">Car</div>
                    <small>سيارة</small>
                </div>
            </div>
        `;
    } else if (type === 'dialogues') {
        details.innerHTML = `
            <h2>💬 محادثات الحياة اليومية الشاملة</h2>
            <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:15px;">
                <h3>1. في المدرسة والتعارف (At School)</h3>
                <p><b>Ali:</b> Hello! My name is Ali. What is your name?</p>
                <p style="color:#4DEAEA;">(مرحباً! اسمي علي. ما اسمك؟)</p>
                <button style="margin-top:8px; background:#3b82f6; color:#fff; border:none; padding:8px 15px; border-radius:10px; cursor:pointer;" onclick="speak('Hello! My name is Ali.')">🔊 استمع للمحادثة</button>
            </div>
        `;
    } else if (type === 'stories') {
        details.innerHTML = `
            <h2>📕 القصص التعليمية الموسعة</h2>
            <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:15px;">
                <h3>The Clever Crow (الغراب الذكي) 🐦</h3>
                <p>On a hot summer day, a crow was very thirsty. He found a pitcher with very little water at the bottom and drank happily!</p>
                <p style="color:#4DEAEA; margin-top:8px;">(في يوم صيفي حار، عطش الغراب بشدة ووجد إبريقاً فيه ماء قليل وشرب بسعادة!)</p>
                <button style="margin-top:10px; background:#3b82f6; color:#fff; border:none; padding:8px 15px; border-radius:10px; cursor:pointer;" onclick="speak('On a hot summer day, a crow was very thirsty.')">🔊 استمع للقصة</button>
            </div>
        `;
    }
}

// ==========================================
// 🚀 محرك الألعاب اللانهائي للأطفال
// ==========================================
const INF_ANIMALS = [
    { nameEn: "Lion", nameAr: "أسد", emoji: "🦁" },
    { nameEn: "Elephant", nameAr: "فيل", emoji: "🐘" },
    { nameEn: "Cat", nameAr: "قطة", emoji: "🐱" },
    { nameEn: "Dog", nameAr: "كلب", emoji: "🐶" }
];

const INF_COLORS = [
    { nameEn: "Red", nameAr: "أحمر", hex: "#ef4444" },
    { nameEn: "Blue", nameAr: "أزرق", hex: "#3b82f6" }
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
        const item = INF_ANIMALS[Math.floor(Math.random() * INF_ANIMALS.length)];
        document.getElementById('gameCategoryTag').innerText = "🦁 تحدي الحيوانات الذكي";
        document.getElementById('gameVisualArena').innerHTML = `<div style="font-size: 4.5rem;">${item.emoji}</div>`;
        document.getElementById('gameQuestionText').innerText = "ما اسم هذا الكائن بالإنجليزية؟";
        infCorrectAnswer = item.nameEn;
        infWordToSpeak = item.nameEn;
        if (speakBtn) speakBtn.style.display = 'inline-block';
        renderInfOptions([item, ...getRandom(INF_ANIMALS, item, 3)].map(c => ({ text: c.nameEn, val: c.nameEn, sub: c.nameAr })));
    } else if (chosenType === 'colors') {
        const col = INF_COLORS[Math.floor(Math.random() * INF_COLORS.length)];
        document.getElementById('gameCategoryTag').innerText = "🎨 تحدي الألوان";
        document.getElementById('gameVisualArena').innerHTML = `<div style="width:75px; height:75px; background-color:${col.hex}; border-radius:18px; border:3px solid #fff;"></div>`;
        document.getElementById('gameQuestionText').innerText = "ما هو هذا اللون بالإنجليزية؟";
        infCorrectAnswer = col.nameEn;
        infWordToSpeak = col.nameEn;
        if (speakBtn) speakBtn.style.display = 'inline-block';
        renderInfOptions([col, ...getRandom(INF_COLORS, col, 1)].map(c => ({ text: c.nameEn, val: c.nameEn, sub: c.nameAr })));
    } else {
        const count = Math.floor(Math.random() * 3) + 2;
        const anim = INF_ANIMALS[Math.floor(Math.random() * INF_ANIMALS.length)];
        document.getElementById('gameCategoryTag').innerText = "🔢 حديقة الأرقام والعد
