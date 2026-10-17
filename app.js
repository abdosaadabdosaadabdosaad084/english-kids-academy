// English Kids Academy - النسخة الكاملة للبيع
const MASTER_KEY="9999";
function isLicenseValid(c){return /^888\d{3}$/.test(c);}
function checkActivation(){if(!localStorage.getItem('app_activated')){document.getElementById('license-overlay').style.display='flex';}}
function activateApp(){let code=document.getElementById('license-input').value.trim();let msg=document.getElementById('license-msg');if(code===MASTER_KEY){localStorage.setItem('app_activated','true');document.getElementById('license-overlay').style.display='none';return;}if(isLicenseValid(code)){let used=JSON.parse(localStorage.getItem('used_licenses')||'[]');if(used.includes(code)){msg.innerText='❌ الكود ده اتستخدم قبل كده';return;}used.push(code);localStorage.setItem('used_licenses',JSON.stringify(used));localStorage.setItem('app_activated','true');localStorage.setItem('app_pin',code);document.getElementById('license-overlay').style.display='none';}else{msg.innerText='❌ كود غلط - لازم يبدأ 888';}}
function generateLicense(){let n=Math.floor(100+Math.random()*900);let c="888"+n;document.getElementById('generated-code').innerText=c;document.getElementById('generated-code').style.display='block';}
let adminTaps=0;function adminTap(){adminTaps++;if(adminTaps>=5){let m=prompt('ادخل الماستر 9999');if(m===MASTER_KEY)document.getElementById('admin-panel').style.display='block';adminTaps=0;}}
function speak(t,l='en-US'){speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(t);u.lang=l;u.rate=0.8;speechSynthesis.speak(u);}
function showSection(id){document.querySelectorAll('.section-view').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');}

// ============ القاموس 400 كلمة مختصر للعرض ============
const COMPREHENSIVE_DICTIONARY=[
{en:'Apple',ar:'تفاحة'},{en:'Book',ar:'كتاب'},{en:'Cat',ar:'قطة'},{en:'Dog',ar:'كلب'},{en:'Elephant',ar:'فيل'},{en:'Fish',ar:'سمكة'},{en:'Goat',ar:'ماعز'},{en:'House',ar:'منزل'},{en:'Ice cream',ar:'ايس كريم'},{en:'Juice',ar:'عصير'},{en:'Kite',ar:'طائرة ورقية'},{en:'Lion',ar:'اسد'},{en:'Monkey',ar:'قرد'},{en:'Nest',ar:'عش'},{en:'Orange',ar:'برتقالة'},{en:'Pen',ar:'قلم'},{en:'Queen',ar:'ملكة'},{en:'Rabbit',ar:'ارنب'},{en:'Sun',ar:'شمس'},{en:'Table',ar:'طاولة'},{en:'Umbrella',ar:'شمسية'},{en:'Van',ar:'شاحنة'},{en:'Water',ar:'ماء'},{en:'Yellow',ar:'اصفر'},{en:'Zebra',ar:'حمار وحشي'},{en:'Father',ar:'أب'},{en:'Mother',ar:'أم'},{en:'Brother',ar:'أخ'},{en:'Sister',ar:'أخت'},{en:'School',ar:'مدرسة'},{en:'Teacher',ar:'معلم'},{en:'Student',ar:'طالب'},{en:'Friend',ar:'صديق'},{en:'Happy',ar:'سعيد'},{en:'Sad',ar:'حزين'},{en:'Big',ar:'كبير'},{en:'Small',ar:'صغير'},{en:'Beautiful',ar:'جميل'}
];

// ============ القواعد بالتفصيل الممل ============
function renderGrammar(){
let c=document.getElementById('grammar-container');
c.innerHTML=`
<div class="interactive-card"><h2>1- الضمائر بالتفصيل</h2>
<p style="line-height:2.2; text-align:left; direction:ltr">
<b>I</b> = أنا (للمتكلم)<br>Ex: I am Ahmed. أنا أحمد<br><br>
<b>You</b> = أنت / أنتم<br>Ex: You are smart. أنت ذكي<br><br>
<b>He</b> = هو (للولد)<br>Ex: He is my father. هو أبي<br><br>
<b>She</b> = هي (للبنت)<br>Ex: She is my mother. هي أمي<br><br>
<b>It</b> = هو/هي لغير العاقل<br>Ex: It is a cat. إنها قطة<br><br>
<b>We</b> = نحن<br>Ex: We are friends. نحن أصدقاء<br><br>
<b>They</b> = هم<br>Ex: They are students. هم طلاب
</p></div>

<div class="interactive-card"><h2>2- فعل to be (يكون) - أهم فعل</h2>
<p style="line-height:2.2; text-align:left; direction:ltr">
<b>am / is / are = يكون</b><br><br>
I <b>am</b> a boy. أنا ولد<br>
He <b>is</b> tall. هو طويل<br>
She <b>is</b> beautiful. هي جميلة<br>
It <b>is</b> small. إنه صغير<br>
You <b>are</b> kind. أنت طيب<br>
We <b>are</b> happy. نحن سعداء<br>
They <b>are</b> here. هم هنا<br><br>
<b>النفي:</b> ضيف not<br>
I am not sad. أنا لست حزين<br>
He is not here. هو ليس هنا
</p></div>

<div class="interactive-card"><h2>3- المضارع البسيط Present Simple</h2>
<p style="line-height:2.2; text-align:left; direction:ltr">
نستخدمه للعادات والحقائق<br><br>
I play football every day. ألعب كرة كل يوم<br>
She plays football. هي تلعب (نضيف s مع he/she/it)<br>
He eats breakfast at 7. هو يأكل فطار الساعة 7<br>
They go to school. هم يذهبون للمدرسة<br>
We love English. نحن نحب الإنجليزية<br><br>
<b>السؤال:</b> Do / Does<br>
Do you like apples? هل تحب التفاح؟<br>
Does she like apples? هل هي تحب التفاح؟
</p></div>

<div class="interactive-card"><h2>4- الماضي البسيط Past Simple</h2>
<p style="line-height:2.2; text-align:left; direction:ltr">
حاجة حصلت وانتهت أمس<br><br>
I <b>visited</b> my grandma yesterday. زرت جدتي أمس<br>
He <b>went</b> to school. هو ذهب (go - went)<br>
She <b>ate</b> pizza. هي أكلت (eat - ate)<br>
They <b>played</b> yesterday. لعبوا أمس<br>
We <b>were</b> happy. كنا سعداء<br><br>
<b>كلمات تدل عليه:</b> yesterday أمس, last week الأسبوع الماضي, ago منذ
</p></div>

<div class="interactive-card"><h2>5- المستقبل will</h2>
<p style="line-height:2.2; text-align:left; direction:ltr">
I <b>will</b> travel tomorrow. سوف أسافر غدا<br>
She <b>will</b> be a doctor. سوف تكون دكتورة<br>
We <b>will</b> help you. سوف نساعدك<br><br>
<b>النفي:</b> will not = won't<br>
I won't go. لن أذهب
</p></div>

<div class="interactive-card"><h2>6- أدوات التعريف a / an / the</h2>
<p style="line-height:2.2; text-align:left; direction:ltr">
<b>a</b> + كلمة تبدأ بحرف ساكن: a book كتاب, a cat قطة<br>
<b>an</b> + كلمة تبدأ بحرف متحرك (a,e,i,o,u): an apple تفاحة, an egg بيضة<br>
<b>the</b> = ال: the book الكتاب (حاجة محددة)
</p></div>
`;
}

// ============ محادثات كتير اوي اوي ============
const CONVERSATIONS=[
{title:"1- في البيت مع العائلة",d:[{s:"أب",en:"Good morning my son!",ar:"صباح الخير يا بني"},{s:"ابن",en:"Good morning dad, how are you?",ar:"صباح الخير بابا عامل ايه"},{s:"أب",en:"I am fine, did you sleep well?",ar:"انا كويس نمت كويس؟"},{s:"ابن",en:"Yes, very well",ar:"ايوه كويس جدا"}]},
{title:"2- في المدرسة",d:[{s:"مدرس",en:"Good morning class",ar:"صباح الخير يا فصل"},{s:"طلاب",en:"Good morning teacher",ar:"صباح الخير يا استاذ"},{s:"مدرس",en:"Open your books page 10",ar:"افتحوا الكتب صفحة 10"},{s:"طالب",en:"Ok teacher",ar:"حاضر يا استاذ"}]},
{title:"3- في السوبر ماركت",d:[{s:"بائع",en:"Can I help you?",ar:"اقدر اساعدك؟"},{s:"مشتري",en:"I want some apples please",ar:"عايز شوية تفاح لو سمحت"},{s:"بائع",en:"How many kilos?",ar:"كام كيلو؟"},{s:"مشتري",en:"Two kilos please",ar:"اتنين كيلو لو سمحت"}]},
{title:"4- عند الدكتور",d:[{s:"دكتور",en:"What is wrong with you?",ar:"مالك؟"},{s:"مريض",en:"I have a headache",ar:"عندي صداع"},{s:"دكتور",en:"Take this medicine",ar:"خد الدواء ده"}]},
{title:"5- في المطعم",d:[{s:"جرسون",en:"Welcome, what would you like?",ar:"اهلا تحب تاكل ايه؟"},{s:"زبون",en:"I would like chicken and rice",ar:"عايز فراخ ورز"},{s:"جرسون",en:"Anything to drink?",ar:"تحب تشرب حاجة؟"}]},
{title:"6- مع صديق",d:[{s:"احمد",en:"Where are you going?",ar:"رايح فين؟"},{s:"محمد",en:"I am going to the park",ar:"رايح الحديقة"},{s:"احمد",en:"Can I come with you?",ar:"ممكن اجي معاك؟"}]},
{title:"7- في الحديقة",d:[{s:"طفل",en:"Look, beautiful flowers!",ar:"بص ورد جميل"},{s:"ام",en:"Yes, don't touch them",ar:"ايوه متلمسهمش"}]},
{title:"8- في المواصلات",d:[{s:"راكب",en:"Does this bus go to Cairo?",ar:"الاتوبيس ده بيروح القاهرة؟"},{s:"سائق",en:"Yes, get in",ar:"ايوه اركب"}]},
{title:"9- الطقس",d:[{s:"A",en:"How is the weather today?",ar:"الجو عامل ايه النهاردة؟"},{s:"B",en:"It is very hot",ar:"حر جدا"}]},
{title:"10- التعارف",d:[{s:"A",en:"What is your name?",ar:"اسمك ايه؟"},{s:"B",en:"My name is Ali",ar:"اسمي علي"},{s:"A",en:"Nice to meet you",ar:"اتشرفت بيك"}]}
];

function renderStories(){
let c=document.getElementById('stories-container');if(!c)return;
let html='';
CONVERSATIONS.forEach(con=>{
html+=`<div class="interactive-card"><h3>${con.title}</h3>`;
con.d.forEach(x=>{
html+=`<div class="word-card" onclick="speak('${x.en}')"><div><b>${x.s}:</b> ${x.en} 🔊<br><small style="color:#06d6a0">${x.ar}</small></div></div>`;
});
html+=`</div>`;
});
c.innerHTML=html;
}

// ============ قصص إنجليزية مترجمة كتير ============
const STORIES=[
{en:"The Honest Woodcutter. Once there was a poor woodcutter. He cut trees near a river. One day his axe fell into the river. He started crying. A fairy appeared and gave him a golden axe. He said it is not mine. Then she gave him his old axe. She was happy with his honesty and gave him both axes.",ar:"الحطاب الأمين. كان هناك حطاب فقير. كان يقطع الأشجار قرب النهر. في يوم سقط فأسه في النهر. بدأ يبكي. ظهرت جنية وأعطته فأس ذهبي. قال ليس لي. ثم أعطته فأسه القديم. فرحت بأمانته وأعطته الفأسين."},
{en:"The Thirsty Crow. It was a hot summer day. A crow was very thirsty. He saw a pot with little water. He could not drink. He had an idea. He brought small stones and dropped them into the pot. The water came up. He drank and flew away happily.",ar:"الغراب العطشان. كان يوم صيف حار. كان غراب عطشان جدا. رأى إناء به ماء قليل. لم يستطع الشرب. خطرت له فكرة. أحضر حجارة صغيرة وأسقطها في الإناء. ارتفع الماء. شرب وطار سعيدا."},
{en:"The Lion and the Mouse. A big lion was sleeping. A small mouse ran over his body. The lion woke up and caught the mouse. The mouse said please forgive me. One day I will help you. The lion laughed but let him go. Later hunters caught the lion in a net. The mouse heard him and cut the net with his teeth. The lion became free.",ar:"الأسد والفأر. كان أسد كبير نائم. فأر صغير جرى فوق جسده. استيقظ الأسد وأمسك الفأر. قال الفأر سامحني من فضلك. يوما ما سأساعدك. ضحك الأسد لكنه تركه. بعد ذلك صيادون أمسكوا الأسد في شبكة. سمعه الفأر وقطع الشبكة بأسنانه. أصبح الأسد حرا."},
{en:"Two Friends and a Bear. Two friends were walking in a forest. Suddenly a bear came. One friend climbed a tree quickly. The other lay down on the ground and held his breath. The bear smelled him and thought he was dead and went away. The first friend came down and asked what did the bear tell you? He said don't trust a friend who leaves you in danger.",ar:"صديقان ودب. كان صديقان يمشيان في غابة. فجأة جاء دب. صديق تسلق شجرة بسرعة. الآخر استلقى على الأرض وكتم نفسه. شمّه الدب وظنه ميتا وذهب. نزل الأول وسأل ماذا قال لك الدب؟ قال لا تثق بصديق يتركك في الخطر."},
{en:"The Ant and the Grasshopper. In summer an ant was working hard collecting food. A grasshopper was singing and playing. The grasshopper laughed at the ant. Winter came. The grasshopper had no food and was hungry. He went to the ant and asked for food. The ant said you were singing in summer, now dance in winter.",ar:"النملة والجندب. في الصيف كانت نملة تعمل بجد تجمع طعام. كان جندب يغني ويلعب. ضحك الجندب على النملة. جاء الشتاء. لم يكن عند الجندب طعام وكان جائعا. ذهب للنملة وطلب طعام. قالت كنت تغني في الصيف، الآن ارقص في الشتاء."},
{en:"The Boy Who Cried Wolf. There was a shepherd boy. He looked after sheep near a village. He was bored and shouted Wolf! Wolf! The villagers came running to help but there was no wolf. He laughed. Next day he did it again. On the third day a real wolf came. He shouted but no one came to help him and the wolf ate his sheep.",ar:"الولد الذي صرخ ذئب. كان هناك ولد راعي. كان يرعى غنم قرب قرية. شعر بملل وصرخ ذئب ذئب. جاء أهل القرية يجرون للمساعدة لكن لم يكن هناك ذئب. ضحك. في اليوم التالي فعلها مرة أخرى. في اليوم الثالث جاء ذئب حقيقي. صرخ لكن لم يأت أحد لمساعدته وأكل الذئب غنمه."},
{en:"The Golden Goose. A farmer had a goose that laid a golden egg every day. He was greedy and thought if I cut the goose I will get all gold inside. He killed the goose but found nothing inside. He lost his goose and his daily golden egg because of greed.",ar:"الإوزة الذهبية. كان عند فلاح إوزة تبيض بيضة ذهبية كل يوم. كان طماع وفكر لو ذبحت الإوزة سآخذ كل الذهب بداخلها. قتل الإوزة لكن لم يجد شيئا بداخلها. خسر إوزته وبيضته الذهبية اليومية بسبب الطمع."},
{en:"My Daily Routine. I wake up at 6 o'clock in the morning. I brush my teeth and wash my face. I eat breakfast with my family. I go to school at 7 o'clock. I study English, Math and Science. I come back home at 2 o'clock. I eat lunch and do my homework. In the evening I play with my friends. I sleep at 9 o'clock.",ar:"روتيني اليومي. أستيقظ الساعة 6 صباحا. أغسل أسناني ووجهي. آكل الفطار مع عائلتي. أذهب للمدرسة الساعة 7. أذاكر إنجليزي ورياضة وعلوم. أعود للبيت الساعة 2. آكل الغداء وأعمل واجبي. في المساء ألعب مع أصدقائي. أنام الساعة 9."}
];

function renderAllStories(){
let c=document.getElementById('english-stories-container');if(!c)return;
let html=`<div class="interactive-card"><h2>📖 قصص إنجليزية مترجمة - كمية كبيرة</h2></div>`;
STORIES.forEach((s,i)=>{
html+=`<div class="story-card"><h3>قصة ${i+1}</h3><div class="story-en" onclick="speak('${s.en.replace(/'/g,"")}')">🔊 ${s.en}</div><div class="story-ar">${s.ar}</div><button class="btn-action" style="margin-top:10px" onclick="speak('${s.en.replace(/'/g,"")}')">🔊 اسمع القصة بالإنجليزي</button></div>`;
});
c.innerHTML=html;
}

function renderDictionary(f=''){let c=document.getElementById('dict-container');if(!c)return;let q=f.toLowerCase();let filtered=COMPREHENSIVE_DICTIONARY.filter(w=>w.en.toLowerCase().includes(q)||w.ar.includes(q));let html=`<div class="interactive-card"><h2>📚 القاموس - ابحث</h2><input type="text" value="${f}" placeholder="ابحث..." style="width:100%;padding:12px;border-radius:10px;background:#121324;color:#fff" oninput="renderDictionary(this.value)"></div>`;html+=filtered.map(w=>`<div class="word-card" onclick="speak('${w.en}')"><span class="word-en">🔊 ${w.en}</span><span class="word-ar">${w.ar}</span></div>`).join('');c.innerHTML=html;}

function startArabicTranslator(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){alert('افتح Chrome');return;}const rec=new SR();rec.lang='ar-EG';let btn=document.getElementById('btn-record-ar');let ar=document.getElementById('ar-result');let en=document.getElementById('en-result');btn.innerHTML='🎧 بسمعك...';rec.onresult=async e=>{let said=e.results[0][0].transcript;ar.innerText=said;try{let r=await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(said)}&langpair=ar|en`);let d=await r.json();let tr=d.responseData.translatedText;en.innerText=tr;speak(tr);}catch{en.innerText=said;}};rec.onend=()=>{btn.innerHTML='🎤 اضغط وتكلم عربي';};rec.start();}

setTimeout(()=>{renderDictionary();renderGrammar();renderStories();renderAllStories();checkActivation();document.getElementById('points-display').innerText='⭐ 400';},600);
