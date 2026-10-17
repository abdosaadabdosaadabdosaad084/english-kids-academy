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
    const savedPin = getSavedPin();
    if (input === savedPin) {
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

// App Speech & Data
let currentSelectedLetter = 'A';
let currentPoints = parseInt(localStorage.getItem('user_points') || '0');
document.getElementById('points-display').innerText = `⭐ ${currentPoints} نقطة`;

function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
    }
}

function speakCurrentLetter() {
    speak(currentSelectedLetter);
}

function addPoints(pts) {
    currentPoints += pts;
    localStorage.setItem('user_points', currentPoints);
    document.getElementById('points-display').innerText = `⭐ ${currentPoints} نقطة`;
}

function showSection(id) {
    document.querySelectorAll('.section-view').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function setStage(stage, btn) {
    document.querySelectorAll('.stage-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadContent(stage);
}

// Alphabet Grid & Board Handler
const alphabetContainer = document.getElementById('alphabet-container');
for (let i = 65; i <= 90; i++) {
    const char = String.fromCharCode(i);
    const div = document.createElement('div');
    div.className = 'letter-card';
    div.innerText = char;
    div.onclick = () => selectLetter(char);
    alphabetContainer.appendChild(div);
}

function selectLetter(char) {
    currentSelectedLetter = char;
    document.getElementById('current-letter-title').innerText = `✏️ سبورة الرسم والتتبع (الحرف: ${char})`;
    speak(char);
    clearCanvas();
}

// Canvas / Drawing Board Code
const canvas = document.getElementById('draw-canvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = "bold 110px Segoe UI";
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(currentSelectedLetter, canvas.width / 2, canvas.height / 2);
}

function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

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

// --- Comprehensive Content (Dictionary, Grammar, Stories) ---
function loadContent(stage) {
    const dictContainer = document.getElementById('dict-container');
    
    // قاموس شامل وضخم مصنف حسب المراحل
    let words = [];
    if (stage === 1) {
        words = [
            {en: 'Apple', ar: 'تفاحة'}, {en: 'Banana', ar: 'موز'}, {en: 'Cat', ar: 'قطة'}, {en: 'Dog', ar: 'كلب'},
            {en: 'Sun', ar: 'شمس'}, {en: 'Moon', ar: 'قمر'}, {en: 'Book', ar: 'كتاب'}, {en: 'Water', ar: 'ماء'},
            {en: 'Milk', ar: 'حليب'}, {en: 'Car', ar: 'سيارة'}, {en: 'Ball', ar: 'كرة'}, {en: 'Fish', ar: 'سمكة'},
            {en: 'House', ar: 'منزل'}, {en: 'Tree', ar: 'شجرة'}, {en: 'Flower', ar: 'زهرة'}, {en: 'Bird', ar: 'عصفور'}
        ];
    } else if (stage === 2) {
        words = [
            {en: 'School', ar: 'مدرسة'}, {en: 'Teacher', ar: 'معلم'}, {en: 'Friend', ar: 'صديق'}, {en: 'Computer', ar: 'حاسوب'},
            {en: 'Library', ar: 'مكتبة'}, {en: 'Hospital', ar: 'مستشفى'}, {en: 'Garden', ar: 'حديقة'}, {en: 'Kitchen', ar: 'مطبخ'},
            {en: 'Morning', ar: 'الصباح'}, {en: 'Evening', ar: 'المساء'}, {en: 'Always', ar: 'دائماً'}, {en: 'Never', ar: 'أبداً'},
            {en: 'Mountain', ar: 'جبل'}, {en: 'River', ar: 'نهر'}, {en: 'Ocean', ar: 'محيط'}, {en: 'Weather', ar: 'الطقس'}
        ];
    } else {
        words = [
            {en: 'Knowledge', ar: 'معرفة'}, {en: 'Future', ar: 'مستقبل'}, {en: 'Science', ar: 'علوم'}, {en: 'Challenge', ar: 'تحدي'},
            {en: 'Environment', ar: 'بيئة'}, {en: 'Technology', ar: 'تكنولوجيا'}, {en: 'Government', ar: 'حكومة'}, {en: 'Economy', ar: 'اقتصاد'},
            {en: 'Achievement', ar: 'إنجاز'}, {en: 'Responsibility', ar: 'مسؤولية'}, {en: 'Independence', ar: 'استقلال'}, {en: 'Creativity', ar: 'إبداع'},
            {en: 'Opportunity', ar: 'فرصة'}, {en: 'Development', ar: 'تطور'}, {en: 'Experience', ar: 'خبرة'}, {en: 'Success', ar: 'نجاح'}
        ];
    }

    dictContainer.innerHTML = words.map(w => `
        <div class="word-card" onclick="speak('${w.en}')">
            <span class="word-en">🔊 ${w.en}</span>
            <span class="word-ar">${w.ar}</span>
        </div>
    `).join('');

    // قواعد شاملة بالمعنى الحرفي
    const grammarContainer = document.getElementById('grammar-container');
    grammarContainer.innerHTML = `
        <div class="interactive-card">
            <h3 style="color: var(--accent-yellow);">📌 1. الضمائر الشخصية (Personal Pronouns)</h3>
            <p style="color:var(--text-dim); margin-top:5px;">تستخدم للتعويض عن الأسماء:</p>
            <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
                <button class="stage-btn" onclick="speak('I')">I (أنا)</button>
                <button class="stage-btn" onclick="speak('He')">He (هو للمذكر)</button>
                <button class="stage-btn" onclick="speak('She')">She (هي للمؤنث)</button>
                <button class="stage-btn" onclick="speak('It')">It (لغير العاقل)</button>
                <button class="stage-btn" onclick="speak('We')">We (نحن)</button>
                <button class="stage-btn" onclick="speak('You')">You (أنت / أنتم)</button>
                <button class="stage-btn" onclick="speak('They')">They (هم / هن)</button>
            </div>
        </div>

        <div class="interactive-card">
            <h3 style="color: var(--accent-yellow);">📌 2. فعل الكينونة (Verb To Be)</h3>
            <p style="color:var(--text-dim); margin-top:5px;">أهم أفعال اللغة (يكون):</p>
            <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
                <button class="stage-btn" onclick="speak('I am')">I am (أنا أكون)</button>
                <button class="stage-btn" onclick="speak('He is')">He is (هو يكون)</button>
                <button class="stage-btn" onclick="speak('She is')">She is (هي تكون)</button>
                <button class="stage-btn" onclick="speak('They are')">They are (هم يكونون)</button>
            </div>
        </div>

        <div class="interactive-card">
            <h3 style="color: var(--accent-yellow);">📌 3. أزمنة الفعل الأساسية (Tenses)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.6;">
                • <b>المضارع البسيط (Present Simple):</b> يعبر عن الحقيقة العادات (مثل: I play football).<br>
                • <b>الماضي البسيط (Past Simple):</b> حدث وانتهى في الماضي (مثل: I played yesterday).<br>
                • <b>المستقبل (Future):</b> ما سيحدث غداً (مثل: I will go tomorrow).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('I play football everyday. Yesterday I played. Tomorrow I will go.')">استمع للأمثلة 🔊</button>
        </div>

        <div class="interactive-card">
            <h3 style="color: var(--accent-yellow);">📌 4. أدوات النكرة والمعرفة (Articles & Prepositions)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.6;">
                • <b>A / An:</b> أدوات نكرة توضع قبل الاسم المفرد المعدود المبدوء بحرف ساكن (a) أو متحرك (an).<br>
                • <b>In / On / At:</b> حروف جر تدل على المكان والزمان (In في، On على، At في نقطة محددة).
            </p>
        </div>
    `;

    // محادثات مختلفة ومتعددة
    const storiesContainer = document.getElementById('stories-container');
    storiesContainer.innerHTML = `
        <div class="interactive-card" onclick="speak('Hello! Good morning. What is your name? My name is Ghazaal. Nice to meet you. How are you today? I am fine, thank you.')">
            <h3>💬 1. محادثة التعارف والصباح</h3>
            <p style="margin-top:8px; color:var(--accent-yellow);">"Hello! Good morning. What is your name? My name is Ghazaal. Nice to meet you!"</p>
            <small style="color:var(--text-dim); display:block; margin-top:5px;">(اضغط للاستماع للمحادثة كاملة)</small>
        </div>

        <div class="interactive-card" onclick="speak('Excuse me, where is the school library? It is next to the science lab. Thank you very much. You are welcome!')">
            <h3>💬 2. محادثة في المدرسة</h3>
            <p style="margin-top:8px; color:var(--accent-yellow);">"Excuse me, where is the school library? It is next to the lab."</p>
            <small style="color:var(--text-dim); display:block; margin-top:5px;">(اضغط للاستماع للمحادثة كاملة)</small>
        </div>

        <div class="interactive-card" onclick="speak('Can I help you? Yes, I want to buy an apple and some water, please. That will be five pounds. Here you are. Thank you, goodbye!')">
            <h3>💬 3. محادثة في المتجر والشراء</h3>
            <p style="margin-top:8px; color:var(--accent-yellow);">"Can I help you? Yes, I want to buy an apple and some water, please."</p>
            <small style="color:var(--text-dim); display:block; margin-top:5px;">(اضغط للاستماع للمحادثة كاملة)</small>
        </div>
    `;
}

// Quiz Logic
function loadQuiz() {
    document.getElementById('quiz-q').innerText = 'ما معنى كلمة "Apple"؟';
    document.getElementById('quiz-options').innerHTML = `
        <button class="btn-action" style="margin-bottom:10px;" onclick="answerQuiz(true)">تفاحة</button>
        <button class="btn-action" style="background:#444;" onclick="answerQuiz(false)">سيارة</button>
    `;
}

function answerQuiz(correct) {
    if (correct) {
        alert('إجابة صحيحة! 🎉 حصلت على 10 نقاط!');
        addPoints(10);
    } else {
        alert('حاول مرة أخرى! 💪');
    }
}

loadContent(1);
loadQuiz();
clearCanvas();
