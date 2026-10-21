// State Variables
let currentCase = 'capital';
let currentLetter = 'A';
let isDrawing = false;
let canvas, ctx;

const capitalList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const smallList = "abcdefghijklmnopqrstuvwxyz".split("");

// Comprehensive Local Dictionary Database
const dictDatabase = [
    { en: "Apple", ar: "تفاحة" }, { en: "Elephant", ar: "فيل" },
    { en: "School", ar: "مدرسة" }, { en: "Family", ar: "عائلة" },
    { en: "Teacher", ar: "معلم" }, { en: "Doctor", ar: "طبيب" },
    { en: "Water", ar: "ماء" }, { en: "Airplane", ar: "طائرة" },
    { en: "Book", ar: "كتاب" }, { en: "Cat", ar: "قطة" },
    { en: "Dog", ar: "كلب" }, { en: "Sun", ar: "شمس" },
    { en: "Moon", ar: "قمر" }, { en: "House", ar: "بيت" },
    { en: "Car", ar: "سيارة" }, { en: "Friend", ar: "صديق" },
    { en: "Happy", ar: "سعيد" }, { en: "Milk", ar: "حليب" }
];

// Diverse Life Question Bank for Games
const quizQuestions = [
    { q: "ما معنى كلمة 'Cat'؟", opts: ["كلب", "قطة", "عصفور"], correct: 1 },
    { q: "ما معنى كلمة 'Book'؟", opts: ["كتاب", "قلم", "مدرسة"], correct: 0 },
    { q: "ما ترجمة 'صباح الخير' بالإنجليزية؟", opts: ["Good evening", "Good morning", "Good night"], correct: 1 },
    { q: "اختر الضمير المناسب: (___ is a doctor) يشار به للمفرد المذكر:", opts: ["She", "He", "They"], correct: 1 },
    { q: "ما معنى كلمة 'Water'؟", opts: ["طعام", "ماء", "شاي"], correct: 1 },
    { q: "ترجمة كلمة 'طبيب' بالإنجليزية هي:", opts: ["Teacher", "Doctor", "Driver"], correct: 1 },
    { q: "أي من هذه الكلمات تعني 'سيارة'؟", opts: ["Car", "Bus", "Train"], correct: 0 },
    { q: "ما معنى كلمة 'Happy'؟", opts: ["حزين", "غاضب", "سعيد"], correct: 2 }
];

let currentQuizIndex = 0;
const transCache = JSON.parse(localStorage.getItem('offline_trans') || '{}');

window.onload = () => {
    initCanvas();
    renderLettersBar();
    initHistoryNav();
};

// In-App History Navigation (No leaving app on back button)
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
        openDetailedContent(pageId);
        document.getElementById('detailsView').classList.add('active-view');
    }
}

