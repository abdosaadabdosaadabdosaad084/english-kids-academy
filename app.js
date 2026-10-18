// Web Audio API Synthesis Engine
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

// Speech Engine
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

// ==================== 1. القاموس الموسع الحقيقي كمحرك بحث جوجل ====================
const COMPREHENSIVE_DICTIONARY = [
    // الحياة اليومية والمطاعم والكافيهات
    {en: 'Restaurant', ar: 'مطعم', example: 'We had a delicious dinner at the restaurant.', cat: 'مطاعم'},
    {en: 'Coffee', ar: 'قهوة', example: 'I drink hot coffee at the cafe.', cat: 'كافيهات'},
    {en: 'Menu', ar: 'قائمة الطعام', example: 'Could you bring me the menu, please?', cat: 'مطاعم'},
    {en: 'Airport', ar: 'المطار', example: 'The plane lands at the airport on time.', cat: 'المطار والسفر'},
    {en: 'Ticket', ar: 'تذكرة', example: 'I booked my flight ticket online.', cat: 'السفر'},
    {en: 'Hospital', ar: 'مستشفى', example: 'The doctor works in the hospital.', cat: 'المستشفى'},
    {en: 'Medicine', ar: 'دواء', example: 'Take your medicine after breakfast.', cat: 'المستشفى'},
    {en: 'Bus', ar: 'حافلة / أوتوبيس', example: 'I take the bus to go to school.', cat: 'المواصلات'},
    {en: 'Train', ar: 'قطار', example: 'The train travels fast across cities.', cat: 'المواصلات'},
    {en: 'Sea', ar: 'البحر', example: 'The sea water is blue and clean in Alexandria.', cat: 'البحر والتنزه'},
    {en: 'Beach', ar: 'شاطئ', example: 'Children play with sand on the beach.', cat: 'البحر والتنزه'},
    {en: 'City', ar: 'مدينة', example: 'Alexandria is a beautiful coastal city.', cat: 'المدن والقرى'},
    {en: 'Village', ar: 'قرية', example: 'Life in the village is quiet and peaceful.', cat: 'المدن والقرى'},
    {en: 'Pray', ar: 'يصلي', example: 'Muslims pray five times a day in the mosque.', cat: 'الدين والعبادات'},
    {en: 'Mosque', ar: 'مسجد', example: 'The mosque is near our house.', cat: 'الدين والعبادات'},
    {en: 'School', ar: 'مدرسة', example: 'Ghazaal learns English at school.', cat: 'المدرسة والتعليم'}
];

