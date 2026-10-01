const $ = (selector) => document.querySelector(selector);
const PROGRESS_KEY = "sabaq-progress-v1";
const QURAN_API = "https://api.quran.com/api/v4";

function shuffle(list) { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function pickOptions(correct, pool, count) { const rest = shuffle(pool.filter((x) => x !== correct)).slice(0, count - 1); return shuffle([correct, ...rest]); }
function escapeText(text) { return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c])); }
function localDate(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function toast(message) { const el = $("#sabaq-toast"); el.textContent = message; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 1800); }

function speak(letter) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const phrase = new SpeechSynthesisUtterance(letter);
  phrase.lang = "ar-SA"; phrase.rate = 0.72;
  window.speechSynthesis.speak(phrase);
}
function pad3(n) { return String(n).padStart(3, "0"); }
function everyAyahUrl(verseKey) { const [s, a] = verseKey.split(":").map(Number); return `https://everyayah.com/data/Alafasy_128kbps/${pad3(s)}${pad3(a)}.mp3`; }
function playAudioUrl(url) { const audio = new Audio(url); audio.addEventListener("error", () => toast("Аудио қолжетімсіз")); audio.play().catch(() => toast("Аудио қолжетімсіз")); }
function playStepAudio(step) { if (step.quranAudio) playAudioUrl(everyAyahUrl(step.quranAudio)); else if (step.audioLetter) speak(step.audioLetter); else if (step.letter) speak(step.letter); }

/* ---------------- Alphabet track ---------------- */

const LETTER_NAMES = { ا: "әлиф", ب: "бә", ت: "тә", ث: "сә", ج: "жим", ح: "хә", خ: "ха", د: "дәл", ذ: "зәл", ر: "ра", ز: "зәй", س: "син", ش: "шин", ص: "сад", ض: "дад", ط: "та", ظ: "за", ع: "айн", غ: "ғайн", ف: "фә", ق: "қaф", ك: "кәф", ل: "ләм", م: "мим", ن: "нун", ه: "һә", و: "уәу", ي: "йә" };
const ALPHABET_GROUPS = [["ا", "ب", "ت", "ث"], ["ج", "ح", "خ", "د"], ["ذ", "ر", "ز", "س"], ["ش", "ص", "ض", "ط"], ["ظ", "ع", "غ", "ف"], ["ق", "ك", "ل", "م"], ["ن", "ه", "و", "ي"]];
const ALL_LETTERS = ALPHABET_GROUPS.flat();
const CONSONANTS = [{ l: "ب", s: "б" }, { l: "ت", s: "т" }, { l: "م", s: "м" }, { l: "ن", s: "н" }, { l: "ل", s: "л" }, { l: "س", s: "с" }, { l: "ر", s: "р" }, { l: "ف", s: "ф" }];
const VOWELS = [{ mark: "َ", v: "а" }, { mark: "ِ", v: "и" }, { mark: "ُ", v: "у" }];
const TANWIN = [{ mark: "ً", suf: "ан" }, { mark: "ٍ", suf: "ин" }, { mark: "ٌ", suf: "ун" }];

function buildLetterUnit(group, idx) {
  const steps = [];
  group.forEach((letter) => steps.push({ type: "teach", kicker: "ЖАҢА ӘРІП", title: "Әріппен танысыңыз", letter, name: LETTER_NAMES[letter], desc: `Бұл — <b>${LETTER_NAMES[letter]}</b> әрпі. Дыбысын тыңдап, дауыстап қайталаңыз.` }));
  group.forEach((letter) => steps.push({ type: "mcq", kicker: "АТЫН ТАҢДАҢЫЗ", title: "Бұл әріптің аты қалай аталады?", promptArabic: letter, options: pickOptions(letter, ALL_LETTERS, 4).map((l) => LETTER_NAMES[l]), correct: LETTER_NAMES[letter] }));
  group.forEach((letter) => steps.push({ type: "mcq", kicker: "ТЫҢДАП ТАҢДАҢЫЗ", title: "Дыбысталған әріпті табыңыз", audioLetter: letter, options: pickOptions(letter, ALL_LETTERS, 4), correct: letter, arabicOptions: true }));
  return { id: `alpha-letters-${idx}`, track: "alphabet", unitTitle: "Әріптер", trackIcon: group[0], title: `${idx + 1}-топ: ${group.join(" ")}`, subtitle: group.map((l) => LETTER_NAMES[l]).join(", "), steps };
}

function buildHarakatLesson() {
  const steps = [
    { type: "teach", kicker: "ДЫБЫС БЕЛГІСІ", title: "Фатха — үстіңгі сызықша", letter: "بَ", letterSmall: true, name: "Фатха ( ـَ )", desc: "Әріптің үстіне қойылған қиғаш сызықша <b>«а»</b> дыбысын қосады. Мысалы: بَ — «ба»." },
    { type: "teach", kicker: "ДЫБЫС БЕЛГІСІ", title: "Кәсіра — астыңғы сызықша", letter: "بِ", letterSmall: true, name: "Кәсіра ( ـِ )", desc: "Әріптің астына қойылған сызықша <b>«и»</b> дыбысын қосады. Мысалы: بِ — «би»." },
    { type: "teach", kicker: "ДЫБЫС БЕЛГІСІ", title: "Дамма — үстіңгі үтір", letter: "بُ", letterSmall: true, name: "Дамма ( ـُ )", desc: "Әріптің үстіне қойылған кішкене «уау» тәрізді белгі <b>«у»</b> дыбысын қосады. Мысалы: بُ — «бу»." }
  ];
  const combos = []; CONSONANTS.forEach((c) => VOWELS.forEach((v) => combos.push({ c, v })));
  shuffle(combos).slice(0, 6).forEach(({ c, v }) => steps.push({ type: "mcq", kicker: "ОҚЫҢЫЗ", title: "Бұл буынды қалай оқимыз?", promptArabic: c.l + v.mark, options: shuffle(VOWELS.map((vv) => c.s + vv.v)), correct: c.s + v.v }));
  return { id: "alpha-harakat", track: "alphabet", unitTitle: "Дыбыс ережелері", title: "Харакаттар", subtitle: "Фатха, кәсіра, дамма", steps };
}

