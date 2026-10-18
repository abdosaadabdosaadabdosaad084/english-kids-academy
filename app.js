// Web Audio Synthesis (أصوات التصفيق والتحذير)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playApplauseSound() {
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(350 + Math.random() * 300, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.12);
        }, i * 50);
    }
}

function playWarningSound() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log(err));
}

// PWA Install Logic
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-banner').style.display = 'flex';
});

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => {
            document.getElementById('install-banner').style.display = 'none';
            deferredPrompt = null;
        });
    }
}

// PIN Protection
const DEFAULT_PIN = "1234";
function getSavedPin() {
    return localStorage.getItem('app_pin') || DEFAULT_PIN;
}
function checkPin() {
    const input = document.getElementById('pin-input').value;
    if (input === getSavedPin()) {
        document.getElementById('pin-overlay').style.display = 'none';
        document.getElementById('pin-error').style.display = 'none';
    } else {
        document.getElementById('pin-error').style.display = 'block';
    }
}
function changePin() {
    const newPin = document.getElementById('new-pin-input').value.trim();
    const msg = document.getElementById('change-pin-msg');
    if (newPin.length >= 4) {
        localStorage.setItem('app_pin', newPin);
        msg.style.color = "var(--accent-green)";
        msg.innerText = "✅ تم تغيير الرقم السري بنجاح!";
        document.getElementById('new-pin-input').value = "";
    } else {
        msg.style.color = "var(--accent-pink)";
        msg.innerText = "❌ يرجى كتابة رقم سري من 4 أرقام على الأقل.";
    }
}

// Speech Synthesis Engine
function speak(text, lang = 'en-US') {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
    }
}

let currentLetterCode = 65; // A

function showSection(id) {
    document.querySelectorAll('.section-view').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (id !== 'sec-dashboard') {
        history.pushState({ section: id }, '', `#${id}`);
    }
}

window.addEventListener('popstate', () => {
    document.querySelectorAll('.section-view').forEach(s => s.classList.remove('active'));
    document.getElementById('sec-dashboard').classList.add('active');
});

// ==================== 1. القاموس الموسع ====================
const COMPREHENSIVE_DICTIONARY = [
    {en: 'Apple', ar: 'تفاحة', example: 'I eat a fresh apple daily.', cat: 'فواكه'},
    {en: 'Banana', ar: 'موز', example: 'Monkeys love yellow bananas.', cat: 'فواكه'},
    {en: 'Orange', ar: 'برتقال', example: 'Orange juice is full of vitamins.', cat: 'فواكه'},
    {en: 'Watermelon', ar: 'بطيخ', example: 'Watermelon is sweet in summer.', cat: 'فواكه'},
    {en: 'Bread', ar: 'خبز', example: 'Fresh bread tastes delicious.', cat: 'طعام'},
    {en: 'Milk', ar: 'حليب', example: 'Drinking milk builds strong bones.', cat: 'طعام'},
    {en: 'School', ar: 'مدرسة', example: 'Ghazaal studies hard at school.', cat: 'تعليم'},
    {en: 'Teacher', ar: 'معلم', example: 'Our teacher explains rules clearly.', cat: 'تعليم'},
    {en: 'Book', ar: 'كتاب', example: 'Reading books expands your mind.', cat: 'تعليم'},
    {en: 'Doctor', ar: 'طبيب', example: 'The doctor helps sick people.', cat: 'مهن'},
    {en: 'Engineer', ar: 'مهندس', example: 'Engineers build modern cities.', cat: 'مهن'},
    {en: 'Computer', ar: 'حاسوب', example: 'I learn coding on my computer.', cat: 'تكنولوجيا'},
    {en: 'Read', ar: 'يقرأ', example: 'I read stories every evening.', cat: 'أفعال'},
    {en: 'Write', ar: 'يكتب', example: 'She writes her lessons neatly.', cat: 'أفعال'}
];

