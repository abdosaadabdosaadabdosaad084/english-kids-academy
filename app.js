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

// ==================== 1. قاموس المورد الشامل الموسع ====================
const COMPREHENSIVE_DICTIONARY = [
    // الأطعمة والمشروبات والفواكه
    {en: 'Apple', ar: 'تفاحة', cat: 'طعام وفواكه'}, {en: 'Banana', ar: 'موز', cat: 'طعام وفواكه'}, {en: 'Orange', ar: 'برتقال', cat: 'طعام وفواكه'},
    {en: 'Watermelon', ar: 'بطيخ', cat: 'طعام وفواكه'}, {en: 'Grape', ar: 'عنب', cat: 'طعام وفواكه'}, {en: 'Strawberry', ar: 'فراولة', cat: 'طعام وفواكه'},
    {en: 'Pineapple', ar: 'أناناس', cat: 'طعام وفواكه'}, {en: 'Peach', ar: 'خوخ', cat: 'طعام وفواكه'}, {en: 'Mango', ar: 'مانجو', cat: 'طعام وفواكه'},
    {en: 'Bread', ar: 'خبز', cat: 'طعام وفواكه'}, {en: 'Cheese', ar: 'جبن', cat: 'طعام وفواكه'}, {en: 'Butter', ar: 'زبدة', cat: 'طعام وفواكه'},
    {en: 'Milk', ar: 'حليب', cat: 'طعام وفواكه'}, {en: 'Rice', ar: 'أرز', cat: 'طعام وفواكه'}, {en: 'Meat', ar: 'لحم', cat: 'طعام وفواكه'},
    {en: 'Chicken', ar: 'دجاج', cat: 'طعام وفواكه'}, {en: 'Fish', ar: 'سمك', cat: 'طعام وفواكه'}, {en: 'Soup', ar: 'حساء', cat: 'طعام وفواكه'},
    
    // الحيوانات والطيور والأسماك
    {en: 'Cat', ar: 'قطة', cat: 'حيوانات'}, {en: 'Dog', ar: 'كلب', cat: 'حيوانات'}, {en: 'Elephant', ar: 'فيل', cat: 'حيوانات'},
    {en: 'Lion', ar: 'أسد', cat: 'حيوانات'}, {en: 'Tiger', ar: 'نمر', cat: 'حيوانات'}, {en: 'Giraffe', ar: 'زرافة', cat: 'حيوانات'},
    {en: 'Horse', ar: 'حصان', cat: 'حيوانات'}, {en: 'Monkey', ar: 'قرد', cat: 'حيوانات'}, {en: 'Dolphin', ar: 'دلفين', cat: 'حيوانات'},
    {en: 'Eagle', ar: 'نسر', cat: 'حيوانات'}, {en: 'Rabbit', ar: 'أرنب', cat: 'حيوانات'}, {en: 'Bear', ar: 'دب', cat: 'حيوانات'},
    {en: 'Falcon', ar: 'صقر', cat: 'حيوانات'}, {en: 'Wolf', ar: 'ذئب', cat: 'حيوانات'}, {en: 'Fox', ar: 'ثعلب', cat: 'حيوانات'},
    
    // التعليم والمدرسة
    {en: 'School', ar: 'مدرسة', cat: 'تعليم'}, {en: 'Teacher', ar: 'معلم', cat: 'تعليم'}, {en: 'Student', ar: 'طالب', cat: 'تعليم'},
    {en: 'Book', ar: 'كتاب', cat: 'تعليم'}, {en: 'Notebook', ar: 'دفتر', cat: 'تعليم'}, {en: 'Pencil', ar: 'قلم رصاص', cat: 'تعليم'},
    {en: 'Classroom', ar: 'فصل دراسي', cat: 'تعليم'}, {en: 'Library', ar: 'مكتبة', cat: 'تعليم'}, {en: 'University', ar: 'جامعة', cat: 'تعليم'},
    {en: 'Science', ar: 'علوم', cat: 'تعليم'}, {en: 'Mathematics', ar: 'رياضيات', cat: 'تعليم'}, {en: 'History', ar: 'تاريخ', cat: 'تعليم'},
    {en: 'Exam', ar: 'امتحان', cat: 'تعليم'}, {en: 'Grade', ar: 'درجة / درجة دراسية', cat: 'تعليم'}, {en: 'Lesson', ar: 'درس', cat: 'تعليم'},

    // المهن والحرف
    {en: 'Doctor', ar: 'طبيب', cat: 'مهن'}, {en: 'Nurse', ar: 'ممرضة', cat: 'مهن'}, {en: 'Engineer', ar: 'مهندس', cat: 'مهن'},
    {en: 'Pilot', ar: 'طيار', cat: 'مهن'}, {en: 'Chef', ar: 'طباخ', cat: 'مهن'}, {en: 'Officer', ar: 'ضابط', cat: 'مهن'},
    {en: 'Driver', ar: 'سائق', cat: 'مهن'}, {en: 'Accountant', ar: 'محاسب', cat: 'مهن'}, {en: 'Artist', ar: 'فنان', cat: 'مهن'},
    {en: 'Lawyer', ar: 'محامي', cat: 'مهن'}, {en: 'Farmer', ar: 'مزارع', cat: 'مهن'}, {en: 'Scientist', ar: 'عالم', cat: 'مهن'},

    // التكنولوجيا والتجارة والأعمال
    {en: 'Computer', ar: 'حاسوب', cat: 'تكنولوجيا'}, {en: 'Internet', ar: 'إنترنت', cat: 'تكنولوجيا'}, {en: 'Software', ar: 'برمجيات', cat: 'تكنولوجيا'},
    {en: 'Application', ar: 'تطبيق', cat: 'تكنولوجيا'}, {en: 'Data', ar: 'بيانات', cat: 'تكنولوجيا'}, {en: 'Screen', ar: 'شاشة', cat: 'تكنولوجيا'},
    {en: 'Business', ar: 'أعمال تجارية', cat: 'تكنولوجيا'}, {en: 'Market', ar: 'سوق', cat: 'تكنولوجيا'}, {en: 'Company', ar: 'شركة', cat: 'تكنولوجيا'}
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
                <h3 style="color:var(--accent-yellow);">🔍 بحث شامل في المورد عن: "${filterText}"</h3>
                <p style="margin:10px 0; color:var(--text-dim);">الكلمة المكتوبة يمكن الاستماع لنطقها الصوتي المباشر بالكامل:</p>
                <button class="btn-action" onclick="speak('${filterText}')">🔊 نطق الكلمة المكتوبة (${filterText})</button>
            </div>
        `;
    }

    dictContainer.innerHTML = `
        <div style="margin-bottom:15px;">
            <input type="text" id="dict-search-input" value="${filterText}" placeholder="🔍 ابحث في قاموس المورد عن أي كلمة عربية أو إنجليزية..." style="width:100%; padding:12px; border-radius:10px; border:2px solid var(--accent-blue); background:#121324; color:#fff; font-size:1rem;" oninput="renderDictionary(this.value)">
        </div>
        ${customSearchHTML}
        <div class="word-list">
            ${filtered.map(w => `
                <div class="word-card" onclick="speak('${w.en}')">
                    <div>
                        <span class="word-en">🔊 ${w.en}</span>
                        <span style="font-size:0.75rem; color:var(--accent-purple); display:block;">[${w.cat}]</span>
                    </div>
                    <span class="word-ar">${w.ar}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// ==================== 2. قسم قواعد اللغة الإنجليزية (شرح مستفيض ووافي شامل) ====================
function renderGrammar() {
    const container = document.getElementById('grammar-container');
    container.innerHTML = `
        <div class="interactive-card">
            <h2 style="color:var(--accent-yellow); margin-bottom:10px;">📘 قواعد اللغة الإنجليزية الشاملة والمستفيضة</h2>
            <p style="color:var(--text-dim); line-height:1.7;">موسوعة شرح أكاديمية متكاملة تشمل كافة أركان وقواعد وتراكيب اللغة الإنجليزية من الألف إلى الياء.</p>
        </div>

        <!-- 1. أجزاء الكلام والضمائر -->
        <div class="interactive-card">
            <h3 style="color:var(--accent-green);">1. أجزاء الكلام والضمائر الشاملة (Parts of Speech & Pronouns)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.8;">
                تتكون اللغة الإنجليزية من 8 أجزاء رئيسية للكلام (الأسماء Nouns، الأفعال Verbs، الصفات Adjectives، الأحوال Adverbs، الضمائر Pronouns، حروف الجر Prepositions، أدوات العطف Conjunctions، وأدوات التعجب Interjections).<br><br>
                <b>أقسام الضمائر التفصيلية (Pronouns Types):</b><br>
                <b>1. ضمائر الفاعل (Subject Pronouns):</b> تُوضع في موقع الفاعل قبل الفعل.<br>
                • <b>I</b> (أنا) ➔ e.g., <i>I study English every day.</i><br>
                • <b>He</b> (هو) ➔ e.g., <i>He is a brilliant doctor.</i><br>
                • <b>She</b> (هي) ➔ e.g., <i>She writes short stories.</i><br>
                • <b>It</b> (لغير العاقل) ➔ e.g., <i>It is raining outside.</i><br>
                • <b>We</b> (نحن) ➔ e.g., <i>We achieve our goal.</i><br>
                • <b>They</b> (هم/هن) ➔ e.g., <i>They play in the garden.</i><br><br>
                <b>2. ضمائر المفعول به (Object Pronouns):</b> (تأتي بعد الفعل أو حرف الجر)<br>
                • Me, Him, Her, It, Us, You, Them.<br>
                • <i>أمثلة:</i> The manager called <b>him</b> yesterday (المدير اتصل به أمس).<br><br>
                <b>3. صفات الملكية وضمائر الملكية:</b><br>
                • صفات الملكية (يتبعها اسم): My car, His book, Her house.<br>
                • ضمائر الملكية (لا يتبعها اسم): Mine, His, Hers, Ours, Yours, Theirs (e.g., This book is <b>mine</b>).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('I study English every day. He is a brilliant doctor. The manager called him yesterday. This book is mine.')">🔊 استمع للضمائر والأمثلة الكاملة</button>
        </div>

        <!-- 2. موسوعة الأزمنة كاملة (All 12 Tenses) -->
        <div class="interactive-card">
            <h3 style="color:var(--accent-green);">2. موسوعة الأزمنة الكاملة بالتفصيل (All English Tenses)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.8;">
                <b>1. المضارع البسيط (Present Simple):</b> للحقائق والتكرار العادي.<br>
                • التكوين: الفعل مجرد أو مضاف له (s/es).<br>
                • e.g., <i>Water boils at 100 degrees. / He plays tennis on Fridays.</i><br><br>
                <b>2. المضارع المستمر (Present Continuous):</b> لأحداث تقع الآن.<br>
                • التكوين: (am/is/are) + Verb + ing.<br>
                • e.g., <i>She is reading a novel at the moment.</i><br><br>
                <b>3. المضارع التام (Present Perfect):</b> أحداث اكتملت مؤخراً أو لها أثر بالواقع.<br>
                • التكوين: (have/has) + التصريف الثالث P.P.<br>
                • e.g., <i>I have finished my homework already.</i><br><br>
                <b>4. الماضي البسيط (Past Simple):</b> حدث مكتمل ومقترن بوقت في الماضي.<br>
                • التكوين: التصريف الثاني للفعل V2.<br>
                • e.g., <i>They visited Cairo last month.</i><br><br>
                <b>5. الماضي المستمر (Past Continuous):</b> حدث كان مستمراً في لحظة معينة بالماضي.<br>
                • التكوين: (was/were) + Verb + ing.<br>
                • e.g., <i>I was studying when the phone rang.</i><br><br>
                <b>6. المستقبل البسيط (Future Simple):</b> للتنبؤ والتخطيط القادم.<br>
                • التكوين: Will + المصدر.<br>
                • e.g., <i>We will travel to Alexandria next summer.</i>
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('Water boils at 100 degrees. She is reading a novel now. I have finished my homework. They visited Cairo last month. We will travel next summer.')">🔊 استمع لكل الأزمنة وأمثلتها</button>
        </div>

        <!-- 3. الأفعال الناقصة، المبني للمجهول والقواعد المتقدمة -->
        <div class="interactive-card">
            <h3 style="color:var(--accent-green);">3. القواعد المتقدمة (Passive, Modals & Conditionals)</h3>
            <p style="color:var(--text-dim); margin-top:8px; line-height:1.8;">
                <b>أ. المبني للمجهول (Passive Voice):</b> تحويل التركيز من الفاعل إلى المفعول به.<br>
                • التكوين العامة: المفعول + Verb to be + التصريف الثالث P.P.<br>
                • e.g., <i>The car was repaired by the mechanic.</i> (تُم تصليح السيارة بواسطة الميكانيكي).<br><br>
                <b>ب. قواعد الشرط (If Conditionals):</b><br>
                • الحالة الأولى (المحتملة): If + مضارع بسيط ➔ Will + المصدر.<br>
                • e.g., <i>If you study hard, you will pass the exam.</i><br><br>
                <b>ج. الأفعال الناقصة (Modals):</b><br>
                • <b>Must:</b> للالتزام القوي والضرورة (You must follow safety rules).<br>
                • <b>Should:</b> تقديم النصيحة القيمة (You should eat healthy food).<br>
                • <b>Can/Could:</b> للتعبير عن الاستطاعة والطلب المؤدب (Can you help me, please?).
            </p>
            <button class="stage-btn" style="margin-top:10px;" onclick="speak('The car was repaired. If you study hard, you will pass. You must follow safety rules.')">🔊 استمع للشرح المتقدم والأمثلة</button>
        </div>
    `;
}

// ==================== 3. المحادثات الحقيقية التفاعلية (سؤال وجواب A/B) ====================
const CONVERSATIONS = [
    {
        title: "💬 1. محادثة التعارف والترحيب (Meeting & Greeting)",
        desc: "حوار تفاعلي حقيقي (سؤال وجواب) للتعريف عن النفس واستقبال الآخرين:",
        dialogue: [
            { speaker: "Speaker A", text: "Hello! Good morning. What is your name?", ar: "أهلاً بك! صباح الخير. ما هو اسمك؟" },
            { speaker: "Speaker B", text: "Good morning! My name is Ghazaal. What about you?", ar: "صباح النور! اسمي غزل. وماذا عنك؟" },
            { speaker: "Speaker A", text: "I am Alex. Nice to meet you, Ghazaal!", ar: "أنا ألكس. سررت بلقائك يا غزل!" },
            { speaker: "Speaker B", text: "Nice to meet you too, Alex. How are you today?", ar: "سررت بلقائك أيضاً يا ألكس. كيف حالك اليوم؟" },
            { speaker: "Speaker A", text: "I am doing great, thank you! Have a wonderful day.", ar: "أنا بخير جداً، شكراً لك! أتمنى لك يوماً رائعاً." }
        ]
    },
    {
        title: "💬 2. محادثة التسوق والشراء (At the Shopping Store)",
        desc: "حوار سؤال وجواب حقيقي عند الشراء من المتجر والسؤال عن الأسعار:",
        dialogue: [
            { speaker: "Speaker A (Seller)", text: "Hello! How can I help you today?", ar: "أهلاً بك! كيف يمكنني مساعدتك اليوم؟" },
            { speaker: "Speaker B (Customer)", text: "Hi! I want to buy a fresh apple and water, please.", ar: "مرحباً! أريد شراء تفاحة طازجة وماء من فضلك." },
            { speaker: "Speaker A (Seller)", text: "Sure! Here you are. Anything else?", ar: "بالتأكيد! تفضل هنا. هل تريد أي شيء آخر؟" },
            { speaker: "Speaker B (Customer)", text: "No, thanks. How much is the total?", ar: "لا، شكراً لك. كم الإجمالي؟" },
            { speaker: "Speaker A (Seller)", text: "That will be five pounds, please.", ar: "الإجمالي خمسة جنيهات من فضلك." }
        ]
    },
    {
        title: "💬 3. محادثة في المدرسة والمكتبة (At School Library)",
        desc: "حوار سؤال وجواب للبحث عن كتاب ومساعدة المعلم للطفل:",
        dialogue: [
            { speaker: "Student", text: "Excuse me, Teacher. Where can I find science books?", ar: "عفواً يا معلمي. أين أجد كتب العلوم؟" },
            { speaker: "Teacher", text: "They are on the second shelf on your right.", ar: "إنها على الرف الثاني على يمينك." },
            { speaker: "Student", text: "Thank you so much for your help!", ar: "شكراً جزيلاً لك على مساعدتك!" },
            { speaker: "Teacher", text: "You are most welcome! Enjoy reading.", ar: "على الرحب والسعة! استمتع بالقراءة." }
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

            <button class="stage-btn" style="margin-top:15px; width:100%; background:var(--accent-blue); color:#fff;" onclick="speak('${c.dialogue.map(d => d.text).join('. ')}')">
                ▶️ استمع للمحادثة الكاملة متواصلة
            </button>
        </div>
    `).join('');
}

// ==================== 4. قسم الألعاب والتقييم الصوتي ====================
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
        speak('Well done! Excellent!');
        alert('إجابة صحيحة! 🎉 أحسنت ممتاز! +10 نقاط');
        addPoints(10);
    } else {
        speak('Try again');
        alert(`إجابة خاطئة! ❌ الإجابة الصحيحة هي: ${COMPREHENSIVE_DICTIONARY.find(w => w.en === correctEn).ar}`);
    }
    generateInfiniteQuestion();
}

// ==================== 5. السبورة والتنقل التلقائي للحرف التالي ====================
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
