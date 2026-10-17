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

let currentLetterCode = 65; // A
let currentPoints = parseInt(localStorage.getItem('user_points') || '0');
document.getElementById('points-display').innerText = `⭐ ${currentPoints} نقطة`;

function addPoints(pts) {
    currentPoints += pts;
    localStorage.setItem('user_points', currentPoints);
    document.getElementById('points-display').innerText = `⭐ ${currentPoints} نقطة`;
}

// Navigation & Back-Button Handler (الرجوع داخل التطبيق)
function showSection(id) {
    document.querySelectorAll('.section-view').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    // إضافة خطوة لرسجل المتصفح لتفعيل زر الرجوع في الهاتف
    if (id !== 'sec-dashboard') {
        history.pushState({ section: id }, '', `#${id}`);
    }
}

window.addEventListener('popstate', (e) => {
    // عند الضغط على زر الرجوع الخارجي في الهاتف
    document.querySelectorAll('.section-view').forEach(s => s.classList.remove('active'));
    document.getElementById('sec-dashboard').classList.add('active');
});

// ==================== 1. القاموس الشامل الضخم (المورد) ====================
const COMPREHENSIVE_DICTIONARY = [
    {en: 'Apple', ar: 'تفاحة', cat: 'طعام وفواكه'}, {en: 'Banana', ar: 'موز', cat: 'طعام وفواكه'}, {en: 'Orange', ar: 'برتقال', cat: 'طعام وفواكه'},
    {en: 'Watermelon', ar: 'بطيخ', cat: 'طعام وفواكه'}, {en: 'Grape', ar: 'عنب', cat: 'طعام وفواكه'}, {en: 'Strawberry', ar: 'فراولة', cat: 'طعام وفواكه'},
    {en: 'Bread', ar: 'خبز', cat: 'طعام وفواكه'}, {en: 'Cheese', ar: 'جبن', cat: 'طعام وفواكه'}, {en: 'Butter', ar: 'زبدة', cat: 'طعام وفواكه'},
    {en: 'Cat', ar: 'قطة', cat: 'حيوانات'}, {en: 'Dog', ar: 'كلب', cat: 'حيوانات'}, {en: 'Elephant', ar: 'فيل', cat: 'حيوانات'},
    {en: 'Lion', ar: 'أسد', cat: 'حيوانات'}, {en: 'Tiger', ar: 'نمر', cat: 'حيوانات'}, {en: 'Giraffe', ar: 'زرافة', cat: 'حيوانات'},
    {en: 'School', ar: 'مدرسة', cat: 'تعليم'}, {en: 'Teacher', ar: 'معلم', cat: 'تعليم'}, {en: 'Student', ar: 'طالب', cat: 'تعليم'},
    {en: 'Book', ar: 'كتاب', cat: 'تعليم'}, {en: 'Pencil', ar: 'قلم رصاص', cat: 'تعليم'}, {en: 'Classroom', ar: 'فصل دراسي', cat: 'تعليم'},
    {en: 'Doctor', ar: 'طبيب', cat: 'مهن'}, {en: 'Engineer', ar: 'مهندس', cat: 'مهن'}, {en: 'Computer', ar: 'حاسوب', cat: 'تكنولوجيا'},
    {en: 'Read', ar: 'يقرأ', cat: 'أفعال'}, {en: 'Write', ar: 'يكتب', cat: 'أفعال'}, {en: 'Speak', ar: 'يتحدث', cat: 'أفعال'},
    {en: 'Happy', ar: 'سعيد', cat: 'صفات'}, {en: 'Smart', ar: 'ذكي', cat: 'صفات'}, {en: 'Strong', ar: 'قوي', cat: 'صفات'}
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
                <h3 style="color:var(--accent-yellow);">🔍 نتيجة البحث الشامل للكلمة: "${filterText}"</h3>
                <p style="margin:10px 0; color:var(--text-dim);">استمع لنطق الكلمة المكتوبة مباشرة للتعلم:</p>
                <button class="btn-action" onclick="speak('${filterText}')">🔊 نطق الكلمة المكتوبة (${filterText})</button>
            </div>
        `;
    }

    dictContainer.innerHTML = `
        <div style="margin-bottom:15px;">
            <input type="text" id="dict-search-input" value="${filterText}" placeholder="🔍 اكتب أي كلمة بالإنجليزية أو العربية هنا..." style="width:100%; padding:12px; border-radius:10px; border:2px solid var(--accent-blue); background:#121324; color:#fff; font-size:1rem;" oninput="renderDictionary(this.value)">
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

// ==================== 2. قسم القواعد الشامل التفصيلي بالكامل ====================
function renderGrammar() {
    const container = document.getElementById('grammar-container');
    container.innerHTML = `
        <div class="interactive-card">
            <h2 style="color:var(--accent-yellow); margin-bottom:10px;">📘 الشرح القواعدي المفصل والأكاديمي الشامل</h2>
            <p style="color:var(--text-dim); line-height:1.7;">تغطية كاملة لجميع الدقائق والتفاصيل والأمثلة التطبيقية للتعلم والاحتراف.</p>
        </div>

        <!-- 1. الضمائر بالتفصيل الدقيق -->
        <div class="interactive-card">
            <h3 style="color:var(--accent-green);">1. الضمائر بالتفصيل والتطبيق الشامل (Pronouns)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.8;">
                الضمائر هي كلمات تُحِل مَحَلَّ الأسماء وتُصَنَّف دقيقاً في اللغة الإنجليزية لـ 4 أقسام رئيسية:<br><br>
                <b>1. ضمائر الفاعل (Subject Pronouns):</b> (تأتي في بداية الجملة لتحدد من يقوم بالفعل)<br>
                • <b>I</b> (أنا) ➔ <i>I study every night.</i> (أنا أذاكر كل ليلة).<br>
                • <b>He</b> (هو للمذكر) ➔ <i>He works in a bank.</i> (هو يعمل في بنك).<br>
                • <b>She</b> (هي للمؤنث) ➔ <i>She speaks English very well.</i> (هي تتحدث الإنجليزية بامتياز).<br>
                • <b>It</b> (غير العاقل المفرد) ➔ <i>It is a cold day.</i> (إنه يوم بارد).<br>
                • <b>We</b> (نحن) ➔ <i>We love our family.</i> (نحن نحب عائلتنا).<br>
                • <b>They</b> (هم / هن) ➔ <i>They play football together.</i> (هم يلعبون الكرة معاً).<br><br>

                <b>2. ضمائر المفعول به (Object Pronouns):</b> (تأتي بعد الفعل أو حرف الجر لبيان من وقع عليه الفعل)<br>
                • Me, Him, Her, It, Us, You, Them.<br>
                • <i>أمثلة تفصيلية:</i><br>
                - The teacher helped <b>me</b>. (المعلم ساعدني).<br>
                - I saw <b>him</b> at school. (رأيته في المدرسة).<br>
                - Listen to <b>them</b> carefully. (استمع إليهم ببدقة).<br><br>

                <b>3. صفات الملكية (Possessive Adjectives):</b> (يلزم بعدها ذكر الشيء المملوك)<br>
                • My, His, Her, Its, Our, Your, Their.<br>
                • <i>أمثلة:</i> This is <b>my</b> laptop (هذا حاسوبي) | <b>Her</b> name is Ghazaal (اسمها غزل).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('I study every night. He works in a bank. The teacher helped me. Her name is Ghazaal.')">🔊 استمع لجميع الأمثلة</button>
        </div>

        <!-- 2. الأزمنة والتراكيب القواعدية الكاملة -->
        <div class="interactive-card">
            <h3 style="color:var(--accent-green);">2. موسوعة الأزمنة والتراكيب (English Tenses Masterclass)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.8;">
                <b>أولاً: المضارع البسيط (Present Simple Tense)</b><br>
                • <b>مفهوم الزمن:</b> يُستخدم للتعبير عن الحقائق العلمية والمناخية، العادات اليومية، والجداول الزمنية الثابتة.<br>
                • <b>التكوين الدقيق:</b><br>
                - مع (I / We / They / You): الفعل مجرد بدون أي إضافة (e.g., I play).<br>
                - مع (He / She / It): نُضيف للفعل (s) أو (es) أو (ies) (e.g., He plays, She watches).<br>
                • <b>صيغة النفي:</b> نستخدم (don't) أو (doesn't) + مصدر الفعل.<br>
                • <b>أمثلة وافية:</b><br>
                - The sun rises in the east. (تشرق الشمس من الشرق - حقيقة).<br>
                - He doesn't drink coffee in the evening. (هو لا يشرب القهوة مساءً - نفي عادتك).<br><br>

                <b>ثانياً: الماضي البسيط (Past Simple Tense)</b><br>
                • <b>مفهوم الزمن:</b> حدث اكتمل وانتهى أثره تماماً في نقطة زمنية معروفة بالماضي.<br>
                • <b>التكوين:</b> التصريف الثاني للفعل (منتظم بـ ed مثل visited، أو شاذ ينبغي حفظه مثل went, ate, wrote).<br>
                • <b>صيغة النفي والسؤال:</b> باستخدام (didn't) أو (Did) + المصدر.<br>
                • <b>أمثلة وافية:</b><br>
                - I wrote a long story yesterday. (كتبت قصية طويلة أمس).<br>
                - Did you see the match last night? (هل شاهدت المباراة البارحة؟).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('The sun rises in the east. He does not drink coffee. I wrote a long story yesterday.')">🔊 استمع لشرح وتطبيقات الأزمنة</button>
        </div>
    `;
}

// ==================== 3. المحادثات الشاملة ====================
const CONVERSATIONS = [
    {
        title: "💬 1. التعارف والتعريف بالنفس (Introductions & Greetings)",
        text: "Hello! Good morning. My name is Alex. What is your name? My name is Ghazaal. Nice to meet you. I am fine, thank you!",
        desc: "حوار شامل ومفصل للتعرف والتعريف عن النفس واستقبال الآخرين."
    },
    {
        title: "💬 2. في المدرسة والمكتبة (At School & Library)",
        text: "Excuse me, where can I find the science books? They are on the second shelf on your right. Thank you so much for your help! You are welcome.",
        desc: "حوار السؤال عن الأماكن والتعليمات اليومية بداخل المدرسة."
    }
];

function renderStories() {
    const container = document.getElementById('stories-container');
    container.innerHTML = CONVERSATIONS.map(c => `
        <div class="interactive-card" onclick="speak('${c.text}')">
            <h3 style="color:var(--accent-green);">${c.title}</h3>
            <p style="margin-top:8px; color:var(--accent-yellow); font-size:1.05rem;">"${c.text}"</p>
            <small style="color:var(--text-dim); display:block; margin-top:8px;">${c.desc} (اضغط للاستماع بالحوار كاملاً)</small>
        </div>
    `).join('');
}

// ==================== 4. قسم الألعاب مع التعزيز الصوتي ====================
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

    setTimeout(() => {
        speak(currentQuizWord.en);
    }, 300);
}

function checkInfiniteAnswer(selectedEn, correctEn) {
    if (selectedEn === correctEn) {
        speak('Well done! Excellent!');
        alert('إجابة صحيحة! 🎉 أحسنت ممتاز! +10 نقاط');
        addPoints(10);
    } else {
        speak('Try again');
        alert(`إجابة خاطئة! ❌ الإجابة الصحيحة هي: ${COMPREHENSIVE_DICTIONARY.find(w => w.en === correctEn).ar}`);
    }
    generateInfiniteQuestion();
}

// ==================== 5. السبورة والتنقل التلقائي للحرف التالي ====================
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
    ctx.font = "bold 110px Segoe UI";
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(char, canvas.width / 2, canvas.height / 2);
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
