/* マルちゃんのペースでいいよ - 文の倉庫（アプリの文を全部ひとつにまとめて、漢字・単語と自動でつなぐ）
   読み込む順番：data.js, grammar-data.js, read-data.js, examples-data.js, kanji-data.js, words-data.js, common.js, bank.js
   item = { key, src: 'card'|'rp'|'gr'|'rd'|'ex', en, c: [ひらがな, ローマ字, 漢字の書き方], p: [...], tag: 文法タグ, txt: 漢字の文（さがす用） } */
(function () {
  "use strict";
  const D = window.CJ_DATA, G = window.CJ_GRAMMAR ? window.CJ_GRAMMAR.GRAMMAR : [], R = window.CJ_READ ? window.CJ_READ.PASSAGES : [];
  const E = window.CJ_EXAMPLES ? window.CJ_EXAMPLES.EXAMPLES : [], K = window.CJ_KANJI ? window.CJ_KANJI.KANJI : [], W = window.CJ_WORDS ? window.CJ_WORDS.WORDS : [];
  const items = [];
  D.CARDS.forEach(c => items.push({ key: 'card:' + c.id, src: 'card', en: c.en, c: c.c, p: c.p, tag: '', pw: c.pw, only: c.only }));
  // カードの「こたえかた」（ふつう だけ の文。ていねい も同じものを入れておく）
  D.CARDS.forEach(c => (c.r || []).forEach((r, i) => { const f = [r[0], r[1], r[3]]; items.push({ key: 'rp:' + c.id + ':' + i, src: 'rp', en: r[2], c: f, p: f, tag: '' }); }));
  G.forEach(g => g.ex.forEach((e, i) => items.push({ key: 'gr:' + g.id + ':' + i, src: 'gr', en: e[0], c: [e[1], e[2], e[5]], p: [e[3], e[4], e[6]], tag: g.tag, gid: g.id })));
  R.forEach(p => p.lines.forEach((l, i) => items.push({ key: 'rd:' + p.id + ':' + i, src: 'rd', en: l[0], c: l[1], p: l[2], tag: '', pid: p.id, only: l[3] })));
  E.forEach(e => items.push({ key: 'ex:' + e[0], src: 'ex', en: e[1], c: e[2], p: e[3], tag: '', only: e[4] }));
  items.forEach(it => { it.txt = CJ.plain(it.c[2]) + '\n' + CJ.plain(it.p[2]); });
  const byKey = {}; items.forEach(it => { byKey[it.key] = it; });
  const kanjiBy = {}; K.forEach(k => { kanjiBy[k.k] = k; });
  const wordBy = {}; W.forEach(w => { wordBy[w.id] = w; });

  // 同じ文（ふつう の ひらがな が同じ）は1つだけにする
  function uniq(list) { const seen = new Set(); return list.filter(it => { if (seen.has(it.c[0])) return false; seen.add(it.c[0]); return true; }); }
  function withKanji(ch) { return uniq(items.filter(it => it.txt.includes(ch))); }
  function withWord(w) { return uniq(items.filter(it => it.txt.includes(w.m))); }
  // 文の中の漢字（アプリにある漢字だけ）と単語
  function kanjiIn(it) { return Array.from(new Set(Array.from(it.txt).filter(ch => kanjiBy[ch]))); }
  function wordsIn(it) { return W.filter(w => it.txt.includes(w.m)); }
  // 「🔗 この文の漢字・単語」リンク
  function linksHtml(it, max) {
    const ks = kanjiIn(it).slice(0, max || 8), ws = wordsIn(it).slice(0, max || 6);
    if (!ks.length && !ws.length) return '';
    return '<div class="link-row">' +
      ks.map(k => '<a class="link-chip kj" href="kanji.html?k=' + encodeURIComponent(k) + '">✍️ ' + CJ.esc(k) + '</a>').join('') +
      ws.map(w => '<a class="link-chip wd" href="words.html?w=' + encodeURIComponent(w.id) + '">📝 ' + CJ.esc(w.id) + '</a>').join('') + '</div>';
  }
  window.CJ_BANK = { items, byKey, kanjiBy, wordBy, withKanji, withWord, kanjiIn, wordsIn, linksHtml };
})();
