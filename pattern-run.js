/* 🔁 型 の 練習（英語アプリ の 型練習 と 同じ 流れ。向き は 英語 → 日本語）
   ・🃏 カード：🎬 場面 → 英語 → タイマー → 答え（読み上げ・ふりがな・💡 補足）→ ⭕／❌。最後 に まとめ
   ・⏱ テンポ：英語 → 時間 が 来たら 日本語 を 表示・読み上げ → 自動 で 次へ。最後 に ⭕／△／❌ を 自己記録
   ・声 で 答える（🎙️）・録音（🔴 → 👂）は 声に出す練習 と 同じ 部品（CJ.listen / CJ.startRec）
   ・記録 は CJ.recordPattern（localStorage 'cj_pt'、バックアップ にも 入る） */
(function () {
  const PT = window.CJ_PATTERNS, $ = id => document.getElementById(id), esc = CJ.esc, t = CJ.t;
  const L = (en, ja) => CJ.lang() === 'ja' ? CJ.jaText(ja) : en;
  const qs = new URLSearchParams(location.search);
  const daily = qs.get('daily');                       // 「きょう」の よる から 来た とき：終わったら その日 に 記録
  const pref = (k, d) => { const v = CJ.getPrefs()[k]; return v == null ? d : v; };

  /* ---------- 型 の 表示 ---------- */
  const kj = () => CJ.showKanji();
  const jp = s => kj() ? CJ.ruby(s) : esc(String(s).replace(/\{([^|}]+)\|([^}]+)\}/g, '$2'));
  function frameHtml(p) {   // 「［　　］ ＋ てもいい？」
    return (p.pre ? '<span class="pt-frm">' + jp(p.pre) + '</span>' : '') + '<span class="pt-blank">　　</span><span class="pt-frm">' + jp(p.post) + '</span>';
  }
  function answerHtml(p, i) {   // 答え：入れ替え 部分 を 色つき
    const sl = p.slots[i];
    const slot = kj() ? CJ.ruby(sl[1]) : esc(sl[2]);
    return (p.pre ? jp(p.pre) + ' ' : '') + '<span class="pt-ans-slot">' + slot + '</span>' + (p.join === '' ? '' : ' ') + jp(p.post);
  }

  /* ---------- セットアップ 画面 ---------- */
  function rateText(r) { return r && r.total ? Math.round(r.said / r.total * 100) + '%' : '—'; }
  function renderSetup() {
    stopAll();
    $('run').style.display = 'none'; $('setup').style.display = '';
    const rec = CJ.getPtRec(), g = pref('ptGroup', 'all'), mode = pref('ptMode', 'card'), secs = Number(pref('ptSecs', 4)), cnt = Number(pref('ptCount', 5));
    const list = PT.PATTERNS.filter(p => g === 'all' || p.group === g);
    const weak = PT.PATTERNS.filter(p => CJ.isWeakPattern(rec[p.id]));
    const seg = (key, vals, cur) => '<span class="seg">' + vals.map(v => '<button data-set="' + key + '" data-v="' + v[0] + '" class="' + (String(cur) === String(v[0]) ? 'active' : '') + '">' + esc(v[1]) + '</button>').join('') + '</span>';
    $('setup').innerHTML =
      (daily ? '<div class="past-head">🌙 ' + esc(L('Tonight: patterns', 'よる：かた の れんしゅう')) + '</div>' : '') +
      '<div class="card"><h2>🔁 ' + esc(L('Patterns — say it in a row', 'かた — つづけて いう')) + '</h2>' +
        '<p class="muted">' + esc(L('A pattern (chunk) stays the same — only the part in ［ ］ changes. See the English and say it in Japanese, one after another.', 'かた は そのまま、［ ］ の ところ だけ かわります。えいご を みて、にほんご で つぎつぎ いって みよう。')) + '</p>' +
        '<div class="setting-row"><span>' + esc(L('Mode', 'モード')) + '</span>' + seg('ptMode', [['card', '🃏 ' + L('Cards', 'カード')], ['tempo', '⏱ ' + L('Tempo', 'テンポ')]], mode) + '</div>' +
        '<p class="muted" style="font-size:0.78rem;">' + esc(mode === 'card' ? L('Cards: answer, check, and mark ⭕/❌ yourself. You can answer by voice.', 'カード：こたえて、たしかめて、⭕／❌ を じぶん で。こえ でも こたえられます。') : L('Tempo: the answer comes by itself after the timer. Keep saying it in rhythm!', 'テンポ：じかん が くる と こたえ が でて、じどう で つぎ へ。リズム よく いおう！')) + '</p>' +
        '<div class="setting-row"><span>' + esc(L('Seconds', 'びょう')) + '</span>' + seg('ptSecs', [[4, '4s'], [3, '3s'], [2, '2s']], secs) + '</div>' +
        '<div class="setting-row"><span>' + esc(L('Sentences per pattern', '1つ の かた で')) + '</span>' + seg('ptCount', [[3, '3'], [5, '5']], cnt) + '</div>' +
        '<div style="margin-top:0.6rem;"><label class="kj-toggle"><input type="checkbox" data-kanji-toggle' + (kj() ? ' checked' : '') + '> ' + esc(t('rd.kanji')) + '</label></div>' +
      '</div>' +
      '<div class="chip-row" style="margin:0.4rem 0;">' + [['all', L('All', 'ぜんぶ')]].concat(PT.GROUPS.map(x => [x.id, CJ.tx(x, 'label')])).map(x => '<button class="chip' + (g === x[0] ? ' active' : '') + '" data-group="' + x[0] + '">' + esc(x[1]) + '</button>').join('') + '</div>' +
      '<div class="btn-row" style="margin-bottom:0.6rem;">' +
        '<button class="btn" data-start="weak"' + (weak.length ? '' : ' disabled') + '>🔥 ' + esc(L('Practice weak ones', 'にがて を れんしゅう')) + ' (' + weak.length + ')</button>' +
        '<button class="btn btn-secondary" data-start="rand">🎲 ' + esc(L('3 random', 'ランダム 3つ')) + '</button></div>' +
      list.map(p => {
        const r = rec[p.id], w = CJ.isWeakPattern(r);
        return '<button class="card pt-row" data-start="' + p.id + '">' +
          '<div class="pt-row-top"><b class="ja">' + esc(p.chunk) + '</b>' + (w ? ' <span class="pt-weak">🔥</span>' : '') + '<span class="muted pt-row-en">' + esc(p.en === '{}' ? 'From ___ to ___' : p.en.replace('{}', '___')) + '</span></div>' +
          '<div class="ja pt-row-frame">' + frameHtml(p) + '</div>' +
          '<div class="muted pt-row-rec">' + (r ? '⭕ ' + (r.ok || 0) + ' · △ ' + (r.mid || 0) + ' · ❌ ' + (r.ng || 0) + ' · ' + esc(L('said', 'いえた')) + ' ' + rateText(r) + (r.d ? ' · ' + esc(r.d.slice(5).replace('-', '/')) : '') : esc(L('Not practiced yet', 'まだ れんしゅう して いない'))) + '</div>' +
        '</button>';
      }).join('');
  }
  $('setup').addEventListener('click', e => {
    const s = e.target.closest('[data-set]');
    if (s) { const v = s.dataset.v; CJ.setPref(s.dataset.set, /^\d+$/.test(v) ? Number(v) : v); renderSetup(); return; }
    const gb = e.target.closest('[data-group]');
    if (gb) { CJ.setPref('ptGroup', gb.dataset.group); renderSetup(); return; }
    const b = e.target.closest('[data-start]'); if (!b || b.disabled) return;
    const v = b.dataset.start, rec = CJ.getPtRec();
    let ids;
    if (v === 'weak') ids = PT.PATTERNS.filter(p => CJ.isWeakPattern(rec[p.id])).map(p => p.id);
    else if (v === 'rand') { const g = pref('ptGroup', 'all'); ids = CJ.shuffle(PT.PATTERNS.filter(p => g === 'all' || p.group === g)).slice(0, 3).map(p => p.id); }
    else ids = [v];
    startRun(ids);
  });

  /* ---------- 練習 ---------- */
  let R = null;   // 今 の 練習 の 状態
  let timer = 0, tickTimer = 0, nextTimer = 0;
  function stopTimers() { clearTimeout(timer); clearInterval(tickTimer); clearTimeout(nextTimer); timer = tickTimer = nextTimer = 0; }
  function stopVoice() {
    if (CJ.isRecording()) { if (R) R.dropRec = true; CJ.stopRec(); }
    CJ.abortListen();
    if (R) { if (R.recUrl) URL.revokeObjectURL(R.recUrl); R.recUrl = null; R.recOn = false; }
  }
  function stopAll() { stopTimers(); stopVoice(); CJ.stopSpeak && CJ.stopSpeak(); }

  function startRun(ids) {
    if (!ids.length) return;
    R = { ids, pi: 0, mode: pref('ptMode', 'card'), secs: Number(pref('ptSecs', 4)), cnt: Number(pref('ptCount', 5)), sum: [] };
    startPattern();
  }
  function startPattern(onlyIdx) {
    const p = PT.byId[R.ids[R.pi]];
    const idx = onlyIdx || CJ.shuffle(p.slots.map((x, i) => i)).slice(0, R.cnt);
    Object.assign(R, { p, queue: idx, i: 0, res: [], retry: !!onlyIdx, phase: 'item' });
    $('setup').style.display = 'none'; $('run').style.display = '';
    startItem(); window.scrollTo({ top: 0 });
  }
  function startItem() {
    stopAll();
    Object.assign(R, { shown: false, vres: null, paused: false, left: R.secs * 1000, started: false });
    render();
    // 英語 を 表示 し 終わって から タイマー を 始める（少し 待つ）
    timer = setTimeout(() => { if (!R || R.shown) return; R.started = true; runTick(); }, 600);
  }
  function runTick() {
    clearInterval(tickTimer);
    tickTimer = setInterval(() => {
      if (!R || R.shown || R.paused) return;
      R.left -= 100; drawBar();
      if (R.left <= 0) { clearInterval(tickTimer); reveal(); }
    }, 100);
  }
  function drawBar() { const b = $('ptBar'); if (b) b.style.width = Math.max(0, R.left / (R.secs * 1000) * 100) + '%'; const n = $('ptSec'); if (n) n.textContent = Math.ceil(Math.max(0, R.left) / 1000) + 's'; }
  function reveal() {
    if (!R || R.shown) return;
    clearInterval(tickTimer); CJ.abortListen();
    R.shown = true; render();
    const s = PT.sentence(R.p, R.queue[R.i]);
    CJ.speak(s.kana);
    if (R.mode === 'tempo') {   // 読み上げ の 長さ に 合わせて 自動 で 次へ
      const wait = Math.max(2200, s.kana.length * 170 + 1200);
      nextTimer = setTimeout(() => { if (R && !R.paused) mark(true); }, wait);
    }
  }
  function mark(ok) {
    const i = R.queue[R.i];
    R.res.push({ i, ok, score: R.vres && !R.vres.err ? R.vres.score : null });
    R.i++;
    if (R.i < R.queue.length) startItem(); else { stopAll(); R.phase = 'end'; render(); }
  }

  function voiceResHtml(v) {
    if (!v) return '';
    if (v.err) return '<div class="rd-result show">' + esc(v.err) + '</div>';
    const ok = v.score >= CJ.PASS_SCORE;
    return '<div class="rd-result show"><span class="sc ' + (ok ? 'ok' : 'ng') + '">🎙️ ' + esc(t(ok ? 'rd.pass' : 'rd.retry', { s: v.score })) + '</span>' +
      '<div class="muted">' + esc(t('rd.heard', { t: v.heard })) + '</div>' +
      (v.marks ? '<div class="vc-marks ja">' + v.marks.map(m => '<span class="' + (m.ok ? 'o' : 'x') + '">' + esc(m.ch) + '<i>' + (m.ok ? '〇' : '×') + '</i></span>').join('') + '</div>' : '') +
      '<div class="muted" style="font-size:0.75rem;">' + esc(t('vc.guide')) + '</div></div>';
  }

  function render() {
    const box = $('run'), p = R.p;
    if (R.phase === 'end') return renderEnd();
    const i = R.queue[R.i], sl = p.slots[i], nt = PT.noteOf(p, i), s = PT.sentence(p, i);
    const dots = '<div class="pt-dots">' + R.queue.map((q, k) => '<span class="' + (k < R.i ? (R.res[k] && R.res[k].ok ? 'ok' : 'ng') : k === R.i ? 'cur' : '') + '"></span>').join('') + '</div>';
    let h = '<div class="counter"><span class="muted">' + esc(p.chunk) + (R.ids.length > 1 ? ' (' + (R.pi + 1) + '/' + R.ids.length + ')' : '') + ' · ' + (R.mode === 'tempo' ? '⏱ ' : '') + '<b id="ptSec">' + R.secs + 's</b></span>' +
      '<button class="tiny-btn" data-a="quit">' + esc(t('pr.quit')) + '</button></div>' +
      '<div class="pt-box"><div class="pt-frame ja">' + frameHtml(p) + '</div></div>' +
      (nt[0] ? '<div style="text-align:center;"><span class="pt-scene">🎬 ' + esc(nt[0]) + '</span></div>' : '') +
      '<div class="muted" style="text-align:center; font-size:0.85rem;">' + esc(L('See the English, say it in Japanese', 'えいご を みて、にほんご で いって みよう')) + '</div>' +
      '<div class="dr-en">' + esc(PT.enOf(p, i)) + '</div>';
    if (R.shown) {
      h += '<div class="pt-answer"><div class="k ja">' + answerHtml(p, i) + '</div><div class="romaji">' + esc(s.romaji) + '</div>' +
        (nt[1] ? '<div class="dr-hint">💡 ' + esc(nt[1]) + '</div>' : '') + '</div>';
    }
    h += '<div class="pt-bar"><div id="ptBar"></div></div>' + dots;
    if (R.mode === 'tempo') {
      h += '<button class="btn btn-secondary" data-a="pause" style="margin-top:0.6rem;">' + (R.paused ? '▶️ ' + esc(t('pr.resume')) : '⏸️ ' + esc(t('pr.pause'))) + '</button>';
    } else if (!R.shown) {
      h += '<div id="vRes">' + voiceResHtml(R.vres) + '</div>' +
        (CJ.recognitionSupported
          ? '<button class="btn pt-voice" data-a="vanswer" id="vaBtn">🎙️ ' + esc(t('vc.answer')) + '</button>'
          : '<button class="btn" disabled>🎙️ ' + esc(t('vc.answer')) + '</button><div class="muted" style="font-size:0.78rem; text-align:center;">' + esc(t('vc.noSupport')) + '</div>') +
        '<button class="btn btn-secondary" data-a="show" style="margin-top:0.5rem;">' + esc(t('pr.show')) + '</button>' +
        '<button class="tiny-btn" data-a="pause" style="display:block; margin:0.5rem auto 0;">' + (R.paused ? '▶️ ' + esc(t('pr.resume')) : '⏸️ ' + esc(t('pr.pause'))) + '</button>';
    } else {
      h += '<div id="vRes">' + voiceResHtml(R.vres) + '</div>' +
        '<div class="vc-tools">' +
          '<button class="tiny-btn" data-say="' + esc(s.kana) + '">🔊 ' + esc(t('vc.model')) + '</button>' +
          '<button class="tiny-btn" data-say="' + esc(s.kana) + '" data-slow="1">🐢 ' + esc(t('vc.slow')) + '</button>' +
          (CJ.recognitionSupported ? '<button class="tiny-btn" data-a="vcheck" id="vcBtn">🎙️ ' + esc(t('vc.again')) + '</button>' : '') +
          (CJ.recSupported ? '<button class="tiny-btn' + (R.recOn ? ' rec-on' : '') + '" data-a="rec">' + (R.recOn ? '⏹ ' + esc(t('vc.stop')) : '🔴 ' + esc(t('vc.rec'))) + '</button>' +
            '<button class="tiny-btn" data-a="mine"' + (R.recUrl ? '' : ' disabled') + '>👂 ' + esc(t('vc.mine')) + '</button>' : '') +
        '</div>' +
        '<div class="btn-row"><button class="btn btn-ok" data-a="ok">⭕ ' + esc(L('I said it', 'いえた')) + '</button><button class="btn" data-a="ng" style="background:#be123c;">❌ ' + esc(L('Couldn\'t', 'でなかった')) + '</button></div>';
    }
    box.innerHTML = h;
    drawBar();
    if (R.shown) { const b = $('ptBar'); if (b) b.style.width = '0%'; }
  }

  function renderEnd() {
    const p = R.p, said = R.res.filter(r => r.ok).length, total = R.res.length, miss = R.res.filter(r => !r.ok).map(r => r.i);
    const more = R.pi < R.ids.length - 1;
    let h = '<div class="counter"><span class="muted">' + esc(p.chunk) + '</span><button class="tiny-btn" data-a="quit">' + esc(t('pr.quit')) + '</button></div>';
    if (R.mode === 'tempo' && !R.saved) {
      h += '<h2 style="text-align:center;">' + esc(L('How did it go?', 'どう だった？')) + '</h2>' +
        '<div class="btn-row"><button class="btn btn-ok" data-self="ok">⭕ ' + esc(L('Smooth', 'すらすら')) + '</button>' +
        '<button class="btn" data-self="mid" style="background:#d97706;">△ ' + esc(L('Hesitated', 'つまった')) + '</button>' +
        '<button class="btn" data-self="ng" style="background:#be123c;">❌ ' + esc(L('Couldn\'t', 'でなかった')) + '</button></div>';
    } else if (R.mode === 'card') {
      h += '<h2 style="text-align:center;">' + esc(L('You said {n} / {m}', 'いえた：{n} / {m}').replace('{n}', said).replace('{m}', total)) + '</h2>';
    }
    h += '<div class="pt-sum">' + R.res.map(r => {
      const s = PT.sentence(p, r.i), nt = PT.noteOf(p, r.i);
      return '<div class="pt-sum-row"><span class="pt-sum-mk">' + (R.mode === 'tempo' ? '・' : r.ok ? '⭕' : '❌') + '</span><div>' +
        '<div class="k ja">' + answerHtml(p, r.i) + ' ' + CJ.sayBtns(s.kana) + '</div><div class="muted">' + esc(PT.enOf(p, r.i)) + '</div>' +
        (nt[1] ? '<div class="muted" style="font-size:0.8rem;">💡 ' + esc(nt[1]) + '</div>' : '') +
        (r.score != null ? '<div class="muted" style="font-size:0.8rem;">🎙️ ' + r.score + ' ' + esc(L('points', 'てん')) + '</div>' : '') + '</div></div>';
    }).join('') + '</div>' +
      '<div class="dr-hint" style="margin-top:0.6rem;">🔑 <b>' + esc(L('Pattern point', 'かた の ポイント')) + ':</b> ' + esc(p.note) + '</div>';
    if (R.mode === 'card' || R.saved) {
      h += (R.mode === 'card' && miss.length ? '<button class="btn" data-a="retry" style="margin-top:0.8rem;">🔁 ' + esc(L('Only the missed ones again', 'でなかった ぶん だけ もう いちど')) + '</button>' : '') +
        (more ? '<button class="btn" data-a="nextpat" style="margin-top:0.5rem;">' + esc(L('Next pattern →', 'つぎ の かた →')) + '</button>' : '') +
        '<button class="btn btn-secondary" data-a="again" style="margin-top:0.5rem;">🔁 ' + esc(L('This pattern again', 'この かた を もう いちど')) + '</button>' +
        '<button class="btn btn-secondary" data-a="quit" style="margin-top:0.5rem;">' + esc(L('Done', 'おわる')) + '</button>';
    }
    $('run').innerHTML = h;
    // カード：1回目 だけ 記録（言えなかった 分 の やり直し は 記録 しない）
    if (R.mode === 'card' && !R.retry && !R.saved) {
      R.saved = true;
      const res = said === total ? 'ok' : said * 2 >= total ? 'mid' : 'ng';
      CJ.recordPattern(p.id, res, said, total);
      if (daily) CJ.saveDailySlot(daily, 'pat', { k: [R.p.id], r: ['c'], s: [said, total] });
      CJ.updateStreakBadge && CJ.updateStreakBadge();
    }
  }

  $('run').addEventListener('click', e => {
    if (!R) return;
    const sf = e.target.closest('[data-self]');
    if (sf) {
      const v = sf.dataset.self; R.saved = true;
      CJ.recordPattern(R.p.id, v, 0, 0);
      if (daily) CJ.saveDailySlot(daily, 'pat', { k: [R.p.id], r: ['c'], s: v === 'ok' ? [1, 1] : v === 'mid' ? [1, 2] : [0, 1] });
      CJ.updateStreakBadge && CJ.updateStreakBadge();
      renderEnd(); return;
    }
    if (e.target.closest('[data-say], a, label')) return;
    const b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
    const a = b.dataset.a;
    if (a === 'quit') { stopAll(); R = null; renderSetup(); window.scrollTo({ top: 0 }); }
    else if (a === 'show') reveal();
    else if (a === 'ok') mark(true);
    else if (a === 'ng') mark(false);
    else if (a === 'pause') {
      R.paused = !R.paused;
      if (R.mode === 'tempo' && R.shown && !R.paused) nextTimer = setTimeout(() => { if (R && !R.paused) mark(true); }, 1200);
      render();
    }
    else if (a === 'vanswer') {   // 答える 前：タイマー を 止めて 聞き取る → 聞き取れたら 答え を 出す
      clearInterval(tickTimer); clearTimeout(timer); R.paused = true;
      listenNow($('vaBtn'), ok => { R.paused = false; if (ok) reveal(); else { render(); runTick(); } });
    }
    else if (a === 'vcheck') listenNow($('vcBtn'), () => render());
    else if (a === 'rec') {
      if (R.recOn) { CJ.stopRec(); return; }
      const me = R;
      CJ.startRec({
        maxSec: 15,
        onStart: () => { me.recOn = true; if (R === me) render(); },
        onStop: url => {
          me.recOn = false;
          if (me.dropRec || R !== me) { me.dropRec = false; if (url) URL.revokeObjectURL(url); return; }
          if (me.recUrl) URL.revokeObjectURL(me.recUrl);
          me.recUrl = url; render(); if (url) CJ.playUrl(url);
        },
        onError: m => { R.vres = { err: m }; render(); }
      });
    }
    else if (a === 'mine') { if (R.recUrl) CJ.playUrl(R.recUrl); }
    else if (a === 'retry') { const miss = R.res.filter(r => !r.ok).map(r => r.i); R.saved = false; startPattern(miss); R.retry = true; }
    else if (a === 'again') { R.saved = false; startPattern(); }
    else if (a === 'nextpat') { R.pi++; R.saved = false; startPattern(); }
  });
  function listenNow(btn, done) {
    const i = R.queue[R.i], sl = R.p.slots[i], s = PT.sentence(R.p, i);
    if (R.recOn) CJ.stopRec();
    const res = $('vRes'); if (res) res.innerHTML = '<div class="rd-result show">' + esc(t('rd.listening')) + '</div>';
    if (btn) btn.classList.add('on');
    const rec = CJ.listen({
      onInterim: x => { const r = $('vRes'); if (r) r.innerHTML = '<div class="rd-result show">' + esc(t('rd.listening') + ' ' + x) + '</div>'; },
      // 採点：「表記（漢字まじり）」と「ひらがな」の 両方 と くらべて 高い方
      onFinal: alts => { R.vres = CJ.scoreJa([s.kana, CJ.plain(s.kj)], alts); done(true); },
      onError: m => { R.vres = { err: m }; done(false); },
      onState: on => { if (!on && btn) btn.classList.remove('on'); }
    });
    if (!rec) { R.vres = { err: t('err.recog') }; done(false); }
  }
  // 画面 が かくれたら 一時停止
  document.addEventListener('visibilitychange', () => { if (document.hidden && R && R.phase !== 'end' && !R.paused) { R.paused = true; stopVoice(); render(); } });
  document.addEventListener('cj:lang', () => { if (R) render(); else renderSetup(); });
  document.addEventListener('cj:kanji', () => { if (R) render(); else renderSetup(); });

  // ?p=型ID ならその型 から すぐ 始める
  const first = qs.get('p');
  if (first && PT.byId[first]) startRun([first]); else renderSetup();
})();
