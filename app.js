// Register Service Worker for PWA
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
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                document.getElementById('install-banner').style.display = 'none';
            }
            deferredPrompt = null;
        });
    }
}

// PIN System
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
        msg.innerText = "❌ يرجى كتابة رقم سري مكون من 4 أرقام على الأقل.";
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

let currentSelectedLetter = 'A';
let currentPoints = parseInt(localStorage.getItem('user_points') || '0');
document.getElementById('points-display').innerText = `⭐ ${currentPoints} نقطة`;

function addPoints(pts) {
    currentPoints += pts;
    localStorage.setItem('user_points', currentPoints);
    document.getElementById('points-display').innerText = `⭐ ${currentPoints} نقطة`;
}

function showSection(id) {
    document.querySelectorAll('.section-view').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ==================== 1. القاموس الضخم والبحث الشامل ====================
const COMPREHENSIVE_DICTIONARY = [
    {en: 'Apple', ar: 'تفاحة', cat: 'فواكه'}, {en: 'Banana', ar: 'موز', cat: 'فواكه'}, {en: 'Orange', ar: 'برتقال', cat: 'فواكه'},
    {en: 'Cat', ar: 'قطة', cat: 'حيوانات'}, {en: 'Dog', ar: 'كلب', cat: 'حيوانات'}, {en: 'Elephant', ar: 'فيل', cat: 'حيوانات'},
    {en: 'Lion', ar: 'أسد', cat: 'حيوانات'}, {en: 'Tiger', ar: 'نمر', cat: 'حيوانات'}, {en: 'School', ar: 'مدرسة', cat: 'تعليم'},
    {en: 'Teacher', ar: 'معلم', cat: 'تعليم'}, {en: 'Student', ar: 'طالب', cat: 'تعليم'}, {en: 'Book', ar: 'كتاب', cat: 'تعليم'},
    {en: 'Doctor', ar: 'طبيب', cat: 'مهن'}, {en: 'Engineer', ar: 'مهندس', cat: 'مهن'}, {en: 'Computer', ar: 'حاسوب', cat: 'تكنولوجيا'},
    {en: 'Internet', ar: 'إنترنت', cat: 'تكنولوجيا'}, {en: 'Read', ar: 'يقرأ', cat: 'أفعال'}, {en: 'Write', ar: 'يكتب', cat: 'أفعال'},
    {en: 'Happy', ar: 'سعيد', cat: 'صفات'}, {en: 'Smart', ar: 'ذكي', cat: 'صفات'}
];

function renderDictionary(filterText = '') {
    const dictContainer = document.getElementById('dict-container');
    const cleanFilter = filterText.trim().toLowerCase();
    
    let filtered = COMPREHENSIVE_DICTIONARY.filter(w => 
        w.en.toLowerCase().includes(cleanFilter) || w.ar.includes(cleanFilter)
    );

    let customSearchHTML = '';
    // إمكانية البحث المفتوح الشامل لو الكلمة من خارج التطبيق
    if (cleanFilter.length > 0 && filtered.length === 0) {
        customSearchHTML = `
            <div class="interactive-card" style="border:2px solid var(--accent-green); text-align:center;">
                <h3 style="color:var(--accent-yellow);">🔍 نتيجة البحث الشامل للكلمة: "${filterText}"</h3>
                <p style="margin:10px 0; color:var(--text-dim);">يمكنك النطق الفوري للكلمة التي كتبت للتعلم:</p>
                <button class="btn-action" onclick="speak('${filterText}')">🔊 نطق الكلمة المكتوبة (${filterText})</button>
            </div>
        `;
    }

    dictContainer.innerHTML = `
        <div style="margin-bottom:15px;">
            <input type="text" id="dict-search-input" value="${filterText}" placeholder="🔍 اكتب أي كلمة بالإنجليزية أو العربية هنا للبحث والتعلم..." style="width:100%; padding:12px; border-radius:10px; border:2px solid var(--accent-blue); background:#121324; color:#fff; font-size:1rem;" oninput="renderDictionary(this.value)">
        </div>
        ${customSearchHTML}
        <div class="word-list">
            ${filtered.map(w => `
                <div class="word-card" onclick="speak('${w.en}')">
                    <div>
                        <span class="word-en">🔊 ${w.en}</span>
                        <span style="font-size:0.75rem; color:var(--accent-purple); display:block;">[${w.cat}]</span>
                    </div>
                    <span class="word-ar">${w.ar}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// ==================== 2. قسم القواعد الشامل المفصل جداً ====================
function renderGrammar() {
    const container = document.getElementById('grammar-container');
    container.innerHTML = `
        <div class="interactive-card">
            <h2 style="color:var(--accent-yellow); margin-bottom:10px;">📚 الموسوعة القواعدية الشاملة للغة الإنجليزية</h2>
            <p style="color:var(--text-dim); line-height:1.6;">شرح وافٍ ومفصل لجميع أركان القواعد من التأسيس حتى الاحتراف.</p>
        </div>

        <!-- 1. الضمائر -->
        <div class="interactive-card">
            <h3 style="color:var(--accent-green);">1. ضمائر اللغة الإنجليزية الشاملة (Pronouns)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.6;">
                الضمير هو كلمة تُستخدم للتعويض عن الاسم لمنع التكرار، وتنقسم إلى 4 أنواع رئيسية:<br><br>
                <b>أ. ضمائر الفاعل (Subject Pronouns):</b> تأتي في بداية الجملة قبل الفعل.<br>
                • <b>I</b> (أنا) | <b>He</b> (هو) | <b>She</b> (هي) | <b>It</b> (هو/هي لغير العاقل)<br>
                • <b>We</b> (نحن) | <b>You</b> (أنت/أنتِ/أنتم) | <b>They</b> (هم/هن)<br><br>
                <b>ب. ضمائر المفعول به (Object Pronouns):</b> تأتي بعد الفعل أو حرف الجر.<br>
                • Me, Him, Her, It, Us, You, Them.<br><br>
                <b>ج. صفات الملكية (Possessive Adjectives):</b> يأتي بعدها اسم يمتلكه الشخص.<br>
                • My book (كتابي), His car (سيارته), Her pen (قلمها).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('I am a student. He plays football. She helps me. This is my book.')">🔊 استمع لشرح الضمائر</button>
        </div>

        <!-- 2. الأزمنة بالتفصيل -->
        <div class="interactive-card">
            <h3 style="color:var(--accent-green);">2. شرح الأزمنة الرئيسية بالتفصيل (English Tenses)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.6;">
                <b>أولاً: زمن المضارع البسيط (Present Simple Tense)</b><br>
                • <b>الاستخدام:</b> يعبر عن الحقائق العلمية والعادات اليومية الثابتة.<br>
                • <b>التكوين:</b> مع (I/We/They/You) نضع الفعل مجرد. مع (He/She/It) نُضيف للفعل (s) أو (es).<br>
                • <b>أمثلة:</b> He plays tennis every Friday. / Earth goes around the Sun.<br><br>
                
                <b>ثانياً: زمن المضارع المستمر (Present Continuous Tense)</b><br>
                • <b>الاستخدام:</b> يعبر عن حدث يقع الآن في هذه اللحظة أثناء الكلام.<br>
                • <b>التكوين:</b> (am / is / are) + الفعل + ing.<br>
                • <b>أمثلة:</b> She is reading a book right now. / They are playing.<br><br>

                <b>ثالثاً: زمن الماضي البسيط (Past Simple Tense)</b><br>
                • <b>الاستخدام:</b> يعبر عن حدث بدأ وانتهى تماماً في الماضي في وقت محدد.<br>
                • <b>التكوين:</b> التصريف الثاني للفعل (إضافة ed للأفعال المنتظمة أو حفظ الشاذ).<br>
                • <b>أمثلة:</b> I visited Alexandria yesterday.<br><br>

                <b>رابعاً: زمن المستقبل البسيط (Future Simple Tense)</b><br>
                • <b>الاستخدام:</b> يعبر عن أحداث وخطط مستقبلية أو قرارات سريعة.<br>
                • <b>التكوين:</b> Will + الفعل في المصدر.<br>
                • <b>أمثلة:</b> I will travel next week.
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('I play football. She is reading now. I visited Alexandria yesterday. I will travel next week.')">🔊 استمع لأمثلة الأزمنة</button>
        </div>

        <!-- 3. الأفعال الناقصة وحروف الجر -->
        <div class="interactive-card">
            <h3 style="color:var(--accent-green);">3. الأفعال الناقصة وحروف الجر (Modals & Prepositions)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.6;">
                <b>أ. الأفعال الناقصة (Modals):</b> أفعال تأتي بعدها الأفعال في المصدر:<br>
                • <b>Can:</b> للقدرة (I can speak English).<br>
                • <b>Must:</b> للالزام والضرورة (You must follow rules).<br>
                • <b>Should:</b> للنصيحة (You should eat healthy food).<br><br>

                <b>ب. حروف الجر الزمانية والمكانية (Prepositions):</b><br>
                • <b>In:</b> مع الأشهر والسنوات والأجواء (in 2026, in the morning).<br>
                • <b>On:</b> مع الأيام والتواريخ (on Friday, on my birthday).<br>
                • <b>At:</b> مع الأوقات المحددة (at 5 o'clock, at night).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('I can speak English. You should study. We meet at 5 o clock on Friday.')">🔊 استمع للتطبيقات</button>
        </div>
    `;
}

// ==================== 3. المحادثات الشاملة ====================
const CONVERSATIONS = [
    {
        title: "💬 1. التعارف واللقاء الأول (Greetings & Introductions)",
        text: "Hello! Good morning. My name is Alex. What is your name? My name is Ghazaal. Nice to meet you. I am fine, thank you!",
        desc: "حوار شامل في التعريف عن النفس والاستقبال."
    },
    {
        title: "💬 2. في المدرسة والمكتبة (At School & Library)",
        text: "Excuse me, where can I find the science books? They are on the second shelf on your right. Thank you so much for your help!",
        desc: "حوار السؤال عن الأماكن والتعليمات."
    },
    {
        title: "💬 3. في المطعم والتسوق (Restaurant & Shopping)",
        text: "Welcome! May I take your order? Yes, I would like a chicken sandwich and fresh orange juice, please. Here you are!",
        desc: "حوار الطلب والتعامل الشائع في المطاعم والمحلات."
    }
];

function renderStories() {
    const container = document.getElementById('stories-container');
    container.innerHTML = CONVERSATIONS.map(c => `
        <div class="interactive-card" onclick="speak('${c.text}')">
            <h3 style="color:var(--accent-green);">${c.title}</h3>
            <p style="margin-top:8px; color:var(--accent-yellow); font-size:1.05rem;">"${c.text}"</p>
            <small style="color:var(--text-dim); display:block; margin-top:8px;">${c.desc} (اضغط للاستماع)</small>
        </div>
    `).join('');
}

// ==================== 4. قسم الألعاب مع الصوت التفاعلي المباشر ====================
let currentQuizWord = null;

function generateInfiniteQuestion() {
    const quizBox = document.getElementById('quiz-box');
    currentQuizWord = COMPREHENSIVE_DICTIONARY[Math.floor(Math.random() * COMPREHENSIVE_DICTIONARY.length)];
    
    let wrongOptions = COMPREHENSIVE_DICTIONARY.filter(w => w.en !== currentQuizWord.en)
                                             .sort(() => 0.5 - Math.random())
                                             .slice(0, 3);
    
    let allOptions = [...wrongOptions, currentQuizWord].sort(() => 0.5 - Math.random());

    quizBox.innerHTML = `
        <h3 style="color:var(--accent-yellow); margin-bottom:10px;">🎮 لعبة النطق والتحدي التفاعلي</h3>
        <p style="color:var(--text-dim); margin-bottom:10px;">استمع للكلمة جيداً واختر معناها الصحيح:</p>
        
        <div style="text-align:center; margin:15px 0;">
            <button class="btn-action" style="background:var(--accent-purple); font-size:1.2rem;" onclick="speak('${currentQuizWord.en}')">🔊 إعادة نطق الكلمة (${currentQuizWord.en})</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
            ${allOptions.map(opt => `
                <button class="btn-action" style="background:#2d3154;" onclick="checkInfiniteAnswer('${opt.en}', '${currentQuizWord.en}')">${opt.ar}</button>
            `).join('')}
        </div>
    `;

    // نطق الكلمة للطفل تلقائياً فور ظهور السؤال!
    setTimeout(() => {
        speak(currentQuizWord.en);
    }, 300);
}

function checkInfiniteAnswer(selectedEn, correctEn) {
    if (selectedEn === correctEn) {
        // نطق صوتي للإجابة الصحيحة!
        speak('Well done! Excellent!');
        alert('إجابة صحيحة! 🎉 أحسنت ممتاز! +10 نقاط');
        addPoints(10);
    } else {
        // نطق صوتي عند الخطأ!
        speak('Try again');
        alert(`إجابة خاطئة! ❌ الإجابة الصحيحة هي: ${COMPREHENSIVE_DICTIONARY.find(w => w.en === correctEn).ar}`);
    }
    // الانتقال للكلمة التالية
    generateInfiniteQuestion();
}

// ==================== Alphabet Board Code ====================
const alphabetContainer = document.getElementById('alphabet-container');
if (alphabetContainer) {
    for (let i = 65; i <= 90; i++) {
        const char = String.fromCharCode(i);
        const div = document.createElement('div');
        div.className = 'letter-card';
        div.innerText = char;
        div.onclick = () => selectLetter(char);
        alphabetContainer.appendChild(div);
    }
}

function selectLetter(char) {
    currentSelectedLetter = char;
    document.getElementById('current-letter-title').innerText = `✏️ سبورة الرسم والتتبع (الحرف: ${char})`;
    speak(char);
    clearCanvas();
}

function speakCurrentLetter() {
    speak(currentSelectedLetter);
}

const canvas = document.getElementById('draw-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let isDrawing = false;

function clearCanvas() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 110px Segoe UI";
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(currentSelectedLetter, canvas.width / 2, canvas.height / 2);
}

if (canvas) {
    function startDrawing(e) { isDrawing = true; draw(e); }
    function stopDrawing() { isDrawing = false; ctx.beginPath(); }
    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        ctx.lineWidth = 10;
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

function setStage(stage, btn) {
    document.querySelectorAll('.stage-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// Initial Loading
renderDictionary();
renderGrammar();
renderStories();
generateInfiniteQuestion();
if (canvas) clearCanvas();
