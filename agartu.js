const STORAGE_KEY = "agartu-khatm-plan";
const TOTAL_PAGES = 604;
const QURAN_COM_API = "https://api.quran.com/api/v4";
const SURAH_NAMES_RU = ["", "Аль-Фатиха", "Аль-Бакара", "Али Имран", "Ан-Ниса", "Аль-Маида", "Аль-Анам", "Аль-Араф", "Аль-Анфаль", "Ат-Тауба", "Юнус", "Худ", "Юсуф", "Ар-Рад", "Ибрахим", "Аль-Хиджр", "Ан-Нахль", "Аль-Исра", "Аль-Кахф", "Марьям", "Та Ха", "Аль-Анбия", "Аль-Хадж", "Аль-Муминун", "Ан-Нур", "Аль-Фуркан", "Аш-Шуара", "Ан-Намль", "Аль-Касас", "Аль-Анкабут", "Ар-Рум", "Лукман", "Ас-Саджда", "Аль-Ахзаб", "Саба", "Фатыр", "Йа Син", "Ас-Саффат", "Сад", "Аз-Зумар", "Гафир", "Фуссилат", "Аш-Шура", "Аз-Зухруф", "Ад-Духан", "Аль-Джасия", "Аль-Ахкаф", "Мухаммад", "Аль-Фатх", "Аль-Худжурат", "Каф", "Аз-Зарият", "Ат-Тур", "Ан-Наджм", "Аль-Камар", "Ар-Рахман", "Аль-Вакиа", "Аль-Хадид", "Аль-Муджадила", "Аль-Хашр", "Аль-Мумтахина", "Ас-Сафф", "Аль-Джумуа", "Аль-Мунафикун", "Ат-Тагабун", "Ат-Талак", "Ат-Тахрим", "Аль-Мульк", "Аль-Калам", "Аль-Хакка", "Аль-Мааридж", "Нух", "Аль-Джинн", "Аль-Муззаммиль", "Аль-Муддассир", "Аль-Кияма", "Аль-Инсан", "Аль-Мурсалят", "Ан-Наба", "Ан-Назиат", "Абаса", "Ат-Таквир", "Аль-Инфитар", "Аль-Мутаффифин", "Аль-Иншикак", "Аль-Бурудж", "Ат-Тарик", "Аль-Аля", "Аль-Гашия", "Аль-Фаджр", "Аль-Балад", "Аш-Шамс", "Аль-Лайл", "Ад-Духа", "Аш-Шарх", "Ат-Тин", "Аль-Алак", "Аль-Кадр", "Аль-Баййина", "Аз-Залзала", "Аль-Адият", "Аль-Кариа", "Ат-Такасур", "Аль-Аср", "Аль-Хумаза", "Аль-Филь", "Курайш", "Аль-Маун", "Аль-Каусар", "Аль-Кафирун", "Ан-Наср", "Аль-Масад", "Аль-Ихлас", "Аль-Фалак", "Ан-Нас"];
const drawer = document.querySelector("#khatm-drawer");
const backdrop = document.querySelector("#drawer-backdrop");
const content = document.querySelector("#khatm-content");

function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function loadPlan() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
}

function savePlan(plan) { localStorage.setItem(STORAGE_KEY, JSON.stringify(plan)); }

function elapsedDays(start) {
  return Math.max(0, Math.floor((new Date(`${localDate()}T00:00:00`) - new Date(`${start}T00:00:00`)) / 86400000));
}

function metrics(plan) {
  const elapsed = elapsedDays(plan.startedAt);
  const daysLeft = Math.max(1, plan.days - elapsed);
  const pagesLeft = Math.max(0, TOTAL_PAGES - plan.completed);
  return { daysLeft, pagesLeft, today: Math.min(pagesLeft, Math.ceil(pagesLeft / daysLeft)), percent: Math.round(plan.completed / TOTAL_PAGES * 100) };
}

