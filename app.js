// قاعدة بيانات المحتوى التعليمي للمستويات المختلفة
const lessonsData = {
    kids: [
        { en: "Apple", ar: "تفاحة" },
        { en: "Cat", ar: "قطة" },
        { en: "Sun", ar: "شمس" }
    ],
    beginners: [
        { en: "Good morning", ar: "صباح الخير" },
        { en: "How are you?", ar: "كيف حالك؟" },
        { en: "Nice to meet you", ar: "سررت بلقائك" }
    ],
    advanced: [
        { en: "Actions speak louder than words", ar: "الأفعال أبلغ من الأقوال" },
        { en: "To make a long story short", ar: "باختصار شديد" },
        { en: "Break a leg", ar: "بالتوفيق (أتمنى لك حظاً سعيداً)" }
    ]
};

// دالة تبديل المستويات وعرض المحتوى الخاص بها
function switchLevel(level) {
    // تحديث أزرار التحكم النشطة
    const buttons = document.querySelectorAll('.level-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const displayArea = document.getElementById('content-display');
    displayArea.innerHTML = ""; // تصفية المحتوى القديم

    // بناء العناصر التعليمية للمستوى المحدد
    lessonsData[level].forEach(item => {
        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
            <div>
                <span class="word-en">${item.en}</span> <br>
                <span class="word-ar">${item.ar}</span>
            </div>
            <button class="listen-btn" onclick="speak('${item.en}')">🔊 انطق</button>
        `;
        displayArea.appendChild(row);
    });
}

// دالة نطق الكلمات بالإنجليزية بلكنة احترافية
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85; // سرعة النطق مناسبة للمتعلمين
    window.speechSynthesis.speak(utterance);
}

// تشغيل مستوى الأطفال تلقائياً عند فتح التطبيق لأول مرة
window.onload = () => {
    document.querySelector('.level-btn').click();
};
