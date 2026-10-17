// Register Service Worker for PWA
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
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                document.getElementById('install-banner').style.display = 'none';
            }
            deferredPrompt = null;
        });
    }
}

// PIN System
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
        msg.innerText = "❌ يرجى كتابة رقم سري مكون من 4 أرقام على الأقل.";
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
let currentPoints = parseInt(localStorage.getItem('user_points') || '0');
document.getElementById('points-display').innerText = `⭐ ${currentPoints} نقطة`;

function addPoints(pts) {
    currentPoints += pts;
    localStorage.setItem('user_points', currentPoints);
    document.getElementById('points-display').innerText = `⭐ ${currentPoints} نقطة`;
}

// Navigation & Back Button Handling
function showSection(id) {
    document.querySelectorAll('.section-view').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (id !== 'sec-dashboard') {
        history.pushState({ section: id }, '', `#${id}`);
    }
}

window.addEventListener('popstate', (e) => {
    document.querySelectorAll('.section-view').forEach(s => s.classList.remove('active'));
    document.getElementById('sec-dashboard').classList.add('active');
});

// ==================== 1. قاموس المورد الموسع مع الأمثلة ====================
const COMPREHENSIVE_DICTIONARY = [
    {en: 'Apple', ar: 'تفاحة', example: 'I eat a fresh red apple every morning.', cat: 'طعام وفواكه'},
    {en: 'Banana', ar: 'موز', example: 'Monkeys love to eat ripe bananas.', cat: 'طعام وفواكه'},
    {en: 'Orange', ar: 'برتقال', example: 'Orange juice is rich in Vitamin C.', cat: 'طعام وفواكه'},
    {en: 'Watermelon', ar: 'بطيخ', example: 'We enjoy sweet watermelon in summer.', cat: 'طعام وفواكه'},
    {en: 'Bread', ar: 'خبز', example: 'My mother bakes warm bread for breakfast.', cat: 'طعام وفواكه'},
    {en: 'Cat', ar: 'قطة', example: 'The little cat is sleeping under the table.', cat: 'حيوانات'},
    {en: 'Dog', ar: 'كلب', example: 'The loyal dog guards our home.', cat: 'حيوانات'},
    {en: 'Elephant', ar: 'فيل', example: 'The elephant is the largest land animal.', cat: 'حيوانات'},
    {en: 'Lion', ar: 'أسد', example: 'The lion is known as the king of the jungle.', cat: 'حيوانات'},
    {en: 'School', ar: 'مدرسة', example: 'Ghazaal goes to school every morning.', cat: 'تعليم'},
    {en: 'Teacher', ar: 'معلم', example: 'Our teacher explains English rules clearly.', cat: 'تعليم'},
    {en: 'Student', ar: 'طالب', example: 'The smart student answers all questions.', cat: 'تعليم'},
    {en: 'Book', ar: 'كتاب', example: 'Reading a book expands your knowledge.', cat: 'تعليم'},
    {en: 'Doctor', ar: 'طبيب', example: 'The doctor examines patients in the hospital.', cat: 'مهن'},
    {en: 'Engineer', ar: 'مهندس', cat: 'مهن', example: 'The engineer designs modern buildings.'},
    {en: 'Computer', ar: 'حاسوب', cat: 'تكنولوجيا', example: 'I use my computer to learn new things.'},
    {en: 'Read', ar: 'يقرأ', cat: 'أفعال', example: 'I read an interesting story every night.'},
    {en: 'Write', ar: 'يكتب', cat: 'أفعال', example: 'She writes her notes neatly.'}
];