function renderKhatm() {
  const plan = loadPlan();
  if (!plan) {
    content.innerHTML = `<div class="khatm-intro"><p>Мерзімді бір рет таңдаңыз. Қосымша 604 бетті күндерге бөліп, күндік жоспарды автоматты жаңартады.</p><button class="mushaf-open" id="open-mushaf">Мұсхафты ашу →</button></div><form id="agartu-khatm-form" class="khatm-form"><label>Хатым атауы<input id="plan-name" value="Менің хатымым" maxlength="40" required /></label><div><b>Аяқтау мерзімі</b><div class="day-options"><label><input type="radio" name="days" value="10" />10 күн</label><label><input type="radio" name="days" value="20" />20 күн</label><label><input type="radio" name="days" value="30" checked />30 күн</label><label><input type="radio" name="days" value="60" />60 күн</label></div></div><label>Еске салу уақыты<input id="plan-time" type="time" value="20:00" required /></label><button class="agartu-primary" type="submit">Хатымды бастау</button></form>`;
    document.querySelector("#open-mushaf").onclick = () => openMushaf(1);
    document.querySelector("#agartu-khatm-form").onsubmit = event => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      savePlan({ name: document.querySelector("#plan-name").value.trim(), days: Number(data.get("days")), reminder: document.querySelector("#plan-time").value, startedAt: localDate(), completed: 0, streak: 0, lastDone: null });
      renderKhatm(); toast("Хатым жоспары құрылды");
    };
    return;
  }

  const stat = metrics(plan);
  const doneToday = plan.lastDone === localDate();
  const start = plan.completed + 1;
  const end = Math.min(TOTAL_PAGES, plan.completed + stat.today);
  content.innerHTML = stat.pagesLeft === 0 ? `<div class="plan-card"><div class="today-task"><span>ХАТЫМ АЯҚТАЛДЫ</span><h4>Қабыл болсын!</h4><p>Құранның 604 беті толық оқылды.</p></div><button class="mushaf-open" id="open-mushaf">Мұсхафты ашу</button><button class="agartu-primary" id="reset-plan">Жаңа хатым бастау</button></div>` : `<div class="plan-card"><div class="plan-top"><div><span>БЕЛСЕНДІ ЖОСПАР</span><h3>${escapeText(plan.name)}</h3><p>${plan.days} күн • ${escapeText(plan.reminder)}</p></div><b class="plan-percent">${stat.percent}%</b></div><div class="plan-bar"><i style="width:${stat.percent}%"></i></div><div class="plan-meta"><span>${plan.completed} бет оқылды</span><span>${stat.pagesLeft} бет қалды</span></div><div class="today-task"><span>БҮГІНГІ ОҚУ</span><h4>${start}–${end} бет</h4><p>${stat.today} бет • шамамен ${Math.max(10, stat.today * 2)} минут</p><button class="mushaf-open" id="open-mushaf">${start}-беттен мұсхафты ашу →</button><button id="done-reading" class="agartu-primary done-btn" ${doneToday ? "disabled" : ""}>${doneToday ? "Орындалды ✓" : "Оқып бітірдім"}</button></div></div><div class="mini-stats"><div><span>ҚАЛҒАН УАҚЫТ</span><strong>${stat.daysLeft} күн</strong></div><div><span>СЕРИЯ</span><strong>${plan.streak} күн</strong></div></div><button id="reset-plan" class="reset-plan">Жоспарды өшіру</button>`;

  document.querySelector("#open-mushaf")?.addEventListener("click", () => openMushaf(stat.pagesLeft === 0 ? 1 : start));

  document.querySelector("#done-reading")?.addEventListener("click", () => {
    const current = loadPlan(); const amount = metrics(current).today;
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    current.completed = Math.min(TOTAL_PAGES, current.completed + amount);
    current.streak = current.lastDone === localDate(yesterday) ? current.streak + 1 : 1;
    current.lastDone = localDate(); savePlan(current); renderKhatm(); toast("Алла қабыл етсін!");
  });
  document.querySelector("#reset-plan")?.addEventListener("click", () => { localStorage.removeItem(STORAGE_KEY); renderKhatm(); });
}

