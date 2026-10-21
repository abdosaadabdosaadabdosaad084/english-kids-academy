// Global State
let currentCase = 'capital';
let currentLetter = 'A';
let isDrawing = false;
let canvas, ctx;

const capitalList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const smallList = "abcdefghijklmnopqrstuvwxyz".split("");

// Offline Translation Cache
const transCache = JSON.parse(localStorage.getItem('offline_trans') || '{}');

window.onload = () => {
    initCanvas();
    renderLettersBar();
};

// Navigation
function showHome() {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
    document.getElementById('homeView').classList.add('active-view');
}

function openSection(type) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));

    if (type === 'translator') {
        document.getElementById('translatorView').classList.add('active-view');
    } else if (type === 'board') {
        document.getElementById('boardView').classList.add('active-view');
        clearBoard();
    } else {
        const details = document.getElementById('detailsContent');
        
        // 1. GRAMMAR SECTION
        if (type === 'grammar') {
            details.innerHTML = `
                <h2>📖 موسوعة القواعد الإنجليزية الشاملة</h2>
                <hr style="margin:10px 0; border-color:#444;"><br>

                <h3>1. الضمائر الشخصية (Personal Pronouns)</h3>
                <p>• <b>I</b> (أنا) | <b>He</b> (هو) | <b>She</b> (هي) | <b>It</b> (هو/هي لغير العاقل)</p>
                <p>• <b>We</b> (نحن) | <b>They</b> (هم) | <b>You</b> (أنت/أنتِ/أنتم)</p>
                <p><b>مثال:</b> She is a smart student. (هي طالبة ذكية)</p><br>

                <h3>2. فعل يكون (Verb to Be)</h3>
                <p>• <b>I</b> → am | <b>He / She / It</b> → is | <b>We / They / You</b> → are</p>
                <p><b>مثال:</b> They are playing in the garden. (هم يلعبون في الحديقة)</p><br>

                <h3>3. المضارع البسيط (Present Simple)</h3>
                <p><b>الاستخدام:</b> يعبر عن العادات اليومية والحقائق العلمية.</p>
                <p><b>التكوين:</b> إضافة (s / es) مع (He, She, It) والمصدر مع بقية الضمائر.</p>
                <p><b>مثال:</b> The sun rises in the east. (أشعة الشمس تشرق من الشرق)</p><br>

                <h3>4. المضارع المستمر (Present Continuous)</h3>
                <p><b>الاستخدام:</b> شيء يحدث الآن في لحظة الكلام.</p>
                <p><b>التكوين:</b> am / is / are + الفعل + ing</p>
                <p><b>مثال:</b> I am reading a book right now. (أنا أقرأ كتاباً الآن)</p><br>

                <h3>5. الماضي البسيط (Past Simple)</h3>
                <p><b>الاستخدام:</b> حدث بدأ وانتهى في الماضي.</p>
                <p><b>التكوين:</b> إضافة ed للأفعال المنتظمة أو التصريف الثاني للأفعال الشاذة.</p>
                <p><b>مثال:</b> We visited the zoo yesterday. (زرت حديقة الحيوان أمس)</p><br>

                <button class="btn-google-search" onclick="window.open('https://www.google.com/search?q=english+grammar+lessons+for+kids','_blank')">🔍 البحث والتوسع في Google Grammar</button>
            `;
        } 
        
        // 2. DIALOGUES SECTION
        else if (type === 'dialogues') {
            details.innerHTML = `
                <h2>💬 محادثات وتدريبات الحياة اليومية (+100)</h2>
                <hr style="margin:10px 0; border-color:#444;"><br>

                <div style="background:#1A233A; padding:15px; border-radius:12px; margin-bottom:15px;">
                    <h4>🏫 1. في المدرسة (At School)</h4>
                    <p><b>Teacher:</b> Good morning, class! (صباح الخير يا طلاب)</p>
                    <p><b>Students:</b> Good morning, Teacher! (صباح الخير يا معلم)</p>
                    <p><b>Teacher:</b> Open your books to page 10. (افتحوا كتبكم على الصفحة 10)</p>
                    <button class="btn-act audio-btn" style="margin-top:8px;" onclick="speak('Good morning class. Open your books to page 10.')">🔊 استمع للمحادثة</button>
                </div>

                <div style="background:#1A233A; padding:15px; border-radius:12px; margin-bottom:15px;">
                    <h4>🛒 2. في السوبرماركت (At the Supermarket)</h4>
                    <p><b>Customer:</b> How much is this apple? (بكم هذه التفاحة؟)</p>
                    <p><b>Seller:</b> It is 2 dollars. (سعرها دولارين)</p>
                    <p><b>Customer:</b> Here you go. Thank you! (تفضل، شكراً لك)</p>
                    <button class="btn-act audio-btn" style="margin-top:8px;" onclick="speak('How much is this apple? It is 2 dollars.')">🔊 استمع للمحادثة</button>
                </div>

                <div style="background:#1A233A; padding:15px; border-radius:12px; margin-bottom:15px;">
                    <h4>🩺 3. عند الطبيب (At the Doctor)</h4>
                    <p><b>Doctor:</b> What is the problem? (ما هي المشكلة؟)</p>
                    <p><b>Patient:</b> I feel sick and have a fever. (أشعر بالمرض ولدي حرارة)</p>
                    <p><b>Doctor:</b> Take this medicine and rest. (تناول هذا الدواء واسترح)</p>
                    <button class="btn-act audio-btn" style="margin-top:8px;" onclick="speak('What is the problem? I feel sick. Take this medicine.')">🔊 استمع للمحادثة</button>
                </div>
            `;
        } 

        // 3. DICTIONARY SECTION
        else if (type === 'dictionary') {
            details.innerHTML = `
                <h2>📚 القاموس الشامل والمفردات</h2>
                <hr style="margin:10px 0; border-color:#444;"><br>
                <p>اضغط على أي كلمة للاستماع لنطقها الصحيح:</p><br>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <button class="btn-act" onclick="speak('Apple')">🍎 Apple (تفاحة)</button>
                    <button class="btn-act" onclick="speak('Elephant')">🐘 Elephant (فيل)</button>
                    <button class="btn-act" onclick="speak('School')">🏫 School (مدرسة)</button>
                    <button class="btn-act" onclick="speak('Family')">👨‍👩‍👧 Family (عائلة)</button>
                    <button class="btn-act" onclick="speak('Teacher')">👨‍🏫 Teacher (معلم)</button>
                    <button class="btn-act" onclick="speak('Doctor')">🩺 Doctor (طبيب)</button>
                    <button class="btn-act" onclick="speak('Water')">💧 Water (ماء)</button>
                    <button class="btn-act" onclick="speak('Airplane')">✈️ Airplane (طائرة)</button>
                </div>
                <br>
                <button class="btn-google-search" onclick="window.open('https://www.google.com/search?q=english+dictionary+for+children','_blank')">🔍 ابحث عن أي كلمة في قاموس Google</button>
            `;
        }

        // 4. STORIES SECTION
        else if (type === 'stories') {
            details.innerHTML = `
                <h2>📕 القصص التعليمية الموسعة</h2>
                <hr style="margin:10px 0; border-color:#444;"><br>

                <div style="background:#1A233A; padding:15px; border-radius:12px; margin-bottom:15px;">
                    <h3>1. The Thirsty Crow (الغراب العطشان) 🐦</h3>
                    <p>Once upon a time, a crow was very thirsty. He found a pitcher with very little water. He threw small stones inside until the water level rose, and he drank happily.</p>
                    <p><b>العبرة:</b> بالذكاء والتفكير نحل أصعب المشاكل!</p>
                    <button class="btn-act audio-btn" style="margin-top:8px;" onclick="speak('Once upon a time, a crow was very thirsty. He threw small stones inside until the water rose.')">🔊 استمع للقصة</button>
                </div>

                <div style="background:#1A233A; padding:15px; border-radius:12px;">
                    <h3>2. The Boy Who Cried Wolf (الولد والذئب) 🐺</h3>
                    <p>A shepherd boy kept tricking villagers by shouting "Wolf!". When a real wolf came, no one believed him. Always tell the truth!</p>
                    <p><b>العبرة:</b> الصدق دائماً ينجي الصادقين!</p>
                    <button class="btn-act audio-btn" style="margin-top:8px;" onclick="speak('Always tell the truth. Honesty is the best policy.')">🔊 استمع للقصة</button>
                </div>
            `;
        }

        // 5. GAMES SECTION
        else if (type === 'games') {
            details.innerHTML = `
                <h2>🎮 الألعاب الصوتية والتحديات</h2>
                <hr style="margin:10px 0; border-color:#444;"><br>

                <div style="background:#1A233A; padding:15px; border-radius:12px; text-align:center;">
                    <h3>السؤال 1: ما معنى كلمة "Cat"؟</h3><br>
                    <button class="btn-act clear-btn" style="margin:5px;" onclick="checkAnswer(false)">كلب</button>
                    <button class="btn-act audio-btn" style="margin:5px;" onclick="checkAnswer(true)">قطة</button>
                    <button class="btn-act next-btn" style="margin:5px;" onclick="checkAnswer(false)">عصفور</button>
                </div>
            `;
        }

        document.getElementById('detailsView').classList.add('active-view');
    }
}

