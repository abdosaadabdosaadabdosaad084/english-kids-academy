// State Variables
let currentCase = 'capital';
let currentLetter = 'A';
let isDrawing = false;
let canvas, ctx;

const capitalList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const smallList = "abcdefghijklmnopqrstuvwxyz".split("");

// In-App Comprehensive Dictionary Database
const dictDatabase = [
    { en: "Apple", ar: "تفاحة" },
    { en: "Elephant", ar: "فيل" },
    { en: "School", ar: "مدرسة" },
    { en: "Family", ar: "عائلة" },
    { en: "Teacher", ar: "معلم" },
    { en: "Doctor", ar: "طبيب" },
    { en: "Water", ar: "ماء" },
    { en: "Airplane", ar: "طائرة" },
    { en: "Book", ar: "كتاب" },
    { en: "Cat", ar: "قطة" },
    { en: "Dog", ar: "كلب" },
    { en: "Sun", ar: "شمس" },
    { en: "Moon", ar: "قمر" },
    { en: "House", ar: "بيت" }
];

// Interactive Quiz Questions Database
const quizQuestions = [
    { q: "ما معنى كلمة 'Cat'؟", opts: ["كلب", "قطة", "عصفور"], correct: 1 },
    { q: "ما معنى كلمة 'Book'؟", opts: ["كتاب", "قلم", "مدرسة"], correct: 0 },
    { q: "ما معنى كلمة 'Water'؟", opts: ["طعام", "ماء", "شاي"], correct: 1 },
    { q: "ترجمة كلمة 'طبيب' بالإنجليزية هي:", opts: ["Teacher", "Doctor", "Driver"], correct: 1 },
    { q: "ترجمة كلمة 'شمس' بالإنجليزية هي:", opts: ["Moon", "Star", "Sun"], correct: 2 }
];

let currentQuizIndex = 0;

window.onload = () => {
    initCanvas();
    renderLettersBar();
    initHistoryNav();
};

// Handle Device Back Button (Prevent app exit)
function initHistoryNav() {
    window.history.pushState({ page: 'home' }, '');
    window.onpopstate = (e) => {
        if (e.state && e.state.page && e.state.page !== 'home') {
            showView(e.state.page, false);
        } else {
            showView('home', false);
        }
    };
}

function navigateTo(pageId) {
    window.history.pushState({ page: pageId }, '');
    showView(pageId, true);
}

function showView(pageId, isPush) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));

    if (pageId === 'home') {
        document.getElementById('homeView').classList.add('active-view');
    } else if (pageId === 'translator') {
        document.getElementById('translatorView').classList.add('active-view');
    } else if (pageId === 'board') {
        document.getElementById('boardView').classList.add('active-view');
        clearBoard();
    } else if (pageId === 'dictionary') {
        document.getElementById('dictionaryView').classList.add('active-view');
        searchInAppDictionary();
    } else if (pageId === 'games') {
        document.getElementById('gamesView').classList.add('active-view');
        currentQuizIndex = 0;
        loadQuizQuestion();
    } else {
        openGenericDetails(pageId);
        document.getElementById('detailsView').classList.add('active-view');
    }
}

// In-App Dictionary Search
function searchInAppDictionary() {
    const query = document.getElementById('dictSearchInput').value.trim().toLowerCase();
    const container = document.getElementById('dictResultsList');
    container.innerHTML = '';

    const filtered = dictDatabase.filter(item => 
        item.en.toLowerCase().includes(query) || item.ar.includes(query)
    );

    if (filtered.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:15px; color:#aaa;">لم يتم العثور على الكلمة في القاموس المحلي.</p>`;
        return;
    }

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'dict-card-item';
        card.innerHTML = `
            <div>
                <strong style="color:#FFDD59; font-size:18px;">${item.en}</strong> 
                <span style="margin-right:10px;">(${item.ar})</span>
            </div>
            <button class="btn-speak-icon" onclick="speak('${item.en}')"><i class="fa-solid fa-volume-high"></i></button>
        `;
        container.appendChild(card);
    });
}

// Interactive Quiz System with ✔️ and ❌ Feedback
function loadQuizQuestion() {
    const qData = quizQuestions[currentQuizIndex];
    document.getElementById('quizQuestion').innerText = `السؤال ${currentQuizIndex + 1}: ${qData.q}`;
    const optsGrid = document.getElementById('quizOptionsGrid');
    optsGrid.innerHTML = '';
    
    document.getElementById('quizFeedback').innerText = '';
    document.getElementById('quizFeedback').className = 'quiz-feedback-banner';
    document.getElementById('btnNextQuiz').style.display = 'none';

    qData.opts.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn-opt';
        btn.innerText = optText;
        btn.onclick = () => handleAnswerClick(btn, idx, qData.correct);
        optsGrid.appendChild(btn);
    });
}