function escapeText(text) { return String(text).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]); }
function toast(message) { const el = document.querySelector("#agartu-toast"); el.textContent = message; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 1800); }

const MEMORIZATION_SURAHS = [
  { id: "ikhlas", name: "Ықылас сүресі", ayahs: 4 }, { id: "falaq", name: "Фалақ сүресі", ayahs: 5 }, { id: "nas", name: "Нәс сүресі", ayahs: 6 }
];
let isRecording = false;
let recordingStartedAt = 0;
let recordingTimer = null;
function formatTime(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }

function updateRecordingState(recording) {
  isRecording = recording;
  const button = document.querySelector("#record-memorization"); const state = document.querySelector("#recording-state");
  button.classList.toggle("recording", recording); button.innerHTML = recording ? "<span>■</span> Оқуды аяқтау" : "<span>✦</span> Дауыстық тапсыруды бастау";
  state.classList.toggle("active", recording); document.querySelector(".voice-orb").classList.toggle("active", recording); state.querySelector("b").textContent = recording ? "GPT Voice тыңдап жатыр" : "GPT Voice дайын";
  state.querySelector("small").textContent = recording ? "Сүрені оқыңыз, аяқтағанда батырманы басыңыз" : "Дауыстық тапсыруды бастау үшін төмендегі батырманы басыңыз";
  if (!recording) { clearInterval(recordingTimer); recordingTimer = null; }
}

function resetMemorizationAttempt() { document.querySelector("#memorization-feedback").hidden = true; document.querySelector("#submit-memorization").disabled = true; document.querySelector("#recording-time").textContent = "00:00"; }

function setupMemorization() {
  const select = document.querySelector("#memorization-surah");
  select.innerHTML = MEMORIZATION_SURAHS.map(surah => `<option value="${surah.id}">${surah.name} · ${surah.ayahs} аят</option>`).join("");
  select.onchange = resetMemorizationAttempt;
}

function openMemorization() { document.querySelector("#memorization-view").classList.add("open"); document.querySelector("#memorization-view").setAttribute("aria-hidden", "false"); }
function closeMemorization() { updateRecordingState(false); document.querySelector("#memorization-view").classList.remove("open"); document.querySelector("#memorization-view").setAttribute("aria-hidden", "true"); }

function submitMemorization() {
  const feedback = document.querySelector("#memorization-feedback");
  feedback.hidden = false; feedback.className = "memorization-feedback green";
  feedback.innerHTML = `<div class="feedback-score"><strong>92%</strong><span>GPT бағасы</span></div><div><h3>Өте жақсы!</h3><p>Оқу ырғағы тұрақты, аяттар ретімен берілді. Созу орындарына сәл көбірек көңіл бөліңіз.</p><p class="feedback-note">Прототиптегі үлгі фидбэк. Нақты нұсқада GPT Voice аудионы талдап, жеке фидбэк береді.</p></div>`;
  feedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function openDrawer() { renderKhatm(); drawer.classList.add("open"); backdrop.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); }
function closeDrawer() { drawer.classList.remove("open"); backdrop.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); }

document.querySelector("#khatm-edge")?.addEventListener("click", openDrawer);
document.querySelector("#close-khatm").onclick = closeDrawer;
backdrop.onclick = closeDrawer;
setupMemorization();
document.querySelector("#start-memorization")?.addEventListener("click", openMemorization);
document.querySelector("#open-memorization-info")?.addEventListener("click", () => { openMemorization(); toast("Сөздік сәйкестік пен тәжуидке назар аударыңыз"); });
document.querySelector("#close-memorization").onclick = closeMemorization;
document.querySelector("#record-memorization").onclick = () => {
  if (isRecording) { updateRecordingState(false); document.querySelector("#submit-memorization").disabled = false; return; }
  resetMemorizationAttempt(); recordingStartedAt = Date.now(); updateRecordingState(true);
  recordingTimer = setInterval(() => { document.querySelector("#recording-time").textContent = formatTime(Math.floor((Date.now() - recordingStartedAt) / 1000)); }, 1000);
};
document.querySelector("#submit-memorization").onclick = submitMemorization;

