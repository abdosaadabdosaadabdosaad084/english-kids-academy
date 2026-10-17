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
function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
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

// ==================== 1. القاموس الشامل الضخم ====================
const COMPREHENSIVE_DICTIONARY = [
    // الأساسيات والحيوانات
    {en: 'Apple', ar: 'تفاحة', cat: 'فواكه'}, {en: 'Banana', ar: 'موز', cat: 'فواكه'}, {en: 'Orange', ar: 'برتقال', cat: 'فواكه'},
    {en: 'Cat', ar: 'قطة', cat: 'حيوانات'}, {en: 'Dog', ar: 'كلب', cat: 'حيوانات'}, {en: 'Elephant', ar: 'فيل', cat: 'حيوانات'},
    {en: 'Lion', ar: 'أسد', cat: 'حيوانات'}, {en: 'Tiger', ar: 'نمر', cat: 'حيوانات'}, {en: 'Giraffe', ar: 'زرافة', cat: 'حيوانات'},
    // المدرسة والعلم
    {en: 'School', ar: 'مدرسة', cat: 'تعليم'}, {en: 'Teacher', ar: 'معلم', cat: 'تعليم'}, {en: 'Student', ar: 'طالب', cat: 'تعليم'},
    {en: 'Book', ar: 'كتاب', cat: 'تعليم'}, {en: 'Pencil', ar: 'قلم رصاص', cat: 'تعليم'}, {en: 'Classroom', ar: 'فصل دراسي', cat: 'تعليم'},
    {en: 'Library', ar: 'مكتبة', cat: 'تعليم'}, {en: 'University', ar: 'جامعة', cat: 'تعليم'}, {en: 'Science', ar: 'علوم', cat: 'تعليم'},
    // المهن والحرف
    {en: 'Doctor', ar: 'طبيب', cat: 'مهن'}, {en: 'Nurse', ar: 'ممرضة', cat: 'مهن'}, {en: 'Engineer', ar: 'مهندس', cat: 'مهن'},
    {en: 'Pilot', ar: 'طيار', cat: 'مهن'}, {en: 'Chef', ar: 'طباخ', cat: 'مهن'}, {en: 'Officer', ar: 'ضابط', cat: 'مهن'},
    {en: 'Driver', ar: 'سائق', cat: 'مهن'}, {en: 'Accountant', ar: 'محاسب', cat: 'مهن'}, {en: 'Artist', ar: 'فنان', cat: 'مهن'},
    // التكنولوجيا والحديث
    {en: 'Computer', ar: 'حاسوب', cat: 'تكنولوجيا'}, {en: 'Internet', ar: 'إنترنت', cat: 'تكنولوجيا'}, {en: 'Software', ar: 'برمجيات', cat: 'تكنولوجيا'},
    {en: 'Application', ar: 'تطبيق', cat: 'تكنولوجيا'}, {en: 'Data', ar: 'بيانات', cat: 'تكنولوجيا'}, {en: 'Screen', ar: 'شاشة', cat: 'تكنولوجيا'},
    // الأفعال الشائعة
    {en: 'Read', ar: 'يقرأ', cat: 'أفعال'}, {en: 'Write', ar: 'يكتب', cat: 'أفعال'}, {en: 'Speak', ar: 'يتحدث', cat: 'أفعال'},
    {en: 'Listen', ar: 'يستمع', cat: 'أفعال'}, {en: 'Learn', ar: 'يتعلم', cat: 'أفعال'}, {en: 'Understand', ar: 'يفهم', cat: 'أفعال'},
    {en: 'Create', ar: 'يبتكر / ينشئ', cat: 'أفعال'}, {en: 'Develop', ar: 'يطور', cat: 'أفعال'}, {en: 'Achieve', ar: 'يحقق / ينجز', cat: 'أفعال'},
    // الصفات والمشاعر
    {en: 'Happy', ar: 'سعيد', cat: 'صفات'}, {en: 'Smart', ar: 'ذكي', cat: 'صفات'}, {en: 'Strong', ar: 'قوي', cat: 'صفات'},
    {en: 'Beautiful', ar: 'جميل', cat: 'صفات'}, {en: 'Important', ar: 'هام', cat: 'صفات'}, {en: 'Successful', ar: 'ناجح', cat: 'صفات'}
];

