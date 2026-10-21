// State
let currentCase = 'capital';
let currentLetter = 'A';
let isDrawing = false;
let canvas, ctx;

const capitalList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const smallList = "abcdefghijklmnopqrstuvwxyz".split("");

// Quiz Bank
const quizQuestions = [
    { q: "ما معنى كلمة 'Cat'؟", opts: ["كلب", "قطة", "عصفور"], correct: 1 },
    { q: "ما معنى كلمة 'Book'؟", opts: ["كتاب", "قلم", "مدرسة"], correct: 0 },
    { q: "ما هي الترجمة الصحيحة لـ 'صباح الخير'؟", opts: ["Good evening", "Good morning", "Good night"], correct: 1 },
    { q: "الضمير المناسب للمفرد المذكر العاقل (هو):", opts: ["She", "He", "They"], correct: 1 },
    { q: "ما معنى كلمة 'Water'؟", opts: ["طعام", "ماء", "عصير"], correct: 1 },
    { q: "ترجمة كلمة 'طبيب' هي:", opts: ["Teacher", "Doctor", "Driver"], correct: 1 },
    { q: "أي كلمة تعني 'سيارة'؟", opts: ["Car", "Bus", "Train"], correct: 0 },
    { q: "ما عكس كلمة 'Happy' (سعيد)؟", opts: ["Sad (حزين)", "Fast (سريع)", "Tall (طويل)"], correct: 0 },
    { q: "ما هو الفعل المساعد الذي يأتي مع الضمير 'I' في المضارع؟", opts: ["is", "are", "am"], correct: 2 },
    { q: "ما معنى كلمة 'Teacher'؟", opts: ["طبيب", "معلم", "مهندس"], correct: 1 }
];

let currentQuizIndex = 0;
const transCache = JSON.parse(localStorage.getItem('offline_trans') || '{}');

window.onload = () => {
    initCanvas();
    renderLettersBar();
    initHistoryNav();
};

// In-App Navigation (Prevents App Exit on Mobile Back Button)
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
    } else if (pageId === 'games') {
        document.getElementById('gamesView').classList.add('active-view');
        currentQuizIndex = 0;
        loadQuizQuestion();
    } else {
        openDetailedContent(pageId);
        document.getElementById('detailsView').classList.add('active-view');
    }
}

