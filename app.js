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
    renderLettersBar();
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
    } else if (pageId === 'dictionary') {
        window.open('https://www.google.com/search?q=' + encodeURIComponent('قاموس ترجمة إنجليزي عربي'), '_blank');
        document.getElementById('homeView').classList.add('active-view');
    } else {
        openDetailedContent(pageId);
        document.getElementById('detailsView').classList.add('active-view');
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
                مثال: <span style="color:#4DEAEA;">If you heat water, it boils.</span> (إذا سخنت الماء، يغلي)</p>

                <p style="margin-top:10px;"><b>• الحالة الأولى (First Conditional):</b> أحداث محتملة الحدوث في المستقبل.<br>
                القاعدة: <i>If + مضارع بسيط ➔ Will + المصدر</i><br>
                مثال: <span style="color:#4DEAEA;">If you study hard, you will succeed.</span> (إذا ذاكرت بجد، ستنجح)</p>

                <p style="margin-top:10px;"><b>• الحالة الثانية (Second Conditional):</b> للافتراض والخيال غير الواقعي.<br>
                القاعدة: <i>If + ماضي بسيط ➔ Would + المصدر</i><br>
                مثال: <span style="color:#4DEAEA;">If I were rich, I would buy a mansion.</span> (لو كنت غنياً، لاشتريت قصراً)</p>

                <button style="margin-top:10px; background:#3b82f6; color:#fff; border:none; padding:8px 15px; border-radius:10px; cursor:pointer;" onclick="speak('If you study hard, you will succeed.')">🔊 استمع لأدوات الشرط</button>
            </div>

            <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:15px; margin-bottom:15px;">
                <h3>2. أدوات التعريف والنكرة (Articles)</h3>
                <p>• <b>a / an:</b> تستخدم قبل الاسم المفرد المعدود النكرة (a car, an apple).</p>
                <p>• <b>the:</b> أداة التعريف للإشارة إلى شيء معروف ومحدد (the moon, the door).</p>
            </div>

            <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:15px;">
                <h3>3. أدوات الربط الهامة (Linking Words)</h3>
                <p>• <b>And (و)</b> | <b>But (ولكن)</b> | <b>Because (لأن)</b> | <b>So (لذلك)</b> | <b>Although (على الرغم من)</b></p>
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
                <p>• <b>PH:</b> تُنطق (ف) مثل <i>Phone, Photo</i></p>
                <button style="margin-top:12px; background:#3b82f6; color:#fff; border:none; padding:8px 15px; border-radius:10px; cursor:pointer;" onclick="speak('Fish, Chair, Think, Phone')">🔊 استمع للأصوات</button>
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
                <div style="background:rgba(255,255,255,0.08); padding:15px; border-radius:15px; text-align:center; cursor:pointer;" onclick="speak('House')">
                    <span style="font-size:3.5rem;">🏠</span>
                    <div style="font-weight:bold; margin-top:5px;">House</div>
                    <small>منزل</small>
                </div>
                <div style="background:rgba(255,255,255,0.08); padding:15px; border-radius:15px; text-align:center; cursor:pointer;" onclick="speak('Sun')">
                    <span style="font-size:3.5rem;">☀️</span>
                    <div style="font-weight:bold; margin-top:5px;">Sun</div>
                    <small>شمس</small>
                </div>
            </div>
        `;
    } else if (type === 'dialogues') {
        details.innerHTML = `
            <h2>💬 محادثات الحياة اليومية الشاملة</h2>
            <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:15px; margin-bottom:12px;">
                <h3>1. في المدرسة والتعارف (At School)</h3>
                <p><b>Ali:</b> Hello! My name is Ali. What is your name?</p>
                <p style="color:#4DEAEA;">(مرحباً! اسمي علي. ما اسمك؟)</p>
                <p><b>Youssef:</b> Hi Ali! I am Youssef. Nice to meet you.</p>
                <p style="color:#4DEAEA;">(أهلاً يا علي! أنا يوسف. تشرفت بهدك.)</p>
                <button style="margin-top:8px; background:#3b82f6; color:#fff; border:none; padding:8px 15px; border-radius:10px; cursor:pointer;" onclick="speak('Hello! My name is Ali. Hi Ali! I am Youssef.')">🔊 استمع للمحادثة</button>
            </div>
            <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:15px;">
                <h3>2. في السوبرماركت (At the Supermarket)</h3>
                <p><b>Customer:</b> How much is this milk?</p>
                <p style="color:#4DEAEA;">(كم سعر هذا الحليب؟)</p>
                <p><b>Seller:</b> It is 2 dollars.</p>
                <p style="color:#4DEAEA;">(سعرها 2 دولار.)</p>
            </div>
        `;
    } else if (type === 'stories') {
        details.innerHTML = `
            <h2>📕 القصص التعليمية الموسعة</h2>
            <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:15px;">
                <h3>The Clever Crow (الغراب الذكي) 🐦</h3>
                <p>On a hot summer day, a crow was very thirsty. He found a pitcher with very little water at the bottom. He could not reach it with his beak. The clever crow picked up small stones and dropped them into the pitcher one by one. The water level rose up, and the crow drank happily!</p>
                <p style="color:#4DEAEA; margin-top:8px;">(في يوم صيفي حار، عطش الغراب بشدة ووجد إبريقاً فيه ماء قليل. جمع الحصى وأسقطها داخله ليرتفع الماء ويشرب بسعادة!)</p>
                <button style="margin-top:10px; background:#3b82f6; color:#fff; border:none; padding:8px 15px; border-radius:10px; cursor:pointer;" onclick="speak('On a hot summer day, a crow was very thirsty and drank happily.')">🔊 استمع للقصة</button>
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
    { nameEn: "Monkey", nameAr: "قرد", emoji: "🐒" },
    { nameEn: "Giraffe", nameAr: "زرافة", emoji: "🦒" },
    { nameEn: "Cat", nameAr: "قطة", emoji: "🐱" },
    { nameEn: "Dog", nameAr: "كلب", emoji: "🐶" },
    { nameEn: "Bird", nameAr: "عصفور", emoji: "🐦" },
    { nameEn: "Duck", nameAr: "بطة", emoji: "🦆" }
];

