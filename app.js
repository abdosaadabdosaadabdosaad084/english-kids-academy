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
    
    // Draw faint template letter
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

// Load Content
function loadContent(stage) {
    const dictContainer = document.getElementById('dict-container');
    const words = stage === 1 ? [
        {en: 'Apple', ar: 'تفاحة'}, {en: 'Cat', ar: 'قطة'}, {en: 'Dog', ar: 'كلب'}, {en: 'Sun', ar: 'شمس'}
    ] : stage === 2 ? [
        {en: 'School', ar: 'مدرسة'}, {en: 'Friend', ar: 'صديق'}, {en: 'Book', ar: 'كتاب'}, {en: 'Teacher', ar: 'معلم'}
    ] : [
        {en: 'Knowledge', ar: 'معرفة'}, {en: 'Future', ar: 'مستقبل'}, {en: 'Science', ar: 'علوم'}, {en: 'Challenge', ar: 'تحدي'}
    ];

    dictContainer.innerHTML = words.map(w => `
        <div class="word-card" onclick="speak('${w.en}')">
            <span class="word-en">🔊 ${w.en}</span>
            <span class="word-ar">${w.ar}</span>
        </div>
    `).join('');

    const grammarContainer = document.getElementById('grammar-container');
    grammarContainer.innerHTML = `
        <div class="interactive-card">
            <h3>📌 الضمائر الأساسية (Pronouns)</h3>
            <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
                <button class="stage-btn" onclick="speak('I am')">I am (أنا)</button>
                <button class="stage-btn" onclick="speak('He is')">He is (هو)</button>
                <button class="stage-btn" onclick="speak('She is')">She is (هي)</button>
            </div>
        </div>
    `;

    const storiesContainer = document.getElementById('stories-container');
    storiesContainer.innerHTML = `
        <div class="interactive-card" onclick="speak('Hello! What is your name? My name is Ghazaal. Nice to meet you!')">
            <h3>💬 محادثة التعارف</h3>
            <p style="margin-top:10px; color:var(--accent-yellow);">"Hello! What is your name? My name is Ghazaal. Nice to meet you!"</p>
        </div>
    `;
}

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
