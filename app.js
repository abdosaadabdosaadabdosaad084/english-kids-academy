// PWA
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
let deferredPrompt;
window.addEventListener('beforeinstallprompt', e=>{e.preventDefault();deferredPrompt=e;document.getElementById('install-banner').style.display='flex';});
function installPWA(){if(deferredPrompt){deferredPrompt.prompt();deferredPrompt.userChoice.then(()=>{document.getElementById('install-banner').style.display='none';deferredPrompt=null;});}else{alert('من متصفح الموبايل دوس ⋮ ثم Add to Home Screen');}}

// ===== نظام البيع =====
const MASTER_KEY="9999";
function isLicenseValid(code){return /^888\d{3}$/.test(code);}
function checkActivation(){
  let activated=localStorage.getItem('app_activated');
  if(!activated){
    document.getElementById('pin-overlay').style.display='none';
    document.getElementById('license-overlay').style.display='flex';
  }else{
    document.getElementById('license-overlay').style.display='none';
  }
}
function activateApp(){
  let code=document.getElementById('license-input').value.trim();
  let msg=document.getElementById('license-msg');
  if(code===MASTER_KEY){localStorage.setItem('app_activated','true');document.getElementById('license-overlay').style.display='none';document.getElementById('admin-panel').style.display='block';return;}
  if(isLicenseValid(code)){
    let used=JSON.parse(localStorage.getItem('used_licenses')||'[]');
    if(used.includes(code)){msg.style.color='#ef4444';msg.innerText='❌ الكود اتستخدم قبل كده';return;}
    used.push(code);localStorage.setItem('used_licenses',JSON.stringify(used));
    localStorage.setItem('app_activated','true');localStorage.setItem('app_pin',code);
    document.getElementById('license-overlay').style.display='none';
    document.getElementById('first-time-change').style.display='flex';
    document.getElementById('welcome-code').innerText=code;
  }else{msg.style.color='#ef4444';msg.innerText='❌ كود غير صحيح - اطلبه من صاحب التطبيق';}
}
function setFirstPassword(){
  let v=document.getElementById('first-pin-input').value.trim();
  if(v.length>=4){localStorage.setItem('app_pin',v);document.getElementById('first-time-change').style.display='none';document.getElementById('pin-overlay').style.display='none';}
}
function getSavedPin(){return localStorage.getItem('app_pin')||"1234";}
function checkPin(){let i=document.getElementById('pin-input').value;if(i===getSavedPin()||i===MASTER_KEY){document.getElementById('pin-overlay').style.display='none';}else{document.getElementById('pin-error').style.display='block';}}
function generateLicense(){let n=Math.floor(100+Math.random()*900);let c="888"+n;document.getElementById('generated-code').innerText=c;document.getElementById('generated-code').style.display='block';let all=JSON.parse(localStorage.getItem('all_licenses')||'[]');all.push(c);localStorage.setItem('all_licenses',JSON.stringify(all));}
let adminTaps=0;
function adminTap(){adminTaps++;if(adminTaps>=5){let m=prompt('ادخل الماستر كي 9999');if(m===MASTER_KEY){document.getElementById('admin-panel').style.display='block';}adminTaps=0;}}
function changePin(){let v=document.getElementById('new-pin-input').value.trim();let msg=document.getElementById('change-pin-msg');if(v.length>=4){localStorage.setItem('app_pin',v);msg.style.color='#22c55e';msg.innerText='✅ تم';}else{msg.innerText='❌ لازم 4 أرقام';}}

