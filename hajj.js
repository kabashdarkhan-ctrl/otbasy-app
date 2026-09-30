(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const KEY = "hajj-game-v1";
  const NS = "http://www.w3.org/2000/svg";

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch {} };
  const saved = load();
  saved.gender ||= "m";
  saved.progress ||= {};

  const G = () => saved.gender;
  const isMan = () => G() === "m";
  // Мәтін: жай жол, {m, f} нысаны немесе функция болуы мүмкін
  const txt = (v) => (typeof v === "function" ? v(G()) : v && typeof v === "object" && !Array.isArray(v) && ("m" in v || "f" in v) ? v[G()] : v);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

  /* ---------------- Дұғалар ---------------- */
  const DUA = {
    talbiyah: { title: "Тәлбия", ar: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ", tr: "Ләббайкә, Аллаһуммә ләббайк. Ләббайкә лә шәрикә ләкә ләббайк. Иннәл-хамдә уән-ниъмәтә ләкә уәл-мулк, лә шәрикә ләк.", kk: "Шақыруыңа келдім, Аллаһым, келдім! Сенің серігің жоқ, келдім! Барлық мақтау, нығмет пен билік Сенікі. Сенің серігің жоқ." },
    niyyahUmrah: { title: "Ұмраға ниет", ar: "اللَّهُمَّ إِنِّي أُرِيدُ الْعُمْرَةَ فَيَسِّرْهَا لِي وَتَقَبَّلْهَا مِنِّي", tr: "Аллаһуммә инни уридул-ъумрата фә йәссирһә ли уә тақаббәлһә минни.", kk: "Аллаһым, мен ұмра жасауды қалаймын, оны маған жеңіл ет және менен қабыл ал." },
    niyyahHajj: { title: "Қажылыққа ниет", ar: "اللَّهُمَّ إِنِّي أُرِيدُ الْحَجَّ فَيَسِّرْهُ لِي وَتَقَبَّلْهُ مِنِّي", tr: "Аллаһуммә инни уридул-хаджжә фә йәссирһу ли уә тақаббәлһу минни.", kk: "Аллаһым, мен қажылық жасауды қалаймын, оны маған жеңіл ет және менен қабыл ал." },
    masjid: { title: "Мәсжідке кіру дұғасы", ar: "بِسْمِ اللَّهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ", tr: "Бисмилләһи уас-салату уас-саламу ъалә расулилләһ. Аллаһуммәфтах ли әбуабә рахматик.", kk: "Аллаһтың атымен. Аллаһтың Елшісіне салауат пен сәлем болсын. Аллаһым, маған рахметіңнің есіктерін аш." },
    istilam: { title: "Истилам / тас лақтыру тәкбірі", ar: "بِسْمِ اللَّهِ، اللَّهُ أَكْبَرُ", tr: "Бисмилләһи, Аллаһу әкбар.", kk: "Аллаһтың атымен, Аллаһ ұлы." },
    rabbana: { title: "Рукн Ямани мен Қара тас арасында", ar: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", tr: "Раббәнә әтинә фид-дунйә хасанатән уә фил-әхирати хасанатән уә қинә ъазәбән-нәр.", kk: "Раббымыз, бізге дүниеде де, ақыретте де жақсылық бер және бізді тозақ азабынан сақта. (Бақара, 201)" },
    maqam: { title: "Мақам Ибраһимге келгенде", ar: "وَاتَّخِذُوا مِنْ مَقَامِ إِبْرَاهِيمَ مُصَلًّى", tr: "Уәттәхизу мим-мақами Ибраһимә мусалла.", kk: "Ибраһимнің тұрған орнын намаз орны етіңдер. (Бақара, 125)" },
    zamzam: { title: "Зәмзәм ішкенде", ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا وَاسِعًا، وَشِفَاءً مِنْ كُلِّ دَاءٍ", tr: "Аллаһуммә инни әс'әлукә ъилмән нәфиъан, уә ризқан уәсиъан, уә шифә'ән мин кулли дә'.", kk: "Аллаһым, Сенен пайдалы білім, кең ризық және барлық дерттен шипа сұраймын." },
    safa: { title: "Сафа төбесінде", ar: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ، أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ", tr: "Иннас-сафа уәл-маруата мин шаъа'ирилләһ. Әбдә'у бимә бәдә'аллаһу биһ.", kk: "Шын мәнінде Сафа мен Марва – Аллаһтың белгілерінен. Аллаһ бастаған нәрседен бастаймын." },
    tahlil: { title: "Тәһлил (Сафа, Марва, Арафат)", ar: "لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", tr: "Лә иләһә иллаллаһу уахдаһу лә шәрикә ләһ, ләһул-мулку уә ләһул-хамду уә һуә ъалә кулли шәй'ин қадир.", kk: "Аллаһтан басқа құдай жоқ, Ол жалғыз, серігі жоқ. Билік Онікі, мақтау Оған тән. Ол барлық нәрсеге құдіретті." },
  };

  /* ---------------- Ұмра кезеңдері ---------------- */
  const UMRAH = [
    {
      icon: "🧳", day: "Ұмра · дайындық", place: "Үйде немесе қонақүйде", title: "Ихрамға дайындық",
      actions: [
        "Тырнақты алып, артық түктерді тазалаңыз, <b>ғұсыл</b> (толық шомылу) жасаңыз.",
        { m: "Хош иісті <b>киімге емес, денеге</b> жағуға болады (ихрамға кірмей тұрып) – сүннет.", f: "Хош иісті ихрамға кірмей тұрып қана қолдануға болады; кейін – тыйым." },
        { m: "Тігіссіз екі ақ мата киесіз: <b>изар</b> – белден төмен, <b>рида</b> – иыққа.", f: "Әйел адамның арнайы ихрам киімі жоқ: денені толық жабатын, кез келген түсті әдеттегі киім." },
        { m: "Аяқ киім – аяқтың <b>үстіңгі ортаңғы сүйегі ашық</b> тұратын сандал.", f: "Бет пен алақан ашық қалады; бетті матамен тигізіп жабуға болмайды." },
      ],
      tasks: [{
        type: "select",
        q: "Ихрам сөмкесіне не саласыз?",
        hint: "Керектің бәрін белгілеңіз, керек еместі қалдырыңыз.",
        opts: {
          m: [
            { t: "Тігіссіз 2 ақ мата (изар мен рида)", ok: true },
            { t: "Аяқтың үсті ашық сандал", ok: true },
            { t: "Белбеу немесе әмиян", ok: true, why: "Белбеу мен әмиянға рұқсат бар." },
            { t: "Тақия, бас киім", ok: false, why: "Ер адам ихрамда басын жаппайды." },
            { t: "Тігілген көйлек пен шалбар", ok: false, why: "Ерге денеге қарай тігілген киім тыйым." },
            { t: "Шұлық пен жабық аяқ киім", ok: false, why: "Ханафи бойынша аяқтың үстіңгі сүйегі ашық болуы керек." },
          ],
          f: [
            { t: "Денені толық жабатын кең киім", ok: true },
            { t: "Шашты жабатын орамал", ok: true },
            { t: "Шұлық пен жабық аяқ киім", ok: true, why: "Әйелге жабық аяқ киімге рұқсат." },
            { t: "Бетке тиетін никаб", ok: false, why: "Ихрамда әйел бетін матамен тигізіп жаппайды." },
            { t: "Ихрамнан кейін жағатын әтір", ok: false, why: "Ихрамға кірген соң хош иіс қолдануға болмайды." },
          ],
        },
      }],
    },
    {
      icon: "📍", day: "Ұмра · миқат", place: "Миқат (ұшақта – миқат тұсына жетпей)", title: "Миқатта ихрамға кіру",
      actions: [
        "Миқаттан өтпей тұрып ихрам киімін киіңіз. Ұшақпен ұшсаңыз – ұшқанға дейін киіп алыңыз.",
        "Макрух уақыт болмаса, <b>ихрам сүннеті</b> ретінде 2 рәкағат намаз оқыңыз.",
        "Ұмраға <b>ниет</b> етіңіз.",
        { m: "Бірден <b>тәлбияны дауыстап</b> айтыңыз. Ниет + тәлбия = ихрамға кірдіңіз.", f: "Бірден <b>тәлбияны ақырын</b> айтыңыз. Ниет + тәлбия = ихрамға кірдіңіз." },
        "Тәлбияны Меккеге дейін жиі қайталаңыз.",
      ],
      duas: ["niyyahUmrah", "talbiyah"],
      tasks: [
        { type: "order", q: "Амалдарды дұрыс ретпен басыңыз", items: ["Ғұсыл жасау", "Ихрам киімін кию", "Ихрам намазы (2 рәкағат)", "Ұмраға ниет ету", "Тәлбия айту"] },
        {
          type: "choice", q: "Ихрамға қай сәтте кірдім деп есептеледі?",
          opts: [
            { t: "Ихрам киімін кигенде", why: "Киім – ихрамның белгісі ғана, ихрамның өзі емес." },
            { t: "Ниет етіп, тәлбия айтқанда", ok: true },
            { t: "Меккеге кіргенде", why: "Миқаттан ихрамсыз өту – дам (құрбандық) керек ететін қателік." },
          ],
          explain: "Ханафи мазһабы бойынша ихрам ниет пен тәлбия (немесе оны алмастыратын зікір) бірге болғанда басталады.",
        },
      ],
    },
    {
      icon: "🚫", day: "Ұмра · жолда", place: "Миқаттан Меккеге дейін", title: "Ихрам тыйымдары",
      actions: [
        "Хош иіс (әтір, иісті сабын, крем) қолдануға болмайды.",
        "Шаш, сақал, мұрт, тырнақ алуға болмайды.",
        { m: "Тігілген киім кию, басты және бетті жабу – тыйым.", f: "Бетті матамен тигізіп жабу – тыйым." },
        "Аң аулау, ағаш-шөпті жұлу (Харам аймағында) – тыйым.",
        "Жұбайлық қатынас және оған жетелейтін нәрселер – тыйым.",
        "Дау-жанжал, былапыт сөз, күнә – ихрамда әсіресе ауыр.",
      ],
      tasks: [{
        type: "select",
        q: "Ихрамда тұрып нені істеуге БОЛМАЙДЫ?",
        hint: "Тек тыйым салынғандарды белгілеңіз.",
        opts: [
          { t: "Иісті сабынмен жуыну", ok: true },
          { t: "Тырнақ алу", ok: true },
          { t: "Біреумен дауласу, ұрсысу", ok: true },
          { t: "Аң аулау", ok: true },
          { t: "Иіссіз сабынмен жуыну", ok: false, why: "Иіссіз сабынға рұқсат." },
          { t: "Сағат, көзілдірік тағу", ok: false, why: "Сағат пен көзілдірікке рұқсат." },
          { t: "Қолшатыр астында тұру", ok: false, why: "Көлеңкеге тұруға болады – ол басқа тиіп тұрған жоқ." },
        ],
      }],
    },
    {
      icon: "🕌", day: "Ұмра · Мекке", place: "Мәсжід әл-Харам", title: "Мәсжід әл-Харамға кіру",
      actions: [
        "Қонақүйге орналасып, жүкті қойыңыз, дәрет алыңыз.",
        "Мәсжідке <b>оң аяқпен</b>, кіру дұғасын оқып кіріңіз.",
        "Қағбаны алғаш көргенде тоқтап, дұға етіңіз – бұл дұға қабыл болатын сәт.",
        "Ихрамдағы адам үшін мәсжідпен «сәлемдесу» – тәхиятул-масжид намазы емес, <b>тауаф</b>.",
      ],
      duas: ["masjid"],
      tasks: [
        { type: "choice", q: "Мәсжідке қай аяқпен кіресіз?", opts: [{ t: "Оң аяқпен", ok: true }, { t: "Сол аяқпен", why: "Сол аяқпен мәсжідтен шығады." }, { t: "Айырмашылығы жоқ", why: "Оң аяқпен кіру – сүннет." }], explain: "Мәсжідке оң аяқпен кіріп, сол аяқпен шығу – сүннет." },
        { type: "choice", q: "Ихраммен келген адам мәсжідке кірген соң бірінші не істейді?", opts: [{ t: "2 рәкағат тәхиятул-масжид", why: "Ихрамдағы адамның тәхияты – тауаф." }, { t: "Тауафты бастайды", ok: true }, { t: "Зәмзәм ішеді", why: "Зәмзәм тауаф пен оның намазынан кейін." }], explain: "Мәсжід әл-Харамның «сәлемі» – тауаф. Тауафтан кейін 2 рәкағат оқылады." },
      ],
    },
    {
      icon: "🕋", day: "Ұмра · тауаф", place: "Матаф – Қағба айналасы", title: "Тауаф: 7 айналым",
      actions: [
        "Дәретпен болыңыз – тауафта дәрет уәжіп.",
        { m: "<b>Идтиба</b>: риданың ортасын оң қолтықтың астынан өткізіп, екі ұшын сол иыққа тастаңыз – оң иық ашық.", f: null },
        "Қара тас (Хажар әл-Асуад) тұсындағы <b>жасыл шам</b> сызығында Қағбаға қарап тұрып, тауафқа ниет етіңіз.",
        "<b>Истилам</b>: екі қолды құлаққа дейін көтеріп, Қара тасқа қарап «Бисмилләһи, Аллаһу әкбар» деп, алақанды сүйіңіз. Тәлбия осы сәтте тоқтайды.",
        "Қағбаны <b>сол жағыңызға</b> алып, сағат тіліне қарсы 7 айналым жасаңыз. Хижр Исмаилдің <b>сыртынан</b> айналыңыз.",
        { m: "Алғашқы 3 айналымда <b>рамал</b>: иықты сілкіп, қысқа да шапшаң қадаммен жүру. Қалған 4-еуі – қалыпты.", f: "Әйел адам рамал жасамайды, қалыпты жүреді." },
        "Рукн Ямани мен Қара тас арасында «Раббәнә әтинә...» дұғасын оқыңыз.",
        "Әр айналым Қара таспен басталып, Қара таспен бітеді – барлығы <b>8 истилам</b>.",
      ],
      duas: ["istilam", "rabbana"],
      tasks: [{ type: "tawaf", variant: "umrah" }],
    },
    {
      icon: "💧", day: "Ұмра · тауаф намазы", place: "Мақам Ибраһим, Зәмзәм", title: "Тауаф намазы және Зәмзәм",
      actions: [
        { m: "Оң иықты жабыңыз – идтиба тауафпен бітеді.", f: null },
        "Мақам Ибраһимнің артында (орын болмаса – мәсжідтің кез келген жерінде) <b>2 рәкағат тауаф намазын</b> оқыңыз – ханафи бойынша уәжіп.",
        "1-рәкағатта «Кафирун», 2-сінде «Ихлас» сүресін оқу – сүннет.",
        "Құбылаға қарап, «Бисмилләһ» деп, Зәмзәмді тоя ішіп, дұға жасаңыз.",
        "Мүмкін болса, Қара тасқа тағы истилам жасап, сағиға барыңыз.",
      ],
      duas: ["maqam", "zamzam"],
      tasks: [
        { type: "choice", q: "Мақам Ибраһимнің артында орын жоқ, адам көп. Не істейсіз?", opts: [{ t: "Мәсжідтің басқа бос жерінде оқимын", ok: true }, { t: "Адамдарды итеріп, алдыға шығамын", why: "Басқаларға зиян беру – харам, ал Мақам артында оқу – тек абзал." }, { t: "Намазды мүлде оқымаймын", why: "Тауаф намазы – уәжіп." }], explain: "Тауаф намазын мәсжідтің кез келген жерінде оқуға болады. Ең бастысы – ешкімге зиян келтірмеу." },
      ],
    },
    {
      icon: "⛰️", day: "Ұмра · сағи", place: "Сафа мен Марва (Масъа)", title: "Сағи: 7 рет жүру",
      actions: [
        "<b>Сафа</b> төбесіне көтеріліп, Қағбаға бет бұрыңыз, қолды дұғадағыдай көтеріп, тәкбір, тәһлил айтып, дұға етіңіз.",
        "Сафадан Марваға дейін – 1-айналым, Марвадан Сафаға – 2-айналым. Барлығы <b>7</b>, соңы <b>Марвада</b> бітеді.",
        { m: "Екі <b>жасыл шам</b> арасында ер адам жеңіл жүгіреді (хәруәлә) – сүннет.", f: "Әйел адам жасыл шамдар арасында да қалыпты жүреді." },
        "Әр төбеге жеткенде Қағбаға қарап, дұға-зікірді қайталаңыз.",
        "Сағиде дәрет шарт емес, бірақ дәретпен болу абзал.",
      ],
      duas: ["safa", "tahlil"],
      tasks: [{ type: "say" }],
    },
    {
      icon: "✂️", day: "Ұмра · аяқталуы", place: "Марва маңы / шаштараз", title: "Шаш алу – ихрамнан шығу",
      actions: [
        { m: "Шашты толық алу (<b>халқ</b>) – абзал. Немесе бастың кемінде төрттен бірінен саусақ ұшындай қысқарту (<b>тақсир</b>).", f: "Шаштың ұштарынан <b>саусақ ұшындай</b> (≈2 см) кесіледі. Әйелге шашты қыру – тыйым." },
        "Шаш алынған соң ихрам тыйымдары түгел жойылады.",
        "Ұмра аяқталды! Таматтуғ жасайтындар 8 Зулхижжаға дейін Меккеде ихрамсыз жүреді.",
      ],
      tasks: [{ type: "shave" }],
    },
  ];

  /* ---------------- Қажылық кезеңдері ---------------- */
  const HAJJ = [
    {
      icon: "📜", day: "Қажылық · дайындық", place: "Қажылықтың 3 түрі", title: "Қажылық түрін таңдау",
      actions: [
        "<b>Ифрад</b> – тек қажылыққа ихрам байлау.",
        "<b>Қиран</b> – ұмра мен қажылықты бір ихраммен бірге орындау.",
        "<b>Таматтуғ</b> – алдымен ұмра жасап, ихрамнан шығу; 8 Зулхижжада қажылыққа жаңа ихрам байлау.",
        "Қазақстаннан баратындардың көбі Таматтуғ жасайды. Таматтуғ пен Қиранда <b>құрбандық уәжіп</b>.",
        "Бұл ойын – Таматтуғ: ұмраны алдын ала орындадыңыз деп есептейміз.",
      ],
      tasks: [
        { type: "choice", q: "Ұмраны жасап, ихрамнан шығып, кейін қажылыққа жаңа ихрам байлау – бұл қай түр?", opts: [{ t: "Ифрад" }, { t: "Қиран", why: "Қиранда ұмра мен қажылық бір ихраммен жасалады." }, { t: "Таматтуғ", ok: true }], explain: "Таматтуғ – «пайдалану»: екі ихрам арасында ихрамсыз жүру мүмкіндігін пайдаланасыз." },
        { type: "choice", q: "Таматтуғ жасаған қажыға құрбандық шалу…", opts: [{ t: "Уәжіп", ok: true }, { t: "Тек сүннет", why: "Таматтуғ пен Қиранда шүкірлік құрбандығы (хәдй) уәжіп." }, { t: "Қажет емес" }], explain: "Құрбандыққа шамасы жетпеген адам 10 күн ораза ұстайды: 3 күні қажылықта, 7 күні елге оралған соң." },
      ],
    },
    {
      icon: "🤍", day: "8 Зулхижжа · Тарвия күні", place: "Мекке", title: "Қажылыққа ихрам байлау",
      actions: [
        "Ғұсыл жасап, ихрам киімін киіңіз (ұмрадағыдай).",
        "Тұрған жеріңізде 2 рәкағат ихрам намазын оқыңыз.",
        "<b>Қажылыққа ниет</b> етіп, тәлбия айтыңыз. Енді тәлбия 10-күні алғашқы тасқа дейін айтылады.",
        "Түске дейін Минаға аттаныңыз.",
      ],
      duas: ["niyyahHajj", "talbiyah"],
      tasks: [
        { type: "choice", q: "Таматтуғ қажысы қажылық ихрамын қайдан байлайды?", opts: [{ t: "Миқатқа қайта барып", why: "Меккеде тұрған адам ихрамды Меккеден (Харам аймағынан) байлайды." }, { t: "Меккедегі тұрған жерінен", ok: true }, { t: "Арафатқа жеткенде", why: "Арафатқа ихраммен бару керек." }], explain: "Меккеде тұрған адамның қажылық миқаты – Харам аймағы. Сондықтан ихрам қонақүйде-ақ байланады." },
      ],
    },
    {
      icon: "⛺", day: "8 Зулхижжа · түн", place: "Мина", title: "Минада болу",
      actions: [
        "Мина шатырларында бесін, екінті, ақшам, құптан және 9-күнгі таң намаздарын оқу – сүннет.",
        "Уақытты тәлбия, зікір, Құран, дұғамен өткізіңіз.",
        "9-күні күн шыққан соң Арафатқа аттанасыз.",
      ],
      tasks: [
        { type: "choice", q: "8 Зулхижжа күні Минада не істейсіз?", opts: [{ t: "Намаздарды уақытында оқып, түнеймін", ok: true }, { t: "Жамраттарға тас лақтырамын", why: "Тас лақтыру 10 Зулхижжадан басталады." }, { t: "Ифада тауафын жасаймын", why: "Ифада тауафы Арафаттан кейін, 10-күннен басталады." }], explain: "Тарвия күні Минада 5 уақыт намаз оқып, түнеу – Пайғамбарымыздың (ﷺ) сүннеті." },
      ],
    },
    {
      icon: "🏔️", day: "9 Зулхижжа · Арафат күні", place: "Арафат", title: "Арафатта тұру (уақфа)",
      actions: [
        "Күн шыққан соң Арафатқа барыңыз.",
        "<b>Арафатта болу – қажылықтың ең басты парызы.</b> «Қажылық – Арафат» (хадис).",
        "Уақфа уақыты – зауалдан (бесін уақыты кіргеннен) 10-күні таң атқанға дейін. Кемінде бір сәт болу – парыз.",
        "Күндіз келген адамның <b>күн батқанға дейін</b> қалуы – уәжіп.",
        "Бесін мен екінті: Намира мешітінде имаммен бірге оқылса – бесін уақытында қосып; шатырда болсаңыз – әрқайсысын өз уақытында (ханафи).",
        "Уақытты дұға, тәлбия, зікір, тәубемен өткізіңіз. Бұл – жылдың ең ұлы дұға күні.",
        "Күн батқан соң <b>ақшамды оқымай</b> Муздалифаға аттаныңыз.",
      ],
      duas: ["tahlil"],
      tasks: [{ type: "arafat" }],
    },
    {
      icon: "🌙", day: "9→10 Зулхижжа · түн", place: "Муздалифа", title: "Муздалифа: түнеу және тас жинау",
      actions: [
        "Муздалифаға жеткен соң, құптан уақытында <b>ақшам мен құптанды бірге</b> – бір азан, бір ақаммен оқыңыз (уәжіп).",
        "Ашық аспан астында түнеңіз.",
        "Жамраттарға <b>ноқаттай</b> ұсақ тас жинаңыз: 49 (13-күні де қалсаңыз – 70).",
        "10-күні таң намазын ерте оқып, <b>күн шыққанға дейін уақфа</b> – ханафи бойынша уәжіп.",
        "Күн шығар алдында Минаға аттаныңыз.",
      ],
      tasks: [
        { type: "choice", q: "Муздалифаға жеткенде бірінші не істейсіз?", opts: [{ t: "Ақшам мен құптанды бірге оқимын", ok: true }, { t: "Бірден тас жинауға кірісемін", why: "Алдымен намаз – ол уәжіп, тасты кейін де жинауға болады." }, { t: "Ұйықтап, таңертең оқимын", why: "Ақшам мен құптанды таң атқанша оқу керек, кешіктіру – қате." }], explain: "Муздалифада ақшам мен құптан құптан уақытында бірге оқылады." },
        { type: "pebbles" },
        { type: "choice", q: "Муздалифадағы уәжіп уақфа қашан?", opts: [{ t: "Таң намазынан кейін күн шыққанға дейін", ok: true }, { t: "Түн ортасында", why: "Түнеу – сүннет, ал уәжіп уақфаның уақыты – таң атқаннан күн шыққанға дейін." }, { t: "Күн шыққаннан кейін", why: "Күн шыққан соң уақфа уақыты өтеді." }], explain: "Ханафи бойынша таң атқаннан күн шыққанға дейін Муздалифада болу – уәжіп. Әлсіз, науқас пен әйелдерге түнде кетуге жеңілдік бар." },
      ],
    },
    {
      icon: "🪨", day: "10 Зулхижжа · Құрбан айт", place: "Мина", title: "Ақаба жамратына тас лақтыру",
      actions: [
        "Бүгін тек <b>Үлкен (Ақаба) жамратқа</b> 7 тас лақтырылады.",
        "Бірінші тасты лақтырғанда <b>тәлбия тоқтайды</b>.",
        "Әр тасты жеке-жеке, «Бисмилләһи, Аллаһу әкбар» деп лақтырыңыз. Тас бассейнге (хауз) түсуі керек.",
        "Уақыты: күн шыққаннан зауалға дейін – сүннет, кешке дейін – рұқсат.",
      ],
      duas: ["istilam"],
      tasks: [{ type: "jamarat", day: 10 }],
    },
    {
      icon: "🐑", day: "10 Зулхижжа", place: "Мина / банк ваучері", title: "Құрбандық шалу",
      actions: [
        "Таматтуғ пен Қиран жасаған қажыға <b>құрбандық (хәдй) – уәжіп</b>: бір қой/ешкі немесе түйе/сиырдың 1/7 үлесі.",
        "Көбіне ваучер алып, құрбандық шалынғаны туралы хабарды күтесіз.",
        "Ханафи бойынша рет уәжіп: <b>тас лақтыру → құрбандық → шаш алу</b>. Рет бұзылса – дам керек.",
      ],
      tasks: [
        { type: "order", q: "10 Зулхижжа амалдарын ретімен басыңыз", items: ["Ақаба жамратына тас", "Құрбандық шалу", "Шаш алу", "Ифада тауафы"] },
        { type: "choice", q: "Құрбандығыңыз шалынды деген хабар әлі келмеді. Шашты алуға бола ма?", opts: [{ t: "Жоқ, хабарды күтемін", ok: true }, { t: "Иә, бәрібір шалынады ғой", why: "Таматтуғ қажысы үшін құрбандықтан бұрын шаш алу – рет бұзу, дам керек." }], explain: "Ханафи мазһабында Таматтуғ пен Қиранда тас – құрбандық – шаш алу реті уәжіп." },
      ],
    },
    {
      icon: "✂️", day: "10 Зулхижжа", place: "Мина", title: "Шаш алу – бірінші тахаллул",
      actions: [
        { m: "Шашты толық алу (<b>халқ</b>) – абзал, немесе тақсир.", f: "Шаш ұштарынан <b>саусақ ұшындай</b> кесіледі." },
        "Осыдан соң ихрам тыйымдары жойылады – <b>жұбайлық қатынастан басқасы</b>. Ол Ифада тауафынан кейін ғана рұқсат.",
        "Ихрам киімін шешіп, әдеттегі киіміңізді кие аласыз.",
      ],
      tasks: [
        { type: "shave" },
        { type: "choice", q: "Шаш алған соң әлі не тыйым болып қалады?", opts: [{ t: "Хош иіс қолдану", why: "Шаш алған соң хош иіске рұқсат." }, { t: "Тігілген киім кию", why: "Шаш алған соң әдеттегі киім киюге болады." }, { t: "Жұбайлық қатынас", ok: true }], explain: "Жұбайлық қатынас Ифада тауафынан кейін ғана рұқсат етіледі." },
      ],
    },
    {
      icon: "🕋", day: "10–12 Зулхижжа", place: "Мекке, Мәсжід әл-Харам", title: "Ифада тауафы және сағи",
      actions: [
        "<b>Ифада (зиярат) тауафы – қажылықтың парызы.</b> Уақыты: 10-күннен 12-күн күн батқанға дейін (кешіктірсе – дам).",
        "7 айналым. Ихрам киімі шешілген, сондықтан идтиба жоқ.",
        { m: "Артынан сағи жасайтындықтан – алғашқы 3 айналымда рамал.", f: "Әйел адам рамал жасамайды." },
        "Тауаф намазы (2 рәкағат), Зәмзәм.",
        "Таматтуғ қажысы <b>қажылық сағиын</b> жасайды: Сафадан Марваға 7 рет.",
        "Минаға қайтып, түнейсіз.",
      ],
      duas: ["istilam", "rabbana", "safa"],
      tasks: [{ type: "tawaf", variant: "ifada" }, { type: "say" }],
    },
    {
      icon: "🪨", day: "11–12 Зулхижжа · Тәшриқ күндері", place: "Мина", title: "Үш жамратқа тас лақтыру",
      actions: [
        "Минада түнейсіз.",
        "Тастар <b>зауалдан кейін</b> (бесін уақыты кірген соң) лақтырылады.",
        "Рет: <b>Кіші (Сұғра) → Орта (Уста) → Үлкен (Ақаба)</b>, әрқайсысына 7 тас.",
        "Кіші мен Ортадан кейін шетке шығып, құбылаға қарап, қол көтеріп, ұзақ дұға – сүннет.",
        "Ақабадан кейін тоқтамай кетесіз.",
        "12-күні тастан кейін күн батқанша Минадан кетуге болады. Қалсаңыз – 13-күні де лақтырасыз.",
      ],
      duas: ["istilam"],
      tasks: [
        { type: "jamarat", day: 11 },
        { type: "choice", q: "11–12 Зулхижжа күндері тасты қашан лақтырамыз?", opts: [{ t: "Таң атысымен", why: "Тәшриқ күндері тас зауалға дейін лақтырылмайды." }, { t: "Зауалдан (бесін уақыты кіргеннен) кейін", ok: true }, { t: "Кез келген уақытта" }], explain: "11 және 12 Зулхижжа күндері тас лақтыру уақыты – зауалдан басталады." },
        { type: "choice", q: "12-күні Меккеге ерте қайтқыңыз келеді. Не істейсіз?", opts: [{ t: "Тасты лақтырып, күн батқанға дейін Минадан шығамын", ok: true }, { t: "Тас лақтырмай-ақ кетемін", why: "Тас лақтыру – уәжіп; тастамаса – дам." }, { t: "13-күнгі тасты да бүгін лақтырамын", why: "Әр күннің тасы өз уақытында лақтырылады." }], explain: "Ерте кетемін десеңіз – 12-күнгі тастан кейін, күн батпай Минадан шығыңыз. Әйтпесе 13-күні де қалып, тас лақтырасыз." },
      ],
    },
    {
      icon: "👋", day: "Кетер алдында", place: "Мекке, Мәсжід әл-Харам", title: "Қоштасу (уәда) тауафы",
      actions: [
        "Меккеден кетер алдындағы соңғы амал – <b>Уәда тауафы</b>. Меккеден тыс тұратындарға уәжіп.",
        "7 айналым. Рамал да, идтиба да, артынан сағи да жоқ.",
        "2 рәкағат намаз, Зәмзәм, Мүлтазамда (Қара тас пен есік арасы) дұға.",
        "Етеккір кезіндегі әйелден бұл тауаф түседі.",
        "Қажылығыңыз қабыл болсын – «Хаджжун мәбрур»!",
      ],
      tasks: [
        { type: "choice", q: "Қоштасу тауафынан кейін сағи жасау керек пе?", opts: [{ t: "Иә, міндетті", why: "Уәда тауафынан кейін сағи жоқ." }, { t: "Жоқ", ok: true }], explain: "Сағи тек ихраммен жасалған тауафтан (ұмра, құдум, ифада) кейін болады." },
        { type: "choice", q: "Қоштасу тауафы кімнен түседі?", opts: [{ t: "Етеккір кезіндегі әйелден", ok: true }, { t: "Шаршаған адамнан", why: "Шаршау – себеп емес, тауаф уәжіп." }, { t: "Ешкімнен түспейді" }], explain: "Хадис бойынша етеккір не нифас кезіндегі әйелге қоштасу тауафынсыз кетуге рұқсат." },
      ],
    },
  ];

  const MODES = {
    umrah: { title: "Ұмра", small: "КІШІ ҚАЖЫЛЫҚ", desc: "Ихрам, тауаф, сағи және шаш алу — 8 кезең.", stages: UMRAH },
    hajj: { title: "Қажылық", small: "ТАМАТТУҒ · 8–13 ЗУЛХИЖЖА", desc: "Мина, Арафат, Муздалифа, жамараттар, құрбандық, ифада — 11 кезең.", stages: HAJJ },
  };

  /* ---------------- UI көмекшілері ---------------- */
  let toastTimer;
  function toast(msg, kind = "") {
    const t = $("#toast");
    t.className = `toast show ${kind}`;
    t.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.className = "toast"), 2600);
  }

  function sheet({ ok, title, html, btn = "Жалғастыру", onNext }) {
    const s = $("#sheet");
    s.className = `sheet open ${ok === true ? "ok" : ok === false ? "bad" : ""}`;
    s.innerHTML = `<h3>${ok === true ? "✓" : ok === false ? "✕" : "ℹ︎"} ${esc(title)}</h3>${html || ""}<button class="primary" type="button">${esc(btn)}</button>`;
    $("#sheet-backdrop").classList.add("open");
    $(".primary", s).onclick = () => { closeSheet(); onNext && onNext(); };
  }
  function closeSheet() { $("#sheet").className = "sheet"; $("#sheet-backdrop").classList.remove("open"); }

  const duaHtml = (k) => { const d = DUA[k]; return `<div class="dua"><div class="badge">${esc(d.title)}</div><div class="ar">${d.ar}</div><div class="tr">${esc(d.tr)}</div><div class="kk">${esc(d.kk)}</div></div>`; };
  const actionsHtml = (list) => `<ol class="actions">${list.map(txt).filter(Boolean).map((a) => `<li>${a}</li>`).join("")}</ol>`;

  /* ---------------- Ойын күйі ---------------- */
  let run = null; // { mode, stage, task, score, mistakes, stopFns }

  function slip(msg) {
    if (!run) return;
    const stage = MODES[run.mode].stages[run.stage].title;
    if (!run.mistakes.some((m) => m.msg === msg)) run.mistakes.push({ stage, msg });
    run.score = Math.max(0, run.score - 3);
    updateScore();
    toast(msg, "bad");
  }
  function award(n) { run.score += n; updateScore(); }
  function updateScore() { $("#score").textContent = run.score; }
  function stopLoops() { (run?.stopFns || []).forEach((f) => f()); if (run) run.stopFns = []; }
  function onStop(f) { run.stopFns.push(f); }

  function persist() {
    saved.progress[run.mode] = { stage: run.stage, score: run.score, mistakes: run.mistakes };
    save();
  }

  /* ---------------- Басты экран ---------------- */
  function renderHome() {
    document.querySelectorAll("[data-gender]").forEach((b) => { b.classList.toggle("active", b.dataset.gender === G()); b.setAttribute("aria-checked", b.dataset.gender === G()); });
    $("#mode-list").innerHTML = Object.entries(MODES).map(([k, m]) => {
      const p = saved.progress[k];
      const doneN = p ? Math.min(p.stage, m.stages.length) : 0;
      const pct = Math.round((doneN / m.stages.length) * 100);
      const finished = p && p.stage >= m.stages.length;
      const label = finished ? "Қайта ойнау" : doneN ? `Жалғастыру (${doneN + 1}/${m.stages.length})` : "Бастау";
      return `<article class="mode-card ${k}" data-icon="${k === "umrah" ? "🕋" : "🏔️"}">
        <small>${m.small}</small><h2>${m.title}</h2><p>${m.desc}</p>
        <div class="mode-bar"><i style="width:${pct}%"></i></div>
        <div class="mode-actions"><button type="button" data-start="${k}" data-fresh="${finished ? 1 : 0}">${label}</button>${doneN && !finished ? `<button type="button" class="ghost" data-start="${k}" data-fresh="1">Басынан</button>` : ""}</div>
      </article>`;
    }).join("");
    document.querySelectorAll("[data-start]").forEach((b) => (b.onclick = () => startMode(b.dataset.start, b.dataset.fresh === "1")));
  }

  document.querySelectorAll("[data-gender]").forEach((b) => (b.onclick = () => { saved.gender = b.dataset.gender; save(); renderHome(); }));

  function startMode(mode, fresh) {
    const p = saved.progress[mode];
    run = fresh || !p || p.stage >= MODES[mode].stages.length
      ? { mode, stage: 0, task: 0, score: 0, mistakes: [], stopFns: [] }
      : { mode, stage: p.stage, task: 0, score: p.score, mistakes: p.mistakes || [], stopFns: [] };
    $("#home-view").hidden = true;
    $("#play-view").hidden = false;
    updateScore();
    renderStage();
  }

  $("#exit-play").onclick = () => {
    stopLoops();
    closeSheet();
    run = null;
    $("#play-view").hidden = true;
    $("#home-view").hidden = false;
    renderHome();
    window.scrollTo(0, 0);
  };

  /* ---------------- Кезең ---------------- */
  function renderJourney() {
    const stages = MODES[run.mode].stages;
    $("#journey").innerHTML = stages.map((s, i) => `<span class="${i < run.stage ? "done" : i === run.stage ? "current" : ""}" title="${esc(s.title)}">${s.icon}</span>`).join("");
    $("#stage-progress").style.width = `${(run.stage / stages.length) * 100}%`;
    const cur = $("#journey .current");
    cur && cur.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }

  function stageHead(s) {
    return `<div class="stage-head"><small>${esc(s.day)}</small><h2>${esc(s.title)}</h2><span class="place">📍 ${esc(s.place)}</span></div>`;
  }

  function renderStage() {
    stopLoops();
    const stages = MODES[run.mode].stages;
    if (run.stage >= stages.length) return finish();
    const s = stages[run.stage];
    run.task = 0;
    renderJourney();
    $("#stage").innerHTML = `${stageHead(s)}
      <div class="card"><h3>Не істейміз?</h3>${actionsHtml(s.actions)}</div>
      ${s.duas ? `<div>${s.duas.map(duaHtml).join("")}</div>` : ""}
      <button class="primary" id="go-task" type="button">Амалды орындау →</button>`;
    $("#go-task").onclick = () => runTask();
    window.scrollTo(0, 0);
  }

  function runTask() {
    stopLoops();
    const s = MODES[run.mode].stages[run.stage];
    const task = s.tasks[run.task];
    if (!task) return stageDone();
    const box = $("#stage");
    box.innerHTML = `${stageHead(s)}<div id="task" style="display:flex;flex-direction:column;gap:14px"></div>`;
    window.scrollTo(0, 0);
    const next = () => { run.task += 1; runTask(); };
    TASKS[task.type]($("#task"), task, next);
  }

  function stageDone() {
    const s = MODES[run.mode].stages[run.stage];
    award(5);
    run.stage += 1;
    persist();
    sheet({ ok: true, title: `«${s.title}» орындалды`, html: `<p>Келесі кезеңге өтеміз. Жинаған ұпай: <b>${run.score}</b></p>`, btn: run.stage >= MODES[run.mode].stages.length ? "Нәтижені көру" : "Келесі кезең", onNext: renderStage });
  }

  function finish() {
    renderJourney();
    $("#stage-progress").style.width = "100%";
    const m = MODES[run.mode];
    const title = run.mode === "umrah" ? "Ұмраңыз қабыл болсын!" : "Хаджжун мәбрур!";
    $("#stage").innerHTML = `<div class="card result">
        <div class="big">${run.mode === "umrah" ? "🕋" : "🤲"}</div>
        <h2>${title}</h2>
        <p>Сіз ${m.title.toLowerCase()} амалдарының бәрін ретімен орындадыңыз.</p>
        <div class="stats"><div><b>${run.score}</b><span>ҰПАЙ</span></div><div><b>${run.mistakes.length}</b><span>ҚАТЕЛІК</span></div></div>
        ${run.mistakes.length ? `<h3 style="text-align:left;margin:4px 0 10px;font-size:13px;color:#69796f">ҚАЙТАЛАП ОҚЫҢЫЗ</h3><ul class="mistakes">${run.mistakes.map((x) => `<li><b>${esc(x.stage)}</b>${esc(x.msg)}</li>`).join("")}</ul>` : `<p>Бірде-бір қатесіз! Ма ша Аллаһ 🌟</p>`}
      </div>
      <button class="primary" id="again" type="button">Қайта ойнау</button>
      ${run.mode === "umrah" ? `<button class="secondary" id="to-hajj" type="button">Қажылыққа өту →</button>` : ""}`;
    $("#again").onclick = () => startMode(run.mode, true);
    const th = $("#to-hajj");
    if (th) th.onclick = () => startMode("hajj", false);
  }

  /* ---------------- Тапсырмалар ---------------- */
  const TASKS = {};

  TASKS.choice = (el, t, next) => {
    const opts = shuffle(t.opts);
    el.innerHTML = `<p class="task-q">${esc(t.q)}</p><div class="opts">${opts.map((o, i) => `<button class="opt" type="button" data-i="${i}"><span class="mark"></span>${esc(o.t)}</button>`).join("")}</div>`;
    el.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
      const o = opts[+b.dataset.i];
      el.querySelectorAll(".opt").forEach((x, i) => { x.disabled = true; if (opts[i].ok) x.classList.add("good"); });
      if (o.ok) {
        award(10);
        sheet({ ok: true, title: "Дұрыс!", html: `<p>${esc(t.explain || "")}</p>`, onNext: next });
      } else {
        b.classList.add("bad");
        slip(o.why || `Дұрыс жауап: ${opts.find((x) => x.ok).t}`);
        sheet({ ok: false, title: "Қате", html: `${o.why ? `<p><b>${esc(o.why)}</b></p>` : ""}<p>Дұрыс жауап: <b>${esc(opts.find((x) => x.ok).t)}</b>. ${esc(t.explain || "")}</p>`, btn: "Түсіндім", onNext: next });
      }
    }));
  };

  TASKS.select = (el, t, next) => {
    const opts = shuffle(txt(t.opts));
    const sel = new Set();
    el.innerHTML = `<p class="task-q">${esc(t.q)}</p>${t.hint ? `<p class="task-hint">${esc(t.hint)}</p>` : ""}<div class="opts">${opts.map((o, i) => `<button class="opt" type="button" data-i="${i}"><span class="mark"></span>${esc(o.t)}</button>`).join("")}</div><button class="primary" id="check" type="button" disabled>Тексеру</button>`;
    const btns = [...el.querySelectorAll(".opt")];
    btns.forEach((b) => (b.onclick = () => {
      const i = +b.dataset.i;
      sel.has(i) ? sel.delete(i) : sel.add(i);
      b.classList.toggle("sel", sel.has(i));
      $(".mark", b).textContent = sel.has(i) ? "✓" : "";
      $("#check").disabled = sel.size === 0;
    }));
    $("#check").onclick = () => {
      const notes = [];
      let perfect = true;
      btns.forEach((b, i) => {
        b.disabled = true;
        const o = opts[i];
        const chosen = sel.has(i);
        b.classList.remove("sel");
        if (chosen && o.ok) b.classList.add("good");
        else if (chosen && !o.ok) { b.classList.add("bad"); perfect = false; notes.push(`✕ ${o.t}: ${o.why || "бұл жерге сәйкес емес."}`); }
        else if (!chosen && o.ok) { b.classList.add("missed"); perfect = false; notes.push(`＋ ${o.t}${o.why ? ": " + o.why : " – бұл да керек еді."}`); }
      });
      $("#check").remove();
      if (perfect) {
        award(15);
        sheet({ ok: true, title: "Бәрі дұрыс!", html: opts.filter((o) => o.why).map((o) => `<p>• ${esc(o.t)}: ${esc(o.why)}</p>`).join(""), onNext: next });
      } else {
        slip(`${t.q} — ${notes.length} қате`);
        sheet({ ok: false, title: "Толық емес", html: `<ul>${notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>`, btn: "Түсіндім", onNext: next });
      }
    };
  };

  TASKS.order = (el, t, next) => {
    const items = shuffle(t.items);
    let pos = 0, errs = 0;
    el.innerHTML = `<p class="task-q">${esc(t.q)}</p><p class="task-hint">Бірінші болатын амалдан бастаңыз.</p><div class="opts">${items.map((it, i) => `<button class="opt" type="button" data-i="${i}"><span class="num">?</span>${esc(it)}</button>`).join("")}</div>`;
    el.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
      const it = items[+b.dataset.i];
      if (it === t.items[pos]) {
        pos += 1;
        b.classList.add("placed");
        b.disabled = true;
        $(".num", b).textContent = pos;
        if (pos === t.items.length) {
          award(Math.max(4, 12 - errs * 3));
          sheet({ ok: errs === 0, title: errs ? "Реті анықталды" : "Реті дұрыс!", html: `<ol>${t.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>`, onNext: next });
        }
      } else {
        errs += 1;
        b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake");
        slip(`Рет қатесі: «${t.items[pos]}» алдымен болуы керек.`);
      }
    }));
  };

  /* ----- SVG көмекшілері ----- */
  function svgEl(tag, attrs = {}, parent) {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    parent && parent.appendChild(e);
    return e;
  }
  function floatText(svg, x, y, text, color = "#0a6b52") {
    const t = svgEl("text", { x, y, "text-anchor": "middle", "font-size": 12, "font-weight": 800, fill: color, class: "floaty" }, svg);
    t.textContent = text;
    setTimeout(() => t.remove(), 1200);
  }
  // Басып тұрған кезде жүретін батырма
  function bindHold(btn, set) {
    const on = (e) => { e.preventDefault(); set(true); btn.classList.add("active"); };
    const off = () => { set(false); btn.classList.remove("active"); };
    btn.addEventListener("pointerdown", on);
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => btn.addEventListener(ev, off));
    btn.addEventListener("contextmenu", (e) => e.preventDefault());
    const kd = (e) => { if (e.code === "Space" && !e.repeat) { e.preventDefault(); on(e); } };
    const ku = (e) => { if (e.code === "Space") off(); };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    onStop(() => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); });
  }
  function loop(step) {
    let last = null, id;
    const frame = (ts) => { const dt = last == null ? 0 : Math.min(0.05, (ts - last) / 1000); last = ts; step(dt); id = requestAnimationFrame(frame); };
    id = requestAnimationFrame(frame);
    onStop(() => cancelAnimationFrame(id));
  }

  /* ----- Тауаф ----- */
  TASKS.tawaf = (el, t, next) => {
    const man = isMan();
    const ramal = man;
    const idtiba = man && t.variant === "umrah";
    const CX = 160, CY = 160, R = 118, TAU = Math.PI * 2;
    el.innerHTML = `
      <div class="hud"><div class="count" id="tw-count">0<small>/7 айналым</small></div><div class="dots" id="tw-dots">${"<i></i>".repeat(7)}</div></div>
      <div class="scene"><svg id="tw-svg" viewBox="0 0 320 320"></svg></div>
      <div class="status" id="tw-status"></div>
      <div class="controls" id="tw-controls"></div>`;
    const svg = $("#tw-svg");
    svg.innerHTML = `
      <defs><radialGradient id="marble" cx="50%" cy="50%" r="55%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e8eeea"/></radialGradient></defs>
      <rect width="320" height="320" fill="url(#marble)"/>
      <circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="#d7e2dc" stroke-width="26"/>
      <path id="tw-yamani" d="M ${CX} ${CY + R} A ${R} ${R} 0 0 0 ${CX + R} ${CY}" fill="none" stroke="#f6e3b5" stroke-width="26" opacity=".7"/>
      <line x1="${CX + 57}" y1="${CY}" x2="${CX + R + 20}" y2="${CY}" stroke="#18b996" stroke-width="3" stroke-dasharray="4 3"/>
      <path d="M ${CX} ${CY - 57} A 44 44 0 0 0 ${CX - 57} ${CY}" fill="none" stroke="#c9c2ac" stroke-width="7" stroke-linecap="round"/>
      <polygon points="${CX + 57},${CY} ${CX},${CY - 57} ${CX - 57},${CY} ${CX},${CY + 57}" fill="#17191a"/>
      <polygon points="${CX + 45},${CY} ${CX},${CY - 45} ${CX - 45},${CY} ${CX},${CY + 45}" fill="none" stroke="#d9a542" stroke-width="3"/>
      <line x1="${CX + 22}" y1="${CY - 35}" x2="${CX + 35}" y2="${CY - 22}" stroke="#e8c26a" stroke-width="5"/>
      <circle cx="${CX + 54}" cy="${CY}" r="5" fill="#5b4a3a" stroke="#d9a542" stroke-width="2"/>
      <g transform="translate(${CX + 62} ${CY - 60})"><rect x="-8" y="-8" width="16" height="16" rx="4" fill="#e8c26a" stroke="#b58a2e"/></g>
      <circle id="tw-trail" cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="#18b996" stroke-width="5" stroke-linecap="round" transform="translate(0 ${2 * CY}) scale(1 -1)" stroke-dasharray="0 ${TAU * R}"/>
      <text x="${CX + 66}" y="${CY + 22}" font-size="9.5" font-weight="800" fill="#5b4a3a">Қара тас</text>
      <text x="${CX + 74}" y="${CY - 64}" font-size="9" font-weight="700" fill="#8a6416">Мақам Ибраһим</text>
      <text x="${CX - 80}" y="${CY - 60}" font-size="9" font-weight="700" fill="#7b7563">Хижр Исмаил</text>
      <text x="${CX}" y="${CY + 76}" text-anchor="middle" font-size="9" font-weight="700" fill="#8a6416">Рукн Ямани</text>
      <text x="${CX}" y="${CY - 66}" text-anchor="middle" font-size="8.5" font-weight="700" fill="#9aa39e">Ирақи</text>
      <text x="${CX - 66}" y="${CY + 4}" text-anchor="end" font-size="8.5" font-weight="700" fill="#9aa39e">Шами</text>
      <g id="tw-me"><circle r="10" fill="#fff" stroke="#087b6b" stroke-width="3"/><circle r="4" fill="#087b6b"/></g>`;
    const me = $("#tw-me"), trail = $("#tw-trail");
    const C = TAU * R;
    let theta = 0, round = 0, phase = "dir", holding = false, istilams = 0, stopTalb = false;

    const status = (html, warn) => { const s = $("#tw-status"); s.innerHTML = html; s.classList.toggle("warn", !!warn); };
    const draw = () => {
      const x = CX + R * Math.cos(theta), y = CY - R * Math.sin(theta);
      me.setAttribute("transform", `translate(${x} ${y})`);
      const f = theta - round * TAU;
      trail.setAttribute("stroke-dasharray", `${Math.max(0, (f / TAU) * C)} ${C}`);
      $("#tw-count").innerHTML = `${round}<small>/7 айналым</small>`;
      [...$("#tw-dots").children].forEach((d, i) => d.classList.toggle("on", i < round));
    };

    const controls = $("#tw-controls");
    const showDir = () => {
      status("Тауафты қай бағытта жасайсыз? Қара тастың тұсындағы жасыл сызықта тұрсыз.");
      controls.innerHTML = `<button class="ctl" data-d="ccw" type="button">↺ Сағат тіліне қарсы<br><small>Қағба сол жақта</small></button><button class="ctl" data-d="cw" type="button">↻ Сағат тілімен<br><small>Қағба оң жақта</small></button>`;
      controls.querySelectorAll("[data-d]").forEach((b) => (b.onclick = () => {
        if (b.dataset.d === "cw") { slip("Тауаф Қағбаны сол жаққа алып, сағат тіліне қарсы жасалады."); b.disabled = true; return; }
        award(5);
        if (idtiba) toast("Идтиба: оң иық ашық ✓", "good");
        phase = "istilam";
        showWalk();
      }));
    };
    const showWalk = () => {
      controls.innerHTML = `<button class="ctl gold" id="tw-ist" type="button">✋ Истилам<br><small>Бисмилләһи, Аллаһу әкбар</small></button><button class="ctl hold" id="tw-walk" type="button">🚶 Жүру<br><small>басып тұрыңыз</small></button>`;
      $("#tw-ist").onclick = doIstilam;
      bindHold($("#tw-walk"), (v) => {
        if (v && phase === "istilam") { toast("Алдымен Қара тасқа қарап истилам жасаңыз ✋"); return; }
        holding = v;
      });
      refresh();
    };
    const refresh = () => {
      const ist = $("#tw-ist");
      if (!ist) return;
      ist.classList.toggle("pulse", phase === "istilam");
      if (phase === "istilam") {
        status(round === 0 ? "Қара тасқа бет бұрып, қолды көтеріңіз: <b>Истилам</b> батырмасын басыңыз." : round === 7 ? "7 айналым бітті! Соңғы (8-) истиламды жасаңыз." : `${round}-айналым бітті. Қара тас тұсындасыз – <b>истилам</b> жасаңыз.`);
      } else {
        const a = theta - round * TAU;
        const inYamani = a > (3 * Math.PI) / 2;
        const ramalNow = ramal && round < 3;
        status(`${inYamani ? "🤲 <b>Рукн Ямани – Қара тас арасы:</b> «Раббәнә әтинә фид-дунйә хасанатан...»" : `${round + 1}-айналым. Қағба сол жағыңызда. Зікір, дұға, Құран оқыңыз.`}${ramalNow ? ' <span class="badge">Рамал: шапшаң қадам</span>' : ""}`, false);
      }
    };
    function doIstilam() {
      if (phase !== "istilam") { toast("Истилам Қара тастың тұсында ғана жасалады"); return; }
      istilams += 1;
      floatText(svg, CX + 70, CY - 8, "✋ Аллаһу әкбар", "#8a6416");
      if (!stopTalb && t.variant === "umrah") { stopTalb = true; toast("Тәлбия тоқтады – тауаф басталды", "good"); }
      if (round === 7) {
        phase = "done";
        award(25);
        const extra = t.variant === "umrah" && idtiba ? "<p>Енді оң иықты жауып, Мақам Ибраһимге барамыз.</p>" : "";
        sheet({ ok: true, title: "Тауаф орындалды!", html: `<p>7 айналым, ${istilams} истилам.${ramal ? " Алғашқы 3 айналымда рамал жасалды." : ""}</p>${extra}<p>Тауафтан кейін 2 рәкағат намаз оқылады.</p>`, onNext: next });
        return;
      }
      phase = "walk";
      refresh();
    }
    let lastZone = false;
    loop((dt) => {
      if (phase === "walk" && holding) {
        const speed = (ramal && round < 3 ? 1.3 : 1) * (TAU / 3.6);
        theta += speed * dt;
        if (theta >= (round + 1) * TAU) {
          theta = (round + 1) * TAU;
          round += 1;
          holding = false;
          $("#tw-walk")?.classList.remove("active");
          phase = "istilam";
          draw();
          refresh();
          return;
        }
        const zone = theta - round * TAU > (3 * Math.PI) / 2;
        if (zone !== lastZone) { lastZone = zone; refresh(); }
      }
      draw();
    });
    showDir();
    draw();
  };

  /* ----- Сағи ----- */
  TASKS.say = (el, t, next) => {
    const man = isMan();
    const TOP = 50, BOT = 300, X = 160;
    const G1 = 0.32, G2 = 0.52; // жасыл шамдар аймағы (Сафадан бастап)
    el.innerHTML = `
      <div class="hud"><div class="count" id="sy-count">0<small>/7 айналым</small></div><div class="dots" id="sy-dots">${"<i></i>".repeat(7)}</div></div>
      <div class="scene"><svg id="sy-svg" viewBox="0 0 320 350"></svg></div>
      <div class="status" id="sy-status"></div>
      <div class="controls" id="sy-controls"></div>`;
    const svg = $("#sy-svg");
    const yOf = (p) => BOT - p * (BOT - TOP);
    svg.innerHTML = `
      <rect width="320" height="350" fill="#f7f4ec"/>
      <rect x="110" y="${TOP}" width="100" height="${BOT - TOP}" fill="#fff" stroke="#e6dfcd"/>
      <line x1="160" y1="${TOP}" x2="160" y2="${BOT}" stroke="#e6dfcd" stroke-dasharray="6 6"/>
      <rect x="110" y="${yOf(G2)}" width="100" height="${yOf(G1) - yOf(G2)}" fill="#d9f5e9"/>
      ${[yOf(G1), yOf(G2)].map((y) => `<rect x="104" y="${y - 3}" width="112" height="6" rx="3" fill="#18b996"/>`).join("")}
      <text x="222" y="${(yOf(G1) + yOf(G2)) / 2 + 4}" font-size="10" font-weight="800" fill="#087b6b">жасыл шамдар</text>
      <path d="M100 ${TOP - 4} Q160 ${TOP - 44} 220 ${TOP - 4} Z" fill="#c9b99a"/>
      <text x="160" y="${TOP - 14}" text-anchor="middle" font-size="12" font-weight="800" fill="#5b4a3a">МАРВА</text>
      <path d="M100 ${BOT + 4} Q160 ${BOT + 44} 220 ${BOT + 4} Z" fill="#c9b99a"/>
      <text x="160" y="${BOT + 28}" text-anchor="middle" font-size="12" font-weight="800" fill="#5b4a3a">САФА</text>
      <g transform="translate(46 ${(TOP + BOT) / 2})"><polygon points="-14,0 0,-14 14,0 0,14" fill="#17191a"/><text y="30" text-anchor="middle" font-size="9" font-weight="700" fill="#8a6416">Қағба жағы</text></g>
      <text id="sy-arrow" x="250" y="${(TOP + BOT) / 2 - 40}" font-size="26" fill="#bcd7cc">↑</text>
      <g id="sy-me"><circle r="11" fill="#fff" stroke="#087b6b" stroke-width="3"/><circle r="4.5" fill="#087b6b"/></g>`;
    const me = $("#sy-me");
    let pos = 0, lap = 0, phase = "start", holding = false, running = false, greenHint = false, ranLaps = 0, ranThisLap = false;
    const status = (h, warn) => { const s = $("#sy-status"); s.innerHTML = h; s.classList.toggle("warn", !!warn); };
    const hill = () => (pos > 0.5 ? "Марва" : "Сафа");
    const draw = () => {
      me.setAttribute("transform", `translate(${X} ${yOf(pos)})`);
      $("#sy-count").innerHTML = `${lap}<small>/7 айналым</small>`;
      [...$("#sy-dots").children].forEach((d, i) => d.classList.toggle("on", i < lap));
      $("#sy-arrow").textContent = lap % 2 === 0 ? "↑" : "↓";
    };
    const controls = $("#sy-controls");
    const showStart = () => {
      status("Сағиды қай төбеден бастайсыз?");
      controls.innerHTML = `<button class="ctl" data-h="safa" type="button">⛰️ Сафадан</button><button class="ctl" data-h="marwa" type="button">⛰️ Марвадан</button>`;
      controls.querySelectorAll("[data-h]").forEach((b) => (b.onclick = () => {
        if (b.dataset.h === "marwa") { slip("Сағи Сафадан басталып, Марвада аяқталады. «Аллаһ бастағаннан бастаймын»."); b.disabled = true; return; }
        award(5);
        phase = "dua";
        showWalk();
      }));
    };
    const showWalk = () => {
      controls.innerHTML = `<button class="ctl gold" id="sy-dua" type="button">🤲 Қағбаға қарап дұға</button><button class="ctl hold" id="sy-walk" type="button">🚶 Жүру<br><small>басып тұрыңыз</small></button>${man ? `<button class="ctl" id="sy-run" type="button" style="grid-column:1/-1">🏃 Хәруәлә (жеңіл жүгіру): <b id="sy-runlbl">өшік</b></button>` : ""}`;
      $("#sy-dua").onclick = doDua;
      bindHold($("#sy-walk"), (v) => {
        if (v && phase === "dua") { toast("Алдымен төбеде Қағбаға қарап дұға жасаңыз 🤲"); return; }
        holding = v;
      });
      if (man) $("#sy-run").onclick = () => { running = !running; $("#sy-run").classList.toggle("toggled", running); $("#sy-runlbl").textContent = running ? "қосулы" : "өшік"; };
      refresh();
    };
    const refresh = () => {
      $("#sy-dua")?.classList.toggle("pulse", phase === "dua");
      if (phase === "dua") status(lap === 0 ? "Сафа төбесіндесіз. Қағбаға бет бұрып, қол көтеріп, тәкбір-тәһлил айтып, дұға жасаңыз." : lap === 7 ? "Марвада 7-айналым бітті! Соңғы дұғаны жасаңыз." : `${hill()} төбесіне жеттіңіз (${lap}/7). Қағбаға қарап дұға жасаңыз.`);
      else {
        const inG = pos >= G1 && pos <= G2;
        status(`${lap % 2 === 0 ? "Сафа → Марва" : "Марва → Сафа"} · ${lap + 1}-айналым.${inG ? (man ? " 🟢 <b>Жасыл шамдар арасы</b> – жеңіл жүгіріңіз." : " 🟢 Жасыл шамдар арасы – әйел қалыпты жүреді.") : " Жолда дұға, зікір айтыңыз."}`);
      }
    };
    function doDua() {
      if (phase !== "dua") { toast("Дұға төбеге жеткенде жасалады"); return; }
      floatText(svg, X, yOf(pos) - 18, "Аллаһу әкбар", "#8a6416");
      if (lap === 7) {
        phase = "done";
        award(20 + ranLaps);
        sheet({ ok: true, title: "Сағи орындалды!", html: `<p>7 айналым: Сафадан басталып, Марвада бітті.${man ? ` Жасыл шамдар арасында ${ranLaps}/7 рет жүгірдіңіз.` : ""}</p>`, onNext: next });
        return;
      }
      phase = "walk";
      ranThisLap = false;
      refresh();
    }
    let lastIn = false;
    loop((dt) => {
      if (phase === "walk" && holding) {
        const inG = pos >= G1 && pos <= G2;
        const dir = lap % 2 === 0 ? 1 : -1;
        const boost = man && running && inG ? 1.8 : 1;
        if (man && inG && running) ranThisLap = true;
        if (man && inG && !running && !greenHint) { greenHint = true; toast("Жасыл шамдар арасында ер адам жеңіл жүгіреді (сүннет) 🏃"); }
        pos += dir * boost * dt / 3.4;
        if (inG !== lastIn) { lastIn = inG; refresh(); }
        if ((dir > 0 && pos >= 1) || (dir < 0 && pos <= 0)) {
          pos = dir > 0 ? 1 : 0;
          lap += 1;
          if (ranThisLap) ranLaps += 1;
          holding = false;
          $("#sy-walk")?.classList.remove("active");
          phase = "dua";
          refresh();
        }
      }
      draw();
    });
    showStart();
    draw();
  };

  /* ----- Арафат ----- */
  TASKS.arafat = (el, t, next) => {
    const START = 6 * 60 + 30, END = 19 * 60 + 30, SUNRISE = 5 * 60 + 50, SUNSET = 18 * 60 + 40, ZAWAL = 12 * 60 + 20;
    let tm = START, fast = false, prayed = false, duas = 0, lastDua = 0, done = false;
    const ZIKR = ["Лә иләһә иллаллаһу уахдаһу лә шәрикә ләһ…", "Ләббайкә, Аллаһуммә ләббайк!", "Әстағфируллаһ – тәубе етемін", "Раббәнә әтинә фид-дунйә хасанатан…", "Субханаллаһ, әлхамдулилләһ, Аллаһу әкбар", "Ата-анам, отбасым, елім үшін дұға"];
    el.innerHTML = `
      <div class="hud"><div class="count" id="af-clock">06:30</div><div><span class="badge" id="af-phase">Арафатқа келдіңіз</span></div></div>
      <div class="scene"><svg id="af-svg" viewBox="0 0 320 220"></svg></div>
      <div class="status" id="af-status"></div>
      <div class="controls">
        <button class="ctl" id="af-pray" type="button">🕌 Бесін мен екінті</button>
        <button class="ctl gold" id="af-dua" type="button">🤲 Дұға, зікір <b id="af-dn">0</b></button>
        <button class="ctl" id="af-maghrib" type="button" hidden>🌇 Ақшамды осында оқу</button>
        <button class="ctl hold" id="af-go" type="button">🚌 Муздалифаға аттану</button>
        <button class="ctl" id="af-fast" type="button" style="grid-column:1/-1">⏩ Уақытты жылдамдату</button>
      </div>`;
    const svg = $("#af-svg");
    svg.innerHTML = `
      <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop id="sky1" offset="0" stop-color="#bfe6f5"/><stop id="sky2" offset="1" stop-color="#fdf3dc"/></linearGradient></defs>
      <rect width="320" height="220" fill="url(#sky)"/>
      <circle id="af-sun" r="14" fill="#ffc94d"/>
      <path d="M150 170 Q185 95 225 170 Z" fill="#b59b76"/><rect x="185" y="108" width="4" height="16" fill="#fff"/>
      <text x="188" y="186" text-anchor="middle" font-size="9" font-weight="700" fill="#5b4a3a">Жәбәл Рахма</text>
      <rect y="170" width="320" height="50" fill="#e7d8b8"/>
      ${[20, 62, 104, 250, 292].map((x) => `<path d="M${x - 18} 196 L${x} 176 L${x + 18} 196 Z" fill="#fff" stroke="#d6c7a4"/>`).join("")}
      <g id="af-me" transform="translate(130 196)"><circle r="8" fill="#fff" stroke="#087b6b" stroke-width="3"/><circle r="3" fill="#087b6b"/></g>`;
    const status = (h, warn) => { const s = $("#af-status"); s.innerHTML = h; s.classList.toggle("warn", !!warn); };
    const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(Math.floor(m % 60)).padStart(2, "0")}`;
    const draw = () => {
      $("#af-clock").textContent = fmt(tm);
      const f = Math.min(1, Math.max(0, (tm - SUNRISE) / (SUNSET - SUNRISE)));
      const sun = $("#af-sun");
      sun.setAttribute("cx", 20 + f * 280);
      sun.setAttribute("cy", 175 - Math.sin(f * Math.PI) * 150);
      const night = tm >= SUNSET;
      $("#sky1").setAttribute("stop-color", night ? "#23364a" : tm > SUNSET - 60 ? "#f3b28a" : "#bfe6f5");
      $("#sky2").setAttribute("stop-color", night ? "#5d4a6b" : tm > SUNSET - 60 ? "#fde0b5" : "#fdf3dc");
      sun.style.display = night ? "none" : "";
      $("#af-maghrib").hidden = !night;
      $("#af-phase").textContent = tm < ZAWAL ? "Зауалды күтудеміз" : night ? "Күн батты" : "Уақфа уақыты";
      $("#af-go").classList.toggle("pulse", night);
    };
    const tip = () => {
      if (tm < ZAWAL) status("Арафаттасыз. Зауалдан кейін уақфа басталады. Тәлбия мен дұғаны жалғастырыңыз.");
      else if (tm < SUNSET) status(`<b>Уақфа жүріп жатыр.</b> ${prayed ? "Намаз оқылды." : "Бесін уақыты кірді – намазды оқыңыз."} Күн батқанша Арафаттан шықпаңыз. Дұға саны: ${duas}.`);
      else status("Күн батты. Енді <b>ақшамды оқымай</b> Муздалифаға аттанасыз.");
    };
    $("#af-fast").onclick = () => { fast = !fast; $("#af-fast").classList.toggle("toggled", fast); };
    $("#af-pray").onclick = () => {
      if (prayed) return toast("Намаз оқылды ✓");
      if (tm < ZAWAL) return slip("Бесін уақыты әлі кірмеді – зауалды күтіңіз.");
      if (tm >= SUNSET) return slip("Бесін мен екінтінің уақыты өтіп кетті.");
      prayed = true; award(10);
      $("#af-pray").classList.add("toggled");
      $("#af-pray").textContent = "🕌 Намаз оқылды ✓";
      toast("Бесін мен екінті оқылды", "good");
      tip();
    };
    $("#af-dua").onclick = () => {
      const now = performance.now();
      if (now - lastDua < 900) return;
      lastDua = now; duas += 1; $("#af-dn").textContent = duas;
      if (duas <= 8) award(2);
      toast(ZIKR[(duas - 1) % ZIKR.length], "good");
      floatText(svg, 130, 178, "🤲", "#8a6416");
      tip();
    };
    $("#af-maghrib").onclick = () => slip("Арафатта ақшам оқылмайды: ол Муздалифада құптанмен бірге оқылады.");
    $("#af-go").onclick = () => {
      if (done) return;
      if (tm < SUNSET) { slip("Күн батпай Арафаттан шығу – уәжіпті бұзу (дам керек). Күн батқанша күтіңіз."); return; }
      done = true;
      const notes = [];
      if (!prayed) { slip("Арафатта бесін мен екінтіні оқуды ұмыттыңыз."); notes.push("Бесін мен екінті оқылмады."); }
      if (duas < 3) { slip("Арафат күні – дұғаның ең абзал күні. Көбірек дұға жасаңыз."); notes.push("Дұға аз болды."); }
      award(15);
      sheet({ ok: notes.length === 0, title: "Арафат уақфасы орындалды", html: `<p>Күн батқан соң Муздалифаға аттандыңыз. ${duas} рет дұға-зікір жасадыңыз.</p>${notes.map((n) => `<p>• ${esc(n)}</p>`).join("")}<p>«Арафат күнінің дұғасы – ең абзал дұға» (хадис).</p>`, onNext: next });
    };
    let warnedPray = false;
    loop((dt) => {
      if (!done && tm < END) {
        tm = Math.min(END, tm + dt * (fast ? 90 : 22));
        if (!prayed && !warnedPray && tm > 15 * 60 + 30) { warnedPray = true; toast("Бесін мен екінтіні ұмытпаңыз!"); }
        tip();
      }
      draw();
    });
    draw(); tip();
  };

  /* ----- Муздалифа: тас жинау ----- */
  TASKS.pebbles = (el, t, next) => {
    const NEED = 10;
    let got = 0;
    el.innerHTML = `
      <p class="task-q">Жамраттарға тас жинаңыз</p>
      <p class="task-hint">Тек <b>ноқаттай</b> ұсақ тастарды басыңыз (ойында ${NEED}, шын мәнінде 49 немесе 70). Үлкен тастар жарамайды.</p>
      <div class="hud"><div class="count" id="pb-count">0<small>/${NEED} тас</small></div><span class="badge">🌙 Муздалифа түні</span></div>
      <div class="scene"><svg id="pb-svg" viewBox="0 0 320 260"></svg></div>`;
    const svg = $("#pb-svg");
    svg.innerHTML = `<rect width="320" height="260" fill="#16283a"/>${Array.from({ length: 30 }, () => `<circle cx="${Math.random() * 320}" cy="${Math.random() * 80}" r="${Math.random() * 1.2 + .3}" fill="#fff" opacity=".8"/>`).join("")}
      <path d="M270 36 a16 16 0 1 0 12 26 a12 12 0 1 1 -12 -26" fill="#ffe7a3"/>
      <path d="M0 95 Q80 80 160 92 T320 88 V260 H0 Z" fill="#8d7b61"/>
      <g transform="translate(286 232)"><rect x="-22" y="-16" width="44" height="30" rx="8" fill="#e8dcc4"/><text y="4" text-anchor="middle" font-size="16">👝</text></g>`;
    const stones = [];
    const place = () => {
      for (let tries = 0; tries < 200; tries++) {
        const x = 20 + Math.random() * 250, y = 112 + Math.random() * 130;
        if (stones.every((s) => Math.hypot(s.x - x, s.y - y) > 30)) return { x, y };
      }
      return { x: 20 + Math.random() * 250, y: 112 + Math.random() * 130 };
    };
    for (let i = 0; i < 26; i++) {
      const small = i < 15;
      const p = place();
      stones.push({ ...p, small });
      const r = small ? 5 + Math.random() * 1.5 : 12 + Math.random() * 5;
      const g = svgEl("g", { class: "stone", transform: `translate(${p.x} ${p.y})` }, svg);
      svgEl("circle", { r: small ? 14 : r + 2, fill: "transparent" }, g);
      svgEl("ellipse", { rx: r, ry: r * 0.78, fill: small ? "#cfc6b6" : "#6d5f4b", stroke: small ? "#fff8e8" : "#54493a", "stroke-width": 1.2 }, g);
      g.addEventListener("click", () => {
        if (!small) { slip("Тас ноқаттай (бұршақтай) ұсақ болуы керек."); return; }
        if (got >= NEED) return;
        got += 1;
        g.style.pointerEvents = "none";
        g.animate([{ transform: `translate(${p.x}px,${p.y}px)` }, { transform: `translate(286px,232px) scale(.3)`, opacity: 0 }], { duration: 420, easing: "ease-in", fill: "forwards" });
        $("#pb-count").innerHTML = `${got}<small>/${NEED} тас</small>`;
        if (got === NEED) {
          award(12);
          setTimeout(() => sheet({ ok: true, title: "Тастар жиналды", html: "<p>Барлығы 49 тас керек: 10-күні 7, 11-күні 21, 12-күні 21. 13-күні де қалсаңыз – тағы 21 (барлығы 70). Тастарды жууға болады.</p>", onNext: next }), 450);
        }
      });
    }
  };

  /* ----- Жамараттар ----- */
  TASKS.jamarat = (el, t, next) => {
    const P = [
      { id: "sughra", name: "Кіші", sub: "Сұғра", x: 60 },
      { id: "wusta", name: "Орта", sub: "Уста", x: 160 },
      { id: "aqaba", name: "Үлкен", sub: "Ақаба", x: 260 },
    ];
    const order = t.day === 10 ? ["aqaba"] : ["sughra", "wusta", "aqaba"];
    let idx = 0, thrown = 0, needDua = false, talb = false, busy = false;
    const total = order.length * 7;
    el.innerHTML = `
      <div class="hud"><div class="count" id="jm-count">0<small>/${total} тас</small></div><span class="badge">${t.day === 10 ? "10 Зулхижжа · таңертең" : "11 Зулхижжа · зауалдан кейін"}</span></div>
      <div class="scene"><svg id="jm-svg" viewBox="0 0 320 300"></svg></div>
      <div class="status" id="jm-status"></div>
      <div class="controls one" id="jm-controls"></div>`;
    const svg = $("#jm-svg");
    svg.innerHTML = `<rect width="320" height="300" fill="#f3efe6"/><rect y="200" width="320" height="100" fill="#e6dfd0"/>
      ${P.map((p, i) => `<g class="pillar" data-p="${p.id}">
        <ellipse cx="${p.x}" cy="190" rx="40" ry="14" fill="#cfc4ae" stroke="#b3a68b"/>
        <rect x="${p.x - 11}" y="${i === 2 ? 58 : 78}" width="22" height="${i === 2 ? 132 : 112}" rx="5" fill="#a89d8c"/>
        <text x="${p.x}" y="${i === 2 ? 48 : 68}" text-anchor="middle" font-size="12" font-weight="800" fill="#3d352a">${i + 1}. ${p.name}</text>
        <text x="${p.x}" y="224" text-anchor="middle" font-size="10" font-weight="700" fill="#7a6e5a">${p.sub}</text>
        <text class="jm-n" x="${p.x}" y="240" text-anchor="middle" font-size="11" font-weight="800" fill="#087b6b"></text>
      </g>`).join("")}
      <g transform="translate(160 278)"><circle r="10" fill="#fff" stroke="#087b6b" stroke-width="3"/><circle r="4" fill="#087b6b"/></g>`;
    const counts = { sughra: 0, wusta: 0, aqaba: 0 };
    const status = (h, warn) => { const s = $("#jm-status"); s.innerHTML = h; s.classList.toggle("warn", !!warn); };
    const upd = () => {
      $("#jm-count").innerHTML = `${order.slice(0, idx).length * 7 + thrown}<small>/${total} тас</small>`;
      svg.querySelectorAll(".pillar").forEach((g) => { const n = counts[g.dataset.p]; $(".jm-n", g).textContent = n ? `${n}/7` : ""; });
      const cur = P.find((p) => p.id === order[idx]);
      const ctl = $("#jm-controls");
      if (needDua) {
        status("Шетке шығып, құбылаға бет бұрып, қол көтеріп дұға жасаңыз (сүннет).");
        ctl.innerHTML = `<button class="ctl gold pulse" id="jm-dua" type="button">🤲 Құбылаға қарап дұға жасау</button>`;
        $("#jm-dua").onclick = () => { needDua = false; idx += 1; thrown = 0; award(4); toast("Дұға қабыл болсын 🤲", "good"); upd(); };
      } else if (cur) {
        ctl.innerHTML = "";
        status(`<b>${cur.name} (${cur.sub})</b> жамратын басып, тас лақтырыңыз: ${thrown}/7. Әр тасқа «Бисмилләһи, Аллаһу әкбар».`);
      }
    };
    svg.querySelectorAll(".pillar").forEach((g) => g.addEventListener("click", () => {
      if (busy || idx >= order.length) return;
      const id = g.dataset.p;
      if (needDua) { toast("Алдымен құбылаға қарап дұға жасаңыз 🤲"); return; }
      if (id !== order[idx]) {
        slip(t.day === 10 ? "10 Зулхижжа күні тек Үлкен (Ақаба) жамратқа тас лақтырылады." : "Рет: Кіші → Орта → Үлкен. Бұл жамраттың кезегі емес.");
        return;
      }
      const p = P.find((x) => x.id === id);
      busy = true;
      const stone = svgEl("circle", { cx: 160, cy: 268, r: 4, fill: "#6d5f4b" }, svg);
      const dx = p.x - 160 + (Math.random() * 30 - 15), dy = 190 - 268 + (Math.random() * 8 - 4);
      stone.animate([{ transform: "translate(0px,0px)" }, { transform: `translate(${dx / 2}px,${dy - 70}px)` }, { transform: `translate(${dx}px,${dy}px)` }], { duration: 380, easing: "ease-out", fill: "forwards" });
      setTimeout(() => {
        busy = false;
        stone.setAttribute("fill", "#9c8f7a");
        setTimeout(() => stone.remove(), 600);
        floatText(svg, p.x, 150, "Аллаһу әкбар", "#8a6416");
        if (!talb && t.day === 10) { talb = true; toast("Тәлбия тоқтады", "good"); }
        thrown += 1; counts[id] += 1;
        if (thrown === 7) {
          if (id !== "aqaba") { needDua = true; upd(); return; }
          idx += 1; thrown = 0; upd();
          award(t.day === 10 ? 15 : 25);
          sheet({ ok: true, title: t.day === 10 ? "Ақаба жамраты – 7 тас" : "Үш жамрат – 21 тас", html: t.day === 10 ? "<p>Ақабадан кейін тоқтамай кетесіз. Келесі амал – құрбандық.</p>" : "<p>Кіші мен Ортадан кейін дұға жасадыңыз, Ақабадан кейін тоқтамай кеттіңіз. 12-күні дәл осылай тағы 21 тас лақтырылады.</p>", onNext: next });
          return;
        }
        upd();
      }, 390);
    }));
    upd();
  };

  /* ----- Шаш алу ----- */
  TASKS.shave = (el, t, next) => {
    const man = isMan();
    const opts = man
      ? [{ t: "Шашты түгел алу (халқ) – абзал", ok: true, full: true }, { t: "Бастың кемінде 1/4 бөлігін саусақ ұшындай қысқарту (тақсир)", ok: true }, { t: "Бір-екі тал шашты қию", why: "Ханафи бойынша бастың кемінде төрттен бірі қысқартылуы керек." }, { t: "Шаш алмай-ақ ихрамды шешу", why: "Шаш алмай ихрамнан шығу мүмкін емес." }]
      : [{ t: "Шаш ұштарынан саусақ ұшындай (≈2 см) кесу", ok: true }, { t: "Шашты түгел қырқу", why: "Әйел адамға шашты қыру – тыйым." }, { t: "Шаш алмай-ақ ихрамнан шығу", why: "Шаш алмай ихрамнан шығу мүмкін емес." }];
    const list = shuffle(opts);
    el.innerHTML = `<p class="task-q">Ихрамнан шығу үшін шашты қалай аласыз?</p><div class="opts">${list.map((o, i) => `<button class="opt" type="button" data-i="${i}"><span class="mark"></span>${esc(o.t)}</button>`).join("")}</div>`;
    el.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
      const o = list[+b.dataset.i];
      if (!o.ok) { b.classList.add("bad"); b.disabled = true; slip(o.why); return; }
      award(8);
      cut(o.full);
    }));
    function cut(full) {
      const n = man ? (full ? 12 : 7) : 8;
      el.innerHTML = `<p class="task-q">${man ? (full ? "Шашты алыңыз ✂️" : "Шашты қысқартыңыз ✂️") : "Шаш ұштарын кесіңіз ✂️"}</p>
        <p class="task-hint">Әр бөлікті басыңыз.</p>
        <div class="hud"><div class="count" id="sh-count">0<small>/${n}</small></div><span class="badge">«Аллаһу әкбар»</span></div>
        <div class="scene"><svg id="sh-svg" viewBox="0 0 320 260"></svg></div>`;
      const svg = $("#sh-svg");
      svg.innerHTML = `<rect width="320" height="260" fill="#f7f4ec"/>
        <rect x="118" y="190" width="84" height="70" rx="30" fill="#fff" stroke="#e6dfcd"/>
        ${man ? "" : `<path d="M100 110 Q96 200 120 230 L200 230 Q224 200 220 110 Z" fill="#3b2a20"/>`}
        <ellipse cx="160" cy="130" rx="54" ry="64" fill="#f1cfae"/>
        <circle cx="140" cy="135" r="4" fill="#3b2a20"/><circle cx="180" cy="135" r="4" fill="#3b2a20"/>
        <path d="M145 165 Q160 175 175 165" fill="none" stroke="#b07a5a" stroke-width="3" stroke-linecap="round"/>
        ${man ? "" : `<path d="M104 96 Q160 40 216 96 Q200 80 160 78 Q120 80 104 96 Z" fill="#3b2a20"/>`}`;
      let c = 0;
      const pts = [];
      for (let i = 0; i < n; i++) {
        if (man) { const a = Math.PI * (0.12 + (0.76 * i) / (n - 1)); pts.push([160 - Math.cos(a) * 50, 118 - Math.sin(a) * 58]); }
        else pts.push([112 + (i * 96) / (n - 1), 226 + (i % 2) * 6]);
      }
      pts.forEach(([x, y]) => {
        const g = svgEl("g", { class: "tuft" }, svg);
        g.style.transformOrigin = `${x}px ${y}px`;
        svgEl("circle", { cx: x, cy: y, r: 16, fill: "transparent" }, g);
        svgEl("ellipse", { cx: x, cy: y, rx: man ? 13 : 7, ry: man ? 10 : 11, fill: "#3b2a20" }, g);
        g.addEventListener("click", () => {
          g.classList.add("cut");
          c += 1;
          $("#sh-count").innerHTML = `${c}<small>/${n}</small>`;
          if (c === n) {
            award(10);
            setTimeout(() => sheet({ ok: true, title: run.mode === "umrah" ? "Ихрамнан шықтыңыз!" : "Бірінші тахаллул", html: run.mode === "umrah" ? "<p>Ұмра толық аяқталды. Ихрам тыйымдары жойылды. Аллаһ қабыл етсін!</p>" : "<p>Жұбайлық қатынастан басқа ихрам тыйымдары жойылды. Енді Ифада тауафына барамыз.</p>", onNext: next }), 350);
          }
        });
      });
    }
  };

  /* ---------------- Нұсқаулық ---------------- */
  function renderGuide(k) {
    document.querySelectorAll("#guide-tabs [data-g]").forEach((b) => b.classList.toggle("active", b.dataset.g === k));
    $("#guide-body").innerHTML = MODES[k].stages.map((s) => `<article class="card guide-step">
        <div class="gh"><i>${s.icon}</i><div><small>${esc(s.day)}</small><b>${esc(s.title)}</b></div></div>
        ${actionsHtml(s.actions)}
        ${(s.duas || []).map(duaHtml).join("")}
      </article>`).join("");
  }
  $("#open-guide").onclick = () => { renderGuide("umrah"); $("#guide-view").classList.add("open"); $("#guide-view").setAttribute("aria-hidden", "false"); };
  $("#close-guide").onclick = () => { $("#guide-view").classList.remove("open"); $("#guide-view").setAttribute("aria-hidden", "true"); };
  document.querySelectorAll("#guide-tabs [data-g]").forEach((b) => (b.onclick = () => { renderGuide(b.dataset.g); $("#guide-view").scrollTop = 0; }));

  renderHome();
})();
