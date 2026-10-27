// State
let currentCase = 'capital';
let currentLetter = 'A';
let isDrawing = false;
let canvas, ctx;
let deferredPrompt;

// 🔥 رابط المدرس الذكي الجديد
const AI_TEACHER_URL = "https://english-kids-teacher-84.abdosaadabdosaad084.workers.dev/";

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
// 🤖 المدرس الذكي - مربوط بالخادم الجديد
// ==========================================
async function askSmartTeacher() {
    const input = document.getElementById('translatorInput') || document.getElementById('aiQuestionInput');
    const output = document.getElementById('translatorOutput') || document.getElementById('aiAnswerBox');
    if (!input) {
        alert("مش لاقي خانة السؤال! تأكد من ID في الـ HTML");
        return;
    }
    const question = input.value.trim();
    if (!question) {
        alert("اكتب سؤالك يا بطل! 😊");
        return;
    }

    if (output) {
        output.innerHTML = "🤔 المدرس بيفكر... ثواني يا بطل...";
        output.style.display = 'block';
    }

    try {
        const res = await fetch(AI_TEACHER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: question, level: "kids" })
        });
        const data = await res.json();
        
        if (output) {
            output.innerHTML = `<div style="background:rgba(76,175,80,0.1); padding:15px; border-radius:15px; border-left:4px solid #4caf50;">
                <b>👨‍🏫 المدرس الذكي:</b><br><br>${data.answer}
                <br><br><button onclick="speak(\`${data.answer.replace(/`/g,'')}\`)" style="background:#3b82f6; color:#fff; border:none; padding:8px 15px; border-radius:10px; cursor:pointer;">🔊 اسمع الإجابة</button>
            </div>`;
        }
        playSound('success');
    } catch (e) {
        if (output) output.innerHTML = "😅 حصل مشكلة صغيرة في الاتصال، جرب تاني يا بطل!";
        console.error(e);
    }
}

// دالة قديمة للتوافق - بقت تنادي الجديدة
async function translateWithAI() {
    return askSmartTeacher();
}

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
    }