// عام
function speak(t,lang='en-US'){if('speechSynthesis' in window){speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(t);u.lang=lang;u.rate=0.85;speechSynthesis.speak(u);}}
let curCode=65;let points=parseInt(localStorage.getItem('user_points')||'0');
setTimeout(()=>{let p=document.getElementById('points-display');if(p)p.innerText=`⭐ ${points} نقطة`;let s=document.getElementById('share-link');if(s)s.innerText=location.href;checkActivation();},500);
function addPoints(n){points+=n;localStorage.setItem('user_points',points);document.getElementById('points-display').innerText=`⭐ ${points} نقطة`;}
function showSection(id){document.querySelectorAll('.section-view').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');window.scrollTo(0,0);}

// قاموس ضخم
const COMPREHENSIVE_DICTIONARY=[
{en:'Apple',ar:'تفاحة',example:'I eat an apple.'},{en:'Ant',ar:'نملة',example:'The ant is small.'},{en:'Airplane',ar:'طائرة',example:'Airplane flies.'},{en:'Arm',ar:'ذراع',example:'Raise your arm.'},{en:'Animal',ar:'حيوان',example:'Lion is animal.'},{en:'Actor',ar:'ممثل',example:'Famous actor.'},{en:'Angel',ar:'ملاك',example:'Angel in sky.'},{en:'Apricot',ar:'مشمش',example:'Sweet apricot.'},{en:'Avocado',ar:'أفوكادو',example:'Green avocado.'},{en:'Airport',ar:'مطار',example:'Go to airport.'},
{en:'Ball',ar:'كرة',example:'Red ball.'},{en:'Boy',ar:'ولد',example:'Boy plays.'},{en:'Book',ar:'كتاب',example:'Interesting book.'},{en:'Bird',ar:'طائر',example:'Bird sings.'},{en:'Bus',ar:'باص',example:'Big bus.'},{en:'Banana',ar:'موز',example:'Yellow banana.'},{en:'Bread',ar:'خبز',example:'Fresh bread.'},{en:'Baby',ar:'رضيع',example:'Baby sleeps.'},{en:'Beach',ar:'شاطئ',example:'Beach is fun.'},{en:'Bear',ar:'دب',example:'Strong bear.'},{en:'Bed',ar:'سرير',example:'Sleep on bed.'},{en:'Bee',ar:'نحلة',example:'Bee makes honey.'},{en:'Bell',ar:'جرس',example:'Ring the bell.'},{en:'Bike',ar:'دراجة',example:'Ride a bike.'},{en:'Bank',ar:'بنك',example:'Go to bank.'},
{en:'Cat',ar:'قطة',example:'Cute cat.'},{en:'Car',ar:'سيارة',example:'Fast car.'},{en:'Cake',ar:'كيكة',example:'Sweet cake.'},{en:'Chair',ar:'كرسي',example:'Sit on chair.'},{en:'Clock',ar:'ساعة حائط',example:'Clock ticks.'},{en:'Cloud',ar:'سحابة',example:'White cloud.'},{en:'Cow',ar:'بقرة',example:'Cow gives milk.'},{en:'Cup',ar:'كوب',example:'Cup of tea.'},{en:'Computer',ar:'كمبيوتر',example:'Use computer.'},{en:'Chicken',ar:'دجاجة',example:'Chicken egg.'},{en:'Camera',ar:'كاميرا',example:'Take photo.'},{en:'Candy',ar:'حلوى',example:'Sweet candy.'},{en:'Castle',ar:'قلعة',example:'Big castle.'},{en:'Class',ar:'فصل',example:'Class has students.'},
{en:'Dog',ar:'كلب',example:'Loyal dog.'},{en:'Door',ar:'باب',example:'Open door.'},{en:'Doctor',ar:'طبيب',example:'Doctor helps.'},{en:'Duck',ar:'بطة',example:'Duck swims.'},{en:'Desk',ar:'مكتب',example:'Book on desk.'},{en:'Dress',ar:'فستان',example:'Pretty dress.'},{en:'Dolphin',ar:'دولفين',example:'Smart dolphin.'},{en:'Donkey',ar:'حمار',example:'Donkey carries.'},{en:'Dragon',ar:'تنين',example:'Dragon story.'},{en:'Dream',ar:'حلم',example:'Beautiful dream.'},
{en:'Elephant',ar:'فيل',example:'Huge elephant.'},{en:'Egg',ar:'بيضة',example:'Egg is healthy.'},{en:'Eye',ar:'عين',example:'See with eye.'},{en:'Ear',ar:'أذن',example:'Hear with ear.'},{en:'Earth',ar:'أرض',example:'Earth is planet.'},{en:'East',ar:'شرق',example:'Sun east.'},{en:'Eggplant',ar:'باذنجان',example:'Purple eggplant.'},{en:'Engineer',ar:'مهندس',example:'Engineer builds.'},{en:'Evening',ar:'مساء',example:'Good evening.'},{en:'Eagle',ar:'نسر',example:'Eagle flies high.'},
{en:'Fish',ar:'سمكة',example:'Fish swims.'},{en:'Flower',ar:'زهرة',example:'Pretty flower.'},{en:'Family',ar:'عائلة',example:'My family.'},{en:'Father',ar:'أب',example:'My father.'},{en:'Flag',ar:'علم',example:'Egypt flag.'},{en:'Food',ar:'طعام',example:'Delicious food.'},{en:'Forest',ar:'غابة',example:'Green forest.'},{en:'Friend',ar:'صديق',example:'Best friend.'},{en:'Fruit',ar:'فاكهة',example:'Fresh fruit.'},{en:'Farm',ar:'مزرعة',example:'Farm has animals.'},
{en:'Goat',ar:'ماعز',example:'Goat eats.'},{en:'Girl',ar:'بنت',example:'Girl studies.'},{en:'Garden',ar:'حديقة',example:'Garden flowers.'},{en:'Gift',ar:'هدية',example:'Nice gift.'},{en:'Glass',ar:'كوب زجاج',example:'Glass water.'},{en:'Gold',ar:'ذهب',example:'Gold expensive.'},{en:'Grape',ar:'عنب',example:'Sweet grape.'},{en:'Guitar',ar:'جيتار',example:'Play guitar.'},{en:'Gate',ar:'بوابة',example:'Close gate.'},{en:'Glove',ar:'قفاز',example:'Warm glove.'},
{en:'House',ar:'بيت',example:'Big house.'},{en:'Horse',ar:'حصان',example:'Fast horse.'},{en:'Hat',ar:'قبعة',example:'Wear hat.'},{en:'Hand',ar:'يد',example:'Wash hand.'},{en:'Head',ar:'رأس',example:'My head.'},{en:'Heart',ar:'قلب',example:'Heart beats.'},{en:'Hill',ar:'تل',example:'Climb hill.'},{en:'Honey',ar:'عسل',example:'Sweet honey.'},{en:'Hospital',ar:'مستشفى',example:'Go hospital.'},{en:'Hotel',ar:'فندق',example:'Stay hotel.'},
{en:'Ice',ar:'ثلج',example:'Cold ice.'},{en:'Island',ar:'جزيرة',example:'Island sea.'},{en:'Iron',ar:'حديد',example:'Strong iron.'},{en:'Ink',ar:'حبر',example:'Pen ink.'},{en:'Ice cream',ar:'آيس كريم',example:'Yummy ice cream.'},{en:'Idea',ar:'فكرة',example:'Good idea.'},{en:'Internet',ar:'إنترنت',example:'Use internet.'},{en:'Insect',ar:'حشرة',example:'Small insect.'},
{en:'Juice',ar:'عصير',example:'Orange juice.'},{en:'Jacket',ar:'جاكيت',example:'Warm jacket.'},{en:'Jet',ar:'نفاثة',example:'Fast jet.'},{en:'Job',ar:'وظيفة',example:'My job.'},{en:'Jungle',ar:'أدغال',example:'Jungle animals.'},{en:'Jam',ar:'مربى',example:'Strawberry jam.'},
{en:'Kite',ar:'طائرة ورقية',example:'Fly kite.'},{en:'King',ar:'ملك',example:'King crown.'},{en:'Key',ar:'مفتاح',example:'Open with key.'},{en:'Kangaroo',ar:'كنغر',example:'Kangaroo jumps.'},{en:'Kitchen',ar:'مطبخ',example:'Cook kitchen.'},{en:'Kitten',ar:'قطة صغيرة',example:'Cute kitten.'},{en:'Kiwi',ar:'كيوي',example:'Kiwi fruit.'},
{en:'Lion',ar:'أسد',example:'Lion king.'},{en:'Lamp',ar:'مصباح',example:'Lamp light.'},{en:'Leaf',ar:'ورقة شجر',example:'Green leaf.'},{en:'Lemon',ar:'ليمون',example:'Sour lemon.'},{en:'Library',ar:'مكتبة',example:'Read library.'},{en:'Lake',ar:'بحيرة',example:'Lake water.'},{en:'Laptop',ar:'لابتوب',example:'My laptop.'},{en:'Ladder',ar:'سلم',example:'Climb ladder.'},
{en:'Monkey',ar:'قرد',example:'Monkey climbs.'},{en:'Moon',ar:'قمر',example:'Moon night.'},{en:'Mouse',ar:'فأر',example:'Small mouse.'},{en:'Mother',ar:'أم',example:'My mother.'},{en:'Milk',ar:'لبن',example:'Drink milk.'},{en:'Mango',ar:'مانجو',example:'Sweet mango.'},{en:'Map',ar:'خريطة',example:'Map place.'},{en:'Market',ar:'سوق',example:'Go market.'},{en:'Mountain',ar:'جبل',example:'High mountain.'},{en:'Music',ar:'موسيقى',example:'Listen music.'},
{en:'Nest',ar:'عش',example:'Bird nest.'},{en:'Nose',ar:'أنف',example:'Smell nose.'},{en:'Nurse',ar:'ممرضة',example:'Nurse helps.'},{en:'Night',ar:'ليل',example:'Dark night.'},{en:'Name',ar:'اسم',example:'My name.'},{en:'North',ar:'شمال',example:'North cold.'},{en:'Number',ar:'رقم',example:'Phone number.'},{en:'Nut',ar:'مكسرات',example:'Eat nut.'},
{en:'Orange',ar:'برتقال',example:'Orange juice.'},{en:'Ocean',ar:'محيط',example:'Big ocean.'},{en:'Octopus',ar:'أخطبوط',example:'Octopus arms.'},{en:'Owl',ar:'بومة',example:'Owl night.'},{en:'Office',ar:'مكتب',example:'Work office.'},{en:'Oven',ar:'فرن',example:'Bake oven.'},{en:'Olive',ar:'زيتون',example:'Green olive.'},
{en:'Pen',ar:'قلم',example:'Write pen.'},{en:'Panda',ar:'باندا',example:'Panda bamboo.'},{en:'Pizza',ar:'بيتزا',example:'Yummy pizza.'},{en:'Parrot',ar:'ببغاء',example:'Parrot talks.'},{en:'Pencil',ar:'قلم رصاص',example:'Draw pencil.'},{en:'Piano',ar:'بيانو',example:'Play piano.'},{en:'Potato',ar:'بطاطس',example:'Fried potato.'},{en:'Pilot',ar:'طيار',example:'Pilot flies.'},{en:'Police',ar:'شرطة',example:'Police helps.'},
{en:'Queen',ar:'ملكة',example:'Queen crown.'},{en:'Rabbit',ar:'أرنب',example:'Rabbit jumps.'},{en:'Rain',ar:'مطر',example:'Rain falls.'},{en:'River',ar:'نهر',example:'Nile river.'},{en:'Road',ar:'طريق',example:'Long road.'},{en:'Robot',ar:'روبوت',example:'Robot helps.'},{en:'Rose',ar:'وردة',example:'Red rose.'},{en:'Rocket',ar:'صاروخ',example:'Rocket space.'},
{en:'Sun',ar:'شمس',example:'Sun light.'},{en:'Star',ar:'نجمة',example:'Star night.'},{en:'School',ar:'مدرسة',example:'Go school.'},{en:'Ship',ar:'سفينة',example:'Ship sea.'},{en:'Snake',ar:'ثعبان',example:'Snake crawls.'},{en:'Sister',ar:'أخت',example:'My sister.'},{en:'Sky',ar:'سماء',example:'Blue sky.'},{en:'Snow',ar:'ثلج',example:'White snow.'},{en:'Shop',ar:'محل',example:'Go shop.'},{en:'Table',ar:'طاولة',example:'On table.'},{en:'Tiger',ar:'نمر',example:'Strong tiger.'},{en:'Teacher',ar:'معلم',example:'Teacher explains.'},{en:'Train',ar:'قطار',example:'Fast train.'},{en:'Tree',ar:'شجرة',example:'Big tree.'},{en:'Turtle',ar:'سلحفاة',example:'Slow turtle.'},{en:'Tomato',ar:'طماطم',example:'Red tomato.'},{en:'Umbrella',ar:'شمسية',example:'Rain umbrella.'},{en:'Unicorn',ar:'يونيكورن',example:'Magic unicorn.'},{en:'Van',ar:'عربة',example:'Van delivers.'},{en:'Vase',ar:'مزهرية',example:'Flowers vase.'},{en:'Violin',ar:'كمان',example:'Play violin.'},{en:'Village',ar:'قرية',example:'Small village.'},{en:'Volcano',ar:'بركان',example:'Volcano erupts.'},{en:'Water',ar:'ماء',example:'Drink water.'},{en:'Whale',ar:'حوت',example:'Big whale.'},{en:'Window',ar:'شباك',example:'Open window.'},{en:'Wolf',ar:'ذئب',example:'Wolf howls.'},{en:'Watermelon',ar:'بطيخ',example:'Sweet watermelon.'},{en:'Xylophone',ar:'إكسيليفون',example:'Play xylophone.'},{en:'Yellow',ar:'أصفر',example:'Yellow color.'},{en:'Yacht',ar:'يخت',example:'Yacht sea.'},{en:'Yogurt',ar:'زبادي',example:'Eat yogurt.'},{en:'Year',ar:'سنة',example:'New year.'},{en:'Zebra',ar:'حمار وحشي',example:'Zebra stripes.'},{en:'Zoo',ar:'حديقة حيوان',example:'Zoo animals.'},{en:'Zero',ar:'صفر',example:'Zero number.'}
];

function renderDictionary(f=''){
 let c=document.getElementById('dict-container');if(!c)return;
 let q=f.toLowerCase().trim();
 let filtered=COMPREHENSIVE_DICTIONARY.filter(w=>w.en.toLowerCase().includes(q)||w.ar.includes(q)).slice(0,120);
 let html=`<div class="interactive-card"><h2>📚 القاموس - ${COMPREHENSIVE_DICTIONARY.length} كلمة</h2><p style="color:#aaa">كل حرف له مئات الكلمات - ابحث بأي حرف</p><input type="text" value="${f}" placeholder="🔍 ابحث A او تفاحة..." style="width:100%;padding:18px;border-radius:14px;border:2px solid #06d6a0;background:#0f0f2a;color:#fff;font-size:1.15rem" oninput="renderDictionary(this.value)"><p style="color:#aaa;margin-top:10px">عرض ${filtered.length} نتيجة</p></div>`;
 html+=filtered.map(w=>`<div class="word-card" onclick="speak('${w.en}')"><div style="display:flex;justify-content:space-between"><span style="color:#06d6a0;font-weight:bold;font-size:1.25rem">🔊 ${w.en}</span><span style="color:#facc15;font-size:1.15rem">${w.ar}</span></div><div style="color:#aaa;margin-top:6px">💬 ${w.example}</div></div>`).join('');
 c.innerHTML=html;
}
function renderGrammar(){
 let c=document.getElementById('grammar-container');if(!c)return;
 c.innerHTML=`
 <div class="interactive-card" style="border-right:6px solid #facc15"><h1>📖 القواعد بالتفصيل الممل</h1></div>
 <div class="interactive-card"><h2 style="color:#06d6a0">1️⃣ الضمائر بالتفصيل</h2><p style="line-height:2.2">ضمائر الفاعل: I أنا, He هو, She هي, It هو لغير العاقل, We نحن, You أنت, They هم<br>مثال: I am a student. He is my father. They are playing.<br><br>ضمائر المفعول: me, him, her, it, us, you, them<br>مثال: The teacher called me. I saw him.<br><br>صفات الملكية: my كتابي, his كتابه, her كتابها, our كتابنا<br>مثال: This is my book. This is his car.</p><button class="stage-btn" onclick="speak('I am a student. He is my father. The teacher called me.')">🔊 استماع</button></div>
 <div class="interactive-card"><h2 style="color:#06d6a0">2️⃣ المضارع البسيط</h2><p style="line-height:2.2">للعادات والحقائق: I play football every day. The sun rises in the east.<br>مع He/She/It نضيف s: He plays, She drinks<br>النفي: I don't like fish. He doesn't play.<br>السؤال: Do you speak English? Does he work?</p></div>
 <div class="interactive-card"><h2 style="color:#06d6a0">3️⃣ الماضي البسيط</h2><p style="line-height:2.2">حدث انتهى: I visited Cairo yesterday.<br>الأفعال الشاذة: go-went, eat-ate, see-saw<br>النفي: didn't + مصدر<br>السؤال: Did you visit?</p></div>
 <div class="interactive-card"><h2 style="color:#06d6a0">4️⃣ المستقبل و If</h2><p style="line-height:2.2">will + مصدر: I will travel tomorrow.<br>If + مضارع, will + مصدر: If you study, you will succeed.</p></div>
 <div class="interactive-card"><h2 style="color:#06d6a0">5️⃣ الأفعال الناقصة والمبني للمجهول</h2><p style="line-height:2.2">can, must, should + مصدر<br>You must study. You can swim.<br>المبني للمجهول: The book was written.</p></div>`;
}
const CONVERSATIONS=[
{title:"1- في البيت",d:[{s:"أب",en:"Good morning! Did you sleep well?",ar:"صباح الخير! نمت كويس؟"},{s:"ابن",en:"Yes dad, I slept very well.",ar:"نعم يا أبي نمت جيدا."},{s:"أب",en:"Have you done homework?",ar:"عملت الواجب؟"},{s:"ابن",en:"Yes, English homework.",ar:"نعم واجب الإنجليزي."}]},
{title:"2- في المدرسة",d:[{s:"مدرس",en:"Open your books page ten.",ar:"افتحوا الكتب صفحة 10."},{s:"طالب",en:"Sorry, I forgot my book.",ar:"آسف نسيت كتابي."},{s:"مدرس",en:"Share with your friend.",ar:"شارك مع صديقك."}]},
{title:"3- سوبرماركت",d:[{s:"بائع",en:"How can I help you?",ar:"كيف أساعدك؟"},{s:"زبون",en:"I need milk and bread.",ar:"أحتاج لبن وخبز."},{s:"بائع",en:"Total ten pounds.",ar:"الحساب عشرة جنيه."}]},
{title:"4- عند الطبيب",d:[{s:"طبيب",en:"What is problem?",ar:"ما المشكلة؟"},{s:"مريض",en:"I have headache.",ar:"عندي صداع."},{s:"طبيب",en:"Take medicine.",ar:"خذ الدواء."}]},
{title:"5- في المطار",d:[{s:"ظابط",en:"Passport please?",ar:"جواز السفر؟"},{s:"مسافر",en:"Here you are.",ar:"تفضل."},{s:"ظابط",en:"Where are you going?",ar:"رايح فين؟"},{s:"مسافر",en:"To London.",ar:"إلى لندن."}]},
{title:"6- مع صديق",d:[{s:"علي",en:"Let's play football?",ar:"نلعب كرة؟"},{s:"عمر",en:"Great! At 5?",ar:"رائع الساعة 5؟"},{s:"علي",en:"Yes in garden.",ar:"نعم في الحديقة."}]},
{title:"7- مطعم",d:[{s:"جرسون",en:"What would you like?",ar:"ماذا تود؟"},{s:"زبون",en:"Chicken and rice.",ar:"دجاج وأرز."},{s:"جرسون",en:"Any drink?",ar:"أي مشروب؟"},{s:"زبون",en:"Water please.",ar:"ماء من فضلك."}]},
{title:"8- السؤال عن الطريق",d:[{s:"رجل",en:"Where is hospital?",ar:"أين المستشفى؟"},{s:"سيدة",en:"Go straight then left.",ar:"امشي على طول ثم شمال."}]},
{title:"9- محل ملابس",d:[{s:"بائع",en:"What size?",ar:"ما المقاس؟"},{s:"مشتري",en:"Medium, how much?",ar:"متوسط بكم؟"},{s:"بائع",en:"Twenty dollars.",ar:"عشرون دولار."}]},
{title:"10- عيد ميلاد",d:[{s:"صديق",en:"Happy birthday! Gift for you.",ar:"عيد ميلاد سعيد! هدية لك."},{s:"أنت",en:"Wow thank you!",ar:"واو شكرا!"}]}
];
function renderStories(){let c=document.getElementById('stories-container');if(!c)return;c.innerHTML=CONVERSATIONS.map(con=>`<div class="interactive-card" style="border-right:5px solid #8b5cf6"><h3 style="color:var(--y)">${con.title}</h3><div style="display:flex;flex-direction:column;gap:10px;margin-top:12px">${con.d.map(x=>`<div style="background:#13132a;padding:14px;border-radius:14px;cursor:pointer" onclick="speak('${x.en}')"><b style="color:#06d6a0">${x.s}:</b><div style="font-size:1.15rem;margin:5px 0">" ${x.en} " 🔊</div><small style="color:#aaa">${x.ar}</small></div>`).join('')}</div></div>`).join('');}
function generateInfiniteQuestion(){let b=document.getElementById('quiz-box');if(!b)return;let w=COMPREHENSIVE_DICTIONARY[Math.floor(Math.random()*COMPREHENSIVE_DICTIONARY.length)];let opts=[...COMPREHENSIVE_DICTIONARY.filter(x=>x.en!==w.en).sort(()=>0.5-Math.random()).slice(0,3),w].sort(()=>0.5-Math.random());b.innerHTML=`<h2 style="color:var(--y)">🎮 لعبة</h2><button class="btn-action" style="background:#7c3aed;font-size:1.4rem" onclick="speak('${w.en}')">🔊 ${w.en}</button><div style="margin-top:12px">${opts.map(o=>`<button class="btn-action" style="background:#252550;width:100%;margin:6px 0" onclick="if('${o.en}'==='${w.en}'){speak('Excellent');addPoints(10);}setTimeout(generateInfiniteQuestion,600)">${o.ar}</button>`).join('')}</div>`;setTimeout(()=>speak(w.en),400);}

// سبورة LTR
const abc=document.getElementById('alphabet-container');
if(abc){for(let i=65;i<=90;i++){let ch=String.fromCharCode(i);let d=document.createElement('div');d.className='letter-card';d.innerText=ch;d.onclick=()=>{curCode=i;document.getElementById('current-letter-title').innerText=`✏️ سبورة الرسم (الحرف: ${ch})`;speak(ch);clearCanvas();};abc.appendChild(d);}}
function nextLetter(){curCode++;if(curCode>90)curCode=65;let ch=String.fromCharCode(curCode);document.getElementById('current-letter-title').innerText=`✏️ سبورة الرسم (الحرف: ${ch})`;speak(ch);clearCanvas();}
let canvas=document.getElementById('draw-canvas');let ctx=canvas?canvas.getContext('2d'):null;
function clearCanvas(){if(!canvas||!ctx)return;let ch=String.fromCharCode(curCode);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle="#000";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.font="bold 130px Arial";ctx.fillStyle="rgba(255,255,255,0.15)";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(ch,canvas.width/2,canvas.height/2);}
if(canvas){let dr=false;let sd=e=>{dr=true;draw(e);};let ed=()=>{dr=false;ctx.beginPath();};let draw=e=>{if(!dr)return;e.preventDefault();let r=canvas.getBoundingClientRect();let x=(e.touches?e.touches[0].clientX:e.clientX)-r.left;let y=(e.touches?e.touches[0].clientY:e.clientY)-r.top;ctx.lineWidth=14;ctx.lineCap='round';ctx.strokeStyle='#06d6a0';ctx.lineTo(x,y);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y);};canvas.addEventListener('mousedown',sd);canvas.addEventListener('mouseup',ed);canvas.addEventListener('mousemove',draw);canvas.addEventListener('touchstart',sd);canvas.addEventListener('touchend',ed);canvas.addEventListener('touchmove',draw);}

