// ==========================================
// English Kids Academy - Main Application JS
// ==========================================

const alphabetList = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

let currentLetterIndex = 0;
let canvas, ctx, painting = false;

window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('blackboard');
    if (canvas) {
        ctx = canvas.getContext('2d');
        canvas.addEventListener('mousedown', startPosition);
        canvas.addEventListener('mouseup', endPosition);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startPosition(e.touches[0]); });
        canvas.addEventListener('touchend', (e) => { e.preventDefault(); endPosition(); });
        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e.touches[0]); });
    }
});

function openSection(sectionId) {
    document.querySelectorAll('.section-view').forEach(sec => sec.style.display = 'none');
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById(sectionId).style.display = 'block';

    if (sectionId === 'alphabet-section') {
        loadAlphabetLetter();
    } else if (sectionId === 'dictionary-section') {
        initDictionary();
    } else if (sectionId === 'grammar-section') {
        loadGrammarContent();
    } else if (sectionId === 'conversations-section') {
        loadConversationsContent();
    } else if (sectionId === 'categories-section') {
        loadCategoriesContent();
    } else if (sectionId === 'games-section') {
        loadGameQuestion();
    }
}

function goHome() {
    document.querySelectorAll('.section-view').forEach(sec => sec.style.display = 'none');
    document.getElementById('home-screen').style.display = 'block';
}

// 1. قسم الحروف والسبورة
function renderLettersGrid() {
    const grid = document.getElementById('letters-grid');
    if (!grid) return;
    grid.innerHTML = '';

    alphabetList.forEach((letter, index) => {
        const btn = document.createElement('button');
        btn.className = 'letter-btn' + (index === currentLetterIndex ? ' active-letter' : '');
        btn.innerText = letter;
        btn.onclick = () => {
            currentLetterIndex = index;
            loadAlphabetLetter();
        };
        grid.appendChild(btn);
    });
}

function loadAlphabetLetter() {
    renderLettersGrid();
    const currentLetter = alphabetList[currentLetterIndex];
    
    // نطق اسم الحرف فقط
    speakText(currentLetter);
    
    // رسم الحرف الباهت مباشرة داخل السبورة
    drawFaintLetterOnBoard(currentLetter);
}

function nextLetter() {
    currentLetterIndex = (currentLetterIndex + 1) % alphabetList.length;
    loadAlphabetLetter();
}

function drawFaintLetterOnBoard(letterText) {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.font = "bold 180px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)"; // لون باهت وواضح جداً للتتبع
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letterText, canvas.width / 2, canvas.height / 2);
    ctx.restore();
}

function clearBoard() {
    loadAlphabetLetter();
}

function startPosition(e) {
    painting = true;
    draw(e);
}

function endPosition() {
    painting = false;
    if (ctx) ctx.beginPath();
}

