// Web Audio API Synthesis Engine
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playApplauseSound() {
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(350 + Math.random() * 300, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.12);
        }, i * 50);
    }
}

function playWarningSound() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
}

// Service Worker Registration
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
        deferredPrompt.userChoice.then(() => {
            document.getElementById('install-banner').style.display = 'none';
            deferredPrompt = null;
        });
    }
}

// PIN Protection
const DEFAULT_PIN = "1234";
function getSavedPin() {
    return localStorage.getItem('app_pin') || DEFAULT_PIN;
}
function checkPin() {
    const input = document.getElementById('pin-input').value;
    if (input === getSavedPin()) {
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
        msg.innerText = "❌ يرجى كتابة رقم سري من 4 أرقام على الأقل.";
    }
}

// Speech Engine
function speak(text, lang = 'en-US') {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
    }
}

let currentLetterCode = 65; // A

// خريطة معاني الحروف باللغة العربية مع مثال
const LETTER_MEANINGS = {
    65: { word: "Apple", ar: "تفاحة" }, 66: { word: "Banana", ar: "موز" }, 67: { word: "Cat", ar: "قطة" },
    68: { word: "Dog", ar: "كلب" }, 69: { word: "Elephant", ar: "فيل" }, 70: { word: "Fish", ar: "سمكة" },
    71: { word: "Giraffe", ar: "زرافة" }, 72: { word: "Horse", ar: "حصان" }, 73: { word: "Ice cream", ar: "مثلجات" },
    74: { word: "Juice", ar: "عصير" }, 75: { word: "Kangaroo", ar: "كانغرو" }, 76: { word: "Lion", ar: "أسد" },
    77: { word: "Monkey", ar: "قرد" }, 78: { word: "Notebook", ar: "دفتر" }, 79: { word: "Orange", ar: "برتقال" },
    80: { word: "Pencil", ar: "قلم رصاص" }, 81: { word: "Queen", ar: "ملكة" }, 82: { word: "Rabbit", ar: "أرنب" },
    83: { word: "School", ar: "مدرسة" }, 84: { word: "Teacher", ar: "معلم" }, 85: { word: "Umbrella", ar: "مظلة" },
    86: { word: "Van", ar: "شاحنة" }, 87: { word: "Watermelon", ar: "بطيخ" }, 88: { word: "X-ray", ar: "أشعة" },
    89: { word: "Yellow", ar: "أصفر" }, 90: { word: "Zebra", ar: "حمار وحشي" }
};

function showSection(id) {
    document.querySelectorAll('.section-view').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    if (id === 'sec-grammar') {
        renderGrammar();
    } else if (id === 'sec-dictionary') {
        renderDictionaryHTML();
    } else if (id === 'sec-categories') {
        renderCategories();
    } else if (id === 'sec-stories') {
        renderStories();
    }

    if (id !== 'sec-dashboard') {
        history.pushState({ section: id }, '', `#${id}`);
    }
}

window.addEventListener('popstate', () => {
    document.querySelectorAll('.section-view').forEach(s => s.classList.remove('active'));
    document.getElementById('sec-dashboard').classList.add('active');
});

