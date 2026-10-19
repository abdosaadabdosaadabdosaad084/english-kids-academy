// ==========================================
// English Kids Academy - Professional App JS
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

// ------------------------------------------
// 1. قسم الحروف والسبورة (نطق اسم الحرف + شبكة مجمعة + تتبع باهت واضح)
// ------------------------------------------
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
    speakText(currentLetter); // نطق اسم الحرف صريحاً
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
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)"; // لون باهت واضح جداً للتتبع
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
    ctx.strokeStyle = '#ffcc00'; // لون أصفر مبهج للكتابة

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

// ------------------------------------------
// 2. القاموس الشامل (بحث فقط والتخزين التلقائي أوفلاين)
// ------------------------------------------
const massiveDictionary = [
    { en: "Apple", ar: "تفاحة" }, { en: "Book", ar: "كتاب" }, { en: "Cat", ar: "قطة" },
    { en: "Dog", ar: "كلب" }, { en: "Elephant", ar: "فيل" }, { en: "Fish", ar: "سمكة" },
    { en: "Sun", ar: "شمس" }, { en: "Moon", ar: "قمر" }, { en: "Water", ar: "ماء" },
    { en: "School", ar: "مدرسة" }, { en: "Teacher", ar: "معلم" }, { en: "Student", ar: "طالب" },
    { en: "Family", ar: "عائلة" }, { en: "Friend", ar: "صديق" }, { en: "House", ar: "منزل" },
    { en: "Car", ar: "سيارة" }, { en: "Tree", ar: "شجرة" }, { en: "Peace", ar: "سلام" },
    { en: "Hospital", ar: "مستشفى" }, { en: "Airport", ar: "مطار" }, { en: "Computer", ar: "حاسوب" }
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
        resultsContainer.innerHTML = `<div class="dict-item"><div class="en-word">لا توجد نتائج</div><div class="ar-word">جرب البحث عن كلمة أخرى...</div></div>`;
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

// ------------------------------------------
// 3. قسم قواعد اللغة الإنجليزية (موسوعة تفصيلية من A إلى Z)
// ------------------------------------------
function loadGrammarContent() {
    const container = document.getElementById('grammar-content');
    if (!container) return;
    container.innerHTML = `
        <div style="text-align: right; line-height: 1.8;">
            <h3 style="color: #ffcc00; border-bottom: 2px solid #ffcc00; padding-bottom: 5px;">📚 المستوى الأول: المضارع البسيط (Present Simple)</h3>
            <p><strong>الاستخدام:</strong> يعبر عن الحقائق الثابتة والعادات اليومية.</p>
            <p><strong>التركيبة (Structure):</strong> الفاعل + الفعل في المصدر (مع الجمع) أو مضافاً إليه (s/es) مع المفرد.</p>
            <p style="color: #33ccff;">مثال: I read books every night. / She reads books.</p>

            <h3 style="color: #ffcc00; border-bottom: 2px solid #ffcc00; padding-bottom: 5px; margin-top: 25px;">📚 المستوى الثاني: الماضي البسيط (Past Simple)</h3>
            <p><strong>الاستخدام:</strong> للتعبير عن أفعال حدثت وانتهت في الماضي.</p>
            <p><strong>التركيبة (Structure):</strong> الفاعل + التصريف الثاني للفعل (إضافة ed للأفعال المنتظمة).</p>
            <p style="color: #33ccff;">مثال: We played football yesterday.</p>

            <h3 style="color: #ffcc00; border-bottom: 2px solid #ffcc00; padding-bottom: 5px; margin-top: 25px;">📚 المستوى الثالث: الأفعال المساعدة والضمائر</h3>
            <p><strong>Verb to be:</strong> (am, is,are) للمضارع | (was, were) للماضي.</p>
            <p><strong>ضمائر الفاعل (Subject Pronouns):</strong> I, He, She, It, We, They, You.</p>
        </div>
    `;
}

// ------------------------------------------
// 4. قسم المحادثات والحوارات الحياتية الكاملة
// ------------------------------------------
function loadConversationsContent() {
    const container = document.getElementById('conversations-content');
    if (!container) return;
    container.innerHTML = `
        <div style="text-align: right; line-height: 1.8;">
            <h3 style="color: #33ccff; border-bottom: 2px solid #33ccff; padding-bottom: 5px;">🤝 حوار التعارف اليومي (Greetings)</h3>
            <p style="color: #ffcc00; font-size: 1.2rem;">- Ahmed: Hello! How are you today?</p>
            <p style="color: #fff;">(أحمد: أهلاً! كيف حالك اليوم؟)</p>
            <p style="color: #33ccff; font-size: 1.2rem;">- John: I am fine, thank you. And you?</p>
            <p style="color: #fff;">(جون: أنا بخير، شكراً لك. وأنت؟)</p>

            <h3 style="color: #33ccff; border-bottom: 2px solid #33ccff; padding-bottom: 5px; margin-top: 25px;">🛒 حوار في التسوق (Shopping)</h3>
            <p style="color: #ffcc00; font-size: 1.2rem;">- Customer: How much is this shirt?</p>
            <p style="color: #fff;">(الزبون: كم سعر هذا القميص؟)</p>
            <p style="color: #33ccff; font-size: 1.2rem;">- Seller: It is twenty dollars.</p>
            <p style="color: #fff;">(البائع: إنه عشرون دولاراً.)</p>
        </div>
    `;
}

// ------------------------------------------
// 5. قسم المجموعات والمجالات (مع جمل كاملة)
// ------------------------------------------
function loadCategoriesContent() {
    const container = document.getElementById('categories-content');
    if (!container) return;
    container.innerHTML = `
        <div style="text-align: right; line-height: 1.8;">
            <h3 style="color: #ffcc00;">🔢 الأرقام والعد (Numbers)</h3>
            <p>1: One | 2: Two | 3: Three | 4: Four | 5: Five | 10: Ten | 100: Hundred</p>

            <h3 style="color: #ffcc00; margin-top: 20px;">🚗 المواصلات والسفر (Transport)</h3>
            <p>Car (سيارة) - I have a red car.<br>Plane (طائرة) - The plane flies fast.</p>

            <h3 style="color: #ffcc00; margin-top: 20px;">🌊 الطبيعة والبحر (Nature)</h3>
            <p>Sea (بحر) - The sea is blue.<br>Sun (شمس) - The sun shines brightly.</p>

            <h3 style="color: #ffcc00; margin-top: 20px;">🕌 الأخلاق والقيم (Morals)</h3>
            <p>Peace (سلام) - We love peace.<br>Kindness (اللطف) - Kindness is great.</p>
        </div>
    `;
}

// ------------------------------------------
// 6. الألعاب والتحديات الذكية (مع أخضر صحيح وأحمر خطأ وتفسير)
// ------------------------------------------
const questionsList = [
    { 
        q: "ما هي ترجمة كلمة (Cat) الصحيحة؟", 
        options: ["قطة", "كلب", "أسد", "فيل"], 
        correct: 0, 
        explanation: "كلمة Cat تعني قطة باللغة العربية، بينما كلب تعني Dog." 
    },
    { 
        q: "ما هي ترجمة كلمة (Apple)؟", 
        options: ["موز", "تفاحة", "برتقال", "عنب"], 
        correct: 1, 
        explanation: "كلمة Apple تعني تفاحة." 
    },
    { 
        q: "اختر الكلمة الإنجليزية المناسبة لـ (ماء):", 
        options: ["Air", "Water", "Fire", "Earth"], 
        correct: 1, 
        explanation: "Water تعني ماء." 
    }
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
        btn.onclick = () => checkAnswer(index, currentQ.correct, currentQ.explanation, btn);
        optionsContainer.appendChild(btn);
    });
}