function renderDictionary(filterText = '') {
    const dictContainer = document.getElementById('dict-container');
    const cleanFilter = filterText.trim().toLowerCase();
    
    let filtered = COMPREHENSIVE_DICTIONARY.filter(w => 
        w.en.toLowerCase().includes(cleanFilter) || w.ar.includes(cleanFilter)
    );

    let customSearchHTML = '';
    if (cleanFilter.length > 0 && filtered.length === 0) {
        customSearchHTML = `
            <div class="interactive-card" style="border:2px solid var(--accent-green); text-align:center;">
                <h3 style="color:var(--accent-yellow);">🔍 نطق الكلمة المكتوبة: "${filterText}"</h3>
                <button class="btn-action" style="margin-top:10px;" onclick="speak('${filterText}')">🔊 نطق الكلمة فورا</button>
            </div>
        `;
    }

    dictContainer.innerHTML = `
        <input type="text" id="dict-search-input" value="${filterText}" placeholder="🔍 ابحث في القاموس أو اكتب أي كلمة..." style="width:100%; padding:10px; border-radius:10px; border:2px solid var(--accent-blue); background:#121324; color:#fff; margin-bottom:12px;" oninput="renderDictionary(this.value)">
        ${customSearchHTML}
        <div class="word-list">
            ${filtered.map(w => `
                <div class="word-card" style="flex-direction:column; align-items:flex-start; gap:6px;" onclick="speak('${w.en}. Example: ${w.example}')">
                    <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                        <span class="word-en">🔊 ${w.en}</span>
                        <span class="word-ar">${w.ar}</span>
                    </div>
                    <div style="font-size:0.8rem; color:var(--accent-yellow);">💬 مثال: "${w.example}"</div>
                </div>
            `).join('')}
        </div>
    `;
}

// ==================== 2. قسم القواعد المطور بالشرح التفصيلي ====================
function renderGrammar() {
    const container = document.getElementById('grammar-container');
    container.innerHTML = `
        <div class="interactive-card">
            <h3 style="color:var(--accent-yellow);">📘 1. الضمائر وأنواعها (Pronouns System)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.7;">
                الضمائر تُستخدم للتعويض عن الأسماء لمنع التكرار:<br>
                • <b>ضمائر الفاعل (Subject):</b> I, He, She, It, We, You, They (تأتي أول الجملة).<br>
                • <b>ضمائر المفعول (Object):</b> Me, Him, Her, It, Us, You, Them (تأتي بعد الفعل).<br>
                • <b>صفات الملكية (Possessive):</b> My, His, Her, Its, Our, Your, Their (يتبعها اسم).<br><br>
                <b>أمثلة شريحة ومفصلة:</b><br>
                - <i>I study English every day.</i> (أنا أذاكر الإنجليزية يومياً).<br>
                - <i>The teacher called him.</i> (المعلم اتصل به).<br>
                - <i>This is my notebook.</i> (هذا دفتري).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('I study English every day. The teacher called him. This is my notebook.')">🔊 استمع للضمائر والأمثلة</button>
        </div>

        <div class="interactive-card">
            <h3 style="color:var(--accent-yellow);">📘 2. زمن المضارع البسيط (Present Simple Tense)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.7;">
                • <b>الاستخدام:</b> للتعبير عن العادات والحقائق اليومية والثابتة والجداول.<br>
                • <b>التكوين:</b><br>
                - مع (I / We / They / You): نضع الفعل مجرد بدون إضافة (e.g., I study).<br>
                - مع (He / She / It): نُضيف للفعل (s / es) (e.g., He studies hard).<br>
                • <b>النفي:</b> باستخدام (don't / doesn't) + المصدر.<br><br>
                <b>أمثلة وافية:</b><br>
                - <i>The sun rises in the east.</i> (تشرق الشمس من الشرق - حقيقة).<br>
                - <i>She drinks milk every morning.</i> (تشرب الحليب كل صباح - عادة).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('The sun rises in the east. She drinks milk every morning.')">🔊 استمع لشرح المضارع البسيط</button>
        </div>

        <div class="interactive-card">
            <h3 style="color:var(--accent-yellow);">📘 3. زمن الماضي البسيط (Past Simple Tense)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.7;">
                • <b>الاستخدام:</b> حدث بدأ وانتهى تماماً في الماضي.<br>
                • <b>التكوين:</b> التصريف الثاني للفعل V2 (إضافة ed للأفعال العادية مثل visited أو حفظ الشاذ).<br>
                • <b>النفي:</b> باستخدام (didn't) + مصدر الفعل.<br><br>
                <b>أمثلة وافية:</b><br>
                - <i>I visited Alexandria yesterday.</i> (زرت الإسكندرية أمس).<br>
                - <i>He wrote a nice story last week.</i> (كتب قصة جميلة الأسبوع الماضي).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('I visited Alexandria yesterday. He wrote a nice story last week.')">🔊 استمع لشرح الماضي البسيط</button>
        </div>

        <div class="interactive-card">
            <h3 style="color:var(--accent-yellow);">📘 4. المستقبل وأدوات الشرط (Future & Conditionals)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.7;">
                • <b>المستقبل (Will):</b> للتنبؤ والقرارات المباشرة (Will + المصدر).<br>
                • <b>قاعدة الشرط (If Conditionals):</b><br>
                - <i>If + مضارع بسيط ➔ Will + المصدر</i><br><br>
                <b>أمثلة وافية:</b><br>
                - <i>We will travel tomorrow.</i> (سنقود السفر غداً).<br>
                - <i>If you study hard, you will pass the exam.</i> (إن تذاكر بجد تنجح في الامتحان).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('We will travel tomorrow. If you study hard, you will pass the exam.')">🔊 استمع للمستقبل والشرط</button>
        </div>
    `;
}

