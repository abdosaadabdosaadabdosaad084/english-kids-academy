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

let currentSelectedLetter = 'A';

function showSection(id) {
    document.querySelectorAll('.section-view').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    if (id === 'sec-board' || id === 'sec-alphabet') {
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

    if (id !== 'sec-dashboard') {
        history.pushState({ section: id }, '', `#${id}`);
    }
}

window.addEventListener('popstate', () => {
    document.querySelectorAll('.section-view').forEach(s => s.classList.remove('active'));
    document.getElementById('sec-dashboard').classList.add('active');
});

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
    let hasDrawn = false;

    function startDrawing(e) {
        isDrawing = true;
        hasDrawn = true;
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

    canvas.onclick = function() {
        if (!hasDrawn) {
            nextLetter();
        }
        hasDrawn = false;
    };
}

function clearBoard() {
    initBoardWithLetter(currentSelectedLetter);
}

function nextLetter() {
    const code = currentSelectedLetter.charCodeAt(0);
    const nextChar = code >= 90 ? 'A' : String.fromCharCode(code + 1);
    initBoardWithLetter(nextChar);
}

// ==================== بيانات قسم المجموعات والمجالات ====================
const DailyLifeEnglishData = {
  "categories": [
    {
      "name_ar": "🔢 الأعداد والأرقام",
      "name_en": "Numbers",
      "items": [
        { "en": "Zero", "ar": "صفر" }, { "en": "One", "ar": "واحد" },
        { "en": "Two", "ar": "اثنان" }, { "en": "Three", "ar": "ثلاثة" },
        { "en": "Four", "ar": "أربعة" }, { "en": "Five", "ar": "خمسة" },
        { "en": "First", "ar": "الأول (ترتيبي)" }, { "en": "Second", "ar": "الثاني (ترتيبي)" },
        { "en": "Third", "ar": "الثالث (ترتيبي)" }, { "en": "Half", "ar": "نصف" }
      ]
    },
    {
      "name_ar": "🎨 الألوان ودرجاتها",
      "name_en": "Colors",
      "items": [
        { "en": "Red", "ar": "أحمر" }, { "en": "Blue", "ar": "أزرق" },
        { "en": "Green", "ar": "أخضر" }, { "en": "Yellow", "ar": "أصفر" },
        { "en": "Orange", "ar": "برتقالي" }, { "en": "Purple", "ar": "بنفسجي" },
        { "en": "White", "ar": "أبيض" }, { "en": "Black", "ar": "أسود" },
        { "en": "Navy blue", "ar": "أزرق كحلي" }, { "en": "Bright yellow", "ar": "أصفر زاهي" }
      ]
    },
    {
      "name_ar": "🦁 الحيوانات والطيور",
      "name_en": "Animals & Birds",
      "items": [
        { "en": "Cat", "ar": "قطة" }, { "en": "Dog", "ar": "كلب" },
        { "en": "Lion", "ar": "أسد" }, { "en": "Eagle", "ar": "نسر" },
        { "en": "Parrot", "ar": "ببغاء" }, { "en": "Shark", "ar": "قرش" },
        { "en": "Bear", "ar": "دب" }, { "en": "Fur", "ar": "فرو" },
        { "en": "Wings", "ar": "أجنحة" }, { "en": "Beak", "ar": "منقار" }
      ]
    },
    {
      "name_ar": "⏰ الروتين اليومي والمنزل",
      "name_en": "Daily Routine & Home",
      "items": [
        { "en": "Wake up", "ar": "يستيقظ" }, { "en": "Take a shower", "ar": "يأخذ حماماً" },
        { "en": "Get dressed", "ar": "يرتدي ملابسه" }, { "en": "Alarm clock", "ar": "منبه" },
        { "en": "Mirror", "ar": "مرآة" }, { "en": "Bed", "ar": "سرير" },
        { "en": "Blanket", "ar": "بطانية" }, { "en": "Living room", "ar": "غرفة المعيشة" },
        { "en": "Do the laundry", "ar": "غسيل الملابس" }, { "en": "Vacuum the floor", "ar": "تنظيف الأرضية بالمكنسة" }
      ]
    },
    {
      "name_ar": "🍳 المطبخ والطبخ",
      "name_en": "Kitchen & Cooking",
      "items": [
        { "en": "Refrigerator", "ar": "ثلاجة" }, { "en": "Oven", "ar": "فرن" },
        { "en": "Knife", "ar": "سكين" }, { "en": "Spoon", "ar": "ملعقة" },
        { "en": "Fork", "ar": "شوكة" }, { "en": "Pan", "ar": "مقلاة" },
        { "en": "Chop", "ar": "يقطع (خضار)" }, { "en": "Boil", "ar": "يغلي" },
        { "en": "Breakfast", "ar": "الفطور" }, { "en": "Dinner", "ar": "العشاء" }
      ]
    },
    {
      "name_ar": "💼 العمل والمواصلات",
      "name_en": "Work & Transport",
      "items": [
        { "en": "Office", "ar": "مكتب" }, { "en": "Meeting", "ar": "اجتماع" },
        { "en": "Colleague", "ar": "زميل عمل" }, { "en": "Deadline", "ar": "الموعد النهائي" },
        { "en": "Traffic jam", "ar": "ازدحام مروري" }, { "en": "Bus stop", "ar": "موقف الباص" },
        { "en": "Ticket", "ar": "تذكرة" }, { "en": "Subway", "ar": "مترو الأنفاق" },
        { "en": "Break", "ar": "استراحة" }, { "en": "Salary", "ar": "راتب" }
      ]
    },
    {
      "name_ar": "🛒 التسوق والمالية",
      "name_en": "Shopping & Finance",
      "items": [
        { "en": "Supermarket", "ar": "سوبرماركت" }, { "en": "Cashier", "ar": "موظف الصندوق" },
        { "en": "Receipt", "ar": "فاتورة / إيصال" }, { "en": "Discount", "ar": "خصم" },
        { "en": "Bank account", "ar": "حساب بنكي" }, { "en": "ATM", "ar": "صراف آلي" },
        { "en": "Withdraw", "ar": "يسحب (مالاً)" }, { "en": "Deposit", "ar": "يودع (مالاً)" },
        { "en": "Price", "ar": "السعر" }, { "en": "Change", "ar": "الباقي / الفكة" }
      ]
    },
    {
      "name_ar": "🏥 الصحة والطوارئ",
      "name_en": "Health & Emergencies",
      "items": [
        { "en": "Appointment", "ar": "موعد" }, { "en": "Headache", "ar": "صداع" },
        { "en": "Prescription", "ar": "وصفة طبية" }, { "en": "Painkiller", "ar": "مسكن آلام" },
        { "en": "Pharmacy", "ar": "صيدلية" }, { "en": "Hospital", "ar": "مستشفى" },
        { "en": "Ambulance", "ar": "إسعاف" }, { "en": "I am lost", "ar": "أنا تائه" },
        { "en": "Lost my keys", "ar": "فقدت مفاتيحي" }, { "en": "Broke down", "ar": "تعطلت (للسيارة)" }
      ]
    }
  ]
};

function renderCategories() {
    const container = document.getElementById('categories-container');
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

// ==================== الدليل المتكامل للمحادثات والقصص ====================
const ComprehensiveEnglishGuide = {
  conversationsPart: [
    {
      title: "💬 1. محادثة التعارف (Introductions)",
      dialogue: [
        { speaker: "A", text: "Hello! My name is Sarah. What’s your name?", ar: "أهلاً! اسمي سارة. ما اسمك؟" },
        { speaker: "B", text: "Hi Sarah, I’m Ahmed. Nice to meet you!", ar: "أهلاً يا سارة، أنا أحمد. سعيد بمعرفتك!" },
        { speaker: "A", text: "Nice to meet you too, Ahmed. Where are you from?", ar: "سعيدة بمعرفتك أيضاً يا أحمد. من أين أنت؟" },
        { speaker: "B", text: "I’m from Egypt, and you?", ar: "أنا من مصر، وأنتِ؟" },
        { speaker: "A", text: "I’m from Jordan. Do you live around here?", ar: "أنا من الأردن. هل تعيش بالقرب من هنا؟" },
        { speaker: "B", text: "Yes, I live just two blocks away.", ar: "نعم، أعيش على بعد شارعين فقط من هنا." }
      ]
    },
    {
      title: "☕ 2. محادثة في المقهى (At a Coffee Shop)",
      dialogue: [
        { speaker: "Barista", text: "Good morning! What can I get for you today?", ar: "صباح الخير! ماذا يمكنني أن أقدم لك اليوم؟" },
        { speaker: "Customer", text: "Good morning. Can I have a large cappuccino, please?", ar: "صباح الخير. هل يمكنني الحصول على كوب كابتشينو كبير، من فضلك؟" },
        { speaker: "Barista", text: "Sure thing. Would you like anything to eat with that?", ar: "بالطبع. هل تحب تناول أي شيء معه؟" },
        { speaker: "Customer", text: "Yes, do you have any fresh croissants?", ar: "نعم، هل لديكم كرواسون طازج؟" }
      ]
    },
    {
      title: "🗺️ 3. محادثة لسؤال عن اتجاه (Asking for Directions)",
      dialogue: [
        { speaker: "Tourist", text: "Excuse me, could you tell me how to get to the central train station?", ar: "عذراً، هل يمكنك إخباري كيف أصل إلى محطة القطار المركزية؟" },
        { speaker: "Local", text: "Of course! Go straight down this street, then turn left at the traffic lights.", ar: "بالطبع! اذهب بشكل مستقيم في هذا الشارع، ثم انعطف يساراً عند إشارات المرور." },
        { speaker: "Tourist", text: "Is it far from here?", ar: "هل هي بعيدة عن هنا؟" }
      ]
    },
    {
      title: "✈️ 4. محادثة في المطار (At the Airport)",
      dialogue: [
        { speaker: "Agent", text: "Good afternoon. May I see your passport and ticket, please?", ar: "مساء الخير. هل يمكنني رؤية جواز سفرك وتذكرة السفر من فضلك؟" },
        { speaker: "Traveler", text: "Good afternoon. Here you go.", ar: "مساء الخير. تفضل." },
        { speaker: "Agent", text: "Are you checking in any bags today?", ar: "هل تسجل أي حقائب للسفر اليوم؟" }
      ]
    },
    {
      title: "🛍️ 5. محادثة في التسوق والشراء (At a Clothing Store)",
      dialogue: [
        { speaker: "Shop Assistant", text: "Hi there! Are you looking for anything in particular today?", ar: "مرحباً! هل تبحث عن شيء محدد اليوم؟" },
        { speaker: "Customer", text: "Yes, please. I like this shirt, but do you have it in medium?", ar: "نعم من فضلك. يعجبني هذا القميص، ولكن هل لديكم منه مقاس متوسط؟" }
      ]
    },
    {
      title: "🍽️ 6. محادثة في المطعم (At a Restaurant)",
      dialogue: [
        { speaker: "Waiter", text: "Hello, welcome to our restaurant. Are you ready to order?", ar: "مرحباً بك في مطعمنا. هل أنت مستعد للطلب؟" },
        { speaker: "Customer", text: "Yes. For the main course, I’d like the grilled chicken with white rice.", ar: "نعم. بالنسبة للوجبة الرئيسية، أود الدجاج المشوي مع الأرز الأبيض." }
      ]
    },
    {
      title: "🏥 7. محادثة عند الطبيب (At the Doctor’s Office)",
      dialogue: [
        { speaker: "Doctor", text: "Good morning. What seems to be the problem today?", ar: "صباح الخير. ما هي المشكلة اليوم؟" },
        { speaker: "Patient", text: "Good morning, doctor. I’ve been feeling very tired lately, and I have a bad sore throat.", ar: "صباح الخير يا دكتور. أشعر بتعب شديد مؤخراً، ولدي ألم شديد في حلقي." }
      ]
    },
    {
      title: "💼 8. مقابلة عمل (Job Interview)",
      dialogue: [
        { speaker: "Interviewer", text: "Welcome to our company. Can you tell me a little bit about yourself?", ar: "مرحباً بك في شركتنا. هل يمكنك إخباري بقليل عن نفسك؟" },
        { speaker: "Applicant", text: "Thank you. I graduated with a degree in Business, and I have three years of experience in marketing.", ar: "شكراً لك. لقد تخرجت بشهادة في إدارة الأعمال، ولدي ثلاث سنوات من الخبرة في التسوق." }
      ]
    }
  ],
  storiesPart: [
    {
      title: "📖 1. المفتاح المفقود (The Lost Key)",
      text: "Sarah was ready to go to work. She took her bag and walked to the door. Suddenly, she stopped. \"Where are my car keys?\" she asked herself. She looked on the kitchen table, but they were not there. She looked under the sofa, but they were not there. She was very worried because she was late. Finally, she looked inside her jacket pocket. The keys were there! She smiled, opened the door, and ran to her car.",
      translation: "كانت سارة جاهزة للذهاب إلى العمل. أخذت حقيبتها وطلبت نحو الباب. فجأة، توقف. 'أين مفاتيح سيارتي؟' سألت نفسها. نظرت على طاولة المطبخ، لكنها لم تكن هناك. نظرت تحت الأريكة، لكنها لم تكن هناك. كانت قلقة جداً لأنها تأخرت. أخيراً، نظرت داخل جيب سترة. كانت المفاتيح هناك! ابتسمت، فتحت الباب، وركضت إلى سيارتها.",
      keywords: "Suddenly: فجأة | Worried: قلقة / متوترة | Finally: أخيرًا"
    },
    {
      title: "🦉 2. البومة العجوز الحكيمة (The Wise Old Owl)",
      text: "There was an old owl that lived in a big oak tree. Every day, he sat on a branch and watched the people in the village below. Yesterday, he saw a young boy helping an old man carry a heavy bag. Today, he heard a woman complaining about her hard day. The owl spoke very little, but he listened very carefully. Day by day, he spoke less and listened more. Because of this, he learned many things and became the wisest bird in the forest.",
      translation: "كانت هناك بومة عجوز تعيش في شجرة بلوط كبيرة. كل يوم، كانت تجلس على فرع وتراقب الناس في القرية بالأسفل. بالأمس، رأى ولداً صغيراً يساعد رجلاً عجوزاً في حمل حقيبة ثقيلة. اليوم، سمع امرأة تشتكي من يومها الشاق. كانت البومة تتحدث قليلاً جداً، لكنها استمعت بعناية شديدة. يوماً بيوم، تحدثت أقل واستمعت أكثر. بسبب هذا، تعلمت أشياء كثيرة وأصبحت أطير طيور الغابة حكمةً.",
      keywords: "Watched: راقب / شاهد | Complaining: تشتكي | Wisest: الأكثر حكمة"
    },
    {
      title: "🌧️ 3. مفاجأة يوم ممطر (A Rainy Day Surprise)",
      text: "Tom loved the weekend. He planned to play football in the park with his friends on Saturday. But when he woke up, the sky was dark and it was raining heavily. Tom felt sad because he could not go outside. He decided to stay in bed and read a new book his father bought him. The book was about an exciting space adventure. Tom enjoyed the story so much that he forgot about the rain. It was a wonderful rainy day.",
      translation: "كان توم يحب عطلة نهاية الأسبوع. خطط لعب كرة القدم في الحديقة مع أصدقائه يوم السبت. ولكن عندما استيقظ، كانت السماء مظلمة وكانت تمطر بغزارة. شعر توم بالحزن لأنه لم يستطيع الخروج. قرر البقاء في السرير وقراءة كتاب جديد اشتراه له والده. كان الكتاب عن مغامرة فضية مثيرة. استمتع توم بالقصة لدرجة أنه نسى المطر. لقد كان يوم ممطراً رائعاً.",
      keywords: "Raining heavily: تمطر بغزارة | Decided: قرر | Adventure: مغامرة"
    }
  ]
};

function renderStories() {
    const container = document.getElementById('stories-container');
    let html = `
        <div class="interactive-card">
            <h2 style="color:var(--accent-yellow); margin-bottom:8px; border-bo