const mushafView = document.querySelector("#mushaf-view");
let mushafPage = Number(localStorage.getItem("agartu-mushaf-page")) || 1;

async function openMushaf(page = mushafPage) {
  mushafPage = Math.min(604, Math.max(1, Number(page)));
  mushafView.classList.add("open");
  mushafView.setAttribute("aria-hidden", "false");
  await loadMushafPage();
}

function closeMushaf() {
  mushafView.classList.remove("open");
  mushafView.setAttribute("aria-hidden", "true");
  renderKhatm();
}

async function loadMushafPage() {
  const loading = document.querySelector("#mushaf-loading");
  const verses = document.querySelector("#mushaf-verses");
  document.querySelector("#mushaf-page-label").textContent = `page ${mushafPage}`;
  document.querySelector("#mushaf-surah-title").textContent = "Quran.com";
  document.querySelector("#mushaf-ribbon-title").textContent = "Quran.com";
  document.querySelector("#previous-page").disabled = mushafPage === 1;
  document.querySelector("#next-page").disabled = mushafPage === 604;
  loading.style.display = "grid"; loading.textContent = "Мұсхаф жүктелуде…"; loading.className = "mushaf-loading"; verses.innerHTML = "";
  localStorage.setItem("agartu-mushaf-page", mushafPage);
  try {
    const response = await fetch(`${QURAN_COM_API}/verses/by_page/${mushafPage}?language=en&words=false&fields=text_uthmani,juz_number&per_page=50`);
    if (!response.ok) throw new Error("Quran.com мәтіні жүктелмеді");
    const data = await response.json();
    const firstVerse = data.verses[0] || {};
    const firstChapter = Number(firstVerse.verse_key?.split(":")[0]);
    const surahTitle = SURAH_NAMES_RU[firstChapter] ? `Surat ${SURAH_NAMES_RU[firstChapter]}` : "Quran.com";
    document.querySelector("#mushaf-page-label").textContent = `page ${mushafPage}, Juz' ${firstVerse.juz_number || ""}`.trim();
    document.querySelector("#mushaf-surah-title").textContent = surahTitle;
    document.querySelector("#mushaf-ribbon-title").textContent = surahTitle;
    const pageVerses = data.verses.map(verse => ({ text: verse.text_uthmani, number: verse.verse_number }));
    verses.innerHTML = pageVerses.map(verse => `<span class="mushaf-ayah">${escapeText(verse.text)} <i class="ayah-number">${verse.number}</i> </span>`).join("");
    loading.style.display = "none";
  } catch {
    loading.className = "mushaf-loading mushaf-error";
    loading.textContent = "Quran.com-нан мұсхафты жүктеу мүмкін болмады. Интернет байланысын тексеріп, бетті қайта ашыңыз.";
  }
  const plan = loadPlan();
  const readButton = document.querySelector("#mark-page-read");
  readButton.disabled = Boolean(plan && mushafPage <= plan.completed);
  readButton.textContent = readButton.disabled ? "Оқылды ✓" : "Оқылды ✓";
}