// محرك بحث القاموس الفوري المفتوح عبر Online Translation API
async function searchGoogleStyleDictionary(term) {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;

    const dictContainer = document.getElementById('dict-container');
    
    // البحث الفوري في القاموس الخارجي المفتوح
    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanTerm)}&langpair=ar|en`);
        const data = await res.json();
        const englishTranslation = data.responseData.translatedText;

        renderDictionaryHTML(cleanTerm, englishTranslation);
    } catch (err) {
        renderDictionaryHTML(cleanTerm, cleanTerm);
    }
}

function renderDictionaryHTML(searchTerm = '', liveTranslation = '') {
    const dictContainer = document.getElementById('dict-container');
    const cleanFilter = searchTerm.trim().toLowerCase();
    
    let filtered = COMPREHENSIVE_DICTIONARY.filter(w => 
        w.en.toLowerCase().includes(cleanFilter) || w.ar.includes(cleanFilter)
    );

    let searchEngineHTML = '';
    if (cleanFilter.length > 0) {
        searchEngineHTML = `
            <div class="interactive-card" style="border:2px solid var(--accent-green); text-align:right;">
                <h3 style="color:var(--accent-yellow);">🌐 نتيجة البحث الفوري لمُحرك جوجل المورد:</h3>
                <p style="color:#fff; font-size:1.1rem; margin:8px 0;"><b>الكلمة / النص:</b> "${searchTerm}"</p>
                <p style="color:var(--accent-green); font-size:1.2rem;"><b>الترجمة والمعنى بالإنجليزية:</b> "${liveTranslation}"</p>
                <button class="btn-action" style="margin-top:10px;" onclick="speak('${liveTranslation}')">🔊 نطق النتيجة بالإنجليزية</button>
            </div>
        `;
    }

    dictContainer.innerHTML = `
        <input type="text" id="dict-search-input" value="${searchTerm}" placeholder="🔍 ابحث في القاموس كـ محرك جوجل عن أي كلمة أو مجال..." style="width:100%; padding:10px; border-radius:10px; border:2px solid var(--accent-blue); background:#121324; color:#fff; margin-bottom:12px;" oninput="searchGoogleStyleDictionary(this.value)">
        ${searchEngineHTML}
        <div class="word-list">
            ${filtered.map(w => `
                <div class="word-card" style="flex-direction:column; align-items:flex-start; gap:6px;" onclick="speak('${w.en}. Example: ${w.example}')">
                    <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                        <span class="word-en">🔊 ${w.en}</span>
                        <span class="word-ar">${w.ar} <small style="color:var(--accent-purple);">[${w.cat}]</small></span>
                    </div>
                    <div style="font-size:0.8rem; color:var(--accent-yellow);">💬 مثال: "${w.example}"</div>
                </div>
            `).join('')}
        </div>
    `;
}

// ==================== 2. موسوعة قواعد اللغة الإنجليزية الشاملة من A لـ Z ====================
function renderGrammar() {
    const container = document.getElementById('grammar-container');
    container.innerHTML = `
        <div class="interactive-card">
            <h3 style="color:var(--accent-yellow);">📘 1. الضمائر كاملة وأقسام الكلام (Pronouns System)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.7;">
                • <b>ضمائر الفاعل (Subject):</b> I, He, She, It, We, You, They (في أول الجملة قبل الفعل).<br>
                • <b>ضمائر المفعول (Object):</b> Me, Him, Her, It, Us, You, Them (بعد الفعل أو حرف الجر).<br>
                • <b>صفات الملكية (Possessive Adjectives):</b> My, His, Her, Its, Our, Your, Their (يتبعها اسم).<br>
                • <b>ضمائر الملكية (Possessive Pronouns):</b> Mine, His, Hers, Ours, Yours, Theirs (تأتي في نهاية الجملة بدون اسم).<br><br>
                <b>أمثلة وافية ومفصلة:</b><br>
                - <i>I study English every day.</i> (أنا أدرس الإنجليزية يومياً).<br>
                - <i>The teacher called him in the office.</i> (المعلم اتصل به في المكتب).<br>
                - <i>This book is mine.</i> (هذا الكتاب ملكي).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('I study English every day. The teacher called him. This book is mine.')">🔊 استمع للشرح والأمثلة</button>
        </div>

        <div class="interactive-card">
            <h3 style="color:var(--accent-yellow);">📘 2. زمن المضارع البسيط والمستمر (Present Simple & Continuous)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.7;">
                • <b>المضارع البسيط:</b> للعادات والحقائق والثوابت. (He/She/It + V+s | I/We/They + V).<br>
                • <b>المضارع المستمر:</b> لأحداث تقع الآن لحظة الكلام. (am/is/are + Verb + ing).<br><br>
                <b>أمثلة وافية:</b><br>
                - <i>The sun rises in the east.</i> (تشرق الشمس من الشرق - حقيقة).<br>
                - <i>She is reading a story right now.</i> (هي تقرأ قصة الآن - حدث مستمر).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('The sun rises in the east. She is reading a story right now.')">🔊 استمع للمضارع البسيط والمستمر</button>
        </div>

        <div class="interactive-card">
            <h3 style="color:var(--accent-yellow);">📘 3. زمن الماضي البسيط والمستمر (Past Simple & Continuous)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.7;">
                • <b>الماضي البسيط:</b> حدث مكتمل ومقترن بوقت في الماضي (V2 أو إضافة ed).<br>
                • <b>الماضي المستمر:</b> حدث كان مستمراً في الماضي عند وقوع حدث آخر. (was/were + Verb + ing).<br><br>
                <b>أمثلة وافية:</b><br>
                - <i>I visited Alexandria yesterday.</i> (زرت الإسكندرية أمس).<br>
                - <i>I was studying when the phone rang.</i> (كنت أذاكر عندما رن الهاتف).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('I visited Alexandria yesterday. I was studying when the phone rang.')">🔊 استمع للماضي البسيط والمستمر</button>
        </div>

        <div class="interactive-card">
            <h3 style="color:var(--accent-yellow);">📘 4. المستقبل وأدوات الشرط (Future & If Conditionals)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.7;">
                • <b>المستقبل (Will / Going to):</b> للتنبؤ والقرارات والتخطيط القادم.<br>
                • <b>قاعدة الشرط IF:</b><br>
                - <i>الحالة الأولى: If + مضارع بسيط ➔ Will + المصدر</i><br><br>
                <b>أمثلة وافية:</b><br>
                - <i>We will travel to Cairo tomorrow.</i> (سنقود السفر غداً).<br>
                - <i>If you study hard, you will pass the exam.</i> (إن تذاكر بجد تنجح في الامتحان).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('We will travel to Cairo tomorrow. If you study hard, you will pass the exam.')">🔊 استمع للمستقبل والشرط</button>
        </div>
    `;
}

// ==================== 3. المترجم الصوتي الحر المباشر (مثل جوجل محرك بحث) ====================
async function startSpeechRecognition() {
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

    btn.innerText = "🎙️ جاري الاستماع صوتياً... اتكلم الآن بالعربية";
    btn.style.background = "var(--accent-pink)";

    recognition.start();

    recognition.onresult = async (event) => {
        const arabicSpeech = event.results[0][0].transcript.trim();
        btn.innerText = "🎤 اضغط هنا والتحدث بالعربية";
        btn.style.background = "var(--accent-purple)";

        resultDiv.innerHTML = `<p style="color:var(--accent-yellow);">🔄 جاري الترجمة عبر محرك جوجل الترجمي...</p>`;

        try {
            // الاستعانة بمحرك ترجمة خارجي حر لتغطية كافة الكلمات
            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(arabicSpeech)}&langpair=ar|en`);
            const data = await res.json();
            const translatedText = data.responseData.translatedText;

            resultDiv.innerHTML = `
                <div style="background:#191b33; padding:12px; border-radius:10px; border:1px solid var(--accent-green); text-align:right;">
                    <p style="color:var(--accent-yellow); font-size:0.9rem;">🗣️ المقول بالعربية: "<b>${arabicSpeech}</b>"</p>
                    <p style="color:#fff; font-size:1.2rem; margin-top:6px;">🌐 الترجمة الإنجليزية الفورية: <b style="color:var(--accent-green);">${translatedText}</b></p>
                    <button class="btn-action" style="margin-top:10px;" onclick="speak('${translatedText}')">🔊 نطق الترجمة فوراً</button>
                </div>
            `;
            speak(translatedText);
        } catch (e) {
            resultDiv.innerHTML = `<p style="color:var(--accent-pink);">❌ تعذر الاتصال بالترجمة الحرة، تأكد من الاتصال بالإنترنت.</p>`;
        }
    };

    recognition.onerror = () => {
        btn.innerText = "🎤 اضغط هنا والتحدث بالعربية";
        btn.style.background = "var(--accent-purple)";
        resultDiv.innerHTML = `<p style="color:var(--accent-pink);">❌ لم يتم التقاط الصوت بوضوح، أعد المحاولة.</p>`;
    };
}

