const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
let currentIndex = 0;

const ghostLetter = document.getElementById("ghost-letter");
const boardTitle = document.getElementById("board-title");
const lettersContainer = document.getElementById("letters-container");
const canvas = document.getElementById("drawing-canvas");
const ctx = canvas.getContext("2d");

// تهيئة اللوحة والحروف
function initApp() {
    setupCanvasSize();
    renderLettersBar();
    updateActiveLetter();
}

function renderLettersBar() {
    lettersContainer.innerHTML = "";
    letters.forEach((letter, index) => {
        const btn = document.createElement("button");
        btn.className = `letter-chip ${index === currentIndex ? 'active' : ''}`;
        btn.innerText = letter;
        btn.onclick = () => {
            currentIndex = index;
            updateActiveLetter();
            playLetterSound(letter);
        };
        lettersContainer.appendChild(btn);
    });
}

function updateActiveLetter() {
    const currentLetter = letters[currentIndex];
    ghostLetter.innerText = currentLetter;
    boardTitle.innerText = `سبورة الرسم والتتبع (الحرف: ${currentLetter})`;
    
    // تحديث الأزرار النشطة في الشريط العلوي
    document.querySelectorAll(".letter-chip").forEach((btn, idx) => {
        btn.classList.toggle("active", idx === currentIndex);
    });
    
    clearCanvas();
}

// نطق الحرف صوتياً باستخدام ناطق المتصفح (SpeechSynthesis)
function playLetterSound(letter) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(letter);
        utterance.lang = 'en-US';
        utterance.rate = 0.8; // سرعة مناسبة للأطفال
        window.speechSynthesis.speak(utterance);
    }
}

// الانتقال للحرف التالي عند الضغط على الحرف في الشاشة السوداء أو زر التالي
document.getElementById("next-letter-btn").onclick = () => {
    currentIndex = (currentIndex + 1) % letters.length;
    updateActiveLetter();
    playLetterSound(letters[currentIndex]);
};

ghostLetter.onclick = () => {
    playLetterSound(letters[currentIndex]);
    currentIndex = (currentIndex + 1) % letters.length;
    updateActiveLetter();
};

// إعدادات الرسم باللمس والفأرة على السبورة السوداء
let painting = false;

function setupCanvasSize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

function startPosition(e) {
    painting = true;
    draw(e);
}

function endPosition() {
    painting = false;
    ctx.beginPath();
}

function draw(e) {
    if (!painting) return;
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#f1c40f"; // لون قلم الكتابة (أصفر مميز للطفل)

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

canvas.addEventListener("mousedown", startPosition);
canvas.addEventListener("mouseup", endPosition);
canvas.addEventListener("mousemove", draw);

canvas.addEventListener("touchstart", startPosition);
canvas.addEventListener("touchend", endPosition);
canvas.addEventListener("touchmove", draw);

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

document.getElementById("clear-board-btn").onclick = clearCanvas;

// تفعيل المترجم الصوتي (Speech Recognition)
const speakBtn = document.getElementById("speak-btn");
const translationResult = document.getElementById("translation-result");

speakBtn.onclick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        translationResult.innerText = "متصفحك لا يدعم التعرف على الصوت.";
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-EG';
    recognition.start();

    translationResult.innerText = "جاري الاستماع... تحدث الآن.";

    recognition.onresult = (event) => {
        const speechText = event.results[0][0].transcript;
        translationResult.innerText = `الكلِمَة: "${speechText}" -> (Translation in progress...)`;
        // يمكنك ربطها بمترجم أو نطقها بالإنجليزية
    };

    recognition.onerror = () => {
        translationResult.innerText = "حدث خطأ في التسجيل، حاول مرة أخرى.";
    };
};

function startLetterGame() {
    alert("بدء لعبة تطابق الحروف قريباً!");
}

function startAudioQuizGame() {
    alert("بدء لعبة اختبار الصوت قريباً!");
}

window.onload = initApp;
