/* マルちゃんのペースでいいよ - 共通スクリプト（window.CJ で各ページから使う） */
(function () {
  "use strict";

  const KEY_DATA = 'cj_data';         // 学習データ（バックアップ対象）
  const KEY_PREFS = 'cj_prefs';       // 設定（端末ごと・バックアップ対象外）
  const APP_VERSION = 'v15';
  const DATA_VERSION = 4;             // v2: 漢字(kanji)・音読(read) / v3: 練習カード(prac)・日替わり(daily) / v4: ようちゃんへの質問(asks)・都道府県(pref)。古い形もそのまま読める
  const BACKUP_APP_ID = 'casual-japanese-backup';
  const BACKUP_VERSION = 4;           // v1〜v3 のバックアップも読み込める

  /* ---------- 基本ユーティリティ ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  // 端末のローカル日付 (YYYY-MM-DD)
  function dateKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, val) { try { localStorage.setItem(key, val); return true; } catch (e) { return false; } }
  function shuffle(a) { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }

  /* ---------- 設定 ---------- */
  const DEFAULT_PREFS = { romaji: true, rate: 0.9, autoSpeak: true, lang: 'en', readKanji: false, theme: 'pink', drillSecs: 5, voiceMode: 'natural', voiceName: '', voiceNoted: false };
  const THEMES = ['pink', 'matcha', 'sky'];
  function getPrefs() { try { return Object.assign({}, DEFAULT_PREFS, JSON.parse(safeGet(KEY_PREFS)) || {}); } catch (e) { return Object.assign({}, DEFAULT_PREFS); } }
  function setPref(k, v) { const p = getPrefs(); p[k] = v; safeSet(KEY_PREFS, JSON.stringify(p)); applyPrefs(); }
  // ローマ字の表示/非表示は body のクラスで切り替える（.romaji を隠す）
  function applyPrefs() {
    if (!document.body) return;
    const p = getPrefs();
    document.body.classList.toggle('no-romaji', !p.romaji);
    // 色のテーマ（🌸 ピンク / 🍵 まっちゃ / 🫧 パステルブルー）
    THEMES.forEach(th => document.body.classList.toggle('theme-' + th, (THEMES.includes(p.theme) ? p.theme : 'pink') === th));
  }
  function drillSecs() { const n = Number(getPrefs().drillSecs); return [3, 5, 8].includes(n) ? n : 5; }

  /* ---------- 画面の言語（英語 / 日本語） ---------- */
  function lang() { return getPrefs().lang === 'ja' ? 'ja' : 'en'; }
  // 画面の言葉。vars の {名前} を置き換える（値はそのまま入るので、必要なら呼ぶ側で esc する）
  function t(key, vars) {
    const row = (window.CJ_I18N || {})[key];
    let s = row ? (row[lang() === 'ja' ? 1 : 0] || row[0]) : key;
    if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  // データの項目：日本語表示のときは 〜Ja があればそれを使う
  function tx(obj, field) {
    if (!obj) return '';
    if (lang() === 'ja' && obj[field + 'Ja']) return obj[field + 'Ja'];
    return obj[field] || '';
  }
  // data-i18n="キー" の要素に言葉を入れる（辞書は自分で書いた内容なので HTML として入れる）
  function applyI18n(root) {
    root = root || document;
    document.documentElement.lang = lang();
    root.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    const b = document.getElementById('langBtn');
    if (b) { b.textContent = t('lang.toggle'); b.setAttribute('aria-label', t('lang.toggleLabel')); }
    root.querySelectorAll('[data-say]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.slow === '1' ? 'say.slow' : 'say.play')); });
  }
  function setLang(l) {
    setPref('lang', l === 'ja' ? 'ja' : 'en');
    applyI18n(); updateStreakBadge();
    document.dispatchEvent(new CustomEvent('cj:lang'));   // 各ページはこれを受けて、動きのある部分を描き直す
  }
  // ヘッダーに「🌐 あ / 🌐 EN」ボタンを入れる
  function addLangButton() {
    const head = document.querySelector('header');
    if (!head || document.getElementById('langBtn')) return;
    const wrap = document.createElement('span');
    wrap.className = 'head-right';
    const b = document.createElement('button');
    b.id = 'langBtn'; b.className = 'lang-btn'; b.type = 'button';
    b.addEventListener('click', () => setLang(lang() === 'ja' ? 'en' : 'ja'));
    const badge = document.getElementById('streakBadge');
    wrap.appendChild(b);
    if (badge) wrap.appendChild(badge);
    head.appendChild(wrap);
  }

  /* ---------- 学習データ ----------
     { v: 2, learned: [カードID], kanji: [おぼえた漢字], wrong: { 問題ID: 回数 }, history: { 'YYYY-MM-DD': true },
       quiz: { correct, total }, read: { '会話ID:行番号:c|p': いちばん良い点数 },
       prac: { 練習カードのキー: { ok: 言えた回数, ng: 出なかった回数, l: 'ok'|'ng' 最後の結果, d: 最後の日 } },
       daily: { 'YYYY-MM-DD': { lunch: { k: [キー], r: ['c'|'p'], s: [言えた数, 枚数] or null }, night: {…} } },
       asks: [{ id, t: 時刻, type: 種類, text: 本文, ctx: どこから, done: 解決した }],  pref: [覚えた都道府県], words: [覚えた単語] */
  function defaultData() { return { v: DATA_VERSION, learned: [], kanji: [], wrong: {}, history: {}, quiz: { correct: 0, total: 0 }, read: {}, prac: {}, daily: {}, asks: [], pref: [], words: [] }; }
  const ASK_TYPES = ['say', 'read', 'kanji', 'voice', 'q', 'feature', 'other'];
  function normAsks(list) {
    const seen = new Set(), out = [];
    (Array.isArray(list) ? list : []).forEach(a => {
      if (!a || typeof a !== 'object' || typeof a.text !== 'string' || !a.text.trim()) return;
      const id = String(a.id || ''); if (!id || seen.has(id)) return;
      seen.add(id);
      out.push({ id, t: Number(a.t) || Date.now(), type: ASK_TYPES.includes(a.type) ? a.type : 'other', text: a.text.trim().slice(0, 2000), ctx: typeof a.ctx === 'string' ? a.ctx.slice(0, 300) : '', done: !!a.done });
    });
    return out.sort((x, y) => y.t - x.t).slice(0, 300);
  }
  const isDate = k => /^\d{4}-\d{2}-\d{2}$/.test(String(k));
  function normSlot(v) {
    if (!v || typeof v !== 'object') return null;
    const k = (Array.isArray(v.k) ? v.k : []).filter(x => typeof x === 'string' && x.length < 100).slice(0, 30);
    if (!k.length) return null;
    const r = k.map((x, i) => (Array.isArray(v.r) && v.r[i] === 'p') ? 'p' : 'c');
    let sc = null;
    if (Array.isArray(v.s) && v.s.length === 2) { const t = Math.max(0, Math.min(30, Math.floor(Number(v.s[1]) || 0))); sc = [Math.max(0, Math.min(t, Math.floor(Number(v.s[0]) || 0))), t]; }
    return { k, r, s: sc };
  }
  function strList(a, max, maxLen) { return Array.from(new Set((Array.isArray(a) ? a : []).filter(x => typeof x === 'string' && x && x.length < maxLen))).slice(0, max); }
  function normalizeData(s) {
    const d = defaultData();
    if (!s || typeof s !== 'object') return d;
    d.learned = strList(s.learned, 2000, 60);
    d.kanji = strList(s.kanji, 3000, 4);
    if (s.wrong && typeof s.wrong === 'object' && !Array.isArray(s.wrong)) Object.keys(s.wrong).slice(0, 2000).forEach(k => {
      const n = Math.floor(Number(s.wrong[k]) || 0);
      if (k.length < 80 && n > 0) d.wrong[k] = Math.min(n, 5);
    });
    if (s.history && typeof s.history === 'object') Object.keys(s.history).forEach(k => { if (/^\d{4}-\d{2}-\d{2}$/.test(k) && s.history[k]) d.history[k] = true; });
    const q = s.quiz || {};
    d.quiz.total = Math.max(0, Math.floor(Number(q.total) || 0));
    d.quiz.correct = Math.max(0, Math.min(d.quiz.total, Math.floor(Number(q.correct) || 0)));
    if (s.read && typeof s.read === 'object' && !Array.isArray(s.read)) Object.keys(s.read).slice(0, 2000).forEach(k => {
      const n = Math.round(Number(s.read[k]) || 0);
      if (k.length < 80 && n > 0) d.read[k] = Math.min(100, n);
    });
    if (s.prac && typeof s.prac === 'object' && !Array.isArray(s.prac)) Object.keys(s.prac).slice(0, 3000).forEach(k => {
      const e = s.prac[k]; if (!e || typeof e !== 'object' || k.length >= 100) return;
      d.prac[k] = { ok: Math.max(0, Math.floor(Number(e.ok) || 0)), ng: Math.max(0, Math.floor(Number(e.ng) || 0)), l: e.l === 'ng' ? 'ng' : 'ok', d: isDate(e.d) ? e.d : '' };
    });
    if (s.daily && typeof s.daily === 'object' && !Array.isArray(s.daily)) Object.keys(s.daily).filter(isDate).sort().slice(-60).forEach(k => {
      const v = s.daily[k] || {}, lunch = normSlot(v.lunch), night = normSlot(v.night), pat = normSlot(v.pat);
      if (lunch || night || pat) d.daily[k] = { lunch, night, pat };
    });
    d.asks = normAsks(s.asks);
    d.pref = strList(s.pref, 100, 10);
    d.words = strList(s.words, 3000, 30);
    return d;
  }
  function getData() { try { return normalizeData(JSON.parse(safeGet(KEY_DATA))); } catch (e) { return defaultData(); } }
  function saveData(d) { return safeSet(KEY_DATA, JSON.stringify(normalizeData(d))); }

  function touchToday(d) { d.history[dateKey()] = true; }
  function isLearned(id) { return getData().learned.includes(id); }
  function toggleIn(field, id) {
    const d = getData(), i = d[field].indexOf(id);
    if (i >= 0) d[field].splice(i, 1); else d[field].push(id);
    touchToday(d); saveData(d); updateStreakBadge();
    return i < 0;
  }
  function toggleLearned(id) { return toggleIn('learned', id); }
  function isKanjiLearned(k) { return getData().kanji.includes(k); }
  function toggleKanji(k) { return toggleIn('kanji', k); }
  // クイズの結果。間違えたら「間違いリスト」に入れ、正解したら1つ減らす
  function recordQuiz(qid, ok) {
    const d = getData();
    d.quiz.total += 1;
    if (ok) {
      d.quiz.correct += 1;
      const n = (d.wrong[qid] || 0) - 1;
      if (n > 0) d.wrong[qid] = n; else delete d.wrong[qid];
    } else {
      d.wrong[qid] = Math.min((d.wrong[qid] || 0) + 1, 5);
    }
    touchToday(d); saveData(d); updateStreakBadge();
  }
  // 💌 ようちゃんへの質問・おねがい
  function addAsk(type, text, ctx) {
    const d = getData();
    const a = { id: 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), t: Date.now(), type, text, ctx: ctx || '', done: false };
    d.asks = normAsks([a].concat(d.asks)); saveData(d);
    return a;
  }
  function updateAsk(id, fn) { const d = getData(); const a = d.asks.find(x => x.id === id); if (a) { fn(a); if (a.del) d.asks = d.asks.filter(x => x !== a); saveData(d); } }
  function toggleWord(id) { return toggleIn('words', id); }
  function togglePref(code) { const d = getData(), i = d.pref.indexOf(code); if (i >= 0) d.pref.splice(i, 1); else d.pref.push(code); touchToday(d); saveData(d); updateStreakBadge(); return i < 0; }
  // 音読の点数（いちばん良い点数だけ残す）
  function recordRead(key, score) {
    const d = getData();
    d.read[key] = Math.max(d.read[key] || 0, Math.round(score));
    touchToday(d); saveData(d); updateStreakBadge();
    return d.read[key];
  }
  // 練習カード1枚の結果
  function recordPrac(key, ok) {
    const d = getData(), e = d.prac[key] || { ok: 0, ng: 0, l: 'ok', d: '' };
    if (ok) e.ok++; else e.ng++;
    e.l = ok ? 'ok' : 'ng'; e.d = dateKey();
    d.prac[key] = e; touchToday(d); saveData(d); updateStreakBadge();
  }
  // 日替わりの練習（ひる／よる）を保存。s を入れると「おわった」になる
  function saveDailySlot(date, slot, v) {
    const d = getData();
    d.daily[date] = d.daily[date] || { lunch: null, night: null, pat: null };
    d.daily[date][slot] = normSlot(v);
    if (v && v.s) touchToday(d);
    saveData(d); updateStreakBadge();
  }
  function markStudied() { const d = getData(); touchToday(d); saveData(d); updateStreakBadge(); }

  // 連続日数（今日まだなら昨日までの連続を数える）
  function calcStreak(history) {
    const d = new Date(); d.setHours(12, 0, 0, 0);
    if (!history[dateKey(d)]) d.setDate(d.getDate() - 1);
    let n = 0;
    while (history[dateKey(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function updateStreakBadge() {
    const el = document.getElementById('streakBadge');
    if (!el) return;
    const n = calcStreak(getData().history);
    el.textContent = n === 1 ? t('streak1') : t('streak', { n });
  }

  /* ---------- 読み上げ（日本語） ---------- */
  let cachedVoices = [];
  function loadVoices() { if ('speechSynthesis' in window) cachedVoices = window.speechSynthesis.getVoices() || []; }
  if ('speechSynthesis' in window) { loadVoices(); window.speechSynthesis.onvoiceschanged = loadVoices; }
  // 日本語の声の一覧（よさそうな順）。端末に入っている「拡張」「プレミアム」「Siri」「Google」の声を優先する
  function voiceScore(v) {
    const n = v.name || '';
    let sc = 0;
    if (/premium|プレミアム/i.test(n)) sc += 50;
    if (/enhanced|拡張|高品質/i.test(n)) sc += 40;
    if (/siri/i.test(n)) sc += 35;
    if (/google/i.test(n)) sc += 30;
    if (/neural|natural|online/i.test(n)) sc += 25;
    if (/o-?ren|kyoko|otoya|hattori/i.test(n)) sc += 5;
    if (v.localService === false) sc += 3;
    return sc;
  }
  function jaVoices() {
    if (!cachedVoices.length) loadVoices();
    return cachedVoices.filter(v => /^ja/i.test(String(v.lang).replace('_', '-'))).sort((a, b) => voiceScore(b) - voiceScore(a));
  }
  function jaVoice() {
    const list = jaVoices(), want = getPrefs().voiceName;
    return (want && list.find(v => v.name === want)) || list[0] || null;
  }
  function hasJaVoice() { return !!jaVoice(); }

  /* ---- 読み上げる文：ひらがなだけだと単語の切れ目が分からず、イントネーションがおかしくなりやすい。
     アプリ内の文は「漢字の書き方」を持っているので、それを読ませる（しぜん モード）。
     ただし、機械がまちがえやすい読み（紅葉＝もみじ、十分＝じゅうぶん など）は、ひらがなで読ませる */
  const FORCE_KANA = new Set(['紅葉|こうよう', '明日|あした', '本当|ほんと', '空|あ', '空|す', '方|かた', '生|なま', '間|ま', '入|はい',
    '何|なに', '何|なん', '七|しち', '十分|じゅっぷん', '竹林|たけばやし', '一番|いちばん', '今日|きょう', '一人|ひとり', '二人|ふたり', '上手|じょうず']);
  let kjMap = null;   // ひらがな（スペースなし）→ 漢字の書き方
  function addKj(kana, kj) { if (kana && kj && /\{/.test(kj)) kjMap[speechText(kana)] = kj; }
  function buildKjMap() {
    kjMap = {};
    const D = window.CJ_DATA, G = window.CJ_GRAMMAR, R = window.CJ_READ, E = window.CJ_EXAMPLES, W = window.CJ_WORDS, K = window.CJ_KANJI, P = window.CJ_PREF;
    if (D) {
      D.CARDS.forEach(c => { addKj(c.c[0], c.c[2]); addKj(c.p[0], c.p[2]); (c.r || []).forEach(r => addKj(r[0], r[3])); });
      D.ENDINGS.forEach(e => e.ex.forEach(x => addKj(x[0], x[5])));
      D.COMPARE.forEach(c => c.rows.forEach(r => addKj(r[0], r[4])));
    }
    if (G) G.GRAMMAR.forEach(g => g.ex.forEach(e => { addKj(e[1], e[5]); addKj(e[3], e[6]); }));
    if (R) R.PASSAGES.forEach(p => p.lines.forEach(l => { addKj(l[1][0], l[1][2]); addKj(l[2][0], l[2][2]); }));
    if (E) E.EXAMPLES.forEach(e => { addKj(e[2][0], e[2][2]); addKj(e[3][0], e[3][2]); });
    if (W) W.WORDS.forEach(w => addKj(w.kana, w.kj));
    if (K) K.KANJI.forEach(k => k.words.forEach(w => addKj(reading(w[0]), w[0])));
    if (P) P.PREFS.forEach(x => { addKj(reading(x.kj), x.kj); addKj(reading(x.cap), x.cap); });
    if (window.CJ_PATTERNS) window.CJ_PATTERNS.items.forEach(it => { addKj(it.c[0], it.c[2]); addKj(it.p[0], it.p[2]); });
  }
  function naturalText(kj) {
    return String(kj).replace(/\{([^|}]+)\|([^}]+)\}/g, (m, b, r) => FORCE_KANA.has(b + '|' + r) ? r : b);
  }
  // 表示用のスペースと「〜」は読み上げでは取り除く
  function speechText(kana) { return String(kana || '').replace(/[\s　〜~]/g, ''); }
  function utterText(kana) {
    const plainKana = speechText(kana);
    if (getPrefs().voiceMode === 'kana') return plainKana;
    if (!kjMap) buildKjMap();
    const kj = kjMap[plainKana];
    return kj ? speechText(naturalText(kj)) : plainKana;
  }
  // onEnd: 読み終わったときに呼ぶ（「ぜんぶ きく」用）
  function ttsSpeak(kana, slow, onEnd) {
    if (!('speechSynthesis' in window) || !kana) return false;
    const synth = window.speechSynthesis;
    const go = () => {
      const u = new SpeechSynthesisUtterance(utterText(kana));
      u.lang = 'ja-JP';
      const base = Number(getPrefs().rate) || 0.9;
      u.rate = slow ? Math.max(0.4, base * 0.65) : base;
      const v = jaVoice(); if (v) u.voice = v;
      if (onEnd) { u.onend = onEnd; u.onerror = onEnd; }
      try { synth.resume(); } catch (e) {}
      synth.speak(u);
    };
    // 再生中に cancel → すぐ speak すると新しい音声が捨てられることがあるので少し待つ
    if (synth.speaking || synth.pending) { synth.cancel(); setTimeout(go, 120); } else go();
    // はじめて読み上げたときに一度だけ：「機械の声なので、イントネーションは本物とちがうことがある」
    if (!getPrefs().voiceNoted) { setPref('voiceNoted', true); setTimeout(() => toast(t('voice.caution')), 400); }
    return true;
  }
  /* ---------- ようちゃん の こえ（録音した声） ----------
     声のファイル名：ひらがな（スペース・〜なし）から作る短い番号。v_xxxxxxxx.wav
     ① この スマホ で 録音した声（IndexedDB）→ ② サイトの voice/ フォルダ（voice/index.json に一覧）→ ③ 機械の声 の順に使う */
  const VOICE_DIR = 'voice/';
  function hashKey(str) { let h = 0x811c9dc5; for (const ch of str) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return ('0000000' + h.toString(16)).slice(-8); }
  function voiceId(kana) { return 'v_' + hashKey(speechText(kana)); }
  const siteVoices = new Set(), localVoices = {};   // localVoices: id → 再生用URL
  let voiceDb = null;
  function openVoiceDb() {
    return new Promise((res, rej) => {
      if (!('indexedDB' in window)) { rej(new Error('no idb')); return; }
      const r = indexedDB.open('cj_voice', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('clips', { keyPath: 'id' });
      r.onsuccess = () => { voiceDb = r.result; res(voiceDb); };
      r.onerror = () => rej(r.error);
    });
  }
  function idbAll() {
    return openVoiceDb().then(db => new Promise((res, rej) => {
      const q = db.transaction('clips').objectStore('clips').getAll();
      q.onsuccess = () => res(q.result || []); q.onerror = () => rej(q.error);
    }));
  }
  function idbPut(rec) { return openVoiceDb().then(db => new Promise((res, rej) => { const tx = db.transaction('clips', 'readwrite'); tx.objectStore('clips').put(rec); tx.oncomplete = res; tx.onerror = () => rej(tx.error); })); }
  function idbDel(id) { return openVoiceDb().then(db => new Promise((res, rej) => { const tx = db.transaction('clips', 'readwrite'); tx.objectStore('clips').delete(id); tx.oncomplete = res; tx.onerror = () => rej(tx.error); })); }
  const voicesReady = Promise.all([
    fetch(VOICE_DIR + 'index.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).then(j => { if (j && Array.isArray(j.ids)) j.ids.forEach(id => siteVoices.add(String(id))); }).catch(() => {}),
    idbAll().then(list => list.forEach(rec => { if (rec && rec.blob) localVoices[rec.id] = URL.createObjectURL(rec.blob); })).catch(() => {})
  ]).then(() => { markVoiceButtons(); document.dispatchEvent(new CustomEvent('cj:voices')); });
  function voiceUrl(kana) { const id = voiceId(kana); return localVoices[id] || (siteVoices.has(id) ? VOICE_DIR + id + '.wav' : null); }
  function hasVoice(kana) { const id = voiceId(kana); return localVoices[id] ? 'local' : siteVoices.has(id) ? 'site' : ''; }
  function saveLocalVoice(kana, blob) {
    const id = voiceId(kana);
    return idbPut({ id, kana: speechText(kana), blob, t: Date.now() }).then(() => { if (localVoices[id]) URL.revokeObjectURL(localVoices[id]); localVoices[id] = URL.createObjectURL(blob); markVoiceButtons(); return id; });
  }
  function deleteLocalVoice(kana) {
    const id = voiceId(kana);
    return idbDel(id).then(() => { if (localVoices[id]) URL.revokeObjectURL(localVoices[id]); delete localVoices[id]; markVoiceButtons(); });
  }
  function localVoiceRecords() { return idbAll(); }
  function siteVoiceIds() { return Array.from(siteVoices); }
  // 🔊 ボタンに ●（ようちゃん の こえ あり）の印をつける。あとから出てくるボタンにも つける
  function markVoiceButtons(root) {
    (root || document).querySelectorAll('[data-say]').forEach(b => b.classList.toggle('has-voice', !!hasVoice(b.dataset.say)));
  }
  if ('MutationObserver' in window) new MutationObserver(() => markVoiceButtons()).observe(document.documentElement, { childList: true, subtree: true });
  // 声の再生は1つの audio を使い回す（iPhone は、最初にタップで鳴らした audio なら、あとから続けて鳴らせる）
  const player = typeof Audio !== 'undefined' ? new Audio() : null;
  if (player) { player.preload = 'auto'; try { player.preservesPitch = true; player.webkitPreservesPitch = true; } catch (e) {} }
  function speak(kana, slow, onEnd) {
    if (!kana) return false;
    const url = player && voiceUrl(kana);
    if (url) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      player.pause();
      player.onended = onEnd || null;
      player.onerror = () => { player.onerror = null; ttsSpeak(kana, slow, onEnd); };
      player.src = url;
      player.playbackRate = slow ? 0.75 : 1;
      const pr = player.play();
      if (pr && pr.catch) pr.catch(() => ttsSpeak(kana, slow, onEnd));
      return true;
    }
    return ttsSpeak(kana, slow, onEnd);
  }
  function stopSpeak() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); if (player) player.pause(); }
  function autoSpeak(kana) { if (getPrefs().autoSpeak !== false) speak(kana); }
  // iPhone の Safari は最初の読み上げが画面タップの中でないと音が出ないので、最初のタップで無音の読み上げをしておく
  (function unlockSpeech() {
    let done = false;
    const unlock = () => {
      if (done) return; done = true;
      try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; window.speechSynthesis.speak(u); } catch (e) {}
      // 声の audio も、ここで一度 音なしで鳴らしておく（iPhone 用）
      try { if (player && !player.src) { player.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA='; player.play().catch(() => {}); } } catch (e) {}
      ['touchend', 'click', 'keydown'].forEach(ev => document.removeEventListener(ev, unlock, true));
    };
    ['touchend', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, unlock, true));
  })();

  /* ---------- 音声認識（日本語の音読チェック） ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognitionSupported = !!SR;
  const RECOG_ERR = { 'not-allowed': 'err.mic', 'service-not-allowed': 'err.mic', 'no-speech': 'err.noSpeech', 'audio-capture': 'err.mic', 'network': 'err.network' };
  let activeRec = null;
  // opts: { onState(listening), onInterim(text), onFinal([候補...]), onError(メッセージ) }
  function listen(opts) {
    if (!recognitionSupported) return null;
    if (activeRec) { try { activeRec.abort(); } catch (e) {} activeRec = null; }
    stopSpeak();   // お手本の音声を拾わないように
    const rec = new SR();
    rec.lang = 'ja-JP'; rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 5;
    let alts = [], err = null;
    rec.onstart = () => opts.onState && opts.onState(true);
    rec.onresult = e => {
      const res = e.results[e.results.length - 1];
      alts = []; for (let k = 0; k < res.length; k++) alts.push(res[k].transcript);
      const all = Array.from(e.results).map(r => r[0].transcript).join('');
      opts.onInterim && opts.onInterim(all);
      if (e.results.length > 1) alts = [all].concat(alts);
    };
    rec.onerror = e => { err = e.error; };
    rec.onend = () => {
      activeRec = null;
      // 結果を先に渡してから「終わった」を知らせる（ページは onState(false) で描き直す）
      if (err && err !== 'aborted') opts.onError && opts.onError(t(RECOG_ERR[err] || 'err.recog'));
      else if (!err) { if (alts.length) opts.onFinal && opts.onFinal(alts); else opts.onError && opts.onError(t('err.noSpeech')); }
      opts.onState && opts.onState(false);
    };
    try { rec.start(); activeRec = rec; } catch (e) { opts.onError && opts.onError(t('err.recog')); return null; }
    return rec;
  }
  // 比べるための形にそろえる：カタカナ→ひらがな、スペース・記号を消す
  function normJa(s) {
    return String(s || '').normalize('NFKC').toLowerCase()
      .replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60))
      .replace(/[\s、。，．,.!?！？〜~ー「」…・\-]/g, '');
  }
  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  // 正解（ひらがな・漢字の書き方など複数）と聞き取り候補を1文字ずつ比べて、いちばん近い点数（0〜100）を返す
  function scoreJa(targets, heardList) {
    let best = { score: 0, heard: heardList[0] || '' };
    targets.forEach(tg => {
      const a = normJa(tg); if (!a) return;
      heardList.forEach(h => {
        const b = normJa(h);
        const sc = Math.max(0, Math.round((1 - levenshtein(a, b) / Math.max(a.length, b.length)) * 100));
        if (sc > best.score) best = { score: sc, heard: h };
      });
    });
    return best;
  }
  const PASS_SCORE = 75;

  /* ---------- 漢字の書き方（{漢字|よみ}） ---------- */
  function ruby(s) {
    return String(s || '').split(/(\{[^|}]+\|[^}]+\})/).map(part => {
      const m = /^\{([^|}]+)\|([^}]+)\}$/.exec(part);
      return m ? '<ruby>' + esc(m[1]) + '<rt>' + esc(m[2]) + '</rt></ruby>' : esc(part);
    }).join('');
  }
  function reading(s) { return String(s || '').replace(/\{([^|}]+)\|([^}]+)\}/g, '$2'); }
  function plain(s) { return String(s || '').replace(/\{([^|}]+)\|([^}]+)\}/g, '$1'); }
  // 「かんじ で みる」：どのページでも同じ設定（readKanji）。オンなら漢字＋ふりがな、オフならひらがな
  function showKanji() { return !!getPrefs().readKanji; }
  function jaHtml(f) { return showKanji() && f && f[2] ? ruby(f[2]) : esc(f ? f[0] : ''); }
  // data-kanji-toggle のチェックボックスを全部そろえて、切り替えたら cj:kanji を出す
  function syncKanjiToggles() { document.querySelectorAll('[data-kanji-toggle]').forEach(el => { el.checked = showKanji(); }); }
  document.addEventListener('change', e => {
    if (!e.target.matches || !e.target.matches('[data-kanji-toggle]')) return;
    setPref('readKanji', e.target.checked); syncKanjiToggles();
    document.dispatchEvent(new CustomEvent('cj:kanji'));
  });

  /* ---------- アプリの外で、ネイティブの使い方をさがす ---------- */
  // YouTube（動画検索）・YouGlish（その言葉を話している動画の場面にとぶ）・Instagram（ハッシュタグ）
  function extLinks(f) {
    const q = plain(f && f[2] ? f[2] : (f ? f[0] : '')).replace(/[\s　〜~]/g, '');
    if (!q) return '';
    const tag = q.replace(/[、。！？!?「」…・,.\s]/g, '');
    const a = (href, label, aria) => '<a class="ext-link" href="' + esc(href) + '" target="_blank" rel="noopener" aria-label="' + esc(aria) + '">' + label + '</a>';
    return '<span class="ext-links">' +
      a('https://www.youtube.com/results?search_query=' + encodeURIComponent(q), '▶ YouTube', 'YouTube: ' + q) +
      a('https://youglish.com/pronounce/' + encodeURIComponent(q) + '/japanese', '🎧 YouGlish', 'YouGlish: ' + q) +
      (tag.length <= 20 ? a('https://www.instagram.com/explore/tags/' + encodeURIComponent(tag) + '/', '# Instagram', 'Instagram: ' + tag) : '') +
      '</span>';
  }
  // 💌 ようちゃん に きく（ask.html に、いま見ているものを書いて開く）
  function askLink(ctx) { return '<a class="ask-link" href="ask.html?ctx=' + encodeURIComponent(String(ctx || '').slice(0, 200)) + '" aria-label="' + esc(t('ask.btn')) + '">💌</a>'; }

  /* ---------- タップで ふつう ⇔ ていねい が切り替わるカード（ぶんぽう・かんじ・たんご・ガイド で共通） ----------
     it = { en, c: [ひらがな, ローマ字, 漢字], p: [...] }。isP = ていねい を表示中。extra = カードの下に足す HTML */
  function flipHtml(id, it, isP, extra) {
    const f = isP ? it.p : it.c, same = it.c[0] === it.p[0];
    return '<div class="ex-row flip ' + (isP ? 'is-p' : 'is-c') + '" data-flip="' + esc(id) + '"><div style="flex:1; min-width:0;">' +
      '<div class="flip-top"><span class="reg ' + (isP ? 'polite' : 'casual') + '">' + t(isP ? 'reg.polite' : 'reg.casual') + '</span><span class="flip-hint">' + esc(t(same ? 'tap.same' : 'tap.short')) + '</span></div>' +
      '<div class="k ja">' + jaHtml(f) + '</div><div class="romaji">' + esc(f[1]) + '</div><div class="e">' + esc(it.en) + '</div>' + (extra || '') + '</div>' + sayBtns(f[0]) + '</div>';
  }

  /* ---------- 表示ヘルパー ---------- */
  // 🔊 と 🐢 のボタン（data-say に読む文を入れる。クリックは下の document のリスナーで処理）
  function sayBtns(kana) {
    const k = esc(kana);
    return '<span class="say-btns"><button class="icon-btn" data-say="' + k + '" aria-label="' + esc(t('say.play')) + '">🔊</button>' +
      '<button class="icon-btn" data-say="' + k + '" data-slow="1" aria-label="' + esc(t('say.slow')) + '">🐢</button></span>';
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-say]');
    if (!b) return;
    e.stopPropagation();
    if (!speak(b.dataset.say, b.dataset.slow === '1')) toast(t('toast.noSpeech'));
  });
  function toast(msg) {
    let el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('show'), 2400);
  }

  /* ---------- バックアップ ---------- */
  function buildBackup() {
    return { app: BACKUP_APP_ID, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data: getData() };
  }
  function downloadBackup() {
    const blob = new Blob([JSON.stringify(buildBackup(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'casual-japanese-backup-' + dateKey().replace(/-/g, '') + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  // mode: 'merge'（今のデータと合わせる）/ 'replace'（バックアップで置き換える）
  function importBackup(text, mode) {
    let obj;
    try { obj = JSON.parse(text); } catch (e) { throw new Error(t('err.json')); }
    if (!obj || obj.app !== BACKUP_APP_ID || typeof obj.data !== 'object') throw new Error(t('err.app'));
    if (Number(obj.version) > BACKUP_VERSION) throw new Error(t('err.newer'));
    const inc = normalizeData(obj.data);   // v1 のファイルには kanji / read が無いので空で読む
    let out;
    if (mode === 'replace') out = inc;
    else {
      const cur = getData();
      out = {
        v: DATA_VERSION,
        learned: Array.from(new Set(cur.learned.concat(inc.learned))),
        kanji: Array.from(new Set(cur.kanji.concat(inc.kanji))),
        wrong: Object.assign({}, cur.wrong),
        history: Object.assign({}, cur.history, inc.history),
        quiz: { correct: Math.max(cur.quiz.correct, inc.quiz.correct), total: Math.max(cur.quiz.total, inc.quiz.total) },
        read: Object.assign({}, cur.read)
      };   // prac・daily は下で合わせる
      Object.keys(inc.wrong).forEach(k => { out.wrong[k] = Math.max(out.wrong[k] || 0, inc.wrong[k]); });
      Object.keys(inc.read).forEach(k => { out.read[k] = Math.max(out.read[k] || 0, inc.read[k]); });
      out.prac = Object.assign({}, cur.prac);
      Object.keys(inc.prac).forEach(k => {
        const a = out.prac[k], b = inc.prac[k];
        if (!a) { out.prac[k] = b; return; }
        out.prac[k] = { ok: Math.max(a.ok, b.ok), ng: Math.max(a.ng, b.ng), l: b.d > a.d ? b.l : a.l, d: b.d > a.d ? b.d : a.d };
      });
      out.asks = normAsks(cur.asks.concat(inc.asks));
      out.pref = Array.from(new Set(cur.pref.concat(inc.pref)));
      out.words = Array.from(new Set(cur.words.concat(inc.words)));
      out.daily = Object.assign({}, inc.daily);
      Object.keys(cur.daily).forEach(k => {
        const a = cur.daily[k], b = out.daily[k];
        if (!b) { out.daily[k] = a; return; }
        ['lunch', 'night', 'pat'].forEach(sl => { if (!b[sl] || (a[sl] && a[sl].s && !b[sl].s)) b[sl] = a[sl]; });
      });
    }
    if (!saveData(out)) throw new Error(t('err.save'));
    updateStreakBadge();
    return normalizeData(out);
  }

  /* ---------- オフライン対応（Service Worker） ---------- */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').then(r => r.update && r.update()).catch(() => {}); });
    // 新しいバージョンに切りかわったら、1回だけ読み直して最新の画面にする
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloaded) return; reloaded = true; location.reload(); });
  }

  window.CJ = {
    esc, dateKey, shuffle, getData, saveData, isLearned, toggleLearned, isKanjiLearned, toggleKanji, recordQuiz, recordRead, markStudied,
    calcStreak, updateStreakBadge, getPrefs, setPref, applyPrefs, drillSecs, lang, t, tx, applyI18n, setLang, recordPrac, saveDailySlot,
    speak, stopSpeak, autoSpeak, voiceId, voiceUrl, hasVoice, saveLocalVoice, deleteLocalVoice, localVoiceRecords, siteVoiceIds, voicesReady, markVoiceButtons, VOICE_DIR, hasJaVoice, jaVoices, utterText, speechText, recognitionSupported, listen, normJa, scoreJa, PASS_SCORE,
    sayBtns, toast, downloadBackup, importBackup, ruby, reading, plain, showKanji, jaHtml, syncKanjiToggles, extLinks, askLink, flipHtml,
    addAsk, updateAsk, ASK_TYPES, togglePref, toggleWord, APP_VERSION
  };

  // common.js は各ページの <body> の最後で読むので、この時点でヘッダーなどはもうある。
  // ページ本体の <script> より前に言葉を入れておく（表示のちらつき防止）
  addLangButton(); applyPrefs(); applyI18n(); updateStreakBadge(); syncKanjiToggles();
})();