function renderDictionary(filterText = '') {
    const dictContainer = document.getElementById('dict-container');
    const cleanFilter = filterText.trim().toLowerCase();
    
    let filtered = COMPREHENSIVE_DICTIONARY.filter(w => 
        w.en.toLowerCase().includes(cleanFilter) || w.ar.includes(cleanFilter)
    );

    let customSearchHTML = '';
    if (cleanFilter.length > 0 && filtered.length === 0) {
        customSearchHTML = `
            <div class="interactive-card" style="border:2px solid var(--accent-green); text-align:center;">
                <h3 style="color:var(--accent-yellow);">🔍 نتيجة البحث الشامل للكلمة: "${filterText}"</h3>
                <p style="margin:10px 0; color:var(--text-dim);">استمع لنطق الكلمة مباشرة للتعلم:</p>
                <button class="btn-action" onclick="speak('${filterText}')">🔊 نطق الكلمة المكتوبة (${filterText})</button>
            </div>
        `;
    }

    dictContainer.innerHTML = `
        <div style="margin-bottom:15px;">
            <input type="text" id="dict-search-input" value="${filterText}" placeholder="🔍 ابحث في قاموس المورد عن أي كلمة بالإنجليزية أو العربية..." style="width:100%; padding:12px; border-radius:10px; border:2px solid var(--accent-blue); background:#121324; color:#fff; font-size:1rem;" oninput="renderDictionary(this.value)">
        </div>
        ${customSearchHTML}
        <div class="word-list">
            ${filtered.map(w => `
                <div class="word-card" style="flex-direction:column; align-items:flex-start; gap:8px;" onclick="speak('${w.en}. Example: ${w.example}')">
                    <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
                        <span class="word-en">🔊 ${w.en}</span>
                        <span class="word-ar">${w.ar}</span>
                    </div>
                    <div style="font-size:0.85rem; color:var(--accent-yellow); font-style:italic;">
                        💬 مثال: "${w.example}"
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ==================== 2. قسم قواعد اللغة الإنجليزية (نظام الخانات المتبوبة التفصيلي) ====================
function renderGrammar() {
    const container = document.getElementById('grammar-container');
    container.innerHTML = `
        <!-- خانة 1: الضمائر وأجزاء الكلام -->
        <div class="interactive-card">
            <h3 style="color:var(--accent-yellow);">📌 الخانة 1: الضمائر وأقسام الكلام (Pronouns)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.7;">
                • <b>ضمائر الفاعل (Subject):</b> I, He, She, It, We, You, They (تُوضع في بداية الجملة).<br>
                • <b>ضمائر المفعول (Object):</b> Me, Him, Her, It, Us, You, Them (تأتي بعد الفعل).<br>
                • <b>صفات الملكية (Possessive):</b> My, His, Her, Its, Our, Your, Their (يتبعها اسم شىء).<br><br>
                <b>أمثلة وافية:</b><br>
                - <i>I study English every day.</i> (أنا أدرس الإنجليزية يومياً)<br>
                - <i>The teacher called him.</i> (المعلم اتصل به)<br>
                - <i>This is my notebook.</i> (هذا دفتري)
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('I study English every day. The teacher called him. This is my notebook.')">🔊 استمع لأمثلة الخانة</button>
        </div>

        <!-- خانة 2: زمن المضارع البسيط -->
        <div class="interactive-card">
            <h3 style="color:var(--accent-yellow);">📌 الخانة 2: زمن المضارع البسيط (Present Simple Tense)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.7;">
                • <b>الاستخدام:</b> للتعبير عن العادات والحقائق اليومية والثابتة.<br>
                • <b>التكوين:</b><br>
                - مع (I / We / They / You): نضع الفعل مجرد (e.g., I play).<br>
                - مع (He / She / It): نُضيف للفعل (s / es) (e.g., He plays, She watches).<br>
                • <b>النفي:</b> باستخدام (don't / doesn't) + المصدر.<br><br>
                <b>أمثلة وافية:</b><br>
                - <i>The sun rises in the east.</i> (الشمس تشرق من الشرق - حقيقة).<br>
                - <i>He drinks milk every morning.</i> (هو يشرب الحليب كل صباح - عادة).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('The sun rises in the east. He drinks milk every morning.')">🔊 استمع لأمثلة الخانة</button>
        </div>

        <!-- خانة 3: زمن الماضي البسيط -->
        <div class="interactive-card">
            <h3 style="color:var(--accent-yellow);">📌 الخانة 3: زمن الماضي البسيط (Past Simple Tense)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.7;">
                • <b>الاستخدام:</b> حدث بدأ وانتهى تماماً في الماضي.<br>
                • <b>التكوين:</b> التصريف الثاني للفعل V2 (إضافة ed للأفعال العادية أو حفظ الشاذ).<br>
                • <b>النفي:</b> باستخدام (didn't) + مصدر الفعل.<br><br>
                <b>أمثلة وافية:</b><br>
                - <i>I visited Alexandria yesterday.</i> (زرت الإسكندرية أمس).<br>
                - <i>She wrote a nice story last week.</i> (كتبت قصة جميلة الأسبوع الماضي).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('I visited Alexandria yesterday. She wrote a nice story last week.')">🔊 استمع لأمثلة الخانة</button>
        </div>

        <!-- خانة 4: زمن المستقبل وأدوات الشرط -->
        <div class="interactive-card">
            <h3 style="color:var(--accent-yellow);">📌 الخانة 4: المستقبل وأدوات الشرط (Future & Conditionals)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.7;">
                • <b>المستقبل (Will):</b> للتنبؤ والقرارات المباشرة (Will + المصدر).<br>
                • <b>قاعدة الشرط (If Conditionals):</b><br>
                - <i>If + مضارع بسيط ➔ Will + المصدر</i><br><br>
                <b>أمثلة وافية:</b><br>
                - <i>We will travel tomorrow.</i> (سنقود السفر غداً).<br>
                - <i>If you study hard, you will pass the exam.</i> (إن تذاكر بجد تنجح في الامتحان).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('We will travel tomorrow. If you study hard, you will pass the exam.')">🔊 استمع لأمثلة الخانة</button>
        </div>

        <!-- خانة 5: الأفعال الناقصة والمبني للمجهول -->
        <div class="interactive-card">
            <h3 style="color:var(--accent-yellow);">📌 الخانة 5: الأفعال الناقصة والمبني للمجهول (Modals & Passive)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.7;">
                • <b>الأفعال الناقصة (Can, Must, Should):</b> يتبعها الفعل مجرد بدون إضافة.<br>
                • <b>المبني للمجهول (Passive):</b> التركيز على المفعول به.<br><br>
                <b>أمثلة وافية:</b><br>
                - <i>You must follow the rules.</i> (يجب أن تتبع القواعد).<br>
                - <i>The car was repaired by the mechanic.</i> (تم تصليح السيارة بواسطة الميكانيكي).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('You must follow the rules. The car was repaired by the mechanic.')">🔊 استمع لأمثلة الخانة</button>
        </div>
    `;
}

// ==================== 3. المحادثات الشاملة (سؤال وجواب A/B) ====================
const CONVERSATIONS = [
    {
        title: "💬 1. محادثة التعارف والترحيب (Greetings & Introductions)",
        desc: "حوار سؤال وجواب للتعريف بالنفس:",
        dialogue: [
            { speaker: "Speaker A", text: "Hello! Good morning. What is your name?", ar: "أهلاً بك! صباح الخير. ما اسمك؟" },
            { speaker: "Speaker B", text: "Good morning! My name is Ghazaal. What about you?", ar: "صباح النور! اسمي غزل. وماذا عنك؟" },
            { speaker: "Speaker A", text: "I am Alex. Nice to meet you!", ar: "أنا ألكس. سررت بلقائك!" }
        ]
    },
    {
        title: "💬 2. محادثة التسوق في المتجر (At the Shopping Store)",
        desc: "حوار سؤال وجواب بداخل السوبرماركت والمتجر:",
        dialogue: [
            { speaker: "Seller", text: "Hello! How can I help you today?", ar: "أهلاً بك! كيف يمكنني مساعدتك اليوم؟" },
            { speaker: "Customer", text: "Hi! I want to buy a fresh apple and milk, please.", ar: "مرحباً! أريد شراء تفاحة طازجة وحليب من فضلك." },
            { speaker: "Seller", text: "Sure! Here you are. That is five pounds.", ar: "بالتأكيد! تفضل هنا. الإجمالي خمسة جنيهات." }
        ]
    }
];

function renderStories() {
    const container = document.getElementById('stories-container');
    container.innerHTML = CONVERSATIONS.map(c => `
        <div class="interactive-card" style="border-right:4px solid var(--accent-purple);">
            <h3 style="color:var(--accent-yellow); margin-bottom:5px;">${c.title}</h3>
            <p style="color:var(--text-dim); font-size:0.85rem; margin-bottom:15px;">${c.desc}</p>

            <div style="display:flex; flex-direction:column; gap:10px;">
                ${c.dialogue.map(d => `
                    <div style="background:#191b33; padding:10px 12px; border-radius:10px; cursor:pointer;" onclick="speak('${d.text}')">
                        <span style="color:var(--accent-green); font-weight:bold; font-size:0.9rem;">${d.speaker}:</span>
                        <div style="color:#fff; font-size:1.05rem; margin:2px 0;">" ${d.text} " 🔊</div>
                        <small style="color:var(--text-dim); font-size:0.8rem;">(${d.ar})</small>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// ==================== 4. قسم الألعاب (تقييم صوتي صافي بدون رسائل نافذة) ====================
let currentQuizWord = null;

function generateInfiniteQuestion() {
    const quizBox = document.getElementById('quiz-box');
    currentQuizWord = COMPREHENSIVE_DICTIONARY[Math.floor(Math.random() * COMPREHENSIVE_DICTIONARY.length)];
    
    let wrongOptions = COMPREHENSIVE_DICTIONARY.filter(w => w.en !== currentQuizWord.en)
                                             .sort(() => 0.5 - Math.random())
                                             .slice(0, 3);
    
    let allOptions = [...wrongOptions, currentQuizWord].sort(() => 0.5 - Math.random());

    quizBox.innerHTML = `
        <h3 style="color:var(--accent-yellow); margin-bottom:10px;">🎮 لعبة النطق والتحدي التفاعلي</h3>
        <p style="color:var(--text-dim); margin-bottom:10px;">استمع للكلمة جيداً واختر معناها الصحيح:</p>
        
        <div style="text-align:center; margin:15px 0;">
            <button class="btn-action" style="background:var(--accent-purple); font-size:1.2rem;" onclick="speak('${currentQuizWord.en}')">🔊 إعادة نطق الكلمة (${currentQuizWord.en})</button>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
            ${allOptions.map(opt => `
                <button class="btn-action" style="background:#2d3154;" onclick="checkInfiniteAnswer('${opt.en}', '${currentQuizWord.en}')">${opt.ar}</button>
            `).join('')}
        </div>
    `;

    setTimeout(() => {
        speak(currentQuizWord.en);
    }, 300);
}

function checkInfiniteAnswer(selectedEn, correctEn) {
    if (selectedEn === correctEn) {
        // نطق صوتي للإجابة الصحيحة بدون ظهور نافذة المفرقعة!
        speak('Bravo! Excellent!');
        addPoints(10);
    } else {
        // نطق صوتي للخطأ بدون ظهور رسالة نافذة على الشاشة!
        speak('Wrong! Try again');
    }
    // الانتقال التلقائي المباشر للسؤال التالي بعد ثوانٍ!
    setTimeout(() => {
        generateInfiniteQuestion();
    }, 800);
}

// ==================== 5. السبورة والتنقل التلقائي ====================
const alphabetContainer = document.getElementById('alphabet-container');
if (alphabetContainer) {
    for (let i = 65; i <= 90; i++) {
        const char = String.fromCharCode(i);
        const div = document.createElement('div');
        div.className = 'letter-card';
        div.innerText = char;
        div.onclick = () => selectLetterCode(i);
        alphabetContainer.appendChild(div);
    }
}

function selectLetterCode(code) {
    currentLetterCode = code;
    const char = String.fromCharCode(currentLetterCode);
    document.getElementById('current-letter-title').innerText = `✏️ سبورة الرسم والتتبع (الحرف: ${char})`;
    speak(char);
    clearCanvas();
}

function nextLetter() {
    currentLetterCode++;
    if (currentLetterCode > 90) currentLetterCode = 65;
    selectLetterCode(currentLetterCode);
}

const canvas = document.getElementById('draw-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let isDrawing = false;

function clearCanvas() {
    if (!canvas || !ctx) return;
    const char = String.fromCharCode(currentLetterCode);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 110px Segoe UI";
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(char, canvas.width / 2, canvas.height / 2);
}

if (canvas) {
    function startDrawing(e) { isDrawing = true; draw(e); }
    function stopDrawing() { isDrawing = false; ctx.beginPath(); }
    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#06d6a0';
        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
    }
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchmove', draw);
}

function setStage(stage, btn) {
    document.querySelectorAll('.stage-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// Initial Loading
renderDictionary();
renderGrammar();
renderStories();
generateInfiniteQuestion();
if (canvas) clearCanvas();
// === Hearo Pro - تقييم ذكي بدرجة % ===
function similarity(s1, s2){
  s1 = s1.toLowerCase().trim();
  s2 = s2.toLowerCase().trim();
  if(s1 === s2) return 100;
  if(s1.includes(s2) || s2.includes(s1)) return 85;
  
  let longer = s1.length > s2.length ? s1 : s2;
  let shorter = s1.length > s2.length ? s2 : s1;
  if(longer.length === 0) return 100;
  let costs = [];
  for(let i=0; i<=shorter.length; i++){
    let lastValue = i;
    for(let j=0; j<=longer.length; j++){
      if(i===0) costs[j]=j;
      else if(j>0){
        let newValue = costs[j-1];
        if(shorter.charAt(i-1) != longer.charAt(j-1))
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        costs[j-1]=lastValue;
        lastValue=newValue;
      }
    }
    if(i>0) costs[longer.length]=lastValue;
  }
  return Math.round((1 - costs[longer.length]/longer.length)*100);
}

function startHearoRec(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ alert("افتح بـ Chrome - الأندرويد فقط"); return; }
  
  const rec = new SR();
  rec.lang = 'en-US';
  rec.interimResults = false;
  
  let r = document.getElementById('result');
  if(r){
    r.innerHTML = "🎤 اسمعك... تكلم الآن";
    r.style.color = "#facc15";
  }

  rec.onresult = (e)=>{
    let said = e.results[0][0].transcript.toLowerCase().trim();
    let target = (document.getElementById('word')?.innerText || "hello").toLowerCase().trim();
    
    let score = similarity(said, target);

    if(!r) return;

    if(score >= 80){
      r.innerHTML = `✅ ممتاز ${score}%<br>قلت: "${said}"`;
      r.style.color = "#22c55e";
      speak("Excellent! " + target);
      addPoints(20);
      if(score === 100) speak("Perfect pronunciation!");
    } 
    else if(score >= 50){
      r.innerHTML = `🟡 جيد ${score}%<br>قلت: "${said}"<br>حاول: "${target}"`;
      r.style.color = "#f59e0b";
      setTimeout(()=> speak(target), 500);
      addPoints(5);
    } 
    else {
      r.innerHTML = `❌ حاول تاني ${score}%<br>قلت: "${said}"<br>الصح: "${target}"`;
      r.style.color = "#ef4444";
      setTimeout(()=> speak(target), 800);
    }
  };

  rec.onerror = ()=>{
    if(r){
      r.innerHTML = "❌ مسمعتش كويس، دوس تاني";
      r.style.color = "red";
    }
  };

  rec.start();
}
