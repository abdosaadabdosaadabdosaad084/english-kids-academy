// ==========================================
// 1. قاعدة البيانات الداخلية (الشرح بالتفصيل الممل)
// ==========================================

const appData = {
    grammar: `
        <div class="lesson-card">
            <h2>1. زمن المضارع البسيط (Present Simple Tense) - بالتفصيل</h2>
            <p class="meta-info">مستوى: مبتدئ إلى متوسط | الاستخدام: يومي</p>
            
            <h3>شرح المفهوم والاستخدام العام:</h3>
            <p>يُستخدم المضارع البسيط للتعبير عن ثلاثة أشياء أساسية لا غنى عنها في الحديث اليومي:</p>
            <ul>
                <li><strong>العادات والتكرار (Habits & Routines):</strong> أفعال تقوم بها بانتظام (مثل الاستيقاظ، العمل، القراءة).</li>
                <li><strong>الحقائق الثابتة (General Facts / Truths):</strong> قوانين علمية أو حقائق شخصية لا تتغير بسرعة (مثل دوران الأرض، مكان السكن).</li>
                <li><strong>المواعيد المجدولة ثابتة (Timetables):</strong> مواعيد القطارات، الطائرات، أو بدء الحصص والمباريات.</li>
            </ul>

            <h3>الصيغة والتركيب البرمجي للجملة (Form):</h3>
            <div class="formula-box">
                <p><strong>مع الضمائر (I, We, They, You) والأسماء الجمع:</strong><br>Subject + Verb (in infinitive / مصدر بدون إضافات)</p>
                <p><strong>مع الضمائر (He, She, It) والأسماء المفرد:</strong><br>Subject + Verb + (s / es / ies)</p>
            </div>

            <h3>قواعد إضافة الـ (s) للفعل مع المفرد:</h3>
            <ol>
                <li>إذا انتهى الفعل بـ (ch, sh, ss, x, o, z) نضيف <strong>es</strong> مثل: <em>Watch -> Watches</em> | <em>Go -> Goes</em>.</li>
                <li>إذا انتهى الفعل بحرف ساكن يليه حرف (y)، نحذف الـ (y) ونضع <strong>ies</strong> مثل: <em>Cry -> Cries</em>.</li>
                <li>باقي الأفعال العادية تأخذ <strong>s</strong> فقط مثل: <em>Play -> Plays</em> (الحرف قبل y متحرك فلا يحذف).</li>
            </ol>

            <h3>صيغة النفي (Negative Form):</h3>
            <p>نستخدم الأفعال المساعدة المحددة للنفي مع إعادة الفعل الأصلي للمصدر عارياً تماماً:</p>
            <ul>
                <li><strong>Don't (Do not):</strong> تأتي مع (I, We, They, You). مثال: <em>I don't like coffee.</em></li>
                <li><strong>Doesn't (Does not):</strong> تأتي مع (He, She, It). مثال: <em>He doesn't play tennis.</em> (لاحظ حذف الـ s من play).</li>
            </ul>

            <h3>صيغة السؤال (Question Form):</h3>
            <p>1. أسئلة نعم/لا (Yes/No Questions): نضع Do أو Does في بداية الجملة:</p>
            <p class="example"><strong>Does</strong> he live here? -> Yes, he does. / No, he doesn't.</p>
            <p>2. أسئلة أداة الاستفهام (Wh- Questions): أداة الاستفهام + Do/Does + الفاعل + المصدر:</p>
            <p class="example">Where <strong>do</strong> you work?</p>

            <h3>الكلمات الدالة (Keywords / Adverbs of Frequency):</h3>
            <p>تأتي عادةً قبل الفعل الأساسي وبعد فعل (to be):<br>
            Always (دائماً) | Usually (عادةً) | Often (غالباً) | Sometimes (أحياناً) | Never (أبداً) | Every day/week (كل يوم/أسبوع).</p>
        </div>

        <div class="lesson-card">
            <h2>2. زمن الماضي البسيط (Past Simple Tense) - بالتفصيل</h2>
            <p class="meta-info">مستوى: مبتدئ | الاستخدام: سرد الأحداث والقصص</p>
            
            <h3>الاستخدام الأساسي:</h3>
            <p>يُستخدم حصرياً للتعبير عن حدث <strong>بدأ وانتهى تماماً في وقت محدد بالماضي</strong>. لا علاقة له بالحاضر مطلقاً.</p>

            <h3>التركيب والصياغة (Form):</h3>
            <div class="formula-box">
                <p>Subject + Second Form of Verb (التصريف الثاني للفعل)</p>
            </div>

            <h3>أنواع الأفعال في الماضي:</h3>
            <ul>
                <li><strong>أفعال منتظمة (Regular Verbs):</strong> نضيف لها (ed) أو (d) أو (ied). مثال: <em>Walk -> Walked</em> | <em>Study -> Studied</em>.</li>
                <li><strong>أفعال شاذة (Irregular Verbs):</strong> تحفظ كما هي وتتغير تماماً. مثال: <em>Go -> Went</em> | <em>Buy -> Bought</em> | <em>See -> Saw</em>.</li>
            </ul>

            <h3>النفي والسؤال في الماضي:</h3>
            <p>نستخدم الفعل المساعد الوحيد للماضي وهو <strong>Did</strong>، مع تذكر القاعدة الذهبية: (عند ظهور Did أو Didn't يرجع الفعل للتصريف الأول فوراً).</p>
            <ul>
                <li><strong>النفي:</strong> Subject + didn't + Verb (Infinitive) -> <em>She didn't write the report.</em> (وليس wrote).</li>
                <li><strong>السؤال:</strong> Did + Subject + Verb (Infinitive)? -> <em>Did you see the eclipse yesterday?</em></li>
            </ul>
        </div>
    `,

    conversations: `
        <div class="convo-section">
            <h2>محادثة 1: في المطار وإنهاء إجراءات السفر (At the Airport)</h2>
            <p class="context-desc">الحوار يدور بين مسافر (Passenger) وموظف كاونتر شركة الطيران (Agent).</p>
            
            <div class="chat-container">
                <div class="bubble agent"><strong>Agent:</strong> Good morning! Welcome to International Airlines. May I have your passport and ticket, please?</div>
                <div class="translation">صباح الخير! مرحباً بكم في الخطوط الدولية. هل يمكنني الحصول على جواز سفرك وتذكرتك من فضلك؟</div>

                <div class="bubble passenger"><strong>Passenger:</strong> Good morning. Yes, of course. Here you go. I am flying to London today.</div>
                <div class="translation">صباح الخير. نعم بالطبع. تفضل. أنا مسافر إلى لندن اليوم.</div>

                <div class="bubble agent"><strong>Agent:</strong> Great. Are you checking any bags today, sir?</div>
                <div class="translation">ممتاز. هل ستقوم بشحن أي حقائب اليوم يا سيدي؟</div>

                <div class="bubble passenger"><strong>Passenger:</strong> Yes, just this one suitcase. And I have this backpack as carry-on luggage.</div>
                <div class="translation">نعم، هذه الحقيبة الكبيرة فقط. ومعي حقيبة الظهر هذه كأمتعة يدوية للمقصورة.</div>

                <div class="bubble agent"><strong>Agent:</strong> Please place your suitcase on the scale... Okay, the weight is perfect. Would you prefer a window seat or an aisle seat?</div>
                <div class="translation">رجاءً ضع حقيبتك على الميزان... حسناً، الوزن مثالي. هل تفضل مقعداً بجانب النافذة أم بجانب الممر؟</div>

                <div class="bubble passenger"><strong>Passenger:</strong> I would prefer a window seat if one is still available, please.</div>
                <div class="translation">أفضل مقعداً بجانب النافذة إذا كان لا يزال متاحاً، من فضلك.</div>

                <div class="bubble agent"><strong>Agent:</strong> Yes, we have one. Here is your boarding pass. Your flight departs from Gate 14B at 10:30 AM. Have a wonderful flight!</div>
                <div class="translation">نعم، لدينا مقعد متاح. إليك بطاقة صعود الطائرة. رحلتك تغادر من بوابة 14B في تمام الساعة 10:30 صباحاً. نتمنى لك رحلة رائعة!</div>

                <div class="bubble passenger"><strong>Passenger:</strong> Thank you very much for your assistance. Have a nice day!</div>
                <div class="translation">شكراً جزيلاً لك على مساعدتك. يومك سعيد!</div>
            </div>
        </div>
    `,

    stories: `
        <div class="story-container">
            <h2>قصة 1: درس في الحياة (The Secret of True Wealth)</h2>
            <div class="text-block eng" dir="ltr">
                <p>Once upon a time, a very wealthy man took his young son on a trip to a poor village. His purpose was to show his son how poor people could be, so he would appreciate their immense riches more.</p>
                <p>They spent a few days and nights living on the farm of what considered a very poor family. On their return from the trip, the father asked his son, "How was the trip? Did you see how poor they are?"</p>
                <p>The boy replied, "Yes dad, I saw it." The father asked, "So, what did you learn from the trip?"</p>
                <p>The son answered: "I saw that we have one dog, and they have four. We have a swimming pool that reaches the middle of our garden, and they have a creek that has no end. We have imported lanterns in our garden, and they have the stars at night. Our patio reaches to the front yard, and they have the whole horizon."</p>
                <p>The boy's father was completely speechless. Then his son added, "Thank you, dad, for showing me how poor we actually are!"</p>
            </div>
            
            <div class="text-block arb">
                <h3>الترجمة إلى العربية:</h3>
                <p>في أحد الأيام، أخذ رجل ثري جداً ابنه الصغير في رحلة إلى قرية فقيرة. كان هدفه أن يري ابنه كيف يمكن أن يكون الناس فقراء، حتى يقدر ثروتهم الهائلة بشكل أكبر.</p>
                <p>قضوا بضعة أيام وليالٍ يعيشون في مزرعة عائلة تُعتبر فقيرة جداً. وعند عودتهم من الرحلة، سأل الأب ابنه: "كيف كانت الرحلة؟ هل رأيت كم هم فقراء؟"</p>
                <p>أجاب الصبي: "نعم يا أبي، لقد رأيت ذلك". سأل الأب: "إذن، ماذا تعلمت من الرحلة؟"</p>
                <p>فأجاب الابن: "رأيت أن لدينا كلباً واحداً، ولديهم أربعة. لدينا بركة سباحة تصل إلى منتصف حديقتنا، ولديهم جدول ماء ليس له نهاية. لدينا مصابيح مستوردة في حديقتنا، ولديهم النجوم في الليل. باحتنا تصل إلى الفناء الأمامي، ولديهم الأفق بأكمله".</p>
                <p>ظل والد الصبي عاجزاً عن الكلام تماماً. ثم أضاف ابنه: "شكراً لك يا أبي لأنك أريتني كم نحن فقراء في الواقع!"</p>
                
                <h4 style="margin-top:15px; color:#1a237e;">العبرة الأخلاقية من القصة (Moral of the Story):</h4>
                <p>السعادة والثروة الحقيقية لا تقاس بالمال والأشياء المادية التي نمتلكها، بل تقاس بالرضا، الطبيعة، راحة البال، وكيف ننظر إلى العالم من حولنا.</p>
            </div>
        </div>
    `
};

// ==========================================
// 2. وظائف التحكم والتبديل (Logic)
// ==========================================

function switchTab(tabName, element) {
    const contentArea = document.getElementById('content-area');
    const mainTitle = document.getElementById('main-title');
    
    // حقن المحتوى بناء على التبويب المختار
    contentArea.innerHTML = appData[tabName];
    
    // تغيير عنوان الهيدر العلوي
    if(tabName === 'grammar') mainTitle.innerText = "قواعد اللغة الإنجليزية";
    if(tabName === 'conversations') mainTitle.innerText = "الحوارات والمحادثات اليومية";
    if(tabName === 'stories') mainTitle.innerText = "قصص إنجليزية مترجمة";
    
    // تحديث شكل الأزرار النشطة في الأسفل
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    
    // التمرير لأعلى الصفحة تلقائياً عند التبديل
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// تشغيل القسم الأول (القواعد) تلقائياً عند فتح التطبيق لأول مرة
document.addEventListener('DOMContentLoaded', () => {
    switchTab('grammar', document.querySelector('.nav-btn'));
});