function buildTanwinLesson() {
  const steps = [
    { type: "teach", kicker: "ДЫБЫС БЕЛГІСІ", title: "Фатхатайн — ً", letter: "بً", letterSmall: true, name: "Фатхатайн ( ـً )", desc: "Екі қиғаш сызықша соңында жеңіл «н» қосылған «ан» дыбысын білдіреді. Көбіне сөз соңында әліппен бірге жазылады: كِتَابًا («китәбан»)." },
    { type: "teach", kicker: "ДЫБЫС БЕЛГІСІ", title: "Кәсіратайн — ٍ", letter: "بٍ", letterSmall: true, name: "Кәсіратайн ( ـٍ )", desc: "Екі астыңғы сызықша «ин» дыбысын білдіреді. Мысалы: كِتَابٍ («китәбин»)." },
    { type: "teach", kicker: "ДЫБЫС БЕЛГІСІ", title: "Дамматайн — ٌ", letter: "بٌ", letterSmall: true, name: "Дамматайн ( ـٌ )", desc: "Екі үтір тәрізді белгі «ун» дыбысын білдіреді. Мысалы: كِتَابٌ («китәбун»)." }
  ];
  const combos = []; CONSONANTS.forEach((c) => TANWIN.forEach((t) => combos.push({ c, t })));
  shuffle(combos).slice(0, 6).forEach(({ c, t }) => steps.push({ type: "mcq", kicker: "ОҚЫҢЫЗ", title: "Бұл буынды қалай оқимыз?", promptArabic: c.l + t.mark, options: shuffle(TANWIN.map((tt) => c.s + tt.suf)), correct: c.s + t.suf }));
  return { id: "alpha-tanwin", track: "alphabet", unitTitle: "Дыбыс ережелері", title: "Тәнуин", subtitle: "Фатхатайн, кәсіратайн, дамматайн", steps };
}

function buildSukunLesson() {
  return {
    id: "alpha-sukun", track: "alphabet", unitTitle: "Дыбыс ережелері", title: "Сукун", subtitle: "Дауыссыз тоқтату белгісі",
    steps: [
      { type: "teach", kicker: "ДЫБЫС БЕЛГІСІ", title: "Сукун — дыбыссыз белгі", letter: "بْ", letterSmall: true, name: "Сукун ( ـْ )", desc: "Әріптің үстіне қойылған кішкене шеңбер дауысты дыбыс қоспайды — әріп қысқа, тоқтай айтылады. Мысалы: مَنْ — «ман»." },
      { type: "teach", kicker: "ДЫБЫС БЕЛГІСІ", title: "Сукун сөз ортасында", desc: "Сукун көбіне буындарды ажыратып, дауыссыз дыбыстардың қатар келуіне мүмкіндік береді. Мысалы: يَكْتُبُ сөзіндегі ك әрпінде сукун бар." },
      { type: "mcq", title: "مَنْ сөзінің соңындағы белгі қалай аталады?", options: shuffle(["Сукун", "Фатха", "Тәнуин", "Шадда"]), correct: "Сукун" },
      { type: "mcq", title: "Сукун белгісі дауысты дыбыс қосады ма?", options: shuffle(["Жоқ, дыбыссыз тоқтатады", "Иә, «а» қосады", "Иә, «у» қосады", "Иә, «и» қосады"]), correct: "Жоқ, дыбыссыз тоқтатады" },
      { type: "mcq", title: "Сукун белгісінің таңбасы қандай пішінде?", options: shuffle(["Кішкене шеңбер (ـْ)", "Тік сызықша", "Қиғаш сызықша", "Жұлдызша"]), correct: "Кішкене шеңбер (ـْ)" }
    ]
  };
}

function buildShaddaLesson() {
  return {
    id: "alpha-shadda", track: "alphabet", unitTitle: "Дыбыс ережелері", title: "Шадда", subtitle: "Әріптің қосарлануы",
    steps: [
      { type: "teach", kicker: "ДЫБЫС БЕЛГІСІ", title: "Шадда — қосарлану белгісі", letter: "مّ", letterSmall: true, name: "Шадда ( ـّ )", desc: "Әріптің үстіндегі кішкене «w» тәрізді белгі сол әріптің <b>қосарланып</b> (екі рет) айтылатынын білдіреді. Мысалы: مُحَمَّد сөзінде م-нің үстінде шадда бар." },
      { type: "teach", kicker: "ДЫБЫС БЕЛГІСІ", title: "Шадда мен харакат бірге", desc: "Шадда харакатпен бірге тұрады: харакат белгісі шаддадан кейін жазылады. Оқығанда дыбыс сәл ұзартылып, күштірек айтылады." },
      { type: "mcq", title: "Шадда белгісі нені білдіреді?", options: shuffle(["Әріптің қосарлануын", "Дыбыстың мүлдем түсіп қалуын", "Созылмалы дауыстыны", "Тоқтап оқуды"]), correct: "Әріптің қосарлануын" },
      { type: "mcq", title: "Шадда бар әріпті оқығанда дыбыс қалай шығады?", options: shuffle(["Күштірек және қосарланып", "Әлсіз және қысқа", "Мұрын арқылы", "Мүлдем үнсіз"]), correct: "Күштірек және қосарланып" },
      { type: "mcq", promptArabic: "مُحَمَّد", title: "Бұл сөзде шадда қай әріпте тұр?", options: shuffle(["م", "ح", "د", "ُ"]), correct: "م", arabicOptions: true }
    ]
  };
}