function startArabicTranslator(){
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){alert('افتح Chrome');return;}
 const rec=new SR();rec.lang='ar-EG';rec.interimResults=false;
 let btn=document.getElementById('btn-record-ar');let ar=document.getElementById('ar-result');let en=document.getElementById('en-result');
 btn.innerHTML='🎧 بسمعك...';btn.style.background='#facc15';btn.style.color='#000';
 rec.onresult=async e=>{let said=e.results[0][0].transcript;ar.innerText=said;btn.innerHTML='⏳ بترجم...';try{let r=await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(said)}&langpair=ar|en`);let d=await r.json();let tr=d.responseData.translatedText||said;en.innerText=tr;speak(tr,'en-US');addPoints(10);}catch{en.innerText=said;speak(said,'en-US');}btn.innerHTML='🎤 اضغط وتكلم عربي';btn.style.background='#ef4444';btn.style.color='#fff';};
 rec.onerror=()=>{btn.innerHTML='🎤 اضغط وتكلم عربي';btn.style.background='#ef4444';};rec.onend=()=>{btn.innerHTML='🎤 اضغط وتكلم عربي';btn.style.background='#ef4444';btn.style.color='#fff';};rec.start();
}
function similarity(a,b){a=a.toLowerCase().trim();b=b.toLowerCase().trim();if(a===b)return 100;if(a.includes(b)||b.includes(a))return 85;return 40;}
function startHearoRec(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){alert('Chrome');return;}const rec=new SR();rec.lang='en-US';let r=document.getElementById('result');if(r){r.innerHTML='🎤 اسمعك...';r.style.color='#facc15';}rec.onresult=e=>{let said=e.results[0][0].transcript.toLowerCase().trim();let target=(document.getElementById('word')?.innerText||'hello').toLowerCase().trim();let sc=similarity(said,target);if(!r)return;if(sc>=80){r.innerHTML=`✅ ممتاز ${sc}%<br>"${said}"`;r.style.color='#22c55e';speak('Excellent! '+target);addPoints(20);}else{r.innerHTML=`❌ ${sc}%<br>قلت: "${said}"<br>الصح: "${target}"`;r.style.color='#ef4444';setTimeout(()=>speak(target),500);}};rec.start();}
setTimeout(()=>{renderDictionary();renderGrammar();renderStories();generateInfiniteQuestion();if(canvas)clearCanvas();},700);
