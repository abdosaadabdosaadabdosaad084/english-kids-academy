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

// ==================== رسم ودعم سبورة الحروف التفاعلية (باهت + نقر للتالي) ====================
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
    
    // خلفية سوداء للسبورة
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // رسم الحرف بشكل باهت جداً (شفاف) ليتمكن الطفل من التتبع فوقه
    ctx.font = 'bold 130px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255, 215, 0, 0.25);'; // لون ذهبي باهت للتتبع
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, canvas.width / 2, canvas.height / 2);

    let isDrawing = false;
    let hasDrawn = false; // تتبع ما إذا كان الطفل قد رسم شيئاً

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
        ctx.strokeStyle = '#00f2fe'; // لون القلم المضيء

        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
    }

    // دعم اللمس والفأرة للرسم
    canvas.onmousedown = startDrawing;
    canvas.onmouseup = stopDrawing;
    canvas.onmousemove = draw;
    
    canvas.ontouchstart = startDrawing;
    canvas.ontouchend = stopDrawing;
    canvas.ontouchmove = draw;

    // عند النقر البسيط على السبورة (بدون رسم)، يتم الانتقال للحرف التالي تلقائياً
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
        { speaker: "Applicant", text: "Thank you. I graduated with a degree in Business, and I have three years of experience in marketing.", ar: "شكراً لك. لقد تخرجت بشهادة في إدارة الأعمال، ولدي ثلاث سنوات من الخبرة في التسويق." }
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
            <h2 style="color:var(--accent-yellow); margin-bottom:8px; border-bottom:2px solid var(--accent-purple); padding-bottom:8px;">
                💬 المحادثات والحوارات والقصص اليومية
            </h2>
            <p style="color:var(--text-dim); line-height:1.6; font-size:0.9rem;">
                دليل كامل للمحادثات اليومية وقصص المبتدئين مع إمكانية النطق الصوتي المباشر.
            </p>
        </div>
    `;

    html += `<h3 style="color:var(--accent-green); margin:15px 0 10px 0;">أولاً: محادثات الحياة اليومية</h3>`;
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

    html += `<h3 style="color:var(--accent-green); margin:20px 0 10px 0;">ثانياً: قصص قصيرة للمبتدئين</h3>`;
    ComprehensiveEnglishGuide.storiesPart.forEach(s => {
        html += `
            <div class="interactive-card" style="text-align: right; margin-bottom: 12px;">
                <h4 style="color:var(--accent-yellow); margin-bottom:8px;">${s.title}</h4>
                <div style="background:#191b33; padding:12px; border-radius:8px; cursor:pointer; margin-bottom:8px;" onclick="speak('${s.text}')">
                    <p style="color:#fff; font-size:0.95rem; line-height:1.6;">${s.text} 🔊</p>
                </div>
                <p style="color:var(--accent-green); font-size:0.85rem; line-height:1.5;"><b>الترجمة:</b> ${s.translation}</p>
                <div style="margin-top:6px; background:#121324; padding:6px 10px; border-radius:6px;">
                    <small style="color:var(--accent-yellow);"><b>كلمات مفتاحية:</b> ${s.keywords}</small>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ==================== قواعد اللغة الإنجليزية (15 فصل) ====================