function buildMaddLettersLesson() {
  return {
    id: "alpha-madd", track: "alphabet", unitTitle: "Дыбыс ережелері", title: "Мад әріптері", subtitle: "Созылмалы дауыстылар: ا و ي",
    steps: [
      { type: "teach", kicker: "СОЗЫЛМАЛЫ ДАУЫСТЫ", title: "Фатха + Әліп (ا) = ұзын «а»", letter: "قَالَ", ayah: true, name: "Мысалы: قَالَ — «қаала»", desc: "Фатхадан кейін тыныш әліп (ا) келсе, дыбыс ұзарып, шамамен 2 харакатқа созылады." },
      { type: "teach", kicker: "СОЗЫЛМАЛЫ ДАУЫСТЫ", title: "Дамма + Уау (و) = ұзын «у»", letter: "يَقُولُ", ayah: true, name: "Мысалы: يَقُولُ — «яқуулу»", desc: "Даммадан кейін тыныш уау (و) келсе, дыбыс «уу» болып созылады." },
      { type: "teach", kicker: "СОЗЫЛМАЛЫ ДАУЫСТЫ", title: "Кәсіра + Я (ي) = ұзын «и»", letter: "قِيلَ", ayah: true, name: "Мысалы: قِيلَ — «қиила»", desc: "Кәсірадан кейін тыныш я (ي) келсе, дыбыс «ии» болып созылады." },
      { type: "mcq", title: "Мад (созылу) жасайтын үш әріпті таңдаңыз", options: shuffle(["ا و ي", "ب ت ث", "ء ه ع", "م ن و"]), correct: "ا و ي" },
      { type: "mcq", title: "قَالَ сөзінде қай әріп созылу жасайды?", options: shuffle(["ا", "ق", "ل", "َ"]), correct: "ا", arabicOptions: true },
      { type: "mcq", title: "Мад табии әдетте нешe харакатқа созылады?", options: shuffle(["2", "6", "4", "1"]), correct: "2" }
    ]
  };
}

function buildJoiningLesson() {
  return {
    id: "alpha-joining", track: "alphabet", unitTitle: "Дыбыс ережелері", title: "Әріптердің жалғасуы", subtitle: "Жеке, басы, ортасы, аяғы",
    steps: [
      { type: "teach-forms", kicker: "ЖАЗЫЛУ ТҮРЛЕРІ", title: "Әріп 4 түрлі жазылады", letter: "ب", desc: "Арабша әріптер сөз ішіндегі орнына қарай пішінін өзгертеді: жеке тұрғанда, сөз басында, ортасында және аяғында." },
      { type: "teach", kicker: "ЕРЕКШЕЛІК", title: "Жалғаспайтын 6 әріп", desc: "ا د ذ ر ز و — бұл алты әріп өзінен кейінгі әріппен ешқашан қосылмайды, тек алдыңғы әріппен ғана жалғасады." },
      { type: "mcq", title: "Мына әріптердің қайсысы келесі әріппен жалғаспайды?", options: shuffle(["د", "ب", "م", "ت"]), correct: "د", arabicOptions: true },
      { type: "mcq", title: "Бір әріптің неше жазылу түрі болуы мүмкін?", options: shuffle(["4", "2", "3", "1"]), correct: "4" }
    ]
  };
}

function buildAlphabetLessons() { return [...ALPHABET_GROUPS.map(buildLetterUnit), buildHarakatLesson(), buildTanwinLesson(), buildSukunLesson(), buildShaddaLesson(), buildMaddLettersLesson(), buildJoiningLesson()]; }

/* ---------------- Tajweed track ---------------- */