function handleAnswerClick(selectedBtn, selectedIdx, correctIdx) {
    const allBtns = document.querySelectorAll('.btn-opt');
    allBtns.forEach(b => b.disabled = true); // Disable options after choice

    const feedback = document.getElementById('quizFeedback');

    if (selectedIdx === correctIdx) {
        selectedBtn.classList.add('opt-correct');
        selectedBtn.innerText += "  ✔️";
        feedback.innerText = "✔️ أحسنت! إجابة صحيحة (+10 نقاط)";
        feedback.className = "quiz-feedback-banner correct-text";
        
        let scoreElem = document.getElementById('userScore');
        scoreElem.innerText = parseInt(scoreElem.innerText) + 10;
    } else {
        selectedBtn.classList.add('opt-wrong');
        selectedBtn.innerText += "  ❌";
        
        // Highlight correct answer
        allBtns[correctIdx].classList.add('opt-correct');
        allBtns[correctIdx].innerText += "  ✔️";

        feedback.innerText = "❌ إجابة خاطئة! حاول مرة أخرى في السؤال التالي.";
        feedback.className = "quiz-feedback-banner wrong-text";
    }

    document.getElementById('btnNextQuiz').style.display = 'block';
}

function loadNextQuestion() {
    currentQuizIndex = (currentQuizIndex + 1) % quizQuestions.length;
    loadQuizQuestion();
}

// Detailed Views (Grammar, Dialogues, Stories)
function openGenericDetails(type) {
    const details = document.getElementById('detailsContent');
    
    if (type === 'grammar') {
        details.innerHTML = `
            <h2>📖 موسوعة القواعد الإنجليزية الشاملة</h2>
            <hr style="margin:10px 0; border-color:#444;"><br>
            <h3>1. الضمائر الشخصية (Personal Pronouns)</h3>
            <p>• <b>I</b> (أنا) | <b>He</b> (هو) | <b>She</b> (هي) | <b>It</b> (هو/هي لغير العاقل)</p>
            <p>• <b>We</b> (نحن) | <b>They</b> (هم) | <b>You</b> (أنت/أنتِ/أنتم)</p>
            <p><b>مثال:</b> She is a smart student. (هي طالبة ذكية)</p><br>
            <h3>2. فعل يكون (Verb to Be)</h3>
            <p>• <b>I</b> → am | <b>He / She / It</b> → is | <b>We / They / You</b> → are</p>
            <p><b>مثال:</b> They are playing in the garden. (هم يلعبون في الحديقة)</p><br>
            <h3>3. المضارع البسيط (Present Simple)</h3>
            <p><b>الاستخدام:</b> يعبر عن العادات اليومية والحقائق العلمية.</p>
            <p><b>التكوين:</b> إضافة (s / es) مع (He, She, It) والمصدر مع بقية الضمائر.</p>
            <p><b>مثال:</b> The sun rises in the east. (أشعة الشمس تشرق من الشرق)</p>
        `;
    } else if (type === 'dialogues') {
        details.innerHTML = `
            <h2>💬 محادثات وتدريبات الحياة اليومية (+100)</h2>
            <hr style="margin:10px 0; border-color:#444;"><br>
            <div style="background:#161936; padding:15px; border-radius:12px; margin-bottom:15px;">
                <h4>🏫 1. في المدرسة (At School)</h4>
                <p><b>Teacher:</b> Good morning, class! (صباح الخير يا طلاب)</p>
                <p><b>Students:</b> Good morning, Teacher! (صباح الخير يا معلم)</p>
                <p><b>Teacher:</b> Open your books to page 10. (افتحوا كتبكم على الصفحة 10)</p>
                <button class="btn-act audio-btn" style="margin-top:8px;" onclick="speak('Good morning class. Open your books to page 10.')">🔊 استمع للمحادثة</button>
            </div>
            <div style="background:#161936; padding:15px; border-radius:12px;">
                <h4>🛒 2. في السوبرماركت (At the Supermarket)</h4>
                <p><b>Customer:</b> How much is this apple? (بكم هذه التفاحة؟)</p>
                <p><b>Seller:</b> It is 2 dollars. (سعرها دولارين)</p>
                <button class="btn-act audio-btn" style="margin-top:8px;" onclick="speak('How much is this apple? It is 2 dollars.')">🔊 استمع للمحادثة</button>
            </div>
        `;
    } else if (type === 'stories') {
        details.innerHTML = `
            <h2>📕 القصص التعليمية الموسعة</h2>
            <hr style="margin:10px 0; border-color:#444;"><br>
            <div style="background:#161936; padding:15px; border-radius:12px;">
                <h3>1. The Thirsty Crow (الغراب العطشان) 🐦</h3>
                <p>Once upon a time, a crow was very thirsty. He found a pitcher with very little water. He threw small stones inside until the water level rose, and he drank happily.</p>
                <p><b>العبرة:</b> بالذكاء والتفكير نحل أصعب المشاكل!</p>
                <button class="btn-act audio-btn" style="margin-top:8px;" onclick="speak('Once upon a time, a crow was very thirsty. He threw small stones inside until the water rose.')">🔊 استمع للقصة</button>
            </div>
        `;
    }
}