// ==================== 1. القاموس الموسع الحقيقي ====================
const COMPREHENSIVE_DICTIONARY = [
    {en: 'Restaurant', ar: 'مطعم', example: 'We had a delicious dinner at the restaurant.', cat: 'مطاعم'},
    {en: 'Coffee', ar: 'قهوة', example: 'I drink hot coffee at the cafe.', cat: 'كافيهات'},
    {en: 'Menu', ar: 'قائمة الطعام', example: 'Could you bring me the menu, please?', cat: 'مطاعم'},
    {en: 'Airport', ar: 'المطار', example: 'The plane lands at the airport on time.', cat: 'المطار والسفر'},
    {en: 'Ticket', ar: 'تذكرة', example: 'I booked my flight ticket online.', cat: 'السفر'},
    {en: 'Hospital', ar: 'مستشفى', example: 'The doctor works in the hospital.', cat: 'المستشفى'},
    {en: 'Medicine', ar: 'دواء', example: 'Take your medicine after breakfast.', cat: 'المستشفى'},
    {en: 'Bus', ar: 'حافلة / أوتوبيس', example: 'I take the bus to go to school.', cat: 'المواصلات'},
    {en: 'Train', ar: 'قطار', example: 'The train travels fast across cities.', cat: 'المواصلات'},
    {en: 'Sea', ar: 'البحر', example: 'The sea water is blue and clean in Alexandria.', cat: 'البحر والتنزه'},
    {en: 'Beach', ar: 'شاطئ', example: 'Children play with sand on the beach.', cat: 'البحر والتنزه'},
    {en: 'City', ar: 'مدينة', example: 'Alexandria is a beautiful coastal city.', cat: 'المدن والقرى'},
    {en: 'Village', ar: 'قرية', example: 'Life in the village is quiet and peaceful.', cat: 'المدن والقرى'},
    {en: 'Pray', ar: 'يصلي', example: 'Muslims pray five times a day in the mosque.', cat: 'الدين والعبادات'},
    {en: 'Mosque', ar: 'مسجد', example: 'The mosque is near our house.', cat: 'الدين والعبادات'},
    {en: 'School', ar: 'مدرسة', example: 'Ghazaal learns English at school.', cat: 'المدرسة والتعليم'}
];

