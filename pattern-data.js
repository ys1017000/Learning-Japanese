/* 🔁 型（チャンク）の練習 用 データ（v34 で 作り直し）
   型 は 固定、入れ替える 部分（スロット）だけ 変えて 続けて 言う。向き は「英語 を 見て → 日本語 で 言う」。
   日本語 は 入れ替える 部分 が 前 に 来る こと が 多い ので、型 は pre（前）／ post（後ろ）の 両方 に 対応。
   1つ の 型：id, chunk（型の名前）, group（ジャンル）, pre, post, join（スロット と post の あいだ。' ' か ''）, en（英語 の 形。{} に スロット の 英語）, note（型 の ポイント・英語）
   slots：5個。[英語, 日本語（{漢字|よみ} の 書き方）, ひらがな]
   NOTES：スロット ごと に [場面（英語）, 補足（英語：言いかえ・入れ替え の コツ）] */
(function () {
  const GROUPS = [
    { id: 'ask', label: '🙏 Asking', labelJa: '🙏 たのむ・きょか' },
    { id: 'want', label: '✨ Wants & invites', labelJa: '✨ したい・さそう' },
    { id: 'feel', label: '💗 Feelings', labelJa: '💗 きもち' },
    { id: 'q', label: '❓ Questions', labelJa: '❓ きく' },
    { id: 'plan', label: '📅 Experience & plans', labelJa: '📅 けいけん・よてい' }
  ];
  const PATTERNS = [
    { id: 'te-mo-ii', chunk: '〜てもいい？', group: 'ask', pre: '', post: 'も いい？', join: '', en: 'Can I {}?',
      note: 'て-form + もいい？ = asking if it\'s OK to do something. Polite: 〜ても いいですか？',
      slots: [['take a photo', '{写真|しゃしん} {撮|と}って', 'しゃしん とって'], ['sit here', 'ここ {座|すわ}って', 'ここ すわって'],
        ['say it one more time', 'もう {一回|いっかい} {言|い}って', 'もう いっかい いって'], ['open the window', '{窓|まど} {開|あ}けて', 'まど あけて'], ['eat this', 'これ {食|た}べて', 'これ たべて']],
      notes: [['Sightseeing — at a temple or a pretty café', 'Softer: とっても だいじょうぶ？ · To staff: とっても いいですか？'], ['At a café, you see an empty seat', 'すわる → すわって. To strangers: ここ、 いいですか？'],
        ['Practicing Japanese with Yoh-chan', 'いう → いって. Also: もう いっかい やって みて いい？'], ['At home, the room is warm', 'あける → あけて · close: しめて'], ['At home, snacks on the table', 'たべる → たべて. Also: これ たべて いい？']] },
    { id: 'te-kureru', chunk: '〜てくれる？', group: 'ask', pre: '', post: 'くれる？', join: ' ', en: 'Could you {}?',
      note: 'て-form + くれる？ = a friendly request. Softer: 〜て くれない？ · Polite: 〜て もらえますか？',
      slots: [['take a photo of us', '{写真|しゃしん} {撮|と}って', 'しゃしん とって'], ['pass the salt', 'お{塩|しお} {取|と}って', 'おしお とって'],
        ['come pick me up', '{迎|むか}えに {来|き}て', 'むかえ に きて'], ['teach me this kanji', 'この {漢字|かんじ} {教|おし}えて', 'この かんじ おしえて'], ['turn on the heater', 'エアコン つけて', 'エアコン つけて']],
      notes: [['Sightseeing — you want a photo together', 'To a stranger: しゃしん とって もらえますか？'], ['Dinner at home', 'Same sound とって — 撮って (photo) / 取って (pass)'],
        ['After work, at the station', 'くる → きて'], ['Studying together at home', 'Softer: おしえて くれない？'], ['At home on a cold night', 'Turn off: けして']] },
    { id: 'kudasai', chunk: '〜ください', group: 'ask', pre: '', post: 'ください', join: ' ', en: '{}, please.',
      note: '〜を ください = asking for a thing (in shops and restaurants). Also common: 〜 おねがいします',
      slots: [['Water', 'お{水|みず}を', 'おみず を'], ['Two matcha lattes', '{抹茶|まっちゃ}ラテを {二|ふた}つ', 'まっちゃラテ を ふたつ'],
        ['The menu', 'メニューを', 'メニュー を'], ['This one', 'これを', 'これ を'], ['A bag', '{袋|ふくろ}を', 'ふくろ を']],
      notes: [['At a restaurant', 'Also: おみず おねがいします'], ['Ordering at a café counter', 'Counting things: ひとつ, ふたつ, みっつ'],
        ['Sitting down at a restaurant', 'Also: メニュー おねがいします'], ['Pointing at the menu or a shop item', 'Pointing is totally OK in Japan'], ['At the convenience store register', 'No bag: ふくろ だいじょうぶ です']] },
    { id: 'tai', chunk: '〜たい', group: 'want', pre: '', post: 'たい な', join: '', en: 'I want to {}.',
      note: 'ます-stem + たい = I want to. な at the end makes it soft, like thinking out loud.',
      slots: [['eat ramen', 'ラーメン {食|た}べ', 'ラーメン たべ'], ['go to Kyoto', '{京都|きょうと}に {行|い}き', 'きょうと に いき'],
        ['see the sea', '{海|うみ}が {見|み}', 'うみ が み'], ['rest a little', 'ちょっと {休|やす}み', 'ちょっと やすみ'], ['stay home today', '{今日|きょう}は {家|いえ}に い', 'きょう は いえ に い']],
      notes: [['Walking at night, you are hungry', 'Stronger: めっちゃ たべたい！'], ['Planning a trip together', 'いく → いきたい'],
        ['Dreaming about summer', 'With たい you can use が: うみ が みたい'], ['Tired after walking around', 'Also: ちょっと きゅうけい しよう'], ['A lazy rainy day', 'Also: おうち で ゆっくり したい']] },
    { id: 'ni-ikou', chunk: '〜に行こう', group: 'want', pre: '', post: 'に {行|い}こう！', join: ' ', en: 'Let\'s go to {}!',
      note: '〜に いこう = let\'s go (to a place). Softer: 〜に いかない？ In casual talk に is often dropped: カフェ いこう！',
      slots: [['a café', 'カフェ', 'カフェ'], ['the beach', '{海|うみ}', 'うみ'], ['the shrine', '{神社|じんじゃ}', 'じんじゃ'],
        ['the convenience store', 'コンビニ', 'コンビニ'], ['see the illuminations', 'イルミネーションを {見|み}', 'イルミネーション を み']],
      notes: [['After lunch on a day off', 'Softer: カフェ いかない？'], ['A hot summer day', 'Also: うみ いきたい！'], ['Sightseeing in Kyoto', 'Temple = おてら'],
        ['At home late at night', 'Casual: コンビニ いこ！'], ['A winter evening', 'Going to do something: 〜を みに いこう (let\'s go to see)']] },
    { id: 'shinai', chunk: '〜しない？', group: 'want', pre: '', post: 'しない？', join: ' ', en: 'Want to {}?',
      note: 'Noun + しない？ = a soft invitation ("Shall we…?"). More direct: 〜 しよう！',
      slots: [['go for a walk', 'さんぽ', 'さんぽ'], ['cook together', 'いっしょに {料理|りょうり}', 'いっしょ に りょうり'], ['go shopping', '{買|か}い{物|もの}', 'かいもの'],
        ['play a game', 'ゲーム', 'ゲーム'], ['take a break', 'きゅうけい', 'きゅうけい']],
      notes: [['A sunny afternoon', 'More direct: さんぽ しよう！'], ['At home, deciding dinner', 'Also: いっしょ に つくろう'], ['A free Saturday', 'Also: かいもの いこう'],
        ['A relaxing night at home', 'Also: ゲーム やろう'], ['Tired from sightseeing', 'Also: ちょっと やすもう']] },
    { id: 'ga-suki', chunk: '〜が好き', group: 'feel', pre: '', post: 'が {好|す}き', join: ' ', en: 'I like {}.',
      note: '〜が すき = I like. Love it: 〜が だいすき. Ask: 〜 すき？',
      slots: [['matcha ice cream', '{抹茶|まっちゃ}アイス', 'まっちゃアイス'], ['this temple', 'この お{寺|てら}', 'この おてら'], ['rainy days', '{雨|あめ}の {日|ひ}', 'あめ の ひ'],
        ['this song', 'この {歌|うた}', 'この うた'], ['spicy food', '{辛|から}い もの', 'からい もの']],
      notes: [['Eating dessert on a trip', 'Love it: だいすき！'], ['Sightseeing in Kyoto', 'Also: この おてら、 いい ね'], ['Looking out the window at home', 'Not so much: あんまり すき じゃ ない'],
        ['Listening to music at home', 'Ask back: この うた すき？'], ['Talking about food', 'Not good at: からい もの は にがて']] },
    { id: 'ga-oishii', chunk: '〜がおいしい', group: 'feel', pre: '', post: 'が おいしい！', join: ' ', en: '{} is delicious!',
      note: '〜が おいしい = ~ is delicious. In talk, people often drop が: この ラーメン、 おいしい！',
      slots: [['The ramen here', 'ここの ラーメン', 'ここ の ラーメン'], ['Japanese rice', '{日本|にほん}の お{米|こめ}', 'にほん の おこめ'],
        ['The fish in this town', 'この {町|まち}の お{魚|さかな}', 'この まち の おさかな'], ['Yoh-chan\'s curry', 'ようちゃんの カレー', 'ようちゃん の カレー'], ['Beer after a bath', 'お{風呂|ふろ}の あとの ビール', 'おふろ の あと の ビール']],
      notes: [['At a ramen shop', 'Stronger: めっちゃ おいしい！'], ['Eating at a Japanese restaurant', 'お makes it polite and soft: おこめ, おさかな'],
        ['Traveling by the sea', 'Also: さかな が しんせん (fresh)'], ['Dinner at home', 'Also: また つくって ね！'], ['Relaxing at home at night', 'Also: さいこう！ (the best!)']] },
    { id: 'ga-tanoshikatta', chunk: '〜が楽しかった', group: 'feel', pre: '', post: 'が {楽|たの}しかった', join: ' ', en: '{} was fun.',
      note: 'たのしい → たのしかった (past). Add ね to share the feeling: 〜が たのしかった ね',
      slots: [['Today\'s date', '{今日|きょう}の デート', 'きょう の デート'], ['The trip to Kyoto', '{京都|きょうと} {旅行|りょこう}', 'きょうと りょこう'], ['The festival', 'お{祭|まつ}り', 'おまつり'],
        ['Cooking together', 'いっしょに {作|つく}るの', 'いっしょ に つくる の'], ['Karaoke', 'カラオケ', 'カラオケ']],
      notes: [['Saying goodbye after a date', 'Also: きょう たのしかった ね！'], ['Talking after a trip', 'Also: また いきたい ね'], ['Walking home from a summer festival', 'Also: すごく たのしかった！'],
        ['At home after dinner', 'Doing something = verb + の (つくる の)'], ['After a night out', 'Also: また いこう ね！']] },
    { id: 'wa-doko', chunk: '〜はどこ？', group: 'q', pre: '', post: 'は どこ？', join: ' ', en: 'Where is {}?',
      note: '〜は どこ？ = Where is ~? Polite (to staff): 〜は どこ ですか？',
      slots: [['the restroom', 'トイレ', 'トイレ'], ['the station', '{駅|えき}', 'えき'], ['the exit', '{出口|でぐち}', 'でぐち'],
        ['my phone', 'わたしの スマホ', 'わたし の スマホ'], ['the ticket gate', '{改札|かいさつ}', 'かいさつ']],
      notes: [['At a restaurant or a mall', 'Polite: おてあらい は どこ ですか？'], ['Lost while sightseeing', 'Also: えき って どっち？ (which way?)'],
        ['In a big station', 'Entrance = いりぐち'], ['At home, looking around', 'Also: スマホ どこ いった？'], ['Meeting at a station', 'Also: かいさつ って どこ？']] },
    { id: 'wa-nani', chunk: '〜は何？', group: 'q', pre: '', post: 'は {何|なに}？', join: ' ', en: 'What is {}?',
      note: '〜は なに？ = What is ~? Before です it becomes なん: なん ですか？',
      slots: [['this', 'これ', 'これ'], ['the recommendation', 'おすすめ', 'おすすめ'], ['that building', 'あの {建物|たてもの}', 'あの たてもの'],
        ['tonight\'s dinner', '{今日|きょう}の {晩|ばん}ごはん', 'きょう の ばんごはん'], ['your favorite food', '{好|す}きな {食|た}べ{物|もの}', 'すき な たべもの']],
      notes: [['Pointing at food at a market', 'Also: これ なに？ (very common)'], ['At a café or restaurant', 'To staff: おすすめ は なん ですか？'],
        ['Sightseeing in a city', 'Also: あれ なに？'], ['At home, smelling something good', 'Also: きょう の ごはん なに？'], ['Getting to know each other', 'Also: なに が すき？']] },
    { id: 'wa-dou', chunk: '〜はどう？', group: 'q', pre: '', post: 'は どう？', join: ' ', en: 'How about {}?',
      note: '〜は どう？ = How about ~? / How is ~? Great for suggesting or asking an opinion.',
      slots: [['this one', 'これ', 'これ'], ['tomorrow', '{明日|あした}', 'あした'], ['Italian food', 'イタリアン', 'イタリアン'],
        ['the blue one', '{青|あお}いの', 'あおい の'], ['Saturday', '{土曜日|どようび}', 'どようび']],
      notes: [['Shopping, showing a sweater', 'Also: これ どう？ (は is often dropped)'], ['Making plans', 'Also: あした あいてる？'], ['Deciding where to eat', 'Also: イタリアン に しない？'],
        ['Choosing colors in a shop', 'the ~ one = 〜の (あかい の, しろい の)'], ['Choosing a day', 'Also: どようび で いい？']] },
    { id: 'ta-koto-aru', chunk: '〜たことある？', group: 'plan', pre: '', post: 'こと ある？', join: ' ', en: 'Have you ever {}?',
      note: 'Past form (た) + こと ある？ = Have you ever…? Answer: ある よ！ / まだ ない',
      slots: [['eaten natto', '{納豆|なっとう} {食|た}べた', 'なっとう たべた'], ['climbed Mt. Fuji', '{富士山|ふじさん}に {登|のぼ}った', 'ふじさん に のぼった'],
        ['been to Okinawa', '{沖縄|おきなわ}に {行|い}った', 'おきなわ に いった'], ['worn a yukata', '{浴衣|ゆかた} {着|き}た', 'ゆかた きた'], ['sung karaoke', 'カラオケで {歌|うた}った', 'カラオケ で うたった']],
      notes: [['Breakfast at a Japanese inn', 'Answer: ある けど、 にがて (yes, but I don\'t like it)'], ['Talking about mountains', 'Answer: まだ ない！ いつか のぼりたい'],
        ['Planning a trip', 'Answer: いった こと ない'], ['Before a summer festival', 'きる → きた (wear)'], ['Planning a night out', 'Answer: ある よ！ すき！']] },
    { id: 'tsumori', chunk: '〜つもり', group: 'plan', pre: '', post: 'つもり', join: ' ', en: 'I\'m planning to {}.',
      note: 'Dictionary form + つもり = I plan to / I intend to. Softer: 〜 よてい だよ',
      slots: [['go to Kyoto in spring', '{春|はる}に {京都|きょうと}へ {行|い}く', 'はる に きょうと へ いく'], ['cook tonight', '{今夜|こんや}は {料理|りょうり}する', 'こんや は りょうり する'],
        ['study Japanese every day', '{毎日|まいにち} {日本語|にほんご}を {勉強|べんきょう}する', 'まいにち にほんご を べんきょう する'], ['go to bed early', '{早|はや}く {寝|ね}る', 'はやく ねる'], ['buy souvenirs', 'おみやげを {買|か}う', 'おみやげ を かう']],
      notes: [['Talking about future trips', 'Also: はる は きょうと に いく よ'], ['At home in the afternoon', 'Also: こんや は わたし が つくる ね'],
        ['Talking about your goals', 'Also: まいにち がんばる！'], ['Tired after a long day', 'Also: きょう は はやく ねる ね'], ['Last day of a trip', 'おみやげ = souvenirs for friends and coworkers']] },
    { id: 'kara-made', chunk: '〜から〜まで', group: 'plan', pre: '', post: 'まで', join: ' ', en: '{}',
      note: 'A から B まで = from A to B (time, days, places). から = from, まで = until / to.',
      slots: [['Work is from 9 to 5.', '{仕事|しごと}は {九時|くじ}から {五時|ごじ}', 'しごと は くじ から ごじ'], ['The shop is open from 10 to 8.', 'お{店|みせ}は {十時|じゅうじ}から {八時|はちじ}', 'おみせ は じゅうじ から はちじ'],
        ['My days off are Saturday to Monday.', '{休|やす}みは {土曜|どよう}から {月曜|げつよう}', 'やすみ は どよう から げつよう'], ['The trip is from the 3rd to the 5th.', '{旅行|りょこう}は {三日|みっか}から {五日|いつか}', 'りょこう は みっか から いつか'],
        ['Lunch is from 12 to 1.', 'ランチは {十二時|じゅうにじ}から {一時|いちじ}', 'ランチ は じゅうにじ から いちじ']],
      notes: [['Telling Yoh-chan your work hours', 'Also: くじ から ごじ まで しごと だよ'], ['Checking shop hours on a trip', 'Also: はちじ まで やってる よ'],
        ['Making plans for a long weekend', 'Days: げつ・か・すい・もく・きん・ど・にち'], ['Planning a trip', 'Dates are special: みっか (3rd), いつか (5th)'], ['At work or school', 'Also: おひる は じゅうにじ から']] }
  ];

  // ---- ひらがな → ローマ字（ヘボン式）----
  const R1 = { あ:'a',い:'i',う:'u',え:'e',お:'o',か:'ka',き:'ki',く:'ku',け:'ke',こ:'ko',さ:'sa',し:'shi',す:'su',せ:'se',そ:'so',た:'ta',ち:'chi',つ:'tsu',て:'te',と:'to',
    な:'na',に:'ni',ぬ:'nu',ね:'ne',の:'no',は:'ha',ひ:'hi',ふ:'fu',へ:'he',ほ:'ho',ま:'ma',み:'mi',む:'mu',め:'me',も:'mo',や:'ya',ゆ:'yu',よ:'yo',ら:'ra',り:'ri',る:'ru',れ:'re',ろ:'ro',
    わ:'wa',を:'o',ん:'n',が:'ga',ぎ:'gi',ぐ:'gu',げ:'ge',ご:'go',ざ:'za',じ:'ji',ず:'zu',ぜ:'ze',ぞ:'zo',だ:'da',ぢ:'ji',づ:'zu',で:'de',ど:'do',ば:'ba',び:'bi',ぶ:'bu',べ:'be',ぼ:'bo',
    ぱ:'pa',ぴ:'pi',ぷ:'pu',ぺ:'pe',ぽ:'po',ぁ:'a',ぃ:'i',ぅ:'u',ぇ:'e',ぉ:'o' };
  const R2 = { きゃ:'kya',きゅ:'kyu',きょ:'kyo',しゃ:'sha',しゅ:'shu',しょ:'sho',ちゃ:'cha',ちゅ:'chu',ちょ:'cho',にゃ:'nya',にゅ:'nyu',にょ:'nyo',ひゃ:'hya',ひゅ:'hyu',ひょ:'hyo',
    みゃ:'mya',みゅ:'myu',みょ:'myo',りゃ:'rya',りゅ:'ryu',りょ:'ryo',ぎゃ:'gya',ぎゅ:'gyu',ぎょ:'gyo',じゃ:'ja',じゅ:'ju',じょ:'jo',びゃ:'bya',びゅ:'byu',びょ:'byo',ぴゃ:'pya',ぴゅ:'pyu',ぴょ:'pyo',
    てぃ:'ti',でぃ:'di',ふぁ:'fa',ふぃ:'fi',ふぇ:'fe',ふぉ:'fo',うぃ:'wi',うぇ:'we',しぇ:'she',じぇ:'je',ちぇ:'che' };
  function romaji(kana) {
    const s = String(kana).replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
    let out = '', i = 0;
    while (i < s.length) {
      const two = s.slice(i, i + 2), c = s[i];
      if (c === 'っ') { const nx = R2[s.slice(i + 1, i + 3)] || R1[s[i + 1]] || ''; out += nx ? (nx.startsWith('ch') ? 't' : nx[0]) : ''; i++; continue; }
      if (c === 'ー') { const m = out.match(/[aeiou]$/); out += m ? m[0] : ''; i++; continue; }
      if (R2[two]) { out += R2[two]; i += 2; continue; }
      if (c === 'ん') { out += (/[aiueoy]/.test((R1[s[i + 1]] || '')[0] || '') ? "n'" : 'n'); i++; continue; }
      if (R1[c]) { out += R1[c]; i++; continue; }
      out += c === '、' ? ',' : c === '？' ? '?' : c === '！' ? '!' : c; i++;
    }
    return out.replace(/ha( |$)(?=)/g, (m, sp) => m);   // （は を wa に する の は 下 の particle で）
  }
  const kanaOf = s => String(s || '').replace(/\{([^|}]+)\|([^}]+)\}/g, '$2');
  // 助詞「は」「へ」は wa / e と 読む（単語 として スペース で 区切られて いる とき）
  const particle = r => r.replace(/(^| )ha(?= |[?!.,]|$)/g, '$1wa').replace(/(^| )he(?= |$)/g, '$1e');

  // 完成 した 日本語：{ kj: ふりがな 書き方, kana: ひらがな（スペース 区切り）, romaji }
  function sentence(p, s) {
    const slot = Array.isArray(s) ? s : p.slots[s];
    const sep = p.join == null ? ' ' : p.join;
    const kj = ((p.pre ? p.pre + ' ' : '') + slot[1] + sep + p.post).replace(/ /g, '');   // 漢字 の 表示 は スペース なし
    const kana = (p.pre ? kanaOf(p.pre) + ' ' : '') + slot[2] + sep + kanaOf(p.post);
    return { kj, kana, romaji: particle(romaji(kana)) };
  }
  function enOf(p, s) { const slot = Array.isArray(s) ? s : p.slots[s]; return p.en.split('{}').join(slot[0]); }
  function noteOf(p, i) { return (p.notes && p.notes[i]) || ['', '']; }
  // 型 の 表示：「［　］ ＋ てもいい？」（pre ／ post 両方）
  const byId = {}; PATTERNS.forEach(p => { byId[p.id] = p; });
  // 読み上げ（自然な 音）用：ほか の ファイル と 同じ 形 [かな, ローマ字, 漢字]
  const items = [];
  PATTERNS.forEach(p => p.slots.forEach((sl, i) => { const s = sentence(p, i); const f = [s.kana, s.romaji, s.kj]; items.push({ key: 'pt:' + p.id + ':' + i, c: f, p: f, en: enOf(p, i) }); }));
  window.CJ_PATTERNS = { GROUPS, PATTERNS, byId, sentence, enOf, noteOf, romaji: k => particle(romaji(k)), items,
    NOTES: Object.fromEntries(PATTERNS.map(p => [p.id, p.notes])) };
})();