function buildTajweedLessons() {
  return [
    {
      id: "tw-intro", track: "tajweed", unitTitle: "Кіріспе", title: "Тәжуидке кіріспе", subtitle: "Мақсаты және мақаридж негіздері",
      steps: [
        { type: "teach", kicker: "НЕГІЗ", title: "Тәжуид дегеніміз не?", desc: "Тәжуид — Құранды әр әріпті өз орнынан (мақаридж) және өз сипатымен (сыфат) айтып, дұрыс оқу ілімі. Алла Тағала Құранда «Құранды ашық әрі анық оқы» (Муззаммил сүресі, 4-аят) деп бұйырады." },
        { type: "teach", kicker: "НЕГІЗ", title: "Мақаридждің 5 негізгі тобы", desc: "<b>Әл-жауф</b> — ауыз қуысы (созылмалы дауыстылар). <b>Әл-халқ</b> — көмей: терең (ء ه), орта (ع ح), таяу (غ خ). <b>Әл-лисан</b> — тіл (әріптердің көбі). <b>Әш-шафатан</b> — еріндер (و ب م ف). <b>Әл-хайшум</b> — мұрын қуысы (ғұнна)." },
        { type: "mcq", title: "Тәжуид ілімінің негізгі мақсаты қандай?", options: shuffle(["Құранды дұрыс, өз ережесімен оқу", "Құранды жаттау жылдамдығын арттыру", "Арабша сөйлеуді үйрену", "Каллиграфия үйрену"]), correct: "Құранды дұрыс, өз ережесімен оқу" },
        { type: "mcq", title: "Неше негізгі мақаридж тобы бар?", options: shuffle(["5", "3", "4", "6"]), correct: "5" },
        { type: "mcq", title: "ء және ه әріптері көмейдің қай бөлігінен шығады?", options: shuffle(["Терең бөлігінен", "Орта бөлігінен", "Таяу бөлігінен", "Тілден"]), correct: "Терең бөлігінен" }
      ]
    },
    {
      id: "tw-nun-izhar", track: "tajweed", unitTitle: "Нұн және мим сәкин ережелері", title: "Нұн сәкин: Изхар", subtitle: "Көмей әріптерінің алдында",
      steps: [
        { type: "teach", kicker: "ЕРЕЖЕ", title: "Изхар (анықтау)", desc: "Нұн сәкин (ـنْ) немесе тәнуин (ـً ـٍ ـٌ) алты көмей әрпінің алдында келгенде, нұн анық, ғұннасыз оқылады." },
        { type: "teach-forms", kicker: "ӘРІПТЕР", title: "Изхар әріптері", letter: "ء", desc: "Изхар алты әрпі: ء ه ع ح غ خ. Осылардың алдында нұн сәкин анық айтылады." },
        { type: "mcq", title: "نْ немесе тәнуиннен кейін ح әрпі келсе, қандай ереже қолданылады?", options: shuffle(["Изхар", "Идғам", "Иқлаб", "Ихфа"]), correct: "Изхар" },
        { type: "mcq", title: "Изхар ережесінде нұн қалай оқылады?", options: shuffle(["Анық, ғұннасыз", "Ғұннамен ұяңдап", "М дыбысына айналып", "Мүлдем түсіп қалып"]), correct: "Анық, ғұннасыз" },
        { type: "mcq", title: "Мына топтың қайсысы изхар әріптеріне жатады?", options: shuffle(["ء ه ع ح غ خ", "ي ر م ل و ن", "ب", "ت ث ج د"]), correct: "ء ه ع ح غ خ" }
      ]
    },
    {
      id: "tw-nun-other", track: "tajweed", unitTitle: "Нұн және мим сәкин ережелері", title: "Идғам, Иқлаб, Ихфа", subtitle: "Нұн сәкиннің қалған 3 ережесі",
      steps: [
        { type: "teach", kicker: "ЕРЕЖЕ", title: "Идғам (қосу)", desc: "Нұн сәкин/тәнуиннен кейін ي ن م و ل ر әріптерінің бірі келсе, нұн сол әріпке сіңіріледі. ي ن م و-да ғұнна сақталады (идғам би-ғұнна), ал ل мен ر-да ғұннасыз қосылады." },
        { type: "teach", kicker: "ЕРЕЖЕ", title: "Иқлаб (айналдыру)", desc: "Нұн сәкин/тәнуиннен кейін ب әрпі келсе, нұн жеңіл ғұннамен «м» дыбысына айналады. Мысалы: مِنۢ بَعْدِ." },
        { type: "teach", kicker: "ЕРЕЖЕ", title: "Ихфа (жасыру)", desc: "Қалған 15 әріптің алдында нұн жасырын, мұрын арқылы ғұннамен оқылады." },
        { type: "mcq", title: "ي ن م و ل ر — бұл әріптер қай ережеге жатады?", options: shuffle(["Идғам", "Изхар", "Иқлаб", "Ихфа"]), correct: "Идғам" },
        { type: "mcq", title: "نْ-дан кейін ب келсе не болады?", options: shuffle(["Дыбыс жеңіл ғұннамен м-ге айналады (иқлаб)", "Изхар болады", "Идғам болады", "Ешнәрсе өзгермейді"]), correct: "Дыбыс жеңіл ғұннамен м-ге айналады (иқлаб)" },
        { type: "mcq", title: "Ихфа ережесінде нұн қанша әріптің алдында жасырын оқылады?", options: shuffle(["15", "6", "1", "28"]), correct: "15" },
        { type: "mcq", title: "ل мен ر әріптерінде идғам қалай оқылады?", options: shuffle(["Ғұннасыз", "Ғұннамен", "Мүлдем оқылмай", "М дыбысымен"]), correct: "Ғұннасыз" }
      ]
    },
    {
      id: "tw-meem", track: "tajweed", unitTitle: "Нұн және мим сәкин ережелері", title: "Мим сәкин ережелері", subtitle: "Ихфа, идғам, изхар шафауи",
      steps: [
        { type: "teach", kicker: "ЕРЕЖЕ", title: "Мим сәкин (مْ) — 3 ереже", desc: "<b>Ихфа шафауи</b> — кейін ب келсе, ерін жабылып, ғұннамен оқылады. <b>Идғам шафауи</b> (мисләйн) — кейін тағы да م келсе, екі мим бір-біріне сіңіп, ғұннамен оқылады. <b>Изхар шафауи</b> — қалған 26 әріптің алдында анық оқылады." },
        { type: "mcq", title: "Мим сәкиннен кейін ب келсе, қандай ереже?", options: shuffle(["Ихфа шафауи", "Идғам шафауи", "Изхар шафауи", "Иқлаб"]), correct: "Ихфа шафауи" },
        { type: "mcq", title: "Мим сәкиннен кейін тағы да мим келсе, не болады?", options: shuffle(["Идғам шафауи — қосылып, ғұннамен оқылады", "Изхар шафауи — анық оқылады", "Ихфа шафауи", "Мим түсіп қалады"]), correct: "Идғам шафауи — қосылып, ғұннамен оқылады" },
        { type: "mcq", title: "Изхар шафауи неше әріптің алдында болады?", options: shuffle(["26", "15", "6", "1"]), correct: "26" }
      ]
    },
    {
      id: "tw-madd", track: "tajweed", unitTitle: "Мад, қалқала және уақыф", title: "Мад ережелері", subtitle: "Мад табии және мад фару",
      steps: [
        { type: "teach", kicker: "ЕРЕЖЕ", title: "Мад табии (табиғи созылу)", desc: "Фатхадан кейін әліп (ا), даммадан кейін уау (و), кәсірадан кейін я (ي) келгенде, дыбыс қалыпты 2 харакат созылады. Мысалы: قَالَ, يَقُولُ, قِيلَ." },
        { type: "teach", kicker: "ЕРЕЖЕ", title: "Мад фару (қосымша созылу)", desc: "Хамза немесе сукунмен байланысты болады: <b>мад ләзим</b> — шаддамен кездессе, әдетте 6 харакат созылады; <b>мад ариз лиссукун</b> — аятты тоқтап оқығанда (уақыф) 2, 4 немесе 6 харакат созылуы мүмкін." },
        { type: "mcq", title: "Мад табии әдетте нешe харакатқа созылады?", options: shuffle(["2", "6", "4", "1"]), correct: "2" },
        { type: "mcq", title: "Мад табиидің үш әрпін атаңыз", options: shuffle(["ا و ي", "ب ت ث", "ء ه ع", "م ن و"]), correct: "ا و ي" },
        { type: "mcq", title: "Мад ләзим әдетте нешe харакатқа созылады?", options: shuffle(["6", "2", "4", "1"]), correct: "6" }
      ]
    },
    {
      id: "tw-qalqala", track: "tajweed", unitTitle: "Мад, қалқала және уақыф", title: "Қалқала", subtitle: "Серпінді дыбыстау",
      steps: [
        { type: "teach", kicker: "ЕРЕЖЕ", title: "Қалқала дегеніміз не?", desc: "Сукунмен келген ق ط ب ج د («қаф-та-ба-жим-дал») әріптерін оқығанда, дыбысты сәл серпінмен, жаңғырықпен айту. <b>Кіші қалқала</b> — сөздің ортасында сукун болғанда; <b>үлкен қалқала</b> — аятты сол әріпте тоқтатып оқығанда (уақыфта), серпін күштірек естіледі." },
        { type: "mcq", title: "Қалқала әріптерін таңдаңыз", options: shuffle(["ق ط ب ج د", "ء ه ع ح", "ي ر م ل", "ت ث س ش"]), correct: "ق ط ب ج د" },
        { type: "mcq", title: "Үлкен қалқала қашан болады?", options: shuffle(["Аятты сол әріпте тоқтатып оқығанда", "Сөздің басында", "Тек тәнуинде", "Тек мим сәкинде"]), correct: "Аятты сол әріпте тоқтатып оқығанда" }
      ]
    },
    {
      id: "tw-ra-waqf", track: "tajweed", unitTitle: "Мад, қалқала және уақыф", title: "Лам, Ра және уақыф белгілері", subtitle: "Тафхим, тарқиқ, тоқтау белгілері",
      steps: [
        { type: "teach", kicker: "ЕРЕЖЕ", title: "Алла (لله) сөзіндегі лам", desc: "Фатха немесе даммадан кейін лам ауыр (тафхим) айтылады: قَالَ اللهُ. Ал кәсірадан кейін жеңіл (тарқиқ) айтылады: بِاللهِ." },
        { type: "teach", kicker: "БЕЛГІЛЕР", title: "Уақыф белгілері", desc: "Мұсхафта аятты қай жерде тоқтату/жалғастыру керектігін көрсетеді: <b>مـ</b> — міндетті тоқтау, <b>لا</b> — тоқтамау, <b>ج</b> — тоқтауға болады, <b>قلى</b> — тоқтаған жөн, <b>صلى</b> — жалғастырған жөн." },
        { type: "mcq", title: "بِاللهِ сөзіндегі лам қалай оқылады?", options: shuffle(["Жеңіл (тарқиқ)", "Ауыр (тафхим)", "Мүлдем оқылмайды", "Ғұннамен"]), correct: "Жеңіл (тарқиқ)" },
        { type: "mcq", title: "مـ белгісі нені білдіреді?", options: shuffle(["Міндетті тоқтау", "Тоқтамау", "Тоқтауға болады", "Жалғастырған жөн"]), correct: "Міндетті тоқтау" },
        { type: "mcq", title: "لا белгісі нені білдіреді?", options: shuffle(["Тоқтамау", "Міндетті тоқтау", "Тоқтауға болады", "Тоқтаған жөн"]), correct: "Тоқтамау" }
      ]
    }
  ];
}