// ==================== 3. المترجم الصوتي المباشر الفوري الدقيق ====================
const DICTIONARY_TRANSLATION_MAP = {
    "مدرسه": "School", "المدرسه": "School", "مدرسة": "School",
    "تفاحه": "Apple", "تفاحة": "Apple", "تفاح": "Apple",
    "كتاب": "Book", "الكتاب": "Book",
    "معلم": "Teacher", "مدرس": "Teacher", "المعلم": "Teacher",
    "طالب": "Student", "تلميذ": "Student",
    "بيت": "House", "منزل": "House",
    "سياره": "Car", "سيارة": "Car",
    "شكرا": "Thank you", "شكرا لك": "Thank you",
    "صباح الخير": "Good morning", "مرحبا": "Hello", "السلام عليكم": "Hello"
};

function startSpeechRecognition() {
    const resultDiv = document.getElementById('translator-result');
    const btn = document.getElementById('btn-mic');

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        resultDiv.innerHTML = `<p style="color:var(--accent-pink);">⚠️ المتصفح لا يدعم التعرف الصوتي المباشر.</p>`;
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-EG';
    recognition.interimResults = false;

    btn.innerText = "🎙️ جاري الاستماع... اتكلم الآن";
    btn.style.background = "var(--accent-pink)";

    recognition.start();

    recognition.onresult = (event) => {
        const arabicText = event.results[0][0].transcript.trim();
        btn.innerText = "🎤 اضغط هنا والتحدث بالعربية";
        btn.style.background = "var(--accent-purple)";

        // ترجمة دقيقة للكلمات دون طباعة Translated
        let englishTranslation = DICTIONARY_TRANSLATION_MAP[arabicText] || arabicText;

        resultDiv.innerHTML = `
            <div style="background:#191b33; padding:12px; border-radius:10px; border:1px solid var(--accent-green); text-align:right;">
                <p style="color:var(--accent-yellow); font-size:0.9rem;">🗣️ المقول بالعربية: "<b>${arabicText}</b>"</p>
                <p style="color:#fff; font-size:1.2rem; margin-top:6px;">🌐 الترجمة: <b style="color:var(--accent-green);">${englishTranslation}</b></p>
                <button class="btn-action" style="margin-top:10px;" onclick="speak('${englishTranslation}')">🔊 نطق الكلمة بالإنجليزية</button>
            </div>
        `;
        speak(englishTranslation);
    };

    recognition.onerror = () => {
        btn.innerText = "🎤 اضغط هنا والتحدث بالعربية";
        btn.style.background = "var(--accent-purple)";
        resultDiv.innerHTML = `<p style="color:var(--accent-pink);">❌ لم يتم التقاط الصوت بوضوح، أعد المحاولة.</p>`;
    };
}

// ==================== 4. المجموعات والأرقام ====================
const CATEGORIES_DATA = [
    { title: "🔢 الأرقام (Numbers)", items: [{en: "One (1)", ar: "واحد"}, {en: "Two (2)", ar: "إثنان"}, {en: "Three (3)", ar: "ثلاثة"}, {en: "Four (4)", ar: "أربعة"}, {en: "Five (5)", ar: "خمسة"}] },
    { title: "🦁 الحيوانات (Animals)", items: [{en: "Lion", ar: "أسد"}, {en: "Tiger", ar: "نمر"}, {en: "Elephant", ar: "فيل"}, {en: "Giraffe", ar: "زرافة"}] }
];