function draw(e) {
    if (!painting || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ffcc00';

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

// 2. قسم القاموس
const massiveDictionary = [
    { en: "Apple", ar: "تفاحة" }, { en: "Book", ar: "كتاب" }, { en: "Cat", ar: "قطة" },
    { en: "Dog", ar: "كلب" }, { en: "Elephant", ar: "فيل" }, { en: "Fish", ar: "سمكة" },
    { en: "Sun", ar: "شمس" }, { en: "Moon", ar: "قمر" }, { en: "Water", ar: "ماء" },
    { en: "School", ar: "مدرسة" }, { en: "Teacher", ar: "معلم" }, { en: "Student", ar: "طالب" },
    { en: "Family", ar: "عائلة" }, { en: "Friend", ar: "صديق" }, { en: "House", ar: "منزل" },
    { en: "Peace", ar: "سلام" }, { en: "Hello", ar: "مرحبا" }, { en: "Good", ar: "جيد" }
];

function initDictionary() {
    localStorage.setItem('offline_dictionary', JSON.stringify(massiveDictionary));
    searchDictionary();
}

function searchDictionary() {
    const inputElem = document.getElementById('dict-search-input');
    const query = inputElem ? inputElem.value.toLowerCase().trim() : '';
    const resultsContainer = document.getElementById('dict-results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '';
    const savedData = JSON.parse(localStorage.getItem('offline_dictionary')) || massiveDictionary;

    const filtered = savedData.filter(item => 
        item.en.toLowerCase().includes(query) || item.ar.includes(query)
    );

    if (filtered.length === 0) {
        resultsContainer.innerHTML = `<div class="dict-item"><div class="en-word">لا توجد نتائج</div><div class="ar-word">جرب كلمة أخرى...</div></div>`;
        return;
    }

    filtered.forEach(item => {
        const div = document.createElement('div');
        div.className = 'dict-item';
        div.innerHTML = `
            <div class="en-word" style="font-size: 1.8rem; font-weight: bold; color: #ffcc00;">${item.en}</div>
            <div class="ar-word" style="font-size: 1.3rem; color: #33ccff; margin-top: 5px;">${item.ar}</div>
        `;
        div.onclick = () => speakText(item.en);
        resultsContainer.appendChild(div);
    });
}

// 3. القواعد الشاملة
function loadGrammarContent() {
    const container = document.getElementById('grammar-content');
    if (!container) return;
    container.innerHTML = `
        <div style="text-align: right;">
            <h3 style="color: #ffcc00; border-bottom: 2px solid #ffcc00; padding-bottom: 5px;">1. زمن المضارع البسيط (Present Simple Tense)</h3>
            <p><strong>الاستخدام:</strong> يعبر عن الحقائق العلمية والعادات اليومية المكررة.</p>
            <p><strong>التكويـن:</strong></p>
            <ul style="padding-right: 20px; line-height: 2;">
                <li>مع (I, They, We, You): نضع الفعل في المصدر بدون إضافة. (مثال: They play football).</li>
                <li>مع (He, She, It): نضيف للفعل (s / es). (مثال: She plays football).</li>
            </ul>

            <h3 style="color: #ffcc00; border-bottom: 2px solid #ffcc00; padding-bottom: 5px; margin-top: 20px;">2. زمن الماضي البسيط (Past Simple Tense)</h3>
            <p><strong>الاستخدام:</strong> يعبر عن حدث بدأ وانتهى تماماً في الماضي.</p>
            <p><strong>التكويـن:</strong> التصريف الثاني للفعل بإضافة (ed) للأفعال المنتظمة.</p>
            <p>مثال: I visited my grandmother yesterday. (أنا زرت جدتي أمس).</p>

            <h3 style="color: #ffcc00; border-bottom: 2px solid #ffcc00; padding-bottom: 5px; margin-top: 20px;">3. الضمائر باللغة الإنجليزية (Pronouns)</h3>
            <p><strong>ضمائر الفاعل:</strong> I (أنا) | He (هو) | She (هي) | It (هو/هي لغير العاقل) | We (نحن) | They (هم) | You (أنت/أنتم).</p>
        </div>
    `;
}

// 4. المحادثات
function loadConversationsContent() {
    const container = document.getElementById('conversations-content');
    if (!container) return;
    container.innerHTML = `
        <div style="text-align: right;">
            <h3 style="color: #33ccff; border-bottom: 2px solid #33ccff; padding-bottom: 5px;">🗣️ حوار التعارف والترحيب (Greetings)</h3>
            <p style="color: #ffcc00; font-size: 1.2rem;">- Ali: Hello! What is your name?</p>
            <p style="color: #ffffff;">(علي: أهلاً! ما اسمك؟)</p>
            <p style="color: #33ccff; font-size: 1.2rem;">- Sara: My name is Sara. Nice to meet you!</p>
            <p style="color: #ffffff;">(سارة: اسمي سارة. سررت بلقائك!)</p>

            <h3 style="color: #33ccff; border-bottom: 2px solid #33ccff; padding-bottom: 5px; margin-top: 20px;">✈️ حوار في المطار (At the Airport)</h3>
            <p style="color: #ffcc00; font-size: 1.2rem;">- Officer: May I see your passport, please?</p>
            <p style="color: #ffffff;">(الموظف: هل يمكنني رؤية جواز سفرك من فضلك؟)</p>
            <p style="color: #33ccff; font-size: 1.2rem;">- Traveler: Here it is. Thank you.</p>
            <p style="color: #ffffff;">(المسافر: تفضل، شكراً لك.)</p>
        </div>
    `;
}

// 5. المجموعات
function loadCategoriesContent() {
    const container = document.getElementById('categories-content');
    if (!container) return;
    container.innerHTML = `
        <div style="text-align: right;">
            <h3 style="color: #ffcc00;">🔢 الأرقام (Numbers)</h3>
            <p>1: One | 2: Two | 3: Three | 4: Four | 5: Five | 6: Six | 7: Seven | 8: Eight | 9: Nine | 10: Ten</p>

            <h3 style="color: #ffcc00; margin-top: 15px;">🚗 المواصلات (Transportation)</h3>
            <p>Car (سيارة) | Bus (حافلة) | Train (قطار) | Plane (طائرة) | Bicycle (دراجة)</p>

            <h3 style="color: #ffcc00; margin-top: 15px;">🌊 البحر والطبيعة (Sea & Nature)</h3>
            <p>Fish (سمكة) | Sea (بحر) | Wave (موجة) | Sun (شمس) | Tree (شجرة)</p>

            <h3 style="color: #ffcc00; margin-top: 15px;">🕌 الدين والأخلاق (Religion & Morals)</h3>
            <p>Peace (سلام) | Faith (إيمان) | Truth (صدق) | Kindness (طيبة)</p>
        </div>
    `;
}

// 6. الألعاب
const questionsList = [
    { q: "ما هي ترجمة كلمة (Cat)؟", options: ["قطة", "كلب", "أسد", "فيل"], correct: 0 },
    { q: "ما هي ترجمة كلمة (Apple)؟", options: ["موز", "تفاحة", "برتقال", "عنب"], correct: 1 },
    { q: "اختر الكلمة الصحيحة لـ (Water):", options: ["هواء", "ماء", "نار", "تراب"], correct: 1 }
];
let currentQuestionIndex = 0;

function loadGameQuestion() {
    if (currentQuestionIndex >= questionsList.length) currentQuestionIndex = 0;
    const currentQ = questionsList[currentQuestionIndex];
    
    document.getElementById('game-question').innerText = currentQ.q;
    document.getElementById('game-feedback').innerText = '';
    
    const optionsContainer = document.getElementById('game-options');
    if (!optionsContainer) return;
    optionsContainer.innerHTML = '';
    
    currentQ.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(index, currentQ.correct, btn);
        optionsContainer.appendChild(btn);
    });
}

function checkAnswer(selectedIndex, correctIndex, buttonElement) {
    const allButtons = document.querySelectorAll('.option-btn');
    allButtons.forEach(b => b.disabled = true);

    if (selectedIndex === correctIndex) {
        buttonElement.classList.add('correct');
        document.getElementById('game-feedback').innerHTML = "<span style='color: #22c55e;'>إجابة صحيحة برافو عليك! 🎉</span>";
        speakText("Correct!");
    } else {
        buttonElement.classList.add('wrong');
        allButtons[correctIndex].classList.add('correct');
        document.getElementById('game-feedback').innerHTML = "<span style='color: #ef4444;'>إجابة خاطئة، حاول مرة أخرى! ❌</span>";
        speakText("Wrong answer!");
    }

    setTimeout(() => {
        currentQuestionIndex++;
        loadGameQuestion();
    }, 2000);
}

// 7. المترجم الصوتي
function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("عذراً، متصفحك لا يدعم التعرف على الصوت. يُفضل استخدام متصفح Google Chrome.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.start();

    const arOutput = document.getElementById('voice-arabic-text');
    const enOutput = document.getElementById('voice-english-text');

    if (arOutput) arOutput.innerText = "جاري الاستماع لصوتك... 🎙️";
    if (enOutput) enOutput.innerText = "جاري الترجمة...";

    recognition.onresult = async function(event) {
        const spokenText = event.results[0][0].transcript;
        if (arOutput) arOutput.innerText = "العربية: " + spokenText;

        try {
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(spokenText)}&langpair=ar|en`);
            const data = await response.json();
            
            if (data && data.responseData && data.responseData.translatedText) {
                const translatedText = data.responseData.translatedText;
                if (enOutput) enOutput.innerText = "English: " + translatedText;
                speakText(translatedText);
            } else {
                if (enOutput) enOutput.innerText = "English: Translation failed";
            }
        } catch (error) {
            console.error("Translation Error:", error);
            if (enOutput) enOutput.innerText = "English: (تأكد من الاتصال بالإنترنت للترجمة الفورية)";
        }
    };

    recognition.onerror = function() {
        if (arOutput) arOutput.innerText = "حدث خطأ أثناء الاستماع، حاول مرة أخرى.";
    };
}

// نطق اسم الحرف/الكلمة
function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
    }
}

// زر تثبيت PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.style.display = 'block';
        installBtn.addEventListener('click', () => {
            installBtn.style.display = 'none';
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(() => {
                deferredPrompt = null;
            });
        });
    }
});