// In-App Dictionary & Google Search Frame Integration
function searchInAppDictionary() {
    const query = document.getElementById('dictSearchInput').value.trim();
    const container = document.getElementById('dictResultsList');
    container.innerHTML = '';

    if (!query) {
        container.innerHTML = `<p style="text-align:center; padding:10px; color:#aaa;">اكتب كلمة للبحث في القاموس المحلي أو عبر الإنترنت.</p>`;
        document.getElementById('inAppSearchFrame').src = "about:blank";
        return;
    }

    const filtered = dictDatabase.filter(item => 
        item.en.toLowerCase().includes(query.toLowerCase()) || item.ar.includes(query)
    );

    if (filtered.length > 0) {
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
    } else {
        container.innerHTML = `<p style="text-align:center; padding:10px; color:#FFDD59;">لم توجد في القاموس المحلي، جاري البحث عبر محرك البحث في الإطار المدمج أسفله...</p>`;
    }

    // Load Google search or translation query directly inside the app iframe without leaving the page
    const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query + " meaning in English and Arabic")}`;
    document.getElementById('inAppSearchFrame').src = searchUrl;
}

// Sound Effects API for Correct / Wrong Answers (Clapping / Buzzer)
function playSound(type) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (type === 'success') {
            // Happy Chime / Clapping simulation
            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
            osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
            osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.5);
        } else {
            // Annoying Alarm / Buzzer sound for error
            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(130, audioCtx.currentTime);
            osc.frequency.setValueAtTime(90, audioCtx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.35);
        }
    } catch (e) {
        console.log("Audio not supported or blocked");
    }
}

// Quiz System with ✔️ and ❌
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
    allBtns.forEach(b => b.disabled = true);

    const feedback = document.getElementById('quizFeedback');

    if (selectedIdx === correctIdx) {
        selectedBtn.classList.add('opt-correct');
        selectedBtn.innerText += "  ✔️";
        feedback.innerText = "✔️ أحسنت! إجابة صحيحة وتمت إضافة +10 نقاط";
        feedback.className = "quiz-feedback-banner correct-text";
        playSound('success');
        
        let scoreElem = document.getElementById('userScore');
        scoreElem.innerText = parseInt(scoreElem.innerText) + 10;
    } else {
        selectedBtn.classList.add('opt-wrong');
        selectedBtn.innerText += "  ❌";
        
        allBtns[correctIdx].classList.add('opt-correct');
        allBtns[correctIdx].innerText += "  ✔️";

        feedback.innerText = "❌ إجابة خاطئة! راجع الإجابة الصحيحة أدناه.";
        feedback.className = "quiz-feedback-banner wrong-text";
        playSound('error');
    }

    document.getElementById('btnNextQuiz').style.display = 'block';
}

function loadNextQuestion() {
    currentQuizIndex = (currentQuizIndex + 1) % quizQuestions.length;
    loadQuizQuestion();
}

// Detailed Content: Grammar, Dialogues, Stories (الشرح بالتفصيل الممل)
function openDetailedContent(type) {
    const details = document.getElementById('detailsContent');
    
    if (type === 'grammar') {
        details.innerHTML = `
            <h2>📖 موسوعة القواعد الإنجليزية الشاملة (التفصيل الممل)</h2>
            <hr style="margin:10px 0; border-color:#444;"><br>
            
            <h3>1. الضمائر الشخصية (Personal Pronouns)</h3>
            <p>الضمائر هي الكلمات التي تحل محل الاسم لتجنب تكراره في الجملة. تنقسم إلى ضمائر فاعل:</p>
            <p>• <b>I</b> (أنا) - للمتكلم المفرد.<br>• <b>He</b> (هو) - للمفرد المذكر العاقل.<br>• <b>She</b> (هي) - للمفرد المؤنث العاقل.<br>• <b>It</b> (هذا/هذه) - لغير العاقل (حيوان، جماد، نبات).<br>• <b>We</b> (نحن) - للمتكلم الجمع.<br>• <b>They</b> (هم/هن) - لجمع العاقل وغير العاقل.<br>• <b>You</b> (أنتَ/أنتِ/أنتم) - للمخاطب بنوعيه.</p>
            <p><b>أمثلة تفصيلية:</b><br>- She is reading a book. (هي تقرأ كتاباً)<br>- They are playing football. (هم يلعبون كرة القدم)</p><br>

            <h3>2. فعل يكون (Verb to Be)</h3>
            <p>هو أهم فعل مساعد في اللغة الإنجليزية، ويعني (أكون / يكون / تكون / نكون / تكونون / يكونون). لا يتبع بفعل آخر يحمل "ing" إلا في الأزمنة المستمرة.</p>
            <p>• مع الضمير <b>I</b> نستخدم <b>am</b>.<br>• مع الضمائر <b>He, She, It</b> نستخدم <b>is</b>.<br>• مع الضمائر <b>We, They, You</b> نستخدم <b>are</b>.</p><br>

            <h3>3. زمن المضارع البسيط (Present Simple)</h3>
            <p><b>الاستخدام الأساسي:</b> يُستخدم للتعبير عن الحقائق الثابتة والعادات اليومية المتكررة.</p>
            <p><b>القاعدة والتكوين:</b> يتكون من التصريف الأول للفعل (المصدر). ولكن احذر! مع الضمائر المفردة الغائبة (He, She, It) يجب إضافة حرف <b>s</b> أو <b>es</b> نهاية الفعل.</p>
            <p><b>مثال توضيحي مفصل:</b><br>- I wake up early every day. (أنا أستيقظ مبكراً كل يوم - عادة)<br>- He speaks English very well. (هو يتحدث الإنجليزية بشكل جيد جداً - حقيبة مفرد أضيفت لها s)</p>
        `;
    } else if (type === 'dialogues') {
        details.innerHTML = `
            <h2>💬 محادثات الحياة اليومية الشاملة (+100)</h2>
            <hr style="margin:10px 0; border-color:#444;"><br>

            <div style="background:#161936; padding:15px; border-radius:12px; margin-bottom:15px;">
                <h3>🏫 1. في المدرسة والتعارف (At School)</h3>
                <p><b>Ahmad:</b> Good morning! My name is Ahmad. What is your name?</p>
                <p style="color:#4DEAEA;">(صباح الخير! اسمي أحمد. ما هو اسمك؟)</p>
                <p><b>John:</b> Good morning, Ahmad. My name is John. Nice to meet you.</p>
                <p style="color:#4DEAEA;">(صباح الخير يا أحمد. اسمي جون. سعيد لقائك.)</p>
                <button class="btn-act audio-btn" style="margin-top:8px;" onclick="speak('Good morning, Ahmad. My name is John. Nice to meet you.')">🔊 استمع للمحادثة</button>
            </div>

            <div style="background:#161936; padding:15px; border-radius:12px; margin-bottom:15px;">
                <h3>🛒 2. التسوق في السوبرماركت (At the Supermarket)</h3>
                <p><b>Customer:</b> Excuse me, how much is this apple?</p>
                <p style="color:#4DEAEA;">(عذراً، بكم هذه التفاحة؟)</p>
                <p><b>Seller:</b> It is 2 dollars per kilo. Do you need anything else?</p>
                <p style="color:#4DEAEA;">(سعرها دولارين للكيلو. هل تحتاج شيئاً آخر؟)</p>
                <p><b>Customer:</b> No, thank you. Here is the money.</p>
                <p style="color:#4DEAEA;">(لا، شكراً لك. تفضل النقود.)</p>
                <button class="btn-act audio-btn" style="margin-top:8px;" onclick="speak('Excuse me, how much is this apple? It is 2 dollars.')">🔊 استمع للمحادثة</button>
            </div>
        `;
    } else if (type === 'stories') {
        details.innerHTML = `
            <h2>📕 القصص التعليمية الموسعة (مترجمة ومشروحة)</h2>
            <hr style="margin:10px 0; border-color:#444;"><br>

            <div style="background:#161936; padding:15px; border-radius:12px; margin-bottom:15px;">
                <h3>1. The Thirsty Crow (الغراب العطشان) 🐦</h3>
                <p>Once upon a time, a thirsty crow flew for miles looking for water. Finally, he found a pitcher with a little water at the bottom, but his beak could not reach it.</p>
                <p style="color:#4DEAEA;">(في سالف الزمان، طار غراب عطشان لأميال بحثاً عن الماء. وأخيراً وجد إبريقاً فيه قليل من القاع، لكن منقاره لم يستطع الوصول إليه.)</p>
                <p style="margin-top:8px;">He did not give up. He started dropping small stones into the pitcher one by one. The water level rose up, and he drank happily!</p>
                <p style="color:#4DEAEA;">(لم يستسلم. وبدأ بإسقاط الحجارة الصغيرة في الإبريق واحداً تلو الآخر. ارتفع مستوى الماء وشرب بسعادة!)</p>
                <p style="margin-top:10px; color:#FFDD59;"><b>💡 العبرة المستفادة:</b> الذكاء والصبر وحل المشكلات بتركيز يمكننا من تجاوز أصعب العقبات في حياتنا اليومية.</p>
                <button class="btn-act audio-btn" style="margin-top:10px;" onclick="speak('Once upon a time, a thirsty crow flew for miles looking for water.')">🔊 استمع للقصة كاملة</button>
            </div>
        `;
    }
}

// Real Clean Translator (No 'English' string appended)
async function translateText(text) {
    let clean = text.trim();
    if (!clean) return;

    if (transCache[clean]) {
        document.getElementById('enText').innerText = transCache[clean];
        return;
    }

    document.getElementById('enText').innerText = "جاري الترجمة الفورية...";

    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=ar|en`);
        const data = await response.json();
        
        if (data && data.responseData && data.responseData.translatedText) {
            let translatedResult = data.responseData.translatedText;
            document.getElementById('enText').innerText = translatedResult; // Clean output without adding 'English'
            transCache[clean] = translatedResult;
            localStorage.setItem('offline_trans', JSON.stringify(transCache));
        } else {
            document.getElementById('enText').innerText = "تعذر الحصول على الترجمة";
        }
    } catch (error) {
        document.getElementById('enText').innerText = "خطأ في الاتصال بالشبكة للترجمة الفورية";
    }
}

// Voice Recognition
function toggleSpeech() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recog = new SpeechRecognition();
        recog.lang = 'ar-SA';
        
        recog.onstart = () => { document.getElementById('micBtn').innerText = '🎙️ جاري الاستماع بتركيز...'; };
        recog.onresult = (e) => {
            const text = e.results[0][0].transcript;
            document.getElementById('arText').innerText = text;
            translateText(text);
            document.getElementById('micBtn').innerText = '🎙️ اضغط وتحدث بالعربية';
        };
        recog.onerror = () => { document.getElementById('micBtn').innerText = '🎙️ اضغط وتحدث بالعربية'; };
        recog.start();
    } else {
        alert('المتصفح الحالي لا يدعم التعرف الصوتي المباشر.');
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
