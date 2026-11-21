/* Casual Japanese - 共通スクリプト（window.CJ で各ページから使う） */
(function () {
  "use strict";

  const KEY_DATA = 'cj_data';         // 学習データ（バックアップ対象）
  const KEY_PREFS = 'cj_prefs';       // 設定（端末ごと・バックアップ対象外）
  const DATA_VERSION = 2;             // v2: 漢字(kanji)・音読(read)を追加。v1 のデータもそのまま読める
  const BACKUP_APP_ID = 'casual-japanese-backup';
  const BACKUP_VERSION = 2;           // v1 のバックアップも読み込める

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
  const DEFAULT_PREFS = { romaji: true, rate: 0.9, autoSpeak: true, lang: 'en', readKanji: false };
  function getPrefs() { try { return Object.assign({}, DEFAULT_PREFS, JSON.parse(safeGet(KEY_PREFS)) || {}); } catch (e) { return Object.assign({}, DEFAULT_PREFS); } }
  function setPref(k, v) { const p = getPrefs(); p[k] = v; safeSet(KEY_PREFS, JSON.stringify(p)); applyPrefs(); }
  // ローマ字の表示/非表示は body のクラスで切り替える（.romaji を隠す）
  function applyPrefs() { if (document.body) document.body.classList.toggle('no-romaji', !getPrefs().romaji); }

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
       quiz: { correct, total }, read: { '会話ID:行番号': いちばん良い点数 } } */
  function defaultData() { return { v: DATA_VERSION, learned: [], kanji: [], wrong: {}, history: {}, quiz: { correct: 0, total: 0 }, read: {} }; }
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
  // 音読の点数（いちばん良い点数だけ残す）
  function recordRead(key, score) {
    const d = getData();
    d.read[key] = Math.max(d.read[key] || 0, Math.round(score));
    touchToday(d); saveData(d); updateStreakBadge();
    return d.read[key];
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
  function jaVoice() {
    if (!cachedVoices.length) loadVoices();
    return cachedVoices.find(v => v.lang === 'ja-JP') || cachedVoices.find(v => /^ja/i.test(v.lang.replace('_', '-'))) || null;
  }
  function hasJaVoice() { return !!jaVoice(); }
  // 表示用のスペースと「〜」は読み上げでは取り除く
  function speechText(kana) { return String(kana || '').replace(/[\s　〜~]/g, ''); }
  // onEnd: 読み終わったときに呼ぶ（「ぜんぶ きく」用）
  function speak(kana, slow, onEnd) {
    if (!('speechSynthesis' in window) || !kana) return false;
    const synth = window.speechSynthesis;
    const go = () => {
      const u = new SpeechSynthesisUtterance(speechText(kana));
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
    return true;
  }
  function stopSpeak() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }
  function autoSpeak(kana) { if (getPrefs().autoSpeak !== false) speak(kana); }
  // iPhone の Safari は最初の読み上げが画面タップの中でないと音が出ないので、最初のタップで無音の読み上げをしておく
  (function unlockSpeech() {
    if (!('speechSynthesis' in window)) return;
    let done = false;
    const unlock = () => {
      if (done) return; done = true;
      try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; window.speechSynthesis.speak(u); } catch (e) {}
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
      };
      Object.keys(inc.wrong).forEach(k => { out.wrong[k] = Math.max(out.wrong[k] || 0, inc.wrong[k]); });
      Object.keys(inc.read).forEach(k => { out.read[k] = Math.max(out.read[k] || 0, inc.read[k]); });
    }
    if (!saveData(out)) throw new Error(t('err.save'));
    updateStreakBadge();
    return normalizeData(out);
  }

  /* ---------- オフライン対応（Service Worker） ---------- */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }

  window.CJ = {
    esc, dateKey, shuffle, getData, saveData, isLearned, toggleLearned, isKanjiLearned, toggleKanji, recordQuiz, recordRead, markStudied,
    calcStreak, updateStreakBadge, getPrefs, setPref, applyPrefs, lang, t, tx, applyI18n, setLang,
    speak, stopSpeak, autoSpeak, hasJaVoice, speechText, recognitionSupported, listen, normJa, scoreJa, PASS_SCORE,
    sayBtns, toast, downloadBackup, importBackup
  };

  // common.js は各ページの <body> の最後で読むので、この時点でヘッダーなどはもうある。
  // ページ本体の <script> より前に言葉を入れておく（表示のちらつき防止）
  addLangButton(); applyPrefs(); applyI18n(); updateStreakBadge();
})();