// ==================== 4. المجموعات والتصنيفات في الحياة اليومية ====================
const CATEGORIES_DATA = [
    { title: "🔢 الأرقام والأعداد (Numbers)", items: [{en: "One (1)", ar: "واحد"}, {en: "Ten (10)", ar: "عشرة"}, {en: "One Hundred (100)", ar: "مائة"}, {en: "One Thousand (1000)", ar: "ألف"}] },
    { title: "✈️ المطار والسفر (Airport & Travel)", items: [{en: "Passport", ar: "جواز سفر"}, {en: "Flight", ar: "رحلة طيران"}, {en: "Luggage", ar: "أمتعة وحقائب"}] },
    { title: "🏥 المستشفى والطب (Hospital)", items: [{en: "Doctor", ar: "طبيب"}, {en: "Nurse", ar: "ممرضة"}, {en: "Pharmacy", ar: "صيدلية"}] },
    { title: "🕌 الدين والعبادات (Religion)", items: [{en: "Mosque", ar: "مسجد"}, {en: "Pray", ar: "صلاة / يصلي"}, {en: "Quran", ar: "القرآن الكريم"}] }
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

// ==================== 5. المحادثات الشاملة (سؤال وجواب) ====================
const CONVERSATIONS = [
    {
        title: "💬 1. في المطار والسفر (At the Airport)",
        dialogue: [
            { speaker: "Officer", text: "May I see your passport and ticket, please?", ar: "هل يمكنني رؤية جواز سفرك وتذكرتك من فضلك؟" },
            { speaker: "Passenger", text: "Here you are. What time is my flight?", ar: "تفضل هنا. في أي وقت رحلتي؟" },
            { speaker: "Officer", text: "Your flight departs at five o'clock. Have a good flight!", ar: "ستغادر رحلتك في الساعة الخامسة. أتمنى لك رحلة ممتعة!" }
        ]
    },
    {
        title: "💬 2. في المطعم والكافيه (At the Restaurant)",
        dialogue: [
            { speaker: "Waiter", text: "Welcome! What would you like to order today?", ar: "أهلاً بك! ماذا تحب أن تطلب اليوم؟" },
            { speaker: "Customer", text: "I would like a fresh orange juice and grilled chicken, please.", ar: "أريد عصير برتقال طازج ودجاج مشوي من فضلك." }
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

// ==================== 7. السبورة والتنقل اللمسي الفوري عند النقر ====================
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
    speak(`${char}. Letter ${char}`);
    clearCanvas();
}

function nextLetter() {
    currentLetterCode++;
    if (currentLetterCode > 90) currentLetterCode = 65;
    selectLetterCode(currentLetterCode);
}

function handleCanvasTap(e) {
    // التنقل التلقائي للحرف التالي عند الضغط على الشاشة في السبورة
    nextLetter();
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
renderDictionaryHTML();
renderGrammar();
renderStories();
renderCategories();
generateInfiniteQuestion();
if (canvas) clearCanvas();