const GRAMMAR_CHAPTERS_DATA = [
  { chapter: 1, title_ar: "الفصل الأول: الأسماء", title_en: "Nouns", content: "الاسم هو كلمة تُطلق على شخص، مكان، شيء، أو فكرة.\n\n- اسم مفرد (Singular Noun): Boy (ولد), Book (كتاب), Child (طفل).\n- اسم جمع (Plural Noun): Boys (أولاد - بزيادة s), Books (كتب - بزيادة s), Children (أطفال - جمع شاذ).\n\nأمثلة في جمل:\n- The boy reads a book in the room. (الولد يقرأ كتاباً في الغرفة).\n- The children play outside. (الأطفال يلعبون في الخارج)." },
  { chapter: 2, title_ar: "الفصل الثاني: الأدوات", title_en: "Articles", content: "تُوضع الأدوات قبل الأسماء لتحديد ما إذا كان الاسم نكرة أو معرفة.\n\n1. أدوات النكرة (a / an):\n- (a): قبل الاسم المفرد البادئ بحرف ساكن. مثال: A book, A car.\n- (an): قبل الاسم المفرد البادئ بحرف متحرك (a, e, i, o, u). مثال: An apple, An umbrella.\n\n2. أداة المعرفة (the):\n- تُستخدم قبل الأسماء المفردة أو الجمع المعروفة أو المحددة مسبقاً. مثال: The sun, The book that you gave me." },
  { chapter: 3, title_ar: "الفصل الثالث: الضمائر", title_en: "Pronouns", content: "الضمير يعوض الاسم لتجنب تكراره.\n\n1. ضمائر الفاعل (Subject Pronouns):\n- I (أنا), He (هو), She (هي), It (هو/هي لغير العاقل), We (نحن), You (أنت/أنتم), They (هم).\n- مثال: He plays football.\n\n2. ضمائر المفعول به (Object Pronouns):\n- me, him, her, it, us, you, them.\n- مثال: John gave me a book.\n\n3. ضمائر التملك (Possessive Pronouns):\n- mine, his, hers, ours, yours, theirs.\n- مثال: This car is mine." },
  { chapter: 4, title_ar: "الفصل الرابع: الأفعال", title_en: "Verbs", content: "الفعل يدل على حدث أو حالة في زمن معين.\n\n1. الأفعال الرئيسية (Main Verbs):\n- تحمل المعنى الأساسي. مثال: Play, Eat, Go, Read.\n- مثال: I eat an apple.\n\n2. الأفعال المساعدة (Auxiliary Verbs):\n- تساعد في تحديد الزمن أو النفي أو الاستفهام (be, do, have).\n- مثال: She is reading a book." },
  { chapter: 5, title_ar: "الفصل الخامس: الإستفهام", title_en: "Questions", content: "تنقسم الأسئلة إلى نوعين:\n\n1. الأسئلة المبدوءة بأداة استفهام (Wh- Questions):\n- What (ماذا), Who (من), Where (أين), When (متى), Why (لماذا), How (كيف).\n- التركيب: أداة الاستفهام + الفعل المساعد + الفاعل + الفعل الرئيسي؟\n- مثال: Where do you live?\n\n2. أسئلة نعم أو لا (Yes/No Questions):\n- تبدأ بفعل مساعد أو فعل كون.\n- مثال: Are you a student? -> Yes, I am." },
  { chapter: 6, title_ar: "الفصل السادس: المبني للمعلوم والمبني للمجهول", title_en: "Active and Passive Voice", content: "1. المبني للمعلوم (Active Voice):\n- الفاعل معروف ومذكور في بداية الجملة.\n- مثال: The cat ate the fish. (القط أكل السمكة).\n\n2. المبني للمجهول (Passive Voice):\n- التركيز على المفعول به والفاعل غير معروف أو غير مهم.\n- التركيب: المفعول به + Verb to be + التصريف الثالث للفعل.\n- مثال: The fish was eaten. (أُكلت السمكة)." },
  { chapter: 7, title_ar: "الفصل السابع: صيغة الأمر", title_en: "Imperatives", content: "تُستخدم لإعطاء توجيهات أو أوامر وتبدأ دائماً بفعل مجرد.\n\n1. الأمر المثبت (Affirmative Imperative):\n- Open the door. (افتح الباب).\n- Listen carefully. (استمع جيداً).\n\n2. الأمر المنفي (Negative Imperative):\n- يبدأ بـ Don't قبل الفعل المجرد.\n- Don't touch this. (لا تلمس هذا).\n- Don't be late. (لا تتأخر)." },
  { chapter: 8, title_ar: "الفصل الثامن: الصفات", title_en: "Adjectives", content: "الصفة تصف الاسم وتأتي قبله عادةً أو بعد أفعال الكون.\n\n- موقع الصفة: It is a fast car / The car is fast.\n\nالمقارنة والتفضيل:\n- المقارنة (Comparative): إضافية er + than للصفات القصيرة. مثال: Ali is taller than Ahmed.\n- التفضيل (Superlative): إضافة the + est للصفات القصيرة. مثال: Ali is the tallest student." },
  { chapter: 9, title_ar: "الفصل التاسع: الأحوال", title_en: "Adverbs", content: "الحال (الظرف) يصف الفعل ويجيب عن سؤال 'كيف حدث الفعل؟'.\n\nتكوين الحال:\n- يُضاف غالباً (ly) لنهاية الصفة.\n- Quick (سريع) -> Quickly (بسرعة).\n- Quiet (هادئ) -> Quietly (بهدوء).\n\nأمثلة:\n- He runs quickly. (هو يجري بسرعة).\n- She speaks English fluently. (هي تتحدث الإنجليزية بطلاقة)." },
  { chapter: 10, title_ar: "الفصل العاشر: الروابط", title_en: "Conjunctions", content: "الروابط تُستخدم لربط الكلمات أو الجمل.\n\nأهم الروابط:\n- And (و): للربط بين أفكار متشابهة. (I like apples and bananas).\n- But (لكن): للتناقض. (He is tired, but he is working).\n- Because (لأن): لبيان السبب. (I stayed home because it was raining).\n- Or (أو): للتخيير. (Do you want tea or coffee?)." },
  { chapter: 11, title_ar: "الفصل الحادي عشر: استعمال بعض أشباه الجمل مع أمثلة", title_en: "Phrasal Verbs", content: "أشباه الجمل الفعلية هي (فعل + حرف جر أو ظرف) تُعطي معنى جديداً.\n\nأمثلة:\n1. Look after (يعتني بـ): Please look after my cat.\n2. Give up (يستسلم / يقلع عن): Never give up on your dreams.\n3. Turn off (يُطفئ جهازاً): Please turn off the light." },
  { chapter: 12, title_ar: "الفصل الثاني عشر: لو الشرطية", title_en: "Conditional Sentences (If)", content: "تُستخدم للتعبير عن حدث يعتمد وقوعه على حدث آخر.\n\n1. الحالة الأولى (First Conditional):\n- التركيب: If + مضارع بسيط, will + مصدر الفعل.\n- مثال: If it rains, I will stay at home.\n\n2. الحالة الثانية (Second Conditional):\n- التركيب: If + ماضي بسيط, would + مصدر الفعل.\n- مثال: If I won the lottery, I would buy a car." },
  { chapter: 13, title_ar: "الفصل الثالث عشر: الكلام المباشر وغير المباشر", title_en: "Direct and Indirect Speech", content: "1. الكلام المباشر (Direct Speech):\n- نقل الكلام بنصه الأصلي بين أقواس.\n- مثال: He said, \"I am happy\".\n\n2. الكلام غير المباشر (Indirect Speech):\n- نقل مضمون الكلام وتغيير الأزمنة للماضي والضمائر.\n- مثال: He said that he was happy." },
  { chapter: 14, title_ar: "الفصل الرابع عشر: حروف الجر", title_en: "Prepositions", content: "تُحدد العلاقة المكانية والزمانية بين الكلمات.\n\nأهم حروف الجر:\n- In: للأماكن المغلقة/الكبيرة والشهور والسنوات. (In Cairo, In July).\n- On: للأسطح وأيام الأسبوع والتواريخ المحددة. (On the table, On Monday).\n- At: للنقاط المحددة والأوقات والدقائق. (At 5:00 PM, At the door)." },
  { chapter: 15, title_ar: "الفصل الخامس عشر: التعبيرات العاطفية والتعجب - الإختزال - الأفعال الشاذة", title_en: "Exclamations, Contractions & Irregular Verbs", content: "1. التعجب (Exclamations):\n- What a beautiful day! / How fast he runs!\n\n2. الاختزال (Contractions):\n- I am -> I'm | Do not -> Don't | It is -> It's\n\n3. الأفعال الشاذة (Irregular Verbs):\n- Go -> Went -> Gone\n- Eat -> Ate -> Eaten\n- See -> Saw -> Seen" }
];