/* ---------------- Quran track ---------------- */

const QURAN_META = [
  { id: "quran-fatiha", chapter: 1, title: "Әл-Фатиха сүресі", subtitle: "7 аят • ашушы сүре" },
  { id: "quran-ikhlas", chapter: 112, title: "Әл-Ихлас сүресі", subtitle: "4 аят" },
  { id: "quran-falaq", chapter: 113, title: "Әл-Фәлақ сүресі", subtitle: "5 аят" },
  { id: "quran-nas", chapter: 114, title: "Ән-Нас сүресі", subtitle: "6 аят" },
  { id: "quran-kawthar", chapter: 108, title: "Әл-Кәусар сүресі", subtitle: "3 аят" },
  { id: "quran-nasr", chapter: 110, title: "Ән-Наср сүресі", subtitle: "3 аят" }
];

async function fetchSurahSteps(chapter) {
  const response = await fetch(`${QURAN_API}/verses/by_chapter/${chapter}?language=en&words=true&word_fields=text_uthmani&fields=text_uthmani&per_page=50`);
  if (!response.ok) throw new Error("Сүре жүктелмеді");
  const data = await response.json();
  const steps = [];
  data.verses.forEach((verse) => steps.push({ type: "teach", kicker: "АЯТ", title: `${verse.verse_number}-аят`, letter: verse.text_uthmani, ayah: true, quranAudio: verse.verse_key, desc: "Тыңдап, дауыстап қайталаңыз." }));
  const candidates = data.verses
    .map((verse) => ({ verse, words: (verse.words || []).filter((w) => (w.char_type_name ? w.char_type_name === "word" : true)).map((w) => w.text_uthmani) }))
    .filter((item) => item.words.length >= 2 && item.words.length <= 6);
  shuffle(candidates).slice(0, 2).forEach((item) => steps.push({ type: "order", kicker: "РЕТІН ҚҰРАҢЫЗ", title: `${item.verse.verse_number}-аятты дұрыс ретімен құрастырыңыз`, words: item.words, bankOrder: shuffle(item.words.map((_, i) => i)) }));
  return steps;
}