// Answer Check & Points
function checkAnswer(isCorrect) {
    if (isCorrect) {
        alert("إجابة صحيحة ممتاز! 🎉 تم إضافة +10 نقاط لرصيدك.");
        let scoreElem = document.getElementById('userScore');
        scoreElem.innerText = parseInt(scoreElem.innerText) + 10;
    } else {
        alert("إجابة خاطئة! حاول مرة أخرى 💪");
    }
}

// Voice Recognition & Translator
function toggleSpeech() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recog = new SpeechRecognition();
        recog.lang = 'ar-SA';
        
        recog.onstart = () => {
            document.getElementById('micBtn').innerText = '🎙️ جاري الاستماع بكفاءة...';
        };

        recog.onresult = (e) => {
            const text = e.results[0][0].transcript;
            document.getElementById('arText').innerText = text;
            translateText(text);
            document.getElementById('micBtn').innerText = '🎙️ اضغط وتحدث بالعربية';
        };

        recog.start();
    } else {
        alert('المتصفح لا يدعم التسجيل الصوتي المباشر، يمكنك استخدام الترجمة النصية.');
    }
}

function translateText(text) {
    let clean = text.trim();
    
    // Offline Storage Match
    if (transCache[clean]) {
        document.getElementById('enText').innerText = transCache[clean];
        return;
    }

    let translated = "peace";
    if (clean.includes("سلام") || clean.includes("مرحبا")) translated = "hello / peace";
    else if (clean.includes("كتاب")) translated = "book";
    else if (clean.includes("مدرسة")) translated = "school";
    else if (clean.includes("تفاحة")) translated = "apple";
    else translated = clean + " (English)";

    transCache[clean] = translated;
    localStorage.setItem('offline_trans', JSON.stringify(transCache));

    document.getElementById('enText').innerText = translated;
}

function speakEnglish() {
    const text = document.getElementById('enText').innerText;
    speak(text);
}

function searchGoogleTrans() {
    const q = encodeURIComponent(document.getElementById('arText').innerText);
    window.open(`https://translate.google.com/?sl=ar&tl=en&text=${q}&op=translate`, '_blank');
}

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

function speakCurrentLetter() {
    speak(currentLetter);
}

function installPWA() {
    alert("لتثبيت التطبيق على هاتفك: اضغط على خيارات المتصفح (⋮) ثم اختر 'إضافة إلى الشاشة الرئيسية Add to Home Screen'.");
            }