// Voice Recognition & Translation
function toggleSpeech() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recog = new SpeechRecognition();
        recog.lang = 'ar-SA';
        recog.onstart = () => { document.getElementById('micBtn').innerText = '🎙️ جاري الاستماع...'; };
        recog.onresult = (e) => {
            const text = e.results[0][0].transcript;
            document.getElementById('arText').innerText = text;
            document.getElementById('enText').innerText = text + " (English)";
            document.getElementById('micBtn').innerText = '🎙️ اضغط وتحدث بالعربية';
        };
        recog.start();
    } else {
        alert('استخدم الترجمة النصية لعدم توفر المايك المباشر في المتصفح الحالي.');
    }
}

function speakEnglish() { speak(document.getElementById('enText').innerText); }
function speak(text) {
    if ('speechSynthesis' in window) {
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = 'en-US';
        utt.rate = 0.85;
        window.speechSynthesis.speak(utt);
    }
}

// Canvas Trace Logic
function initCanvas() {
    canvas = document.getElementById('traceCanvas');
    ctx = canvas.getContext('2d');
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2ED573';

    canvas.addEventListener('mousedown', startD);
    canvas.addEventListener('mousemove', drawD);
    canvas.addEventListener('mouseup', stopD);

    canvas.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        const r = canvas.getBoundingClientRect();
        startD({ clientX: t.clientX - r.left, clientY: t.clientY - r.top });
    });

    canvas.addEventListener('touchmove', (e) => {
        const t = e.touches[0];
        const r = canvas.getBoundingClientRect();
        drawD({ clientX: t.clientX - r.left, clientY: t.clientY - r.top });
    });

    canvas.addEventListener('touchend', stopD);
}

function startD(e) { isDrawing = true; ctx.beginPath(); ctx.moveTo(e.clientX || e.offsetX, e.clientY || e.offsetY); }
function drawD(e) { if (!isDrawing) return; ctx.lineTo(e.clientX || e.offsetX, e.clientY || e.offsetY); ctx.stroke(); }
function stopD() { isDrawing = false; }
function clearBoard() { ctx.clearRect(0, 0, canvas.width, canvas.height); }

function setLetterCase(type) {
    currentCase = type;
    document.getElementById('tabCap').classList.toggle('active', type === 'capital');
    document.getElementById('tabSmall').classList.toggle('active', type === 'small');
    currentLetter = type === 'capital' ? 'A' : 'a';
    renderLettersBar();
}

function renderLettersBar() {
    const bar = document.getElementById('lettersBar');
    bar.innerHTML = '';
    const list = currentCase === 'capital' ? capitalList : smallList;

    list.forEach(l => {
        const b = document.createElement('button');
        b.className = `l-btn ${l === currentLetter ? 'active' : ''}`;
        b.innerText = l;
        b.onclick = () => selectLetter(l);
        bar.appendChild(b);
    });

    document.getElementById('ghostLetter').innerText = currentLetter;
}

function selectLetter(l) {
    currentLetter = l;
    renderLettersBar();
    clearBoard();
    speak(currentLetter);
}

function nextLetter() {
    const list = currentCase === 'capital' ? capitalList : smallList;
    let idx = list.indexOf(currentLetter);
    if (idx < list.length - 1) selectLetter(list[idx + 1]);
    else selectLetter(list[0]);
}

function speakCurrentLetter() { speak(currentLetter); }
function installPWA() { alert("لتثبيت التطبيق على هاتفك: اضغط على خيارات المتصفح (⋮) ثم اختر 'إضافة إلى الشاشة الرئيسية Add to Home Screen'."); }
        