function buildQuranLessons() {
  const list = QURAN_META.map((meta) => ({ id: meta.id, track: "quran", unitTitle: "Қысқа сүрелер", chapter: meta.chapter, title: meta.title, subtitle: meta.subtitle, steps: null }));
  list.push({
    id: "quran-freeread", track: "quran", unitTitle: "Еркін оқу", title: "Мұсхафпен еркін оқу", subtitle: "Толық Құранды парақтап оқыңыз",
    steps: [
      { type: "cta", kicker: "МҰСХАФ", title: "Құранды парақтап оқу", desc: "Тартил басты бетіндегі мұсхаф арқылы Құранның кез келген бетін аша аласыз, тыңдай аласыз және оқыған беттеріңізді белгілей аласыз.", href: "./agartu.html", linkLabel: "Басты бетке өту" },
      { type: "cta", kicker: "ХАТЫМ", title: "Хатым жоспарын бастаңыз", desc: "604 бетті таңдаған мерзімге бөліп, күнделікті оқу жоспарын автоматты түрде бақылай аласыз.", href: "./agartu.html", linkLabel: "Хатым жоспарын ашу" }
    ]
  });
  return list;
}

/* ---------------- Engine ---------------- */

const TRACK_META = {
  alphabet: { heading: "Әліппе", subheading: "Араб әліппесінің 28 әрпі мен негізгі дыбыс белгілерін үйреніңіз." },
  tajweed: { heading: "Тәжуид", subheading: "Құранды дұрыс оқу ережелерін меңгеріңіз: нұн, мим, мад, қалқала және т.б." },
  quran: { heading: "Құран", subheading: "Қысқа сүрелерден бастап, Құранды еркін оқуға дейін жаттығыңыз." }
};

let currentTrack = "alphabet";
const lessonsByTrack = { alphabet: buildAlphabetLessons(), tajweed: buildTajweedLessons(), quran: buildQuranLessons() };
let session = null;

function loadProgress() {
  try { return Object.assign({ completed: {}, xp: 0, streak: 0, lastDate: null }, JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}); }
  catch { return { completed: {}, xp: 0, streak: 0, lastDate: null }; }
}
function saveProgress() { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); }
let progress = loadProgress();

function isUnlocked(list, idx) { return idx === 0 || Boolean(progress.completed[list[idx - 1].id]); }

function renderXP() { $("#xp-total").textContent = progress.xp; }
function renderStreakBanner() { $("#streak-banner").innerHTML = progress.streak > 0 ? `🔥 <b>${progress.streak} күн</b>&nbsp;қатарынан сабақ оқып жүрсіз!` : ""; }
function renderRecoBanner() {
  const el = $("#reco-banner");
  let raw; try { raw = JSON.parse(localStorage.getItem("agartu-diagnosis-result")); } catch { raw = null; }
  if (!raw) { el.hidden = true; return; }
  const levelNames = { easy: "Жеңіл", medium: "Орташа", hard: "Қиын" };
  el.hidden = false;
  el.innerHTML = `<b>Диагностика нәтижесі: ${raw.score}%</b>Деңгей: ${escapeText(levelNames[raw.level] || raw.level)}. Осы нәтижеге сай әліппе сабақтарынан жалғастырыңыз.`;
}

function renderMap() {
  renderXP(); renderStreakBanner(); renderRecoBanner();
  document.querySelectorAll(".sabaq-tabs .tab").forEach((t) => t.classList.toggle("active", t.dataset.track === currentTrack));
  const meta = TRACK_META[currentTrack];
  $("#track-heading").textContent = meta.heading;
  $("#track-subheading").textContent = meta.subheading;
  const list = lessonsByTrack[currentTrack];
  const groups = [];
  list.forEach((lesson) => { const last = groups[groups.length - 1]; if (!last || last.title !== lesson.unitTitle) groups.push({ title: lesson.unitTitle, lessons: [] }); groups[groups.length - 1].lessons.push(lesson); });
  $("#unit-list").innerHTML = groups.map((g) => `<div class="unit-group"><b class="unit-title">${escapeText(g.title)}</b>${g.lessons.map((lesson) => {
    const idx = list.indexOf(lesson);
    const done = Boolean(progress.completed[lesson.id]);
    const unlocked = isUnlocked(list, idx);
    const stateClass = done ? "done" : unlocked ? "current" : "locked";
    const circleContent = done ? "✓" : escapeText(lesson.trackIcon || String(idx + 1));
    return `<button class="lesson-row ${stateClass}" type="button" data-lesson="${lesson.id}" ${unlocked ? "" : "disabled"}><div class="lesson-circle" dir="rtl">${circleContent}</div><div><b class="lesson-title">${escapeText(lesson.title)}</b><span class="lesson-sub">${escapeText(lesson.subtitle || "")}</span></div><i class="chev"></i></button>`;
  }).join("")}</div>`).join("");
  document.querySelectorAll(".lesson-row:not(.locked)").forEach((row) => row.addEventListener("click", () => openLesson(row.dataset.lesson)));
}