function renderGrammar() {
    const container = document.getElementById('grammar-container');
    let chaptersHTML = `
        <div class="interactive-card">
            <h2 style="color:var(--accent-yellow); margin-bottom:12px; border-bottom:2px solid var(--accent-purple); padding-bottom:8px;">📘 الموسوعة الشاملة لقواعد اللغة الإنجليزية (15 فصل)</h2>
            <p style="color:var(--text-dim); line-height:1.8; font-size:0.95rem;">دليل وأكاديمية متكاملة تشمل شرحاً وافياً ومستفيضاً لكافة الأركان والقواعد الأساسية من A إلى Z.</p>
        </div>
    `;

    GRAMMAR_CHAPTERS_DATA.forEach(chap => {
        chaptersHTML += `
            <div class="interactive-card" style="text-align: right;">
                <h3 style="color:var(--accent-green); border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 12px;">
                    ${chap.title_ar} 
                    <span style="font-size: 0.8em; color: var(--accent-yellow); font-weight: normal;">(${chap.title_en})</span>
                </h3>
                <div style="color: var(--text-dim); line-height: 1.8; font-size: 0.95rem; white-space: pre-line;">${chap.content}</div>
                <button class="stage-btn" style="margin-top:12px; background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));" onclick="speak('${chap.title_en}')">🔊 نطق عنوان الفصل</button>
            </div>
        `;
    });

    container.innerHTML = chaptersHTML;
}

// ==================== القاموس الشامل ====================
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