const INF_COLORS = [
    { nameEn: "Red", nameAr: "أحمر", hex: "#ef4444" },
    { nameEn: "Blue", nameAr: "أزرق", hex: "#3b82f6" },
    { nameEn: "Green", nameAr: "أخضر", hex: "#10b981" },
    { nameEn: "Yellow", nameAr: "أصفر", hex: "#f59e0b" }
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
        document.getElementById('gameCategoryTag').innerText = "🦁 تحدي الحيوانات والطيور الذكي";
        document.getElementById('gameVisualArena').innerHTML = `<div style="font-size: 4.5rem;">${item.emoji}</div>`;
        document.getElementById('gameQuestionText').innerText = "ما اسم هذا الكائن بالإنجليزية؟";
        infCorrectAnswer = item.nameEn;
        infWordToSpeak = item.nameEn;
        if (speakBtn) speakBtn.style.display = 'inline-block';
        renderInfOptions([item, ...getRandom(INF_ANIMALS, item, 3)].map(c => ({ text: c.nameEn, val: c.nameEn, sub: c.nameAr })));
    } else if (chosenType === 'colors') {
        const col = INF_COLORS[Math.floor(Math.random() * INF_COLORS.length)];
        document.getElementById('gameCategoryTag').innerText = "🎨 تحدي الألوان والمربعات";
        document.getElementById('gameVisualArena').innerHTML = `<div style="width:75px; height:75px; background-color:${col.hex}; border-radius:18px; border:3px solid #fff;"></div>`;
        document.getElementById('gameQuestionText').innerText = "ما هو هذا اللون بالإنجليزية؟";
        infCorrectAnswer = col.nameEn;
        infWordToSpeak = col.nameEn;
        if (speakBtn) speakBtn.style.display = 'inline-block';
        renderInfOptions([col, ...getRandom(INF_COLORS, col, 3)].map(c => ({ text: c.nameEn, val: c.nameEn, sub: c.nameAr })));
    } else {
        const count = Math.floor(Math.random() * 4) + 2;
        const anim = INF_ANIMALS[Math.floor(Math.random() * INF_ANIMALS.length)];
        document.getElementById('gameCategoryTag').innerText = "🔢 حديقة الأرقام والعد";
        document.getElementById('gameQuestionText').innerText = "كم عدد العناصر في المربع؟";
        let icons = "";
        for (let i = 0; i < count; i++) icons += `<span style="font-size:2.3rem;">${anim.emoji}</span>`;
        document.getElementById('gameVisualArena').innerHTML = `<div>${icons}</div>`;
        infCorrectAnswer = count.toString();
        let nums = [count];
        while (nums.length < 4) {
            let r = Math.floor(Math.random() * 7) + 1;
            if (!nums.includes(r)) nums.push(r);
        }
        renderInfOptions(nums.sort(() => Math.random() - 0.5).map(n => ({ text: n.toString(), val: n.toString(), sub: "عنصر" })));
    }
}