function showLessonView() { $("#lesson-view").classList.add("open"); $("#lesson-view").setAttribute("aria-hidden", "false"); }
function hideLessonView() { $("#lesson-view").classList.remove("open"); $("#lesson-view").setAttribute("aria-hidden", "true"); }

async function openLesson(id) {
  const list = lessonsByTrack[currentTrack];
  const lesson = list.find((l) => l.id === id);
  if (!lesson) return;
  showLessonView();
  if (!lesson.steps) {
    $("#step-kicker").textContent = "ЖҮКТЕЛУДЕ";
    $("#step-title").textContent = lesson.title;
    $("#step-content").innerHTML = `<div class="lesson-loading">Сүре мәтіні жүктелуде…</div>`;
    $("#step-feedback").hidden = true;
    $("#lesson-progress").style.width = "0%";
    $("#hearts-display").innerHTML = "";
    $("#step-action").disabled = true;
    try { lesson.steps = await fetchSurahSteps(lesson.chapter); }
    catch { lesson.steps = [{ type: "cta", kicker: "ҚАТЕ", title: "Жүктелмеді", desc: "Интернет байланысын тексеріп, сабақты қайта ашып көріңіз.", href: "./sabaq.html", linkLabel: "Артқа қайту" }]; }
  }
  session = { lesson, index: 0, hearts: 5, xp: 0, selected: null, orderFilled: null };
  renderStep();
}

function contentForStep(step) {
  if (step.type === "teach") {
    const letterClass = step.ayah ? "teach-letter ayah" : step.letterSmall ? "teach-letter small" : "teach-letter";
    return `<div class="teach-card">${step.letter ? `<div class="${letterClass}" dir="rtl">${step.letter}</div>` : ""}${step.name ? `<div class="teach-name">${escapeText(step.name)}</div>` : ""}${step.desc ? `<p class="teach-desc">${step.desc}</p>` : ""}<button class="audio-pill" id="teach-audio" type="button">Тыңдау <span>🔊</span></button></div>`;
  }
  if (step.type === "teach-forms") {
    const l = step.letter;
    return `<div class="teach-card"><p class="teach-desc">${step.desc}</p><div class="teach-forms"><div><span class="form-glyph" dir="rtl">${l}</span><span class="form-label">Жеке</span></div><div><span class="form-glyph" dir="rtl">${l}ـ</span><span class="form-label">Басында</span></div><div><span class="form-glyph" dir="rtl">ـ${l}ـ</span><span class="form-label">Ортасында</span></div><div><span class="form-glyph" dir="rtl">ـ${l}</span><span class="form-label">Аяғында</span></div></div>${step.letter ? `<button class="audio-pill" id="teach-audio" type="button">Тыңдау <span>🔊</span></button>` : ""}</div>`;
  }
  if (step.type === "mcq") {
    const promptHtml = step.promptArabic ? `<div class="mcq-prompt"><div class="prompt-arabic" dir="rtl">${step.promptArabic}</div></div>` : "";
    const audioHtml = step.audioLetter ? `<button class="audio-pill" id="mcq-audio" type="button">Тыңдау <span>🔊</span></button>` : "";
    const gridClass = step.arabicOptions || step.options.length <= 2 ? "mcq-grid cols-2" : "mcq-grid";
    const optsHtml = step.options.map((opt, i) => `<button class="mcq-option ${step.arabicOptions ? "arabic" : ""}" type="button" data-index="${i}" ${step.arabicOptions ? 'dir="rtl"' : ""}>${escapeText(opt)}</button>`).join("");
    return `${promptHtml}${audioHtml}<div class="${gridClass}">${optsHtml}</div>`;
  }
  if (step.type === "order") {
    const slots = step.words.map(() => `<div class="order-slot"></div>`).join("");
    const bank = step.bankOrder.map((i) => `<button class="order-chip" type="button" data-idx="${i}">${escapeText(step.words[i])}</button>`).join("");
    return `<div class="order-zone"><div class="order-slots" id="order-slots">${slots}</div><div class="order-bank" id="order-bank">${bank}</div><button class="order-reset" id="order-reset" type="button">Қайта бастау</button></div>`;
  }
  if (step.type === "cta") return `<div class="teach-card"><p class="teach-desc">${step.desc}</p>${step.href ? `<a class="audio-pill" href="${step.href}">${escapeText(step.linkLabel || "Ашу")}</a>` : ""}</div>`;
  return "";
}

function renderStep() {
  const step = session.lesson.steps[session.index];
  session.selected = null; session.orderFilled = null;
  $("#step-feedback").hidden = true;
  $("#lesson-progress").style.width = `${Math.round((session.index / session.lesson.steps.length) * 100)}%`;
  $("#hearts-display").innerHTML = "♥".repeat(Math.max(0, session.hearts)) + "♡".repeat(Math.max(0, 5 - session.hearts));
  $("#step-kicker").textContent = step.kicker || "";
  $("#step-title").textContent = step.title || "";
  $("#step-content").innerHTML = contentForStep(step);
  bindStepEvents(step);
  const actionBtn = $("#step-action");
  const isLast = session.index === session.lesson.steps.length - 1;
  if (step.type === "teach" || step.type === "teach-forms" || step.type === "cta") {
    actionBtn.disabled = false; actionBtn.dataset.phase = "advance"; actionBtn.textContent = isLast ? "Аяқтау" : "Жалғастыру";
  } else {
    actionBtn.disabled = true; actionBtn.dataset.phase = "check"; actionBtn.textContent = "Тексеру";
  }
}