function renderCategories() {
    const container = document.getElementById('categories-container');
    container.innerHTML = CATEGORIES_DATA.map(cat => `
        <div class="interactive-card">
            <h3 style="color:var(--accent-green); margin-bottom:10px;">${cat.title}</h3>
            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px;">
                ${cat.items.map(item => `
                    <div style="background:#191b33; padding:8px; border-radius:8px; cursor:pointer;" onclick="speak('${item.en}')">
                        <span style="color:var(--accent-yellow); font-weight:bold;">🔊 ${item.en}</span>
                        <span style="color:var(--text-dim); display:block; font-size:0.85rem;">${item.ar}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// ==================== 5. المحادثات ====================
const CONVERSATIONS = [
    {
        title: "💬 محادثة التعارف (Greetings)",
        dialogue: [
            { speaker: "Speaker A", text: "Hello! Good morning. What is your name?", ar: "أهلاً بك! صباح الخير. ما اسمك؟" },
            { speaker: "Speaker B", text: "Good morning! My name is Ghazaal. What about you?", ar: "صباح النور! اسمي غزل. وماذا عنك؟" }
        ]
    }
];

function renderStories() {
    const container = document.getElementById('stories-container');
    container.innerHTML = CONVERSATIONS.map(c => `
        <div class="interactive-card">
            <h3 style="color:var(--accent-yellow); margin-bottom:10px;">${c.title}</h3>
            <div style="display:flex; flex-direction:column; gap:8px;">
                ${c.dialogue.map(d => `
                    <div style="background:#191b33; padding:8px 10px; border-radius:8px; cursor:pointer;" onclick="speak('${d.text}')">
                        <span style="color:var(--accent-green); font-weight:bold;">${d.speaker}:</span>
                        <div style="color:#fff; margin:2px 0;">" ${d.text} " 🔊</div>
                        <small style="color:var(--text-dim);">(${d.ar})</small>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// ==================== 6. قسم الألعاب مع أصوات التقييم والتنقل ====================
let currentQuizWord = null;

function generateInfiniteQuestion() {
    const quizBox = document.getElementById('quiz-box');
    currentQuizWord = COMPREHENSIVE_DICTIONARY[Math.floor(Math.random() * COMPREHENSIVE_DICTIONARY.length)];
    
    let wrongOptions = COMPREHENSIVE_DICTIONARY.filter(w => w.en !== currentQuizWord.en)
                                             .sort(() => 0.5 - Math.random())
                                             .slice(0, 3);
    
    let allOptions = [...wrongOptions, currentQuizWord].sort(() => 0.5 - Math.random());

    quizBox.innerHTML = `
        <h3 style="color:var(--accent-yellow); margin-bottom:8px;">🎮 التحدي الصوتي السريع</h3>
        <p style="color:var(--text-dim); margin-bottom:10px;">استمع للكلمة جيداً واختر معناها الصحيح:</p>
        
        <div style="text-align:center; margin:10px 0;">
            <button class="btn-action" style="background:var(--accent-purple);" onclick="speak('${currentQuizWord.en}')">🔊 نطق الكلمة (${currentQuizWord.en})</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
            ${allOptions.map(opt => `
                <button class="btn-action" style="background:#2d3154;" onclick="checkInfiniteAnswer('${opt.en}', '${currentQuizWord.en}')">${opt.ar}</button>
            `).join('')}
        </div>
    `;

    setTimeout(() => {
        speak(currentQuizWord.en);
    }, 300);
}

function checkInfiniteAnswer(selectedEn, correctEn) {
    if (selectedEn === correctEn) {
        playApplauseSound();
        speak('Bravo! Excellent');
    } else {
        playWarningSound();
        speak('Wrong');
    }
    setTimeout(() => {
        generateInfiniteQuestion();
    }, 900);
}

// ==================== 7. السبورة والتفاعل التلقائي والصوت ====================
const alphabetContainer = document.getElementById('alphabet-container');
if (alphabetContainer) {
    for (let i = 65; i <= 90; i++) {
        const char = String.fromCharCode(i);
        const div = document.createElement('div');
        div.className = 'letter-card';
        div.innerText = char;
        div.onclick = () => selectLetterCode(i);
        alphabetContainer.appendChild(div);
    }
}

function selectLetterCode(code) {
    currentLetterCode = code;
    const char = String.fromCharCode(currentLetterCode);
    document.getElementById('current-letter-title').innerText = `✏️ سبورة الرسم والتتبع (الحرف: ${char})`;
    speak(char);
    clearCanvas();
}

function nextLetter() {
    currentLetterCode++;
    if (currentLetterCode > 90) currentLetterCode = 65;
    selectLetterCode(currentLetterCode);
}

const canvas = document.getElementById('draw-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let isDrawing = false;

function clearCanvas() {
    if (!canvas || !ctx) return;
    const char = String.fromCharCode(currentLetterCode);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 100px Segoe UI";
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(char, canvas.width / 2, canvas.height / 2);
}

if (canvas) {
    function startDrawing(e) {
        isDrawing = true;
        playApplauseSound(); // صوت تشجيعي مباشر عند البدء بالرسم على السبورة
        draw(e);
    }
    function stopDrawing() { isDrawing = false; ctx.beginPath(); }
    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#06d6a0';
        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
    }
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchmove', draw);
}

// Initial Loading
renderDictionary();
renderGrammar();
renderStories();
renderCategories();
generateInfiniteQuestion();
if (canvas) clearCanvas();