async function searchGoogleStyleDictionary(term) {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;

    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanTerm)}&langpair=ar|en`);
        const data = await res.json();
        const englishTranslation = data.responseData.translatedText;

        renderDictionaryHTML(cleanTerm, englishTranslation);
    } catch (err) {
        renderDictionaryHTML(cleanTerm, cleanTerm);
    }
}

function renderDictionaryHTML(searchTerm = '', liveTranslation = '') {
    const dictContainer = document.getElementById('dict-container');
    const cleanFilter = searchTerm.trim().toLowerCase();
    
    let filtered = COMPREHENSIVE_DICTIONARY.filter(w => 
        w.en.toLowerCase().includes(cleanFilter) || w.ar.includes(cleanFilter)
    );

    let searchEngineHTML = '';
    if (cleanFilter.length > 0) {
        searchEngineHTML = `
            <div class="interactive-card" style="border:2px solid var(--accent-green); text-align:right;">
                <h3 style="color:var(--accent-yellow);">🌐 نتيجة البحث لمُحرك المورد:</h3>
                <p style="color:#fff; font-size:1.1rem; margin:8px 0;"><b>الكلمة:</b> "${searchTerm}"</p>
                <p style="color:var(--accent-green); font-size:1.3rem; font-weight:bold;"><b>الترجمة:</b> "${liveTranslation}"</p>
                <button class="btn-action" style="margin-top:10px;" onclick="speak('${liveTranslation}')">🔊 نطق النتيجة بالإنجليزية</button>
            </div>
        `;
    }

    dictContainer.innerHTML = `
        <input type="text" id="dict-search-input" value="${searchTerm}" placeholder="🔍 ابحث في القاموس كـ محرك جوجل عن أي كلمة أو مجال..." style="width:100%; padding:10px; border-radius:10px; border:2px solid var(--accent-blue); background:#121324; color:#fff; margin-bottom:12px;" oninput="searchGoogleStyleDictionary(this.value)">
        ${searchEngineHTML}
        <div class="word-list">
            ${filtered.map(w => `
                <div class="word-card" style="flex-direction:column; align-items:flex-start; gap:6px;" onclick="speak('${w.en}. Example: ${w.example}')">
                    <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                        <span class="word-en">🔊 ${w.en}</span>
                        <span class="word-ar">${w.ar} <small style="color:var(--accent-purple);">[${w.cat}]</small></span>
                    </div>
                    <div style="font-size:0.8rem; color:var(--accent-yellow);">💬 مثال: "${w.example}"</div>
                </div>
            `).join('')}
        </div>
    `;
}

// ==================== 2. قسم قواعد اللغة الإنجليزية (جلب الفصول الـ 15 تلقائياً) ====================
async function renderGrammar() {
    const container = document.getElementById('grammar-container');
    container.innerHTML = `
        <div class="interactive-card">
            <h2 style="color:var(--accent-yellow); margin-bottom:12px; border-bottom:2px solid var(--accent-purple); padding-bottom:8px;">📘 الموسوعة الشاملة لقواعد اللغة الإنجليزية</h2>
            <p style="color:var(--text-dim); line-height:1.8; font-size:0.95rem;">
                جاري تحميل الفصول الـ 15 كاملة بشرحها التفصيلي...
            </p>
        </div>
    `;

    try {
        const response = await fetch('english_grammar_chapters.json');
        if (!response.ok) throw new Error('فشل جلب ملف القواعد');
        const chapters = await response.json();

        let chaptersHTML = `
            <div class="interactive-card">
                <h2 style="color:var(--accent-yellow); margin-bottom:12px; border-bottom:2px solid var(--accent-purple); padding-bottom:8px;">📘 الموسوعة الشاملة لقواعد اللغة الإنجليزية (15 فصل)</h2>
                <p style="color:var(--text-dim); line-height:1.8; font-size:0.95rem;">
                    دليل وأكاديمية متكاملة تشمل شرحاً وافياً ومستفيضاً لكافة الأركان والقواعد الأساسية من A إلى Z.
                </p>
            </div>
        `;

        chapters.forEach(chap => {
            chaptersHTML += `
                <div class="interactive-card" style="text-align: right;">
                    <h3 style="color:var(--accent-green); border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 12px;">
                        ${chap.title_ar} 
                        <span style="font-size: 0.8em; color: var(--accent-yellow); font-weight: normal;">(${chap.title_en})</span>
                    </h3>
                    <div style="color: var(--text-dim); line-height: 1.8; font-size: 0.95rem; white-space: pre-line;">
                        ${chap.content}
                    </div>
                    <button class="stage-btn" style="margin-top:12px; background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));" onclick="speak('${chap.title_en}')">
                        🔊 نطق عنوان الفصل
                    </button>
                </div>
            `;
        });

        container.innerHTML = chaptersHTML;
    } catch (error) {
        console.error("Error loading grammar chapters:", error);
        container.innerHTML = `
            <div class="interactive-card">
                <h3 style="color:var(--accent-pink);">⚠️ تعذر تحميل الفصول</h3>
                <p style="color:var(--text-dim);">تأكد من رفع ملف <b>english_grammar_chapters.json</b> بنفس الاسم على GitHub.</p>
            </div>
        `;
    }
}

// ==================== 3. المترجم الصوتي المباشر بخط عريض وألوان مميزة ====================
async function startSpeechRecognition() {
    const resultDiv = document.getElementById('translator-result');
    const btn = document.getElementById('btn-mic');

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        resultDiv.innerHTML = `<p style="color:var(--accent-pink);">⚠️ المتصفح لا يدعم التعرف الصوتي المباشر.</p>`;
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-EG';
    recognition.interimResults = false;

    btn.innerText = "🎙️ جاري الاستماع صوتياً... اتكلم الآن بالعربية";
    btn.style.background = "var(--accent-pink)";

    recognition.start();

    recognition.onresult = async (event) => {
        const arabicSpeech = event.results[0][0].transcript.trim();
        btn.innerText = "🎤 اضغط هنا والتحدث بالعربية";
        btn.style.background = "var(--accent-purple)";

        resultDiv.innerHTML = `<p style="color:var(--accent-yellow); font-size:1.1rem; font-weight:bold;">🔄 جاري الترجمة الفورية...</p>`;

        try {
            const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(arabicSpeech)}&langpair=ar|en`);
            const data = await res.json();
            const translatedText = data.responseData.translatedText;

            resultDiv.innerHTML = `
                <div style="background:#191b33; padding:20px 15px; border-radius:15px; border:2px solid var(--accent-green); text-align:right;">
                    <p style="color:var(--accent-yellow); font-size:1.2rem; font-weight:bold; margin-bottom:10px;">
                        🗣️ المقول بالعربية: "<span style="color:#fff; font-weight:bold;">${arabicSpeech}</span>"
                    </p>
                    <div style="background:#121324; padding:15px; border-radius:12px; border-right:5px solid var(--accent-green); margin:10px 0;">
                        <span style="color:var(--text-dim); font-size:0.9rem; display:block; margin-bottom:4px;">🌐 الترجمة الإنجليزية الفورية:</span>
                        <p style="color:var(--accent-green); font-size:1.8rem; font-weight:900; line-height:1.3; letter-spacing:0.5px;">
                            ${translatedText}
                        </p>
                    </div>
                    <button class="btn-action" style="margin-top:10px; font-size:1.1rem; padding:14px; background:linear-gradient(135deg, var(--accent-green), var(--accent-blue));" onclick="speak('${translatedText}')">
                        🔊 نطق الترجمة فوراً وبصوت واضح
                    </button>
                </div>
            `;
            speak(translatedText);
        } catch (e) {
            resultDiv.innerHTML = `<p style="color:var(--accent-pink); font-weight:bold;">❌ تعذر الاتصال بالترجمة الحرة، تأكد من اتصال الإنترنت.</p>`;
        }
    };

    recognition.onerror = () => {
        btn.innerText = "🎤 اضغط هنا والتحدث بالعربية";
        btn.style.background = "var(--accent-purple)";
        resultDiv.innerHTML = `<p style="color:var(--accent-pink); font-weight:bold;">❌ لم يتم التقاط الصوت بوضوح، أعد المحاولة.</p>`;
    };
}

