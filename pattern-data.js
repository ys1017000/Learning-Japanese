/* マルちゃんのペースでいいよ - 型（かた）の練習
   「［　］ が たべたい な」のように、［　］の言葉を入れ替えるだけで言える文の型。
   使う言葉は、アプリにすでにある単語・場面のものだけ（漢字もアプリにある字だけ）。
   型 = { id, g: 文法ステップ, c / p: ふつう・ていねい の型 [ひらがな, ローマ字, 漢字の書き方]（{X}{Y} に入れる）, en: 英語（{x}{y}）,
          fill: 入れる言葉 [{ x: [ひらがな, ローマ字, 漢字, 英語], y: [...] }] } */
(function () {
  "use strict";
  const w = (k, r, kj, en) => [k, r, kj || k, en];
  // よく使う言葉（アプリの単語・例文にあるもの）
  const FOOD = [w('パスタ', 'pasuta', 'パスタ', 'pasta'), w('ピザ', 'piza', 'ピザ', 'pizza'), w('やきにく', 'yakiniku', '{焼肉|やきにく}', 'yakiniku'),
    w('ハンバーガー', 'hanbaagaa', 'ハンバーガー', 'a hamburger'), w('チーズケーキ', 'chiizukeeki', 'チーズケーキ', 'cheesecake'), w('うどん', 'udon', 'うどん', 'udon'), w('やさい', 'yasai', '{野菜|やさい}', 'vegetables')];
  const DRINK = [w('まっちゃ', 'maccha', '{抹茶|まっちゃ}', 'matcha'), w('ワイン', 'wain', 'ワイン', 'wine'), w('ビール', 'biiru', 'ビール', 'beer'),
    w('おちゃ', 'ocha', 'お{茶|ちゃ}', 'tea'), w('コーヒー', 'koohii', 'コーヒー', 'coffee'), w('おみず', 'omizu', 'お{水|みず}', 'water')];
  const PLACE = [w('カフェ', 'kafe', 'カフェ', 'a café'), w('やま', 'yama', '{山|やま}', 'the mountains'), w('かわ', 'kawa', '{川|かわ}', 'the river'),
    w('きょうと', 'kyouto', '{京都|きょうと}', 'Kyoto'), w('うみ', 'umi', '{海|うみ}', 'the sea'), w('もり', 'mori', '{森|もり}', 'the forest')];
  const LIKE = [w('コケ', 'koke', 'コケ', 'moss'), w('ホラー えいが', 'horaa eiga', 'ホラー{映画|えいが}', 'horror movies'), w('しぜん', 'shizen', '{自然|しぜん}', 'nature'),
    w('タロット', 'taroto', 'タロット', 'tarot'), w('みどりいろ', 'midoriiro', '{緑色|みどりいろ}', 'green'), w('さくら', 'sakura', '{桜|さくら}', 'cherry blossoms'), w('キャンプ', 'kyanpu', 'キャンプ', 'camping')];
  const WHERE = [w('えき', 'eki', '{駅|えき}', 'the station'), w('おてあらい', 'otearai', 'お{手洗|てあら}い', 'the restroom'), w('でぐち', 'deguchi', '{出口|でぐち}', 'the exit'),
    w('かいさつ', 'kaisatsu', '{改札|かいさつ}', 'the ticket gate'), w('きたぐち', 'kitaguchi', '{北口|きたぐち}', 'the north exit'), w('いりぐち', 'iriguchi', '{入口|いりぐち}', 'the entrance')];
  const ORDER = [w('まっちゃ ラテ', 'maccha rate', '{抹茶|まっちゃ}ラテ', 'a matcha latte'), w('チーズケーキ', 'chiizukeeki', 'チーズケーキ', 'the cheesecake'),
    w('なまビール', 'nama biiru', '{生|なま}ビール', 'a draft beer'), w('あか ワイン', 'aka wain', '{赤|あか}ワイン', 'red wine'), w('パスタ', 'pasuta', 'パスタ', 'the pasta'), w('ピザ', 'piza', 'ピザ', 'the pizza')];
  const SURU = [w('キャンプ', 'kyanpu', 'キャンプ', 'go camping'), w('ハイキング', 'haikingu', 'ハイキング', 'go hiking'), w('おはなみ', 'ohanami', 'お{花見|はなみ}', 'see the cherry blossoms'),
    w('さんぽ', 'sanpo', '{散歩|さんぽ}', 'take a walk'), w('タロット うらない', 'taroto uranai', 'タロット{占|うらな}い', 'do a tarot reading'), w('りょこう', 'ryokou', '{旅行|りょこう}', 'go on a trip')];
  const AT = [w('えき', 'eki', '{駅|えき}', 'the station'), w('カフェ', 'kafe', 'カフェ', 'a café'), w('でんしゃ の なか', 'densha no naka', '{電車|でんしゃ}の{中|なか}', 'on the train'),
    w('がっこう', 'gakkou', '{学校|がっこう}', 'school'), w('おみせ', 'omise', 'お{店|みせ}', 'the shop'), w('かいさつ', 'kaisatsu', '{改札|かいさつ}', 'the ticket gate')];
  const TIME = [w('ろくじ', 'rokuji', '{六時|ろくじ}', 'six'), w('しちじ はん', 'shichiji han', '{七時半|しちじはん}', 'seven thirty'), w('ごご よじ', 'gogo yoji', '{午後|ごご}{四時|よじ}', '4 p.m.'),
    w('げつようび', 'getsuyoubi', '{月曜日|げつようび}', 'Monday'), w('どようび', 'doyoubi', '{土曜日|どようび}', 'Saturday')];
  const PRETTY = [w('そら', 'sora', '{空|そら}', 'sky'), w('こうよう', 'kouyou', '{紅葉|こうよう}', 'autumn leaves'), w('さくら', 'sakura', '{桜|さくら}', 'cherry blossoms'),
    w('イルミネーション', 'irumineeshon', 'イルミネーション', 'illumination'), w('かわ の みず', 'kawa no mizu', '{川|かわ}の{水|みず}', 'river water'), w('ゆき', 'yuki', '{雪|ゆき}', 'snow')];
  const THINK = [w('あした は はれる', 'ashita wa hareru', '{明日|あした}は{晴|は}れる', 'it will be sunny tomorrow'), w('この カフェ が いい', 'kono kafe ga ii', 'このカフェがいい', 'this café is good'),
    w('うらない は あたる', 'uranai wa ataru', '{占|うらな}いは{当|あ}たる', 'fortune-telling comes true'), w('ちょっと ちがう', 'chotto chigau', 'ちょっと{違|ちが}う', 'it\'s a little different'),
    w('ホラー えいが は たのしい', 'horaa eiga wa tanoshii', 'ホラー{映画|えいが}は{楽|たの}しい', 'horror movies are fun')];
  const PAIRS = [[w('ピザ', 'piza', 'ピザ', 'pizza'), w('パスタ', 'pasuta', 'パスタ', 'pasta')], [w('ビール', 'biiru', 'ビール', 'beer'), w('ワイン', 'wain', 'ワイン', 'wine')],
    [w('うみ', 'umi', '{海|うみ}', 'the sea'), w('やま', 'yama', '{山|やま}', 'the mountains')], [w('なつ', 'natsu', '{夏|なつ}', 'summer'), w('ふゆ', 'fuyu', '{冬|ふゆ}', 'winter')],
    [w('コーヒー', 'koohii', 'コーヒー', 'coffee'), w('まっちゃ', 'maccha', '{抹茶|まっちゃ}', 'matcha')]];
  const one = list => list.map(x => ({ x }));

  const PATTERNS = [
    { id: 'tabetai', g: 'want', icon: '🍝', c: ['{X} が たべたい な', '{X} ga tabetai na', '{X}が{食|た}べたいな'], p: ['{X} が たべたい です', '{X} ga tabetai desu', '{X}が{食|た}べたいです'], en: 'I want to eat {x}.', fill: one(FOOD) },
    { id: 'nomitai', g: 'want', icon: '🍵', c: ['{X} が のみたい な', '{X} ga nomitai na', '{X}が{飲|の}みたいな'], p: ['{X} が のみたい です', '{X} ga nomitai desu', '{X}が{飲|の}みたいです'], en: 'I want to drink {x}.', fill: one(DRINK) },
    { id: 'ikou', g: 'lets', icon: '🚶', c: ['{X} に いこう！', '{X} ni ikou!', '{X}に{行|い}こう！'], p: ['{X} に いきましょう', '{X} ni ikimashou', '{X}に{行|い}きましょう'], en: 'Let\'s go to {x}!', fill: one(PLACE) },
    { id: 'shiyou', g: 'lets', icon: '⛺', c: ['{X} しよう！', '{X} shiyou!', '{X}しよう！'], p: ['{X} を しましょう', '{X} o shimashou', '{X}をしましょう'], en: 'Let\'s {x}!', fill: one(SURU) },
    { id: 'suki', g: 'suki', icon: '💚', c: ['{X} が すき', '{X} ga suki', '{X}が{好|す}き'], p: ['{X} が すき です', '{X} ga suki desu', '{X}が{好|す}きです'], en: 'I like {x}.', fill: one(LIKE) },
    { id: 'hou', g: 'comp', icon: '⚖️', c: ['{X} より {Y} の ほう が すき', '{X} yori {Y} no hou ga suki', '{X}より{Y}のほうが{好|す}き'], p: ['{X} より {Y} の ほう が すき です', '{X} yori {Y} no hou ga suki desu', '{X}より{Y}のほうが{好|す}きです'], en: 'I like {y} more than {x}.', fill: PAIRS.map(pr => ({ x: pr[0], y: pr[1] })) },
    { id: 'doko', g: '', icon: '🚉', c: ['{X} は どこ？', '{X} wa doko?', '{X}はどこ？'], p: ['{X} は どこ です か？', '{X} wa doko desu ka?', '{X}はどこですか？'], en: 'Where is {x}?', fill: one(WHERE) },
    { id: 'ni-suru', g: '', icon: '☕', c: ['{X} に する', '{X} ni suru', '{X}にする'], p: ['{X} を ください', '{X} o kudasai', '{X}をください'], en: 'I\'ll have {x}.', fill: one(ORDER) },
    { id: 'imairu', g: 'teiru', icon: '📍', c: ['いま {X} に いる よ', 'ima {X} ni iru yo', '{今|いま}{X}にいるよ'], p: ['いま {X} に います', 'ima {X} ni imasu', '{今|いま}{X}にいます'], en: 'I\'m at {x} now.', fill: one(AT) },
    { id: 'aou', g: 'lets', icon: '🕖', c: ['{X} に あおう', '{X} ni aou', '{X}に{会|あ}おう'], p: ['{X} に あいましょう', '{X} ni aimashou', '{X}に{会|あ}いましょう'], en: 'Let\'s meet at / on {x}.', fill: one(TIME) },
    { id: 'kotoaru', g: 'exp', icon: '🔮', c: ['{X} した こと ある？', '{X} shita koto aru?', '{X}したことある？'], p: ['{X} を した こと が あります か？', '{X} o shita koto ga arimasu ka?', '{X}をしたことがありますか？'], en: 'Have you ever tried {x}?', fill: one([w('キャンプ', 'kyanpu', 'キャンプ', 'camping'), w('ハイキング', 'haikingu', 'ハイキング', 'hiking'),
      w('おはなみ', 'ohanami', 'お{花見|はなみ}', 'hanami (cherry blossom viewing)'), w('タロット うらない', 'taroto uranai', 'タロット{占|うらな}い', 'a tarot reading'), w('ひがえり りょこう', 'higaeri ryokou', '{日帰|ひがえ}り{旅行|りょこう}', 'a day trip')]) },
    { id: 'haretara', g: 'tara', icon: '☀️', c: ['はれたら {X} しよう', 'haretara {X} shiyou', '{晴|は}れたら{X}しよう'], p: ['はれたら {X} を しましょう', 'haretara {X} o shimashou', '{晴|は}れたら{X}をしましょう'], en: 'If it\'s sunny, let\'s {x}.', fill: one(SURU) },
    { id: 'kirei', g: '', icon: '✨', c: ['{X}、 きれい だね', '{X}, kirei da ne', '{X}、きれいだね'], p: ['{X} が きれい です ね', '{X} ga kirei desu ne', '{X}がきれいですね'], en: 'The {x} is beautiful, isn\'t it?', fill: one(PRETTY) },
    { id: 'omou', g: 'omou', icon: '💭', c: ['{X} と おもう', '{X} to omou', '{X}と{思|おも}う'], p: ['{X} と おもいます', '{X} to omoimasu', '{X}と{思|おも}います'], en: 'I think {x}.', fill: one(THINK) }
  ];
  const TITLES = {
    tabetai: ['I want to eat ___', '___ が たべたい'], nomitai: ['I want to drink ___', '___ が のみたい'], ikou: ['Let\'s go to ___', '___ に いこう'],
    shiyou: ['Let\'s do ___', '___ しよう'], suki: ['I like ___', '___ が すき'], hou: ['I like B more than A', 'A より B の ほう が すき'],
    doko: ['Where is ___?', '___ は どこ？'], 'ni-suru': ['I\'ll have ___ (ordering)', '___ に する（ちゅうもん）'], imairu: ['I\'m at ___ now', 'いま ___ に いる'],
    aou: ['Let\'s meet at ___', '___ に あおう'], kotoaru: ['Have you ever ___?', '___ した こと ある？'], haretara: ['If it\'s sunny, let\'s ___', 'はれたら ___ しよう'],
    kirei: ['___ is beautiful', '___、 きれい だね'], omou: ['I think ___', '___ と おもう']
  };
  PATTERNS.forEach(pt => { pt.title = TITLES[pt.id][0]; pt.titleJa = TITLES[pt.id][1]; });

  // 型に言葉を入れて、文を作る
  function build(pt, f) {
    const x = f.x, y = f.y || ['', '', '', ''];
    const sub = (s, i) => s.split('{X}').join(x[i]).split('{Y}').join(y[i]);
    const mk = form => [sub(form[0], 0), sub(form[1], 1), sub(form[2], 2)];
    return { c: mk(pt.c), p: mk(pt.p), en: pt.en.split('{x}').join(x[3]).split('{y}').join(y[3]) };
  }
  // 練習カード用の文：key = 'pt:型ID:番号'
  const items = [];
  PATTERNS.forEach(pt => pt.fill.forEach((f, i) => {
    const s = build(pt, f);
    items.push({ key: 'pt:' + pt.id + ':' + i, src: 'pt', pid: pt.id, en: s.en, c: s.c, p: s.p, tag: '🔁 ' + pt.titleJa });
  }));
  window.CJ_PATTERNS = { PATTERNS, items, build };
})();
