// State Variables
let currentType = 'capital'; // 'capital' or 'small'
let currentLetter = 'A';
let isDrawing = false;

// Elements
const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
const lettersSelector = document.getElementById('lettersSelector');

// Letters List
const capitalLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const smallLetters = "abcdefghijklmnopqrstuvwxyz".split("");

// Init
window.onload = () => {
    renderLetters();
    initCanvas();
    renderModules();
};

// Switch Capital / Small
function switchLetterType(type) {
    currentType = type;
    document.getElementById('tabCapital').classList.toggle('active', type === 'capital');
    document.getElementById('tabSmall').classList.toggle('active', type === 'small');
    currentLetter = type === 'capital' ? 'A' : 'a';
    renderLetters();
}

// Render Letters Grid
function renderLetters() {
    lettersSelector.innerHTML = '';
    const list = currentType === 'capital' ? capitalLetters : smallLetters;
    
    list.forEach(letter => {
        const btn = document.createElement('button');
        btn.className = `letter-btn ${letter === currentLetter ? 'active' : ''}`;
        btn.innerText = letter;
        btn.onclick = () => selectLetter(letter);
        lettersSelector.appendChild(btn);
    });
    
    updateLetterDisplay();
}

function selectLetter(letter) {
    currentLetter = letter;
    renderLetters();
    clearCanvas();
    speakCurrentLetter();
}

function updateLetterDisplay() {
    document.getElementById('currentLetterDisplay').innerText = `الحرف الحالي: ${currentLetter}`;
}

// Speech Synthesis
function speakCurrentLetter() {
    speak(currentLetter);
}

function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
    }
}

// Interactive Drawing Canvas Logic
function initCanvas() {
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#4F46E5';

    // Mouse Events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);

    // Touch Events for Mobile
    canvas.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        startDrawing({ clientX: touch.clientX - rect.left, clientY: touch.clientY - rect.top });
    });

    canvas.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        draw({ clientX: touch.clientX - rect.left, clientY: touch.clientY - rect.top });
    });

    canvas.addEventListener('touchend', stopDrawing);

    document.getElementById('penColor').addEventListener('input', (e) => {
        ctx.strokeStyle = e.target.value;
    });
}

function startDrawing(e) {
    isDrawing = true;
    ctx.beginPath();
    const x = e.offsetX || e.clientX;
    const y = e.offsetY || e.clientY;
    ctx.moveTo(x, y);
}

function draw(e) {
    if (!isDrawing) return;
    const x = e.offsetX || e.clientX;
    const y = e.offsetY || e.clientY;
    ctx.lineTo(x, y);
    ctx.stroke();
}

function stopDrawing() { isDrawing = false; }
function clearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); }

// Educational Modules
const modulesData = [
    { title: "الحروف والقراءة", desc: "الحروف أصواتها والتهجئة للأطفال" },
    { title: "الأرقام والأعداد", desc: "عد الأرقام بالإنجليزية والعمليات" },
    { title: "عالم الحيوانات", desc: "أسماء الحيوانات وأصواتها" },
    { title: "الألوان والأشكال", desc: "تعلم الألوان وصياغة وصف الأشياء" },
    { title: "الأيام والشهور", desc: "أيام الأسبوع، الوقت والفصول" },
    { title: "مفردات الحياة اليومية", desc: "العائلة، المدرسة، الطعام والمهن" },
    { title: "القواعد وتكوين الجمل", desc: "الضمائر والأزمنة البسيطة" },
    { title: "المحادثة والقصص", desc: "حوارات قصيرة لجميع الأعمار" }
];

function renderModules() {
    const grid = document.getElementById('modulesGrid');
    grid.innerHTML = '';
    modulesData.forEach((m, idx) => {
        const card = document.createElement('div');
        card.className = 'module-card';
        card.innerHTML = `<h3>${m.title}</h3><p>${m.desc}</p>`;
        card.onclick = () => openLesson(m.title);
        grid.appendChild(card);
    });
}

function openLesson(title) {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalExplain').innerText = `مرحباً بك في درس (${title}). يحتوي هذا الدرس على شرح شامل وأمثلة تناسب جميع المستويات.`;
    document.getElementById('modalVocab').innerHTML = `
        <div class="vocab-item"><b>Example 1</b><br>مثال 1 <button onclick="speak('Example 1')">🔊</button></div>
        <div class="vocab-item"><b>Example 2</b><br>مثال 2 <button onclick="speak('Example 2')">🔊</button></div>
    `;
    document.getElementById('lessonModal').style.display = 'block';
}

function closeLesson() {
    document.getElementById('lessonModal').style.display = 'none';
}
