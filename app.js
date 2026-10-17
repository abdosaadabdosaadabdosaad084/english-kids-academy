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

function showSection(id) {
    document.querySelectorAll('.section-view').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ==================== 1. القاموس الشامل الضخم (المورد) ====================
const COMPREHENSIVE_DICTIONARY = [
    // الفواكه والطعام
    {en: 'Apple', ar: 'تفاحة', cat: 'فواكه وطعام'}, {en: 'Banana', ar: 'موز', cat: 'فواكه وطعام'}, {en: 'Orange', ar: 'برتقال', cat: 'فواكه وطعام'},
    {en: 'Watermelon', ar: 'بطيخ', cat: 'فواكه وطعام'}, {en: 'Grape', ar: 'عنب', cat: 'فواكه وطعام'}, {en: 'Strawberry', ar: 'فراولة', cat: 'فواكه وطعام'},
    {en: 'Bread', ar: 'خبز', cat: 'فواكه وطعام'}, {en: 'Cheese', ar: 'جبن', cat: 'فواكه وطعام'}, {en: 'Butter', ar: 'زبدة', cat: 'فواكه وطعام'},
    {en: 'Milk', ar: 'حليب', cat: 'فواكه وطعام'}, {en: 'Rice', ar: 'أرز', cat: 'فواكه وطعام'}, {en: 'Meat', ar: 'لحم', cat: 'فواكه وطعام'},
    // الحيوانات
    {en: 'Cat', ar: 'قطة', cat: 'حيوانات'}, {en: 'Dog', ar: 'كلب', cat: 'حيوانات'}, {en: 'Elephant', ar: 'فيل', cat: 'حيوانات'},
    {en: 'Lion', ar: 'أسد', cat: 'حيوانات'}, {en: 'Tiger', ar: 'نمر', cat: 'حيوانات'}, {en: 'Giraffe', ar: 'زرافة', cat: 'حيوانات'},
    {en: 'Horse', ar: 'حصان', cat: 'حيوانات'}, {en: 'Monkey', ar: 'قرد', cat: 'حيوانات'}, {en: 'Dolphin', ar: 'دلفين', cat: 'حيوانات'},
    {en: 'Eagle', ar: 'نسر', cat: 'حيوانات'}, {en: 'Rabbit', ar: 'أرنب', cat: 'حيوانات'}, {en: 'Bear', ar: 'دب', cat: 'حيوانات'},
    // التعليم والمدرسة
    {en: 'School', ar: 'مدرسة', cat: 'تعليم'}, {en: 'Teacher', ar: 'معلم', cat: 'تعليم'}, {en: 'Student', ar: 'طالب', cat: 'تعليم'},
    {en: 'Book', ar: 'كتاب', cat: 'تعليم'}, {en: 'Notebook', ar: 'دفتر', cat: 'تعليم'}, {en: 'Pencil', ar: 'قلم رصاص', cat: 'تعليم'},
    {en: 'Classroom', ar: 'فصل دراسي', cat: 'تعليم'}, {en: 'Library', ar: 'مكتبة', cat: 'تعليم'}, {en: 'University', ar: 'جامعة', cat: 'تعليم'},
    {en: 'Science', ar: 'علوم', cat: 'تعليم'}, {en: 'Mathematics', ar: 'رياضيات', cat: 'تعليم'}, {en: 'History', ar: 'تاريخ', cat: 'تعليم'},
    // المهن والحرف
    {en: 'Doctor', ar: 'طبيب', cat: 'مهن'}, {en: 'Nurse', ar: 'ممرضة', cat: 'مهن'}, {en: 'Engineer', ar: 'مهندس', cat: 'مهن'},
    {en: 'Pilot', ar: 'طيار', cat: 'مهن'}, {en: 'Chef', ar: 'طباخ', cat: 'مهن'}, {en: 'Officer', ar: 'ضابط', cat: 'مهن'},
    {en: 'Driver', ar: 'سائق', cat: 'مهن'}, {en: 'Accountant', ar: 'محاسب', cat: 'مهن'}, {en: 'Artist', ar: 'فنان', cat: 'مهن'},
    {en: 'Lawyer', ar: 'محامي', cat: 'مهن'}, {en: 'Farmer', ar: 'مزارع', cat: 'مهن'}, {en: 'Scientist', ar: 'عالم', cat: 'مهن'},
    // التكنولوجيا والعلوم الحديثة
    {en: 'Computer', ar: 'حاسوب', cat: 'تكنولوجيا'}, {en: 'Internet', ar: 'إنترنت', cat: 'تكنولوجيا'}, {en: 'Software', ar: 'برمجيات', cat: 'تكنولوجيا'},
    {en: 'Application', ar: 'تطبيق', cat: 'تكنولوجيا'}, {en: 'Data', ar: 'بيانات', cat: 'تكنولوجيا'}, {en: 'Screen', ar: 'شاشة', cat: 'تكنولوجيا'},
    {en: 'Keyboard', ar: 'لوحة مفاتيح', cat: 'تكنولوجيا'}, {en: 'Network', ar: 'شبكة', cat: 'تكنولوجيا'}, {en: 'Database', ar: 'قاعدة بيانات', cat: 'تكنولوجيا'},
    // الأفعال الشائعة
    {en: 'Read', ar: 'يقرأ', cat: 'أفعال'}, {en: 'Write', ar: 'يكتب', cat: 'أفعال'}, {en: 'Speak', ar: 'يتحدث', cat: 'أفعال'},
    {en: 'Listen', ar: 'يستمع', cat: 'أفعال'}, {en: 'Learn', ar: 'يتعلم', cat: 'أفعال'}, {en: 'Understand', ar: 'يفهم', cat: 'أفعال'},
    {en: 'Create', ar: 'يبتكر / ينشئ', cat: 'أفعال'}, {en: 'Develop', ar: 'يطور', cat: 'أفعال'}, {en: 'Achieve', ar: 'يحقق / ينجز', cat: 'أفعال'},
    // الصفات والأحوال
    {en: 'Happy', ar: 'سعيد', cat: 'صفات'}, {en: 'Smart', ar: 'ذكي', cat: 'صفات'}, {en: 'Strong', ar: 'قوي', cat: 'صفات'},
    {en: 'Beautiful', ar: 'جميل', cat: 'صفات'}, {en: 'Important', ar: 'هام', cat: 'صفات'}, {en: 'Successful', ar: 'ناجح', cat: 'صفات'}
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
                <h3 style="color:var(--accent-yellow);">🔍 بحث شامل ومباشر عن: "${filterText}"</h3>
                <p style="margin:10px 0; color:var(--text-dim);">الكلمة غير موجودة القائمة الثابتة، ولكن يمكنك الاستماع لنطقها المباشر من المترجم التلقائي:</p>
                <button class="btn-action" onclick="speak('${filterText}')">🔊 نطق الكلمة المكتوبة (${filterText})</button>
            </div>
        `;
    }

    dictContainer.innerHTML = `
        <div style="margin-bottom:15px;">
            <input type="text" id="dict-search-input" value="${filterText}" placeholder="🔍 اكتب أي كلمة بالإنجليزية أو العربية هنا للبحث الشامل..." style="width:100%; padding:12px; border-radius:10px; border:2px solid var(--accent-blue); background:#121324; color:#fff; font-size:1rem;" oninput="renderDictionary(this.value)">
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

// ==================== 2. قسم القواعد الشامل الوافي جداً ====================
function renderGrammar() {
    const container = document.getElementById('grammar-container');
    container.innerHTML = `
        <div class="interactive-card">
            <h2 style="color:var(--accent-yellow); margin-bottom:10px;">📘 الموسوعة القواعدية الشاملة للغة الإنجليزية</h2>
            <p style="color:var(--text-dim); line-height:1.6;">شرح وافٍ وكافٍ ومفصل لجميع القواعد والأزمنة للتأسيس والتفوق العلمي.</p>
        </div>

        <!-- 1. الضمائر -->
        <div class="interactive-card">
            <h3 style="color:var(--accent-green);">1. الضمائر وأنواعها الكاملة (Pronouns System)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.7;">
                الضمائر هي أساس تكوين الجملة لمنع تكرار الأسماء، وتنقسم إلى 4 أقسام رئيسية:<br><br>
                <b>أ. ضمائر الفاعل (Subject Pronouns):</b> (تأتي قبل الفعل)<br>
                • <b>I</b> (أنا) | <b>He</b> (هو) | <b>She</b> (هي) | <b>It</b> (غير العاقل)<br>
                • <b>We</b> (نحن) | <b>You</b> (أنت / أنتم) | <b>They</b> (هم / هن)<br><br>
                <b>ب. ضمائر المفعول به (Object Pronouns):</b> (تأتي بعد الفعل أو حرف الجر)<br>
                • Me, Him, Her, It, Us, You, Them.<br>
                • <i>مثال:</i> He helped <b>me</b> (هو ساعدني).<br><br>
                <b>ج. صفات الملكية (Possessive Adjectives):</b> (يتبعها اسم شىء مملوك)<br>
                • My, His, Her, Its, Our, Your, Their.<br>
                • <i>مثال:</i> This is <b>my</b> book (هذا كتابي).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('I study English. She helps me. This is my book.')">🔊 استمع للضمائر بالتفصيل</button>
        </div>

        <!-- 2. الأزمنة الكاملة -->
        <div class="interactive-card">
            <h3 style="color:var(--accent-green);">2. الأزمنة بالتفصيل والعمق (English Tenses)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.7;">
                <b>أولاً: المضارع البسيط (Present Simple Tense)</b><br>
                • <b>الاستخدام:</b> للتعبير عن العادات، الحقائق الثابتة والأعمال التكرارية.<br>
                • <b>التكوين:</b> مع (I/We/They/You) الفعل مصدر. مع (He/She/It) يُضاف للفعل (s/es).<br>
                • <b>النفي:</b> استخدام (don't / doesn't) + المصدر.<br>
                • <b>الكلمات الدالة:</b> Always, Usually, Often, Sometimes, Every day.<br><br>
                
                <b>ثانياً: المضارع المستمر (Present Continuous Tense)</b><br>
                • <b>الاستخدام:</b> حدث يقع في هذه اللحظة أثناء الحديث.<br>
                • <b>التكوين:</b> (am / is / are) + Verb + ing.<br>
                • <b>الكلمات الدالة:</b> Now, At the moment, Look, Listen.<br><br>

                <b>ثالثاً: الماضي البسيط (Past Simple Tense)</b><br>
                • <b>الاستخدام:</b> حدث بدأ وانتهى تماماً في الماضي.<br>
                • <b>التكوين:</b> التصريف الثاني للفعل (إضافة ed أو حفظ الشاذ).<br>
                • <b>النفي:</b> استخدام (didn't) + المصدر.<br>
                • <b>الكلمات الدالة:</b> Yesterday, Ago, Last week.<br><br>

                <b>رابعاً: المستقبل البسيط (Future Simple Tense)</b><br>
                • <b>الاستخدام:</b> القرارات السريعة، التنبؤات والخطط المستقبلية.<br>
                • <b>التكوين:</b> Will + المصدر.<br>
                • <b>الكلمات الدالة:</b> Tomorrow, Next week, In the future.
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('I play football every day. I am playing now. I played yesterday. I will play tomorrow.')">🔊 استمع لشرح وتطبيقات الأزمنة</button>
        </div>

        <!-- 3. الأفعال الناقصة وحروف الجر -->
        <div class="interactive-card">
            <h3 style="color:var(--accent-green);">3. الأفعال الناقصة وحروف الجر (Modals & Prepositions)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.7;">
                <b>أ. الأفعال الناقصة (Modals):</b> أفعال تأتي بعدها الأفعال في المصدر:<br>
                • <b>Can / Could:</b> للقدرة (I can speak English).<br>
                • <b>Must:</b> للضرورة والالزام (You must respect laws).<br>
                • <b>Should:</b> تقديم النصيحة (You should study well).<br><br>

                <b>ب. حروف الجر الزمانية والمكانية (Prepositions):</b><br>
                • <b>In:</b> مع الأشهر والسنوات وفصول السنة (In 2026, In summer).<br>
                • <b>On:</b> مع الأيام والتواريخ المحددة (On Monday, On my birthday).<br>
                • <b>At:</b> مع الأوقات المحددة بالساعات (At 5 o'clock, At night).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('I can do it. You should study. We meet at 5 o clock on Monday.')">🔊 استمع للتطبيقات القواعدية</button>
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
    },
    {
        title: "💬 3. التسوق والتسوق (Shopping & Restaurant)",
        text: "Welcome! May I take your order? Yes, I would like a sandwich and fresh orange juice, please. How much is that? That is ten pounds.",
        desc: "حوار التعامل والطلب والاستفسار عن الأسعار والمحلات."
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
    if (currentLetterCode > 90) currentLetterCode = 65; // العودة لـ A بعد Z
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