document.querySelector("#close-mushaf").onclick = closeMushaf;
document.querySelector("#quick-open-mushaf")?.addEventListener("click", () => openMushaf(2));
document.querySelector("#previous-page").onclick = () => { if (mushafPage > 1) { mushafPage -= 1; loadMushafPage(); } };
document.querySelector("#next-page").onclick = () => { if (mushafPage < 604) { mushafPage += 1; loadMushafPage(); } };
document.querySelector("#mark-page-read").onclick = () => {
  const plan = loadPlan();
  if (!plan) { toast("Алдымен хатым жоспарын құрыңыз"); return; }
  if (mushafPage === plan.completed + 1) {
    plan.completed = mushafPage; plan.lastDone = localDate(); plan.streak = Math.max(1, plan.streak); savePlan(plan); toast(`${mushafPage}-бет оқылды`); loadMushafPage();
  } else if (mushafPage <= plan.completed) toast("Бұл бет оқылған");
  else toast(`Алдымен ${plan.completed + 1}-бетті оқыңыз`);
};

document.querySelectorAll("[data-open-mushaf]").forEach(el => el.addEventListener("click", () => openMushaf(1)));
document.querySelectorAll("[data-mem-nav]").forEach(el => el.addEventListener("click", openMemorization));
document.querySelectorAll("[data-soon]").forEach(el => el.addEventListener("click", event => { event.preventDefault(); toast("Жақында қосылады"); }));

const SABAQ_TRACKS = [
  { name: "Әліппе", lessons: [
    ...[["ا", "ب", "ت", "ث"], ["ج", "ح", "خ", "د"], ["ذ", "ر", "ز", "س"], ["ش", "ص", "ض", "ط"], ["ظ", "ع", "غ", "ف"], ["ق", "ك", "ل", "م"], ["ن", "ه", "و", "ي"]].map((g, i) => ({ id: `alpha-letters-${i}`, title: `${i + 1}-топ: ${g.join(" ")}`, icon: g[0] })),
    { id: "alpha-harakat", title: "Харакаттар", icon: "بَ" }, { id: "alpha-tanwin", title: "Тәнуин", icon: "بً" }, { id: "alpha-sukun", title: "Сукун", icon: "بْ" },
    { id: "alpha-shadda", title: "Шадда", icon: "بّ" }, { id: "alpha-madd", title: "Мад әріптері", icon: "با" }, { id: "alpha-joining", title: "Әріптердің жалғасуы", icon: "بتث" }
  ] },
  { name: "Тәжуид", lessons: [
    { id: "tw-intro", title: "Тәжуидке кіріспе", icon: "ت" }, { id: "tw-nun-izhar", title: "Нұн сәкин: Изхар", icon: "نْ" }, { id: "tw-nun-other", title: "Идғам, Иқлаб, Ихфа", icon: "نْ" },
    { id: "tw-meem", title: "Мим сәкин ережелері", icon: "مْ" }, { id: "tw-madd", title: "Мад ережелері", icon: "~" }, { id: "tw-qalqala", title: "Қалқала", icon: "ق" }, { id: "tw-ra-waqf", title: "Лам, Ра және уақыф белгілері", icon: "ر" }
  ] },
  { name: "Құран", lessons: [
    { id: "quran-fatiha", title: "Әл-Фатиха сүресі", icon: "ف" }, { id: "quran-ikhlas", title: "Әл-Ихлас сүресі", icon: "خ" }, { id: "quran-falaq", title: "Әл-Фәлақ сүресі", icon: "ف" },
    { id: "quran-nas", title: "Ән-Нас сүресі", icon: "ن" }, { id: "quran-kawthar", title: "Әл-Кәусар сүресі", icon: "ك" }, { id: "quran-nasr", title: "Ән-Наср сүресі", icon: "ن" }
  ] }
];