function bindStepEvents(step) {
  $("#teach-audio")?.addEventListener("click", () => playStepAudio(step));
  $("#mcq-audio")?.addEventListener("click", () => speak(step.audioLetter));
  if (step.type === "mcq") document.querySelectorAll(".mcq-option").forEach((btn) => btn.addEventListener("click", () => selectMcq(btn, step)));
  if (step.type === "order") {
    document.querySelectorAll(".order-chip").forEach((btn) => btn.addEventListener("click", () => placeChip(btn, step)));
    $("#order-reset").addEventListener("click", () => resetOrder(step));
  }
}

function selectMcq(btn, step) {
  document.querySelectorAll(".mcq-option").forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
  session.selected = step.options[Number(btn.dataset.index)];
  $("#step-action").disabled = false;
}

function placeChip(btn, step) {
  if (!session.orderFilled) session.orderFilled = new Array(step.words.length).fill(null);
  const emptyIdx = session.orderFilled.findIndex((x) => x === null);
  if (emptyIdx === -1) return;
  const wordIdx = Number(btn.dataset.idx);
  session.orderFilled[emptyIdx] = wordIdx;
  btn.disabled = true;
  const slot = document.querySelectorAll(".order-slot")[emptyIdx];
  slot.classList.add("filled"); slot.innerHTML = `<span class="chip-arabic">${escapeText(step.words[wordIdx])}</span>`;
  if (session.orderFilled.every((x) => x !== null)) $("#step-action").disabled = false;
}

function resetOrder(step) {
  session.orderFilled = new Array(step.words.length).fill(null);
  document.querySelectorAll(".order-slot").forEach((s) => { s.classList.remove("filled"); s.innerHTML = ""; });
  document.querySelectorAll(".order-chip").forEach((b) => (b.disabled = false));
  $("#step-action").disabled = true;
}

function evaluateStep(step) {
  if (step.type === "mcq") return session.selected === step.correct;
  if (step.type === "order") return session.orderFilled.every((wordIdx, i) => wordIdx === i);
  return true;
}

function showFeedback(step, correct) {
  const fb = $("#step-feedback");
  fb.hidden = false; fb.className = `step-feedback ${correct ? "correct" : "wrong"}`;
  fb.textContent = correct ? "Дұрыс! Жарайсыз." : step.type === "mcq" ? `Дұрыс жауап: ${step.correct}` : "Қайталап көріңіз.";
  if (step.type === "mcq") document.querySelectorAll(".mcq-option").forEach((b) => { if (b.textContent === step.correct) b.classList.add("answer-correct"); else if (b.classList.contains("selected")) b.classList.add("answer-wrong"); b.disabled = true; });
}

function handleAction() {
  const step = session.lesson.steps[session.index];
  const btn = $("#step-action");
  if (btn.dataset.phase === "advance") { session.xp += 2; advanceStep(); return; }
  const correct = evaluateStep(step);
  showFeedback(step, correct);
  session.xp += correct ? 10 : 0;
  session.hearts = correct ? session.hearts : Math.max(0, session.hearts - 1);
  $("#hearts-display").innerHTML = "♥".repeat(session.hearts) + "♡".repeat(5 - session.hearts);
  btn.dataset.phase = "advance"; btn.disabled = false;
  btn.textContent = session.index === session.lesson.steps.length - 1 ? "Аяқтау" : "Келесі";
}

function advanceStep() {
  session.index += 1;
  if (session.index >= session.lesson.steps.length) return completeLesson();
  renderStep();
}

function completeLesson() {
  progress.completed[session.lesson.id] = true;
  progress.xp += session.xp;
  const today = localDate();
  const yesterday = localDate(new Date(Date.now() - 86400000));
  if (progress.lastDate !== today) progress.streak = progress.lastDate === yesterday ? progress.streak + 1 : 1;
  progress.lastDate = today;
  saveProgress();
  hideLessonView();
  showCompleteView(session.xp);
}

function showCompleteView(xp) {
  $("#complete-xp").textContent = `+${xp}`;
  $("#complete-streak").textContent = `${progress.streak} күн`;
  $("#complete-copy").textContent = "Келесі сабаққа өтуге дайынсыз.";
  $("#complete-view").classList.add("open"); $("#complete-view").setAttribute("aria-hidden", "false");
}

function closeComplete() {
  $("#complete-view").classList.remove("open"); $("#complete-view").setAttribute("aria-hidden", "true");
  renderMap();
}

document.querySelectorAll(".sabaq-tabs .tab").forEach((t) => t.addEventListener("click", () => { currentTrack = t.dataset.track; renderMap(); }));
$("#close-lesson").addEventListener("click", () => { hideLessonView(); session = null; renderMap(); });
$("#step-action").addEventListener("click", handleAction);
$("#complete-continue").addEventListener("click", closeComplete);

(function init() {
  let reco; try { reco = JSON.parse(localStorage.getItem("agartu-diagnosis-result")); } catch { reco = null; }
  if (reco?.level === "hard") currentTrack = "tajweed";
  const requested = new URLSearchParams(location.search).get("lesson");
  const requestedTrack = requested && Object.keys(lessonsByTrack).find((track) => lessonsByTrack[track].some((l) => l.id === requested));
  if (requestedTrack) currentTrack = requestedTrack;
  renderMap();
  if (requestedTrack) {
    const list = lessonsByTrack[requestedTrack];
    if (isUnlocked(list, list.findIndex((l) => l.id === requested))) openLesson(requested);
  }
})();