function renderDictionary(filterText = '') {
    const dictContainer = document.getElementById('dict-container');
    const filtered = COMPREHENSIVE_DICTIONARY.filter(w => 
        w.en.toLowerCase().includes(filterText.toLowerCase()) || w.ar.includes(filterText)
    );
    dictContainer.innerHTML = `
        <input type="text" placeholder="🔍 إبحث عن أي كلمة (عربي / إنجليزي)..." style="width:100%; padding:12px; margin-bottom:15px; border-radius:10px; border:1px solid var(--accent-blue); background:#121324; color:#fff;" oninput="renderDictionary(this.value)">
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

// ==================== 2. القواعد الشاملة المفصلة ====================
function renderGrammar() {
    const container = document.getElementById('grammar-container');
    container.innerHTML = `
        <div class="interactive-card">
            <h3 style="color:var(--accent-yellow);">📘 1. الضمائر وأنواعها (Pronouns)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.6;">
                • <b>ضمائر الفاعل (Subject):</b> I, He, She, It, We, You, They.<br>
                • <b>ضمائر المفعول (Object):</b> Me, Him, Her, It, Us, You, Them.<br>
                • <b>صفات الملكية (Possessive):</b> My, His, Her, Its, Our, Your, Their.
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('I like English. She helps me. This is my book.')">استمع لأمثلة الضمائر 🔊</button>
        </div>

        <div class="interactive-card">
            <h3 style="color:var(--accent-yellow);">📘 2. الأزمنة بالتفصيل (Verb Tenses)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.6;">
                <b>1. المضارع البسيط (Present Simple):</b> للحقائق والعادات. (الفعل + s مع المفرد).<br>
                <b>2. المضارع المستمر (Present Continuous):</b> حدث يقع الآن. (am/is/are + v-ing).<br>
                <b>3. الماضي البسيط (Past Simple):</b> حدث وانتهى في الماضي. (v2).<br>
                <b>4. المستقبل (Future):</b> ما سيحدث لاحقاً. (will + v1).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('I study daily. I am studying now. I studied yesterday. I will study tomorrow.')">استمع لتطبيق الأزمنة 🔊</button>
        </div>

        <div class="interactive-card">
            <h3 style="color:var(--accent-yellow);">📘 3. الأفعال المساعدة والناقصة (Modals)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.6;">
                • <b>Can / Could:</b> للقدرة والاستطاعة (I can speak English).<br>
                • <b>Must / Should:</b> للالزام والنصيحة (You should study).<br>
                • <b>May / Might:</b> لاحتمالية حدوث الشيء.
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('I can do it. You should try. It might rain.')">استمع لأمثلة الأفعال الناقصة 🔊</button>
        </div>

        <div class="interactive-card">
            <h3 style="color:var(--accent-yellow);">📘 4. أسلوب الشرط والمبني للمجهول (Advanced Grammar)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.6;">
                • <b>قاعدة If الشرطية:</b> If you study hard, you will succeed.<br>
                • <b>المبني للمجهول (Passive):</b> التركيز على المفعول به (The glass was broken).
            </p>
        </div>
    `;
}

// ==================== 3. المحادثات الشاملة المتعددة ====================
const CONVERSATIONS = [
    {
        title: "💬 1. التعارف واللقاء الأول (Greetings & Introductions)",
        text: "Hello! Good morning. My name is Alex. What is your name? Nice to meet you. I am fine, thank you!",
        desc: "حوار المبتدئين في التعريف عن النفس والاستقبال."
    },
    {
        title: "💬 2. في المدرسة والمكتبة (At School & Library)",
        text: "Excuse me, where can I find the science books? They are on the second shelf on your right. Thank you so much for your help!",
        desc: "حوار السؤال عن الأماكن والتعليمات."
    },
    {
        title: "💬 3. في المطعم والتسوق (Restaurant & Shopping)",
        text: "Welcome! May I take your order? Yes, I would like a chicken sandwich and fresh orange juice, please.",
        desc: "حوار الطلب والتعامل الشائع في المطاعم والمحلات."
    },
    {
        title: "💬 4. إجراء مقابلة عمل (Job Interview Basics)",
        text: "Tell me about yourself. I am a dedicated data worker with high skills in computer systems and problem solving.",
        desc: "حوار احترافي متقدم للتعريف بالخبرات المهنية."
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

// ==================== 4. مولّد الألعاب والاختبارات اللا نهائي ====================
function generateInfiniteQuestion() {
    const quizBox = document.getElementById('quiz-box');
    const randomWord = COMPREHENSIVE_DICTIONARY[Math.floor(Math.random() * COMPREHENSIVE_DICTIONARY.length)];
    
    // إنشاء خيارات عشوائية خائطة
    let wrongOptions = COMPREHENSIVE_DICTIONARY.filter(w => w.en !== randomWord.en)
                                             .sort(() => 0.5 - Math.random())
                                             .slice(0, 3);
    
    let allOptions = [...wrongOptions, randomWord].sort(() => 0.5 - Math.random());

    quizBox.innerHTML = `
        <h3 style="color:var(--accent-yellow); margin-bottom:10px;">🎮 اختبار المفردات اللا نهائي</h3>
        <div style="font-size:1.3rem; margin-bottom:15px; color:#fff;">ما المعنى العربي الصحيح لكلمة: <b style="color:var(--accent-green);">${randomWord.en}</b>؟</div>
        <div style="display:flex; flex-direction:column; gap:10px;">
            ${allOptions.map(opt => `
                <button class="btn-action" style="background:#2d3154;" onclick="checkInfiniteAnswer('${opt.en}', '${randomWord.en}')">${opt.ar}</button>
            `).join('')}
        </div>
    `;
}

function checkInfiniteAnswer(selectedEn, correctEn) {
    if (selectedEn === correctEn) {
        alert('إجابة ممتازة وصحيحة! 🎉 +10 نقاط');
        addPoints(10);
        speak('Excellent! Correct answer.');
    } else {
        alert(`إجابة خاطئة! الإجابة الصحيحة كانت: ${COMPREHENSIVE_DICTIONARY.find(w => w.en === correctEn).ar}`);
    }
    generateInfiniteQuestion(); // توليد سؤال جديد فوراً دون توقف!
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
