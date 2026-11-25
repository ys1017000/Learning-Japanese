/* 🎌 日本 の 祝日（しゅくじつ）。日付 の 決め方：
   d: [月, 日] = 毎年 同じ 日。mon: [月, 何番目] = その月 の 第◯月曜日（ハッピーマンデー）。eq: 'spring' / 'autumn' = 春分・秋分（計算）。
   ja = [ひらがな, ローマ字, 漢字(ふりがな)]。q = 検索 の ことば、tag = Instagram の ハッシュタグ */
(function () {
  const HOLIDAYS = [
    { id: 'ganjitsu', d: [1, 1], icon: '🎍', ja: ['がんじつ', 'ganjitsu', '{元日|がんじつ}'], en: 'New Year\'s Day',
      what: 'The most important holiday of the year. Most shops close for a few days, and families stay together.',
      whatJa: 'いちねん で いちばん だいじ な しゅくじつ。おみせ も すうじつ やすみ に なって、かぞく で すごします。',
      how: 'Eat osechi and ozoni (rice cake soup), visit a shrine (hatsumode), and give kids otoshidama.',
      howJa: 'おせち や おぞうに を たべて、じんじゃ に はつもうで。こども には おとしだま。', q: 'Japanese New Year oshogatsu', tag: 'お正月' },
    { id: 'seijin', mon: [1, 2], icon: '👘', ja: ['せいじんのひ', 'seijin no hi', '{成人|せいじん}の{日|ひ}'], en: 'Coming of Age Day',
      what: 'A day to celebrate young people who became adults (20) this year.',
      whatJa: 'ことし おとな に なった 20さい の ひと を おいわい する ひ。',
      how: 'New adults wear beautiful kimono or suits and go to a ceremony in their hometown.',
      howJa: 'きれい な きもの や スーツ を きて、ふるさと の しき に いきます。', q: 'Seijin no Hi coming of age Japan kimono', tag: '成人式' },
    { id: 'kenkoku', d: [2, 11], icon: '🗾', ja: ['けんこくきねんのひ', 'kenkoku kinen no hi', '{建国記念|けんこくきねん}の{日|ひ}'], en: 'National Foundation Day',
      what: 'Remembers the founding of Japan, based on an old legend.',
      whatJa: 'むかし の おはなし を もと に、にほん の はじまり を おもう ひ。',
      how: 'For most people it is just a quiet day off.', howJa: 'ほとんど の ひと に とって は、ふつう の やすみ の ひ。', q: 'Kenkoku Kinen no Hi National Foundation Day', tag: '建国記念の日' },
    { id: 'tenno', d: [2, 23], icon: '🎂', ja: ['てんのうたんじょうび', 'tennou tanjoubi', '{天皇誕生日|てんのうたんじょうび}'], en: 'Emperor\'s Birthday',
      what: 'The birthday of the current Emperor. The date changes when a new Emperor starts.',
      whatJa: 'いま の てんのう の たんじょうび。てんのう が かわる と ひにち も かわります。',
      how: 'The Imperial Palace in Tokyo opens to the public, and the Emperor greets people.', howJa: 'とうきょう の こうきょ に はいれて、てんのう が あいさつ します。', q: 'Emperor birthday Japan Imperial Palace greeting', tag: '天皇誕生日' },
    { id: 'shunbun', eq: 'spring', icon: '🌱', ja: ['しゅんぶんのひ', 'shunbun no hi', '{春分|しゅんぶん}の{日|ひ}'], en: 'Spring Equinox Day',
      what: 'Day and night are the same length. A day to love nature and living things.',
      whatJa: 'ひる と よる が おなじ ながさ の ひ。しぜん や いきもの を だいじ に する ひ。',
      how: 'Many families visit their ancestors\' graves (ohigan) and eat sweet rice balls called ohagi / botamochi.',
      howJa: 'おはかまいり（おひがん）に いって、ぼたもち を たべる かぞく も おおい。', q: 'ohigan spring equinox Japan botamochi', tag: '春分の日' },
    { id: 'showa', d: [4, 29], icon: '🌸', ja: ['しょうわのひ', 'shouwa no hi', '{昭和|しょうわ}の{日|ひ}'], en: 'Showa Day',
      what: 'The birthday of the Showa Emperor. A day to think about the Showa era (1926–1989).',
      whatJa: 'しょうわ てんのう の たんじょうび。しょうわ の じだい を おもいだす ひ。',
      how: 'It starts Golden Week — many people begin traveling.', howJa: 'ゴールデンウィーク の はじまり。りょこう に でかける ひと が おおい。', q: 'Showa Day Golden Week Japan', tag: '昭和の日' },
    { id: 'kenpo', d: [5, 3], icon: '📜', ja: ['けんぽうきねんび', 'kenpou kinenbi', '{憲法記念日|けんぽうきねんび}'], en: 'Constitution Day',
      what: 'Remembers the start of Japan\'s constitution in 1947.', whatJa: '1947ねん に にほん の けんぽう が はじまった こと を おもう ひ。',
      how: 'Part of Golden Week. Trains and tourist spots are very crowded.', howJa: 'ゴールデンウィーク の まんなか。でんしゃ も かんこうち も とても こむ。', q: 'Constitution Memorial Day Japan', tag: '憲法記念日' },
    { id: 'midori', d: [5, 4], icon: '🌳', ja: ['みどりのひ', 'midori no hi', 'みどりの{日|ひ}'], en: 'Greenery Day',
      what: 'A day to enjoy nature and say thanks for it. Nice for green-lovers! 💚', whatJa: 'しぜん を たのしんで、ありがとう を いう ひ。みどり が すき な ひと に ぴったり！💚',
      how: 'Some parks and gardens are free to enter on this day.', howJa: 'この ひ は むりょう で はいれる こうえん や にわ も あります。', q: 'Greenery Day Japan park', tag: 'みどりの日' },
    { id: 'kodomo', d: [5, 5], icon: '🎏', ja: ['こどものひ', 'kodomo no hi', 'こどもの{日|ひ}'], en: 'Children\'s Day',
      what: 'A day to wish for children\'s health and happiness.', whatJa: 'こども の げんき と しあわせ を ねがう ひ。',
      how: 'Families hang carp streamers (koinobori) outside and eat kashiwa-mochi.', howJa: 'そと に こいのぼり を かざって、かしわもち を たべます。', q: 'Kodomo no Hi koinobori', tag: 'こいのぼり' },
    { id: 'umi', mon: [7, 3], icon: '🌊', ja: ['うみのひ', 'umi no hi', '{海|うみ}の{日|ひ}'], en: 'Marine Day',
      what: 'A day to thank the sea. Japan is an island country!', whatJa: 'うみ に ありがとう を いう ひ。にほん は しまぐに だから！',
      how: 'Beaches open around this time, and summer really starts.', howJa: 'この ころ うみ が ひらいて、なつ が ほんかくてき に はじまります。', q: 'Umi no Hi Marine Day Japan beach', tag: '海の日' },
    { id: 'yama', d: [8, 11], icon: '⛰️', ja: ['やまのひ', 'yama no hi', '{山|やま}の{日|ひ}'], en: 'Mountain Day',
      what: 'A day to enjoy mountains. It is the newest holiday (since 2016).', whatJa: 'やま を たのしむ ひ。いちばん あたらしい しゅくじつ（2016ねん から）。',
      how: 'Many people go hiking or camping — and it is right before Obon.', howJa: 'ハイキング や キャンプ に いく ひと も。すぐ あと が おぼん。', q: 'Yama no Hi Mountain Day Japan hiking', tag: '山の日' },
    { id: 'keiro', mon: [9, 3], icon: '👵', ja: ['けいろうのひ', 'keirou no hi', '{敬老|けいろう}の{日|ひ}'], en: 'Respect for the Aged Day',
      what: 'A day to thank and respect older people.', whatJa: 'おとしより に ありがとう を いって、たいせつ に する ひ。',
      how: 'People visit or call their grandparents and give small gifts.', howJa: 'おじいちゃん や おばあちゃん に あったり でんわ したり、プレゼント を あげます。', q: 'Keiro no Hi Respect for the Aged Day', tag: '敬老の日' },
    { id: 'shubun', eq: 'autumn', icon: '🍂', ja: ['しゅうぶんのひ', 'shuubun no hi', '{秋分|しゅうぶん}の{日|ひ}'], en: 'Autumn Equinox Day',
      what: 'Day and night are the same length again. A day to remember family who passed away.',
      whatJa: 'また ひる と よる が おなじ ながさ に なる ひ。なくなった かぞく を おもう ひ。',
      how: 'Like the spring one: visiting graves (ohigan) and eating ohagi. Red spider lilies bloom now.',
      howJa: 'はる と おなじ で、おはかまいり と おはぎ。ひがんばな が さく ころ。', q: 'autumn ohigan higanbana Japan', tag: '彼岸花' },
    { id: 'sports', mon: [10, 2], icon: '🏃', ja: ['スポーツのひ', 'supōtsu no hi', 'スポーツの{日|ひ}'], en: 'Sports Day',
      what: 'Started to remember the 1964 Tokyo Olympics. A day to enjoy moving your body.',
      whatJa: '1964ねん の とうきょう オリンピック から できた ひ。からだ を うごかす の を たのしむ ひ。',
      how: 'Schools and towns hold sports festivals (undokai) around this time.', howJa: 'この ころ がっこう や まち で うんどうかい が あります。', q: 'undokai Japan sports day', tag: '運動会' },
    { id: 'bunka', d: [11, 3], icon: '🎨', ja: ['ぶんかのひ', 'bunka no hi', '{文化|ぶんか}の{日|ひ}'], en: 'Culture Day',
      what: 'A day to love freedom, peace, and culture.', whatJa: 'じゆう と へいわ と ぶんか を だいじ に する ひ。',
      how: 'Museums have events, and universities hold school festivals. It is often sunny on this day!', howJa: 'びじゅつかん の イベント や だいがく の がくえんさい。この ひ は はれ が おおい！', q: 'Bunka no Hi Culture Day Japan', tag: '文化の日' },
    { id: 'kinro', d: [11, 23], icon: '🙇', ja: ['きんろうかんしゃのひ', 'kinrou kansha no hi', '{勤労感謝|きんろうかんしゃ}の{日|ひ}'], en: 'Labor Thanksgiving Day',
      what: 'A day to thank everyone for their work. It comes from an old harvest festival.', whatJa: 'はたらく ひと みんな に ありがとう を いう ひ。むかし の しゅうかく の おまつり から。',
      how: 'Say おつかれさま to someone who works hard — maybe Yoh-chan? 😊', howJa: 'がんばって はたらく ひと に 「おつかれさま」 と いって みよう。ようちゃん にも？😊', q: 'Labor Thanksgiving Day Japan', tag: '勤労感謝の日' }
  ];

  // 祝日 では ない けど、みんな が やすむ 時期
  const SEASONS = [
    { icon: '🎏', ja: ['ゴールデンウィーク', 'gōruden wīku', 'ゴールデンウィーク'], en: 'Golden Week (late April – early May)', text: 'Showa Day, Constitution Day, Greenery Day and Children\'s Day come together. Many people get about a week off.', textJa: 'しょうわ の ひ から こども の ひ まで しゅくじつ が つづいて、1しゅうかん ぐらい やすみ に なる ひと も。' },
    { icon: '🏮', ja: ['おぼん', 'obon', 'お{盆|ぼん}'], en: 'Obon (mid-August)', text: 'Not a national holiday, but many companies close for a few days so people can visit their hometown.', textJa: 'しゅくじつ では ない けど、おおく の かいしゃ が やすみ に なって、ふるさと に かえります。' },
    { icon: '🎍', ja: ['ねんまつねんし', 'nenmatsu nenshi', '{年末年始|ねんまつねんし}'], en: 'New Year break (Dec 29 – Jan 3)', text: 'Most offices and many shops close. It is the biggest family holiday in Japan.', textJa: 'かいしゃ や おみせ の おおく が やすみ。にほん で いちばん おおきな かぞく の やすみ。' },
    { icon: '🍂', ja: ['シルバーウィーク', 'shirubā wīku', 'シルバーウィーク'], en: 'Silver Week (September, some years)', text: 'When Respect for the Aged Day and Autumn Equinox Day are close, you can get a long weekend — like 2026!', textJa: 'けいろう の ひ と しゅうぶん の ひ が ちかい と、れんきゅう に なる ことし（2026ねん）みたい に！' }
  ];

  window.CJ_HOLIDAYS = { HOLIDAYS, SEASONS };
})();
