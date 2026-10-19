// ==========================================
// English Kids Academy - Main Application JS
// ==========================================

const alphabetList = [
    { letter: "A a", sound: "Apple / أبل" },
    { letter: "B b", sound: "Ball / بول" },
    { letter: "C c", sound: "Cat / كات" },
    { letter: "D d", sound: "Dog / دوج" },
    { letter: "E e", sound: "Elephant / إليفانت" },
    { letter: "F f", sound: "Fish / فيش" },
    { letter: "G g", sound: "Girl / جيرل" },
    { letter: "H h", sound: "Hat / هات" },
    { letter: "I i", sound: "Ice Cream / آيس كريم" },
    { letter: "J j", sound: "Juice / جوس" },
    { letter: "K k", sound: "Kite / كايت" },
    { letter: "L l", sound: "Lion / ليون" },
    { letter: "M m", sound: "Monkey / مونكي" },
    { letter: "N n", sound: "Nest / نيست" },
    { letter: "O o", sound: "Orange / أورانج" },
    { letter: "P p", sound: "Pen / بين" },
    { letter: "Q q", sound: "Queen / كوين" },
    { letter: "R r", sound: "Rabbit / رابيت" },
    { letter: "S s", sound: "Sun / سان" },
    { letter: "T t", sound: "Tree / تري" },
    { letter: "U u", sound: "Umbrella / أمبريلا" },
    { letter: "V v", sound: "Van / فان" },
    { letter: "W w", sound: "Watch / ووتش" },
    { letter: "X x", sound: "X-ray / إكس راي" },
    { letter: "Y y", sound: "Yellow / يلو" },
    { letter: "Z z", sound: "Zebra / زيبرا" }
];

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

    alphabetList.forEach((item, index) => {
        const btn = document.createElement('button');
        btn.className = 'letter-btn' + (index === currentLetterIndex ? ' active-letter' : '');
        btn.innerText = item.letter.split(' ')[0];
        btn.onclick = () => {
            currentLetterIndex = index;
            loadAlphabetLetter();
        };
        grid.appendChild(btn);
    });
}

function loadAlphabetLetter() {
    renderLettersGrid();
    const currentObj = alphabetList[currentLetterIndex];
    speakText(currentObj.sound);
    drawFaintLetterOnBoard(currentObj.letter);
}

function nextLetter() {
    currentLetterIndex = (currentLetterIndex + 1) % alphabetList.length;
    loadAlphabetLetter();
}

function drawFaintLetterOnBoard(letterText) {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.font = "bold 140px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
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
    ctx.lineWidth = 8;
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
        resultsContainer.innerHTML = `<div class="dict-item"><div class="en-word">لا يوجد نتائج</div><div class="ar-word">جرب البحث عن كلمة أخرى...</div></div>`;
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

// 3. القواعد
function loadGrammarContent() {
    const container = document.getElementById('grammar-content');
    if (!container) return;
    container.innerHTML = `
        <h3>1. الأزمنة الأساسية (Tenses)</h3>
        <p><strong>المضارع البسيط (Present Simple):</strong> يعبر عن الحقائق والعادات اليومية.<br>مثال: I play football every day.</p>
        <p><strong>الماضي البسيط (Past Simple):</strong> يعبر عن حدث انتهى في الماضي.<br>مثال: She visited Cairo yesterday.</p>
        
        <h3>2. الأفعال المساعدة (Auxiliary Verbs)</h3>
        <p>استخدام (Verb to be): am, is, are للمضارع / was, were للماضي.</p>

        <h3>3. الضمائر (Pronouns)</h3>
        <p>ضمائر الفاعل: I (أنا), He (هو), She (هي), We (نحن), They (هم), You (أنت).</p>
    `;
}

// 4. المحادثات
function loadConversationsContent() {
    const container = document.getElementById('conversations-content');
    if (!container) return;
    container.innerHTML = `
        <h3>حوار التعارف (Greetings)</h3>
        <p style="color: #ffcc00; font-size: 1.3rem;">- أحمد: Hello! What is your name?</p>
        <p style="color: #33ccff; font-size: 1.3rem;">- جون: My name is John. Nice to meet you!</p>

        <h3>حوار في المطار (At the Airport)</h3>
        <p style="color: #ffcc00; font-size: 1.3rem;">- موظف الاستقبال: Passport, please?</p>
        <p style="color: #33ccff; font-size: 1.3rem;">- المسافر: Here is my passport and ticket.</p>
    `;
}

// 5. المجموعات
function loadCategoriesContent() {
    const container = document.getElementById('categories-content');
    if (!container) return;
    container.innerHTML = `
        <h3>🔢 الأرقام (Numbers)</h3>
        <p>1: One | 2: Two | 3: Three | 4: Four | 5: Five</p>

        <h3>✈️ المطار (Airport)</h3>
        <p>طائرة: Airplane | تذكرة: Ticket | جواز سفر: Passport</p>

        <h3>🌊 البحر (Sea)</h3>
        <p>سمكة: Fish | موجة: Wave | شاطئ: Beach</p>

        <h3>🚗 المواصلات (Transportation)</h3>
        <p>سيارة: Car | قطار: Train | حافلة: Bus</p>
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
        speakText("Excellent! Correct answer.");
    } else {
        buttonElement.classList.add('wrong');
        allButtons[correctIndex].classList.add('correct');
        document.getElementById('game-feedback').innerHTML = "<span style='color: #ef4444;'>إجابة خاطئة، حاول مرة أخرى! ❌</span>";
        speakText("Wrong answer, try again.");
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

function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    }
}

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
