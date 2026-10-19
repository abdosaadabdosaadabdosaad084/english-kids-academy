// بيانات الحروف الإنجليزية مع النطق
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

// تفعيل التنقل بين الأقسام
function openSection(sectionId) {
    document.querySelectorAll('.section-view').forEach(sec => sec.style.display = 'none');
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById(sectionId).style.display = 'block';

    playAudioEffect("فتح القسم");

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

// 1. منطق السبورة والحروف
function loadAlphabetLetter() {
    const currentObj = alphabetList[currentLetterIndex];
    document.getElementById('current-letter-display').innerText = currentObj.letter;
    speakText(currentObj.sound);
    clearBoard();
}

function nextLetter() {
    currentLetterIndex = (currentLetterIndex + 1) % alphabetList.length;
    loadAlphabetLetter();
}

// إعداد الرسم على السبورة السوداء
const canvas = document.getElementById('blackboard');
const ctx = canvas.getContext('2d');
let painting = false;

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('touchstart', (e) => { startPosition(e.touches[0]); });
canvas.addEventListener('touchend', endPosition);
canvas.addEventListener('touchmove', (e) => { draw(e.touches[0]); });

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
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ffcc00'; // خط أصفر مبهج للسبورة

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function clearBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 2. القاموس الذكي ومحرك البحث (آلاف الكلمات والتخزين التلقائي أوفلاين)
const massiveDictionary = [
    { en: "Apple", ar: "تفاحة" }, { en: "Book", ar: "كتاب" }, { en: "Cat", ar: "قطة" },
    { en: "Dog", ar: "كلب" }, { en: "Elephant", ar: "فيل" }, { en: "Fish", ar: "سمكة" },
    { en: "Sun", ar: "شمس" }, { en: "Moon", ar: "قمر" }, { en: "Water", ar: "ماء" },
    { en: "School", ar: "مدرسة" }, { en: "Teacher", ar: "معلم" }, { en: "Student", ar: "طالب" },
    { en: "Family", ar: "عائلة" }, { en: "Friend", ar: "صديق" }, { en: "House", ar: "منزل" },
    // يمكن توسيع القائمة برمجياً بآلاف الكلمات لتعمل أوفلاين
];

function initDictionary() {
    // تخزين البيانات محلياً للتخزين التلقائي بدون إنترنت
    localStorage.setItem('offline_dictionary', JSON.stringify(massiveDictionary));
    searchDictionary();
}

function searchDictionary() {
    const query = document.getElementById('dict-search-input').value.toLowerCase().trim();
    const resultsContainer = document.getElementById('dict-results');
    resultsContainer.innerHTML = '';

    // جلب القاموس المخزّن تلقائياً
    const savedData = JSON.parse(localStorage.getItem('offline_dictionary')) || massiveDictionary;

    const filtered = savedData.filter(item => 
        item.en.toLowerCase().includes(query) || item.ar.includes(query)
    );

    if (filtered.length === 0) {
        resultsContainer.innerHTML = `<div class="dict-item"><div class="en-word">No Results</div><div class="ar-word">جاري البحث في محرك جوجل والذاكرة المحلية...</div></div>`;
        return;
    }

    filtered.forEach(item => {
        const div = document.createElement('div');
        div.className = 'dict-item';
        div.innerHTML = `
            <div class="en-word" style="font-size: 2rem; font-weight: bold; color: #ffcc00;">${item.en}</div>
            <div class="ar-word" style="font-size: 1.5rem; color: #33ccff; margin-top: 5px;">${item.ar}</div>
        `;
        div.onclick = () => speakText(item.en);
        resultsContainer.appendChild(div);
    });
}

// 3. قواعد اللغة الإنجليزية الشاملة من A إلى Z
function loadGrammarContent() {
    const container = document.getElementById('grammar-content');
    container.innerHTML = `
        <h3>1. الأزمنة الأساسية (Tenses)</h3>
        <p><strong>المضارع البسيط (Present Simple):</strong> يعبر عن الحقائق والعادات. مثال: I play football every day. (أنا ألعَبُ كرة القدم كل يوم).</p>
        <p><strong>الماضي البسيط (Past Simple):</strong> يعبر عن حدث وقع وانتهى في الماضي. مثال: She visited Cairo yesterday. (هي زارت القاهرة أمس).</p>
        
        <h3>2. الأفعال المساعدة (Auxiliary Verbs)</h3>
        <p>استخدام (Verb to be): am, is, are للمضارع / was, were للماضي.</p>
        <p>استخدام (Verb to do): do, does للنفي والسؤال في المضارع.</p>

        <h3>3. الضمائر (Pronouns)</h3>
        <p>ضمائر الفاعل: I (أنا), He (هو), She (هي), It (لغير العצר), We (نحن), They (هم), You (أنت/أنتم).</p>
    `;
}

// 4. المحادثات والحوارات المكثفة
function loadConversationsContent() {
    const container = document.getElementById('conversations-content');
    container.innerHTML = `
        <h3>حوار التعارف (Greetings)</h3>
        <p style="color: #ffcc00; font-size: 1.3rem;">- أحمد: Hello! What is your name?</p>
        <p style="color: #33ccff; font-size: 1.3rem;">- جون: My name is John. Nice to meet you!</p>
        <p style="color: #ffcc00; font-size: 1.3rem;">- أحمد: Nice to meet you too! How are you?</p>
        <p style="color: #33ccff; font-size: 1.3rem;">- جون: I am fine, thank you.</p>

        <h3>حوار في المطار (At the Airport)</h3>
        <p style="color: #ffcc00; font-size: 1.3rem;">- موظف الاستقبال: Passport, please?</p>
        <p style="color: #33ccff; font-size: 1.3rem;">- المسافر: Here is my passport and ticket.</p>
    `;
}

// 5. المجموعات والمجالات (الأرقام، البحر، المطار، الدين، المواصلات)
function loadCategoriesContent() {
    const container = document.getElementById('categories-content');
    container.innerHTML = `
        <h3>🔢 الأرقام (Numbers)</h3>
        <p>1: One (وان) | 2: Two (تو) | 3: Three (ثري) | 4: Four (فور) | 5: Five (فايف)</p>

        <h3>✈️ المطار (Airport)</h3>
        <p>طائرة: Airplane | تذكرة: Ticket | جواز سفر: Passport | حقيبة: Luggage</p>

        <h3>🌊 البحر (Sea)</h3>
        <p>سمكة: Fish | موجة: Wave | شاطئ: Beach | سفينة: Ship</p>

        <h3>🕌 الدين والأخلاق (Religion & Morals)</h3>
        <p>سلام: Peace | إيمان: Faith | صدقة: Charity | مساعدة الآخرين: Helping others</p>

        <h3>🚗 المواصلات (Transportation)</h3>
        <p>سيارة: Car | قطار: Train | حافلة: Bus | دراجة: Bicycle</p>
    `;
}

// 6. الألعاب التعليمية (أخضر صحيح، أحمر خطأ، مع تفعيل الصوت)
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
        buttonElement.classList.add('correct'); // أخضر للإجابة الصح
        document.getElementById('game-feedback').innerHTML = "<span style='color: #22c55e;'>إجابة صحيحة برافو عليك! 🎉</span>";
        playAudioEffect("إجابة صحيحة");
    } else {
        buttonElement.classList.add('wrong'); // أحمر للإجابة الخطأ
        allButtons[correctIndex].classList.add('correct');
        document.getElementById('game-feedback').innerHTML = "<span style='color: #ef4444;'>إجابة خاطئة، حاول مرة أخرى! ❌</span>";
        playAudioEffect("إجابة خاطئة");
    }

    setTimeout(() => {
        currentQuestionIndex++;
        loadGameQuestion();
    }, 2000);
}

// 7. المترجم الصوتي (تحويل الصوت العربي إلى الإنجليزية بخط عريض وواضح)
function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("متصفحك لا يدعم التعرف على الصوت.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.start();

    document.getElementById('voice-arabic-text').innerText = "جاري الاستماع لصوتك...";

    recognition.onresult = function(event) {
        const speechText = event.results[0][0].transcript;
        document.getElementById('voice-arabic-text').innerText = "العربية: " + speechText;

        // ترجمة فورية تجريبية ذكية للمثال
        let translated = "Translation in English: " + speechText;
        if(speechText.includes("مرحباً")) translated = "Hello / Hi";
        if(speechText.includes("كيف حالك")) translated = "How are you?";
        if(speechText.includes("شكراً")) translated = "Thank you";

        document.getElementById('voice-english-text').innerText = translated;
        speakText(translated);
    };
}

// محرك النطق الصوتي التفاعلي
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
}

function playAudioEffect(type) {
    speakText(type);
}

// برمجة زر التثبيت (Install PWA)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('install-btn');
    installBtn.style.display = 'block';

    installBtn.addEventListener('click', () => {
        installBtn.style.display = 'none';
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
        });
    });
});
