(() => {
  const KEY = "umrah-app-v1";
  // Flutter қосымшасының ішінде (WebView) ашылғанда: ?embed=1. Артқа/жабу хост қолданбаға беріледі
  const EMBED = new URLSearchParams(location.search).get("embed") === "1";
  // Flutter «артқа» түймесі: экрандағы «артқа» сілтемесін басады (тарих тізбегімен араласпайды)
  window.__umrahBack = () => { const b = document.querySelector(".tb .ib[href], .gback[href]"); if (b) { b.click(); return true; } return false; };
  const hostClose = () => { try { if (window.flutter_inappwebview) { window.flutter_inappwebview.callHandler("umrahClose"); return true; } } catch (e) { /* хост жоқ */ } return false; };
  const app = document.getElementById("app");
  const toastEl = document.getElementById("toast");

  const DUA = {
    ihram: { cue: "dua_ihram", ar: "لَبَّيْكَ اللَّهُمَّ عُمْرَةً", tr: "Ләббайк, Аллаһумма 'умра.", kk: "Уа Аллаһ, ұмраны ниет етіп, осындамын." },
    talbiyah: { cue: "dua_talbiyah", ar: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ", tr: "Ләббайкә Аллаһумма ләббайк, ләббайкә ләә шәрикә ләкә ләббайк, инналь-хамдә уан-ни'мәтә ләкә уәл-мүлк, ләә шәрикә ләк.", kk: "Мен осындамын, уа Аллаһ, мен осындамын. Сенің серігің жоқ, мен осындамын. Барлық мадақ, нығмет және билік Саған тән." },
    rabbana: { h: "Йемен бұрышы → Қара тас бұрышы", cue: "Рүкн йәмани", ar: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", tr: "Раббана атина фид-дүнйа хасәнәтән уә фил-ахирати хасәнәтән уә қина 'азабән-нар.", kk: "Раббымыз, бізге дүниеде де, ахиретте де жақсылық бер, тозақ азабынан сақта. (Йемен бұрышы мен Қара тас арасында)" },
    safa: { cue: "dua_safa", ar: "إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ. أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ. لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", tr: "Иннас-Сафа уәл-Мәрута мин шә'аирил-Лаһ. Абдәү бимә бәдәәл-Лаһу бих. Лә иләһә илләл-Лаһу уахдәһү лә шәрикә ләһ, ләһул-мүлкү уә ләһул-хамд, уә һуә 'алә кулли шәй'ин қадир.", kk: "Сафа мен Мәруа — Аллаһтың белгілерінен. Аллаһ бастаған жерден бастаймын. Одан басқа тәңір жоқ, Ол жалғыз, серігі жоқ…" },
    tw0: { h: "Қара тас бұрышы → Ирак бұрышы", cue: "Қара тас", ar: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ", tr: "Субханал-Лаһи уәл-хамду лил-Лаһи уә лә иләһә илләл-Лаһу уәл-Лаһу әкбар.", kk: "Аллаһ пәк, барлық мадақ Аллаһқа, одан басқа тәңір жоқ, Аллаһ ұлы." },
    tw1: { h: "Ирак бұрышы → Шам бұрышы (Хижр жағы)", cue: "Рүкн ирақ", ar: "اللَّهُمَّ اجْعَلْهَا عُمْرَةً مَبْرُورَةً وَسَعْيًا مَشْكُورًا وَذَنْبًا مَغْفُورًا", tr: "Аллаһуммә-ж'алһә 'умратән мәбрураһ, уә сә'йән мәшкураһ, уә занбән мағфураһ.", kk: "Уа Аллаһ, бұл ұмраны қабыл етілген, жүрісімді мақұлданған, күнәмді кешірілген қыл." },
    tw2: { h: "Шам бұрышы → Йемен бұрышы", cue: "Рүкн шам", ar: "رَبِّ اغْفِرْ وَارْحَمْ وَاعْفُ عَمَّا تَعْلَمُ، إِنَّكَ أَنْتَ الْأَعَزُّ الْأَكْرَمُ", tr: "Рабби-ғфир уархам уа'фу 'аммә та'ләм, иннәкә әнтәл-а'аззул-әкрам.", kk: "Раббым, кешір, мейірім ет, білетін күнәләрімнен өт. Сен ең құдіретті, ең жомартсың." },
    maqamAyah: { h: "Мақамға жақындағанда", ar: "وَاتَّخِذُوا مِن مَّقَامِ إِبْرَاهِيمَ مُصَلًّى", tr: "Уаттахизу мин мақами Ибраһима мусаллә.", kk: "Ибраһим тұрған жерді намаз оқитын орын етіңдер. (Бақара сүресі, 125-аят)" },
    kafirun: { h: "1-рәкәт: Фатиха + Кәфирун сүресі (109)", ar: "قُلْ يَا أَيُّهَا الْكَافِرُونَ لَا أَعْبُدُ مَا تَعْبُدُونَ", tr: "Кул йә әййүһәл-кәфирун. Лә а'буду мә та'будун. Уә лә әнтум 'абидүнә мә а'буд. Уә лә ана 'абидүн мә 'абаттум. Уә лә әнтум 'абидүнә мә а'буд. Лакум дийнүкум уә лийә дийн.", kk: "Айт: уа, кәпірлер! Мен сендер құлшылық ететінге құлшылық етпеймін… Сендердің дініңдер өздеріңе, менің дінім өзіме." },
    ikhlas: { h: "2-рәкәт: Фатиха + Ихлас сүресі (112)", ar: "قُلْ هُوَ اللَّهُ أَحَدٌ", tr: "Кул һуәл-Лаһу әһад. Аллаһус-самад. Лам йәлид уә лам йүләд. Уә лам йәкун ләһу куфуән әһад.", kk: "Айт: Ол — Аллаһ, жалғыз. Аллаһ — барлығы Оған мұқтаж. Ол тумаған да, туылмаған да. Оған тең ешкім жоқ." },
    gate: { ar: "بِسْمِ اللَّهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ", tr: "Бисмил-Лаһ, уәс-саләту уәс-сәләму 'алә расулил-Лаһ. Аллаһумма-фтах ли абуаба рахматик.", kk: "Аллаһтың атымен. Расулуллаһқа салауат пен сәлем болсын. Уа Аллаһ, маған мейіріміңнің есіктерін аш." },
    saiStart: { cue: "Иннәс-сафа", tr: "Иннәс-сафа уәл-мәруата мин шаъайирилләһ. Фә-мән хажжәл-бәйтә әу иътәмәра фәлә жунәха ғаләйһи әййәттауәуафә би-һимә. Уә мән тәтауәуаға хайран фә-иннәллаһә шәкирун ғалим.", kk: "Расында, Сафа мен Мәруа — Аллаһтың белгілерінен. Кім қажылық немесе умра орындаса, ол екеуінде тауап етудің оқасы жоқ. Кімде-кім артықша жақсылық істесе, Аллаһ — шүкірлікті Қабылдаушы, толық Білуші. (Бақара, 158-аят)" },
    saiTahlil: { cue: "аллаһу акбар", tr: "Аллаһу әкбар, Аллаһу әкбар, Аллаһу әкбар. Лә иләһә иллаллаһу, уахдәһу лә шәрикә ләһу, ләһул-мүлку уә ләһул-хамду, уә һуә ғалә кулли шәйин қадир. Лә иләһә иллаллаһу уахдәһу, әнжәзә уағдәһу, уә насара ғабдәһу, уә һәзәмәл-әхзәбә уахдәһ.", kk: "Жалғыз, серігі жоқ Аллаһтан басқа тәңір жоқ. Билік пен мақтау Оған тән, Ол — әр нәрсеге құдіретті. Ол уәдесін орындады, құлына көмек берді, бүкіл топты жалғыз Өзі жеңді." },
    stone: { h: "Қара тас бұрышында (бастау)", cue: "Бисмилла Аллаһу әкбар", ar: "بِسْمِ اللَّهِ، اللَّهُ أَكْبَرُ", tr: "Бисмил-Лаһ, Аллаһу әкбар.", kk: "Аллаһтың атымен, Аллаһ ұлы. (Қара тасқа қарап, қолды көтеріп айтылады)" },
    zamzam: { ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا وَاسِعًا وَشِفَاءً مِنْ كُلِّ دَاءٍ", tr: "Аллаһумма инни әс'әлүкә 'илмән нәфи'ән, уә ризқән уәси'ән, уә шифә'ән мин кулли даа'.", kk: "Уа Аллаһ, Сенен пайдалы білім, кең несібе және әрбір дерттен шипа тілеймін. (Замзам ішкенде)" },
  };


  // navStep — umrah.html ішіндегі қадам индексі (карта навигациясы); figs — сызбалар (SCH кілттері)
  const MODS = [
    { key: "ihram", title: "Ихрам және ниет", sub: "Ғұсыл, киім, ниет, миқат", navStep: 1, figs: [], duas: ["ihram", "talbiyah"],
      lead: "Ұмра ихрамға кіруден басталады.",
      steps: ["Ғұсыл алыңыз.", "Ер адам ихрам матасын, әйел адам жай киімін киеді.", "Ниет етіңіз: «Ләббайк, Аллаһумма 'умра».", "Миқатта немесе ұшақта ихрамға кіріп, тәлбия айтыңыз."],
      warn: ["Ихрамда иіс су жағу, шаш пен тырнақ алу, аң аулау және ұрыс-керіс харам.", "Миқат — ихрамсыз өтуге болмайтын шекара."] },
    { key: "gate", title: "Абдулазиз патша қақпасы", sub: "1-қақпа · мешітке кіру", navStep: 2, figs: ["gate"], duas: ["gate"],
      lead: "Мешітке Абдулазиз патша қақпасынан кіресіз.",
      steps: ["Баспалдақпен көтеріліп, есікке жақындаңыз.", "Оң аяқпен кіріп, дұға оқыңыз.", "Қағбаны көргенше тәлбия айтып, Қағбаға қарай жүріңіз."],
      warn: ["Кезек күтіп, итерісіп өтпеңіз.", "Аяқ киімді қалташаға салып, өзіңізбен алыңыз."] },
    { key: "stone", title: "Қара тас", sub: "Тауаф басталатын жер", navStep: 2, figs: ["stone"], duas: ["stone"],
      lead: "Қағба бұрышындағы жасыл жарықты сызық — тауаф басы мен соңы.",
      steps: ["Қара тас сызығына қараңыз.", "Қолды көтеріп «Бисмил-Лаһ, Аллаһу әкбар» деңіз.", "Қағба сол жағыңызда болатындай бұрылыңыз.", "Ер адам оң иығын ашады (идтиба)."],
      warn: ["Қара тасты сүю міндетті емес — тығыз болса, алыстан ишара жасаңыз."] },
    { key: "tawaf", title: "Тауаф", sub: "Қағбаны 7 рет айналу", navStep: 3, figs: [], duas: ["stone", "tw0", "tw1", "tw2", "rabbana"], count: 7, label: "айналым",
      lead: "Қағбаны сол жағыңызға алып, сағат тіліне қарсы айналасыз.",
      steps: ["Қара тастан келесі бұрышқа дейін бір дұға, әр бұрышта келесісі оқылады — төмендегі «Тауаф жолы» айтып тұрады.","Әр айналым Қара тас бұрышында аяқталады.", "Алғашқы 3 айналымда ер адам ширақ жүреді (рамль), қалғанында жай.", "Йемен бұрышы мен Қара тас арасында «Раббана атина…» оқыңыз."],
      warn: ["Хижр ішімен жүрмеңіз — тауаф жарамсыз болады, себебі Хижр Қағбаның бір бөлігі.",  "Қара тас пен Мақам жанында итерісіп, араласып кетпеңіз.", "Ер адам оң иығын 3-айналым біткен соң жабады — қосымша ескерту шығады.", "Тек Йәмани мен Қара тас арасындағы дұға хадисте айтылған. Қалғандары — ұсынылатын зікірлер, өз дұғаңызды да оқи аласыз.", "Тауаф дәретпен жасалады."] },
    { key: "maqam", title: "Ибраһим мақамы", sub: "2 рәкәт намаз", navStep: 4, figs: ["maqamClose"], duas: ["maqamAyah", "kafirun", "ikhlas", "zamzam"],
      lead: "Тауафтан кейін Ибраһим мақамына барып, 2 рәкәт намаз оқисыз.",
      steps: ["Тауаф біткен соң Ибраһим мақамына барыңыз.", "Қоршаудың артында 2 рәкәт намаз оқыңыз.", "1-рәкәт: Фатиха + Кәфирун. 2-рәкәт: Фатиха + Ихлас.", "Замзам ішіп, тілек тілеңіз."],
      warn: ["Тығыз болса — мешіттің кез келген бос жерінде оқыңыз.", "Қоршауға сүйенбеңіз, Мақамды сипап-сүртпеңіз.", "Өтетін жолды бөгемеңіз."] },
    { key: "sai", title: "Сафа мен Мәруа", sub: "7 жүріс", navStep: 5, figs: ["sai", "safaClose", "marwaClose"], duas: ["safa"], count: 7, label: "жүріс",
      lead: "Сафадан Мәруаға — 1-жүріс, кері — 2-жүріс. 7-жүріс Мәруада аяқталады.",
      steps: ["Сафада Қағбаға қарап, қол көтеріп дұға оқыңыз.", "Жасыл белгіде ер адам жүгіреді, әйел жай жүреді.", "Әр бағыт — бір жүріс: «+1» басыңыз."],
      warn: ["Дәретпен жүру абзал, бірақ шарт емес."] },
    { key: "hair", title: "Шашты алу", sub: "Ихрамнан шығу", navStep: 7, figs: ["hair"], duas: [],
      lead: "Соңғы қадам — шашты алдыру немесе қысқарту.",
      steps: ["Шашты алдырыңыз немесе қысқартыңыз.", "Ер адам: толық алдыру абзал. Әйел: шаш ұшынан бір сүйем.", "Осымен ұмра аяқталады."],
      warn: ["Ихрамнан тауаф пен сағи толық біткен соң ғана шығасыз."] },
  ];

  // ---- белгішелер (бір стиль: 24×24, контур) ----
  const PATH = {
    stop: "M7 7h10v10H7z",
    lock: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5zM12 15.5v2.5",
    ihram: "M12 3.5a2 2 0 0 1 2 2c0 1.2-2 1.6-2 3.2M12 8.7 3 15.5h18z M5 19.5h14",
    gate: "M6 21V10a6 6 0 0 1 12 0v11M3 21h18M12 12v9",
    stone: "M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0M12 12m-2.6 0a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0-5.2 0",
    tawaf: "M20 12a8 8 0 1 1-2.6-5.9M20 4v4.5h-4.5",
    maqam: "M5 21v-8a7 7 0 0 1 14 0v8M3 21h18M12 3v3",
    sai: "M4 8h16M16 4l4 4-4 4M20 16H4M8 12l-4 4 4 4",
    hair: "M6 8.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0M6 15.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0M8 10l12 9M8 14 20 5",
    guide: "M4 5.5C7 4.5 9.6 4.8 12 6.5c2.4-1.7 5-2 8-1v13c-3-1-5.6-.7-8 1-2.4-1.7-5-2-8-1zM12 6.5v13",
    dua: "M12 21c-5-3.8-8-7-8-10.5A4.5 4.5 0 0 1 12 8a4.5 4.5 0 0 1 8 2.5C20 14 17 17.2 12 21z",
    tip: "M12 3 2.5 20h19zM12 10v4.5M12 17.4v.1",
    nav: "M12 3 5 20l7-4 7 4z",
    map: "M9 4 3 6.5v13L9 17l6 3 6-2.5v-13L15 7zM9 4v13M15 7v13",
    group: "M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16.5 11a2.6 2.6 0 1 0 0-5.2M2.5 19.5c0-3.2 2.7-5.5 6-5.5s6 2.3 6 5.5M16 14.2c3 0 5.5 2 5.5 5",
    close: "M6 6l12 12M18 6 6 18",
    plane: "M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z",
    mosque: "M4 21v-8M20 21v-8M4 13c0-4 4-5 8-9 4 4 8 5 8 9M2 21h20M12 4V2M9 21v-4a3 3 0 0 1 6 0v4",
    shower: "M7 5a4 4 0 0 1 8 0M3 9h16M6 13v1M10 13v2M14 13v1M8 17v1M12 17v2",
    map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14",
    check: "M5 12.5l4.5 4.5L19 7.5",
    next: "M9 6l6 6-6 6",
    back: "M15 6l-6 6 6 6",
    arrow: "M5 12h14M13 6l6 6-6 6",
    plus: "M12 5v14M5 12h14",
    undo: "M9 14 4 9l5-5M4 9h9a6 6 0 0 1 0 12h-3",
    reset: "M3 12a9 9 0 1 0 3-6.7M3 4v5h5",
    play: "M7 4.5v15l13-7.5z",
    sound: "M4 9.5v5h3.5L12 18.5v-13L7.5 9.5zM15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11",
    mute: "M4 9.5v5h3.5L12 18.5v-13L7.5 9.5zM16 9.5l5 5M21 9.5l-5 5",
  };
  const ic = (k, s = 22) => `<svg class="i" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${k === "play" || k === "stop" ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${PATH[k]}"/></svg>`;

  // ---- күй ----
  // Екі бөлек прогресс: өз ұмраңыз (KEY) және бәдәл ұмра (KEY-badal, маршрут #/b/...)
  const loadS = (k) => { let o; try { o = JSON.parse(localStorage.getItem(k)) || {}; } catch { o = {}; } o.done = Array.isArray(o.done) ? o.done : []; return o; };
  let CUR_KEY = KEY, BADAL = false;
  let S = loadS(KEY);
  const HB = () => (BADAL ? "#/b" : "#");
  const save = () => { try { localStorage.setItem(CUR_KEY, JSON.stringify(S)); } catch {} };
  const isDone = (i) => S.done.includes(i);
  const cur = () => { const i = MODS.findIndex((_, k) => !isDone(k)); return i < 0 ? MODS.length : i; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  let toastT;
  function toast(t) { toastEl.textContent = t; toastEl.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (toastEl.hidden = true), 2400); }

  // ---- дыбыс (umrah-audio/<id>.mp3, файл жоқ болса — хабарлама) ----
  const player = new Audio(), AUDIO = "./umrah-audio/";
  // cue → ASCII файл аты (қосымшаға орау кезінде кирилл атаулы файлдар қауіпсіз емес)
  const AUDIO_FILES = { "Қара тас": "qara_tas", "Рүкн ирақ": "rukn_iraq", "Рүкн йәмани": "rukn_yamani", "Рүкн шам": "rukn_sham", "аллаһу акбар": "allahu_akbar", "Иннәс-сафа": "innas_safa" };
  let seqTok = 0;
  // Тек жазылған файл (umrah-audio/<cue>.mp3) ойнайды; файл жоқ болса — хабарлама, қосымша дауыс жоқ
  function playOne(d, quiet = false) {
    return new Promise((res) => {
      let done = false;
      const end = (ok) => { if (done) return; done = true; if (!ok && !quiet) toast("Бұл дұғаның аудио жазбасы әлі жоқ"); res(ok); };
      if (!d.cue) return end(false);
      player.onended = () => end(true); player.onerror = () => end(false);
      player.src = AUDIO + (AUDIO_FILES[d.cue] || encodeURIComponent(d.cue)) + ".mp3";
      player.play().catch(() => end(false));
    });
  }

  // Аудио ойнап тұрғанда дыбыс толқыны (эквалайзер) көрінеді
  const wave = () => (talking ? `<span class="wave" aria-hidden="true">${"<i></i>".repeat(84)}</span>` : "");
  // Мәтін аудиомен бірге жүреді: сөздер аудио уақытына қарай (әріп санына шамалас) белгіленеді
  const kar = (cue, text) => `<k-r class="kar" data-cue="${esc(cue)}">${String(text).split(/\s+/).map((w) => `<k-w class="kw" data-w="${w.length}">${esc(w)}</k-w>`).join(" ")}</k-r>`;
  function karTick() {
    const cue = decodeURIComponent(player.src.split("/").pop() || "").replace(/\.mp3$/, "").normalize("NFC"), on = !player.paused && player.duration > 0, pr = on ? Math.min(1, player.currentTime / player.duration) : 0;
    document.querySelectorAll(".kar").forEach((el) => {
      const act = on && String(el.dataset.cue).normalize("NFC") === cue, ws = el.querySelectorAll(".kw");
      el.classList.toggle("on", act);
      if (!act) { ws.forEach((w) => w.classList.remove("p", "c")); return; }
      let tot = 0; ws.forEach((w) => (tot += +w.dataset.w + 1));
      let acc = 0;
      ws.forEach((w) => { const a = acc / tot; acc += +w.dataset.w + 1; const b = acc / tot; w.classList.toggle("p", pr >= b); w.classList.toggle("c", pr >= a && pr < b); });
    });
    requestAnimationFrame(karTick);
  }
  requestAnimationFrame(karTick);

  // Дыбыс күйі: ойнап тұрғанда экранда «Тоқтату» батырмасы көрінеді
  const stopBtn = document.createElement("button");
  stopBtn.className = "stopfab"; stopBtn.hidden = true; stopBtn.setAttribute("aria-label", "Дыбысты тоқтату");
  document.body.appendChild(stopBtn);
  let talking = false;
  function setTalking(v) {
    if (talking === v) return;
    talking = v;
    stopBtn.hidden = !v || !!document.getElementById("twc") || !!document.getElementById("sai") || !!document.getElementById("gpg"); // «Тоқтату» картаның ішінде
    twRefresh(); saiRefresh(); gpRefresh();
  }
  function stopAudio() {
    seqTok++;
    player.pause(); setTalking(false);
  }
  stopBtn.onclick = stopAudio;

  // Айналым ескертуі (3-айналымнан кейін оң иықты жабу): экранда тұрады, ✕ немесе келесі бұрышқа жеткенде жабылады
  const noteEl = document.createElement("div");
  noteEl.className = "notefab"; noteEl.hidden = true;
  noteEl.setAttribute("role", "status");
  document.body.appendChild(noteEl);
  function hideNote() { noteEl.hidden = true; }
  function showNote(text) {
    noteEl.innerHTML = `<span class="nf-i">${ic("tip", 22)}</span><span class="nf-t">${esc(text)}</span><button class="nf-x" aria-label="Жабу">${ic("close", 18)}</button>`;
    noteEl.querySelector(".nf-x").onclick = hideNote;
    noteEl.hidden = false;
  }

  // loop: тізбек біткен соң соңғы дұға келесі әрекетке дейін үзіліспен қайталана береді
  async function playSeq(keys, loop = false) {
    const t = ++seqTok, wait = (ms) => new Promise((r) => setTimeout(r, ms)), quiet = loop || keys.length > 1;
    player.pause();
    setTalking(keys.length > 0);
    try {
      // жазбасы жоқ дұға тізбекті үзбейді, келесісіне өтеді
      for (const k of keys) { if (t !== seqTok) return; await playOne(DUA[k], quiet); }
      while (loop && keys.length && t === seqTok) {
        await wait(1500);
        if (t !== seqTok || (await playOne(DUA[keys[keys.length - 1]], true)) === false) return;
      }
    } finally { if (t === seqTok) setTalking(false); }
  }




  // Тауаф сызбасы: Қағба + 7 концентр шеңбер; санауышқа қарай толады
  function tawafSvg(n, k = twk, pray = false) {
    const cx = 160, cy = 176, F = 'font-family="Roboto" font-weight="700"', act = n < 7 && k >= 0 ? k : -1, nxt = act >= 0 ? (act + 1) % 4 : 0;
    const R = (i) => [34 + 16.5 * i, 14 + 10.5 * i]; // айналым i шеңберінің жарты осьтері
    let rings = "", badges = "", seg = "";
    for (let i = 1; i <= 7; i++) {
      const [rx, ry] = R(i), done = i <= n, cur = i === n + 1 && !pray;
      const col = done ? "#ff8a1f" : cur ? (pray ? "#13211c" : "#2f7cff") : "#beb0a2";
      rings += `<path d="M${cx} ${cy + ry}A${rx} ${ry} 0 1 0 ${cx} ${cy - ry}A${rx} ${ry} 0 1 0 ${cx} ${cy + ry}" fill="none" stroke="${col}" stroke-width="${done ? 4 : cur ? 4.5 : 1.8}"${cur && act >= 0 ? ' opacity=".3"' : ""}${cur && act < 0 && !pray ? ' stroke-dasharray="8 5"' : ""}/>`;
      // айналым нөмірі — Қара тас сызығында (айналым осы жерден басталып, осында бітеді)
      const bx = cx + (i % 2 ? -11 : 11), by = cy + ry;
      badges += `<circle cx="${bx}" cy="${by}" r="6.5" fill="${done ? "#ff8a1f" : cur ? "#2f7cff" : "#fff"}" stroke="${done || cur ? "#fff" : "#beb0a2"}" stroke-width="1.8"/><text x="${bx}" y="${by + 3.3}" text-anchor="middle" ${F} font-size="9" fill="${done || cur ? "#fff" : "#71675f"}">${i}</text>`;
      if (cur && act >= 0) {
        const P = [[cx, cy + ry], [cx + rx, cy], [cx, cy - ry], [cx - rx, cy]], a = P[act], b = P[(act + 1) % 4];
        const t = ((45 - 90 * act) * Math.PI) / 180, mx = cx + rx * Math.cos(t), my = cy + ry * Math.sin(t), rot = (Math.atan2(-ry * Math.cos(t), rx * Math.sin(t)) * 180) / Math.PI;
        seg = `<path d="M${a[0]} ${a[1]}A${rx} ${ry} 0 0 0 ${b[0]} ${b[1]}" fill="none" stroke="#2f7cff" stroke-width="6" stroke-linecap="round"/><g transform="translate(${mx.toFixed(1)} ${my.toFixed(1)}) rotate(${rot.toFixed(1)})"><path d="M-7-6L7 0-7 6z" fill="#fff" stroke="#2f7cff" stroke-width="2.5" stroke-linejoin="round"/></g>`;
      }
    }
    // бұрыштар: 1 Қара тас, 2 Ирақи, 3 Шам (артында — төбесінде), 4 Йәмани
    const sc = (x, y) => [160 + 0.85 * (x - 160), 176 + 0.85 * (y - 176)];
    const C = [[160, 192], [202, 176], [160, 90], [118, 176]].map(([x, y]) => sc(x, y));
    let marks = "";
    C.forEach(([x, y], i) => {
      if (i === nxt && act >= 0) marks += `<circle cx="${x}" cy="${y}" r="12" fill="none" stroke="#fff" stroke-width="2"><animate attributeName="r" values="11;18" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".7;0" dur="2.4s" repeatCount="indefinite"/></circle><circle cx="${x}" cy="${y}" r="11.5" fill="none" stroke="#fff" stroke-width="2.4"/>`;
      marks += `<circle cx="${x}" cy="${y}" r="9" fill="#7a4a1c" stroke="#fff" stroke-width="2.5"/><text x="${x}" y="${y + 3.5}" text-anchor="middle" ${F} font-size="10.5" fill="#fff">${i + 1}</text>`;
    });
    // жұқа стрелка: ашық «V» ұшы
    const arr = (x1, y1, x2, y2, col = "#13211c", w = 1.4, h = 6) => {
      const a = Math.atan2(y2 - y1, x2 - x1), p = (d) => `${(x2 - h * Math.cos(a + d)).toFixed(1)} ${(y2 - h * Math.sin(a + d)).toFixed(1)}`;
      return `<path d="M${x1} ${y1}L${x2} ${y2}M${p(-0.5)}L${x2} ${y2}L${p(0.5)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    };
    const pill = (x, y, t, an) => { const w = t.length * 6.2 + 14, x0 = an === "end" ? x - w : an === "middle" ? x - w / 2 : x; return `<rect x="${x0}" y="${y - 12}" width="${w}" height="18" rx="9" fill="#fff" stroke="#e2dcd6" stroke-width="1"/><text x="${x0 + w / 2}" y="${y + 0.5}" text-anchor="middle" ${F} font-size="10.5" fill="#13211c">${t}</text>`; };
    return `<svg viewBox="3 50 ${pray ? 362 : 314} 254"><rect x="3" y="50" width="${pray ? 362 : 314}" height="254" fill="#f5f0eb"/>
${rings}${seg}
<g transform="translate(160 176) scale(.85) translate(-160 -176)"><path d="M202 178C236 176 238 136 176 132Z" fill="#fbf6e9" stroke="none"/><path d="M202 178C236 176 238 136 176 132" fill="none" stroke="#000" stroke-opacity=".09" stroke-width="11" stroke-linecap="round" transform="translate(1.5 2.5)"/><path d="M202 178C236 176 238 136 176 132" fill="none" stroke="#8d7f70" stroke-width="9" stroke-linecap="round"/><path d="M202 178C236 176 238 136 176 132" fill="none" stroke="#fffdf8" stroke-width="6" stroke-linecap="round"/><path d="M202 178C236 176 238 136 176 132" fill="none" stroke="#cfc3b3" stroke-width="1" stroke-linecap="round" transform="translate(-1.2 0)"/></g>
<g transform="translate(160 176) scale(.85) translate(-160 -176)"><polygon points="118,106 160,122 160,192 118,176" fill="#10201c"/><polygon points="160,122 202,106 202,176 160,192" fill="#0b1815"/><polygon points="160,90 202,106 160,122 118,106" fill="#26332f"/><polygon points="118,118 160,134 160,144 118,128" fill="#e0b050"/><polygon points="160,134 202,118 202,128 160,144" fill="#b98a2e"/><rect x="176" y="140" width="13" height="26" rx="2" fill="#e0b050" opacity=".5"/>
<rect x="152.5" y="163" width="15" height="21" rx="4.5" fill="#000" stroke="#d3d9dc" stroke-width="3"/></g>
${pray ? `<g><defs><g id="ppl"><ellipse cx="0" cy="17" rx="9" ry="2.6" fill="#f59a3c" opacity=".3"/><rect x="-8" y="13.5" width="16" height="4.4" rx="2.2" fill="#ffb25a" stroke="#d98b2b" stroke-width=".8"/><path d="M-6.5 -5L6.5 -5L8.5 14L-8.5 14Z" fill="#fff" stroke="#8a7665" stroke-width="1.4" stroke-linejoin="round"/><rect x="-6" y="-2" width="12" height="4.4" rx="2.2" fill="#e8b98a" stroke="#b8865a" stroke-width=".9"/><circle cx="0" cy="-12.2" r="4.8" fill="#e8b98a" stroke="#b8865a" stroke-width=".9"/><path d="M-5 -13.4Q0 -19.8 5 -13.4Z" fill="#fff" stroke="#8a7665" stroke-width="1.1"/><circle cx="-2.4" cy="-11.6" r=".95" fill="#13211c"/></g><linearGradient id="fzg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9f8ee"/><stop offset="1" stop-color="#f6fcf8"/></linearGradient></defs><rect x="255" y="192" width="92" height="64" rx="14" fill="#fff5c9" stroke="#fff" stroke-width="8"/><rect x="255" y="192" width="92" height="64" rx="14" fill="#fff5c9" stroke="#f2c315" stroke-width="3"/><rect x="269" y="221" width="18" height="6" rx="3" fill="#7bc58f" stroke="#4aa165" stroke-width=".8"/><use href="#ppl" transform="translate(278 214) scale(.7)"/><rect x="292" y="221" width="18" height="6" rx="3" fill="#7bc58f" stroke="#4aa165" stroke-width=".8"/><use href="#ppl" transform="translate(301 214) scale(.7)"/><rect x="315" y="221" width="18" height="6" rx="3" fill="#7bc58f" stroke="#4aa165" stroke-width=".8"/><use href="#ppl" transform="translate(324 214) scale(.7)"/><rect x="269" y="244" width="18" height="6" rx="3" fill="#7bc58f" stroke="#4aa165" stroke-width=".8"/><use href="#ppl" transform="translate(278 237) scale(.7)"/><rect x="292" y="244" width="18" height="6" rx="3" fill="#7bc58f" stroke="#4aa165" stroke-width=".8"/><use href="#ppl" transform="translate(301 237) scale(.7)"/><rect x="315" y="244" width="18" height="6" rx="3" fill="#7bc58f" stroke="#4aa165" stroke-width=".8"/><use href="#ppl" transform="translate(324 237) scale(.7)"/><rect x="244.4" y="259" width="113.2" height="19" rx="9.5" fill="#fff" stroke="#f2c315" stroke-width="1.6"/><text x="301" y="272" text-anchor="middle" font-family="Roboto" font-weight="700" font-size="10.5" fill="#13211c">Намаз оқитын жер</text></g>` : ""}
<g transform="translate(236 200)"><ellipse cy="2.5" rx="10" ry="3.2" fill="#000" opacity=".2"/><rect x="-8" y="-6" width="16" height="8" rx="1.5" fill="#e0b050" stroke="#fff" stroke-width="1.5"/><rect x="-6.5" y="-18" width="13" height="12" rx="2" fill="#f5efea" stroke="#e0b050" stroke-width="2"/><path d="M-9-18Q0-29 9-18z" fill="#e0b050" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></g>
${pray ? "" : `${arr(160, 276, 160, 201, "#16a34a", 2.2, 7)}${badges}${marks}`}
${pray ? arr(176, 282, 228, 217, "#13211c", 1.8, 7) : arr(230, 265, 235, 210, "#13211c", 1.8, 7)}${pray ? "" : `${arr(205, 91, 203, 168)}${arr(89, 91, 116, 168)}${arr(160, 72, 160, 94)}${arr(272, 104, 217, 151, "#5a4c3f", 1.2, 5)}`}
${pray ? "" : `${pill(178, 84, "Ирак бұрышы", "start")}${pill(98, 84, "Йемен бұрышы", "end")}${pill(160, 66, "Шам бұрышы", "middle")}<text x="284" y="86" text-anchor="middle" ${F} font-size="10.5" fill="#5a4c3f">Хижр</text><text x="284" y="98" text-anchor="middle" ${F} font-size="10.5" fill="#5a4c3f">Исмайыл</text>`}${(pray ? pill(176, 294, "Ибраһим мақамы", "middle") : pill(300, 277, "Ибраһим мақамы", "end"))}${pray ? "" : pill(160, 295, "ҚАРА ТАС бұрышы · бастау және аяқтау", "middle")}
</svg>`;
  }

  // Сафа / Мәруа төбесі: қатысушы Қағбаға қарап дұға етеді
  function hillSvg(kind) {
    const F = 'font-family="Roboto" font-weight="800"', safa = kind === "safa", c = safa ? "#ff8a1f" : "#e0b050", d = safa ? 1 : -1, px = safa ? 110 : 210, kx = safa ? 262 : 58;
    const title = safa ? "САФА" : "МӘРУА", lab = safa ? ["1-жүріс осы жерден басталады", "Қағбаға қарап, қол көтеріп дұға оқыңыз"] : ["7-жүріс осы жерде аяқталады", "Дұға оқыңыз"];
    return `<svg viewBox="0 0 320 250"><rect width="320" height="250" fill="#f5f0eb"/><rect x="14" y="14" width="292" height="222" rx="10" fill="#fff" stroke="#13211c" stroke-width="4"/>
<rect x="${safa ? 20 : 200}" y="24" width="100" height="26" rx="13" fill="${c}"/><text x="${safa ? 70 : 250}" y="42" text-anchor="middle" ${F} font-size="14" fill="${safa ? "#fff" : "#13211c"}">${title}</text>
<path d="M${px - 56} 190V112a56 56 0 0 1 112 0V190" fill="#fff4d6" stroke="#e0b050" stroke-width="5"/><path d="M${px - 36} 190V116a36 36 0 0 1 72 0V190" fill="#fff" stroke="#e0b050" stroke-width="3"/>
<polygon points="${px - 80},192 ${px - 40},158 ${px},136 ${px + 40},158 ${px + 80},192" fill="#c1bdb9" stroke="#13211c" stroke-width="3" stroke-linejoin="round"/><path d="M${px - 56} 176H${px + 56}M${px - 32} 160H${px + 32}" stroke="#13211c" stroke-width="2" opacity=".35"/>
<g transform="translate(${px} 112)"><circle cy="-8" r="7" fill="#13211c"/><path d="M0 0V20M0 4L-12-10M0 4L12-10M-8 34L0 20 8 34" stroke="#13211c" stroke-width="4" stroke-linecap="round" fill="none"/></g>
<rect x="${kx - 22}" y="66" width="44" height="44" rx="3" fill="#13211c" transform="translate(0 -10)"/><rect x="${kx - 22}" y="56" width="44" height="7" fill="#e0b050"/><text x="${kx}" y="84" text-anchor="middle" ${F} font-size="9" fill="#fff">ҚАҒБА</text>
<path d="M${px + d * 34} 104L${kx - d * 32} 86" stroke="${c}" stroke-width="4" stroke-dasharray="1 8" stroke-linecap="round"/><path d="M${kx - d * 32} 86l${-d * 10} 1m${d * 10}-1l${-d * 3} 9" stroke="${c}" stroke-width="4" stroke-linecap="round"/>
<text x="${kx}" y="124" text-anchor="middle" ${F} font-size="9" fill="#776e66">бағыт</text>
<text x="160" y="212" text-anchor="middle" ${F} font-size="11" fill="#13211c">${lab[0]}</text><text x="160" y="227" text-anchor="middle" font-family="Roboto" font-weight="700" font-size="10" fill="#776e66">${lab[1]}</text></svg>`;
  }

  // ---- сызбалар (SVG) ----
  const SCH = {
    gate: `<svg viewBox="0 0 320 322"><rect width="320" height="322" fill="#f5f0eb"/><rect x="0" y="206" width="320" height="52" fill="#d5d1ce"/><path d="M0 232H320" stroke="#fff" stroke-width="3" stroke-dasharray="14 10"/><text x="300" y="250" text-anchor="end" font-family="Roboto" font-weight="700" font-size="10" fill="#776e66">КӨШЕ</text><rect x="14" y="14" width="292" height="98" rx="10" fill="#fff" stroke="#13211c" stroke-width="4"/><text x="100" y="33" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="11" fill="#13211c">ӘЛ-ХАРАМ МЕШІТІ</text><path d="M214 112V76a26 26 0 0 1 52 0v36" fill="#fff4d6" stroke="#e0b050" stroke-width="5" stroke-linejoin="round"/><path d="M226 112V78a14 14 0 0 1 28 0v34z" fill="#10201c"/><g><polygon points="46,52 64,58 64,84 46,78" fill="#10201c"/><polygon points="64,58 82,52 82,78 64,84" fill="#0b1815"/><polygon points="64,46 82,52 64,58 46,52" fill="#26332f"/><polygon points="46,60 64,66 64,70 46,64" fill="#e0b050"/><polygon points="64,66 82,60 82,64 64,70" fill="#b98a2e"/><text x="64" y="102" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="10" fill="#13211c">ҚАҒБА</text></g><path d="M224 82C196 58 150 62 100 76" fill="none" stroke="#ff8a1f" stroke-width="5" stroke-dasharray="1 10" stroke-linecap="round"/><path d="M110 66L98 76L112 82" fill="none" stroke="#ff8a1f" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="160" cy="62" r="11" fill="#ff8a1f"/><text x="160" y="66" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="12" fill="#fff">4</text><rect x="190" y="14" width="100" height="22" rx="11" fill="#e0b050"/><text x="240" y="30" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="12" fill="#13211c">1-ҚАҚПА · ЕСІК</text><g stroke="#13211c" stroke-width="3" stroke-linecap="round"><path d="M206 120H274M200 132H280M194 144H286M188 156H292"/></g><text x="240" y="176" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="11" fill="#e0610c">БАСПАЛДАҚ</text><rect x="20" y="164" width="64" height="52" rx="8" fill="#fff" stroke="#13211c" stroke-width="3"/><text x="52" y="186" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="11" fill="#13211c">ҚОНАҚ-</text><text x="52" y="200" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="11" fill="#13211c">ҮЙ</text><path d="M90 192C150 192 160 160 190 150L236 136L240 108" fill="none" stroke="#ff8a1f" stroke-width="5" stroke-dasharray="1 10" stroke-linecap="round"/><path d="M240 100l-9 12m9-12l9 12" stroke="#ff8a1f" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="100" cy="192" r="13" fill="#2f7cff" stroke="#fff" stroke-width="3"/><g font-family="Roboto" font-weight="800" font-size="12" fill="#fff" text-anchor="middle"><circle cx="150" cy="176" r="11" fill="#ff8a1f"/><text x="150" y="180">1</text><circle cx="236" cy="136" r="11" fill="#ff8a1f"/><text x="236" y="140">2</text><circle cx="240" cy="88" r="11" fill="#ff8a1f"/><text x="240" y="92">3</text></g><g transform="translate(14,262)" font-family="Roboto" font-weight="700" font-size="11" fill="#13211c"><circle cx="8" cy="8" r="8" fill="#ff8a1f"/><text x="8" y="12" text-anchor="middle" fill="#fff" font-weight="800">1</text><text x="22" y="12">Жүріңіз</text><circle cx="100" cy="8" r="8" fill="#ff8a1f"/><text x="100" y="12" text-anchor="middle" fill="#fff" font-weight="800">2</text><text x="114" y="12">Көтеріліңіз</text><circle cx="216" cy="8" r="8" fill="#ff8a1f"/><text x="216" y="12" text-anchor="middle" fill="#fff" font-weight="800">3</text><text x="230" y="12">Кіріңіз</text><circle cx="8" cy="34" r="8" fill="#ff8a1f"/><text x="8" y="38" text-anchor="middle" fill="#fff" font-weight="800">4</text><text x="22" y="38">Мешіт ішінде Қағбаға қарай жүріңіз</text></g></svg>`,
    stone: `<svg viewBox="0 0 320 278"><defs><linearGradient id="stfl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece6d6"/><stop offset="1" stop-color="#faf7ef"/></linearGradient><linearGradient id="stgl" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7dffa8"/><stop offset="1" stop-color="#16c25a"/></linearGradient></defs>
<rect width="320" height="278" fill="#f5f0eb"/><rect x="10" y="10" width="300" height="204" rx="14" fill="url(#stfl)" stroke="#e4ded8" stroke-width="2"/>
<rect x="10" y="10" width="300" height="86" rx="14" fill="#e9e1cf"/><rect x="10" y="84" width="300" height="12" fill="#d8ccb2"/><path d="M150 78V50a10 10 0 0 1 20 0v28z" fill="#d8ccb2"/><path d="M184 78V50a10 10 0 0 1 20 0v28z" fill="#d8ccb2"/><path d="M262 78V50a10 10 0 0 1 20 0v28z" fill="#d8ccb2"/><path d="M296 78V50a10 10 0 0 1 20 0v28z" fill="#d8ccb2"/>
<rect x="226" y="22" width="20" height="74" rx="6" fill="#16c25a" opacity=".25"/><rect x="231" y="26" width="10" height="68" rx="4" fill="url(#stgl)" stroke="#fff" stroke-width="1.5"/>
<path d="M30 20L98 34V140L30 150Z" fill="#161f1c"/><path d="M98 34L126 28V132L98 140Z" fill="#0b1210"/><path d="M30 62L98 74V84L30 74Z" fill="#e0b050"/><path d="M98 74L126 68V77L98 84Z" fill="#b98a2e"/>
<ellipse cx="98" cy="118" rx="7.5" ry="10" fill="#c9ccd0" stroke="#7a4a1c" stroke-width="2.4"/><ellipse cx="98" cy="118" rx="3.6" ry="6" fill="#161f1c"/>

<g transform="translate(176 128) scale(1.35)"><ellipse cx="0" cy="1" rx="15" ry="5" fill="#2f7cff" opacity=".28"><animate attributeName="rx" values="13;18;13" dur="2.4s" repeatCount="indefinite"/></ellipse><ellipse cx="0" cy="2" rx="11" ry="3" fill="#000" opacity=".2"/>
<path d="M-8 -17L8 -17L11 -1L-11 -1Z" fill="#fff" stroke="#d7d2ce" stroke-width="1"/><path d="M0 -16V-2M-4 -16V-2M4 -16V-2" stroke="#e7e4e2" stroke-width=".8"/><rect x="-8" y="0" width="6" height="2.5" rx="1.2" fill="#8b5a2b"/><rect x="2" y="0" width="6" height="2.5" rx="1.2" fill="#8b5a2b"/>
<path d="M-9 -34Q-9 -37 -5 -37H5Q9 -37 9 -34V-16H-9Z" fill="#e8c29b"/><path d="M-9 -35L-9 -16L7 -16L-9 -35Z" fill="#fff" stroke="#d7d2ce" stroke-width="1" stroke-linejoin="round"/><path d="M-9 -34L9 -20" stroke="#d7d2ce" stroke-width="1" stroke-linecap="round"/>
<path d="M-9 -33L-14 -42" stroke="#e8c29b" stroke-width="3.6" stroke-linecap="round"/><path d="M9 -34L14 -43" stroke="#e8c29b" stroke-width="3.6" stroke-linecap="round"/><circle cx="-14.4" cy="-43.4" r="2.4" fill="#e8c29b"/><circle cx="14.4" cy="-44.4" r="2.4" fill="#e8c29b"/>
<circle cx="0" cy="-43" r="6.4" fill="#e8c29b"/><path d="M-4 -44.5h2M2 -44.5h2" stroke="#13211c" stroke-width="1.2" stroke-linecap="round"/></g>
<g font-family="Roboto" font-weight="800" font-size="10" text-anchor="middle"><rect x="156" y="32" width="40" height="16" rx="8" fill="#2f7cff" stroke="#fff" stroke-width="1.5"/><text x="176" y="43.5" fill="#fff">СІЗ</text><path d="M171 48L176 55L181 48Z" fill="#2f7cff"/></g>
<g font-family="Roboto" font-weight="800" font-size="10" text-anchor="middle"><rect x="196" y="6" width="90" height="16" rx="8" fill="#16a34a"/><text x="241" y="17.5" fill="#fff">ЖАСЫЛ ЖАРЫҚ</text><rect x="22" y="176" width="64" height="17" rx="8.5" fill="#fff" stroke="#e2dcd6"/><text x="54" y="188" fill="#13211c">ҚАРА ТАС</text></g>
<text x="170" y="198" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="11" fill="#2f7cff">Қағба сол жағыңызда</text>
<g font-family="Roboto" font-weight="700" font-size="11.5" fill="#13211c"><circle cx="24" cy="236" r="9" fill="#ff8a1f"/><text x="24" y="240" text-anchor="middle" fill="#fff" font-family="Roboto" font-weight="800" font-size="11">1</text><text x="40" y="240">Қабырғадағы жасыл жарықты табыңыз</text><circle cx="24" cy="261" r="9" fill="#ff8a1f"/><text x="24" y="265" text-anchor="middle" fill="#fff" font-family="Roboto" font-weight="800" font-size="11">2</text><text x="40" y="265">Жарыққа тұрып, Қара тасқа қараңыз</text></g></svg>`,    tawaf: (n) => tawafSvg(n),
    safaClose: () => hillSvg("safa"),
    marwaClose: () => hillSvg("marwa"),
    maqam: () => tawafSvg(0, -1, true), // Ибраһим мақамы беті: тауаф сызбасының көшірмесі
    maqamClose: `<svg viewBox="0 0 320 236"><rect width="320" height="236" fill="#f5f0eb"/><rect x="14" y="14" width="292" height="208" rx="10" fill="#fff" stroke="#13211c" stroke-width="4"/><ellipse cx="110" cy="198" rx="62" ry="9" fill="#000" opacity=".12"/><rect x="62" y="160" width="96" height="34" rx="4" fill="#e0b050" stroke="#b98a2e" stroke-width="2"/><rect x="72" y="84" width="76" height="76" rx="6" fill="#f5efea" stroke="#e0b050" stroke-width="5"/><path d="M72 84h76M72 110h76M72 136h76M110 84v76" stroke="#e0b050" stroke-width="3"/><path d="M62 84C70 58 90 44 110 36c20 8 40 22 48 48z" fill="#e0b050" stroke="#b98a2e" stroke-width="3" stroke-linejoin="round"/><path d="M110 36V26" stroke="#b98a2e" stroke-width="3" stroke-linecap="round"/><circle cx="110" cy="23" r="4" fill="#b98a2e"/><ellipse cx="96" cy="128" rx="9" ry="14" fill="#a7a19b" opacity=".8"/><ellipse cx="124" cy="128" rx="9" ry="14" fill="#a7a19b" opacity=".8"/><text x="110" y="172" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="9" fill="#13211c">тас</text><path d="M148 128L184 112" stroke="#13211c" stroke-width="1.5"/><text x="188" y="108" font-family="Roboto" font-weight="800" font-size="11" fill="#13211c">Ибраһимнің</text><text x="188" y="122" font-family="Roboto" font-weight="800" font-size="11" fill="#13211c">(ғ.с.) аяқ ізі</text><path d="M150 64L184 56" stroke="#13211c" stroke-width="1.5"/><text x="188" y="54" font-family="Roboto" font-weight="800" font-size="11" fill="#13211c">Алтын-шыны</text><text x="188" y="68" font-family="Roboto" font-weight="800" font-size="11" fill="#13211c">қорап</text><text x="168" y="196" font-family="Roboto" font-weight="800" font-size="10" fill="#e0610c">Қағбаны салғанда</text><text x="168" y="210" font-family="Roboto" font-weight="800" font-size="10" fill="#e0610c">үстінде тұрған тас</text></svg>`,
    sai: `<svg viewBox="0 0 320 290"><rect width="320" height="290" fill="#f5f0eb"/><rect x="14" y="14" width="292" height="196" rx="10" fill="#fff" stroke="#13211c" stroke-width="4"/><rect x="104" y="14" width="112" height="196" fill="#22c55e" opacity=".22"/><path d="M104 14V210M216 14V210" stroke="#22c55e" stroke-width="5"/><text x="160" y="34" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="11" fill="#e0610c">ЖАСЫЛ БЕЛГІ</text><text x="160" y="48" text-anchor="middle" font-family="Roboto" font-weight="700" font-size="10" fill="#e0610c">ер адам жүгіреді</text><path d="M40 92H280" stroke="#ff8a1f" stroke-width="5" stroke-linecap="round"/><path d="M280 92l-12-9v18z" fill="#ff8a1f" stroke="#ff8a1f" stroke-width="3" stroke-linejoin="round"/><text x="160" y="80" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="11" fill="#ff8a1f">1 · 3 · 5 · 7</text><path d="M280 150H40" stroke="#2f7cff" stroke-width="5" stroke-linecap="round"/><path d="M40 150l12-9v18z" fill="#2f7cff" stroke="#2f7cff" stroke-width="3" stroke-linejoin="round"/><text x="160" y="176" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="11" fill="#2f7cff">2 · 4 · 6</text><circle cx="36" cy="121" r="24" fill="#ff8a1f" stroke="#fff" stroke-width="3"/><text x="36" y="119" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="11" fill="#fff">САФА</text><text x="36" y="132" text-anchor="middle" font-family="Roboto" font-weight="700" font-size="9" fill="#fff">бастау</text><circle cx="284" cy="121" r="24" fill="#e0b050" stroke="#fff" stroke-width="3"/><text x="284" y="119" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="11" fill="#13211c">МӘРУА</text><text x="284" y="132" text-anchor="middle" font-family="Roboto" font-weight="700" font-size="9" fill="#13211c">соңы</text><g font-family="Roboto" font-weight="700" font-size="11" fill="#13211c"><circle cx="24" cy="234" r="8" fill="#ff8a1f"/><text x="38" y="238">Сафа → Мәруа (тақ жүріс)</text><circle cx="24" cy="256" r="8" fill="#2f7cff"/><text x="38" y="260">Мәруа → Сафа (жұп жүріс)</text><circle cx="24" cy="278" r="8" fill="#22c55e"/><text x="38" y="282">Жасыл белгіде: ер — жүгіру, әйел — жай жүру</text></g></svg>`,
    hair: (n = 0) => `<svg viewBox="0 0 320 404"><rect width="320" height="404" fill="#f5f0eb"/><rect x="14" y="12" width="292" height="62" rx="14" fill="#fff" stroke="#f0e1d2" stroke-width="1.5"/><rect x="26" y="25" width="40" height="40" rx="10" fill="#e8730c"/><path d="M31 59L41 40Q44 35 47 40L49 46L54 35Q57 30 60 35L66 59Z" fill="#ffc21a" stroke="#ffc21a" stroke-width="1.8" stroke-linejoin="round"/><circle cx="28" cy="18" r="10" fill="#ff8a1f" stroke="#fff" stroke-width="2"/><text x="28" y="22" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="11" fill="#fff">1</text><text x="78" y="40" font-family="Roboto" font-weight="800" font-size="14" fill="#13211c">Мәруада аяқтадыңыз</text><text x="78" y="58" font-family="Roboto" font-weight="600" font-size="11.5" fill="#6b5a4b">7-жүріс осы жерде бітті.</text><path d="M160 77V86M153 81L160 87L167 81" fill="none" stroke="#ff8a1f" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><rect x="14" y="92" width="292" height="84" rx="14" fill="#fff" stroke="#f0e1d2" stroke-width="1.5"/><rect x="26" y="104" width="40" height="40" rx="10" fill="#e8730c"/><path d="M46 112.5L55 134 46 129 37 134Z" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><circle cx="28" cy="98" r="10" fill="#ff8a1f" stroke="#fff" stroke-width="2"/><text x="28" y="102" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="11" fill="#fff">2</text><text x="78" y="120" font-family="Roboto" font-weight="800" font-size="14" fill="#13211c">Шаштаразға барыңыз</text><text x="78" y="136" font-family="Roboto" font-weight="600" font-size="11.5" fill="#6b5a4b">Мәруадан шаштаразға жол картада.</text><a href="#/map/hair" class="hmap"><rect x="26" y="146" width="268" height="22" rx="11" fill="#e8730c"/><text x="160" y="161" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="12" fill="#fff">Картада көрсету  ›</text></a><path d="M160 179V188M153 183L160 189L167 183" fill="none" stroke="#ff8a1f" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><rect x="14" y="194" width="292" height="128" rx="14" fill="#fff" stroke="#f0e1d2" stroke-width="1.5"/><circle cx="46" cy="228" r="21" fill="#fff" stroke="#f0e1d2" stroke-width="2"/><g stroke="#13211c" stroke-width="2.3" stroke-linecap="round" fill="none"><circle cx="39" cy="222" r="3.4"/><circle cx="39" cy="235" r="3.4"/><path d="M42.5 224L56 238M42.5 233L56 219"/></g><circle cx="28" cy="200" r="10" fill="#ff8a1f" stroke="#fff" stroke-width="2"/><text x="28" y="204" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="11" fill="#fff">3</text><text x="78" y="224" font-family="Roboto" font-weight="800" font-size="14" fill="#13211c">Шашты алыңыз</text><text x="78" y="241" font-family="Roboto" font-weight="600" font-size="11.5" fill="#6b5a4b">Алдырыңыз немесе қысқартыңыз.</text><rect x="24" y="256" width="130" height="56" rx="12" fill="#fff6ec" stroke="#ff8a1f" stroke-width="2"/><text x="89" y="274" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="11" fill="#e0610c">ЕР АДАМ</text><text x="89" y="291" text-anchor="middle" font-family="Roboto" font-weight="700" font-size="11" fill="#13211c">Толық алдыру</text><text x="89" y="304" text-anchor="middle" font-family="Roboto" font-weight="600" font-size="10" fill="#8a7665">абзал</text><rect x="166" y="256" width="130" height="56" rx="12" fill="#fff9ec" stroke="#e0b050" stroke-width="2"/><text x="231" y="274" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="11" fill="#b07d12">ӘЙЕЛ АДАМ</text><text x="231" y="291" text-anchor="middle" font-family="Roboto" font-weight="700" font-size="11" fill="#13211c">Ұшынан бір сүйем</text><text x="231" y="304" text-anchor="middle" font-family="Roboto" font-weight="600" font-size="10" fill="#8a7665">(2–3 см) қияды</text><path d="M160 325V334M153 329L160 335L167 329" fill="none" stroke="#ff8a1f" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>${n ? `<rect x="14" y="340" width="292" height="62" rx="14" fill="#f2fbf5" stroke="#9bdcb3" stroke-width="2"/><circle cx="46" cy="371" r="20" fill="#22c55e"/><path d="M37 371l7 7 13-14" stroke="#fff" stroke-width="4.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="28" cy="346" r="10" fill="#22c55e" stroke="#fff" stroke-width="2"/><text x="28" y="350" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="11" fill="#fff">4</text><text x="78" y="368" font-family="Roboto" font-weight="800" font-size="14" fill="#13211c">Ұмраңыз қабыл болсын!</text><text x="78" y="386" font-family="Roboto" font-weight="600" font-size="11.5" fill="#3f7a55">Ихрам жойылды. Аллаһ қабыл етсін.</text>` : `<rect x="14" y="340" width="292" height="62" rx="14" fill="#fff" stroke="#f0e1d2" stroke-width="1.5"/><circle cx="46" cy="371" r="20" fill="#f3ede6" stroke="#d9cfc4" stroke-width="2" stroke-dasharray="4 4"/><path d="M37 371l7 7 13-14" stroke="#cfc4b8" stroke-width="4.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="28" cy="346" r="10" fill="#ff8a1f" stroke="#fff" stroke-width="2"/><text x="28" y="350" text-anchor="middle" font-family="Roboto" font-weight="800" font-size="11" fill="#fff">4</text><text x="78" y="368" font-family="Roboto" font-weight="800" font-size="14" fill="#13211c">Ұмраны аяқтаңыз</text><text x="78" y="386" font-family="Roboto" font-weight="600" font-size="11.5" fill="#6b5a4b">Шашты алған соң батырманы басыңыз.</text>`}</svg>`,
  };
  const HERO = `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><g fill="#fff" opacity=".7"><circle cx="48" cy="46" r="1.6"/><circle cx="120" cy="30" r="1.2"/><circle cx="232" cy="52" r="1.8"/><circle cx="330" cy="30" r="1.4"/><circle cx="370" cy="80" r="1.2"/><circle cx="84" cy="96" r="1.1"/></g><path d="M308 40a22 22 0 1 0 14 38 18 18 0 1 1-14-38z" fill="#e0b050"/><ellipse cx="200" cy="232" rx="170" ry="26" fill="#000" opacity=".18"/><rect x="146" y="112" width="108" height="112" rx="3" fill="#10201c"/><rect x="146" y="132" width="108" height="14" fill="#e0b050"/><path d="M146 112l20-12h108l-20 12z" fill="#1e332d"/><path d="M254 112l20-12v112l-20 12z" fill="#0b1815"/><path d="M178 146v74h22v-74z" fill="#e0b050" opacity=".25"/><circle cx="200" cy="232" r="82" fill="none" stroke="#e0b050" stroke-width="1.2" stroke-dasharray="1 7" stroke-linecap="round" opacity=".7"/></svg>`;

  // ---- санауыш (тауаф — 7 айналым, сағи — 7 жүріс) ----
  const cnt = (m) => (S.cnt && S.cnt[m.key]) || 0;
  const byKey = (k) => MODS.find((x) => x.key === k);
  function setCnt(key, n) {
    const m = byKey(key); S.cnt = S.cnt || {};
    S.cnt[key] = Math.max(0, Math.min(m.count, n)); save();
    if (key === "tawaf") twRefresh();
    const dk = document.getElementById("dockbox"); if (dk) { const i = MODS.indexOf(m); dk.innerHTML = dockHtml(i); bindMark(i); }
    const sc = document.querySelector("#sch svg"); if (sc && typeof SCH[m.figs[0]] === "function") sc.outerHTML = SCH[m.figs[0]](S.cnt[key]);
  }

  // ---- экрандар ----
  const fig = (k, m, id) => `<figure class="card scheme"${id ? ` id="${id}"` : ""}>${typeof SCH[k] === "function" ? SCH[k](m ? cnt(m) : k === "hair" && isDone(MODS.length - 1) ? 1 : 0) : SCH[k]}</figure>`;

  function landing() {
    const n = S.done.filter((k) => k > 0 && k < MODS.length).length; // «Ихрам» жасырын: 6 қадам
    return `<section class="scr">
      <div class="hero">${HERO}${window.UI18N ? UI18N.switchHtml() : ""}<a class="ib back" href="${EMBED ? "#/" : "./agartu.html"}" data-hostclose="${EMBED ? 1 : 0}" aria-label="Артқа">${ic("back")}</a>
        <div class="hero-t"><b>Ұмра жолбасшысы</b><span>Ұмраны қадам-қадам орындаңыз</span></div></div>
      <div class="lcs">
        <button class="lc lock" data-soon aria-disabled="true"><span class="lc-n">1</span><span class="lc-t"><b>Ұмраға дайындық</b><span>Ихрам, ғұсыл, киім, ниет, миқат — видео</span></span>${ic("lock", 18)}</button>
        <button class="lc lock" data-soon aria-disabled="true"><span class="lc-n">2</span><span class="lc-t"><b>Ұмра практикасы</b><span>Ұмраны орындау тәртібі — видео</span></span>${ic("lock", 18)}</button>
        <a class="lc main" href="#/steps"><span class="lc-n">3</span><span class="lc-t"><b>Ұмра қадамдары</b><span>${n ? `Жалғастыру · ${n}/${MODS.length - 1}` : "Мешітке кіруден шашты алуға дейін — 6 қадам"}</span></span>${ic("next", 20)}</a>
        <a class="lc" href="#/b/steps"><span class="lc-n">4</span><span class="lc-t"><b>Бәдәл ұмра</b><span>Басқа адамның атынан, Айша анамыздың мешітінен бастап</span></span>${ic("next", 20)}</a>
      </div>
      <div class="tools lt"><h2>Сапардағы құралдар</h2><div class="tc-grid">
        <a class="tc" href="#/map"><i>${ic("map", 22)}</i><span class="tt"><b>Ұмра картасы</b><span>GPS-пен қадам-қадам</span></span></a>
        <a class="tc" href="#/group"><i>${ic("group", 22)}</i><span class="tt"><b>Ұмра тобы</b><span>Гид көреді, SOS</span></span></a>
      </div></div>
    </section>`;
  }

  // 4-бөлім: бәдәл ұмра (басқа адам үшін)
  function badalPage() {
    const sec = (n, t) => `<div class="ih-h"><span class="ih-n">${n}</span><b>${t}</b></div>`;
    return `<section class="scr bdp">
      <header class="tb"><a class="ib" href="#/b/steps" aria-label="Артқа">${ic("back")}</a><h1>Айша анамыздың мешіті</h1></header>
      <div class="ih">
        ${sec(1, "Ескерту")}
        <div class="mq-warn"><span class="ih-i">${ic("tip", 20)}</span><div><b>Өзі келе алмайтын адам</b><p>Бәдәл ұмра — қайтыс болған немесе қартаюы не ауруы себепті сапарға шыға алмайтын мұсылман үшін жасалады.</p></div></div>
        ${sec(2, "Мешітке дейін")}
        <div class="ih-s bd-2"><div class="ih-b"><b>Ғұсыл алып, ихрам киіп, дайын барыңыз</b></div><span class="ih-i">${ic("shower", 22)}</span></div>
        <a class="btn" href="#/b/map/badal">${ic("nav", 18)} Қонақүйден Айша мешітіне жол көрсету</a>
        ${sec(3, "Мешітке жеткенде")}
        <div class="ih-s bd-2"><div class="ih-b"><b>2 рәкәт намаз оқыңыз</b><b>Ниет етіңіз және дұғаны оқыңыз</b></div></div>
        <div class="ih-niyat bd-n"><div class="ih-q">Аллаһуммә инни уридул-умрата ьан <span class="bd-nm">аты</span>, фәйәссирһә ли уә тақаббәлһә минни уә минһу</div><p class="bd-m">«Уа, Аллаһым! Шын мәнінде мен <span class="bd-nm">пәленшенің</span> атынан умра жасауды қалаймын. Оны маған жеңіл ет және одан қабыл ет!»</p></div>
        ${sec(4, "Кері қайтыңыз")}
        <div class="ih-s bd-2"><div class="ih-b"><b>Ниеттен кейін бірден Харам мешітіне қайтыңыз</b></div></div>
      </div>
      <div class="cta"><button class="btn" id="aisha-done">${isDone(0) ? "Келесі қадам" : "Орындадым · келесі"} ${ic("arrow", 20)}</button></div>
    </section>`;
  }

  // 1–2-бөлімдер: тек видео. Файлдар: umrah-video/prep.mp4, umrah-video/practice.mp4 (жоқ болса — «жақында» белгісі)
  const VIDEO_OPEN = false; // видео дайын болғанда true қойып, карточкалардағы жабықты алыңыз
  const VIDEO_PAGES = {
    prep: { title: "Ұмраға дайындық", sub: "Ихрам, ғұсыл, киім, ниет, миқат", src: "./umrah-video/prep.mp4" },
    practice: { title: "Ұмра практикасы", sub: "Ұмраны орындау тәртібі", src: "./umrah-video/practice.mp4" },
  };
  function videoPage(k) {
    const v = VIDEO_PAGES[k];
    return `<section class="scr">
      <header class="tb"><a class="ib" href="#/" aria-label="Артқа">${ic("back")}</a><h1>${v.title}</h1></header>
      <div class="vid"><video id="vp" controls playsinline preload="metadata" src="${v.src}"></video><div class="vid-soon" id="vsoon" hidden>${ic("play", 30)}<b>Видео жақында қосылады</b><span>${v.sub}</span></div></div>
    </section>`;
  }
  function bindVideo() {
    const vp = document.getElementById("vp"), soon = document.getElementById("vsoon");
    if (vp) vp.addEventListener("error", () => { vp.hidden = true; if (soon) soon.hidden = false; });
  }

  // Қадамдар ретімен ашылады: алдыңғысы орындалмайынша келесісі жабық (1-қадам — «Ихрам» жасырын, ол есепке алынбайды)
  const stepOpen = (i) => (BADAL ? (i <= 1 ? isDone(0) : isDone(i - 1)) : i <= 1 || isDone(i - 1));
  const firstOpen = () => { for (let k = BADAL ? 0 : 1; k < MODS.length; k++) if (!isDone(k)) return k; return MODS.length - 1; };
  function list() {
    // «Ихрам» қадамы тізімде көрсетілмейді: санақ пен «келесі» оны есептемейді
    const vis = MODS.map((_, k) => k).filter((k) => BADAL || MODS[k].key !== "ihram"), n = vis.filter(isDone).length;
    const c0 = vis.find((k) => !isDone(k)), all = c0 === undefined, c = all ? MODS.length - 1 : c0, pct = Math.round((n / vis.length) * 100);
    const rows = MODS.map((m, i) => {
      const num = BADAL ? i + 1 : i;
      if (m.key === "ihram") return !BADAL ? "" : `<button class="row ${isDone(0) ? "done" : c === 0 ? "cur" : ""}" data-aisha="1"><span class="ic">${ic("nav", 22)}<em>1</em></span><span class="tx"><b>Айша анамыздың мешіті (Тәнғим)</b><span>${isDone(0) ? "Орындалды" : "Ихрамға кіру, 2 рәкәт намаз, қонақүйден жол"}</span></span>${isDone(0) ? `<span class="rs dn">${ic("check", 16)}</span>` : ic("next", 20)}</button>`;
      const st = isDone(i) ? "done" : i === c ? "cur" : "", open = stepOpen(i);
      if (!open) return `<button class="row lock" data-lock="${i}" aria-disabled="true"><span class="ic">${ic(m.key, 22)}<em>${num}</em></span><span class="tx"><b>${esc(m.title)}</b><span>Алдымен алдыңғы қадамды орындаңыз</span></span><span class="rs lk">${ic("lock", 18)}</span></button>`;
      return `<button class="row ${st}" data-go="${i}"><span class="ic">${ic(m.key, 22)}<em>${num}</em></span><span class="tx"><b>${esc(m.title)}</b><span>${isDone(i) ? "Орындалды" : esc(m.sub)}</span></span>${isDone(i) ? `<span class="rs dn">${ic("check", 16)}</span>` : ic("next", 20)}</button>`;
    }).join("");
    return `<section class="scr">
      <header class="tb"><a class="ib" href="#/" aria-label="Артқа">${ic("back")}</a><h1>${BADAL ? "Бәдәл ұмра" : "Ұмра қадамдары"}</h1></header>
      <div class="list">${rows}</div>
      ${BADAL ? `<div class="tools"><div class="tc-grid one"><a class="tc" href="#/b/map"><i>${ic("map", 26)}</i><b>Бәдәл картасы</b><span>Айша анамыздың мешіті мен Әл-Харам бір картада</span></a></div></div>` : ""}
      ${n || Object.values(S.cnt || {}).some((v) => v > 0) ? `<button class="link center" id="reset">${ic("reset", 14)} Прогресті тазалау</button>` : ""}
    </section>`;
  }

  // «Орындадым» панелі: тауафта 7 айналым толмайынша көрінбейді
  function dockHtml(i) {
    const m = MODS[i], last = i === MODS.length - 1;
    if ((m.key === "tawaf" || m.key === "sai") && cnt(m) < m.count) return "";
    if (m.key === "ihram" && !IH.done && !isDone(i)) return "";
    if (m.key === "gate" && !GP.done && !isDone(i)) return "";
    return `<div class="dock"><button class="btn" id="mark">${last ? (isDone(i) ? "Тізімге оралу" : "Ұмраны аяқтау") : "Орындадым · келесі"} ${ic(last ? "check" : "arrow", 20)}</button></div>`;
  }
  function bindMark(i) {
    const mk = document.getElementById("mark");
    if (mk) mk.onclick = () => {
      if (i === MODS.length - 1) {
        // соңғы қадам: белгі қойылғанда ғана «Ұмраңыз қабыл болсын!» көрінеді
        if (!isDone(i)) { S.done.push(i); save(); const sc = document.querySelector("#sch svg"); if (sc && typeof SCH.hair === "function") sc.outerHTML = SCH.hair(1); mk.textContent = "Тізімге оралу"; toast("Ұмраңыз қабыл болсын!"); }
        else location.hash = HB() + "/steps";
        return;
      }
      if (!isDone(i)) { S.done.push(i); save(); }
      location.hash = i === 0 && !BADAL ? "#/" : HB() + "/step/" + (i + 1);
    };
  }

  const NAV_TXT = { ihram: "Қонақүйден Абдулазиз патша қақпасына", gate: "Қағбаға жол көрсету", stone: "Қара тасқа жол көрсету", tawaf: "Қара тасқа жол көрсету", maqam: "Ибраһим мақамына жол көрсету", sai: "Сафа мен Мәруаға жол көрсету", hair: "Шаштаразға жол көрсету" };
  const TAB_TITLE = { guide: "Нұсқау", dua: "Дұға", tip: "Ескерту" };

  // Нұсқау / Дұға / Ескерту мазмұны — экранның үстінен шығатын терезеде
  function sheetBody(m, tab) {
    if (tab === "guide" && m.key === "ihram") return ihramPage();
    if (tab === "guide") {
      return m.figs.slice(m.key === "tawaf" || m.key === "maqam" ? 0 : 1).map((k) => fig(k, null)).join("")
        + `<div class="card"><ol class="steps">${m.steps.map((p) => `<li>${esc(p)}</li>`).join("")}</ol></div>`
        + (m.extra ? `<div class="card"><b class="xh">${esc(m.extra.h)}</b><ul class="pts">${m.extra.t.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>` : "");
    }
    if (tab === "dua") {
      return m.duas.length
        ? m.duas.map((k) => { const d = DUA[k]; return `<div class="card dua">${d.h ? `<b class="xh">${esc(d.h)}</b>` : ""}${RUKN_DUAS.includes(k) ? "" : `<div class="ar" dir="rtl">${d.ar}</div>`}<div class="tr">${esc(d.tr)}</div><div class="kk">${esc(d.kk)}</div>${d.cue ? `<button class="btn line sm" data-dua="${k}">${ic("play", 16)} Тыңдау</button>` : ""}</div>`; }).join("")
        : `<div class="card empty">Бұл қадамда арнайы дұға жоқ — тілегіңізді өз тіліңізде айтыңыз.</div>`;
    }
    return `<div class="card warn"><ul class="pts">${m.warn.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>`;
  }
  const sheetEl = document.createElement("div");
  sheetEl.className = "sheetwrap"; sheetEl.hidden = true;
  document.body.appendChild(sheetEl);
  function closeSheet() { sheetEl.hidden = true; sheetEl.innerHTML = ""; }
  function openSheet(i, tab) {
    sheetEl.innerHTML = `<div class="sh-bd" data-close></div><div class="sh-p" role="dialog" aria-label="${TAB_TITLE[tab]}"><div class="sh-h"><h3>${ic(tab, 22)} ${TAB_TITLE[tab]}</h3><button class="sh-x" data-close aria-label="Жабу">${ic("close", 20)}</button></div><div class="sh-b">${sheetBody(MODS[i], tab)}</div></div>`;
    sheetEl.hidden = false;
    sheetEl.querySelectorAll("[data-close]").forEach((b) => (b.onclick = closeSheet));
    sheetEl.querySelectorAll("[data-dua]").forEach((b) => (b.onclick = () => playSeq([b.dataset.dua])));
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });

  // ---- Ихрам беті: киім (ер/әйел), ниет, ихрамға кіру орны ----
  const MAN_SVG = `<svg viewBox="0 0 64 84" aria-hidden="true"><circle cx="32" cy="12" r="8" fill="#e8c29b"/><path d="M14 26c0-4 4-6 9-6h18c5 0 9 2 9 6v28H14z" fill="#fff" stroke="#d5cfca" stroke-width="2" stroke-linejoin="round"/><path d="M14 26c0-3 3-5 7-5l1 11-8 4z" fill="#e8c29b"/><path d="M22 21l22 16" stroke="#d5cfca" stroke-width="2" stroke-linecap="round"/><path d="M16 54h32l4 24H12z" fill="#fff" stroke="#d5cfca" stroke-width="2" stroke-linejoin="round"/><path d="M26 54l-2 24M38 54l2 24" stroke="#eae7e4" stroke-width="2"/></svg>`;
  const WOMAN_SVG = `<svg viewBox="0 0 64 84" aria-hidden="true"><path d="M32 3c-9 0-14 7-14 15 0 6 2 10 4 13h20c2-3 4-7 4-13 0-8-5-15-14-15z" fill="#d9c6ec"/><circle cx="32" cy="17" r="7" fill="#e8c29b"/><path d="M18 31c-3 4-5 10-5 20h38c0-10-2-16-5-20z" fill="#e6d8f3" stroke="#cdbbe0" stroke-width="2" stroke-linejoin="round"/><path d="M13 51l-4 28h46l-4-28z" fill="#e6d8f3" stroke="#cdbbe0" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="52" r="3.2" fill="#e8c29b"/><circle cx="52" cy="52" r="3.2" fill="#e8c29b"/></svg>`;

  function ihramPage() {
    return `<div class="ih">
      <div class="ih-s"><span class="ih-n">1</span><div class="ih-b"><b>Ғұсыл</b><p>Жуынып, таза болыңыз.</p></div><span class="ih-i">${ic("shower", 26)}</span></div>

      <div class="ih-h"><span class="ih-n">2</span><b>Ихрамға киіну</b></div>
      <div class="ih-2">
        <div class="ih-c man"><div class="ih-pic">${MAN_SVG}</div><b>Ер адам</b><p>Тігілмеген екі ақ мата: бірі беліне, екіншісі иығына. Басты жаппайды.</p></div>
        <div class="ih-c wom"><div class="ih-pic">${WOMAN_SVG}</div><b>Әйел адам</b><p>Арнайы киім керек емес — жай, жабық, таза киім. Бетті жаппайды.</p></div>
      </div>

      <div class="ih-h"><span class="ih-n">3</span><b>Ниет</b></div>
      <div class="ih-niyat"><div class="ih-q">Ләббайк, Аллаһумма 'умра</div><p>Уа Аллаһ, ұмраға келдім. Ниеттен кейін тәлбия айтып жүресіз.</p></div>

      <div class="ih-h"><span class="ih-n">4</span><b>Ихрамға қайда кіресіз?</b></div>
      <div class="ih-route a"><span class="ih-ri">${ic("mosque", 26)}</span><div><b>Мәдинадан келсеңіз</b><p>Зүл-Хулайфа миқатында ихрамға кіресіз: ғұсыл, ихрам киімі, ниет — сол жерде.</p></div></div>
      <div class="ih-route b"><span class="ih-ri">${ic("plane", 26)}</span><div><b>Джидда арқылы ұшсаңыз</b><p>Ихрамға ұшақтың ішінде кіресіз — миқат тұсынан өтпей тұрып. Экипаж хабарлайды. Джиддаға түскен соң емес!</p></div></div>
    </div>`;
  }

  // ---- Ихрам және ниет: практика (ер/әйелге жеке қадамдар) және тексеру тізімі ----
  // Ихрам толық дайын ба: ер/әйелге жеке тексеру тізімі (соңғы кезең)
  const IH_CHECK = {
    m: [
      ["Ғұсыл алдым", "Жуынып, таза болдым."],
      ["Изар — белге", "Тігілмеген ақ мата белден тізеден төмен оралған."],
      ["Рида — иыққа", "Екінші ақ мата екі иыққа жабылған. Оң иық тек тауапта ашылады."],
      ["Басым ашық", "Бөрік, сәлде немесе орамал жоқ."],
      ["Аяқ киім дұрыс", "Өкше мен башпай ашық, тігілмеген шәркей."],
      ["Тігілген киім жоқ", "Көйлек, шалбар, іш киім ихрам кезінде киілмейді."],
      ["Хош иіс жоқ", "Матаға иіссу жағылмаған, хош иісті сабын қолданбаймын."],
      ["Ниет етемін", "«Ләббайк, Аллаһумма 'умра» деп, тәлбия бастаймын."],
    ],
    w: [
      ["Ғұсыл алдым", "Жуынып, таза болдым. Етеккір (хайыз) болса да, ғұсыл алуға болады."],
      ["Жабық, кең киім", "Қолдан басқа дене түгел жабық, киім тар емес, таза."],
      ["Бет ашық", "Бетті жапқыш (никаб) жоқ."],
      ["Қолғап жоқ", "Қол ашық, қолғап киілмейді."],
      ["Бас жаулықпен жабық", "Әйел басын жаулықпен жабады, бетіне тигізбейді."],
      ["Хош иіс жоқ", "Иіссу, хош иісті крем немесе сабын қолданбаймын."],
      ["Етеккір (хайыз) туралы білемін", "Етеккір болса да ихрамға кіре аламын. Тауаф пен мешітте намаз — тазарған соң."],
      ["Махрам жанымда", "Ері немесе махрамы бірге жүреді."],
      ["Ниет етемін", "«Ләббайк, Аллаһумма 'умра» деп, тәлбия бастаймын."],
    ],
  };
  // Практика қадамдары: әр қадам — не істеу керек және қалай (сызбамен)
  const IH_STEPS = {
    m: [
      { t: "Ғұсыл", p: "Бүкіл денеңізді жуыңыз. Тырнақ пен артық түкті алыңыз. Бұл — ихрамға дайындық.", fig: "wash" },
      { t: "Изар — белге", p: "Бір ақ матаны белден тізеден төмен орап, түйіңіз немесе белдікпен бекітіңіз.", fig: "m1" },
      { t: "Рида — иыққа", p: "Екінші ақ матаны екі иыққа жабыңыз. Оң иық тек тауапта ашылады.", fig: "m2" },
      { t: "Бас пен аяқ", p: "Бас ашық болсын: бөрік, сәлде жоқ. Аяқта өкше мен башпай ашық шәркей киіңіз.", fig: "m3" },
      { t: "Екі рәкәт намаз", p: "Дәрет алып, екі рәкәт нәпіл намаз оқыңыз.", fig: "pray" },
      { t: "Ниет", p: "Жүрегіңізбен ұмраға ниет етіп, дауыстап айтыңыз. Одан кейін тәлбия айтып жүресіз.", say: "Ләббайк, Аллаһумма 'умра", fig: "niyat" },
      { t: "Миқат", p: "Ихрамға қай жерде кіретініңіз жолыңызға байланысты.", fig: "miqat" },
    ],
    w: [
      { t: "Ғұсыл", p: "Бүкіл денеңізді жуыңыз. Етеккір (хайыз) болып жатса да, ғұсыл алуға болады.", fig: "wash" },
      { t: "Жабық, кең киім", p: "Қолдан басқа дене түгел жабық, киім кең және таза болсын. Арнайы ақ киім керек емес.", fig: "w1" },
      { t: "Бас жабық, бет ашық", p: "Басты жаулықпен жабыңыз, бетті ашық қалдырыңыз. Никаб пен қолғап киілмейді.", fig: "w2" },
      { t: "Етеккір (хайыз) болса", p: "Етеккір болып жатса да, ихрамға кіріп, ниет етуге болады. Тауаф жасауға және мешітте намаз оқуға болмайды — тазарған соң жасайсыз. Сағи тауаптан кейін жасалады.", fig: "info" },
      { t: "Махрам", p: "Ұмра сапарында ері немесе махрамыңыз бірге жүреді.", fig: "info" },
      { t: "Екі рәкәт намаз", p: "Дәрет алып, екі рәкәт нәпіл намаз оқыңыз.", fig: "pray" },
      { t: "Ниет", p: "Жүрегіңізбен ұмраға ниет етіп, дауыстап айтыңыз. Одан кейін тәлбия айтып жүресіз.", say: "Ләббайк, Аллаһумма 'умра", fig: "niyat" },
      { t: "Миқат", p: "Ихрамға қай жерде кіретініңіз жолыңызға байланысты.", fig: "miqat" },
    ],
  };
  let IH = { g: null, r: 0, done: false, chk: [] };
  const ihReset = () => { IH = { g: null, r: 0, done: false, chk: [] }; };
  const ihN = () => (IH.g ? IH_STEPS[IH.g].length + 1 : 1); // соңғысы — тексеру тізімі

  // Ихрам киімінің сызбасы: қадамға қарай матасы қосылады (жасыл белгі — қазір істейтін жер)
  function ihFig(k) {
    const sk = "#e8c29b", W = "#fff", ln = "#d5cfca", hi = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="none" stroke="#22c55e" stroke-width="3" stroke-dasharray="5 4"><animate attributeName="opacity" values="1;.4;1" dur="2s" repeatCount="indefinite"/></ellipse>`;
    const no = (x, y) => `<circle cx="${x}" cy="${y}" r="10" fill="#fff" stroke="#e5484d" stroke-width="2.5"/><path d="M${x - 7} ${y + 7}L${x + 7} ${y - 7}" stroke="#e5484d" stroke-width="2.5" stroke-linecap="round"/>`;
    if (k[0] === "m") {
      const n = +k[1];
      let g = `<circle cx="60" cy="20" r="13" fill="${sk}"/><rect x="54" y="30" width="12" height="8" fill="${sk}"/><rect x="38" y="36" width="44" height="50" rx="10" fill="${sk}"/><rect x="27" y="40" width="11" height="42" rx="5" fill="${sk}"/><rect x="82" y="40" width="11" height="42" rx="5" fill="${sk}"/><rect x="44" y="96" width="14" height="42" rx="4" fill="${sk}"/><rect x="62" y="96" width="14" height="42" rx="4" fill="${sk}"/>`;
      if (n >= 1) g += `<path d="M38 80H82L88 132H32Z" fill="${W}" stroke="${ln}" stroke-width="2" stroke-linejoin="round"/><path d="M60 82V130" stroke="${ln}" stroke-width="1.5"/>`;
      if (n >= 2) g += `<path d="M24 46Q60 26 96 46L98 74L86 68V92H34V68L22 74Z" fill="${W}" stroke="${ln}" stroke-width="2" stroke-linejoin="round"/><path d="M50 33L60 54L70 33Z" fill="${sk}"/><path d="M60 54V90" stroke="${ln}" stroke-width="1.5"/>`;
      if (n >= 3) g += `<rect x="42" y="139" width="18" height="6" rx="3" fill="#8b5a2b"/><rect x="60" y="139" width="18" height="6" rx="3" fill="#8b5a2b"/>${no(98, 12)}<path d="M91 14q7-9 14 0z" fill="#a7a19b"/>`;
      return `<svg viewBox="0 0 120 150">${g}${n === 1 ? hi(60, 100, 34, 30) : n === 2 ? hi(60, 58, 42, 28) : hi(60, 20, 20, 18) + hi(60, 142, 28, 8)}</svg>`;
    }
    if (k[0] === "w") {
      const n = +k[1];
      let g = `<path d="M60 44C38 44 28 62 26 92L18 140H102L94 92C92 62 82 44 60 44Z" fill="#e6d8f3" stroke="#cdbbe0" stroke-width="2" stroke-linejoin="round"/><circle cx="60" cy="24" r="13" fill="${sk}"/><path d="M47 22Q60 4 73 22" fill="${n >= 2 ? "none" : "#7a4a1c"}"/><circle cx="24" cy="102" r="6" fill="${sk}"/><circle cx="96" cy="102" r="6" fill="${sk}"/>`;
      if (n >= 2) g += `<path d="M44 26C42 6 78 6 76 26L84 50C70 40 50 40 36 50Z" fill="#d9c6ec" stroke="#cdbbe0" stroke-width="2" stroke-linejoin="round"/><circle cx="60" cy="26" r="11" fill="${sk}"/><circle cx="56" cy="24" r="1.4" fill="#13211c"/><circle cx="64" cy="24" r="1.4" fill="#13211c"/><path d="M56 30Q60 33 64 30" stroke="#13211c" stroke-width="1.4" fill="none" stroke-linecap="round"/>${no(24, 102)}${no(96, 102)}`;
      return `<svg viewBox="0 0 120 150">${g}${n === 1 ? hi(60, 96, 38, 50) : hi(60, 26, 18, 16)}</svg>`;
    }
    const bg = (c, ico) => `<span class="ig-ic" style="background:${c}">${ic(ico, 54)}</span>`;
    return { wash: bg("linear-gradient(135deg,#deba9b,#2f9bff)", "shower"), pray: bg("linear-gradient(135deg,#34d399,#ff8a1f)", "mosque"), niyat: bg("linear-gradient(135deg,#ffcf5a,#ee9b00)", "dua"), info: bg("linear-gradient(135deg,#b69cf2,#7a5fd1)", "tip") }[k] || "";
  }

  const ihHead = () => `<div class="ig-top"><div class="ig-dots">${Array.from({ length: ihN() }, (_, k) => `<i class="${k + 1 < IH.r ? "on" : k + 1 === IH.r ? "cur" : ""}"></i>`).join("")}</div></div>`;
  const ihNext = (label = "Орындадым") => `<div class="ig-nav">${IH.r > 1 ? `<button class="btn line sq" data-ih="prev" aria-label="Артқа">${ic("back", 22)}</button>` : ""}<button class="btn" data-ih="next">${label} ${ic("arrow", 20)}</button></div>`;

  function ihGame() { return `<div class="ihg" id="ihg">${IH.r >= 1 && IH.r <= ihN() ? ihHead() : ""}${ihStage()}</div>`; }

  function ihStage() {
    if (IH.r === 0) {
      return `<div class="ig-card"><div class="ig-t">Ихрамға дайындалайық!</div><p class="ig-p">Қадам-қадаммен практика жасаймыз. Алдымен — сіз кімсіз?</p>
        <div class="ig-2"><button class="ig-who man" data-ih="who" data-g="m"><div class="ih-pic">${MAN_SVG}</div><b>Ер адам</b></button>
        <button class="ig-who wom" data-ih="who" data-g="w"><div class="ih-pic">${WOMAN_SVG}</div><b>Әйел адам</b></button></div></div>`;
    }
    const n = ihN();
    if (IH.r === n) { // тексеру тізімі: бәрін орындадым ба
      const L = IH_CHECK[IH.g], c = IH.chk.length, all = c === L.length;
      const rows = L.map((r, k) => { const on = IH.chk.includes(k); return `<button class="ig-opt ${on ? "ok" : ""}" data-ih="chk" data-k="${k}"><span class="ig-ck">${on ? "✓" : ""}</span><span><b>${esc(r[0])}</b><small>${esc(r[1])}</small></span></button>`; }).join("");
      return `<div class="ig-card"><div class="ig-t">Тексеру тізімі</div><p class="ig-p">Бәрін орындадыңыз ба? Әрқайсысын белгілеңіз.</p>
        <div class="ig-prog"><i style="width:${Math.round((c / L.length) * 100)}%"></i></div><div class="ig-pc">${c} / ${L.length} орындалды</div><div class="ig-opts">${rows}</div>
        ${all ? `<div class="ig-msg ok">Бәрі дайын. Ихрамға кіре аласыз.</div>${ihNext("Дайын")}` : `<div class="ig-msg">Қалғаны: ${L.length - c}</div>${IH.r > 1 ? `<div class="ig-nav"><button class="btn line sq" data-ih="prev" aria-label="Артқа">${ic("back", 22)}</button></div>` : ""}`}</div>`;
    }
    const st = IH_STEPS[IH.g][IH.r - 1];
    const fig = st.fig === "miqat" ? "" : `<div class="ig-fig">${ihFig(st.fig)}</div>`;
    const miq = st.fig === "miqat" ? `<div class="ih-route a"><span class="ih-ri">${ic("mosque", 26)}</span><div><b>Мәдинадан келсеңіз</b><p>Зүл-Хулайфа миқатында ихрамға кіресіз: ғұсыл, киім, ниет — сол жерде.</p></div></div>
      <div class="ih-route b"><span class="ih-ri">${ic("plane", 26)}</span><div><b>Джидда арқылы ұшсаңыз</b><p>Ихрамға ұшақтың ішінде кіресіз, миқат тұсынан өтпей тұрып. Экипаж хабарлайды. Джиддаға түскен соң емес!</p></div></div>` : "";
    return `<div class="ig-card"><div class="ig-t">${IH.r} · ${esc(st.t)}</div>${fig}<p class="ig-p ig-do">${esc(st.p)}</p>${st.say ? `<div class="ig-say">${esc(st.say)}</div>` : ""}${miq}${ihNext()}</div>`;
  }

  function ihResult() {
    return `<div class="ihg" id="ihg"><div class="ig-card ig-res"><div class="ig-t">Ихрам дайын!</div><p class="ig-p">Барлық қадамды орындадыңыз.</p>
      <div class="ig-sum">${IH_STEPS[IH.g].map((x) => `<span>${ic("check", 18)} ${esc(x.t)}</span>`).join("")}<span>${ic("check", 18)} Тексеру тізімі</span></div>
      <button class="btn line" data-ih="again">${ic("reset", 18)} Қайта өту</button></div></div>`;
  }

  function ihRender() { return IH.r > ihN() ? ihResult() : ihGame(); }
  function ihRefresh() {
    const el = document.getElementById("ihg"); if (!el) return;
    el.outerHTML = ihRender(); ihBind();
    const dk = document.getElementById("dockbox"); if (dk) { dk.innerHTML = dockHtml(0); bindMark(0); }
  }
  function ihBind() {
    app.querySelectorAll("[data-ih]").forEach((b) => (b.onclick = () => {
      const a = b.dataset.ih;
      if (a === "who") { IH.g = b.dataset.g; IH.r = 1; }
      else if (a === "chk") { const k = +b.dataset.k; IH.chk = IH.chk.includes(k) ? IH.chk.filter((x) => x !== k) : [...IH.chk, k]; }
      else if (a === "next") { IH.r++; if (IH.r > ihN()) IH.done = true; }
      else if (a === "prev") { IH.r = Math.max(1, IH.r - 1); }
      else if (a === "again") { const g = IH.g; ihReset(); IH.g = g; IH.r = 1; }
      ihRefresh();
    }));
  }


  // ---- 1-қақпа: Абдулазиз патша қақпасынан Қағбаға дейінгі практика ----
  const GP_STEPS = [
    { t: "Баспалдақпен көтеріліңіз", p: "Асықпаңыз, кезекпен жүріңіз." },
    { t: "Оң аяқпен кіріңіз", p: "Аяқ киімді қолыңызға алыңыз.", say: "Бисмил-Лаһ, уәс-саләту уәс-сәләму 'алә расулил-Лаһ. Аллаһумма-фтах ли абуаба рахматик." },
    { t: "Қағбаға жүріңіз", p: "Түзу жүріңіз. Қағбаны көргенше тәлбия айтыңыз." },
    { t: "Қағбаны көрдіңіз", p: "Тәлбияны тоқтатып, қол көтеріп дұға жасаңыз. Қара тасқа барыңыз." },
  ];
  let GP = { r: 1, done: false, talStarted: false };
  const gpReset = () => { GP = { r: 1, done: false, talStarted: false }; };

  // Сызба: қонақүйден есікке, одан Қағбаға. Қазіргі қадам көк, орындалғаны жасыл ✓
  function gateSvg(r) {
    const F = 'font-family="Roboto" font-weight="800"';
    const mk = (i, x, y) => {
      const st = i < r ? "d" : i === r ? "c" : "t";
      const fill = st === "d" ? "#16a34a" : st === "c" ? "#2f7cff" : "#fff", stk = st === "t" ? "#d0c5bc" : "#fff";
      const pulse = st === "c" ? `<circle cx="${x}" cy="${y}" r="13" fill="#2f7cff" opacity=".35"><animate attributeName="r" values="12;19;12" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".4;0;.4" dur="2s" repeatCount="indefinite"/></circle>` : "";
      return `${pulse}<circle cx="${x}" cy="${y}" r="12" fill="${fill}" stroke="${stk}" stroke-width="2.5"/>${st === "d" ? `<path d="M${x - 5} ${y}l4 4 7-8" stroke="#fff" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : `<text x="${x}" y="${y + 4.2}" text-anchor="middle" ${F} font-size="12" fill="${st === "c" ? "#fff" : "#a6998d"}">${i}</text>`}`;
    };
    const seg = (d, on) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${on ? "#16a34a" : "#9ccbb2"}" stroke-width="5" stroke-dasharray="1 9" stroke-linecap="round"/>`;
    const step = (i, y, w) => `<rect x="${232 - w / 2}" y="${y}" width="${w}" height="9" rx="4.5" fill="#f2f0ef" stroke="#d5cfca" stroke-width="1.6"/>`;
    const glow = r === 4 ? `<circle cx="70" cy="76" r="44" fill="#ffd34d" opacity=".4"><animate attributeName="opacity" values=".5;.15;.5" dur="2.4s" repeatCount="indefinite"/></circle>` : "";
    return `<svg viewBox="0 8 320 232"><rect y="8" width="320" height="232" fill="#f5f0eb"/>
<rect x="0" y="152" width="320" height="88" fill="#e9e5e2"/>
<rect x="12" y="14" width="296" height="138" rx="18" fill="#fff" stroke="#ded7d1" stroke-width="2"/><text x="26" y="34" ${F} font-size="9.5" fill="#8b7a6b">ӘЛ-ХАРАМ МЕШІТІ</text>
${glow}<g><polygon points="44,56 70,65 70,100 44,91" fill="#161f1c"/><polygon points="70,65 96,56 96,91 70,100" fill="#0b1210"/><polygon points="70,47 96,56 70,65 44,56" fill="#2b3834"/><polygon points="44,68 70,77 70,83 44,74" fill="#e0b050"/><polygon points="70,77 96,68 96,74 70,83" fill="#b98a2e"/><rect x="63" y="88" width="11" height="14" rx="2" fill="#e0b050" opacity=".7"/></g><text x="70" y="124" text-anchor="middle" ${F} font-size="11" fill="#13211c">ҚАҒБА</text>
<rect x="150" y="18" width="150" height="20" rx="10" fill="#e0b050"/><text x="225" y="32" text-anchor="middle" ${F} font-size="9.5" fill="#3a2a00">АБДУЛАЗИЗ ПАТША ҚАҚПАСЫ</text>
<path d="M200 152V112a32 32 0 0 1 64 0v40z" fill="#fff4d6" stroke="#e0b050" stroke-width="5" stroke-linejoin="round"/><path d="M211 152V114a21 21 0 0 1 42 0v38z" fill="#1a2a25"/><path d="M232 94v10" stroke="#ffd34d" stroke-width="3" stroke-linecap="round"/><circle cx="232" cy="108" r="3" fill="#ffd34d"/>
<g opacity=".9">${step(1, 158, 84)}${step(2, 170, 100)}${step(3, 182, 116)}${step(4, 194, 132)}</g>
<text x="232" y="228" text-anchor="middle" ${F} font-size="9.5" fill="#8b7a6b">АЛАҢ</text>
${seg("M232 214L232 154", r >= 2)}${seg("M232 148L232 124", r >= 3)}${seg("M232 118C214 78 160 80 106 88", r >= 4)}
<path d="M116 78L104 88L118 96" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M116 78L104 88L118 96" fill="none" stroke="${r >= 4 ? "#16a34a" : "#9ccbb2"}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
<text x="168" y="66" text-anchor="middle" ${F} font-size="9" fill="#0b8a4a">ҚАҒБАҒА ҚАРАЙ ›</text>
${mk(1, 232, 188)}${mk(2, 232, 134)}${mk(3, 172, 82)}${mk(4, 112, 96)}</svg>`;
  }

  // Тәлбия: Қағбаға жеткенше қайталанып айтылады (аудио + мәтін, сөздер аудиомен бірге белгіленеді)
  const talBox = () => `<div class="gp-tal"><div class="gp-tal-h"><b>Тәлбия</b><span>Қағбаны көргенше</span></div><div class="gp-tal-tr">${kar(DUA.talbiyah.cue, DUA.talbiyah.tr)}</div>${wave()}<button class="gp-snd ${talking ? "on" : ""}" data-gp="tal">${ic(talking ? "stop" : "sound", 20)} ${talking ? "Тоқтату" : "Тыңдау"}</button></div>`;
  function gatePage() {
    const n = GP_STEPS.length, dots = `<div class="ig-top"><div class="ig-dots">${GP_STEPS.map((_, k) => `<i class="${k + 1 < GP.r ? "on" : k + 1 === GP.r ? "cur" : ""}"></i>`).join("")}</div></div>`;
    const fig = `<div class="gp-fig">${gateSvg(GP.done ? 6 : GP.r)}</div>`;
    if (GP.done) return `<div class="ihg" id="gpg"><div class="ig-card ig-res">${fig}<div class="ig-t">Қағба алдына жеттіңіз!</div><p class="ig-p">Енді тауаф бастауға дайынсыз.</p><button class="btn line" data-gp="again">${ic("reset", 18)} Қайта өту</button></div></div>`;
    const st = GP_STEPS[GP.r - 1], btnTxt = ["Көтерілдім", "Кірдім", "Қағбаны көрдім", "Қара тасқа жеттім"][GP.r - 1];
    return `<div class="ihg" id="gpg">${dots}<div class="ig-card"><div class="ig-t">${esc(st.t)}</div><p class="ig-p ig-do">${esc(st.p)}</p>${fig}${st.say ? `<div class="gp-say"><b>Кіру дұғасы</b><div>${esc(st.say)}</div></div>` : ""}${GP.r === 1 || GP.r === 3 ? talBox() : ""}
      <div class="ig-nav">${GP.r > 1 ? `<button class="btn line sq" data-gp="prev" aria-label="Артқа">${ic("back", 22)}</button>` : ""}<button class="btn" data-gp="next">${btnTxt} ${ic("arrow", 20)}</button></div></div></div>`;
  }
  function gpRefresh() {
    const el = document.getElementById("gpg"); if (!el) return;
    el.outerHTML = gatePage(); gpBind();
    const dk = document.getElementById("dockbox"); if (dk) { dk.innerHTML = dockHtml(1); bindMark(1); }
  }
  function gpBind() {
    app.querySelectorAll("[data-gp]").forEach((b) => (b.onclick = () => {
      const a = b.dataset.gp;
      if (a === "tal") { if (talking) stopAudio(); else playSeq(["talbiyah"], true); }
      else if (a === "next") { if (GP.r >= GP_STEPS.length) { GP.done = true; stopAudio(); } else { GP.r++; if (GP.r === 3) playSeq(["talbiyah"], true); else stopAudio(); } }
      else if (a === "prev") GP.r = Math.max(1, GP.r - 1);
      else if (a === "again") gpReset();
      gpRefresh();
    }));
  }


  // Мақамға барып намаз оқу: қоршау мен намаз орны
  function maqamPraySvg() {
    const F = 'font-family="Roboto" font-weight="700"';
    const arr = (x1, y1, x2, y2, col = "#13211c", w = 1.6, h = 7) => { const a = Math.atan2(y2 - y1, x2 - x1), p = (d) => `${(x2 - h * Math.cos(a + d)).toFixed(1)} ${(y2 - h * Math.sin(a + d)).toFixed(1)}`; return `<path d="M${x1} ${y1}L${x2} ${y2}M${p(-0.5)}L${x2} ${y2}L${p(0.5)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`; };
    const pill = (x, y, t) => { const w = t.length * 6.3 + 14; return `<rect x="${x - w / 2}" y="${y - 12}" width="${w}" height="18" rx="9" fill="#fff" stroke="#e2dcd6"/><text x="${x}" y="${y + 0.5}" text-anchor="middle" ${F} font-size="10.5" fill="#13211c">${t}</text>`; };
    const num = (x, y, n) => `<circle cx="${x}" cy="${y}" r="10" fill="#ff8a1f" stroke="#fff" stroke-width="2.5"/><text x="${x}" y="${y + 3.7}" text-anchor="middle" ${F} font-size="11.5" fill="#fff">${n}</text>`;
    return `<svg viewBox="0 0 320 236"><rect width="320" height="236" fill="#f5f0eb"/>
<circle cx="56" cy="112" r="64" fill="none" stroke="#ffcf9f" stroke-width="2" stroke-dasharray="3 6"/>
<rect x="28" y="84" width="56" height="56" rx="3" fill="#10201c"/><rect x="28" y="94" width="56" height="8" fill="#e0b050"/><text x="56" y="124" text-anchor="middle" ${F} font-size="10" fill="#fff">ҚАҒБА</text>
<rect x="136" y="88" width="52" height="56" rx="12" fill="#fff8e4" stroke="#e0b050" stroke-width="3.5" stroke-dasharray="7 4"/>
<rect x="150" y="104" width="24" height="26" rx="5" fill="#e0b050" stroke="#fff" stroke-width="2"/><path d="M147 104q15-16 30 0z" fill="#e0b050" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
<rect x="204" y="80" width="88" height="72" rx="12" fill="#f0e5db" stroke="#ff8a1f" stroke-width="2.5"/>
<rect x="216" y="92" width="26" height="42" rx="6" fill="#fff" stroke="#ff8a1f" stroke-width="1.8"/><rect x="254" y="92" width="26" height="42" rx="6" fill="#fff" stroke="#ff8a1f" stroke-width="1.8"/>
<path d="M229 98v10M267 98v10" stroke="#ff8a1f" stroke-width="2.5" stroke-linecap="round"/>
<text x="248" y="146" text-anchor="middle" ${F} font-size="9.5" fill="#e0610c">2 РӘКӘТ</text>
<circle cx="100" cy="158" r="8" fill="#2f7cff" stroke="#fff" stroke-width="2.5"/>
<path d="M108 164Q168 206 222 160" fill="none" stroke="#2f7cff" stroke-width="3" stroke-dasharray="1 7" stroke-linecap="round"/>${arr(214, 168, 224, 156, "#2f7cff", 3, 8)}
${arr(240, 176, 214, 176, "#7a4a1c", 1.4, 6)}
${num(100, 138, 1)}${num(162, 70, 2)}${num(248, 70, 3)}
${pill(150, 56, "Ибраһим мақамы")}${pill(256, 56, "Намаз орны")}${pill(162, 164, "Қоршау")}
<text x="256" y="190" text-anchor="middle" ${F} font-size="9.5" fill="#7a4a1c">Қағбаға қараңыз</text>
<text x="160" y="226" text-anchor="middle" ${F} font-size="11" fill="#e0610c">Намаз қоршаудың артында оқылады</text></svg>`;
  }

  // Ибраһим мақамы беті: ең маңыздысы ғана — қайда бару, неше рәкәт, қай сүре
  function maqamPage() {
    return `<div class="mq">
      ${fig("maqam", null, "sch")}
      <ol class="steps mq-leg"><li>Қағбадан шығыңыз.</li><li>Ибраһим мақамы — Қағба есігінің қарсы алдында.</li><li><span><b>Қоршаудың артында</b> 2 рәкәт намаз оқыңыз.</span></li></ol>
      <div class="mq-2">
        <div class="mq-c"><span class="mq-r">1-рәкәт</span><b>Фатиха + Кәфирун</b></div>
        <div class="mq-c"><span class="mq-r">2-рәкәт</span><b>Фатиха + Ихлас</b></div>
      </div>
      <div class="mq-warn c"><span class="ih-i">${ic("tip", 20)}</span><b>Қоршауға сүйенбеңіз, Мақамды сипамаңыз.</b></div>
    </div>`;
  }

  function detail(i) {
    const m = MODS[i], done = isDone(i), tawaf = m.key === "tawaf";
    const tabs = Object.keys(TAB_TITLE).map((k) => (k === "guide" && MAP_FOCUS[m.key] ? `<a class="tab" href="${HB()}/map/${m.key}"><i>${ic("nav", 26)}</i>Карта</a>` : `<button class="tab" data-tab="${k}"><i>${ic(k, 26)}</i>${TAB_TITLE[k]}</button>`)).join("");
    const pb = `<div class="pb"><i style="width:${(((i - 1) + (done ? 1 : 0.4)) / (MODS.length - 1)) * 100}%"></i></div>`; // «Ихрам» жасырын: 6 қадам, нөмірлеу тізімдегідей (1–6)
    // «Қадам N/7» орнына қадамның атауы тұрады (бір жолда)
    const top = `<header class="tb tb-one"><a class="ib" href="${i === 0 && !BADAL ? "#/" : HB() + "/steps"}" aria-label="Тізімге">${ic("back")}</a><span class="hic sm">${ic(m.key, 22)}</span><h1>${esc(m.title)}</h1>${MAP_FOCUS[m.key] && m.key === "maqam" ? `<a class="ib mapb" href="${HB()}/map/${m.key}" aria-label="Картада көрсету">${ic("nav", 20)}</a>` : ""}${i === 0 ? "" : `<span class="stepchip">${BADAL ? i + 1 : i}-қадам</span>`}</header>${i === 0 ? "" : pb}${tawaf || m.key === "maqam" || m.key === "sai" ? "" : `<p class="lead">${esc(m.lead)}</p>`}`;
    return `<section class="scr">
      ${top}
      ${tawaf ? twCard() : m.key === "sai" ? saiCard() : m.key === "ihram" ? ihRender() : m.key === "gate" ? gatePage() : m.key === "maqam" ? maqamPage() : fig(m.figs[0], m.count ? m : null, "sch")}
      ${m.key === "maqam" ? "" : `<div class="tabs">${tabs}</div>`}
      <div id="dockbox">${dockHtml(i)}</div>
    </section>`;
  }

  // ---- Тауаф жолы: 4 бұрыш, әр бұрышта автоматты дұға ----
  // Қағба бұрыштары жаққа қарап тұр: Қара тас — шығыс, Ирақи — солтүстік, Шам — батыс, Йәмани — оңтүстік.
  const CN = ["Қара тас бұрышы", "Ирак бұрышы", "Шам бұрышы", "Йемен бұрышы"];
  const RUKN_DUAS = ["stone", "tw0", "tw1", "tw2", "rabbana", "maqamAyah", "kafirun", "ikhlas"]; // тек транскрипциямен көрсетіледі
  const CSEQ = [["stone", "tw0"], ["tw1"], ["tw2"], ["rabbana"]];
  let twk = -1, voiceOn = true;

  function twCard() {
    const m = byKey("tawaf"), n = cnt(m), full = n >= m.count, on = twk >= 0, nx = (twk + 1) % 4;
    const dots = Array.from({ length: m.count }, (_, k) => `<i class="${k < n ? "on" : k === n && !full ? "next" : ""}"></i>`).join("");
    const short = (c) => c.replace(" бұрышы", "");
    const rows = CN.map((c, i) => {
      const key = CSEQ[i][CSEQ[i].length - 1], d = DUA[key];
      const act = on && !full && i === twk, done = full || (on && i < twk), st = act ? "act" : done ? "done" : "";
      const text = act ? `<span class="trl">${CSEQ[i].map((k) => `<b>${esc(DUA[k].tr)}</b>`).join("")}</span>${wave()}` : `<small>${esc(d.tr)}</small>`;
      return `<div class="tl ${st}"><span class="tl-n">${done ? ic("check", 14) : i + 1}</span><button class="sg ${st}" data-dua="${key}" aria-label="${esc(short(c))} → ${esc(short(CN[(i + 1) % 4]))}: тыңдау"><span class="sg-t"><em>${esc(short(c))}<i>${ic("arrow", 14)}</i>${esc(short(CN[(i + 1) % 4]))}${act ? '<u>қазір оқыңыз</u>' : ""}</em>${text}</span></button></div>`;
    }).join("");
    let now, main;
    if (full) { now = "Тауаф аяқталды"; main = `<div class="twc-done">7 айналым толды. Қара тасқа ишара жасап, Мақамға барыңыз.</div>`; }
    else if (!on) { now = "Қара тас бұрышынан бастаңыз"; main = `<div class="twc-b"><button class="btn" data-tw="start">${ic("play", 18)} Бастау</button></div>`; }
    else { now = `${CN[twk].replace(" бұрышы", "")} → ${CN[nx].replace(" бұрышы", "")}`; main = `<div class="twc-b">${talking ? `<button class="btn line sm stop" data-tw="stop" aria-label="Дыбысты тоқтату">${ic("stop", 16)}</button>` : `<button class="btn line sm" data-tw="replay" aria-label="Қайта тыңдау">${ic("play", 16)}</button>`}<button class="btn sm" data-tw="next">${CN[nx]} · жеттім ${ic("arrow", 18)}</button></div>`; }
    return `<div class="card twc" id="twc"><div class="twc-h"><b>${esc(now)}</b><span>${n} / ${m.count} айналым</span>${n > 0 || on ? `<button class="snd" data-tw="restart" aria-label="Тауапты басынан бастау">${ic("reset", 19)}</button>` : ""}<button class="snd ${voiceOn ? "on" : ""}" data-tw="voice" aria-pressed="${voiceOn}" aria-label="${voiceOn ? "Дыбысты өшіру" : "Дыбысты қосу"}">${ic(voiceOn ? "sound" : "mute", 20)}</button></div><div class="cnt-dots">${dots}</div>${tawafSvg(n, on && !full ? twk : -1)}${on || full ? `<div class="sgs">${rows}</div>` : `<div class="twc-pre"><div class="pre-h">${ic("tip", 20)} Тауапты бастамас бұрын</div><ol class="pre-l"><li><b>Ер адам оң иығын ашады.</b> Ихрамның жоғарғы матасын оң қолтықтың астынан өткізіп, екі шетін сол иыққа салыңыз — оң иық ашық қалады.</li><li>Қара тастың жасыл сызығына тұрыңыз, Қағба сол жағыңызда.</li><li><b>Әйел адам:</b> барынша шет жағымен, Қағбадан алыс айналымда жүрген абзал — тығыздықтан аулақ боласыз.</li></ol></div>`}${main}
</div>`;
  }
  function twRefresh() { const el = document.getElementById("twc"); if (el) { el.outerHTML = twCard(); bindTw(); } }

  function twArrive(k) {
    const m = byKey("tawaf"); if (cnt(m) >= m.count) return;
    hideNote();
    if (k === 0 && twk === 3) {
      setCnt("tawaf", cnt(m) + 1);
      if (navigator.vibrate) navigator.vibrate(60);
      if (cnt(m) === 3) { showNote("3 айналым бітті. Ер адам оң иығын жабады."); if (navigator.vibrate) navigator.vibrate([90, 60, 90]); }
      if (cnt(m) >= m.count) { twk = 0; toast("Тауаф аяқталды!"); twRefresh(); return; }
    }
    twk = k; twRefresh();
    if (voiceOn) playSeq(CSEQ[k], true);
  }
  function bindTw() {
    app.querySelectorAll("[data-tw]").forEach((b) => (b.onclick = () => {
      const a = b.dataset.tw;
      if (a === "start") twArrive(0);
      else if (a === "next") twArrive((twk + 1) % 4);
      else if (a === "stop") stopAudio();
      else if (a === "restart") ask("Тауапты басынан бастайсыз ба?", "Айналымдар нөлденеді.", "Иә, бастау", () => { stopAudio(); hideNote(); twk = -1; setCnt("tawaf", 0); twRefresh(); })
      else if (a === "replay") playSeq(CSEQ[twk], true);
      else if (a === "voice") { voiceOn = !voiceOn; if (!voiceOn) stopAudio(); twRefresh(); }
    }));
  }

  // ---- Сағи: Сафа ↔ Мәруа, 7 жүріс (тауаф картасындағыдай) ----
  let saiOn = false, saiPh = 0; // saiPh: 0 — төбеде (дұға), 1 — жолда, 2 — жасыл белгіде, 3 — жасыл белгіден кейін
  const saiPos = (n) => (n % 2 === 0 ? "Сафа" : "Мәруа");

  // Сафа мен Мәруа көрінісі: екі төбе мен олардың арасындағы айналма жол (сағатқа қарсы: төменгі жолақ — Мәруаға, жоғарғы — Сафаға)
  function saiSvg(n) {
    const F = 'font-family="Roboto" font-weight="700"', full = n >= 7, run = saiOn && !full;
    const toMarwa = n % 2 === 0; // келесі жүріс бағыты
    const XL = 96, XR = 224, YT = 76, YB = 124, R = 24; // айналма жол: сол/оң шет, жоғарғы/төменгі жолақ
    const track = `M${XL} ${YT}H${XR}A${R} ${R} 0 0 1 ${XR} ${YB}H${XL}A${R} ${R} 0 0 1 ${XL} ${YT}Z`;
    const hill = (cx, name, col, txtCol, id) => {
      const target = run && ((id === "m") === toMarwa), me = run && !target;
      return `<g transform="translate(0 -35) translate(${cx} 134) scale(1.12) translate(${-cx} -134)">${!saiOn && id === "s" ? `<ellipse cx="${cx}" cy="138" rx="24" ry="23" fill="none" stroke="#2f7cff" stroke-width="3"><animate attributeName="rx" values="24;28;24" dur="1.4s" repeatCount="indefinite"/></ellipse>` : ""}${target ? `<ellipse cx="${cx}" cy="138" rx="24" ry="23" fill="none" stroke="#e0b050" stroke-width="3"><animate attributeName="rx" values="24;29;24" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;.1;1" dur="1.5s" repeatCount="indefinite"/></ellipse>` : ""}${me ? `<ellipse cx="${cx}" cy="138" rx="24" ry="23" fill="none" stroke="#2f7cff" stroke-width="3"/>` : ""}

<rect x="${cx - 19}" y="118" width="38" height="38" rx="8" fill="#e8730c"/><path d="M${cx - 14} 150L${cx - 5} 130Q${cx - 3} 126 ${cx - 1} 130L${cx + 2} 137L${cx + 6} 126Q${cx + 8} 122 ${cx + 10} 126L${cx + 15} 150Z" fill="#ffc21a" stroke="#ffc21a" stroke-width="2" stroke-linejoin="round"/>
<text x="${cx}" y="167" text-anchor="middle" ${F} font-size="11" fill="${txtCol}">${name}</text></g>`;
    };
    // жүріс нөмірлері: тақ — Мәруаға жеткенде, жұп — Сафаға жеткенде
    const badge = (k, x) => {
      const done = k <= n, cur = k === n + 1 && run;
      return `<circle cx="${x}" cy="150" r="6.5" fill="${done ? "#ff8a1f" : cur ? "#2f7cff" : "#fff"}" stroke="${done || cur ? "#fff" : "#d0c5bc"}" stroke-width="1.6"/><text x="${x}" y="153.3" text-anchor="middle" ${F} font-size="9" fill="${done || cur ? "#fff" : "#71675f"}">${k}</text>`;
    };
    const arrow = (x, y, dir, col) => `<path d="M${x - dir * 5} ${y - 5}L${x + dir * 3} ${y}L${x - dir * 5} ${y + 5}" fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    // сағатқа қарсы айналма: Мәруаға — төменгі жолақпен (→), Сафаға — жоғарғы жолақпен (←)
    const lit = run && saiPh >= 1; // түзу жол тек «түзу жолға шықтым» басылғанда жанады
    const botCol = lit && toMarwa ? "#2f7cff" : "#a6998d", topCol = lit && !toMarwa ? "#2f7cff" : "#a6998d";
    // маяк: бұрылыста жоқ; «түзу жолға шықтым» басылғанда түзу жолда жанып тұрады (кезеңмен жылжиды)
    let dot = "";
    if (run && saiPh >= 1) {
      const y = toMarwa ? YB : YT, x = (toMarwa ? [XL + 8, 160, 204] : [XR - 8, 160, 116])[saiPh - 1], col = saiPh === 2 ? "#22c55e" : "#2f7cff";
      dot = `<circle cx="${x}" cy="${y}" r="9" fill="${col}" opacity=".4"><animate attributeName="r" values="7;19;7" dur="1.3s" repeatCount="indefinite"/><animate attributeName="opacity" values=".55;.05;.55" dur="1.3s" repeatCount="indefinite"/></circle><circle cx="${x}" cy="${y}" r="6.5" fill="${col}" stroke="#fff" stroke-width="2.5"/>`;
    }
    // бұрылыс доғалары — төбедегі дұға оқылатын орын (екі төбеде де бірдей)
    const act = run && saiPh === 0 ? (toMarwa ? "s" : "m") : null;
    const arc = (id, d) => { const on = act === id; return `<path d="${d}" fill="none" stroke="${on ? "#2f7cff" : "#e0b050"}" stroke-width="${on ? 6 : 4}" stroke-linecap="round">${on ? '<animate attributeName="opacity" values="1;.45;1" dur="1.3s" repeatCount="indefinite"/>' : ""}</path>`; };
    const turn = arc("m", `M${XR} ${YT}A${R} ${R} 0 0 1 ${XR} ${YB}`) + arc("s", `M${XL} ${YB}A${R} ${R} 0 0 1 ${XL} ${YT}`);
    const tag = (x, anchorEnd, id) => {
      const safa = id === "s", on = act === id || (!saiOn && safa), w = safa ? 156 : 150, x0 = anchorEnd ? x - w : x;
      const l1 = safa ? "БҰРЫЛЫС · АЯТ (БАҚАРА, 158)" : "БҰРЫЛЫС · ДҰҒА", l2 = safa ? "Иннәс-сафа уәл-мәруата…" : "Аллаһу әкбар ×3, Лә иләһә…";
      return `<rect x="${x0}" y="18" width="${w}" height="31" rx="10" fill="${on ? "#2f7cff" : "#fff8e4"}" stroke="${on ? "#fff" : "#e0b050"}" stroke-width="1.5">${on ? '<animate attributeName="opacity" values="1;.75;1" dur="1.3s" repeatCount="indefinite"/>' : ""}</rect><text x="${x0 + w / 2}" y="31" text-anchor="middle" ${F} font-size="8.5" fill="${on ? "#dbe8ff" : "#9a6b00"}">${l1}</text><text x="${x0 + w / 2}" y="43" text-anchor="middle" ${F} font-size="10.5" fill="${on ? "#fff" : "#4a3300"}">${l2}</text>`;
    };
    // жасыл белгі: әр жолақта 4-тен (барлығы 8) жол бойына параллель жасыл сызық + жүгіруші белгісі
    const gOn = run && saiPh === 2, gCol = gOn ? "#22c55e" : "#43d17f";
    const zoneLines = [YT, YB].map((y) => [-7.5, -2.5, 2.5, 7.5].map((d) => `<path d="M118 ${(y + d).toFixed(1)}H160" stroke="${gCol}" stroke-width="1.4" stroke-linecap="round"/>`).join("")).join("");
    const runner = `<circle cx="139" cy="100" r="10" fill="#fff" stroke="${gOn ? "#6fd99a" : "#e4ded8"}" stroke-width="${gOn ? 3 : 1.2}"/><g transform="translate(133.5 93.5)" fill="none" stroke="#13211c" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="6.8" cy="1.8" r="1.6" fill="#13211c"/><path d="M5.8 4.6 4.2 8.4 1.6 10.6M4.2 8.4l3.2 2 .6 2.8M5.8 4.6l3.2 1.5M5.5 5.5 2.4 6.4"/></g>`;
    return `<svg viewBox="0 0 320 200"><rect width="320" height="200" fill="#f5f0eb"/>
<text x="160" y="168" text-anchor="middle" ${F} font-size="9.5" fill="#e0610c">жасыл белгі · ер жүгіреді</text>
<text x="160" y="146" text-anchor="middle" ${F} font-size="9" fill="#71675f">түзу жол: басқа дұғалар</text>
<path d="${track}" fill="none" stroke="#e6e1dc" stroke-width="19" stroke-linejoin="round"/>
<path d="M${XR} ${YT}H${XL}" stroke="${topCol}" stroke-width="${lit && !toMarwa ? 5 : 2.4}" stroke-linecap="round"/><path d="M${XL} ${YB}H${XR}" stroke="${botCol}" stroke-width="${lit && toMarwa ? 5 : 2.4}" stroke-linecap="round"/>
${turn}
${zoneLines}${runner}${arrow(150, YT, -1, topCol)}${arrow(170, YB, 1, botCol)}${dot}
${hill(36, "САФА", "#ff8a1f", "#e0610c", "s")}${hill(284, "МӘРУА", "#e0b050", "#9a6b00", "m")}${tag(4, false, "s")}${tag(316, true, "m")}
${[2, 4, 6].map((k, i) => badge(k, 20 + i * 16)).join("")}${[1, 3, 5, 7].map((k, i) => badge(k, 260 + i * 16)).join("")}</svg>`;
  }

  function saiCard() {
    const m = byKey("sai"), n = cnt(m), full = n >= m.count, toMarwa = n % 2 === 0, hill = toMarwa ? "Сафа" : "Мәруа", dest = toMarwa ? "Мәруа" : "Сафа";
    const dots = Array.from({ length: m.count }, (_, k) => `<i class="${k < n ? "on" : k === n && !full ? "next" : ""}"></i>`).join("");
    let now, main;
    if (full) { now = "Сағи аяқталды"; main = `<div class="twc-done">7 жүріс толды — Мәруадасыз. Мәруада да дұға оқып, өзіңізге, отбасыңызға және барлық мұсылманға дұға тілеңіз. Содан соң шаш алуға барыңыз.</div>`; }
    else if (!saiOn) {
      now = "Сафаға жақындаңыз";
      main = `<div class="twc-pre"><div class="pre-h">${ic("tip", 20)} Сафаға жақындағанда (Бақара, 158)</div><div class="sai-ayah">${kar(DUA.saiStart.cue, DUA.saiStart.tr)}${wave()}</div><ol class="pre-l"><li>Аятты сағиден алдын тек бір рет оқиды. Содан Сафаға көтеріліп, Қағбаға қарап, Аллаһқа мадақ айтыңыз.</li></ol></div><div class="twc-b"><button class="btn" data-sai="start">${ic("play", 18)} Сафаға көтерілдім</button></div>`;
    } else {
      now = toMarwa ? "Сафа → Мәруа" : "Мәруа → Сафа";
      const btn = [["step", "Түзу жолға шықтым"], ["step", "Жасыл белгіге келдім"], ["step", "Жасыл белгіден өттім"], ["next", `${dest}ға жеттім`.replace("Мәруаға", "Мәруаға").replace("Сафаға", "Сафаға")]][saiPh];
      const bar = `<div class="sai-ph">${["Бұрылыста", "Түзу жолда", "Жасыл белгіде", "Жету"].map((t, k) => `<i class="${k < saiPh ? "on" : k === saiPh ? "cur" : ""}">${t}</i>`).join("")}</div>`;
      const mid = [
        hill === "Сафа"
          ? `<div class="sai-i ay"><span>Сафа төбесінің бұрылысында оқыңыз (Бақара, 158)</span><b>${kar(DUA.saiStart.cue, DUA.saiStart.tr)}</b>${wave()}</div><div class="sai-h">Түзу жолға шыққанға дейін оқыңыз.</div>`
          : `<div class="sai-i"><span>Мәруа төбесінің бұрылысында оқыңыз (3 рет)</span><b>${kar(DUA.saiTahlil.cue, DUA.saiTahlil.tr)}</b>${wave()}</div><div class="sai-h">Түзу жолға шыққанға дейін оқыңыз. Содан соң өзіңізге, отбасыңызға және барлық мұсылманға дұға тілеңіз.</div>`,
        `<div class="sai-walk"><b>Енді басқа дұғалар оқыңыз</b><span>${dest}ға жеткенше қалауыңызша дұға, зікір, салауат.</span></div>`,
        `<div class="sai-who"><div class="man"><b>Ер адам</b><span>жеңіл жүгіреді</span></div><div class="wom"><b>Әйел адам</b><span>жай жүреді</span></div></div>`,
        `<div class="sai-walk"><b>Жай жүріңіз</b><span>${dest}ға жеткенше басқа дұғалар оқи беріңіз. Жеткенде бұрылыста ${toMarwa ? "«Лә иләһә иллаллаһу…» дұғасын" : "«Иннәс-сафа уәл-мәруата…» аятын"} оқисыз.</span></div>`,
      ][saiPh];
      main = `${bar}${mid}
        <div class="twc-b">${talking ? `<button class="btn line sm stop" data-sai="stop" aria-label="Дыбысты тоқтату">${ic("stop", 16)}</button>` : saiPh === 0 ? `<button class="btn line sm" data-sai="replay" aria-label="Қайта тыңдау">${ic("play", 16)}</button>` : ""}<button class="btn sm ${saiPh === 2 ? "run" : ""}" data-sai="${btn[0]}">${btn[1]} ${ic("arrow", 18)}</button></div>`;
    }
    return `<div class="card twc" id="sai"><div class="twc-h"><b>${esc(now)}</b><span>${n} / ${m.count} жүріс</span>${n > 0 || saiOn ? `<button class="snd" data-sai="restart" aria-label="Сағиді басынан бастау">${ic("reset", 19)}</button>` : ""}<button class="snd ${voiceOn ? "on" : ""}" data-sai="voice" aria-pressed="${voiceOn}" aria-label="${voiceOn ? "Дыбысты өшіру" : "Дыбысты қосу"}">${ic(voiceOn ? "sound" : "mute", 20)}</button></div><div class="cnt-dots">${dots}</div>${saiSvg(n)}${main}</div>`;
  }
  function saiRefresh() { const el = document.getElementById("sai"); if (el) { el.outerHTML = saiCard(); bindSai(); } }

  function saiArrive() {
    const m = byKey("sai"), n = cnt(m); if (n >= m.count) return;
    hideNote();
    if (!saiOn) { saiOn = true; saiPh = 0; saiRefresh(); if (voiceOn) playSeq(["saiStart"], true); return; }
    saiPh = 0;
    setCnt("sai", n + 1);
    if (navigator.vibrate) navigator.vibrate(60);
    if (n + 1 >= m.count) { toast("Сағи аяқталды!"); stopAudio(); saiRefresh(); return; }
    saiRefresh();
    if (voiceOn) playSeq([(n + 1) % 2 === 0 ? "saiStart" : "saiTahlil"], true); // Сафада — аят, Мәруада — дұға
  }
  const SAI_NOTE = [null, "Түзу жолға шықтыңыз — енді қалауыңызша басқа дұғалар оқыңыз.", "Жасыл белгі! Ер адам жеңіл жүгіреді, әйел адам жай жүреді.", "Жасыл белгі аяқталды — барлығы жай жүреді."];
  function saiStep() {
    hideNote();
    saiPh = Math.min(saiPh + 1, 3);
    if (saiPh === 1) stopAudio();
    if (SAI_NOTE[saiPh]) showNote(SAI_NOTE[saiPh]);
    if (navigator.vibrate) navigator.vibrate(saiPh === 2 ? [90, 60, 90] : 40);
    saiRefresh();
  }
  function bindSai() {
    app.querySelectorAll("[data-sai]").forEach((b) => (b.onclick = () => {
      const a = b.dataset.sai;
      if (a === "start" || a === "next") saiArrive();
      else if (a === "step") saiStep();
      else if (a === "stop") stopAudio();
      else if (a === "replay") playSeq([cnt(byKey("sai")) % 2 === 0 ? "saiStart" : "saiTahlil"], true);
      else if (a === "voice") { voiceOn = !voiceOn; if (!voiceOn) stopAudio(); saiRefresh(); }
      else if (a === "restart") ask("Сағиді басынан бастайсыз ба?", "Жүрістер нөлденеді.", "Иә, бастау", () => { stopAudio(); hideNote(); saiOn = false; saiPh = 0; setCnt("sai", 0); saiRefresh(); })
    }));
  }

  // Растау терезесі: confirm() кейбір қолданбаларда (телефон браузері, PWA) үнсіз бұғатталады
  const askEl = document.createElement("div");
  askEl.className = "askwrap"; askEl.hidden = true;
  document.body.appendChild(askEl);
  function ask(title, text, yes, onYes) {
    askEl.innerHTML = `<div class="ask-bd" data-no></div><div class="ask-p" role="alertdialog" aria-label="${esc(title)}"><b>${esc(title)}</b><p>${esc(text)}</p><div class="ask-b"><button class="btn line sm" data-no>Жоқ</button><button class="btn sm danger" data-yes>${esc(yes)}</button></div></div>`;
    askEl.hidden = false;
    askEl.querySelectorAll("[data-no]").forEach((b) => (b.onclick = () => (askEl.hidden = true)));
    askEl.querySelector("[data-yes]").onclick = () => { askEl.hidden = true; onYes(); };
  }

  // ---- роутер ----
  let lastI = -1;

  // ---- Карта: қарапайым OpenStreetMap картасы (Әл-Харам аймағы) ----
  const MAP_PTS = [
    ["Қағба", [21.4225172, 39.8261942], "#13211c", "dn"], ["Абдулазиз патша қақпасы", [21.42104, 39.82584], "#e0b050"],
    ["Ибраһим мақамы", [21.4225789, 39.8263055], "#0aa37f", "up"], ["Сафа", [21.4218, 39.82743], "#ff8a1f"], ["Мәруа", [21.42518, 39.82713], "#ff8a1f"],
  ];
  // Қағба аймағының нақты геометриясы (OpenStreetMap: ғимарат контурлары, тауаф жолы, бұрыштар)
  const KAABA_GEO = {
    kaaba: [[21.4225371,39.8261095],[21.4225861,39.8261922],[21.4225173,39.8262411],[21.4224985,39.8262546],[21.4224468,39.8261735],[21.4225371,39.8261095]],
    hijr: [[21.422607,39.8261737],[21.4226204,39.8261664],[21.4226305,39.8261545],[21.422636,39.8261395],[21.4226362,39.8261234],[21.4226311,39.8261083],[21.4226209,39.8260957],[21.4226071,39.826088],[21.4225916,39.8260862],[21.4225766,39.8260907],[21.4225642,39.8261007],[21.4225575,39.8260911],[21.4225716,39.8260797],[21.4225907,39.826074],[21.4226104,39.8260763],[21.4226279,39.8260861],[21.4226409,39.8261021],[21.4226474,39.8261214],[21.4226471,39.8261419],[21.4226401,39.8261609],[21.4226273,39.8261761],[21.4226121,39.8261844],[21.422607,39.8261737]],
    maqam: [[21.4225738,39.8263091],[21.4225793,39.826312],[21.4225844,39.8263084],[21.422584,39.8263019],[21.4225785,39.826299],[21.4225734,39.8263026],[21.4225738,39.8263091]],
    tawaf: [[21.4224083,39.8265193],[21.4225158,39.8265372],[21.4226232,39.8265195],[21.4227208,39.826468],[21.4227993,39.8263873],[21.4228274,39.8263416],[21.4228491,39.8262921],[21.4228641,39.8262398],[21.4228732,39.8261554],[21.4228648,39.8260709],[21.4228393,39.8259905],[21.4227963,39.8259158],[21.4227387,39.8258536],[21.4226693,39.8258071],[21.422592,39.8257788],[21.422516,39.8257701],[21.4224401,39.8257789],[21.4223676,39.8258048],[21.4223019,39.8258468],[21.4222402,39.8259102],[21.4221943,39.8259876],[21.4221668,39.8260745],[21.4221591,39.8261586],[21.4221688,39.8262425],[21.4221953,39.826322],[21.4222487,39.8264078],[21.4223215,39.8264752],[21.4224083,39.8265193]],
    start: [[21.4224985,39.8262546],[21.4224083,39.8265193],[21.4222904,39.8268401]],
  };
  const KAABA_DOOR = [21.4225173, 39.8262411]; // Қағба есігі (алтын)
  const KAABA_PTS = [
    ["Қара тас бұрышы", [21.4224985, 39.8262546], "#7a4a1c"], ["Ирақ бұрышы", [21.4225861, 39.8261922], "#7a4a1c"],
    ["Шам бұрышы", [21.4225371, 39.8261095], "#7a4a1c"], ["Йемен бұрышы", [21.4224468, 39.8261735], "#7a4a1c"],
    ["Қағба есігі", KAABA_DOOR, "#e0b050", "up"], ["Хижр Исмайыл", [21.4226134, 39.8261191], "#8d7f70", "up"],
  ];
  // Абдулазиз патша қақпасынан жасыл сызыққа (тауаф басы) жаяу жол: OSRM
  const GATE_ROUTE = [[21.421041,39.825842],[21.421045,39.825841],[21.421401,39.825924],[21.421681,39.825986],[21.421807,39.826016],[21.421856,39.82603],[21.422167,39.826075],[21.422159,39.826159],[21.422169,39.826243],[21.422195,39.826322],[21.422249,39.826408],[21.422322,39.826475],[21.422408,39.826519]];
  // Ибраһим мақамынан Сафаға: мататтан жасыл белгі арқылы Сафа шығысына дейінгі жаяу жол
  const MAQAM_SAFA = [[21.422579,39.826306],[21.42229,39.82684],[21.422316,39.827035],[21.422044,39.826976],[21.42193,39.82729],[21.421937,39.827348],[21.421801,39.827371],[21.42177,39.827393]];
  // Умра маршруты (жалпы карта): қонақүй → қақпа → Қағба → намаз орны → Сафа → шаш алу → қонақүй. Жаяу жолдар: OSRM (OSM), 2026-10
  const OV_HOTEL = { n: "Swissôtel Makkah", p: [21.41838, 39.82681] }; // мысал: Әл-Харамға жақын 5★ қонақүй (OSM)
  const OV_H2G = [[21.41876,39.82706],[21.41876,39.82706],[21.41882,39.82718],[21.41889,39.82715],[21.41898,39.82702],[21.41991,39.82661],[21.41996,39.8266],[21.42,39.82662],[21.42002,39.82666],[21.42005,39.82673],[21.42005,39.82677],[21.42001,39.82683],[21.42009,39.82683],[21.42025,39.82671],[21.42028,39.82668],[21.42027,39.82648],[21.42054,39.8263],[21.42074,39.82624],[21.42084,39.82633],[21.42084,39.82614],[21.42087,39.82589],[21.42104,39.82584]];
  // Сафа маңындағы OSM-те «hairdresser» деп белгіленген нүктелер (көбінің атауы мен жұмыс уақыты картада жоқ)
  const OV_BARB = [
    { id: "6314915197", alt: {"d":850,"c":[[21.42518,39.82724],[21.42514,39.82725],[21.42504,39.82726],[21.42494,39.82726],[21.42468,39.82729],[21.42469,39.82736],[21.42469,39.82742],[21.4247,39.82747],[21.42448,39.8275],[21.4244,39.82751],[21.4241,39.82756],[21.42409,39.82756],[21.42408,39.82756],[21.42407,39.82755],[21.42407,39.82752],[21.42405,39.82752],[21.42399,39.82753],[21.42376,39.82756],[21.4236,39.82758],[21.42316,39.82763],[21.42317,39.82765],[21.42319,39.82784],[21.42324,39.82825],[21.42298,39.82809],[21.42289,39.82804],[21.42248,39.82794],[21.42223,39.8279],[21.42203,39.82784],[21.42168,39.8277],[21.42151,39.82748],[21.42116,39.82698],[21.42115,39.82696],[21.42098,39.82674],[21.42089,39.82654],[21.42084,39.82633],[21.42074,39.82624],[21.42054,39.8263],[21.42027,39.82648],[21.42023,39.82597],[21.42013,39.82596],[21.41988,39.82593],[21.41973,39.8259]]}, p: [21.4197, 39.82606], toM: {"d":782,"c":[[21.42518,39.82724],[21.42514,39.82725],[21.42504,39.82726],[21.42494,39.82726],[21.42468,39.82729],[21.42469,39.82736],[21.42469,39.82742],[21.4247,39.82747],[21.42448,39.8275],[21.42447,39.82747],[21.42446,39.82739],[21.42442,39.82696],[21.42436,39.82655],[21.42426,39.82653],[21.42415,39.82652],[21.42402,39.82652],[21.42366,39.82642],[21.42338,39.82637],[21.42325,39.82634],[21.4232,39.82633],[21.42286,39.82624],[21.42285,39.82629],[21.42283,39.82634],[21.4228,39.82639],[21.42272,39.82647],[21.42262,39.82652],[21.42252,39.82654],[21.42241,39.82652],[21.42232,39.82648],[21.42225,39.82641],[21.42219,39.82632],[21.42217,39.82624],[21.42216,39.82616],[21.42217,39.82608],[21.42186,39.82603],[21.42181,39.82602],[21.42168,39.82599],[21.4214,39.82592],[21.42104,39.82584],[21.42087,39.82589],[21.42025,39.82579],[21.42023,39.82597],[21.42013,39.82596],[21.41988,39.82593],[21.41973,39.8259]]}, toH: {"d":349,"c":[[21.41973,39.8259],[21.41988,39.82593],[21.42013,39.82596],[21.42023,39.82597],[21.42027,39.82648],[21.42028,39.82668],[21.42025,39.82671],[21.42009,39.82683],[21.42001,39.82683],[21.42005,39.82677],[21.42005,39.82673],[21.42002,39.82666],[21.42,39.82662],[21.41996,39.8266],[21.41991,39.82661],[21.41898,39.82702],[21.41889,39.82715],[21.41882,39.82718],[21.41876,39.82706]]} },
    { id: "7978876699", alt: {"d":1638,"c":[[21.42518,39.82724],[21.42514,39.82725],[21.42504,39.82726],[21.42494,39.82726],[21.42468,39.82729],[21.42469,39.82736],[21.42469,39.82742],[21.4247,39.82747],[21.42448,39.8275],[21.42447,39.82747],[21.42446,39.82739],[21.42442,39.82696],[21.42436,39.82655],[21.42426,39.82653],[21.42415,39.82652],[21.42402,39.82652],[21.42366,39.82642],[21.42338,39.82637],[21.42325,39.82634],[21.4232,39.82633],[21.42286,39.82624],[21.42287,39.82615],[21.42287,39.82607],[21.42284,39.82599],[21.4228,39.82592],[21.42274,39.82585],[21.42267,39.82581],[21.42259,39.82578],[21.42252,39.82577],[21.42244,39.82578],[21.42237,39.82581],[21.4223,39.82585],[21.42224,39.82591],[21.42219,39.82599],[21.42217,39.82608],[21.42186,39.82603],[21.42181,39.82602],[21.42168,39.82599],[21.4214,39.82592],[21.42104,39.82584],[21.42087,39.82589],[21.42084,39.82614],[21.42084,39.82633],[21.42074,39.82624],[21.42054,39.8263],[21.42027,39.82648],[21.42028,39.82668],[21.42025,39.82671],[21.42009,39.82683],[21.42001,39.82683],[21.41996,39.82685],[21.41899,39.82724],[21.41873,39.82734],[21.4179,39.82772],[21.41757,39.82789],[21.41746,39.82794],[21.41715,39.82805],[21.41713,39.8282],[21.41703,39.82857],[21.41723,39.82898],[21.41731,39.82909],[21.41736,39.82906],[21.41772,39.8289],[21.41847,39.82844],[21.41865,39.82831],[21.41875,39.82823],[21.41897,39.82809],[21.419,39.82808],[21.41904,39.8281],[21.41911,39.82815],[21.41921,39.82825],[21.41928,39.82831],[21.4193,39.82833],[21.4196,39.82813],[21.4196,39.82795],[21.41978,39.82795],[21.41989,39.82794],[21.42006,39.82794]]}, p: [21.42007, 39.82821], toM: {"d":1622,"c":[[21.42518,39.82724],[21.42514,39.82725],[21.42504,39.82726],[21.42494,39.82726],[21.42468,39.82729],[21.42469,39.82736],[21.42469,39.82742],[21.4247,39.82747],[21.42448,39.8275],[21.4244,39.82751],[21.4241,39.82756],[21.42409,39.82756],[21.42408,39.82756],[21.42407,39.82755],[21.42407,39.82752],[21.42405,39.82752],[21.42399,39.82753],[21.42376,39.82756],[21.4236,39.82758],[21.42316,39.82763],[21.42317,39.82765],[21.42319,39.82784],[21.42324,39.82825],[21.42298,39.82809],[21.42289,39.82804],[21.42248,39.82794],[21.42223,39.8279],[21.42203,39.82784],[21.42168,39.8277],[21.42151,39.82748],[21.42116,39.82698],[21.42115,39.82696],[21.42098,39.82674],[21.42089,39.82654],[21.42084,39.82633],[21.42074,39.82624],[21.42054,39.8263],[21.42027,39.82648],[21.42028,39.82668],[21.42025,39.82671],[21.42009,39.82683],[21.42001,39.82683],[21.41996,39.82685],[21.41899,39.82724],[21.41873,39.82734],[21.4179,39.82772],[21.41757,39.82789],[21.41746,39.82794],[21.41715,39.82805],[21.41713,39.8282],[21.41703,39.82857],[21.41723,39.82898],[21.41731,39.82909],[21.41736,39.82906],[21.41772,39.8289],[21.41847,39.82844],[21.41865,39.82831],[21.41875,39.82823],[21.41897,39.82809],[21.419,39.82808],[21.41904,39.8281],[21.41911,39.82815],[21.41921,39.82825],[21.41928,39.82831],[21.4193,39.82833],[21.4196,39.82813],[21.4196,39.82795],[21.41978,39.82795],[21.41989,39.82794],[21.42006,39.82794]]}, toH: {"d":710,"c":[[21.42006,39.82794],[21.41989,39.82794],[21.41978,39.82795],[21.4196,39.82795],[21.4196,39.82813],[21.4193,39.82833],[21.41928,39.82831],[21.41921,39.82825],[21.41911,39.82815],[21.41904,39.8281],[21.419,39.82808],[21.41897,39.82809],[21.41875,39.82823],[21.41865,39.82831],[21.41847,39.82844],[21.41772,39.8289],[21.41736,39.82906],[21.41731,39.82909],[21.41723,39.82898],[21.41703,39.82857],[21.41713,39.8282],[21.41715,39.82805],[21.41716,39.82791],[21.41737,39.82785],[21.41753,39.82778],[21.41771,39.82769],[21.4181,39.82753],[21.41832,39.82743],[21.41882,39.82718],[21.41876,39.82706]]} },
    { id: "7073910679", alt: {"d":1570,"c":[[21.42518,39.82724],[21.42514,39.82725],[21.42504,39.82726],[21.42494,39.82726],[21.42468,39.82729],[21.42469,39.82736],[21.42469,39.82742],[21.4247,39.82747],[21.42448,39.8275],[21.42447,39.82747],[21.42446,39.82739],[21.42442,39.82696],[21.42436,39.82655],[21.42426,39.82653],[21.42415,39.82652],[21.42402,39.82652],[21.42366,39.82642],[21.42338,39.82637],[21.42325,39.82634],[21.4232,39.82633],[21.42286,39.82624],[21.42287,39.82615],[21.42287,39.82607],[21.42284,39.82599],[21.4228,39.82592],[21.42274,39.82585],[21.42267,39.82581],[21.42259,39.82578],[21.42252,39.82577],[21.42244,39.82578],[21.42237,39.82581],[21.4223,39.82585],[21.42224,39.82591],[21.42219,39.82599],[21.42217,39.82608],[21.42186,39.82603],[21.42181,39.82602],[21.42168,39.82599],[21.4214,39.82592],[21.42104,39.82584],[21.42087,39.82589],[21.42084,39.82614],[21.42084,39.82633],[21.42074,39.82624],[21.42054,39.8263],[21.42027,39.82648],[21.42028,39.82668],[21.42025,39.82671],[21.42009,39.82683],[21.42001,39.82683],[21.41996,39.82685],[21.41899,39.82724],[21.41873,39.82734],[21.4179,39.82772],[21.41757,39.82789],[21.41746,39.82794],[21.41715,39.82805],[21.41713,39.8282],[21.41703,39.82857],[21.41723,39.82898],[21.41731,39.82909],[21.41736,39.82906],[21.41772,39.8289],[21.41847,39.82844],[21.41865,39.82831],[21.41875,39.82823],[21.41897,39.82809],[21.419,39.82808],[21.41904,39.8281],[21.41911,39.82815],[21.41921,39.82825],[21.41928,39.82831],[21.4193,39.82833],[21.4196,39.82813]]}, p: [21.41984, 39.82831], toM: {"d":1553,"c":[[21.42518,39.82724],[21.42514,39.82725],[21.42504,39.82726],[21.42494,39.82726],[21.42468,39.82729],[21.42469,39.82736],[21.42469,39.82742],[21.4247,39.82747],[21.42448,39.8275],[21.4244,39.82751],[21.4241,39.82756],[21.42409,39.82756],[21.42408,39.82756],[21.42407,39.82755],[21.42407,39.82752],[21.42405,39.82752],[21.42399,39.82753],[21.42376,39.82756],[21.4236,39.82758],[21.42316,39.82763],[21.42317,39.82765],[21.42319,39.82784],[21.42324,39.82825],[21.42298,39.82809],[21.42289,39.82804],[21.42248,39.82794],[21.42223,39.8279],[21.42203,39.82784],[21.42168,39.8277],[21.42151,39.82748],[21.42116,39.82698],[21.42115,39.82696],[21.42098,39.82674],[21.42089,39.82654],[21.42084,39.82633],[21.42074,39.82624],[21.42054,39.8263],[21.42027,39.82648],[21.42028,39.82668],[21.42025,39.82671],[21.42009,39.82683],[21.42001,39.82683],[21.41996,39.82685],[21.41899,39.82724],[21.41873,39.82734],[21.4179,39.82772],[21.41757,39.82789],[21.41746,39.82794],[21.41715,39.82805],[21.41713,39.8282],[21.41703,39.82857],[21.41723,39.82898],[21.41731,39.82909],[21.41736,39.82906],[21.41772,39.8289],[21.41847,39.82844],[21.41865,39.82831],[21.41875,39.82823],[21.41897,39.82809],[21.419,39.82808],[21.41904,39.8281],[21.41911,39.82815],[21.41921,39.82825],[21.41928,39.82831],[21.4193,39.82833],[21.4196,39.82813]]}, toH: {"d":641,"c":[[21.4196,39.82813],[21.4193,39.82833],[21.41928,39.82831],[21.41921,39.82825],[21.41911,39.82815],[21.41904,39.8281],[21.419,39.82808],[21.41897,39.82809],[21.41875,39.82823],[21.41865,39.82831],[21.41847,39.82844],[21.41772,39.8289],[21.41736,39.82906],[21.41731,39.82909],[21.41723,39.82898],[21.41703,39.82857],[21.41713,39.8282],[21.41715,39.82805],[21.41716,39.82791],[21.41737,39.82785],[21.41753,39.82778],[21.41771,39.82769],[21.4181,39.82753],[21.41832,39.82743],[21.41882,39.82718],[21.41876,39.82706]]} },
    { id: "6348164115", alt: {"d":1663,"c":[[21.42518,39.82724],[21.42514,39.82725],[21.42504,39.82726],[21.42494,39.82726],[21.42468,39.82729],[21.42469,39.82736],[21.42469,39.82742],[21.4247,39.82747],[21.42448,39.8275],[21.42447,39.82747],[21.42446,39.82739],[21.42442,39.82696],[21.42436,39.82655],[21.42426,39.82653],[21.42415,39.82652],[21.42402,39.82652],[21.42366,39.82642],[21.42338,39.82637],[21.42325,39.82634],[21.4232,39.82633],[21.42286,39.82624],[21.42287,39.82615],[21.42287,39.82607],[21.42284,39.82599],[21.4228,39.82592],[21.42274,39.82585],[21.42267,39.82581],[21.42259,39.82578],[21.42252,39.82577],[21.42244,39.82578],[21.42237,39.82581],[21.4223,39.82585],[21.42224,39.82591],[21.42219,39.82599],[21.42217,39.82608],[21.42186,39.82603],[21.42181,39.82602],[21.42168,39.82599],[21.4214,39.82592],[21.42104,39.82584],[21.42087,39.82589],[21.42084,39.82614],[21.42084,39.82633],[21.42074,39.82624],[21.42054,39.8263],[21.42027,39.82648],[21.42028,39.82668],[21.42025,39.82671],[21.42009,39.82683],[21.42001,39.82683],[21.41996,39.82685],[21.41899,39.82724],[21.41873,39.82734],[21.4179,39.82772],[21.41757,39.82789],[21.41746,39.82794],[21.41715,39.82805],[21.41713,39.8282],[21.41703,39.82857],[21.41723,39.82898],[21.41731,39.82909],[21.41736,39.82906],[21.41772,39.8289],[21.41847,39.82844],[21.41865,39.82831],[21.41875,39.82823],[21.41897,39.82809],[21.419,39.82808],[21.41904,39.8281],[21.41911,39.82815],[21.41921,39.82825],[21.41928,39.82831],[21.4193,39.82833],[21.41932,39.8284],[21.41939,39.82869],[21.4194,39.82871],[21.41942,39.82876],[21.41948,39.82879],[21.41951,39.8288],[21.41954,39.82881],[21.4196,39.82882],[21.41968,39.82884],[21.41999,39.8289],[21.42008,39.82892],[21.42017,39.82894]]}, p: [21.42015, 39.82902], toM: {"d":1646,"c":[[21.42518,39.82724],[21.42514,39.82725],[21.42504,39.82726],[21.42494,39.82726],[21.42468,39.82729],[21.42469,39.82736],[21.42469,39.82742],[21.4247,39.82747],[21.42448,39.8275],[21.4244,39.82751],[21.4241,39.82756],[21.42409,39.82756],[21.42408,39.82756],[21.42407,39.82755],[21.42407,39.82752],[21.42405,39.82752],[21.42399,39.82753],[21.42376,39.82756],[21.4236,39.82758],[21.42316,39.82763],[21.42317,39.82765],[21.42319,39.82784],[21.42324,39.82825],[21.42298,39.82809],[21.42289,39.82804],[21.42248,39.82794],[21.42223,39.8279],[21.42203,39.82784],[21.42168,39.8277],[21.42151,39.82748],[21.42116,39.82698],[21.42115,39.82696],[21.42098,39.82674],[21.42089,39.82654],[21.42084,39.82633],[21.42074,39.82624],[21.42054,39.8263],[21.42027,39.82648],[21.42028,39.82668],[21.42025,39.82671],[21.42009,39.82683],[21.42001,39.82683],[21.41996,39.82685],[21.41899,39.82724],[21.41873,39.82734],[21.4179,39.82772],[21.41757,39.82789],[21.41746,39.82794],[21.41715,39.82805],[21.41713,39.8282],[21.41703,39.82857],[21.41723,39.82898],[21.41731,39.82909],[21.41736,39.82906],[21.41772,39.8289],[21.41847,39.82844],[21.41865,39.82831],[21.41875,39.82823],[21.41897,39.82809],[21.419,39.82808],[21.41904,39.8281],[21.41911,39.82815],[21.41921,39.82825],[21.41928,39.82831],[21.4193,39.82833],[21.41932,39.8284],[21.41939,39.82869],[21.4194,39.82871],[21.41942,39.82876],[21.41948,39.82879],[21.41951,39.8288],[21.41954,39.82881],[21.4196,39.82882],[21.41968,39.82884],[21.41999,39.8289],[21.42008,39.82892],[21.42017,39.82894]]}, toH: {"d":734,"c":[[21.42017,39.82894],[21.42008,39.82892],[21.41999,39.8289],[21.41968,39.82884],[21.4196,39.82882],[21.41954,39.82881],[21.41951,39.8288],[21.41948,39.82879],[21.41942,39.82876],[21.4194,39.82871],[21.41939,39.82869],[21.41932,39.8284],[21.4193,39.82833],[21.41928,39.82831],[21.41921,39.82825],[21.41911,39.82815],[21.41904,39.8281],[21.419,39.82808],[21.41897,39.82809],[21.41875,39.82823],[21.41865,39.82831],[21.41847,39.82844],[21.41772,39.8289],[21.41736,39.82906],[21.41731,39.82909],[21.41723,39.82898],[21.41703,39.82857],[21.41713,39.8282],[21.41715,39.82805],[21.41716,39.82791],[21.41737,39.82785],[21.41753,39.82778],[21.41771,39.82769],[21.4181,39.82753],[21.41832,39.82743],[21.41882,39.82718],[21.41876,39.82706]]} },
    { id: "6214788884", alt: {"d":1877,"c":[[21.42518,39.82724],[21.42514,39.82725],[21.42504,39.82726],[21.42494,39.82726],[21.42468,39.82729],[21.42469,39.82736],[21.42469,39.82742],[21.4247,39.82747],[21.42448,39.8275],[21.42447,39.82747],[21.42446,39.82739],[21.42442,39.82696],[21.42436,39.82655],[21.42426,39.82653],[21.42415,39.82652],[21.42402,39.82652],[21.42366,39.82642],[21.42338,39.82637],[21.42325,39.82634],[21.4232,39.82633],[21.42286,39.82624],[21.42287,39.82615],[21.42287,39.82607],[21.42284,39.82599],[21.4228,39.82592],[21.42274,39.82585],[21.42267,39.82581],[21.42259,39.82578],[21.42252,39.82577],[21.42244,39.82578],[21.42237,39.82581],[21.4223,39.82585],[21.42224,39.82591],[21.42219,39.82599],[21.42217,39.82608],[21.42186,39.82603],[21.42181,39.82602],[21.42168,39.82599],[21.4214,39.82592],[21.42104,39.82584],[21.42087,39.82589],[21.42084,39.82614],[21.42084,39.82633],[21.42074,39.82624],[21.42054,39.8263],[21.42027,39.82648],[21.42028,39.82668],[21.42025,39.82671],[21.42009,39.82683],[21.42001,39.82683],[21.41996,39.82685],[21.41899,39.82724],[21.41873,39.82734],[21.4179,39.82772],[21.41757,39.82789],[21.41746,39.82794],[21.41715,39.82805],[21.41713,39.8282],[21.41703,39.82857],[21.41723,39.82898],[21.41731,39.82909],[21.41736,39.82906],[21.41772,39.8289],[21.41847,39.82844],[21.41865,39.82831],[21.41867,39.82833],[21.41861,39.82838],[21.41875,39.82855],[21.41872,39.82858],[21.41861,39.82872],[21.41856,39.82877],[21.41863,39.82881],[21.41875,39.82888],[21.41878,39.82896],[21.41884,39.82905],[21.41885,39.82908],[21.41896,39.82905],[21.41905,39.8291],[21.4191,39.8292],[21.41916,39.82926],[21.41921,39.82925],[21.41927,39.82937],[21.41928,39.82945],[21.41929,39.82947],[21.41918,39.82953],[21.4193,39.82964],[21.41928,39.82972],[21.41929,39.82978],[21.41933,39.82978],[21.41932,39.82987],[21.4192,39.83018],[21.41964,39.83018],[21.4197,39.83012],[21.42025,39.83003],[21.42052,39.82994]]}, p: [21.42048, 39.82982], toM: {"d":1860,"c":[[21.42518,39.82724],[21.42514,39.82725],[21.42504,39.82726],[21.42494,39.82726],[21.42468,39.82729],[21.42469,39.82736],[21.42469,39.82742],[21.4247,39.82747],[21.42448,39.8275],[21.4244,39.82751],[21.4241,39.82756],[21.42409,39.82756],[21.42408,39.82756],[21.42407,39.82755],[21.42407,39.82752],[21.42405,39.82752],[21.42399,39.82753],[21.42376,39.82756],[21.4236,39.82758],[21.42316,39.82763],[21.42317,39.82765],[21.42319,39.82784],[21.42324,39.82825],[21.42298,39.82809],[21.42289,39.82804],[21.42248,39.82794],[21.42223,39.8279],[21.42203,39.82784],[21.42168,39.8277],[21.42151,39.82748],[21.42116,39.82698],[21.42115,39.82696],[21.42098,39.82674],[21.42089,39.82654],[21.42084,39.82633],[21.42074,39.82624],[21.42054,39.8263],[21.42027,39.82648],[21.42028,39.82668],[21.42025,39.82671],[21.42009,39.82683],[21.42001,39.82683],[21.41996,39.82685],[21.41899,39.82724],[21.41873,39.82734],[21.4179,39.82772],[21.41757,39.82789],[21.41746,39.82794],[21.41715,39.82805],[21.41713,39.8282],[21.41703,39.82857],[21.41723,39.82898],[21.41731,39.82909],[21.41736,39.82906],[21.41772,39.8289],[21.41847,39.82844],[21.41865,39.82831],[21.41867,39.82833],[21.41861,39.82838],[21.41875,39.82855],[21.41872,39.82858],[21.41861,39.82872],[21.41856,39.82877],[21.41863,39.82881],[21.41875,39.82888],[21.41878,39.82896],[21.41884,39.82905],[21.41885,39.82908],[21.41896,39.82905],[21.41905,39.8291],[21.4191,39.8292],[21.41916,39.82926],[21.41921,39.82925],[21.41927,39.82937],[21.41928,39.82945],[21.41929,39.82947],[21.41918,39.82953],[21.4193,39.82964],[21.41928,39.82972],[21.41929,39.82978],[21.41933,39.82978],[21.41932,39.82987],[21.4192,39.83018],[21.41964,39.83018],[21.4197,39.83012],[21.42025,39.83003],[21.42052,39.82994]]}, toH: {"d":948,"c":[[21.42052,39.82994],[21.42025,39.83003],[21.4197,39.83012],[21.41964,39.83018],[21.4192,39.83018],[21.41932,39.82987],[21.41933,39.82978],[21.41929,39.82978],[21.41928,39.82972],[21.4193,39.82964],[21.41918,39.82953],[21.41929,39.82947],[21.41928,39.82945],[21.41927,39.82937],[21.41921,39.82925],[21.41916,39.82926],[21.4191,39.8292],[21.41905,39.8291],[21.41896,39.82905],[21.41885,39.82908],[21.41884,39.82905],[21.41878,39.82896],[21.41875,39.82888],[21.41863,39.82881],[21.41856,39.82877],[21.41861,39.82872],[21.41872,39.82858],[21.41875,39.82855],[21.41861,39.82838],[21.41867,39.82833],[21.41865,39.82831],[21.41847,39.82844],[21.41772,39.8289],[21.41736,39.82906],[21.41731,39.82909],[21.41723,39.82898],[21.41703,39.82857],[21.41713,39.8282],[21.41715,39.82805],[21.41716,39.82791],[21.41737,39.82785],[21.41753,39.82778],[21.41771,39.82769],[21.4181,39.82753],[21.41832,39.82743],[21.41882,39.82718],[21.41876,39.82706]]} },
  ];
  // Меккедегі қалған шаштараздар: OpenStreetMap-та белгіленгендердің бәрі (маршрут таңдағанда тікелей есептеледі)
  const MAKKAH_BARB = [[21.50934,39.78307,"السودانيه"],[21.41484,39.82342,""],[21.41422,39.82332,""],[21.43209,39.82843,"Barber Shop"],[21.41451,39.82798,"مصفف شعر العنقاء"],[21.40738,39.87053,"Barber Shop"],[21.40854,39.8693,"كوافير - صالون حلاقة"],[21.41342,39.82956,"Barber Shop"],[21.41373,39.82772,""],[21.41406,39.82347,""],[21.4129,39.77765,"Eskan barbarshop"]];
  OV_BARB.sort((a, b) => a.toM.d - b.toM.d); // Мәруадан жаяу жақыны бірінші
  const OV_S2M = {"d":397,"c":[[21.42177,39.82739],[21.42176,39.82741],[21.42175,39.82745],[21.42175,39.82749],[21.42177,39.82753],[21.42182,39.82757],[21.42187,39.82758],[21.42468,39.82729],[21.42494,39.82726],[21.42504,39.82726],[21.42514,39.82725],[21.42518,39.82724]]}; // Сафа → Мәруа (Мас'а)
  // Әл-Харамға жақын қалалық автобус аялдамалары (OSM) және оларға келетін желілер (OSM маршрут қатынастары бойынша)
  const BUS_TERMS = [
    { n: "Terminal 4 · Ajyad", kk: "4-терминал, Әжияд", p: [21.4168276, 39.8277767], lines: "5-желі (Әжияд — Әл-Әуали)" },
    { n: "Terminal 3 · Ibrahim Alkhalil", kk: "3-терминал, Ибраһим әл-Халил", p: [21.4158932, 39.8229114], lines: "11-желі (Шуһада — Ибраһим әл-Халил)" },
  ];
  // Әл-Харам маңындағы орындар (OpenStreetMap, ≈1 км): h қонақүй · s дүкен · f тамақ · p дәріхана · m медицина · w дәретхана · b банк/банкомат · d су · k мешіт · u автобус аялдамасы
  const POI_CATS = [["h", "Қонақүй", "🏨", "#7a4a1c"], ["s", "Дүкен", "🛍️", "#8e44ad"], ["f", "Тамақ", "🍽️", "#e8730c"], ["p", "Дәріхана", "💊", "#16a34a"], ["m", "Медицина", "🏥", "#d93025"], ["w", "Дәретхана", "🚻", "#2f7cff"], ["b", "Банк", "🏧", "#0aa37f"], ["d", "Су", "💧", "#2f9bff"], ["k", "Мешіт", "🕌", "#13211c"], ["u", "Автобус", "🚌", "#2f7cff"], ["c", "Шаштараз", "✂️", "#8e44ad"]];
  const POI = [["h",21.41887,39.82681,"Dar Al Eiman Royal Hotel"],["s",21.42043,39.83183,"abdullah mohammed"],["s",21.42073,39.83131,""],["s",21.41848,39.82574,"Hyber abraj"],["k",21.41576,39.83052,"Masjid Al Bukhari"],["f",21.42119,39.82176,"Albaik"],["f",21.41995,39.82382,""],["f",21.41995,39.82415,"Burger King - Holy Mosque"],["f",21.41965,39.82397,""],["s",21.41969,39.8237,"Banafa for Oud"],["s",21.41844,39.82588,"متجر ساعات الفجر"],["m",21.42671,39.82327,"Al Haram Emergency Hospital"],["m",21.41972,39.82638,"Ajyad Emergency Hospital"],["p",21.41967,39.8266,"al-Halwani"],["p",21.41491,39.82796,"Nahdi Pharmacy"],["b",21.42001,39.82452,"Al Rajhi Bank"],["f",21.41991,39.82232,"فايف قايز"],["b",21.42137,39.82278,""],["h",21.41833,39.82496,"Hotel Pullmann ZamZam Makkah"],["h",21.41838,39.82681,"Swissôtel Makkah"],["h",21.4183,39.82627,"Mövenpick Hotel & Residence Hajar Tower Makkah"],["f",21.41912,39.82335,"Lagenda Restaurant"],["k",21.42002,39.82423,"Masjid Abu Baker As-Siddiq - 3rd Floor"],["f",21.41985,39.82429,"Areej Al-Falah"],["f",21.41972,39.82645,"Al Shorfa Restaurant"],["s",21.41857,39.8256,"Abdul Samad Al Qurashi"],["f",21.41932,39.82607,"Malaysian Restaurant"],["f",21.41983,39.82423,"Domino's Pizza"],["f",21.41888,39.82581,"Burger King - Abraj Al Bait Mall"],["b",21.41909,39.82367,""],["b",21.4196,39.82193,"Al Rajhi Bank"],["b",21.42029,39.82207,"Tahweel Al Rajhi"],["s",21.42063,39.82151,"متجر ساعات الفجر مكة"],["h",21.41804,39.8253,"Fairmont Makkah Clock Royal Tower"],["s",21.41973,39.82434,"Bin Dawood"],["h",21.41878,39.82429,"Elaf Kinda Hotel"],["u",21.42224,39.82134,"الشبيكة439"],["u",21.42872,39.81852,"باصات الى التنعيم"],["u",21.42941,39.82962,"Terminal Syeb Amir"],["w",21.42485,39.82869,""],["w",21.42504,39.82822,""],["w",21.4206,39.8237,"Men's WC - 8"],["f",21.41851,39.82502,"Türk Döneri - ZemZem Tower (P3), Kat 3"],["f",21.41906,39.82567,"saray nergis"],["k",21.4194,39.82561,"Prayer Hall - Abraj al Bait"],["f",21.41881,39.82617,"Sbarro Pizza - 4th Floor"],["f",21.42078,39.82209,"Al Forno - Jabal Omar Hyatt Regency"],["p",21.42008,39.82352,"Pharmacy Rajah"],["s",21.42054,39.83038,"مول ميرا"],["s",21.42082,39.83238,""],["s",21.41842,39.82512,"سميت سراي"],["s",21.4188,39.82562,"سميت سراي"],["f",21.41873,39.8254,"Turkish Grillhouse - 4th Floor"],["f",21.41862,39.82542,"Sizzling Fish"],["f",21.41913,39.82548,"Pescado - 4th Floor"],["h",21.41847,39.82441,"Swissôtel Al Maqam Makkah"],["h",21.41922,39.82498,"Raffles Makkah Palace"],["h",21.41916,39.8261,"Al Marwa Rayhaan by Rotana"],["h",21.41936,39.82651,"Dar Al Ghufran - Al Safwah Towers Hotel"],["b",21.41825,39.82727,""],["b",21.41981,39.82626,""],["b",21.41828,39.82588,""],["b",21.41976,39.82657,""],["b",21.41981,39.82655,""],["s",21.42143,39.82182,"Al Faisal Islamic Recording"],["s",21.41536,39.82253,"Gold Jewellery"],["p",21.41912,39.82398,"Dhiouf Makkah"],["s",21.42048,39.82982,""],["s",21.42072,39.83097,"Al Harisi"],["p",21.42012,39.82819,"United Pharmacy"],["d",21.42863,39.829,"زمزم"],["s",21.41485,39.82335,"Laundry Kadi Doby"],["s",21.41484,39.82342,""],["f",21.41484,39.82351,"Pakistani Restaurant"],["s",21.42116,39.82286,"Mobily"],["p",21.41955,39.82575,"Nahdi"],["p",21.42109,39.82289,"غاية ام القرى"],["s",21.42096,39.82294,"العربية للعود"],["s",21.42125,39.82283,"Abdul Samad Al Quraishi"],["s",21.4213,39.8228,"Zain"],["s",21.42027,39.82381,"Al Ghazali"],["f",21.41862,39.82467,"KFC"],["f",21.42008,39.8243,"Hardee's"],["b",21.41954,39.82415,""],["s",21.42089,39.82296,"STC"],["f",21.41918,39.82505,"Narjes Tea Lounge"],["p",21.42022,39.82391,"النهدي"],["f",21.41898,39.82539,"Hardee's (3rd Floor)"],["s",21.41942,39.82537,"العربية للعود"],["f",21.41861,39.82587,"Doner Kebab DK72 - 4th Floor"],["f",21.42015,39.82219,"zataar w zeit"],["f",21.42784,39.82979,"Diyar Hadramount Restaurant"],["f",21.415,39.823,""],["s",21.42037,39.82965,""],["f",21.42042,39.82977,"كافيتيريا الضيافة"],["f",21.42054,39.83041,""],["f",21.42068,39.83091,"Chicken Broast"],["s",21.42073,39.83104,"Shaikh Al Oud"],["f",21.42167,39.83274,""],["f",21.41615,39.82801,"Taj Restaurant"],["p",21.41626,39.828,""],["f",21.41632,39.82802,"Chicken Broast"],["s",21.4197,39.82606,""],["s",21.42122,39.82186,"سوق الخليل"],["s",21.42109,39.82183,"Bin Dawood - Jabal Omar - 1st Floor"],["f",21.41618,39.82262,""],["f",21.41962,39.82428,"Broast"],["s",21.41957,39.82425,"Kanz Alharamen for Gold Jewelery"],["p",21.421,39.82187,"Al Nahdi Pharmacy - 1st Floor"],["f",21.42089,39.82153,"KFC"],["s",21.42104,39.82173,"Abdul Samad Al Qurashi - 2nd Floor"],["f",21.42094,39.82165,"هارديز"],["f",21.42096,39.82176,"Ashoor Cafe - 4th Floor"],["f",21.41993,39.82449,"Al-Halwani Restaurant"],["f",21.42025,39.82349,"Seven Star Fastfood"],["f",21.42021,39.82347,"Kadah Baladi Fast Food"],["f",21.42017,39.82346,"Rokn Al Rasha"],["s",21.42005,39.82342,"Al Barakah Dates"],["f",21.4201,39.82344,"Broast"],["s",21.41968,39.82232,"Souq Al Khalil"],["s",21.41985,39.82337,"Anas Malik Book Shop"],["f",21.41979,39.82335,""],["f",21.41967,39.82333,"كافيتيريا الابراج"],["s",21.41941,39.82328,"Sony"],["s",21.41706,39.8227,"Ahlam Shop"],["s",21.4165,39.82269,"Salemin Dates"],["s",21.41609,39.82266,"Um Hatem Est."],["s",21.41528,39.82251,"Maktabat Nashwan"],["s",21.42015,39.82902,""],["s",21.42064,39.82209,"Abdul Samad Al Quraishi"],["s",21.41523,39.82246,"Baqala Al Manar"],["f",21.41561,39.8231,"South Asian Restaurant"],["s",21.41542,39.82303,"Gula Tabu - Sugar Cane Juice"],["s",21.41989,39.82652,"Ahmed Saeed Naji"],["p",21.41936,39.82674,"Al Nahdi"],["f",21.41946,39.82419,"مطعم زمزم"],["p",21.41951,39.82422,"Al Nahdi Pharmacy"],["h",21.4135,39.82951,"فندق رفاف المشاعر الفندقية"],["u",21.43102,39.83016,"Bus Drop Area"],["s",21.41966,39.82363,"Dawah Corner Bookstore - Ground Floor/Hilton Tow"],["f",21.41948,39.8259,"Starbucks"],["s",21.42225,39.83429,"Al Ansari Store"],["f",21.4223,39.83426,"محل مطبق"],["f",21.41994,39.82828,"Firdous Restaurant"],["s",21.41984,39.82831,""],["s",21.41899,39.82815,""],["f",21.41958,39.82342,"Food Courts in 3rd Floor - Entrance Makkah Tower"],["f",21.41968,39.82432,"Cafeteria Juha"],["f",21.416,39.8226,"Asia Restaurant"],["s",21.41575,39.8226,"Al Mansour"],["s",21.41567,39.82259,"Adwa Dubai"],["s",21.41521,39.82246,""],["s",21.42054,39.83004,"Knooz Ajiad - Mini SuperMarket"],["s",21.42007,39.82821,""],["b",21.41925,39.82681,""],["b",21.41929,39.82679,""],["f",21.42114,39.8219,"Starbucks"],["d",21.42518,39.82332,""],["u",21.42261,39.8332,"Ajyad 4"],["u",21.42203,39.83307,"Ajyad 3"],["u",21.422,39.82124,"Jabal Omar 8"],["u",21.42102,39.82356,"Alsouq Alsagheer 440"],["u",21.42093,39.82343,"Alsouq Alsagheer 441"],["u",21.42071,39.83082,"Ajyad 2"],["u",21.43041,39.82963,"Terminal 2, Almarwah"],["u",21.41683,39.82778,"Terminal 4, Ajyad"],["h",21.42095,39.83234,"Amira Matuk Hasan Khaiat Hotel"],["h",21.4203,39.83235,"Bakr Hasan Habhab Hotel"],["h",21.42028,39.83236,"Ahla Al-Qswr 3 Hotel"],["f",21.4209,39.82216,"Sahtein Restaurant"],["h",21.42156,39.83264,"Abraj Maad"],["f",21.41956,39.82579,"Dunkin' Donuts"],["f",21.41515,39.82791,"Al Bait"],["u",21.41589,39.82291,"Terminal 3, Ibrahim Alkhalil"],["h",21.41327,39.82433,"gandourah Hotel"],["h",21.41307,39.82421,"najmat ul khalij Hotel"],["h",21.41299,39.82416,"rihab Al bustan Hotel 3"],["h",21.41285,39.824,"kadi al hijrah hotal"],["h",21.413,39.82326,"luluat al door hotel"],["h",21.413,39.82343,"hijrat alkhayr Hotel"],["w",21.42516,39.82136,""],["w",21.42528,39.82115,""],["w",21.42542,39.82079,""],["w",21.42581,39.82167,""],["w",21.42607,39.82139,""],["w",21.42564,39.82192,""],["w",21.42642,39.8226,""],["w",21.42665,39.82248,""],["w",21.42694,39.82228,""],["w",21.42734,39.82385,""],["w",21.42759,39.82385,""],["w",21.42785,39.82383,""],["w",21.42769,39.82494,""],["w",21.42793,39.8249,""],["w",21.42817,39.82488,""],["w",21.42779,39.82585,""],["w",21.42821,39.82588,""],["h",21.41398,39.82281,"فندق مآثر اللؤلؤة"],["f",21.42272,39.81886,"Saldwich"],["f",21.4194,39.82483,"Albaik"],["h",21.41896,39.834,"فندق ديوان اجياد"],["k",21.42252,39.82618,"Kaaba"],["h",21.42096,39.82272,"Dar Al Tawhid InterContinental"],["h",21.42459,39.81957,"Anjum Hotel"],["h",21.42061,39.8335,"Burj Al Haram Hotel"],["h",21.42123,39.83279,"Qasr Ajyad Al Sad Hotel"],["h",21.42144,39.83407,"Sana Al Bait Hotel"],["h",21.42119,39.83402,"Azhar Al Safa Hotel"],["h",21.42199,39.83391,"Dar al Bayan Hotel"],["h",21.42145,39.83259,"Retaj Alsafwa Hotel"],["h",21.42224,39.83461,"Al Refa Al Sud Hotel"],["h",21.41977,39.83342,"Awtad al Sadd Hotel"],["h",21.42164,39.83281,"Diafat Al Rashideen Hotel"],["h",21.42175,39.83422,"Al-Taiba Land Hotel"],["h",21.4202,39.83241,"Dar Al-Mowhdeen Hotel"],["h",21.4215,39.83266,"Taqwa Tower Hotel"],["h",21.42186,39.83423,"Fal Al-Jadeed Hotel"],["h",21.42243,39.83403,"Al Tofik Plaza Hotel"],["h",21.42092,39.83446,"Rawafed Al Hadara Hotel"],["h",21.42019,39.83376,"Dar Al Eiman Al Sud Hotel"],["h",21.42155,39.83274,"Loloat Al Azhar Hotel"],["h",21.42163,39.83413,"Manazil Al Taubah"],["h",21.42227,39.83427,"Arcot Wakf Hotel"],["h",21.42071,39.83101,"Dar Jyad Hotel"],["h",21.42194,39.83462,"Pearl al Bashaer Featured Hotel"],["h",21.4199,39.82811,"Al Massa Hotel"],["h",21.41928,39.82798,"Al Jawar Tower Hotel"],["h",21.41989,39.82826,"Abdul Aziz Abbas Huwait Hotel 1"],["h",21.42607,39.8193,"Noor Al-Salah Hotel"],["h",21.42615,39.8192,"Hidaya Al-Ahbab Hotel"],["h",21.42005,39.82819,"Mira Saha Hotel"],["h",21.43219,39.82927,"Grand Makkah Hotel"],["h",21.42564,39.81945,"Sheraton Makkah - Jabal Al Kaaba Hotel"],["h",21.41746,39.82858,"Makarem Ajyad Makkah Hotel"],["h",21.41401,39.82896,"Amjad Al Bait Hotel"],["h",21.41402,39.82911,"Konouz Al Jazeerah Hotel"],["h",21.41386,39.82949,"Gahir Al Sahrah Hotel 2"],["h",21.41661,39.8288,"Amjad Al Jazira Hotel"],["h",21.414,39.8293,"Dorat Dar Al Eiman Hotel"],["h",21.41396,39.82862,"Dura Al-Wisam Al-Dhabi Hotel"],["h",21.41418,39.82732,"Hotel Al Rayah Grand"],["h",21.41623,39.82901,"Al Fajer Al Badya 2 Hotel"],["h",21.41354,39.82986,"Al Manarah Hotel"],["h",21.41376,39.82975,"Bakkah Al Salah Hotel"],["h",21.41617,39.82939,"Zuwar Al Bait Hotel"],["h",21.41653,39.82825,"Elaf Al Mashaer Hotel"],["h",21.4167,39.82841,"Rayyana Ajyad Hotel"],["h",21.41598,39.82937,"Jawharat Al Bait Hotel"],["h",21.41323,39.82958,"Al Olayyan Mawaddah Hotel 2"],["h",21.41764,39.82925,"Dar Al Eiman Ajyad Hotel"],["h",21.4181,39.82878,"Elaf Ajyad Hotel"],["h",21.41845,39.82876,"Ohrah Alhar Hotel"],["h",21.41861,39.82858,"Al Momazaz Hotel"],["h",21.41931,39.82894,"Rawabi Zamzam Hotel"],["h",21.42025,39.82918,"Le Meridien Makkah Hotel"],["h",21.41981,39.82901,"Nawazi Hotel"],["h",21.42043,39.83046,"Mira Ajyad Hotel"],["h",21.42043,39.82983,"Jawad Al-Taj Hotel"],["h",21.41335,39.82294,"Al Fajr Al Badie Hotel 1"],["h",21.41365,39.82299,"Al-Manar Golden 2"],["h",21.41364,39.8228,"Zahra al-Misfalah"],["h",21.4139,39.82304,"Zowar Al Haramain Hotel"],["h",21.41414,39.82283,"Tharawat El Mashaer Hotel Makkah"],["h",21.41339,39.82226,"Al Fajer Al Badia Hotel 4"],["h",21.41424,39.82252,"Tahani Al-Haramain Hotel"],["h",21.41404,39.82247,"Dar Al Eman Al Khalil Hotel"],["h",21.41414,39.82312,"Al Rayada Al Hijrah Hotel"],["h",21.41451,39.8231,"Ayman Al Hijrah Hotel"],["h",21.41367,39.82815,"Sraya al Misk Hotel"],["h",21.41329,39.8282,"Al Rihab Ajyad Hotel"],["h",21.41391,39.82346,"Final Rehab Hotel"],["h",21.41401,39.82361,"Afwaj al Tawba 11"],["h",21.41702,39.82263,"Al Olayan Al Haram"],["h",21.42456,39.81632,"Hibatullah Hotel"],["h",21.43086,39.83205,"Al Janadriyah Towers Hotel"],["h",21.4129,39.82237,"Dar Al-Eiman Grand Hotel"],["w",21.42033,39.82313,"Men's Toilets - 6"],["w",21.41974,39.82295,"Women's Toilet - 7"],["k",21.42317,39.83355,"Masjid Miir Alim"],["k",21.41702,39.83059,"Masjid"],["k",21.41645,39.82968,"Masjid al-Nihari"],["h",21.41417,39.82118,"arafat aldhahbiya hotel"],["h",21.42082,39.82176,"Jabal Omar Hyatt Regency Makkah"],["h",21.41934,39.82212,"Conrad Jabal Omar Makkah"],["h",21.42277,39.81983,"Hilton Hotel & Convention Jabal Omar Makkah"],["h",21.42343,39.81898,"Jabal Omar Marriott Hotel"],["h",21.41901,39.82355,"Makkah Millennium Hotel"],["w",21.42653,39.82534,""],["w",21.42657,39.82576,""],["w",21.42609,39.82511,"Men's Toilets - 13"],["w",21.42623,39.82608,"Women's Toiltets - 14"],["w",21.42597,39.82473,""],["w",21.42603,39.82393,""],["w",21.42581,39.82358,""],["w",21.42511,39.82333,"Women's Toiltets - 11"],["w",21.42481,39.82255,""],["w",21.42448,39.82234,""],["w",21.42405,39.82256,""],["w",21.42482,39.82307,""],["w",21.42369,39.82241,""],["w",21.42326,39.82228,""],["w",21.42256,39.82269,"Women's WC - 8"],["w",21.4231,39.82311,""],["w",21.42222,39.8227,"Women's WC - 7"],["w",21.42033,39.82455,""],["h",21.42523,39.8196,"شذا مكة"],["h",21.42323,39.81786,"DoubleTree by Hilton Jabal Omar Makkah"],["h",21.42215,39.81858,"Address Jabal Omar Makkah"],["h",21.42001,39.8281,"Al-Maqam al-Sakani Hotel"],["w",21.41998,39.82627,"Men's Toilets - 3"],["h",21.41911,39.82864,"Sunrise Ajyad Hotel"],["h",21.42012,39.8298,"Azka Al Safa Hotel"],["h",21.41961,39.83282,"Hotel Al Deafah Oasis"],["h",21.41613,39.82255,"Diyafat Mubarak Hotel"],["h",21.41668,39.82269,"Loulou Al-Khalil Hotel"],["h",21.41681,39.82264,"Hotel Areej Al Falah"],["h",21.41719,39.82263,"Baity 5 Hotel"],["h",21.41735,39.82263,"Hotel Al Ghali"],["h",21.41729,39.82263,"Emaar Al-Sultan Hotel"],["h",21.41648,39.82264,"Tharawat Diyafat Al Rahman Hotel"],["h",21.41637,39.82262,"Hotel Nawarat Al-Shams 1"],["h",21.41627,39.82258,"Marsa Al Jariah Hotel"],["h",21.41552,39.82251,"Nawrat Shams Hotel 2"],["h",21.41543,39.82249,"Hotel Saqayat Al-Khalil 2"],["h",21.41573,39.82256,"Hotel Fawzia Abdul Karem A. Ali"],["h",21.41564,39.82252,"Jowharat Al Misfalah"],["h",21.41675,39.82862,"Gawharat Al Husain Hotel"],["h",21.41667,39.82869,"Malak Manazil Al Kiram Hotel"],["h",21.41485,39.82818,"Al Shohada Hotel"],["h",21.41399,39.82732,"Ramada Hotel"],["h",21.41375,39.82769,"Hotel Diyar Al Bushra 3"],["h",21.41363,39.82748,"Al Rayah Ajyad Hotel"],["h",21.41402,39.82809,"Nozol Al Khair 1 Hotel"],["h",21.41417,39.82816,"Markad Ajyad Hotel"],["h",21.42042,39.83001,"Retaj Al-Safwa Hotel"],["h",21.42044,39.83007,"Knooz Ajiad Hotel"],["h",21.42044,39.83035,"Ajyad al Jiwar Hotel"],["h",21.42044,39.83019,"Al Saraya Hotel"],["h",21.42027,39.83079,"Saraya Ajyad Hotel"],["h",21.4204,39.83029,"Anwar Deafah Hotel"],["h",21.42056,39.83058,"Dana Al Taj Hotel"],["h",21.42065,39.83087,"Snood Ajyad Hotel"],["h",21.42062,39.83143,"Al Barakah Hotel"],["h",21.42064,39.83158,"Ajyad Golden Hotel"],["h",21.42057,39.83196,"Ajwad Ajyad Hotel"],["h",21.42088,39.83261,"Dallah Ajyad Hotel"],["h",21.42078,39.83267,"Manazil Al Safa Ajyad Hotel"],["h",21.42048,39.8321,"Wissam Al Taj Hotel"],["h",21.42103,39.83232,"Z Ajyad Hotel"],["h",21.42118,39.83239,"Luluat Al Sharq"],["h",21.42136,39.83252,"Dar Al Eiman Al Andalus"],["h",21.41496,39.82279,"Tharawat Wadi Ibrahim Hotel"],["h",21.41478,39.8228,"Areej Al Wafa Hotel"],["h",21.41464,39.82281,"Golden Al Abrar Hotel"],["h",21.41504,39.82238,"Mohammed Abdullah Al Ghammas Hotel"],["h",21.4149,39.82236,"Tharawat Al Andaloseya Hotel"],["h",21.41447,39.82261,"Taj Al-Khalil Hotel"],["h",21.42394,39.81601,"Sama Umm Al Qura Hotel"],["h",21.41382,39.82248,"Al Olayan Golden Hotel"],["h",21.41374,39.82232,"Basma Ezam Hotel"],["h",21.41356,39.82231,"Yajid Hotel"],["h",21.41378,39.82191,"Al-Ouda Al Mubaraka Hotel"],["h",21.4159,39.82989,"Amjad Ajad Hotel"],["h",21.4134,39.83028,"Dream Hotel Jeddah 2"],["h",21.41349,39.83018,"Hotel Al Sheera Mawaddah"],["h",21.41343,39.82948,"Rafad Al Khair Hotel 1"],["h",21.41366,39.82904,"Sama Ajiyad Hotel"],["h",21.41351,39.82929,"Retaj Al Aafwa Hotel"],["h",21.41342,39.82938,"Jawharat Dar Al-Eiman Hotel"],["h",21.41378,39.82811,"Noran Hotel"],["h",21.43188,39.82803,"Rehab Al Marwa Hotel 1"],["h",21.43222,39.82814,"Zawar Al Brkah Hotel"],["h",21.43167,39.82967,"M.Saifal Yamani Hotel"],["h",21.43146,39.8297,"Al Fajer Al Badea Hotel 3"],["h",21.43146,39.83039,"Mira Sheab Hotel"],["h",21.43109,39.83075,"Murjan Al Karam Hotel"],["h",21.42449,39.81567,"Eurasia Hotel"],["h",21.42155,39.83436,"Fal Al Sud Hotel"],["h",21.42199,39.83484,"Pearls Hotel"],["h",21.42178,39.8346,"Qasr Ajyad Al Sad Hotel 2"],["h",21.42045,39.83353,"Azhar Al Safa Hotel"],["h",21.41999,39.8292,"Jawahrat Al Waed Hotel"],["h",21.42018,39.82933,"Nada Al Deafah Hotel"],["h",21.42041,39.82993,"Dar Abdullah Al Mashat"],["h",21.41479,39.82232,"Hotel Maather Deafah"],["h",21.41456,39.82226,"Hotel Seqayt Al Bait"],["h",21.41398,39.8228,"Hotel Louloah"],["h",21.41433,39.8221,"Aemadat Al Zahab Hotel"],["h",21.41427,39.82197,"Bashra Al Taj Hotel"],["h",21.41415,39.82204,"Durrat Al Hud-Hud Hotel"],["h",21.41396,39.82195,"Amer Hotel"],["h",21.41405,39.82243,"Rafef Al-Hejaz Hotel"],["h",21.41355,39.8218,"Warda Al Zuhoor Hotel"],["h",21.4202,39.82992,"Banonah Hotel"],["w",21.41963,39.82718,"Men's Toilets - 2"],["w",21.41931,39.82721,"Women's Toilets - 1"],["w",21.41995,39.8251,"Women's Toilets - 4"],["w",21.42323,39.83003,""],["w",21.42289,39.83032,""],["h",21.4132,39.82287,"Qahir Al-Saharaa Hotel"],["h",21.41486,39.82313,"Al Nosour Al Mohagerin"],["h",21.41471,39.82315,"Rehana Hotel"],["h",21.41498,39.82315,"Mohammed Saeed Al-Ghamdi Hotel"],["h",21.41484,39.82342,"Zaharat AL Badiya"],["m",21.42242,39.82311,"Red Crescent"],["h",21.41303,39.82308,"Manarat Al Eman"],["h",21.4131,39.82308,"Areej Al Zahbi"],["h",21.41315,39.8234,"Maather Al Jiwaar Hotel"],["h",21.41377,39.82342,"Manar Al Khair Hotel"],["h",21.41417,39.82337,"Ghala Al Tag Hotel"],["h",21.41438,39.82341,"Manar Al Huda Hotel"],["h",21.41437,39.8231,"Malak Al Taqwa Hotel 2"],["k",21.42064,39.83077,"Al Kashmiri Mosque"],["k",21.41757,39.83175,"Mu'ath Ibn Jabal Mosque"],["h",21.41405,39.831,"Remas Al Zahabe Hotel"],["h",21.41369,39.83091,"Ajyad Al Aseel Hotel"],["h",21.41353,39.83072,"Tharawat Naba Makkah Hotel"],["h",21.41322,39.82988,"Burjul Umairi 3"],["h",21.41403,39.82823,"Hotel Diamond Al Ahram"],["h",21.41378,39.82839,"Suadaa Hotel"],["h",21.4138,39.8282,"Manar Hussain Hotel"],["h",21.41396,39.82836,"Dura Al-Wisam Al-Dhabi Hotel 2"],["h",21.41343,39.82908,"Rafdin Al Masi Hotel"],["h",21.41335,39.82954,"Walid Hotel"],["h",21.41594,39.82834,"Royal Majestic Hotel"],["h",21.41621,39.82987,"Rawabi Shamik Hotel"],["h",21.41736,39.82949,"Al Thoraya Hotel"],["h",21.41711,39.82983,"Al Thuria Grand Hotel"],["h",21.41729,39.82971,"Al Battal Hotel"],["h",21.41854,39.82866,"Kinana Al Taqwa Hotel"],["h",21.41449,39.82164,"Al Nada Al Khalil Hotel"],["h",21.41412,39.82154,"Hera Hotel"],["h",21.41937,39.83383,"Manarat al Misk Hotel"],["h",21.41922,39.83341,"Mira Al Sudd Hotel"],["h",21.41947,39.83322,"Jawhara Al Sondus Hotel"],["h",21.41926,39.83416,"Hotel Mawasim Ajyad al Sadd"],["h",21.4189,39.83438,"Al balad al Tayib Ajyad Hotel"],["h",21.41397,39.83117,"Nasamaat Ajyad Hotel"],["h",21.41434,39.8297,"فندق مواسم أجياد"],["f",21.42214,39.82172,"آيس كريم توتي"],["h",21.41772,39.82941,"Dar Al Rahma Danah Hotel"],["h",21.43005,39.83264,"H-Shaab Sultana"],["h",21.43027,39.83226,"Reetaj al Shaeb"],["h",21.43032,39.83234,"Shoa'a al Sheab Hotel"],["h",21.43043,39.83261,"Hotel Wings al Badaya"],["h",21.43141,39.83013,"Qasr al Janadriyah"],["h",21.42446,39.81588,"Manar al Azhar Hotel"],["h",21.42442,39.81605,"Golden Lamar Hotel"],["h",21.41346,39.82813,"Al Manar Ajyad Hotel"],["h",21.41546,39.82985,"Sarh Al Manamah Hotel 5"],["h",21.41571,39.82993,"Hotel Pearl Amar"],["h",21.41385,39.82368,"Asia Hotel"],["s",21.42058,39.83048,"International Gift Shop"],["h",21.41449,39.82144,"Tharwat al Rushad Hotel"],["h",21.41428,39.8214,"Mada al Omran Hotel"],["h",21.42454,39.81661,"Al-Ebaa Hotel"],["h",21.41809,39.83412,"Best Western - Ajyad Hotel"],["h",21.41296,39.82821,"Delma Youths Hotel 2"],["h",21.41276,39.82833,"Delma Youths Hotel 1"],["h",21.41322,39.82749,"Infinity Hotel Makkah"],["h",21.42094,39.82161,"Hilton Suites Jabal Omar Makkah"],["h",21.42038,39.82198,"Hyatt Regency Makkah - Jabal Omar"],["h",21.41827,39.82234,"Jumeirah Hotel"],["h",21.41952,39.8221,"Conrad Makkah - Jabal Omar"],["h",21.41974,39.82393,"Makkah Millennium Towers"],["h",21.4198,39.8212,"In Construction Phase 4 - Pullman Hotel - Jabal "],["h",21.41866,39.82108,"In Construction Phase 4 - Millennium Hotel - Jab"],["h",21.41795,39.82134,"In Construction Phase 4 - Best Western Hotel - J"],["k",21.42472,39.82401,"Grand Mosque of Mecca"]];
  // Әр қадамның картадағы орны: белгілер, масштаб
  const MAP_FOCUS = { hair: { pts: [], z: 0 }, gate: { pts: ["Абдулазиз патша қақпасы", "Қағба"], z: 0 }, stone: { pts: ["Қағба"], z: 19 }, tawaf: { pts: ["Қағба"], z: 19 }, maqam: { pts: ["Ибраһим мақамы"], z: 20 }, sai: { pts: ["Ибраһим мақамы", "Сафа", "Мәруа"], z: 0 } };
  let leafMap = null;
  function mapPage(key) {
    const mi = MODS.findIndex((x) => x.key === key), back = key === "badal" ? "#/b/aisha" : mi >= 0 ? HB() + "/step/" + mi : BADAL ? "#/b/steps" : "#/";
    return `<section class="scr mapv"><header class="tb"><a class="ib" href="${back}" aria-label="Артқа">${ic("back")}</a><h1>${key === "badal" ? "Айша анамыздың мешіті" : mi >= 0 ? "Картада: " + esc(MODS[mi].title) : "Карта"}</h1></header><div class="mapbox"><div id="mapv"></div>${!key || key === "gate" || key === "hair" || key === "badal" ? `<div class="fnbar"><button class="fnb" id="fnb">🔍 Іздеу</button>${!key || key === "badal" ? '<button class="fnb" id="fnp">🧭 Жүру жолы</button>' : ""}</div><div class="fns" id="fns" hidden></div>` : ""}</div>${key === "gate" ? '<div class="rtp" id="gp"></div>' : key === "sai" ? '<div class="rtp" id="sp"></div>' : key === "hair" ? '<div class="rtp" id="gp"></div>' : ""}</section>`;
  }
  // Жаяу жол: OSRM және Valhalla «pedestrian» салыстырылып, ең қысқасы алынады
  async function footRoute(a, b) {
    const dec6 = (str) => { const out = []; let i = 0, la = 0, lo = 0; while (i < str.length) { let sh = 0, rs = 0, bt; do { bt = str.charCodeAt(i++) - 63; rs |= (bt & 31) << sh; sh += 5; } while (bt >= 32); la += rs & 1 ? ~(rs >> 1) : rs >> 1; sh = 0; rs = 0; do { bt = str.charCodeAt(i++) - 63; rs |= (bt & 31) << sh; sh += 5; } while (bt >= 32); lo += rs & 1 ? ~(rs >> 1) : rs >> 1; out.push([la / 1e6, lo / 1e6]); } return out; };
    const osrm = async () => (await (await fetch(`https://routing.openstreetmap.de/routed-foot/route/v1/foot/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson&alternatives=3`)).json()).routes.map((r) => ({ d: r.distance, t: r.duration, c: r.geometry.coordinates.map(([x, y]) => [y, x]) }));
    const valh = async () => { const q = { locations: [{ lat: a[0], lon: a[1] }, { lat: b[0], lon: b[1] }], costing: "pedestrian", directions_options: { units: "kilometers" } }; const t = (await (await fetch("https://valhalla1.openstreetmap.de/route?json=" + encodeURIComponent(JSON.stringify(q)))).json()).trip; return [{ d: t.summary.length * 1000, t: t.summary.time, c: dec6(t.legs[0].shape) }]; };
    const rs = (await Promise.allSettled([osrm(), valh()])).flatMap((x) => (x.status === "fulfilled" ? x.value : []));
    return rs.reduce((m, x) => (x.d < m.d ? x : m));
  }
  // ---- Жүру жолы: бастапқы нүктеден (Менің орным / іздеу) мақсатқа дейін — көлікпен, автобуспен, жаяу (2ГИС сияқты) ----
  function routePlanner(map, root, preset) {
    const R = 6371000, rad = (x) => (x * Math.PI) / 180, hav = (a, b) => { const dl = rad(b[0] - a[0]), dn = rad(b[1] - a[1]), h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
    const len = (c) => c.reduce((t, q, i) => (i ? t + hav(c[i - 1], q) : 0), 0), mins = (sec) => Math.max(1, Math.round(sec / 60)), fmt = (m) => (m >= 1000 ? (m / 1000).toFixed(1).replace(".", ",") + " км" : Math.round(m / 10) * 10 + " м");
    const e2 = (t) => String(t).replace(/</g, "&lt;");
    const PLACES = [["Айша анамыздың мешіті (Тәнғим)", [21.4677052, 39.8013681]], ["Абдулазиз патша қақпасы", [21.42104, 39.82584]], ["Қағба", [21.4225172, 39.8261942]], ["Қара тас", [21.4224985, 39.8262546]], ["Ибраһим мақамы", [21.4225789, 39.8263055]], ["Сафа", [21.42177, 39.82739]], ["Мәруа", [21.42518, 39.82713]]];
    let from = null, to = null, mode = "car", res = null, pickTo = false, lastWatch = null;
    const lg = L.layerGroup().addTo(map), nl = L.layerGroup().addTo(map);
    const rec = () => { try { return JSON.parse(localStorage.getItem("umrah-recents") || "[]"); } catch (e) { return []; } };
    const saveRec = (n, p) => { if (n === "Таңдалған нүкте") return; try { const r = rec().filter((x) => x[0] !== n); r.unshift([n, p]); localStorage.setItem("umrah-recents", JSON.stringify(r.slice(0, 6))); } catch (e) { /* жад жоқ */ } };
    root.innerHTML = `<div id="pgow"></div>
      <div class="pl"><div class="plr"><i class="pa">А</i><input id="pfa" type="search" placeholder="Қайдан: атын жазыңыз немесе 📍 басыңыз" autocomplete="off" enterkeyhint="search"><button id="pme" aria-label="Орнымды анықтау">📍</button></div>
      <div class="plr"><i class="pb">Б</i><input id="pfb" type="search" placeholder="Қайда барамыз?" autocomplete="off" enterkeyhint="search"><button id="ppick" aria-label="Картадан таңдау">🎯</button></div></div>
      <div id="psug" class="psug"></div>
      <div class="pm"><button class="pmb on" data-m="car"><i>🚗</i><b id="pt-car"></b></button><button class="pmb" data-m="bus"><i>🚌</i><b id="pt-bus"></b></button><button class="pmb" data-m="foot"><i>🚶</i><b id="pt-foot"></b></button></div>
      <div id="pres"></div>`;
    const $ = (id) => root.querySelector("#" + id), sug = $("psug"), out = $("pres");
    let sugTmr = null;
    // Автотолықтыру: жергілікті орындар + тергенде (≥3 әріп) Меккеден іздеу; «Қайдан» өрісінде бірінші — «Менің орным» (GPS)
    const suggest = (inp, setter, isFrom) => {
      const q = inp.value.trim(), ql = q.toLowerCase();
      const items = (isFrom ? [["📍 Менің орным (GPS)", null, "me"]] : []).concat(q ? [] : rec().map((x) => ["🕘 " + x[0], x[1], x[0]])).concat(PLACES.filter((x) => !q || x[0].toLowerCase().includes(ql)).map((x) => ["📍 " + x[0], x[1], x[0]]));
      sug.innerHTML = items.slice(0, 8).map((x, i) => `<button class="hit" data-i="${i}"><b>${e2(x[0])}</b></button>`).join("") + (q.length >= 3 ? '<p class="rtp-n" id="sugr">Ізделуде…</p>' : "");
      sug.querySelectorAll(".hit").forEach((b) => (b.onclick = () => { const x = items[+b.dataset.i]; if (x[2] === "me") locate((p) => setFrom("Менің орным", p)); else setter(x[2], x[1]); }));
      clearTimeout(sugTmr);
      if (q.length >= 3) sugTmr = setTimeout(async () => {
        try {
          const r = await geocode(q), box = sug.querySelector("#sugr"); if (!box || inp.value.trim() !== q) return;
          box.outerHTML = r.length ? r.map((x, i) => `<button class="hit rem" data-r="${i}"><b>${e2(x[0])}</b><small>${e2(x[2])}</small></button>`).join("") : '<p class="rtp-n">Картада табылмады. Атын ағылшынша жазып көріңіз.</p>';
          sug.querySelectorAll(".rem").forEach((b) => (b.onclick = () => setter(r[+b.dataset.r][0], r[+b.dataset.r][1])));
        } catch (e) { const box = sug.querySelector("#sugr"); if (box) box.outerHTML = '<p class="rtp-n err">Интернет жоқ па?</p>'; }
      }, 550);
    };
    const geocode = async (q) => { const r = await (await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&accept-language=en&bounded=1&viewbox=39.60,21.60,40.05,21.15&q=${encodeURIComponent(q)}`)).json(); return r.map((x) => [x.name || x.display_name.split(",")[0], [+x.lat, +x.lon], x.display_name.split(",").slice(1, 3).join(",")]); };
    const search = async (inp, setter) => { const q = inp.value.trim(); if (!q) return; sug.innerHTML = '<p class="rtp-n">Ізделуде…</p>'; try { const r = await geocode(q); sug.innerHTML = r.length ? r.map((x, i) => `<button class="hit" data-i="${i}"><b>${e2(x[0])}</b><small>${e2(x[2])}</small></button>`).join("") : '<p class="rtp-n">Табылмады. Атын ағылшынша жазып көріңіз.</p>'; sug.querySelectorAll(".hit").forEach((b) => (b.onclick = () => setter(r[+b.dataset.i][0], r[+b.dataset.i][1]))); } catch (e) { sug.innerHTML = '<p class="rtp-n err">Интернет жоқ па? Қайта көріңіз.</p>'; } };
    const setFrom = (n, p) => { from = { n, p }; $("pfa").value = n; sug.innerHTML = ""; go(); };
    const setTo = (n, p) => { to = { n, p }; $("pfb").value = n; sug.innerHTML = ""; saveRec(n, p); go(); };
    const locate = (cb) => { if (!navigator.geolocation) return (out.innerHTML = '<p class="rtp-n err">Бұл құрылғы орынды анықтай алмайды. «Қайдан» жолына атын жазыңыз.</p>'); out.innerHTML = '<p class="rtp-n">Орныңыз анықталуда…</p>'; navigator.geolocation.getCurrentPosition((g) => cb([g.coords.latitude, g.coords.longitude]), () => (out.innerHTML = '<p class="rtp-n err">Орын анықталмады. Рұқсат беріңіз немесе «Қайдан» жолына атын жазыңыз.</p>'), { enableHighAccuracy: true, timeout: 15000 }); };
    $("pme").onclick = () => locate((p) => setFrom("Менің орным", p));
    $("pfa").onkeydown = (e) => { if (e.key === "Enter") search($("pfa"), setFrom); }; $("pfb").onkeydown = (e) => { if (e.key === "Enter") search($("pfb"), setTo); };
    $("pfa").onfocus = () => { if ($("pfa").value === "Менің орным") $("pfa").select(); suggest($("pfa"), setFrom, true); }; $("pfa").oninput = () => { from = null; suggest($("pfa"), setFrom, true); };
    $("pfb").onfocus = () => suggest($("pfb"), setTo, false); $("pfb").oninput = () => { to = null; suggest($("pfb"), setTo, false); };
    if (preset && preset.to) { to = { n: preset.to[0], p: preset.to[1] }; $("pfb").value = preset.to[0]; out.innerHTML = '<p class="rtp-n">Қонақүйіңіздің атын «Қайдан» жолына жазыңыз немесе 📍 басыңыз — Айша анамыздың мешітіне дейінгі жол көрсетіледі.</p>'; L.marker(preset.to[1]).addTo(nl).bindTooltip(preset.to[0], { permanent: true, direction: "top" }); map.setView(preset.to[1], 15); }
    $("ppick").onclick = () => { pickTo = true; out.innerHTML = '<p class="rtp-n">Картадан мақсатты басыңыз…</p>'; const sh = document.getElementById("fns"); sh.hidden = true; sh.__sync(); };
    map.on("click", (e) => { if (!pickTo) return; pickTo = false; const sh = document.getElementById("fns"); sh.hidden = false; sh.__sync(); setTo("Таңдалған нүкте", [e.latlng.lat, e.latlng.lng]); });
    const osrmCar = async (a, b) => { const r = (await (await fetch(`https://routing.openstreetmap.de/routed-car/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`)).json()).routes[0]; return { d: r.distance, t: r.duration, c: r.geometry.coordinates.map(([x, y]) => [y, x]) }; };
    const link = (r, f, t) => { const c = r.c.slice(); let add = 0; if (hav(f, c[0]) > 3) { add += hav(f, c[0]); c.unshift(f); } if (hav(t, c[c.length - 1]) > 3) { add += hav(t, c[c.length - 1]); c.push(t); } return Object.assign({}, r, { d: r.d + add, t: r.t + add / 1.25, c }); };
    const go = async () => {
      if (!to) return; if (!from) return locate((p) => setFrom("Менің орным", p));
      out.innerHTML = '<p class="rtp-n">Жол есептелуде…</p>'; ["car", "bus", "foot"].forEach((m) => ($("pt-" + m).textContent = "…"));
      const [car, foot, bus] = await Promise.all([osrmCar(from.p, to.p).catch(() => null), footRoute(from.p, to.p).then((r) => link(r, from.p, to.p)).catch(() => null), (async () => {
        const o = await Promise.all(BUS_TERMS.map(async (t) => { try { const [ride, walk] = await Promise.all([osrmCar(from.p, t.p), footRoute(t.p, to.p)]); return { t, ride, walk: link(walk, t.p, to.p), tot: ride.t * 1.4 + 360 + walk.t }; } catch (e) { return null; } }));
        return o.filter(Boolean).sort((a, b) => a.tot - b.tot)[0] || null; })()]);
      res = { car, foot, bus }; $("pt-car").textContent = car ? mins(car.t) + " мин" : "—"; $("pt-foot").textContent = foot ? mins(foot.t) + " мин" : "—"; $("pt-bus").textContent = bus ? "≈" + mins(bus.tot) + " мин" : "—";
      show(true);
    };
    const mk = (n, p, col, lbl) => L.marker(p, { icon: L.divIcon({ className: "", html: `<div class="rtn"><i style="background:${col}">${lbl}</i><b>${e2(n)}</b></div>`, iconSize: [0, 0] }), zIndexOffset: 900 }).addTo(lg);
    const show = (fit) => {
      root.querySelectorAll(".pmb").forEach((b) => b.classList.toggle("on", b.dataset.m === mode)); $("pgow").innerHTML = "";
      lg.clearLayers(); nl.clearLayers(); if (!res) return;
      const r = mode === "bus" ? (res.bus && res.bus.walk) : res[mode];
      if (!r) { out.innerHTML = '<p class="rtp-n err">Бұл режим үшін жол табылмады.</p>'; return; }
      const col = { car: "#2f7cff", bus: "#7a4a1c", foot: "#7a4a1c" }[mode], pts = r.c.slice();
      if (mode === "bus") { L.polyline(res.bus.ride.c, { color: "#2f7cff", weight: 5, dashArray: "9 9", lineCap: "round", interactive: false }).addTo(lg); pts.push(...res.bus.ride.c); mk(res.bus.t.kk, res.bus.t.p, "#2f7cff", "🚌"); }
      L.polyline(r.c, { color: "#fff", weight: 10, lineCap: "round", lineJoin: "round", interactive: false }).addTo(lg); L.polyline(r.c, { color: col, weight: 5, lineCap: "round", lineJoin: "round", interactive: false }).addTo(lg);
      mk(from.n, from.p, "#16a34a", "А"); mk(to.n, to.p, "#d93025", "Б"); if (fit) { const sh = document.getElementById("fns"); map.fitBounds(L.latLngBounds(pts).pad(0.15), { maxZoom: 18, paddingBottomRight: [0, sh && !sh.hidden ? sh.offsetHeight : 0] }); }
      const tot = mode === "bus" ? res.bus.tot : r.t, dist = mode === "bus" ? res.bus.ride.d + res.bus.walk.d : r.d;
      $("pgow").innerHTML = '<button class="gogo" id="pgo">Жолға шығу</button>';
      out.innerHTML = `<div class="rsum"><b>${fmt(dist)}</b><span>${{ car: "көлікпен", bus: "автобуспен + жаяу", foot: "жаяу" }[mode]}</span></div>`
        + (mode === "bus" ? `<p class="rtp-n">«${e2(res.bus.t.kk)}» аялдамасына дейін ≈${mins(res.bus.ride.t * 1.4)} мин + күту ≈6 мин, одан жаяу ${mins(res.bus.walk.t)} мин. Желі: ${res.bus.t.lines}. Кесте картада жоқ, уақыт шамамен.</p>` : mode === "car" ? '<p class="rtp-n">Көлік Әл-Харам ішіне кірмейді: ең жақын жолға дейін есептелген.</p>' : "")
;
      $("pgo").onclick = () => nav(r, mode === "car" ? "#2f7cff" : "#7a4a1c");
    };
    const nav = (r, col) => {
      if (!navigator.geolocation) return; if (lastWatch !== null) navigator.geolocation.clearWatch(lastWatch);
      let mk2 = null, ac = null, tr = null, pts = [], follow = true; const T = to.p;
      const drag = () => { follow = false; }; map.on("dragstart", drag);
      const stop = () => { if (lastWatch !== null) navigator.geolocation.clearWatch(lastWatch); lastWatch = null; map.off("dragstart", drag); nl.clearLayers(); show(true); };
      lastWatch = navigator.geolocation.watchPosition((g) => {
        const p = [g.coords.latitude, g.coords.longitude], a = g.coords.accuracy || 20;
        if (!mk2) { mk2 = L.circleMarker(p, { radius: 9, color: "#fff", weight: 3, fillColor: "#2f7cff", fillOpacity: 1, interactive: false }).addTo(nl); ac = L.circle(p, { radius: a, color: "#2f7cff", weight: 1, fillOpacity: 0.12, interactive: false }).addTo(nl); tr = L.polyline([p], { color: "#2f7cff", weight: 4, opacity: 0.7, interactive: false }).addTo(nl); }
        mk2.setLatLng(p); ac.setLatLng(p); ac.setRadius(a); pts.push(p); tr.setLatLngs(pts); if (follow) map.panTo(p);
        let k = 0, off = 1e9; r.c.forEach((q, i) => { const d = hav(p, q); if (d < off) { off = d; k = i; } }); const rem = off + len(r.c.slice(k)), arrived = hav(p, T) < 30 || rem < 30;
        out.innerHTML = `<div class="gprow"><div class="gpr"><b>${arrived ? "Жеттіңіз ✓" : fmt(rem)}</b><small>${arrived ? "мақсатқа жеттіңіз" : "қалды"}</small></div>${arrived ? "" : `<div class="gpr"><b>${mins(rem / (mode === "car" ? 8 : 1.25))} мин</b><small>${mode === "car" ? "көлікпен" : "жаяу"}</small></div>`}</div><p class="rtp-n">Көк нүкте — сіз. Жолмен жүріңіз. Дәлдік ≈ ${Math.round(a)} м.</p><div class="gprow"><button class="gpr" id="pfol"><b>${follow ? "Қадағалап тұр" : "Орталықтау"}</b><small>карта сізбен жүреді</small></button><button class="gpr" id="pstop"><b>Тоқтату</b><small>жолды аяқтау</small></button></div>`;
        document.getElementById("pfol").onclick = () => { follow = true; map.panTo(p); }; document.getElementById("pstop").onclick = stop;
      }, () => { out.innerHTML = '<p class="rtp-n err">Орын анықталмады. Орынға рұқсат беріңіз.</p>'; }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 });
    };
    root.querySelectorAll(".pmb").forEach((b) => (b.onclick = () => { mode = b.dataset.m; show(true); }));
  }
  // ---- Умраның бүкіл маршруты бір картада; әр қадамның картасы — осы картаның сол қадамға бағытталған көрінісі ----
  function overview(map, pray, key, at) {
    const WALK_MS = 1.25, hav = (a, b) => { const R = 6371000, t = (x) => (x * Math.PI) / 180, dl = t(b[0] - a[0]), dn = t(b[1] - a[1]); const h = Math.sin(dl / 2) ** 2 + Math.cos(t(a[0])) * Math.cos(t(b[0])) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
    const len = (c) => c.reduce((s, p, i) => (i ? s + hav(c[i - 1], p) : 0), 0), mins = (m) => Math.max(1, Math.round(m / WALK_MS / 60)), fmt = (m) => (m >= 1000 ? (m / 1000).toFixed(1).replace(".", ",") + " км" : Math.round(m / 10) * 10 + " м");
    // Жол желіге «жабысқан» нүктеде аяқталады: нақты белгіге (қонақүй, шаштараз, Мәруа) дейінгі қалған бөлікті жалғаймыз
    const link = (r, from, to) => { const c = r.c.slice(); let add = 0; if (hav(from, c[0]) > 3) { add += hav(from, c[0]); c.unshift(from); } if (hav(to, c[c.length - 1]) > 3) { add += hav(to, c[c.length - 1]); c.push(to); } return Object.assign({}, r, { d: r.d + add, t: (r.t || 0) + add / 1.25, c }); };
    const KAABA_EDGE = [21.4224985, 39.8262546], SAFA = [21.42177, 39.82739], MARWA = [21.42518, 39.82713], GATE = [21.42104, 39.82584], KAABA_C = [21.4225172, 39.8261942];
    // Сафаға жол қоршаудың Сафаға ең жақын жиегінен басталады
    const fenceStart = [[7, -8], [7, 0], [7, 8], [15, -8], [15, 8], [23, -8], [23, 0], [23, 8]].map(([d, w]) => at(d, w)).reduce((a, b) => (hav(a, MAQAM_SAFA[2]) <= hav(b, MAQAM_SAFA[2]) ? a : b));
    const BARB = OV_BARB.map((b) => Object.assign({}, b, { toM: link(b.toM, [21.42518, 39.82713], b.p), toH: link(b.toH, b.p, OV_HOTEL.p), alt: b.alt && link(b.alt, [21.42518, 39.82713], b.p) }));
    const best = BARB.reduce((a, b) => (a.toM.d <= b.toM.d ? a : b));
    // қадамдар: 1 қақпа · 2 қара тас · 3 тауаф · 4 Ибраһим мақамы · 5 сағи · 6 шашты алу
    const SEG = [
      { st: ["gate"], t: "Қонақүй → Абдулазиз патша қақпасы", en: "Hotel → King Abdulaziz Gate", c: link({ d: 0, t: 0, c: OV_H2G }, OV_HOTEL.p, GATE).c, col: "#7a4a1c", lab: "1-қадам алдында" },
      { st: ["stone", "gate"], t: "Қақпа → Қара тас (жасыл сызық арқылы)", en: "Gate → Black Stone", c: GATE_ROUTE.concat([KAABA_EDGE]), col: "#2f7cff", lab: "1 → 2" },
      { st: ["tawaf"], t: "Тауаф: Қағбаны 7 рет айналу", en: "Tawaf: 7 circuits", c: KAABA_GEO.tawaf.concat([KAABA_GEO.tawaf[0]]), col: "#0aa37f", lab: "3", noArr: true, tail: "1 айналым" },
      { st: ["maqam"], t: "Қағба → 2 рәкәт намаз орны", en: "Kaaba → prayer area", c: [KAABA_DOOR, MAQAM_SAFA[0]], col: "#c026d3", lab: "3 → 4" },
      { st: ["sai"], t: "Намаз орны → Сафа", en: "Prayer area → Safa", c: [fenceStart].concat(MAQAM_SAFA.slice(1)), col: "#ff8a1f", lab: "4 → 5" },
      { st: ["sai"], t: "Сафа → Мәруа (7 жүріс)", en: "Safa → Marwa", c: OV_S2M.c, col: "#e8730c", lab: "5", tail: "1 жүріс" },
      { st: ["hair"], t: "Мәруа → шаштараз (ұсынылған)", en: "Marwa → barber", c: best.toM.c, col: "#8e44ad", lab: "5 → 6", hair: true },
    ];
    const on = (st) => !key || st.includes(key), cur = SEG.filter((sg) => on(sg.st) && !(key === "gate" && sg.t.startsWith("Қонақүй")));
    const bearing = (a, b) => (Math.atan2((b[1] - a[1]) * Math.cos((a[0] * Math.PI) / 180), b[0] - a[0]) * 180) / Math.PI;
    const arrows = (c, col, tgt = map) => { let acc = 0, next = 60; for (let i = 1; i < c.length; i++) { const seg = hav(c[i - 1], c[i]); while (acc + seg >= next) { const f = (next - acc) / seg, q = [c[i - 1][0] + (c[i][0] - c[i - 1][0]) * f, c[i - 1][1] + (c[i][1] - c[i - 1][1]) * f]; L.marker(q, { interactive: false, icon: L.divIcon({ className: "", html: `<svg class="rta" style="transform:rotate(${bearing(c[i - 1], c[i]).toFixed(0)}deg)" viewBox="0 0 12 12" width="14" height="14"><path d="M6 1L11 11 6 8.6 1 11z" fill="${col}" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/></svg>`, iconSize: [14, 14], iconAnchor: [7, 7] }) }).addTo(tgt); next += 70; } acc += seg; } };
    SEG.forEach((sg) => { sg.d = len(sg.c); });
    cur.filter((sg) => !sg.hair).forEach((sg) => { L.polyline(sg.c, { color: "#fff", weight: 10, lineCap: "round", lineJoin: "round", interactive: false }).addTo(map); L.polyline(sg.c, { color: sg.col, weight: 5, lineCap: "round", lineJoin: "round", interactive: false }).addTo(map); const mid = sg.c[Math.floor(sg.c.length * (sg.noArr ? 0.12 : 0.5))]; if (sg.d > 10 || sg.tail) L.marker(mid, { interactive: false, icon: L.divIcon({ className: "", html: `<div class="rtl" style="background:${sg.col}">${fmt(sg.d)} · ${sg.tail || mins(sg.d) + " мин"}</div>`, iconSize: [0, 0] }) }).addTo(map); if (!sg.noArr) arrows(sg.c, sg.col); });
    const num = (n, p, name, col, tgt = map) => L.marker(p, { zIndexOffset: 900, icon: L.divIcon({ className: "", html: `<div class="rtn"><i style="background:${col}">${n}</i><b>${name}</b></div>`, iconSize: [0, 0] }) }).addTo(tgt);
    const pts = [];
    const mk = (st, n, p, name, col) => { if (on(st)) { num(n, p, name, col); pts.push(p); } };
    if (key !== "gate") mk(["gate"], "★", OV_HOTEL.p, OV_HOTEL.n + " · Hotel", "#7a4a1c");
    mk(["gate", "stone"], 1, GATE, "Абдулазиз патша қақпасы · King Abdulaziz Gate", "#e0b050");
    mk(["stone", "tawaf"], 2, KAABA_EDGE, "Қара тас · Black Stone", "#7a4a1c");
    mk(["tawaf"], 3, KAABA_C, "Тауаф · Қағба · Kaaba", "#13211c");
    mk(["maqam", "sai"], 4, MAQAM_SAFA[0], "Ибраһим мақамы", "#c026d3");
    mk(["sai"], 5, SAFA, "Сафа · Safa", "#ff8a1f"); mk(["sai", "hair"], 5, MARWA, "Мәруа · Marwa", "#e8730c");
    // Бастапқы нүктеден (GPS / қонақүй / карта) мақсатқа дейін: жаяу, көлікпен, автобуспен
    const travel = (tgt, tname, onOrigin, footOnly) => {
      // Қонақүйден қақпаға: «Мен осындамын» (GPS) немесе қонақүй атын іздеу; жаяу және көлікпен (OSRM, тікелей есептеледі)
      const gp = document.getElementById("gp"), lg = L.layerGroup().addTo(map), mins2 = (sec) => Math.max(1, Math.round(sec / 60));
      gp.innerHTML = `<div id="gpcard"></div><button class="here" id="gphere"><span class="here-i">${ic("nav", 22)}</span><span><b>Мен осындамын</b><small>Орныңыз анықталып, ${tname} дейінгі жол көрсетіледі</small></span></button>
        <div class="gps"><input id="gpq" type="search" placeholder="Немесе қонақүй атын жазыңыз" autocomplete="off" enterkeyhint="search"><button id="gpgo" aria-label="Іздеу">${ic("nav", 18)}</button></div><div id="gpres"></div><div id="gpout"></div>`;
      const res = document.getElementById("gpres"), out = document.getElementById("gpout");
      const url = (prof, a, b) => `https://routing.openstreetmap.de/routed-${prof}/route/v1/${prof === "foot" ? "foot" : "driving"}/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`;
      // Жаяу жол: екі жүйе (OSRM + Valhalla «pedestrian» — жаяу жолдар, өткелдер, баспалдақ ескеріледі) салыстырылып, ең қысқасы алынады
      const dec6 = (str) => { const out = []; let i = 0, la = 0, lo = 0; while (i < str.length) { let sh = 0, rs = 0, bt; do { bt = str.charCodeAt(i++) - 63; rs |= (bt & 31) << sh; sh += 5; } while (bt >= 32); la += rs & 1 ? ~(rs >> 1) : rs >> 1; sh = 0; rs = 0; do { bt = str.charCodeAt(i++) - 63; rs |= (bt & 31) << sh; sh += 5; } while (bt >= 32); lo += rs & 1 ? ~(rs >> 1) : rs >> 1; out.push([la / 1e6, lo / 1e6]); } return out; };
      const osrm = async (prof, a, b, alt) => (await (await fetch(url(prof, a, b) + (alt ? "&alternatives=3" : ""))).json()).routes.map((r) => ({ d: r.distance, t: r.duration, c: r.geometry.coordinates.map(([x, y]) => [y, x]) }));
      const valh = async (a, b) => { const q = { locations: [{ lat: a[0], lon: a[1] }, { lat: b[0], lon: b[1] }], costing: "pedestrian", directions_options: { units: "kilometers" } }; const t = (await (await fetch("https://valhalla1.openstreetmap.de/route?json=" + encodeURIComponent(JSON.stringify(q)))).json()).trip; return [{ d: t.summary.length * 1000, t: t.summary.time, c: dec6(t.legs[0].shape) }]; };
      const get = async (prof, a, b) => {
        if (prof !== "foot") return (await osrm(prof, a, b))[0];
        const rs = (await Promise.allSettled([osrm("foot", a, b, true), valh(a, b)])).flatMap((x) => (x.status === "fulfilled" ? x.value : []));
        return rs.reduce((m, x) => (x.d < m.d ? x : m));
      };
      let lastDraw = null;
      // «Жолға шығу»: қозғалысты қадағалау (2ГИС сияқты) — көк нүкте жүріп отырады, қалған жол мен уақыт жаңарады, жолдан тайсаңыз қайта есептеледі
      const startNav = (r0, mode, bt) => {
        if (!navigator.geolocation) return toast("Орынды анықтау мүмкін емес");
        const T = tgt(); let r = r0, follow = true, wid = null, mk = null, ac = null, tr = null, pts2 = [], lastRe = 0, arrived = false, busy = false;
        const nl = L.layerGroup().addTo(map), col = mode === "car" ? "#2f7cff" : "#7a4a1c";
        const paint = () => { lg.clearLayers(); if (bt) { L.polyline(bt.ride.c, { color: "#2f7cff", weight: 5, dashArray: "9 9", lineCap: "round", interactive: false }).addTo(lg); num("🚌", bt.t.p, bt.t.n + " · автобус аялдамасы", "#2f7cff", lg); } L.polyline(r.c, { color: "#fff", weight: 10, lineCap: "round", lineJoin: "round", interactive: false }).addTo(lg); L.polyline(r.c, { color: col, weight: 5, lineCap: "round", lineJoin: "round", interactive: false }).addTo(lg); arrows(r.c, col, lg); num("⚑", T, "", "#16a34a", lg); };
        const onDrag = () => { follow = false; };
        const stop = () => { if (wid !== null) navigator.geolocation.clearWatch(wid); wid = null; map.off("dragstart", onDrag); nl.remove(); if (lastDraw) lastDraw(true); };
        const ui = (rem, a, msg) => { out.innerHTML = `<div class="gprow"><div class="gpr"><b>${arrived ? "Жеттіңіз ✓" : fmt(rem)}</b><small>${arrived ? "мақсатқа жеттіңіз" : "қалды"}</small></div>${arrived ? "" : `<div class="gpr"><b>${mins(rem)} мин</b><small>${mode === "car" ? "көлікпен" : "жаяу"}</small></div>`}</div><p class="rtp-n">${msg || "Көк нүкте — сіз. Жолмен жүріңіз, жолдан тайсаңыз қайта есептеледі."} Дәлдік ≈ ${Math.round(a)} м.</p><div class="gprow"><button class="gpr" id="nfol"><b>${follow ? "Қадағалап тұр" : "Орталықтау"}</b><small>карта сізбен жүреді</small></button><button class="gpr" id="nstop"><b>Тоқтату</b><small>жолды аяқтау</small></button></div>`; document.getElementById("nfol").onclick = () => { follow = true; if (mk) map.panTo(mk.getLatLng()); }; document.getElementById("nstop").onclick = stop; };
        const onPos = async (g) => {
          const p = [g.coords.latitude, g.coords.longitude], a = g.coords.accuracy || 20;
          if (!mk) { mk = L.circleMarker(p, { radius: 9, color: "#fff", weight: 3, fillColor: "#2f7cff", fillOpacity: 1, interactive: false }).addTo(nl); ac = L.circle(p, { radius: a, color: "#2f7cff", weight: 1, fillOpacity: 0.12, interactive: false }).addTo(nl); tr = L.polyline([p], { color: "#2f7cff", weight: 4, opacity: 0.7, interactive: false }).addTo(nl); }
          mk.setLatLng(p); ac.setLatLng(p); ac.setRadius(a); pts2.push(p); tr.setLatLngs(pts2); if (follow) map.panTo(p, { animate: true });
          let k = 0, off = 1e9; r.c.forEach((q, i) => { const d = hav(p, q); if (d < off) { off = d; k = i; } });
          const rem = off + len(r.c.slice(k));
          if (hav(p, T) < 30 || rem < 30) { arrived = true; ui(0, a); return; }
          // жолдан 80 м-ден астам тайса — қайта есептеу (10 с-тан сирек емес)
          if (off > 80 && !bt && !busy && Date.now() - lastRe > 10000) { busy = true; lastRe = Date.now(); try { const nr = await get(mode === "car" ? "car" : "foot", p, T), cc = nr.c.slice(); if (hav(T, cc[cc.length - 1]) > 3) cc.push(T); r = Object.assign({}, nr, { c: cc }); paint(); ui(len(cc), a, "Жол қайта есептелді."); busy = false; return; } catch (e) { /* ескі жол қалады */ } busy = false; }
          ui(rem, a);
        };
        paint(); map.on("dragstart", onDrag); out.innerHTML = '<p class="rtp-n">Орныңыз анықталуда…</p>';
        wid = navigator.geolocation.watchPosition(onPos, (e) => { out.innerHTML = `<p class="rtp-n err">${e.code === 1 ? "Орынға рұқсат берілмеді. Баптауда рұқсат беріп, қайта басыңыз." : "Орын анықталмады. Ашық жерге шығыңыз."}</p>`; }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 });
      };
      let lastO = null;
      const routeFrom = async (me, name) => {
        lastO = [me, name]; const T = tgt(); if (onOrigin) onOrigin();
        out.innerHTML = '<p class="rtp-n">Жол есептелуде…</p>';
        try {
          const [w0, c, bt] = await Promise.all([get("foot", me, T), footOnly ? null : get("car", me, T).catch(() => null), footOnly ? null : (async () => {
            // автобус: ең тиімді терминалға дейін (көлік жолы × 1,4 + 6 мин күту) және одан қақпаға жаяу
            const opts = await Promise.all(BUS_TERMS.map(async (t) => { try { const [ride, walk] = await Promise.all([get("car", me, t.p), get("foot", t.p, T)]); return { t, ride, walk, tot: ride.t * 1.4 + 360 + walk.t }; } catch (e) { return null; } }));
            return opts.filter(Boolean).sort((a, b) => a.tot - b.tot)[0] || null;
          })()]);
          const lk = (r, f, t) => { const cc = r.c.slice(); let add = 0; if (hav(f, cc[0]) > 3) { add += hav(f, cc[0]); cc.unshift(f); } if (hav(t, cc[cc.length - 1]) > 3) { add += hav(t, cc[cc.length - 1]); cc.push(t); } return Object.assign({}, r, { d: r.d + add, t: r.t + add / 1.25, c: cc }); };
          const w = lk(w0, me, T); if (bt) bt.walk = lk(bt.walk, bt.t.p, T);
          let mode = "foot";
          const draw = (fit) => {
            const bus = mode === "bus" && bt, r = bus ? bt.walk : mode === "foot" || !c ? w : c, col = r === c ? "#2f7cff" : "#7a4a1c";
            lg.clearLayers();
            if (bus) { L.polyline(bt.ride.c, { color: "#2f7cff", weight: 5, dashArray: "9 9", lineCap: "round", lineJoin: "round", interactive: false }).addTo(lg); num("🚌", bt.t.p, bt.t.n + " · автобус аялдамасы", "#2f7cff", lg); }
            L.polyline(r.c, { color: "#fff", weight: 10, lineCap: "round", lineJoin: "round", interactive: false }).addTo(lg); L.polyline(r.c, { color: col, weight: 5, lineCap: "round", lineJoin: "round", interactive: false }).addTo(lg); arrows(r.c, col, lg);
            num(name ? "★" : "●", me, name || "Сіз осындасыз", name ? "#7a4a1c" : "#2f7cff", lg);
            if (r === c) num("P", r.c[r.c.length - 1], "Көлік осы жерге дейін жетеді", "#2f7cff", lg);
            if (fit) map.fitBounds(L.latLngBounds(r.c.concat([T], bus ? bt.ride.c : [])).pad(0.2), { maxZoom: 18 });
            out.innerHTML = `<div class="gprow"><button class="gpr ${r === w ? "on" : ""}" data-m="foot"><b>🚶 ${mins2(w.t)} мин</b><small>жаяу · ${fmt(w.d)}</small></button>${c ? `<button class="gpr ${r === c ? "on" : ""}" data-m="car"><b>🚗 ${mins2(c.t)} мин</b><small>көлікпен · ${fmt(c.d)}</small></button>` : ""}${bt ? `<button class="gpr ${bus ? "on" : ""}" data-m="bus"><b>🚌 ≈${mins2(bt.tot)} мин</b><small>автобус</small></button>` : ""}</div><p class="rtp-n">${bus ? `Автобус: «${bt.t.kk}» аялдамасына дейін ≈${mins2(bt.ride.t * 1.4)} мин + күту ≈6 мин, одан ${tname} жаяу ${mins2(bt.walk.t)} мин (${fmt(bt.walk.d)}). Желі: ${bt.t.lines}. Кесте картада жоқ, уақыт шамамен; нақты рейсті «Makkah Bus» қолданбасынан тексеріңіз.` : r === c ? "Көлік жолы — ${tname} ең жақын жолға дейін (көлік Әл-Харам ішіне кірмейді), одан әрі жаяу." : "Жаяу жол."} Жол OSM деректері бойынша есептелген.</p><button class="here gogo" id="gogo"><span class="here-i">${ic("nav", 22)}</span><span><b>Жолға шығу</b><small>Қай жерде келе жатқаныңыз картада көрінеді</small></span></button>`;
            out.querySelectorAll("[data-m]").forEach((x) => (x.onclick = () => { mode = x.dataset.m; draw(true); }));
            document.getElementById("gogo").onclick = () => startNav(r, bus ? "foot" : mode, bus ? bt : null);
          };
          lastDraw = draw; draw(true);
        } catch (e) { out.innerHTML = '<p class="rtp-n err">Жолды есептеу мүмкін болмады. Интернетті тексеріп, қайта басыңыз.</p>'; }
      };
      document.getElementById("gphere").onclick = () => {
        if (!navigator.geolocation) return toast("Орынды анықтау мүмкін емес");
        res.innerHTML = ""; out.innerHTML = '<p class="rtp-n">Орныңыз анықталуда…</p>';
        navigator.geolocation.getCurrentPosition((g) => routeFrom([g.coords.latitude, g.coords.longitude], ""), () => { out.innerHTML = '<p class="rtp-n err">Орын анықталмады. Орынға рұқсат беріңіз немесе қонақүй атын жазыңыз.</p>'; }, { enableHighAccuracy: true, timeout: 15000 });
      };
      const search = async () => {
        const q = document.getElementById("gpq").value.trim(); if (!q) return;
        res.innerHTML = '<p class="rtp-n">Ізделуде…</p>'; out.innerHTML = "";
        try {
          const r = await (await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&accept-language=en&bounded=1&viewbox=39.70,21.55,39.95,21.30&q=${encodeURIComponent(q)}`)).json();
          res.innerHTML = r.length ? r.map((x, i) => `<button class="hit" data-i="${i}"><b>${esc(x.name || x.display_name.split(",")[0])}</b><small>${esc(x.display_name.split(",").slice(1, 3).join(","))}</small></button>`).join("") : '<p class="rtp-n">Табылмады. Атын ағылшынша жазып көріңіз (мысалы: Hilton, Swissotel).</p>';
          res.querySelectorAll(".hit").forEach((b) => (b.onclick = () => { const x = r[+b.dataset.i]; res.innerHTML = ""; routeFrom([+x.lat, +x.lon], x.name || x.display_name.split(",")[0]); }));
        } catch (e) { res.innerHTML = '<p class="rtp-n err">Интернет жоқ па? Қайта көріңіз.</p>'; }
      };
      // Картадағы ғимаратты басқанда: ол туралы ақпарат (2ГИС сияқты) және сол жерден қақпаға дейінгі маршрут
      const KIND = { hotel: "Қонақүй", guest_house: "Қонақ үй", hostel: "Қонақ үй", apartments: "Тұрғын үй", mosque: "Мешіт", place_of_worship: "Мешіт", restaurant: "Мейрамхана", fast_food: "Жылдам тамақ", cafe: "Кафе", pharmacy: "Дәріхана", hospital: "Аурухана", clinic: "Клиника", supermarket: "Супермаркет", mall: "Сауда орталығы", marketplace: "Базар", toilets: "Дәретхана", hairdresser: "Шаштараз", barber: "Шаштараз", bank: "Банк", atm: "Банкомат", bus_station: "Автобус аялдамасы", bus_stop: "Автобус аялдамасы", parking: "Тұрақ", commercial: "Сауда ғимараты", retail: "Дүкен", yes: "Ғимарат", building: "Ғимарат", residential: "Тұрғын үй", office: "Кеңсе", house: "Үй" };
      const card = document.getElementById("gpcard"), pg = L.layerGroup().addTo(map);
      map.on("click", async (e) => {
        const at = [e.latlng.lat, e.latlng.lng];
        pg.clearLayers(); L.circleMarker(at, { radius: 7, color: "#fff", weight: 3, fillColor: "#e8730c", fillOpacity: 1, interactive: false }).addTo(pg);
        card.innerHTML = '<div class="gcard"><p class="rtp-n">Ақпарат ізделуде…</p></div>';
        try {
          const r = await (await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&accept-language=en&lat=${at[0]}&lon=${at[1]}`)).json();
          if (r.error) throw new Error(r.error);
          const name = r.name || (r.address && (r.address.building || r.address.tourism || r.address.amenity || r.address.shop)) || r.display_name.split(",")[0], kind = KIND[r.type] || KIND[r.category] || (r.type || "").replace(/_/g, " ");
          const addr = r.display_name.split(",").slice(r.name ? 1 : 0, 4).join(",").trim(), pos = [+r.lat, +r.lon];
          card.innerHTML = `<div class="gcard"><button class="gx" id="gcx" aria-label="Жабу">×</button><b>${esc(name)}</b><span class="gk">${esc(kind)}</span><small>${esc(addr)}</small><button class="here gcgo" id="gcgo"><span class="here-i">${ic("nav", 22)}</span><span><b>Осы жерден маршрут</b><small>${tname} дейін ${footOnly ? "жаяу жол" : "жаяу, көлікпен, автобуспен"}</small></span></button></div>`;
          document.getElementById("gcx").onclick = () => { card.innerHTML = ""; pg.clearLayers(); };
          document.getElementById("gcgo").onclick = () => { card.innerHTML = ""; pg.clearLayers(); res.innerHTML = ""; routeFrom(pos, name); document.getElementById("gpout").scrollIntoView({ block: "nearest", behavior: "smooth" }); };
        } catch (err) { card.innerHTML = `<div class="gcard"><button class="gx" id="gcx" aria-label="Жабу">×</button><p class="rtp-n err">Бұл жер туралы ақпарат табылмады.</p><button class="here gcgo" id="gcgo"><span class="here-i">${ic("nav", 22)}</span><span><b>Осы жерден маршрут</b><small>Таңдалған нүктеден ${tname} дейін</small></span></button></div>`; document.getElementById("gcx").onclick = () => { card.innerHTML = ""; pg.clearLayers(); }; document.getElementById("gcgo").onclick = () => { card.innerHTML = ""; pg.clearLayers(); routeFrom(at, "Таңдалған нүкте"); }; }
      });
      document.getElementById("gpgo").onclick = search; document.getElementById("gpq").onkeydown = (e) => { if (e.key === "Enter") search(); };
      return { redo: () => { if (lastO) routeFrom(lastO[0], lastO[1]); }, from: routeFrom, has: () => !!lastO };
    };
    if (key === "gate") travel(() => GATE, "Абдулазиз қақпасына");
    if (key === "sai") {
      // Сафаға жол + тірі қадағалау: жүріп келе жатқаныңыз картада көрінеді, қалған қашықтық пен уақыт жаңарып тұрады
      const sp = document.getElementById("sp"); const FIX = { c: [fenceStart].concat(MAQAM_SAFA.slice(1)) }; let wid = null, me = null, acc = null, trail = null, route = FIX, follow = true, lastAt = 0, lastP = null, pts2 = [], done = false;
      const tg = L.layerGroup().addTo(map), rg = L.layerGroup().addTo(map);
      const ui = (html) => { sp.innerHTML = html; };
      const idle = (msg) => { ui(`<button class="here" id="sbeg"><span class="here-i">${ic("nav", 22)}</span><span><b>Сафаға дейін қадағалау</b><small>${msg || "Басыңыз: жүріп келе жатқаныңыз картада көрінеді, қалған жол жаңарып тұрады"}</small></span></button>`); document.getElementById("sbeg").onclick = start; };
      const stop = () => { if (wid !== null) navigator.geolocation.clearWatch(wid); wid = null; tg.clearLayers(); rg.clearLayers(); me = acc = trail = null; pts2 = []; done = false; idle(); };
      const info = (r, a) => { ui(`<div class="gprow"><div class="gpr"><b>${done ? "Сафадасыз ✓" : fmt(r.d)}</b><small>${done ? "Сафаға жеттіңіз" : "қалды"}</small></div>${done ? "" : `<div class="gpr"><b>${mins(r.d)} мин</b><small>жаяу</small></div>`}</div><p class="rtp-n">Дәлдік ≈ ${Math.round(a)} м. Көк нүкте — сіз. Қызғылт сары сызықпен жүріңіз.</p><div class="gprow"><button class="gpr" id="sfol"><b>${follow ? "Қадағалап тұр" : "Орталықтау"}</b><small>карта сізбен жүреді</small></button><button class="gpr" id="sstop"><b>Тоқтату</b><small>қадағалауды өшіру</small></button></div>`); document.getElementById("sfol").onclick = () => { follow = true; if (me) map.panTo(me.getLatLng()); info(r, a); }; document.getElementById("sstop").onclick = stop; };
      const onPos = async (g) => {
        const p = [g.coords.latitude, g.coords.longitude], a = g.coords.accuracy || 20, now = Date.now();
        if (!me) { me = L.circleMarker(p, { radius: 9, color: "#fff", weight: 3, fillColor: "#2f7cff", fillOpacity: 1, interactive: false, pane: "markerPane" }).addTo(tg); acc = L.circle(p, { radius: a, color: "#2f7cff", weight: 1, fillOpacity: 0.12, interactive: false }).addTo(tg); trail = L.polyline([p], { color: "#2f7cff", weight: 4, opacity: 0.7, interactive: false }).addTo(tg); }
        me.setLatLng(p); acc.setLatLng(p); acc.setRadius(a); pts2.push(p); trail.setLatLngs(pts2);
        if (follow) map.panTo(p, { animate: true });
        const dS = hav(p, SAFA);
        if (dS < 30) { done = true; info({ d: 0 }, a); return; }
        // қалған жол: жолдың ең жақын нүктесінен соңына дейін
        const rem = (() => { const c = route.c; let k = 0, best = 1e9; c.forEach((q, i) => { const d = hav(p, q); if (d < best) { best = d; k = i; } }); return { d: best + len(c.slice(k)) }; })();
        info(rem, a);
      };
      const start = () => {
        if (!navigator.geolocation) return idle("Бұл құрылғы орынды анықтай алмайды");
        ui('<p class="rtp-n">Орныңыз анықталуда…</p>'); done = false; follow = true; lastP = null;
        map.on("dragstart", () => { follow = false; });
        wid = navigator.geolocation.watchPosition(onPos, (e) => { idle(e.code === 1 ? "Орынға рұқсат берілмеді. Баптауда рұқсат беріп, қайта басыңыз" : "Орын анықталмады. Ашық жерге шығып, қайта басыңыз"); }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 });
      };
      idle();
    }
    const pn = document.getElementById("rtp");
    if (on(["hair"])) {
      // шаштараздың үстін басқанда: Мәруадан сол шаштаразға және одан қонақүйге жол көрсетіледі
      const hg = L.layerGroup().addTo(map); let sel = best, own = false, tv = null, extra = null;
      const draw = (go) => {
        hg.clearLayers();
        if (!own) {
        BARB.filter((b) => b !== sel).forEach((b) => [b.toM].forEach((r) => L.polyline(r.c, { color: "#9a8f86", weight: 3, opacity: 0.6, dashArray: "4 6", interactive: false }).addTo(hg)));
        if (sel.alt) { L.polyline(sel.alt.c, { color: "#8e44ad", weight: 4, opacity: 0.55, dashArray: "2 8", lineCap: "round", interactive: false }).addTo(hg); L.marker(sel.alt.c[Math.floor(sel.alt.c.length / 2)], { interactive: false, icon: L.divIcon({ className: "", html: `<div class="rtl alt">балама · ${fmt(sel.alt.d)} · ${mins(sel.alt.d)} мин</div>`, iconSize: [0, 0] }) }).addTo(hg); }
        [[sel.toM, "#8e44ad"]].forEach(([r, col]) => { L.polyline(r.c, { color: "#fff", weight: 10, lineCap: "round", lineJoin: "round", interactive: false }).addTo(hg); L.polyline(r.c, { color: col, weight: 5, lineCap: "round", lineJoin: "round", interactive: false }).addTo(hg); L.marker(r.c[Math.floor(r.c.length / 2)], { interactive: false, icon: L.divIcon({ className: "", html: `<div class="rtl" style="background:${col}">${fmt(r.d)} · ${mins(r.d)} мин</div>`, iconSize: [0, 0] }) }).addTo(hg); arrows(r.c, col, hg); });
        }
        MAKKAH_BARB.forEach(([la, lo, nm]) => num(6, [la, lo], extra && extra.p[0] === la && extra.p[1] === lo ? (nm || "Шаштараз") + " · Таңдалған" : nm || "Шаштараз", extra && extra.p[0] === la && extra.p[1] === lo ? "#16a34a" : "#9a8f86", hg).on("click", () => { extra = { p: [la, lo], nm }; if (!own) own = true; draw(false); tv.has() ? tv.redo() : tv.from(MARWA, "Мәруа"); }));
        BARB.forEach((b) => num(6, b.p, b === sel && !extra ? "Шаштараз" + (b === best ? " · Ұсынылған" : " · Таңдалған") : "Шаштараз", b === sel && !extra ? "#16a34a" : "#8e44ad", hg).on("click", () => { sel = b; extra = null; draw(true); if (own && tv) tv.redo(); }));
        if (pn) pn.querySelectorAll(".rtb").forEach((el, i) => el.classList.toggle("sel", BARB[i] === sel));
        if (go && !own) map.fitBounds(L.latLngBounds(sel.toM.c).pad(0.25), { maxZoom: 18 });
      };
      draw(false); if (document.getElementById("gp")) tv = travel(() => (extra ? extra.p : sel.p), "шаштаразға", () => { if (!own) { own = true; draw(false); } }, true);
      map.__hairPick = (i) => { sel = BARB[i]; draw(true); };
    }
    const all = [].concat(...cur.map((sg) => sg.c), pts), fit = () => { map.invalidateSize(); map.fitBounds(L.latLngBounds(all).pad(key === "tawaf" ? 0.25 : 0.18), { maxZoom: key === "maqam" ? 20 : 19 }); };
    fit(); setTimeout(fit, 120); setTimeout(fit, 500);
    if (!pn) return;
    const tot = SEG.reduce((a, sg) => a + (sg.noArr || sg.tail ? 0 : sg.d), 0);
    pn.innerHTML = `<div class="rtp-h"><b>Умра маршруты</b><span>Жаяу · ${fmt(tot)} · ≈ ${mins(tot)} мин</span></div>`
      + SEG.map((sg, i) => `<button class="rts" data-i="${i}"><i style="background:${sg.col}">${sg.lab}</i><span><b>${sg.t}</b><small>${sg.en}</small></span><em>${fmt(sg.d)}<small>${sg.tail || mins(sg.d) + " мин"}</small></em></button>`).join("")
      + `<div class="rtp-h sub"><b>Шаштараздар (OSM)</b></div>`
      + BARB.map((b, i) => { return `<button class="rtb ${b === best ? "rec" : ""}" data-b="${i}"><i>6</i><span><b>Шаштараз ${i + 1}${b === best ? ' <u>Ұсынылған · Recommended Route</u>' : ""}</b><small>Мәруадан ${fmt(b.toM.d)} · ${mins(b.toM.d)} мин </small><small>Атауы мен жұмыс уақыты картада көрсетілмеген</small></span></button>`; }).join("")
      + `<p class="rtp-n">Шаш алу орындары — OpenStreetMap-та «шаштараз» деп белгіленген нүктелер: көбінің атауы мен жұмыс уақыты жоқ, бар-жоғын орнында тексеріңіз. Жаяу жолдар — OSM деректері бойынша есептелген, жабық жолдар мен адам тығыздығы ескерілмейді. </p>`;
    pn.querySelectorAll(".rts").forEach((b) => (b.onclick = () => map.fitBounds(L.latLngBounds(SEG[+b.dataset.i].c).pad(0.35))));
    pn.querySelectorAll(".rtb").forEach((b) => (b.onclick = () => map.__hairPick(+b.dataset.b)));
  }
  function initMap(key) {
    const el = document.getElementById("mapv"); if (!el) return;
    if (typeof L === "undefined") { el.innerHTML = '<p class="mapmsg">Картаны жүктеу үшін интернет қажет.</p>'; return; }
    if (leafMap) { leafMap.remove(); leafMap = null; }
    const map = leafMap = window.__umrahMap = L.map(el, { zoomControl: false, attributionControl: false, maxZoom: 21 }).setView([21.4228, 39.8268], 17);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxNativeZoom: 19, maxZoom: 21, attribution: "© OpenStreetMap" }).addTo(map);
    L.control.zoom({ position: "topright" }).addTo(map);
    // Бәдәл ұмра: Айша анамыздың мешіті (Тәнғим) барлық картада көрінеді + жылдам ауысу түймелері
    if (BADAL) {
      const AISHA_P = [21.4677052, 39.8013681], HARAM_P = [21.4228, 39.8268];
      L.marker(AISHA_P, { icon: L.divIcon({ className: "", html: '<div class="mp"><i style="background:#16a34a"></i><b>Айша анамыздың мешіті</b></div>', iconSize: [10, 10], iconAnchor: [5, 5] }) }).addTo(map);
      const jump = L.control({ position: "topleft" });
      jump.onAdd = () => { const d = L.DomUtil.create("div", "bdjump"); d.innerHTML = `<button type="button" data-j="a">🕌 Айша мешіті</button><button type="button" data-j="h">🕋 Әл-Харам</button>`; L.DomEvent.disableClickPropagation(d); d.onclick = (e) => { const j = e.target.dataset && e.target.dataset.j; if (j) map.flyTo(j === "a" ? AISHA_P : HARAM_P, j === "a" ? 16 : 17, { duration: 1.2 }); }; return d; };
      jump.addTo(map);
    }
    // Қағба аймағының нақты контурлары
    const G = KAABA_GEO, poly = (pts, o) => L.polygon(pts, Object.assign({ interactive: false }, o)).addTo(map);
    L.polyline(G.tawaf, { color: "#2f7cff", weight: 3, opacity: 0.55, dashArray: "2 7", lineCap: "round", interactive: false }).addTo(map);
    poly(G.hijr, { color: "#8d7f70", weight: 2, fillColor: "#fffdf8", fillOpacity: 0.95 });
    poly(G.kaaba, { color: "#000", weight: 2, fillColor: "#10201c", fillOpacity: 1 });
    poly(G.maqam, { color: "#a97a3a", weight: 2, fillColor: "#e0b050", fillOpacity: 1 });
    L.polyline(G.start.slice(0, 2), { color: "#16a34a", weight: 5, lineCap: "round", interactive: false }).addTo(map);
    L.marker(G.start[1], { interactive: false, zIndexOffset: 700, icon: L.divIcon({ className: "", html: '<div class="mp"><i style="background:#16a34a"></i><b>Жасыл сызық</b></div>', iconSize: [10, 10], iconAnchor: [5, 5] }) }).addTo(map);
    const det = L.layerGroup();
    KAABA_PTS.filter(() => key === "tawaf").forEach(([name, p, col, pos]) => L.marker(p, { interactive: false, icon: L.divIcon({ className: "", html: `<div class="mp ${pos || ""}"><i style="background:${col}"></i><b>${name}</b></div>`, iconSize: [10, 10], iconAnchor: [5, 5] }) }).addTo(det));
    const showDet = () => (map.getZoom() >= 20 ? det.addTo(map) : det.remove());
    map.on("zoomend", showDet); showDet();
    // Ибраһим мақамының артындағы қоршалған 2 рәкәт намаз орны: Қағба есігі → Мақам → қоршау бір түзуде (есікке қарама-қарсы)
    const K = KAABA_DOOR, Mq = [21.4225789, 39.8263055], mLat = 111320, mLon = 111320 * Math.cos(21.4225 * Math.PI / 180);
    const ax = [(Mq[1] - K[1]) * mLon, (Mq[0] - K[0]) * mLat], al = Math.hypot(ax[0], ax[1]), u = [ax[0] / al, ax[1] / al], v = [-u[1], u[0]]; // м: [шығыс, солтүстік]
    const at = (d, w) => [Mq[0] + (u[1] * d + v[1] * w) / mLat, Mq[1] + (u[0] * d + v[0] * w) / mLon];
    const PR = [at(7, -8), at(7, 8), at(23, 8), at(23, -8)];
    if (key === "maqam" || key === "sai") {
    L.polygon(PR, { color: "#fff", weight: 9, fillOpacity: 0, interactive: false }).addTo(map);
    L.polygon(PR, { color: "#7a4a1c", weight: 5, dashArray: "1 7", lineCap: "round", fillColor: "#bfe9cf", fillOpacity: 0.55, interactive: false }).addTo(map);
    L.polygon(PR, { color: "#7a4a1c", weight: 1.5, fillOpacity: 0, interactive: false }).addTo(map);
    L.marker(at(30, 0), { interactive: false, icon: L.divIcon({ className: "", html: '<div class="prayz"><b>2 рәкәт намаз</b><small>қоршау ішінде</small></div>', iconSize: [0, 0] }) }).addTo(map);
    }
    if (key && key !== "badal") overview(map, at(15, 0), key, at); // жалпы картада (кілтсіз) маршруттар жоқ: тек карта, Қағба аймағы және орындар
    else map.setView([21.4228, 39.8268], 17);
    // Қонақүй, дүкен және т.б. орындар: Әл-Харам маңы кіріктірілген, Меккенің қалған бөлігі және одан тыс жерлер картаны жылжытқанда OSM-тен тікелей жүктеледі
    const pb = document.getElementById("fns"), fnb = document.getElementById("fnb");
    if (pb) {
      const nbl = L.layerGroup(), RAD = 6371000, rd = (x) => (x * Math.PI) / 180;
      const dist = (a1, o1, a2, o2) => { const dl = rd(a2 - a1), dn = rd(o2 - o1), h = Math.sin(dl / 2) ** 2 + Math.cos(rd(a1)) * Math.cos(rd(a2)) * Math.sin(dn / 2) ** 2; return 2 * RAD * Math.asin(Math.sqrt(h)); };
      const ALLB = OV_BARB.map((b) => [b.p[0], b.p[1]]).concat(MAKKAH_BARB.map((b) => [b[0], b[1]]));
      const nearBarbers = (la, lo) => ALLB.map(([a2, o2]) => ({ la: a2, lo: o2, d: dist(la, lo, a2, o2) })).filter((x) => x.d <= 3000).sort((x, y) => x.d - y.d).slice(0, 3);
      const mapEl = map.getContainer(), on = new Set(key ? [] : ["h", "s", "f", "p", "w", "m", "c"]), groups = {}, seen = new Set(), cells = new Set();
      POI_CATS.forEach(([k]) => (groups[k] = L.layerGroup()));
      const esc2 = (t) => String(t).replace(/</g, "&lt;");
      const add = (k, la, lo, nm) => {
        const id = k + la.toFixed(5) + lo.toFixed(5); if (seen.has(id) || !groups[k]) return; seen.add(id);
        const [, kk, em, col] = POI_CATS.find((c) => c[0] === k);
        const mk = L.marker([la, lo], { zIndexOffset: -200, icon: L.divIcon({ className: "", html: `<div class="poi" style="--c:${col}"><i>${em}</i>${nm ? `<b>${esc2(nm)}</b>` : ""}</div>`, iconSize: [0, 0] }) });
        if (k === "h") {
          // қонақүйді басқанда: оған ең жақын шаштараздар (OSM, түзу сызықпен) тізімі және картада сызықтар
          mk.bindPopup(() => { const near = nearBarbers(la, lo); return `<b>${esc2(nm || kk)}</b><br>${kk}<div class="nb">${near.length ? "<b>Жақын шаштараздар:</b>" + near.map((x) => `<div>✂️ ${x.d >= 1000 ? (x.d / 1000).toFixed(1).replace(".", ",") + " км" : Math.round(x.d / 10) * 10 + " м"} <small>(түзу сызықпен)</small></div>`).join("") : "Жақын жерде картада шаштараз белгіленбеген."}</div>`; });
          mk.on("popupopen", () => { nbl.clearLayers(); nearBarbers(la, lo).forEach((x) => { L.polyline([[la, lo], [x.la, x.lo]], { color: "#8e44ad", weight: 3, dashArray: "5 6", interactive: false }).addTo(nbl); L.circleMarker([x.la, x.lo], { radius: 8, color: "#fff", weight: 2, fillColor: "#8e44ad", fillOpacity: 1, interactive: false }).addTo(nbl); }); nbl.addTo(map); });
          mk.on("popupclose", () => nbl.clearLayers());
        } else mk.bindPopup(`<b>${esc2(nm || kk)}</b><br>${kk}`);
        mk.addTo(groups[k]);
      };
      // шаштараздар: OSM-тегі барлық нүктелер; «дүкен» ішінде қайталанбау үшін шаштаразға жақын (≤25 м) дүкен нүктелері өткізіледі
      ALLB.forEach(([la, lo], i) => add("c", la, lo, i < OV_BARB.length ? "" : MAKKAH_BARB[i - OV_BARB.length][2] || ""));
      POI.forEach(([k, la, lo, nm]) => { if (k === "s" && ALLB.some((b) => dist(la, lo, b[0], b[1]) < 25)) return; add(k, la, lo, nm); });
      const sync = () => { if (!map._loaded) return; POI_CATS.forEach(([k]) => (on.has(k) ? groups[k].addTo(map) : groups[k].remove())); };
      pb.innerHTML = `<div class="fns-h"><b id="fnst">Іздеу</b><button id="fnsx" aria-label="Жабу">×</button></div><div id="pane-s" class="fpane">
        <div class="fns-s"><input id="fsq" type="search" placeholder="Орын немесе мекенжай іздеу" autocomplete="off" enterkeyhint="search"><button id="fsgo" aria-label="Іздеу">🔍</button></div><div id="fsres"></div>
        <button class="fnrow" id="fsme"><i>📍</i><span><b>Менің орным</b><small>Картада орныңызды көрсету</small></span></button>
        <div class="fns-t">Орындар</div><div class="fgrid">${POI_CATS.map(([k, kk, em]) => `<button class="poic" data-k="${k}"><i>${em}</i>${kk}</button>`).join("")}</div><span class="poist" id="poist"></span></div><div id="pane-p" class="fpane" hidden></div>`;
      if (!key || key === "badal") routePlanner(map, pb.querySelector("#pane-p"), key === "badal" ? { to: ["Айша анамыздың мешіті (Тәнғим)", [21.4677052, 39.8013681]] } : null);
      // екі кладка: Іздеу және Жүру жолы (астыңғы екі түйме); белсенді түймені қайта бассаңыз тақта жабылады
      const fnp = document.getElementById("fnp"), tabs2 = [[fnb, "s", "Іздеу"], [fnp, "p", "Жүру жолы"]].filter((x) => x[0]);
      pb.dataset.t = "s";
      pb.__sync = () => { tabs2.forEach(([b, t]) => b.classList.toggle("on", !pb.hidden && pb.dataset.t === t)); pb.querySelector("#pane-s").hidden = pb.dataset.t !== "s"; const pp = pb.querySelector("#pane-p"); if (pp) pp.hidden = pb.dataset.t !== "p"; document.getElementById("fnst").textContent = pb.dataset.t === "p" ? "Жүру жолы" : "Іздеу"; };
      tabs2.forEach(([b, t]) => (b.onclick = () => { if (!pb.hidden && pb.dataset.t === t) pb.hidden = true; else { pb.hidden = false; pb.dataset.t = t; } pb.__sync(); }));
      document.getElementById("fnsx").onclick = () => { pb.hidden = true; pb.__sync(); };
      if (key === "badal") { pb.hidden = false; pb.dataset.t = "p"; pb.__sync(); }
      document.getElementById("fsme").onclick = () => { if (map.__locate) map.__locate(); pb.hidden = true; pb.__sync(); };
      const fsr = document.getElementById("fsres"), fsearch = async () => {
        const q = document.getElementById("fsq").value.trim(); if (!q) return; fsr.innerHTML = '<p class="rtp-n">Ізделуде…</p>';
        try { const r = await (await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&accept-language=en&bounded=1&viewbox=39.60,21.60,40.05,21.15&q=${encodeURIComponent(q)}`)).json();
          fsr.innerHTML = r.length ? r.map((x, i) => `<button class="hit" data-i="${i}"><b>${esc2(x.name || x.display_name.split(",")[0])}</b><small>${esc2(x.display_name.split(",").slice(1, 3).join(","))}</small></button>`).join("") : '<p class="rtp-n">Табылмады. Атын ағылшынша жазып көріңіз.</p>';
          fsr.querySelectorAll(".hit").forEach((b) => (b.onclick = () => { const x = r[+b.dataset.i]; map.setView([+x.lat, +x.lon], 18); L.marker([+x.lat, +x.lon]).addTo(map).bindPopup(`<b>${esc2(x.name || x.display_name.split(",")[0])}</b>`).openPopup(); fsr.innerHTML = ""; pb.hidden = true; fnb.classList.remove("on"); }));
        } catch (e) { fsr.innerHTML = '<p class="rtp-n err">Интернет жоқ па? Қайта көріңіз.</p>'; }
      };
      document.getElementById("fsgo").onclick = fsearch; document.getElementById("fsq").onkeydown = (e) => { if (e.key === "Enter") fsearch(); };
      const mark = () => pb.querySelectorAll(".poic").forEach((b) => b.classList.toggle("on", on.has(b.dataset.k)));
      pb.querySelectorAll(".poic").forEach((b) => (b.onclick = () => { on.has(b.dataset.k) ? on.delete(b.dataset.k) : on.add(b.dataset.k); mark(); sync(); }));
      const zc = () => mapEl.classList.toggle("zhi", map.getZoom() >= 18); map.on("zoomend", zc); zc(); mark(); sync();
      // Тікелей жүктеу: 0,02° торлар (≈2 км); бір рет жүктелген тор қайта сұралмайды
      const catOf = (t) => (t.tourism === "hotel" ? "h" : t.highway === "bus_stop" ? "u" : t.shop === "hairdresser" || t.shop === "barber" || t.amenity === "barber" ? "c" : t.shop ? "s" : { barber: "c", restaurant: "f", fast_food: "f", cafe: "f", pharmacy: "p", hospital: "m", clinic: "m", toilets: "w", atm: "b", bank: "b", drinking_water: "d", marketplace: "s", place_of_worship: "k" }[t.amenity] || null);
      const EP = ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
      const st = document.getElementById("poist"); let busyP = false, tmr = null;
      const loadCell = async (cx, cy) => {
        const S = (cy * 0.02).toFixed(2), W = (cx * 0.02).toFixed(2), N = ((cy + 1) * 0.02).toFixed(2), E = ((cx + 1) * 0.02).toFixed(2), bb = `${S},${W},${N},${E}`;
        const q = `[out:json][timeout:40];(nwr["tourism"="hotel"]["name"](${bb});nwr["shop"](${bb});nwr["amenity"~"^(restaurant|fast_food|cafe|pharmacy|hospital|clinic|toilets|atm|bank|drinking_water|marketplace)$"](${bb});nwr["highway"="bus_stop"](${bb});nwr["amenity"="place_of_worship"]["name"](${bb}););out center tags 1500;`;
        for (const ep of EP) { try { const r = await fetch(ep + "?data=" + encodeURIComponent(q)); if (!r.ok) continue; const d = await r.json(); d.elements.forEach((e) => { const k = catOf(e.tags || {}), c = e.center || e; if (k && c.lat) add(k, c.lat, c.lon, (e.tags["name:en"] || e.tags.name || "").slice(0, 48)); }); return true; } catch (e) { /* келесі сервер */ } }
        return false;
      };
      const loadView = async () => {
        if (busyP || map.getZoom() < 14) { if (st) st.textContent = map.getZoom() < 14 ? "Орындарды көру үшін жақындатыңыз" : ""; return; }
        const b = map.getBounds(), need = [];
        for (let cx = Math.floor(b.getWest() / 0.02); cx <= Math.floor(b.getEast() / 0.02); cx++) for (let cy = Math.floor(b.getSouth() / 0.02); cy <= Math.floor(b.getNorth() / 0.02); cy++) if (!cells.has(cx + "," + cy)) need.push([cx, cy]);
        if (!need.length) { if (st) st.textContent = ""; return; }
        busyP = true; if (st) st.textContent = "Орындар жүктелуде…";
        if (!map._loaded) { busyP = false; return; }
        for (const [cx, cy] of need.slice(0, 4)) { const ok = await loadCell(cx, cy); if (ok) cells.add(cx + "," + cy); }
        busyP = false; if (!map._loaded) return; sync(); if (st) st.textContent = ""; if (need.length > 4) loadView();
      };
      // кіріктірілген Әл-Харам торлары жүктелді деп саналады (қайта сұралмайды)
      map.on("moveend", () => { clearTimeout(tmr); tmr = setTimeout(loadView, 700); }); if (!key) setTimeout(loadView, 1200);
    }
    let me = null;
    map.__locate = () => {
      if (!navigator.geolocation) return toast("Орынды анықтау мүмкін емес");
      navigator.geolocation.getCurrentPosition((g) => { const ll = [g.coords.latitude, g.coords.longitude]; if (me) me.setLatLng(ll); else me = L.circleMarker(ll, { radius: 8, color: "#fff", weight: 3, fillColor: "#2f7cff", fillOpacity: 1 }).addTo(map); map.setView(ll, 18); }, () => toast("Орын анықталмады. Рұқсат беріңіз."), { enableHighAccuracy: true, timeout: 15000 });
    };
  }

  function route() {
    const isB = /^#\/b(\/|$)/.test(location.hash);
    if (isB !== BADAL) { save(); BADAL = isB; CUR_KEY = isB ? KEY + "-badal" : KEY; S = loadS(CUR_KEY); }
    closeSheet(); hideNote();
    if (window.__groupCleanup) { window.__groupCleanup(); window.__groupCleanup = null; }
    if (location.hash !== HB() + "/step/3") { twk = -1; stopAudio(); }
    if (location.hash !== HB() + "/step/5") saiOn = false;
    const parts = location.hash.replace(/^#\/?/, "").split("/");
    if (BADAL) { parts.shift(); if (!parts[0]) parts[0] = "steps"; }
    if (parts[0] === "step" && +parts[1] === 0 && lastI !== 0) ihReset();
    if (parts[0] === "step" && +parts[1] === 1 && lastI !== 1) gpReset();
    if (parts[0] === "step" && MODS[+parts[1]] && +parts[1] > (BADAL ? 0 : 1) && !stepOpen(+parts[1])) { toast("Алдымен алдыңғы қадамды орындаңыз"); const fo = firstOpen(); location.replace(BADAL && fo === 0 ? "#/b/aisha" : HB() + "/step/" + fo); return; }
    if (parts[0] === "step" && MODS[+parts[1]]) {
      const i = +parts[1];
      lastI = i;
      app.innerHTML = detail(i);
      bindDetail(i);
    } else if ((parts[0] || "").split("?")[0] === "group") {
      lastI = -1; window.__groupCleanup = window.UmrahGroup ? window.UmrahGroup.mount(app, { toast, back: "#/" }) : null;
    } else if (parts[0] === "aisha") {
      lastI = -1; app.innerHTML = badalPage();
      const bd = document.getElementById("aisha-done");
      if (bd) bd.onclick = () => { if (!isDone(0)) { S.done.push(0); save(); } location.hash = "#/b/step/1"; };
    } else if (VIDEO_PAGES[parts[0]] && !VIDEO_OPEN) {
      location.replace("#/"); return;
    } else if (VIDEO_PAGES[parts[0]]) {
      lastI = -1; app.innerHTML = videoPage(parts[0]); bindVideo();
    } else if (parts[0] === "map") {
      lastI = -1; app.innerHTML = mapPage(parts[1]); initMap(parts[1]);
    } else if (parts[0] === "steps") {
      lastI = -1; app.innerHTML = list();
      app.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => (location.hash = HB() + "/step/" + b.dataset.go)));
      app.querySelectorAll("[data-aisha]").forEach((b) => (b.onclick = () => (location.hash = "#/b/aisha")));
      app.querySelectorAll("[data-lock]").forEach((b) => (b.onclick = () => toast("Алдымен алдыңғы қадамды орындаңыз")));
      const r = document.getElementById("reset");
      if (r) r.onclick = () => ask("Прогресті тазалайсыз ба?", "Орындалған қадамдар, тауаф мен сағи санағы және ихрам ойыны нөлденеді.", "Иә, тазалау", () => { stopAudio(); hideNote(); S.done = []; S.cnt = {}; twk = -1; saiOn = false; saiPh = 0; ihReset(); gpReset(); save(); toast("Прогресс тазаланды"); route(); });
    } else { lastI = -1; app.innerHTML = landing(); app.querySelectorAll("[data-soon]").forEach((b) => (b.onclick = () => toast("Жақында ашылады"))); const hc = app.querySelector("[data-hostclose=\"1\"]"); if (hc) hc.onclick = (e) => { e.preventDefault(); hostClose(); };  else if (!EMBED) { const bk = app.querySelector(".hero .back"); if (bk) fetch("./agartu.html", { method: "HEAD" }).then((r) => { if (!r.ok) bk.hidden = true; }).catch(() => { bk.hidden = true; }); } }
    window.scrollTo(0, 0);
  }
  function bindDetail(i) {
    app.querySelectorAll("[data-tab]").forEach((b) => (b.onclick = () => openSheet(i, b.dataset.tab)));
    app.querySelectorAll("[data-dua]").forEach((b) => (b.onclick = () => playSeq([b.dataset.dua])));
    bindTw();
    bindSai();
    ihBind(); gpBind();
    bindMark(i);
  }
  window.addEventListener("hashchange", route);
  route();
})();