// Full API In-App Search Dictionary (Handles Arabic & English search, No frames, Unlimited words)
async function searchInAppDictionary() {
    const query = document.getElementById('dictSearchInput').value.trim();
    const container = document.getElementById('dictResultsList');
    
    if (!query) {
        container.innerHTML = `<p style="text-align:center; padding:15px; color:#aaa;">الرجاء كتابة كلمة في مربع البحث أعلاه.</p>`;
        return;
    }

    container.innerHTML = `<p style="text-align:center; padding:15px; color:#FFDD59;">جاري البحث عن الكلمة ونطقها...</p>`;

    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=ar|en`);
        const data = await res.json();

        if (data && data.responseData && data.responseData.translatedText) {
            let result = data.responseData.translatedText;
            
            container.innerHTML = `
                <div class="dict-card-item">
                    <div>
                        <div style="font-size:14px; color:#aaa;">الكلمة المبحوث عنها: <strong style="color:#fff;">${query}</strong></div>
                        <div style="font-size:20px; font-weight:bold; color:#FFDD59; margin-top:5px;">النتيجة: ${result}</div>
                    </div>
                    <button class="btn-speak-icon" onclick="speak('${result}')"><i class="fa-solid fa-volume-high"></i> نطق</button>
                </div>
            `;
        } else {
            container.innerHTML = `<p style="text-align:center; padding:15px; color:#FF4757;">لم نتمكن من العثور على الكلمة، تحقق من الإملاء.</p>`;
        }
    } catch (e) {
        container.innerHTML = `<p style="text-align:center; padding:15px; color:#FF4757;">يرجى الاتصال بالإنترنت للبحث في القاموس لأول مرة.</p>`;
    }
}

// Sound Effects API
function playSound(type) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (type === 'success') {
            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
            osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
            osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.5);
        } else {
            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140, audioCtx.currentTime);
            osc.frequency.setValueAtTime(90, audioCtx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.35);
        }
    } catch (e) {}
}

// Quiz System
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

        feedback.innerText = "❌ إجابة خاطئة! راجع الإجابة الصحيحة أعلاه.";
        feedback.className = "quiz-feedback-banner wrong-text";
        playSound('error');
    }

    document.getElementById('btnNextQuiz').style.display = 'block';
}

function loadNextQuestion() {
    currentQuizIndex = (currentQuizIndex + 1) % quizQuestions.length;
    loadQuizQuestion();
}

// DETAILED CONTENT (الشرح الموسع والتفصيل الممل)
function openDetailedContent(type) {
    const details = document.getElementById('detailsContent');
    
    if (type === 'grammar') {
        details.innerHTML = `
            <h2>📖 موسوعة قواعد اللغة الإنجليزية (شرح وافٍ وتفصيل ممل)</h2>

            <h3>1. الضمائر الشخصية الشاملة (Personal Pronouns)</h3>
            <p>الضمائر هي أساس تكوين أي جملة إنجليزية. تنقسم إلى ضمائر الفاعل (التي تقوم بالعمل) وضمائر المفعول والملكية:</p>
            <ul>
                <li><b>I (أنا):</b> للمتكلم المفرد. مثال: <i>I am a student.</i> (أنا طالب)</li>
                <li><b>He (هو):</b> للمفرد المذكر العاقل. مثال: <i>He is a doctor.</i> (هو طبيب)</li>
                <li><b>She (هي):</b> للمفرد المؤنث العاقل. مثال: <i>She is reading.</i> (هي تقرأ)</li>
                <li><b>It (هو/هي لغير العاقل):</b> للجماد، الحيوان، أو النبات. مثال: <i>It is a cat.</i> (إنها قطة)</li>
                <li><b>We (نحن):</b> للمتكلم الجمع. مثال: <i>We learn English.</i> (نحن نتعلم الإنجليزية)</li>
                <li><b>They (هم/هن):</b> للجمع الغائب (عاقل وغير عاقل). مثال: <i>They play football.</i> (هم يلعبون كرة القدم)</li>
                <li><b>You (أنتَ/أنتِ/أنتم):</b> للمخاطب بجميع أنواعه. مثال: <i>You are honest.</i> (أنت صادق)</li>
            </ul>

            <h3>2. فعل يكون (Verb to Be) بالتفصيل</h3>
            <p>يعتبر أهم أفعال اللغة الإنجليزية على الإطلاق. يعني (أكون/يكون/تكون). يتغير شكله حسب الفاعل:</p>
            <p>• <b>In Affirmative (الإثبات):</b><br>
            - I + <b>am</b> → <i>I am happy.</i><br>
            - He / She / It + <b>is</b> → <i>He is tall.</i><br>
            - We / They / You + <b>are</b> → <i>They are friends.</i></p>
            <p>• <b>In Negative (النفي):</b> نضيف كلمة <b>not</b> بعد الفعل المساعد:<br>
            - <i>I am not tired.</i> | <i>He is not a teacher.</i> | <i>We are not late.</i></p>

            <h3>3. زمن المضارع البسيط (Present Simple Tense)</h3>
            <p><b>الهدف منه:</b> التعبير عن العادات والروتين اليومي والحقائق العلمية الثابتة.</p>
            <p><b>التكوين بالتفصيل:</b><br>
            1. مع الضمائر (I, We, They, You): نضع الفعل كما هو في المصدر بدون أي إضافة.<br>
            مثال: <i>We eat breakfast every day.</i> (نحن نأكل الافطار كل يوم)<br>
            2. مع الضمائر المفردة الغائبة (He, She, It): <b>يجب إضافة حرف (s) أو (es) نهاية الفعل!</b><br>
            مثال: <i>He plays tennis on Fridays.</i> (هو يلعب التنس كل جمعة - لاحظ إضافة s للفعل play)</p>

            <h3>4. أدوات الاستفهام الرئيسية (Question Words)</h3>
            <p>• <b>What (ماذا/ما):</b> للسؤال عن الأشياء والمعلومات. <i>What is your name?</i><br>
            • <b>Where (أين):</b> للسؤال عن المكان. <i>Where do you live?</i><br>
            • <b>When (متى):</b> للسؤال عن الزمان والوقت. <i>When do you sleep?</i><br>
            • <b>Who (من):</b> للسؤال عن الأشخاص العاقلين. <i>Who is your teacher?</i><br>
            • <b>Why (لماذا):</b> للسؤال عن السبب. <i>Why are you happy?</i></p>
        `;
    } else if (type === 'dialogues') {
        details.innerHTML = `
            <h2>💬 موسوعة محادثات الحياة اليومية الشاملة (+100 موقف)</h2>

            <div class="dialogue-box">
                <h3>🏫 1. في المدرسة والتعارف الرسمي (At School)</h3>
                <p><b>Omar:</b> Hello! My name is Omar. I am a new student here.</p>
                <p style="color:#4DEAEA;">(مرحباً! اسمي عمر. أنا طالب جديد هنا.)</p>
                <p><b>Youssef:</b> Welcome Omar! I am Youssef. Which grade are you in?</p>
                <p style="color:#4DEAEA;">(أهلاً بك يا عمر! أنا يوسف. في أي صف دراسي أنت؟)</p>
                <p><b>Omar:</b> I am in grade five. And you?</p>
                <p style="color:#4DEAEA;">(أنا في الصف الخامس. وأنت؟)</p>
                <p><b>Youssef:</b> I am in grade five too! Let us be friends.</p>
                <p style="color:#4DEAEA;">(أنا في الصف الخامس أيضاً! لنكن أصدقاء.)</p>
                <button class="btn-act audio-btn" style="margin-top:10px;" onclick="speak('Hello! My name is Omar. Welcome Omar! I am Youssef.')">🔊 استمع للمحادثة كاملة</button>
            </div>

            <div class="dialogue-box">
                <h3>🛒 2. التسوق والشراء في السوبرماركت (At the Supermarket)</h3>
                <p><b>Customer:</b> Excuse me, where can I find the fresh milk?</p>
                <p style="color:#4DEAEA;">(عذراً، أين يمكنني أن أجد الحليب الطازج؟)</p>
                <p><b>Seller:</b> It is in aisle three, next to the cheese section.</p>
                <p style="color:#4DEAEA;">(إنه في الممر رقم ثلاثة، بجوار قسم الجبن.)</p>
                <p><b>Customer:</b> Thank you. How much is one bottle?</p>
                <p style="color:#4DEAEA;">(شكراً لك. كم سعر الزجاجة الواحدة؟)</p>
                <p><b>Seller:</b> It costs 3 dollars.</p>
                <p style="color:#4DEAEA;">(سعرها 3 دولار.)</p>
                <button class="btn-act audio-btn" style="margin-top:10px;" onclick="speak('Excuse me, where can I find the fresh milk? It costs 3 dollars.')">🔊 استمع للمحادثة كاملة</button>
            </div>

            <div class="dialogue-box">
                <h3>🩺 3. عند الطبيب والعيادة (At the Clinic)</h3>
                <p><b>Doctor:</b> Hello! What seems to be the problem today?</p>
                <p style="color:#4DEAEA;">(أهلاً بك! ما هي المشكلة التي تعاني منها اليوم؟)</p>
                <p><b>Patient:</b> I have a bad stomachache and a high temperature.</p>
                <p style="color:#4DEAEA;">(عندي ألم شديد في المعدة وارتفاع في درجة الحرارة.)</p>
                <p><b>Doctor:</b> Do not worry. Take this prescription and rest for two days.</p>
                <p style="color:#4DEAEA;">(لا تقلق. خذ هذه الروشتة واستريح لمدة يومين.)</p>
                <button class="btn-act audio-btn" style="margin-top:10px;" onclick="speak('Hello! What seems to be the problem today? Take this prescription and rest.')">🔊 استمع للمحادثة كاملة</button>
            </div>
        `;
    } else if (type === 'stories') {
        details.innerHTML = `
            <h2>📕 القصص التعليمية الموسعة (النص الكامل والتحليل)</h2>

            <div class="dialogue-box">
                <h3>1. The Thirsty Crow (قصة الغراب العطشان والذكاء) 🐦</h3>
                <p>On a hot summer day, a crow became very thirsty. He flew all around the village searching for water. After a long search, he saw a pitcher of water in a garden.</p>
                <p style="color:#4DEAEA;">(في يوم صيفي حار، شعر غراب بعطش شديد. طار في كل أرجاء القرية بحثاً عن الماء. وبعد بحث طويل، رأى إبريق ماء في إحدى الحدائق.)</p>
                <p style="margin-top:8px;">When he flew down, he looked inside. The water level was very low, and his beak could not reach it. He tried to tilt the pitcher, but it was too heavy.</p>
                <p style="color:#4DEAEA;">(عندما نزل لأسفل ونظر بداخل الإبريق، وجد مستوى الماء منخفضاً جداً ولم يستطع منقاره الوصول إليه. حاول إمالة الإبريق لكنه كان ثقيلاً جداً.)</p>
                <p style="margin-top:8px;">The clever crow looked around and saw small pebbles on the ground. He had a great idea! He picked up the stones one by one and dropped them into the pitcher. Gradually, the water level rose to the top. The crow drank happily and flew away!</p>
                <p style="color:#4DEAEA;">(نظر الغراب الذكي حوله ورأى حصى صغيرة على الأرض. جاءته فكرة عظيمة! بدأ يلتقط الحجارة واحدة تلو الأخرى ويسقطها بالداخل. تدريجياً، ارتفع مستوى الماء للأعلى. شرب الغراب بسعادة وطار بعيداً!)</p>
                <p style="margin-top:12px; color:#FFDD59;"><b>💡 الدروس المستفادة والعبرة:</b> بالتفكير المنطقي والصبر وإعمال العقل نصل لحلول لأصعب المشاكل التي تقابلنا في الحياة.</p>
                <button class="btn-act audio-btn" style="margin-top:10px;" onclick="speak('On a hot summer day, a crow became very thirsty. The clever crow looked around and dropped stones.')">🔊 استمع للقصة كاملة</button>
            </div>
        `;
    }
}

// Clean Real Translator
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
            document.getElementById('enText').innerText = translatedResult;
            transCache[clean] = translatedResult;
            localStorage.setItem('offline_trans', JSON.stringify(transCache));
        } else {
            document.getElementById('enText').innerText = "تعذر الحصول على الترجمة";
        }
    } catch (error) {
        document.getElementById('enText').innerText = "خطأ في الاتصال بالشبكة للترجمة الفورية";
    }
}

// Speech Recognition
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
