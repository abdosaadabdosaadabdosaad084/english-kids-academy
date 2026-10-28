const DICT = {
"مكان":"Place - بليس - المكان اللي احنا فيه 🏠",
"تلميذ":"Student - ستودنت - ولد شاطر بيتعلم",
"مدرسة":"School - سكول - بنتعلم فيها",
"كتاب":"Book - بوك - بنقرا فيه 📚",
"قلم":"Pen - بن - بنكتب بيه",
"ولد":"Boy - بوي - ولد 👦",
"بنت":"Girl - جيرل - بنت 👧",
"بيت":"House - هاوس - بيتنا 🏠",
"قطة":"Cat - كات - قطة 🐱",
"كلب":"Dog - دوج - كلب 🐶",
"تفاحة":"Apple - آبل - تفاحة 🍎",
"ماء":"Water - ووتر - مية 💧",
"شمس":"Sun - صن - شمس ☀️",
"قمر":"Moon - مون - قمر 🌙",
"سيارة":"Car - كار - عربية 🚗",
"لعبة":"Toy - توي - لعبة 🧸",
"جميل":"Beautiful - بيوتيفول - جميل ✨",
"كبير":"Big - بيج - كبير",
"صغير":"Small - سمول - صغير",
"سعيد":"Happy - هابي - مبسوط 😊"
};

let score = 0;
let learned = [];

function setMode(m){
  localStorage.setItem('mode', m);
  document.querySelectorAll('.mode-btn').forEach(b=>b.classList.remove('active'));
  let id = 'mode-'+m;
  let btn = document.getElementById(id);
  if(btn) btn.classList.add('active');
  let label = document.getElementById('modeLabel');
  if(label) label.innerText = m=='kids'?'وضع الأطفال 👶':'وضع الكبار 👨';
}

function searchAndExplain(){
  let input = document.getElementById('qInput');
  let q = input ? input.value.trim() : '';
  if(!q){ alert('اكتب كلمة الأول!'); return; }
  
  let answer = DICT[q] || '';
  if(!answer){
    for(let k in DICT){
      if(q.includes(k) || k.includes(q)){ answer = DICT[k]; q = k; break; }
    }
  }
  if(!answer) answer = q + ' = كلمة جديدة ⭐ مثال: I love ' + q;

  let board = document.getElementById('boardContent');
  if(board){
    board.innerHTML = '<div style="background:rgba(255,255,255,0.08);padding:16px;border-radius:12px;text-align:right;"><div style="color:#fde047;font-weight:800;font-size:1.2rem;margin-bottom:8px;">'+q+'</div><div style="line-height:1.8;white-space:pre-wrap;">'+answer+'</div><button onclick="speakText(\''+answer.replace(/'/g,'')+'\')" style="margin-top:12px;width:100%;padding:10px;background:#6366f1;color:white;border:none;border-radius:8px;">🔊 استمع</button></div>';
  }
  
  score += 5;
  let s = document.getElementById('scoreNum');
  if(s) s.innerText = score;
  
  let l = document.getElementById('learnedNum');
  if(l){
    if(!learned.includes(q)) learned.push(q);
    l.innerText = learned.length;
  }
  
  speakText(answer);
}

function speakText(t){
  try{
    speechSynthesis.cancel();
    let clean = t.replace(/[^\u0600-\u06FFa-zA-Z0-9 ]/g,' ').substring(0,150);
    let u = new SpeechSynthesisUtterance(clean);
    u.lang = /[ء-ي]/.test(clean) ? 'ar-SA' : 'en-US';
    u.rate = 0.9;
    speechSynthesis.speak(u);
  }catch(e){}
}

function speakAnswer(){
  let board = document.getElementById('boardContent');
  if(board) speakText(board.innerText);
}

function clearBoard(){
  let board = document.getElementById('boardContent');
  if(board) board.innerHTML = '<div style="text-align:center;padding:20px;"><div style="font-size:3rem;">🎓</div><p style="margin:10px 0;font-weight:700;">أهلا يا بطل!</p><p style="color:#94a3b8;font-size:0.85rem;">اكتب: مكان، تلميذ، مدرسة</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px;"><div onclick="quickSearch(\'مكان\')" style="background:rgba(255,255,255,0.08);padding:12px;border-radius:10px;cursor:pointer;">📍 مكان</div><div onclick="quickSearch(\'تلميذ\')" style="background:rgba(255,255,255,0.08);padding:12px;border-radius:10px;cursor:pointer;">🧑‍🎓 تلميذ</div></div></div>';
  let inp = document.getElementById('qInput');
  if(inp) inp.value='';
}

function quickSearch(w){
  let inp = document.getElementById('qInput');
  if(inp) inp.value = w;
  searchAndExplain();
}

function startQuiz(){
  let keys = Object.keys(DICT);
  let word = keys[Math.floor(Math.random()*keys.length)];
  let board = document.getElementById('boardContent');
  if(board) board.innerHTML = '<div style="text-align:center;"><h3>🎯 ما معنى: '+word+'؟</h3><p style="margin:12px 0;background:rgba(255,255,255,0.08);padding:12px;border-radius:10px;">'+DICT[word]+'</p><button onclick="startQuiz()" style="width:100%;padding:12px;background:#22c55e;color:white;border:none;border-radius:10px;margin-top:10px;">🔄 سؤال تاني</button><button onclick="clearBoard()" style="width:100%;padding:10px;background:#333;color:white;border:none;border-radius:10px;margin-top:8px;">🏠 رجوع</button></div>';
}

function switchTab(tab){
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  let t = document.getElementById('tab-'+tab);
  if(t) t.classList.add('active');
  if(tab=='home') clearBoard();
  if(tab=='games') startQuiz();
  if(tab=='fav'){
    let board = document.getElementById('boardContent');
    if(board) board.innerHTML = '<div style="text-align:center;padding:20px;">⭐ المفضلة<br><br>تعلمت: '+learned.length+' كلمات<br>نقاط: '+score+'</div>';
  }
}

window.onload = function(){
  setMode(localStorage.getItem('mode')||'kids');
  let total = document.getElementById('totalNum');
  if(total) total.innerText = Object.keys(DICT).length;
};