function getRandom(arr, exclude, count) {
    return arr.filter(i => i !== exclude).sort(() => Math.random() - 0.5).slice(0, count);
}

function renderInfOptions(opts) {
    const container = document.getElementById('gameOptionsGrid');
    if (!container) return;
    container.innerHTML = '';
    opts.sort(() => Math.random() - 0.5).forEach(opt => {
        const btn = document.createElement('button');
        btn.style.cssText = "background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 12px; border-radius: 14px; font-weight: bold; font-size: 1.1rem; cursor: pointer;";
        btn.innerHTML = `<div>${opt.text}</div><small style="opacity:0.7; font-size:0.8rem;">${opt.sub || ''}</small>`;
        btn.onclick = () => {
            if (infLock) return;
            infLock = true;
            if (opt.val === infCorrectAnswer) {
                btn.style.background = "#10b981";
                playSound('success');
                let score = document.getElementById('userScore');
                if (score) score.innerText = parseInt(score.innerText) + 15;
                if (infWordToSpeak) speak(infWordToSpeak);
            } else {
                btn.style.background = "#ef4444";
                playSound('error');
            }
            setTimeout(startInfiniteKidsGame, 1400);
        };
        container.appendChild(btn);
    });
}

function speakCurrentGameWord() {
    if (infWordToSpeak) speak(infWordToSpeak);
}

function toggleSpeech() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recog = new SpeechRecognition();
        recog.lang = 'ar-SA';
        recog.onresult = (e) => {
            let t = e.results[0][0].transcript;
            document.getElementById('arText').innerText = t;
            translateText(t);
        };
        recog.start();
    }
}

async function translateText(text) {
    try {
        let res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ar|en`);
        let data = await res.json();
        if (data && data.responseData) {
            document.getElementById('enText').innerText = data.responseData.translatedText;
        }
    } catch (e) {}
}

function speakEnglish() { speak(document.getElementById('enText').innerText); }
function speak(txt) {
    if ('speechSynthesis' in window && txt) {
        let u = new SpeechSynthesisUtterance(txt);
        u.lang = 'en-US';
        window.speechSynthesis.speak(u);
    }
}

function initCanvas() {
    canvas = document.getElementById('traceCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2ED573';
    
    canvas.addEventListener('mousedown', (e) => { isDrawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); });
    canvas.addEventListener('mousemove', (e) => { if (!isDrawing) return; ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); });
    canvas.addEventListener('mouseup', () => { isDrawing = false; });
    
    // دعم الأجهزة اللمسية (الهواتف المحمولة)
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
        ctx.stroke();
    });
    canvas.addEventListener('touchend', () => { isDrawing = false; });
}

// دالة مسح الشاشة المعدلة لتعمل تماماً وبشكل صحيح
function clearBoard() { 
    if (ctx && canvas) {
        ctx.clearRe
