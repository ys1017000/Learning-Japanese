/* Casual Japanese - 共通スクリプト（window.CJ で各ページから使う） */
(function () {
  "use strict";

  const KEY_DATA = 'cj_data';         // 学習データ（バックアップ対象）
  const KEY_PREFS = 'cj_prefs';       // 設定（端末ごと・バックアップ対象外）
  const DATA_VERSION = 1;
  const BACKUP_APP_ID = 'casual-japanese-backup';
  const BACKUP_VERSION = 1;

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

  /* ---------- 学習データ ----------
     { v: 1, learned: [カードID], wrong: { 問題ID: 回数 }, history: { 'YYYY-MM-DD': true }, quiz: { correct, total } } */
  function defaultData() { return { v: DATA_VERSION, learned: [], wrong: {}, history: {}, quiz: { correct: 0, total: 0 } }; }
  function normalizeData(s) {
    const d = defaultData();
    if (!s || typeof s !== 'object') return d;
    d.learned = Array.from(new Set((Array.isArray(s.learned) ? s.learned : []).filter(x => typeof x === 'string' && x.length < 60))).slice(0, 2000);
    if (s.wrong && typeof s.wrong === 'object' && !Array.isArray(s.wrong)) Object.keys(s.wrong).slice(0, 2000).forEach(k => {
      const n = Math.floor(Number(s.wrong[k]) || 0);
      if (k.length < 80 && n > 0) d.wrong[k] = Math.min(n, 5);
    });
    if (s.history && typeof s.history === 'object') Object.keys(s.history).forEach(k => { if (/^\d{4}-\d{2}-\d{2}$/.test(k) && s.history[k]) d.history[k] = true; });
    const q = s.quiz || {};
    d.quiz.total = Math.max(0, Math.floor(Number(q.total) || 0));
    d.quiz.correct = Math.max(0, Math.min(d.quiz.total, Math.floor(Number(q.correct) || 0)));
    return d;
  }
  function getData() { try { return normalizeData(JSON.parse(safeGet(KEY_DATA))); } catch (e) { return defaultData(); } }
  function saveData(d) { return safeSet(KEY_DATA, JSON.stringify(normalizeData(d))); }

  function touchToday(d) { d.history[dateKey()] = true; }
  function isLearned(id) { return getData().learned.includes(id); }
  function toggleLearned(id) {
    const d = getData(), i = d.learned.indexOf(id);
    if (i >= 0) d.learned.splice(i, 1); else d.learned.push(id);
    touchToday(d); saveData(d); updateStreakBadge();
    return i < 0;
  }
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
    el.textContent = '🔥 ' + n + (n === 1 ? ' day' : ' days');
  }

  /* ---------- 設定 ---------- */
  const DEFAULT_PREFS = { romaji: true, rate: 0.9, autoSpeak: true };
  function getPrefs() { try { return Object.assign({}, DEFAULT_PREFS, JSON.parse(safeGet(KEY_PREFS)) || {}); } catch (e) { return Object.assign({}, DEFAULT_PREFS); } }
  function setPref(k, v) { const p = getPrefs(); p[k] = v; safeSet(KEY_PREFS, JSON.stringify(p)); applyPrefs(); }
  // ローマ字の表示/非表示は body のクラスで切り替える（.romaji を隠す）
  function applyPrefs() { if (document.body) document.body.classList.toggle('no-romaji', !getPrefs().romaji); }

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
  function speak(kana, slow) {
    if (!('speechSynthesis' in window) || !kana) return false;
    const synth = window.speechSynthesis;
    const go = () => {
      const u = new SpeechSynthesisUtterance(speechText(kana));
      u.lang = 'ja-JP';
      const base = Number(getPrefs().rate) || 0.9;
      u.rate = slow ? Math.max(0.4, base * 0.65) : base;
      const v = jaVoice(); if (v) u.voice = v;
      try { synth.resume(); } catch (e) {}
      synth.speak(u);
    };
    // 再生中に cancel → すぐ speak すると新しい音声が捨てられることがあるので少し待つ
    if (synth.speaking || synth.pending) { synth.cancel(); setTimeout(go, 120); } else go();
    return true;
  }
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

  /* ---------- 表示ヘルパー ---------- */
  // 🔊 と 🐢 のボタン（data-say に読む文を入れる。クリックは下の document のリスナーで処理）
  function sayBtns(kana) {
    const k = esc(kana);
    return '<span class="say-btns"><button class="icon-btn" data-say="' + k + '" aria-label="Play">🔊</button>' +
      '<button class="icon-btn" data-say="' + k + '" data-slow="1" aria-label="Play slowly">🐢</button></span>';
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-say]');
    if (!b) return;
    e.stopPropagation();
    if (!speak(b.dataset.say, b.dataset.slow === '1')) toast('Sorry, this browser can\'t read aloud.');
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
    try { obj = JSON.parse(text); } catch (e) { throw new Error('This file could not be read (it is not JSON).'); }
    if (!obj || obj.app !== BACKUP_APP_ID || typeof obj.data !== 'object') throw new Error('This is not a Casual Japanese backup file.');
    if (Number(obj.version) > BACKUP_VERSION) throw new Error('This backup is from a newer version of the app. Please reload the app and try again.');
    const inc = normalizeData(obj.data);
    let out;
    if (mode === 'replace') out = inc;
    else {
      const cur = getData();
      out = {
        v: DATA_VERSION,
        learned: Array.from(new Set(cur.learned.concat(inc.learned))),
        wrong: Object.assign({}, cur.wrong),
        history: Object.assign({}, cur.history, inc.history),
        quiz: { correct: Math.max(cur.quiz.correct, inc.quiz.correct), total: Math.max(cur.quiz.total, inc.quiz.total) }
      };
      Object.keys(inc.wrong).forEach(k => { out.wrong[k] = Math.max(out.wrong[k] || 0, inc.wrong[k]); });
    }
    if (!saveData(out)) throw new Error('Could not save. Your browser storage may be full.');
    updateStreakBadge();
    return normalizeData(out);
  }

  /* ---------- オフライン対応（Service Worker） ---------- */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }

  window.CJ = {
    esc, dateKey, shuffle, getData, saveData, isLearned, toggleLearned, recordQuiz, markStudied, calcStreak, updateStreakBadge,
    getPrefs, setPref, applyPrefs, speak, autoSpeak, hasJaVoice, speechText, sayBtns, toast,
    downloadBackup, importBackup
  };

  document.addEventListener('DOMContentLoaded', () => { applyPrefs(); updateStreakBadge(); });
})();
