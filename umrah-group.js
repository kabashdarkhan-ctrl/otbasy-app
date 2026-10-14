/* Ұмра тобы: гид пен қажылардың орнын бөлісу, SOS, жиналу орны, хабарландыру.
 * Сервер: Supabase RPC (umrah-group-schema.sql). «Демо» режимі серверсіз өтеді (жалған топ).
 * Қолдану: UmrahGroup.mount(контейнер, { toast, back }) → тазалау функциясын қайтарады.
 * Сынақ үшін серверді ауыстыру: #/group?sb=http://localhost:8799 */
(function () {
  "use strict";
  const KEY = "umrah-group-v1";
  const POLL_MS = 5000, PUSH_MS = 6000, FAR_M = 250, STALE_S = 300, FAR_WARN_S = 30;
  const KAABA = [21.4225, 39.8262];
  const getQs = () => new URLSearchParams(location.hash.split("?")[1] || "");
  const getSB = () => { const o = Object.assign({}, window.SUPABASE_CONFIG || {}), u = getQs().get("sb") || (function () { try { return localStorage.getItem("umrah-group-sb"); } catch (e) { return null; } })(); if (u) o.url = u; return o; };

  // ---------- көмекші ----------
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const rad = (x) => (x * Math.PI) / 180;
  const hav = (a, b) => { const dl = rad(b[0] - a[0]), dn = rad(b[1] - a[1]), h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dn / 2) ** 2; return 2 * 6371000 * Math.asin(Math.sqrt(h)); };
  const fmtD = (m) => (m >= 1000 ? (m / 1000).toFixed(1).replace(".", ",") + " км" : Math.max(5, Math.round(m / 5) * 5) + " м");
  const ago = (iso) => { if (!iso) return "белгісіз"; const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000)); return s < 60 ? s + " с бұрын" : s < 3600 ? Math.round(s / 60) + " мин бұрын" : Math.round(s / 3600) + " сағ бұрын"; };
  const ageS = (iso) => (iso ? (Date.now() - new Date(iso).getTime()) / 1000 : 1e9);
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } };
  const save = (v) => { try { v ? localStorage.setItem(KEY, JSON.stringify(v)) : localStorage.removeItem(KEY); } catch (e) { /* жад жоқ */ } };
  const ico = (d, s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  const ICON = { back: "M15 5l-7 7 7 7", users: "M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16.5 11a2.6 2.6 0 1 0 0-5.2M2.5 19.5c0-3.2 2.7-5.5 6-5.5s6 2.3 6 5.5M16 14.2c3 0 5.5 2 5.5 5", pin: "M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z", link: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1", flag: "M5 21V4M5 4h11l-2 4 2 4H5" };
  function alertFx() { try { if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 300]); const A = window.AudioContext || window.webkitAudioContext; if (!A) return; const c = new A(), o = c.createOscillator(), g = c.createGain(); o.type = "square"; o.frequency.value = 880; g.gain.value = 0.15; o.connect(g); g.connect(c.destination); o.start(); setTimeout(() => { o.frequency.value = 660; }, 220); setTimeout(() => { o.stop(); c.close(); }, 520); } catch (e) { /* дыбыс жоқ */ } }

  // ---------- сервер (Supabase RPC) ----------
  async function rpc(fn, args) {
    const SB = getSB(); if (!SB.url || !SB.anonKey) throw new Error("no_config");
    const r = await fetch(`${SB.url}/rest/v1/rpc/${fn}`, { method: "POST", headers: { apikey: SB.anonKey, "Content-Type": "application/json" }, body: JSON.stringify(args) });
    const t = await r.text();
    if (!r.ok) { let m = t; try { m = JSON.parse(t).message || t; } catch (e) { /* мәтін */ } const err = new Error(m); err.status = r.status; throw err; }
    return t ? JSON.parse(t) : null;
  }
  const auth = (me) => ({ p_member: me.id, p_token: me.token });
  const realApi = {
    create: (name) => rpc("umrah_create_group", { p_name: name }),
    join: (code, name) => rpc("umrah_join_group", { p_code: code, p_name: name }),
    push: (me, p) => rpc("umrah_push", Object.assign(auth(me), { p_lat: p.lat, p_lng: p.lng, p_acc: p.acc, p_battery: p.battery, p_sos: !!p.sos, p_paused: !!p.paused })),
    state: (me) => rpc("umrah_state", auth(me)),
    ack: (me, target) => rpc("umrah_ack", Object.assign(auth(me), { p_target: target })),
    kick: (me, target) => rpc("umrah_kick", Object.assign(auth(me), { p_target: target })),
    meet: (me, m) => rpc("umrah_set_meet", Object.assign(auth(me), { p_lat: m ? m.lat : null, p_lng: m ? m.lng : null, p_label: m ? m.label : null })),
    notice: (me, text) => rpc("umrah_set_notice", Object.assign(auth(me), { p_text: text || "" })),
    leave: (me) => rpc("umrah_leave", auth(me)),
  };

  // ---------- демо (серверсіз, жалған топ) ----------
  function makeDemoApi() {
    const t0 = Date.now(); let mine = { lat: KAABA[0], lng: KAABA[1], sos: false, paused: false, battery: 80 }, ackd = new Set(), kicked = new Set(), meet = null, notice = null;
    const off = (m, deg) => [Math.cos(rad(deg)) * m / 111320, Math.sin(rad(deg)) * m / (111320 * Math.cos(rad(KAABA[0])))];
    const spot = (base, m, deg, wob) => { const t = (Date.now() - t0) / 1000, o = off(m + Math.sin(t / 9 + deg) * wob, deg + t / 20); return [base[0] + o[0], base[1] + o[1]]; };
    const iso = (sAgo) => new Date(Date.now() - sAgo * 1000).toISOString();
    const people = (center) => [
      { id: "p1", name: "Дана Жандосқызы", m: 380, deg: 205, sos: true, ago: 4, battery: 48 }, { id: "p2", name: "Бекзат Оразұлы", m: 510, deg: 320, ago: 10, battery: 62 },
      { id: "p3", name: "Томирис Қайратқызы", m: 90, deg: 80, ago: 400, battery: 3, stale: true }, { id: "p4", name: "Ержан Мұратұлы", m: 120, deg: 20, ago: 4, battery: 91 },
      { id: "p5", name: "Аружан Талғатқызы", m: 60, deg: 140, ago: 6, battery: 70 }, { id: "p6", name: "Дәулет Сейітұлы", m: 150, deg: 250, ago: 5, battery: 55 },
    ].filter((p) => !kicked.has(p.id)).map((p) => { const c = p.stale ? [center[0] + 0.0007, center[1] - 0.0003] : spot(center, p.m, p.deg, 18); return { id: p.id, name: p.name, role: "pilgrim", lat: c[0], lng: c[1], battery: p.battery, status: p.sos ? "sos" : "ok", sos_at: p.sos ? iso(95) : null, sos_ack: ackd.has(p.id), paused: false, updated_at: iso(p.ago) }; });
    return {
      create: async () => ({ code: "DEMO42", member_id: "me", token: "demo" }), join: async () => ({ code: "DEMO42", member_id: "me", token: "demo" }),
      push: async (_, p) => { const was = mine.sos; mine = { lat: p.lat != null ? p.lat : mine.lat, lng: p.lng != null ? p.lng : mine.lng, sos: !!p.sos, paused: !!p.paused && !p.sos, battery: p.battery || 80, sosAt: p.sos ? (was ? mine.sosAt : Date.now()) : 0 }; },
      state: async (me) => {
        const center = [mine.lat, mine.lng], base = { ended: false, code: "DEMO42", meet, notice };
        if (me.role === "guide") { const ps = people(center); return Object.assign(base, { role: "guide", count: ps.length + 1, members: [{ id: "me", name: me.name || "Гид", role: "guide", lat: mine.lat, lng: mine.lng, battery: mine.battery, status: "ok", updated_at: iso(1) }].concat(ps) }); }
        const g = spot(center, 223, 35, 12);
        return Object.assign(base, { role: "pilgrim", count: 7, members: [{ id: "g", name: "Ғалымжан Қасымұлы", role: "guide", lat: g[0], lng: g[1], battery: 77, status: "ok", updated_at: iso(12) }, { id: "me", name: me.name || "Мен", role: "pilgrim", lat: mine.paused ? null : mine.lat, lng: mine.paused ? null : mine.lng, battery: mine.battery, status: mine.sos ? "sos" : "ok", sos_at: mine.sos ? iso(5) : null, sos_ack: mine.sos && Date.now() - mine.sosAt > 8000, paused: mine.paused, updated_at: iso(1) }] });
      },
      ack: async (_, id) => { ackd.add(id); }, kick: async (_, id) => { kicked.add(id); },
      meet: async (_, m) => { meet = m; }, notice: async (_, t) => { notice = t ? { text: t, at: iso(0) } : null; }, leave: async () => {},
    };
  }

  // ---------- негізгі ----------
  function mount(app, ctx) {
    ctx = ctx || {};
    try { const u = getQs().get("sb"); if (u) localStorage.setItem("umrah-group-sb", u); } catch (e) { /* жад жоқ */ }
    const toast = ctx.toast || (() => {});
    let sess = load(), demo = !!(sess && sess.demo), api = demo ? makeDemoApi() : realApi;
    let timers = [], watchId = null, map = null, layer = null, routeLayer = null, myLL = null, lastPush = 0, sosOn = false, paused = false, battery = null;
    let state = null, follow = true, destroyed = false, busy = false, offline = 0, seenSos = new Set(), farSince = 0, farWarned = false, pickMeet = false, wake = null, ackSeen = false;
    const stop = () => { destroyed = true; timers.forEach(clearInterval); timers = []; if (watchId !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchId); watchId = null; if (wake) { try { wake.release(); } catch (e) { /* жоқ */ } wake = null; } document.removeEventListener("visibilitychange", onVis); if (map) { map.remove(); map = null; } };
    const onVis = () => { if (document.visibilityState === "visible" && sess && !destroyed) { getWake(); tick(); } };
    const getWake = async () => { try { if (navigator.wakeLock && !wake) { wake = await navigator.wakeLock.request("screen"); wake.addEventListener("release", () => { wake = null; }); } } catch (e) { /* рұқсат жоқ */ } };

    // ---- кіру беті ----
    function landing(err) {
      const pre = (getQs().get("code") || "").toUpperCase();
      app.innerHTML = `<section class="scr grp"><header class="tb"><a class="ib" href="${ctx.back || "#/"}" aria-label="Артқа">${ico(ICON.back)}</a><h1>Ұмра тобы</h1></header>
      <div class="gl">
        <div class="gcard"><h3>Топқа қосылу</h3><p>Гид берген топ кодын енгізіңіз. Орныңызды тек осы топтың гиді көреді.</p>
          <input id="gcode" maxlength="6" autocapitalize="characters" autocomplete="off" placeholder="Топ коды, мысалы QGQHS9" value="${esc(pre)}">
          <input id="gname" maxlength="40" autocomplete="name" placeholder="Атыңыз" value="${esc((sess && sess.name) || "")}">
          <button class="gbtn" id="gjoin">Қосылу</button></div>
        <div class="gcard alt"><h3>Гид ретінде топ құру</h3><p>Топ коды жасалады, қажыларды шақырасыз, олардың орнын картада көресіз.</p>
          <input id="gname2" maxlength="40" placeholder="Гидтің аты" value="${esc((sess && sess.name) || "")}">
          <button class="gbtn dark" id="gnew">Топ құру</button></div>
        ${err ? `<p class="gerr">${esc(err)}</p>` : ""}
        <p class="gnote">Орын тек қолданба ашық тұрғанда және сіз қосылғанда бөлісіледі. «Топтан шығу» немесе топ аяқталғанда бөлісу тоқтайды.</p>
        <button class="glink" id="gdemo">Демо режимін көру (серверсіз)</button>
      </div></section>`;
      const need = (el) => { const v = el.value.trim(); if (!v) { el.focus(); toast("Атыңызды жазыңыз"); } return v; };
      document.getElementById("gjoin").onclick = async () => {
        const code = document.getElementById("gcode").value.trim().toUpperCase(), name = need(document.getElementById("gname")); if (!name) return; if (code.length < 4) return toast("Топ кодын енгізіңіз");
        try { const r = await realApi.join(code, name); sess = { role: "pilgrim", code: r.code, id: r.member_id, token: r.token, name, demo: false }; save(sess); demo = false; api = realApi; session(); } catch (e) { fail(e); }
      };
      document.getElementById("gnew").onclick = async () => {
        const name = need(document.getElementById("gname2")); if (!name) return;
        try { const r = await realApi.create(name); sess = { role: "guide", code: r.code, id: r.member_id, token: r.token, name, demo: false }; save(sess); demo = false; api = realApi; session(); } catch (e) { fail(e); }
      };
      document.getElementById("gdemo").onclick = () => {
        app.innerHTML = `<section class="scr grp"><header class="tb"><a class="ib" href="#/group" aria-label="Артқа">${ico(ICON.back)}</a><h1>Демо</h1></header><div class="gl"><div class="gcard"><h3>Қай рөлде көресіз?</h3><p>Серверсіз, жалған қатысушылармен көрсетіледі. Нақты топ емес.</p><button class="gbtn" id="dp">Қажы ретінде</button><button class="gbtn dark" id="dg">Гид ретінде</button></div></div></section>`;
        const go = (role) => { demo = true; api = makeDemoApi(); sess = { role, code: "DEMO42", id: "me", token: "demo", name: role === "guide" ? "Ғалымжан Қасымұлы" : "Мен", demo: true }; save(sess); session(); };
        document.getElementById("dp").onclick = () => go("pilgrim"); document.getElementById("dg").onclick = () => go("guide");
      };
    }
    function fail(e) {
      const m = String((e && e.message) || e);
      if (/group_not_found/.test(m)) return landing("Мұндай топ табылмады немесе ол аяқталған. Кодты тексеріңіз.");
      if (/group_full/.test(m)) return landing("Топ толы.");
      if (/name_required/.test(m)) return landing("Атыңызды жазыңыз.");
      if (e && (e.status === 404 || /no_config|Could not find the function|Failed to fetch|NetworkError/i.test(m))) return landing("Сервер әлі дайын емес: Supabase-те umrah-group-schema.sql іске қосылмаған немесе интернет жоқ. Демо режимін көре аласыз.");
      landing("Қате: " + m);
    }

    // ---- топ беті ----
    function session() {
      destroyed = false; timers.forEach(clearInterval); timers = []; seenSos = new Set(); farSince = 0; farWarned = false; offline = 0; follow = true; sosOn = false; paused = false; myLL = null; ackSeen = false; state = null; pickMeet = false; lastPush = 0;
      app.innerHTML = `<section class="scr grp gs"><div class="gmapwrap"><div id="gmap"></div>
        <a class="gback" href="${ctx.back || "#/"}" aria-label="Артқа">${ico(ICON.back)}</a><div class="gpill" id="gpill"></div></div>
        <div class="gsheet" id="gsheet"><div class="ggrab"></div><div id="gbody"></div></div></section>`;
      initMap(); startGeo(); getWake(); document.addEventListener("visibilitychange", onVis); tick(); timers.push(setInterval(tick, POLL_MS));
      if (navigator.getBattery) navigator.getBattery().then((b) => { battery = Math.round(b.level * 100); }).catch(() => {});
    }
    function initMap() {
      if (typeof L === "undefined") { document.getElementById("gmap").innerHTML = '<p class="mapmsg">Картаны жүктеу үшін интернет қажет.</p>'; return; }
      map = L.map("gmap", { zoomControl: false, attributionControl: false, maxZoom: 20 }).setView(KAABA, 16);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxNativeZoom: 19, maxZoom: 20 }).addTo(map);
      layer = L.layerGroup().addTo(map); routeLayer = L.layerGroup().addTo(map);
      map.on("dragstart", () => { follow = false; });
      map.on("click", async (e) => { if (!pickMeet) return; pickMeet = false; await setMeet({ lat: e.latlng.lat, lng: e.latlng.lng, label: "Жиналу орны" }); });
    }
    function startGeo() {
      if (!navigator.geolocation) return;
      watchId = navigator.geolocation.watchPosition((g) => {
        myLL = [g.coords.latitude, g.coords.longitude]; myLL.acc = g.coords.accuracy;
        if (Date.now() - lastPush > PUSH_MS) push();
        checkFar(); draw();
      }, (e) => { toast(e && e.code === 1 ? "Орынға рұқсат беріңіз: гид сізді көре алмайды" : "Орын анықталмады"); }, { enableHighAccuracy: true, maximumAge: 3000, timeout: 20000 });
    }
    async function push(force) {
      if (!sess || destroyed) return; if (!myLL && !force && !paused) return;
      lastPush = Date.now();
      try { await api.push(sess, { lat: myLL ? myLL[0] : null, lng: myLL ? myLL[1] : null, acc: myLL ? myLL.acc : null, battery, sos: sosOn, paused: paused && sess.role === "pilgrim" }); } catch (e) { if (/denied/.test(String(e.message))) endLocal("Топ аяқталды немесе сізді топтан шығарды"); }
    }
    async function tick() {
      if (destroyed || busy || !sess) return; busy = true;
      try {
        state = await api.state(sess); offline = 0;
        if (state.ended) { busy = false; return endLocal("Топ аяқталды"); }
        const m = me(); if (m) { sosOn = m.status === "sos"; if (sess.role === "pilgrim") { if (sosOn && m.sos_ack && !ackSeen) { ackSeen = true; toast("Гид SOS-ты қабылдады"); } if (!sosOn) ackSeen = false; } }
        if (sess.role === "guide") notifySos();
        render(); draw();
      } catch (e) {
        if (/denied/.test(String(e.message))) { busy = false; return endLocal("Топ аяқталды немесе сізді топтан шығарды"); }
        offline++; const b = document.getElementById("gpill"); if (b) { b.className = "gpill"; b.innerHTML = '<span class="gdot off"></span> Байланыс жоқ'; }
      }
      busy = false;
    }
    function endLocal(msg) { stop(); save(null); sess = null; state = null; toast(msg); landing(); }
    function notifySos() {
      const fresh = (state.members || []).filter((m) => m.role === "pilgrim" && m.status === "sos" && !m.sos_ack && !seenSos.has(m.id + m.sos_at));
      if (!fresh.length) return;
      fresh.forEach((m) => seenSos.add(m.id + m.sos_at)); alertFx(); toast("SOS: " + fresh.map((m) => m.name).join(", "));
    }
    function checkFar() {
      if (!sess || sess.role !== "pilgrim" || !state) return; const g = guideM(), gp = pos(g), mp = myPos();
      if (!gp || !mp || sosOn) { farSince = 0; return; }
      if (hav(mp, gp) > FAR_M) { if (!farSince) farSince = Date.now(); else if (!farWarned && Date.now() - farSince > FAR_WARN_S * 1000) { farWarned = true; alertFx(); toast("Сіз гидтен алыстап кеттіңіз"); render(); } }
      else { farSince = 0; if (farWarned) { farWarned = false; render(); } }
    }

    // ---- есептер ----
    const guideM = () => ((state && state.members) || []).find((m) => m.role === "guide");
    const me = () => ((state && state.members) || []).find((m) => m.id === sess.id);
    const pos = (m) => (m && m.lat != null && m.lng != null ? [m.lat, m.lng] : null);
    const myPos = () => (paused && sess.role === "pilgrim" ? null : myLL) || pos(me());
    function classify(m, from) {
      if (m.status === "sos") return "sos";
      if (m.paused) return "off";
      if (ageS(m.updated_at) > STALE_S || !pos(m)) return "off";
      if (from && hav(from, pos(m)) > FAR_M) return "far";
      return "ok";
    }
    const CHIP = { sos: ["SOS", "sos"], off: ["Сигнал жоқ", "off"], far: ["Алыста", "far"], ok: ["Қалыпты", "ok"] };

    // ---- карта ----
    function draw() {
      if (!map || !layer || !state) return; layer.clearLayers();
      const guide = sess.role === "guide", g = guideM(), gp = guide ? myPos() || pos(g) : pos(g), pts = [];
      const add = (p, html, z, fit) => { if (!p) return; if (fit !== false) pts.push(p); L.marker(p, { zIndexOffset: z || 0, interactive: false, icon: L.divIcon({ className: "", html, iconSize: [0, 0] }) }).addTo(layer); };
      if (state.meet) add([state.meet.lat, state.meet.lng], `<div class="gm meet"><span class="gflag">${ico(ICON.flag, 14)}</span><b>${esc(state.meet.label || "Жиналу орны")}</b></div>`, 600);
      if (guide) {
        (state.members || []).filter((m) => m.role === "pilgrim").forEach((m) => { const c = classify(m, gp), p = pos(m); if (!p) return; add(p, `<div class="gm ${c}"><span class="gd ${c === "sos" && !m.sos_ack ? "pulse" : ""}"></span><b>${esc(m.name.split(" ")[0])}</b></div>`, c === "sos" ? 900 : 0); });
        add(gp, '<div class="gm me"><span class="gdia"></span><b>Сіз (гид)</b></div>', 800);
      } else {
        add(myPos(), `<div class="gm me"><span class="gd you ${sosOn ? "pulse" : ""}"></span><b>Сіз</b></div>`, 800);
        add(gp, `<div class="gm guide"><span class="gdia"></span><b>Гид${myPos() && gp ? " · " + fmtD(hav(myPos(), gp)) : ""}</b></div>`, 700);
        if (myPos() && gp) L.polyline([myPos(), gp], { color: "#2f7cff", weight: 3, dashArray: "2 7", lineCap: "round", interactive: false }).addTo(layer);
      }
      if (follow && pts.length) { const pad = [0, Math.round(window.innerHeight * 0.34)]; if (pts.length === 1) map.setView(pts[0], Math.max(map.getZoom(), 17)); else map.fitBounds(L.latLngBounds(pts).pad(0.35), { maxZoom: 18, paddingBottomRight: pad }); }
    }

    // ---- тақта ----
    function render() {
      const body = document.getElementById("gbody"), pill = document.getElementById("gpill"); if (!body || !state) return;
      const guide = sess.role === "guide", ms = state.members || [], g = guideM(), mp = myPos(), gp = guide ? mp || pos(g) : pos(g);
      const st = document.getElementById("gsheet"), sc = st ? st.scrollTop : 0, keep = {}; ["gnotice"].forEach((id) => { const e = document.getElementById(id); if (e && document.activeElement === e) keep[id] = [e.value, e.selectionStart]; });
      const codeCard = `<div class="gcode"><div><small>Топ коды${guide ? " · " + (state.count || ms.length) + " адам" : ""}</small><b>${esc(state.code)}</b>${guide ? "" : `<small class="sub">Гид сізді ${paused ? "көрмейді (бөлісу тоқтатылған)" : "көріп тұр"} · ${new Date().toTimeString().slice(0, 5)}</small>`}</div>${guide ? `<button class="gshare" id="gshare">${ico(ICON.link, 18)} Шақыру</button>` : ico(ICON.users, 34)}</div>`;
      const noticeBox = state.notice ? `<div class="gnotice"><b>Гидтен хабар</b><span>${esc(state.notice.text)}</span><small>${ago(state.notice.at)}</small></div>` : "";
      if (guide) {
        const pil = ms.filter((m) => m.role === "pilgrim"), cl = pil.map((m) => ({ m, c: classify(m, gp) })), n = { ok: 0, att: 0, sos: 0 };
        cl.forEach(({ c }) => { if (c === "sos") n.sos++; else if (c === "ok") n.ok++; else n.att++; });
        const sosList = cl.filter(({ m, c }) => c === "sos" && !m.sos_ack);
        pill.innerHTML = sosList.length ? `<span class="gdot sos"></span> SOS · ${sosList.length} адам` : `<span class="gdot ok"></span> ${pil.length} қажы`; pill.className = "gpill" + (sosList.length ? " sos" : "");
        body.innerHTML = `<h2 class="gh">Гид панелі</h2>
          ${sosList.map(({ m }) => `<div class="gsos"><div><b>SOS · ${esc(m.name)}${pos(m) && gp ? " — " + fmtD(hav(gp, pos(m))) : ""}</b></div><button class="gack" data-ack="${esc(m.id)}">Қабылдадым</button></div>`).join("")}
          ${codeCard}
          <div class="gstats"><div><b>${n.ok}</b><span>Қалыпты</span></div><div class="att"><b>${n.att}</b><span>Назар</span></div><div class="sos"><b>${n.sos}</b><span>SOS</span></div></div>
          <div class="glist">${cl.length ? cl.sort((a, b) => (a.c === "sos" ? -1 : b.c === "sos" ? 1 : 0)).map(({ m, c }) => `<div class="gmem"><button class="gmsel" data-sel="${esc(m.id)}"><span class="gdot ${c}"></span><span class="gmt"><b>${esc(m.name)}</b><small>${pos(m) && gp ? fmtD(hav(gp, pos(m))) + " · " : ""}${m.paused ? "бөлісу тоқтатылған" : ago(m.updated_at)}${m.battery != null ? " · бат. " + m.battery + "%" : ""}</small></span><i class="gchip ${CHIP[c][1]}">${CHIP[c][0]}</i></button><button class="gkick" data-kick="${esc(m.id)}" aria-label="Топтан шығару">×</button></div>`).join("") : '<p class="gnote">Әзірге ешкім қосылған жоқ. Кодты қажыларға жіберіңіз.</p>'}</div>
          <div class="gtool"><h4>Жиналу орны</h4>${state.meet ? `<p class="gnote ok">${esc(state.meet.label || "Жиналу орны")} қойылған: қажылар картада көреді.</p>` : '<p class="gnote">Қажыларға жиналатын жерді көрсетіңіз.</p>'}<div class="grow"><button class="gbtn sm" id="gmeetme" ${gp ? "" : "disabled"}>${ico(ICON.pin, 16)} Мен тұрған жер</button><button class="gbtn sm dark" id="gmeetpick">${ico(ICON.flag, 16)} Картадан таңдау</button>${state.meet ? '<button class="gbtn sm line" id="gmeetoff">Өшіру</button>' : ""}</div></div>
          <div class="gtool"><h4>Топқа хабарландыру</h4><textarea id="gnotice" maxlength="200" rows="2" placeholder="Мысалы: Намаздан кейін 15:30-да қақпаға жиналамыз">${esc(state.notice ? state.notice.text : "")}</textarea><div class="grow"><button class="gbtn sm" id="gnoticego">Жіберу</button>${state.notice ? '<button class="gbtn sm line" id="gnoticeoff">Өшіру</button>' : ""}</div></div>
          <button class="glink red" id="gend">Топты аяқтау</button>`;
      } else {
        const d = mp && gp ? hav(mp, gp) : null, far = farWarned && d != null && d > FAR_M, mt = state.meet ? [state.meet.lat, state.meet.lng] : null, md = mp && mt ? hav(mp, mt) : null, mine = me();
        pill.innerHTML = g ? `<span class="gdot ${far ? "far" : "ok"}"></span> Гид${d != null ? " · " + fmtD(d) : ""}` : "Гид орны белгісіз"; pill.className = "gpill";
        body.innerHTML = `<h2 class="gh">Менің тобым</h2>${codeCard}
          ${far ? `<div class="gwarn">Сіз гидтен ${fmtD(d)} алыстап кеттіңіз. Гидке қарай жүріңіз.</div>` : ""}
          ${sosOn && mine ? `<div class="gwarn sosw">${mine.sos_ack ? "Гид SOS-ты қабылдады, сізге көмекке келеді." : "SOS гидке жіберілді. Орныңызда тұрыңыз."}</div>` : ""}
          ${noticeBox}
          ${mt ? `<div class="gguide meet"><div><b>Жиналу орны${md != null ? " · " + fmtD(md) : ""}</b><small>${esc(state.meet.label || "")}</small></div><button class="gbtn sm" id="gmeetroute" ${md == null ? "disabled" : ""}>${ico(ICON.flag, 16)} Апар</button></div>` : ""}
          <div class="gguide"><div><b>${d != null ? "Гидке дейін " + fmtD(d) : "Гид орны жоқ"}</b><small>${g ? esc(g.name) + " · " + ago(g.updated_at) : "Гид әлі орнын бөліспеді"}</small></div><button class="gbtn sm" id="groute" ${d == null ? "disabled" : ""}>${ico(ICON.pin, 16)} Гидке апар</button></div>
          <div id="groutenfo"></div>
          <button class="gsosbtn ${sosOn ? "on" : ""}" id="gsos">${sosOn ? "SOS жіберілді · Тоқтату" : "SOS · Адасып қалдым"}</button>
          <label class="gpause"><input type="checkbox" id="gpause" ${paused ? "checked" : ""}><span>Орынды бөлісуді уақытша тоқтату</span></label>
          <p class="gnote">Орныңызды тек осы топтың гиді көреді. Тур біткенде бөлісу өзі өшеді.</p>
          <button class="glink red" id="gleave">Топтан шығу</button>`;
      }
      if (st) st.scrollTop = sc; Object.keys(keep).forEach((id) => { const e = document.getElementById(id); if (e) { e.value = keep[id][0]; e.focus(); e.setSelectionRange(keep[id][1], keep[id][1]); } }); bind();
    }
    // Шақыру: құрылғыда бөлісу мәзірі болса — сол; жоқ болса (http, компьютер) — код, сілтеме, көшіру, WhatsApp, Telegram
    async function shareGroup() {
      const url = location.origin + location.pathname + "#/group?code=" + state.code, text = (window.UI18N ? UI18N.t("Ұмра тобына қосылыңыз. Топ коды:") : "Ұмра тобына қосылыңыз. Топ коды:") + " " + state.code;
      if (navigator.share && window.isSecureContext) { try { await navigator.share({ title: "Ұмра тобы", text, url }); return; } catch (e) { if (e && e.name === "AbortError") return; } }
      document.querySelectorAll(".askwrap.gask").forEach((x) => x.remove());
      const el = document.createElement("div"); el.className = "askwrap gask";
      el.innerHTML = `<div class="ask-bd" data-no></div><div class="ask-p gshare-p" role="dialog"><b>Топқа шақыру</b><p>Кодты немесе сілтемені қажыларға жіберіңіз.</p><div class="gsc">${esc(state.code)}</div><input id="gslink" readonly value="${esc(url)}"><div class="gsb"><button class="btn sm" id="gscopy">Көшіру</button><a class="btn line sm" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}">WhatsApp</a><a class="btn line sm" target="_blank" rel="noopener" href="https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}">Telegram</a></div><button class="glink" data-no>Жабу</button></div>`;
      document.body.appendChild(el);
      el.querySelectorAll("[data-no]").forEach((b) => (b.onclick = () => el.remove()));
      document.getElementById("gscopy").onclick = async () => {
        const full = text + "\n" + url; let ok = false;
        try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(full); ok = true; } } catch (e) { /* көшіру қолжетімсіз */ }
        if (!ok) { const inp = document.getElementById("gslink"); inp.value = full; inp.select(); inp.setSelectionRange(0, 9999); try { ok = document.execCommand("copy"); } catch (e) { ok = false; } inp.value = url; }
        toast(ok ? "Көшірілді" : "Сілтемені ұзақ басып көшіріңіз");
      };
    }
    async function setMeet(m) { try { await api.meet(sess, m); toast(m ? "Жиналу орны қойылды" : "Жиналу орны өшірілді"); tick(); } catch (e) { toast("Орындалмады"); } }
    function bind() {
      const $ = (id) => document.getElementById(id), on = (id, fn) => { const e = $(id); if (e) e.onclick = fn; };
      document.querySelectorAll("[data-ack]").forEach((b) => (b.onclick = async () => { try { await api.ack(sess, b.dataset.ack); tick(); } catch (e) { toast("Қабылдау мүмкін болмады"); } }));
      document.querySelectorAll("[data-sel]").forEach((b) => (b.onclick = () => { const m = (state.members || []).find((x) => x.id === b.dataset.sel); if (m && pos(m) && map) { follow = false; map.setView(pos(m), 18); } }));
      document.querySelectorAll("[data-kick]").forEach((b) => (b.onclick = () => { const m = (state.members || []).find((x) => x.id === b.dataset.kick); confirmBox("Топтан шығарасыз ба?", (m ? m.name : "Қатысушы") + " топтан шығарылады, орны көрінбейді.", "Иә, шығару", async () => { try { await api.kick(sess, b.dataset.kick); tick(); } catch (e) { toast("Орындалмады"); } }); }));
      on("gshare", () => shareGroup());
      on("gmeetme", () => { const p = myPos(); if (p) setMeet({ lat: p[0], lng: p[1], label: "Жиналу орны" }); });
      on("gmeetpick", () => { pickMeet = true; toast("Картадан жиналу орнын басыңыз"); const s = $("gsheet"); if (s) s.scrollTop = 0; });
      on("gmeetoff", () => setMeet(null));
      on("gnoticego", async () => { const t = ($("gnotice").value || "").trim(); try { await api.notice(sess, t); toast(t ? "Хабарландыру жіберілді" : "Өшірілді"); tick(); } catch (e) { toast("Орындалмады"); } });
      on("gnoticeoff", async () => { try { await api.notice(sess, ""); tick(); } catch (e) { toast("Орындалмады"); } });
      on("gend", () => confirmBox("Топты аяқтайсыз ба?", "Барлық қатысушының орнын бөлісу тоқтайды, деректер өшіріледі.", "Иә, аяқтау", async () => { try { await api.leave(sess); } catch (e) { /* желі жоқ */ } endLocal("Топ аяқталды"); }));
      on("gleave", () => confirmBox("Топтан шығасыз ба?", "Гид сізді енді көрмейді.", "Иә, шығу", async () => { try { await api.leave(sess); } catch (e) { /* желі жоқ */ } endLocal("Топтан шықтыңыз"); }));
      on("gsos", () => { if (sosOn) { sosOn = false; push(true); render(); toast("SOS тоқтатылды"); } else confirmBox("SOS жіберілсін бе?", "Гид сіздің орныңызды қызыл белгімен көреді.", "Иә, SOS жіберу", () => { sosOn = true; paused = false; push(true); render(); toast("SOS гидке жіберілді"); }); });
      const pc = $("gpause"); if (pc) pc.onchange = () => { paused = pc.checked; push(true); tick(); toast(paused ? "Орын бөлісу тоқтатылды" : "Орын бөлісу қайта қосылды"); };
      on("groute", () => routeTo(pos(guideM()), "Гидке")); on("gmeetroute", () => state.meet && routeTo([state.meet.lat, state.meet.lng], "Жиналу орнына"));
    }
    async function routeTo(gp, label) {
      const a = myPos(), box = document.getElementById("groutenfo"); if (!a || !gp || !box) return;
      box.innerHTML = '<p class="gnote">Жол есептелуде…</p>';
      try {
        const r = (await (await fetch(`https://routing.openstreetmap.de/routed-foot/route/v1/foot/${a[1]},${a[0]};${gp[1]},${gp[0]}?overview=full&geometries=geojson`)).json()).routes[0], c = r.geometry.coordinates.map(([x, y]) => [y, x]);
        if (map) { routeLayer.clearLayers(); L.polyline(c, { color: "#fff", weight: 9, lineCap: "round", interactive: false }).addTo(routeLayer); L.polyline(c, { color: "#e8730c", weight: 5, lineCap: "round", interactive: false }).addTo(routeLayer); follow = false; map.fitBounds(L.latLngBounds(c.concat([a, gp])).pad(0.3), { maxZoom: 18, paddingBottomRight: [0, Math.round(window.innerHeight * 0.34)] }); }
        box.innerHTML = `<p class="gnote ok">${label} жаяу ≈ ${Math.max(1, Math.round(r.duration / 60))} мин · ${fmtD(r.distance)}. Жол картада көрсетілген.</p>`;
      } catch (e) { box.innerHTML = '<p class="gnote">Жолды есептеу мүмкін болмады. Картадағы көк сызықпен жүріңіз.</p>'; }
    }
    function confirmBox(title, text, yes, fn) {
      document.querySelectorAll(".askwrap.gask").forEach((x) => x.remove()); const el = document.createElement("div"); el.className = "askwrap gask";
      el.innerHTML = `<div class="ask-bd" data-no></div><div class="ask-p" role="alertdialog"><b>${esc(title)}</b><p>${esc(text)}</p><div class="ask-b"><button class="btn line sm" data-no>Жоқ</button><button class="btn sm danger" data-yes>${esc(yes)}</button></div></div>`;
      document.body.appendChild(el);
      el.querySelectorAll("[data-no]").forEach((b) => (b.onclick = () => el.remove())); el.querySelector("[data-yes]").onclick = () => { el.remove(); fn(); };
    }

    // ---- іске қосу ----
    if (sess && sess.id) session(); else landing();
    return stop;
  }
  window.UmrahGroup = { mount };
})();
