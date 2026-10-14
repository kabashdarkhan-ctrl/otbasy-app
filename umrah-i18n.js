/* Ұмра қолданбасының тіл қабаты: қазақша (бастапқы) ↔ орысша.
 * Мәтін қазақша жазылған, орыс тілі таңдалса DOM-дағы мәтіндер сөздік арқылы аударылады
 * (сөздік: umrah-i18n-ru.js → window.UMRAH_RU). Тіл: ?lang=ru|kk немесе жадтағы таңдау. */
(function () {
  "use strict";
  var KEY = "umrah-lang";
  function readLang() {
    try {
      var q = new URLSearchParams(location.search).get("lang");
      if (q === "ru" || q === "kk") { localStorage.setItem(KEY, q); return q; }
      var s = localStorage.getItem(KEY);
      return s === "ru" ? "ru" : "kk";
    } catch (e) { return "kk"; }
  }
  var lang = readLang();
  var D = window.UMRAH_RU || { exact: {}, translit: [] };
  var exact = D.exact || {};
  var misses = {};

  // ---- сөздік құрылымдары ----
  var patterns = [];
  Object.keys(exact).forEach(function (k) {
    if (k.indexOf("{}") < 0) return;
    var parts = k.split("{}").map(function (p) { return p.replace(/[.*+?^$()|[\]\\]/g, "\\$&"); });
    patterns.push({ re: new RegExp("^" + parts.join("(.*?)") + "$"), out: exact[k] });
  });
  patterns.sort(function (a, b) { return b.re.source.length - a.re.source.length; });
  var translitWords = {};
  (D.translit || []).forEach(function (w) { translitWords[w] = 1; });
  var CHAR = { "ә": "а", "Ә": "А", "ө": "о", "Ө": "О", "ү": "у", "Ү": "У", "ұ": "у", "Ұ": "У", "қ": "к", "Қ": "К", "ғ": "г", "Ғ": "Г", "ң": "н", "Ң": "Н", "һ": "х", "Һ": "Х", "і": "и", "І": "И" };
  function toRuLetters(s) { return s.replace(/[әӘөӨүҮұҰқҚғҒңҢһҺіІ]/g, function (c) { return CHAR[c]; }); }
  var KK = /[әӘөӨүҮұҰқҚғҒңҢһҺіІ]/;
  function normWord(w) { return w.replace(/^[\s«»"“”(),.;:!?…—–-]+|[\s«»"“”(),.;:!?…—–-]+$/g, "").toLowerCase(); }
  function isTranslit(s) {
    var ws = s.split(/\s+/).map(normWord).filter(Boolean);
    if (!ws.length || !KK.test(s)) return false;
    return ws.every(function (w) { return translitWords[w] === 1 || !/[А-Яа-яӘәӨөҮүҰұҚқҒғҢңҺһІі]/.test(w); });
  }

  // ---- динамикалық бөліктердің ережелері (сан + бірлік т.б.) ----
  var RULES = [
    [/^(\d+) с бұрын$/, "$1 с назад"], [/^(\d+) мин бұрын$/, "$1 мин назад"], [/^(\d+) сағ бұрын$/, "$1 ч назад"], [/^белгісіз$/, "неизвестно"],
    [/^бат\. (\d+)%$/, "бат. $1%"], [/^(\d+)-қадам$/, "Шаг $1"], [/^(\d+) қажы$/, "$1 паломн."], [/^(\d+) адам$/, "$1 чел."],
    [/^Топ коды · (\d+) адам$/, "Код группы · $1 чел."], [/^SOS · (\d+) адам$/, "SOS · $1 чел."], [/^Гид · (.+)$/, "Гид · $1"],
    [/^Гидке дейін (.+)$/, "До гида $1"], [/^Жиналу орны · (.+)$/, "Место сбора · $1"], [/^(\d+) айналым$/, "$1 кр."], [/^(\d+) жүріс$/, "$1 пер."],
    [/^≈ ?(\d+) мин$/, "≈ $1 мин"], [/^(\d+) \/ (\d+)$/, "$1 / $2"], [/^Гидке жаяу ≈ (\d+) мин · (.+)\. Жол картада көрсетілген\.$/, "До гида пешком ≈ $1 мин · $2. Маршрут показан на карте."],
    [/^Гидке жаяу ≈ (\d+) мин · (.+)$/, "До гида пешком ≈ $1 мин · $2"], [/^Жиналу орнына жаяу ≈ (\d+) мин · (.+)$/, "До места сбора пешком ≈ $1 мин · $2"],
  ];

  // соңғы амал: құрама мәтінде сөздіктегі бөлшектерді (ұзынынан бастап) ауыстыру
  var frags = Object.keys(exact).filter(function (k) { return k.indexOf("{}") < 0 && k.length >= 5 && /[А-Яа-яӘәӨөҮүҰұҚқҒғҢңҺһІі]/.test(k); }).sort(function (a, b) { return b.length - a.length; });
  var LET = /[A-Za-zА-Яа-яЁёӘәӨөҮүҰұҚқҒғҢңҺһІі]/;
  function subFrag(s) {
    var out = s;
    for (var i = 0; i < frags.length; i++) {
      var f = frags[i], at = out.indexOf(f);
      while (at >= 0) {
        var before = at > 0 ? out.charAt(at - 1) : "", after = out.charAt(at + f.length);
        if (LET.test(before) || LET.test(after)) { at = out.indexOf(f, at + 1); continue; }
        out = out.slice(0, at) + exact[f] + out.slice(at + f.length);
        at = out.indexOf(f, at + exact[f].length);
      }
    }
    return out;
  }

  function tr(text) {
    if (lang !== "ru" || !text) return text;
    var s = text.replace(/\s+/g, " ").trim();
    if (!s) return text;
    var hit = exact[s];
    if (hit !== undefined) return hit;
    for (var i = 0; i < RULES.length; i++) if (RULES[i][0].test(s)) return s.replace(RULES[i][0], RULES[i][1]);
    if (isTranslit(s)) return toRuLetters(s);
    for (var j = 0; j < patterns.length; j++) {
      var m = patterns[j].re.exec(s);
      if (m) { var k = 0; return patterns[j].out.replace(/\{\}/g, function () { return tr(m[++k] || ""); }); }
    }
    var seps = [" · ", " — ", " → "];
    for (var q = 0; q < seps.length; q++) {
      if (s.indexOf(seps[q]) > 0) {
        var ps = s.split(seps[q]), out = ps.map(tr), changed = out.some(function (o, n) { return o !== ps[n]; });
        if (changed) return out.join(seps[q]);
      }
    }
    if (KK.test(s)) { var sub = subFrag(s); if (sub !== s) { if (KK.test(sub)) misses[s] = 1; return sub; } }
    if (KK.test(s)) misses[s] = 1;
    return text;
  }

  // ---- DOM ----
  var ATTRS = ["placeholder", "aria-label", "title", "alt"];
  function translateTextNode(n) {
    var raw = n.nodeValue; if (!raw || !raw.trim()) return;
    var lead = raw.match(/^\s*/)[0], trail = raw.match(/\s*$/)[0], core = raw.trim(), out = tr(core);
    if (out !== core) n.nodeValue = lead + out + trail;
  }
  function translateTree(root) {
    if (lang !== "ru" || !root) return;
    if (root.nodeType === 3) { translateTextNode(root); return; }
    if (root.nodeType !== 1) return;
    var skip = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1 };
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode: function (nd) { return nd.nodeType === 1 && skip[nd.nodeName] ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; },
    });
    var nd, list = [];
    while ((nd = w.nextNode())) list.push(nd);
    list.forEach(function (x) { if (x.nodeType === 3) translateTextNode(x); else translateAttrs(x); });
    translateAttrs(root);
  }
  function translateAttrs(el) {
    if (!el.getAttribute) return;
    ATTRS.forEach(function (a) { var v = el.getAttribute(a); if (v) { var o = tr(v); if (o !== v) el.setAttribute(a, o); } });
  }
  var pending = new Set(), scheduled = false;
  function flush() {
    scheduled = false; var items = Array.from(pending); pending.clear();
    items.forEach(function (n) { if (n.isConnected !== false) translateTree(n); });
  }
  function queue(n) { pending.add(n); if (!scheduled) { scheduled = true; setTimeout(flush, 16); } }
  function start() {
    document.documentElement.lang = lang === "ru" ? "ru" : "kk";
    if (lang !== "ru") return;
    document.title = tr(document.title);
    translateTree(document.body);
    new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        if (m.type === "childList") m.addedNodes.forEach(queue);
        else if (m.type === "characterData") queue(m.target);
        else if (m.type === "attributes") queue(m.target);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  function setLang(l) {
    try { localStorage.setItem(KEY, l); } catch (e) { /* жад жоқ */ }
    var u = new URL(location.href); u.searchParams.set("lang", l); location.href = u.toString();
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-lang]");
    if (b) { e.preventDefault(); if (b.dataset.lang !== lang) setLang(b.dataset.lang); }
  });
  // «ҚАЗ | РУС» ауыстырғышының HTML-ы (қолданба бет шаблондарына қойылады)
  function switchHtml() {
    return '<span class="lsw"><button type="button" data-lang="kk" class="' + (lang === "kk" ? "on" : "") + '">ҚАЗ</button><button type="button" data-lang="ru" class="' + (lang === "ru" ? "on" : "") + '">РУС</button></span>';
  }

  window.UI18N = { lang: lang, t: tr, setLang: setLang, switchHtml: switchHtml, misses: function () { return Object.keys(misses); } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