// ==================== 4. المجموعات والتصنيفات ====================
const CATEGORIES_DATA = [
    { title: "🔢 الأرقام والأعداد (Numbers)", items: [{en: "One (1)", ar: "واحد"}, {en: "Ten (10)", ar: "عشرة"}, {en: "One Hundred (100)", ar: "مائة"}, {en: "One Thousand (1000)", ar: "ألف"}] },
    { title: "✈️ المطار والسفر (Airport & Travel)", items: [{en: "Passport", ar: "جواز سفر"}, {en: "Flight", ar: "رحلة طيران"}, {en: "Luggage", ar: "أمتعة وحقائب"}] },
    { title: "🏥 المستشفى والطب (Hospital)", items: [{en: "Doctor", ar: "طبيب"}, {en: "Nurse", ar: "ممرضة"}, {en: "Pharmacy", ar: "صيدلية"}] },
    { title: "🕌 الدين والعبادات (Religion)", items: [{en: "Mosque", ar: "مسجد"}, {en: "Pray", ar: "صلاة / يصلي"}, {en: "Quran", ar: "القرآن الكريم"}] }
];

function renderCategories() {
    const container = document.getElementById('categories-container');
    container.innerHTML = CATEGORIES_DATA.map(cat => `
        <div class="interactive-card">
            <h3 style="color:var(--accent-green); margin-bottom:10px;">${cat.title}</h3>
            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:8px;">
                ${cat.items.map(item => `
                    <div style="background:#191b33; padding:8px; border-radius:8px; cursor:pointer;" onclick="speak('${item.en}')">
                        <span style="color:var(--accent-yellow); font-weight:bold;">🔊 ${item.en}</span>
                        <span style="color:var(--text-dim); display:block; font-size:0.85rem;">${item.ar}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// ==================== 5. المحادثات الشاملة ====================
const CONVERSATIONS = [
    {
        title: "💬 1. في المطار والسفر (At the Airport)",
        dialogue: [
            { speaker: "Officer", text: "May I see your passport and ticket, please?", ar: "هل يمكنني رؤية جواز سفرك وتذكرتك من فضلك؟" },
            { speaker: "Passenger", text: "Here you are. What time is my flight?", ar: "تفضل هنا. في أي وقت رحلتي؟" },
            { speaker: "Officer", text: "Your flight departs at five o'clock. Have a good flight!", ar: "ستغادر رحلتك في الساعة الخامسة. أتمنى لك رحلة ممتعة!" }
        ]
    }
];

function renderStories() {
    const container = document.getElementById('stories-container');
    container.innerHTML = CONVERSATIONS.map(c => `
        <div class="interactive-card">
            <h3 style="color:var(--accent-yellow); margin-bottom:10px;">${c.title}</h3>
            <div style="display:flex; flex-direction:column; gap:8px;">
                ${c.dialogue.map(d => `
                    <div style="background:#191b33; padding:8px 10px; border-radius:8px; cursor:pointer;" onclick="speak('${d.text}')">
                        <span style="color:var(--accent-green); font-weight:bold;">${d.speaker}:</span>
                        <div style="color:#fff; margin:2px 0;">" ${d.text} " 🔊</div>
                        <small style="color:var(--text-dim);">(${d.ar})</small>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}