function checkAnswer(selectedIndex, correctIndex, explanationText, buttonElement) {
    const allButtons = document.querySelectorAll('.option-btn');
    allButtons.forEach(b => b.disabled = true);

    const feedbackElem = document.getElementById('game-feedback');

    if (selectedIndex === correctIndex) {
        buttonElement.classList.add('correct'); // أخضر للإجابة الصح
        feedbackElem.innerHTML = `<span style='color: #22c55e;'>إجابة صحيحة برافو عليك! 🎉<br><small>${explanationText}</small></span>`;
        speakText("Correct!");
    } else {
        buttonElement.classList.add('wrong'); // أحمر للإجابة الخطأ
        allButtons[correctIndex].classList.add('correct');
        feedbackElem.innerHTML = `<span style='color: #ef4444;'>إجابة خاطئة! ❌<br><small>${explanationText}</small></span>`;
        speakText("Wrong answer!");
    }

    setTimeout(() => {
        currentQuestionIndex++;
        loadGameQuestion();
    }, 3500);
}

// ------------------------------------------
// 7. المترجم الصوتي الفوري
// ------------------------------------------
function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("متصفحك لا يدعم التعرف على الصوت. جرب متصفح Google Chrome.");
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
            if (enOutput) enOutput.innerText = "English: (تأكد من الاتصال بالإنترنت)";
        }
    };
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
    }
}

// زر تثبيت التطبيق في أعلى اليسار
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