function renderContinueLesson() {
  let progress; try { progress = JSON.parse(localStorage.getItem("sabaq-progress-v1")) || {}; } catch { progress = {}; }
  const done = progress.completed || {};
  const track = SABAQ_TRACKS.find(t => t.lessons.some(l => !done[l.id])) || SABAQ_TRACKS[SABAQ_TRACKS.length - 1];
  const finished = track.lessons.filter(l => done[l.id]).length;
  const next = track.lessons.find(l => !done[l.id]);
  document.querySelector("#continue-kicker").textContent = next ? `Сабақты жалғастыру · ${track.name}` : "Барлық сабақ өтілді";
  document.querySelector("#continue-title").textContent = next ? next.title : "Қайталауға кірісіңіз";
  document.querySelector("#continue-icon").textContent = next ? next.icon : "✓";
  document.querySelector("#continue-meta").textContent = `${finished} / ${track.lessons.length} сабақ өтілді`;
  document.querySelector("#continue-bar").style.width = `${Math.round(finished / track.lessons.length * 100)}%`;
  document.querySelector("#continue-lesson").href = next ? `./sabaq.html?lesson=${next.id}` : "./sabaq.html";
}
renderContinueLesson();
window.addEventListener("pageshow", renderContinueLesson);

const KAABA = { lat: 21.4225, lon: 39.8262 };
const ALMATY = { lat: 43.2389, lon: 76.8897 };
const qiblaSheet = document.querySelector("#qibla-sheet");
let qiblaBearing = null;
let qiblaListening = false;

function bearingToKaaba({ lat, lon }) {
  const rad = deg => deg * Math.PI / 180;
  const dLon = rad(KAABA.lon - lon);
  const y = Math.sin(dLon) * Math.cos(rad(KAABA.lat));
  const x = Math.cos(rad(lat)) * Math.sin(rad(KAABA.lat)) - Math.sin(rad(lat)) * Math.cos(rad(KAABA.lat)) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function setQiblaBearing(position, placeLabel) {
  qiblaBearing = bearingToKaaba(position);
  document.querySelector("#qibla-arrow").style.transform = `rotate(${qiblaBearing}deg)`;
  document.querySelector("#qibla-degrees").textContent = `${Math.round(qiblaBearing)}°`;
  document.querySelector("#qibla-hint").textContent = `${placeLabel}. Телефонды көлденең ұстаңыз, 🕋 белгісі Қағбаны көрсетеді.`;
}

function onQiblaOrientation(event) {
  const heading = event.webkitCompassHeading ?? (event.absolute && event.alpha != null ? 360 - event.alpha : null);
  if (heading == null || qiblaBearing == null) return;
  document.querySelector("#qibla-dial").style.transform = `rotate(${-heading}deg)`;
}

async function startQiblaCompass() {
  if (qiblaListening || !("DeviceOrientationEvent" in window)) return;
  try {
    if (typeof DeviceOrientationEvent.requestPermission === "function" && await DeviceOrientationEvent.requestPermission() !== "granted") return;
  } catch { return; }
  window.addEventListener("deviceorientationabsolute", onQiblaOrientation);
  window.addEventListener("deviceorientation", onQiblaOrientation);
  qiblaListening = true;
}

function openQibla() {
  qiblaSheet.classList.add("open");
  qiblaSheet.setAttribute("aria-hidden", "false");
  setQiblaBearing(ALMATY, "Алматы бойынша");
  navigator.geolocation?.getCurrentPosition(pos => setQiblaBearing({ lat: pos.coords.latitude, lon: pos.coords.longitude }, "Сіздің орныңыз бойынша"), () => {}, { timeout: 8000, maximumAge: 600000 });
  startQiblaCompass();
}

function closeQibla() { qiblaSheet.classList.remove("open"); qiblaSheet.setAttribute("aria-hidden", "true"); }

document.querySelector("#open-qibla").addEventListener("click", openQibla);
document.querySelector("#close-qibla").addEventListener("click", closeQibla);
qiblaSheet.addEventListener("click", event => { if (event.target === qiblaSheet) closeQibla(); });

const booksSheet = document.querySelector("#books-sheet");
function toggleBooks(open) { booksSheet.classList.toggle("open", open); booksSheet.setAttribute("aria-hidden", String(!open)); }
document.querySelector("#open-books").addEventListener("click", () => toggleBooks(true));
document.querySelector("#close-books").addEventListener("click", () => toggleBooks(false));
booksSheet.addEventListener("click", event => { if (event.target === booksSheet) toggleBooks(false); });
