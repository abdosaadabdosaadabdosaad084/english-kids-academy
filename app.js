// Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log(err));
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

// التنقل بين الصفحات
let currentSelectedLetter = 'A';

function showSection(id) {
    document.querySelectorAll('.section-view').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) {
        target.classList.add('active');
    }
    
    if (id === 'sec-alphabet') {
        initBoardWithLetter(currentSelectedLetter);
    } else if (id === 'sec-grammar') {
        renderGrammar();
    } else if (id === 'sec-dictionary') {
        renderDictionaryHTML();
    } else if (id === 'sec-categories') {
        renderCategories();
    } else if (id === 'sec-stories') {
        renderStories();
    }
}

// PWA Install Logic
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.getElementById('install-banner');
    if (banner) banner.style.display = 'flex';
});

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => {
            const banner = document.getElementById('install-banner');
            if (banner) banner.style.display = 'none';
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

// ==================== رسم ودعم سبورة الحروف التفاعلية ====================
function initBoardWithLetter(letter) {
    currentSelectedLetter = letter;
    speak(letter);
    
    const letterTitle = document.getElementById('board-letter-title');
    if (letterTitle) {
        letterTitle.innerText = `سبورة الرسم والتتبع (الحرف: ${letter})`;
    }

    const canvas = document.getElementById('drawing-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    canvas.width = 300;
    canvas.height = 220;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = 'bold 130px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 215, 0, 0.25)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, canvas.width / 2, canvas.height / 2);

    let isDrawing = false;

    function startDrawing(e) {
        isDrawing = true;
        draw(e);
        if (e.cancelable) e.preventDefault();
    }
    
    function stopDrawing() {
        isDrawing = false;
        ctx.beginPath();
    }
    
    function draw(e) {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#00f2fe';

        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
    }

    canvas.onmousedown = startDrawing;
    canvas.onmouseup = stopDrawing;
    canvas.onmousemove = draw;
    
    canvas.ontouchstart = startDrawing;
    canvas.ontouchend = stopDrawing;
    canvas.ontouchmove = draw;
}

function clearBoard() {
    initBoardWithLetter(currentSelectedLetter);
}

function nextLetter() {
    const code = currentSelectedLetter.charCodeAt(0);
    const nextChar = code >= 90 ? 'A' : String.fromCharCode(code + 1);
    initBoardWithLetter(nextChar);
}

// ==================== المجموعات والمجالات ====================
const DailyLifeEnglishData = {
  "categories": [
    {
      "name_ar": "🔢 الأعداد والأرقام",
      "name_en": "Numbers",
      "items": [
        { "en": "Zero", "ar": "صفر" }, { "en": "One", "ar": "واحد" },
        { "en": "Two", "ar": "اثنان" }, { "en": "Three", "ar": "ثلاثة" },
        { "en": "Four", "ar": "أربعة" }, { "en": "Five", "ar": "خمسة" }
      ]
    },
    {
      "name_ar": "🎨 الألوان ودرجاتها",
      "name_en": "Colors",
      "items": [
        { "en": "Red", "ar": "أحمر" }, { "en": "Blue", "ar": "أزرق" },
        { "en": "Green", "ar": "أخضر" }, { "en": "Yellow", "ar": "أصفر" }
      ]
    },
    {
      "name_ar": "🦁 الحيوانات والطيور",
      "name_en": "Animals & Birds",
      "items": [
        { "en": "Cat", "ar": "قطة" }, { "en": "Dog", "ar": "كلب" },
        { "en": "Lion", "ar": "أسد" }, { "en": "Eagle", "ar": "نسر" }
      ]
    }
  ]
};

function renderCategories() {
    const container = document.getElementById('categories-container');
    if (!container) return;
    let html = `
        <div class="interactive-card">
            <h2 style="color:var(--accent-yellow); margin-bottom:8px; border-bottom:2px solid var(--accent-purple); padding-bottom:8px;">
                🔢 المجموعات والمجالات الشاملة
            </h2>
            <p style="color:var(--text-dim); line-height:1.6; font-size:0.9rem;">
                قوائم مرتبة ومقسمة لكافة مجالات ومفردات الحياة اليومية مع خاصية النطق الصوتي.
            </p>
        </div>
    `;

    DailyLifeEnglishData.categories.forEach(cat => {
        html += `
            <div class="interactive-card" style="text-align: right;">
                <h3 style="color:var(--accent-green); border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:6px; margin-bottom:10px;">
                    ${cat.name_ar} <span style="font-size:0.8em; color:var(--accent-yellow);">(${cat.name_en})</span>
                </h3>
                <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(140px, 1fr)); gap:10px;">
                    ${cat.items.map(item => `
                        <div style="background:#191b33; padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.05); cursor:pointer;" onclick="speak('${item.en}')">
                            <div style="color:var(--accent-yellow); font-weight:bold; font-size:0.95rem;">🔊 ${item.en}</div>
                            <div style="color:var(--text-dim); font-size:0.85rem; margin-top:2px;">${item.ar}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ==================== المحادثات والقصص ====================
const ComprehensiveEnglishGuide = {
  conversationsPart: [
    {
      title: "💬 1. محادثة التعارف (Introductions)",
      dialogue: [
        { speaker: "A", text: "Hello! My name is Sarah. What’s your name?", ar: "أهلاً! اسمي سارة. ما اسمك؟" },
        { speaker: "B", text: "Hi Sarah, I’m Ahmed. Nice to meet you!", ar: "أهلاً يا سارة، أنا أحمد. سعيد بمعرفتك!" }
      ]
    }
  ],
  storiesPart: [
    {
      title: "📖 1. المفتاح المفقود (The Lost Key)",
      text: "Sarah was ready to go to work. She took her bag and walked to the door. Suddenly, she stopped. Where are my car keys?",
      translation: "كانت سارة جاهزة للذهاب إلى العمل. أخذت حقيبتها وطلبت نحو الباب.",
      keywords: "Suddenly: فجأة"
    }
  ]
};

function renderStories() {
    const container = document.getElementById('stories-container');
    if (!container) return;
    let html = `
        <div class="interactive-card">
            <h2 style="color:var(--accent-yellow); margin-bottom:8px; border-bottom:2px solid var(--accent-purple); padding-bottom:8px;">
                💬 المحادثات والحوارات والقصص اليومية
            </h2>
        </div>
    `;

    ComprehensiveEnglishGuide.conversationsPart.forEach(c => {
        html += `
            <div class="interactive-card" style="text-align: right; margin-bottom: 12px;">
                <h4 style="color:var(--accent-yellow); margin-bottom:10px;">${c.title}</h4>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    ${c.dialogue.map(d => `
                        <div style="background:#191b33; padding:10px; border-radius:8px; cursor:pointer;" onclick="speak('${d.text}')">
                            <span style="color:var(--accent-green); font-weight:bold;">${d.speaker}:</span>
                            <div style="color:#fff; margin:2px 0;">" ${d.text} " 🔊</div>
                            <small style="color:var(--text-dim);">(${d.ar})</small>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ==================== القواعد ====================
const GRAMMAR_CHAPTERS_DATA = [
  { chapter: 1, title_ar: "الفصل الأول: الأسماء", title_en: "Nouns", content: "الاسم هو كلمة تُطلق على شخص، مكان، شيء، أو فكرة." },
  { chapter: 2, title_ar: "الفصل الثاني: الأدوات", title_en: "Articles", content: "تُوضع الأدوات قبل الأسماء لتحديد ما إذا كان الاسم نكرة أو معرفة (a / an / the)." }
];

function renderGrammar() {
    const container = document.getElementById('grammar-container');
    if (!container) return;
    let chaptersHTML = `
        <div class="interactive-card">
            <h2 style="color:var(--accent-yellow); margin-bottom:12px; border-bottom:2px solid var(--accent-purple); padding-bottom:8px;">📘 القواعد الشاملة</h2>
        </div>
    `;

    GRAMMAR_CHAPTERS_DATA.forEach(chap => {
        chaptersHTML += `
            <div class="interactive-card" style="text-align: right;">
                <h3 style="color:var(--accent-green); border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 12px;">
                    ${chap.title_ar} (${chap.title_en})
                </h3>
                <div style="color: var(--text-dim); line-height: 1.8; font-size: 0.95rem;">${chap.content}</div>
                <button class="stage-btn" style="margin-top:12px;" onclick="speak('${chap.title_en}')">🔊 نطق العنوان</button>
            </div>
        `;
    });

    container.innerHTML = chaptersHTML;
}

// ==================== القاموس ====================
const COMPREHENSIVE_DICTIONARY = [
    {en: 'Restaurant', ar: 'مطعم', example: 'We had a delicious dinner at the restaurant.', cat: 'مطاعم'},
    {en: 'Coffee', ar: 'قهوة', example: 'I drink hot coffee at the cafe.', cat: 'كافيهات'},
    {en: 'School', ar: 'مدرسة', example: 'I learn English at school.', cat: 'تعليم'}
];

function renderDictionaryHTML(searchTerm = '') {
    const dictContainer = document.getElementById('dict-container');
    if (!dictContainer) return;
    
    dictContainer.innerHTML = `
        <div class="word-list">
            ${COMPREHENSIVE_DICTIONARY.map(w => `
                <div class="word-card" style="flex-direction:column; align-items:flex-start; gap:6px;" onclick="speak('${w.en}')">
                    <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                        <span class="word-en">🔊 ${w.en}</span>
                        <span class="word-ar">${w.ar}</span>
                    </div>
                    <div style="font-size:0.8rem; color:var(--accent-yellow);">💬 مثال: "${w.example}"</div>
                </div>
            `).join('')}
        </div>
    `;
        }
