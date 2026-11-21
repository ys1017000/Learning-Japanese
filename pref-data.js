/* マルちゃんのペースでいいよ - 都道府県（タイル型の日本地図）
   1行 = [ID, 名前（{漢字|よみ}）, ローマ字, 地方ID, x, y, 横の大きさ, 県庁のある市, 有名なもの（英）, 有名なもの（ひらがな）]
   x・y は「しかく」を並べる位置（左上が 0,0）。本物の地図に近い場所に置いている */
(function () {
  "use strict";
  const REGIONS = {
    hokkaido: { kj: '{北海道|ほっかいどう}', en: 'Hokkaido', color: '#a9cbe8' },
    tohoku: { kj: '{東北|とうほく}', en: 'Tohoku', color: '#b9dcae' },
    kanto: { kj: '{関東|かんとう}', en: 'Kanto', color: '#f6c3c8' },
    chubu: { kj: '{中部|ちゅうぶ}', en: 'Chubu', color: '#f6dea0' },
    kinki: { kj: '{近畿|きんき}（{関西|かんさい}）', en: 'Kansai (Kinki)', color: '#d8c6ee' },
    chugoku: { kj: '{中国|ちゅうごく}', en: 'Chugoku', color: '#a9dcd8' },
    shikoku: { kj: '{四国|しこく}', en: 'Shikoku', color: '#f4c4a6' },
    kyushu: { kj: '{九州|きゅうしゅう}・{沖縄|おきなわ}', en: 'Kyushu & Okinawa', color: '#cbd9a2' }
  };
  const RAW = [
    ['hokkaido', '{北海道|ほっかいどう}', 'Hokkaido', 'hokkaido', 12, 0, 1, '{札幌|さっぽろ}', 'Snow Festival, seafood, lavender fields, skiing', 'ゆきまつり・かいせん・ラベンダー・スキー'],
    ['aomori', '{青森|あおもり}', 'Aomori', 'tohoku', 12, 1, 1, '{青森|あおもり}', 'Apples, Nebuta festival', 'りんご・ねぶたまつり'],
    ['iwate', '{岩手|いわて}', 'Iwate', 'tohoku', 12, 2, 1, '{盛岡|もりおか}', 'Wanko soba, Hiraizumi temples', 'わんこそば・ひらいずみ'],
    ['akita', '{秋田|あきた}', 'Akita', 'tohoku', 11, 2, 1, '{秋田|あきた}', 'Akita dogs, Namahage, rice', 'あきたいぬ・なまはげ・おこめ'],
    ['miyagi', '{宮城|みやぎ}', 'Miyagi', 'tohoku', 12, 3, 1, '{仙台|せんだい}', 'Gyutan (beef tongue), Matsushima islands', 'ぎゅうたん・まつしま'],
    ['yamagata', '{山形|やまがた}', 'Yamagata', 'tohoku', 11, 3, 1, '{山形|やまがた}', 'Cherries, Ginzan Onsen hot spring town', 'さくらんぼ・ぎんざんおんせん'],
    ['fukushima', '{福島|ふくしま}', 'Fukushima', 'tohoku', 11, 4, 1, '{福島|ふくしま}', 'Peaches, the old castle town Aizu', 'もも・あいづ'],
    ['ibaraki', '{茨城|いばらき}', 'Ibaraki', 'kanto', 12, 5, 1, '{水戸|みと}', 'Natto, flower fields at Hitachi Seaside Park', 'なっとう・ひたちかいひんこうえん'],
    ['tochigi', '{栃木|とちぎ}', 'Tochigi', 'kanto', 11, 5, 1, '{宇都宮|うつのみや}', 'Nikko shrines, gyoza, strawberries', 'にっこう・ぎょうざ・いちご'],
    ['gunma', '{群馬|ぐんま}', 'Gunma', 'kanto', 10, 5, 1, '{前橋|まえばし}', 'Kusatsu hot springs', 'くさつおんせん'],
    ['saitama', '{埼玉|さいたま}', 'Saitama', 'kanto', 10, 6, 1, 'さいたま', 'Kawagoe, the "Little Edo" old town', 'かわごえ（こえど）'],
    ['chiba', '{千葉|ちば}', 'Chiba', 'kanto', 12, 6, 1, '{千葉|ちば}', 'Tokyo Disneyland, Narita Airport', 'ディズニーランド・なりたくうこう'],
    ['tokyo', '{東京|とうきょう}', 'Tokyo', 'kanto', 11, 6, 1, '{東京|とうきょう}', 'The capital — Shibuya, Tokyo Tower, Naka-Meguro', 'しゅと — しぶや・とうきょうタワー・なかめぐろ'],
    ['kanagawa', '{神奈川|かながわ}', 'Kanagawa', 'kanto', 11, 7, 1, '{横浜|よこはま}', 'Yokohama, the Great Buddha of Kamakura, Hakone', 'よこはま・かまくら の だいぶつ・はこね'],
    ['niigata', '{新潟|にいがた}', 'Niigata', 'chubu', 10, 4, 1, '{新潟|にいがた}', 'Rice, sake, lots of snow', 'おこめ・にほんしゅ・ゆき'],
    ['toyama', '{富山|とやま}', 'Toyama', 'chubu', 9, 4, 1, '{富山|とやま}', 'Tateyama snow walls, seafood', 'たてやま の ゆき の かべ・かいせん'],
    ['ishikawa', '{石川|いしかわ}', 'Ishikawa', 'chubu', 8, 4, 1, '{金沢|かなざわ}', 'Kanazawa, gold leaf, Kenrokuen garden', 'かなざわ・きんぱく・けんろくえん'],
    ['fukui', '{福井|ふくい}', 'Fukui', 'chubu', 7, 5, 1, '{福井|ふくい}', 'Dinosaur museum, crabs', 'きょうりゅう・かに'],
    ['yamanashi', '{山梨|やまなし}', 'Yamanashi', 'chubu', 9, 6, 1, '{甲府|こうふ}', 'Views of Mt. Fuji, grapes, wine', 'ふじさん・ぶどう・ワイン'],
    ['nagano', '{長野|ながの}', 'Nagano', 'chubu', 9, 5, 1, '{長野|ながの}', 'The Japanese Alps, snow monkeys, soba', 'アルプス・おんせん の さる・そば'],
    ['gifu', '{岐阜|ぎふ}', 'Gifu', 'chubu', 8, 5, 1, '{岐阜|ぎふ}', 'Shirakawa-go village, Takayama', 'しらかわごう・たかやま'],
    ['shizuoka', '{静岡|しずおか}', 'Shizuoka', 'chubu', 9, 7, 2, '{静岡|しずおか}', 'Green tea, Mt. Fuji', 'おちゃ・ふじさん'],
    ['aichi', '{愛知|あいち}', 'Aichi', 'chubu', 8, 6, 1, '{名古屋|なごや}', 'Nagoya, Toyota cars, miso katsu', 'なごや・トヨタ・みそかつ'],
    ['mie', '{三重|みえ}', 'Mie', 'kinki', 7, 7, 1, '{津|つ}', 'Ise Grand Shrine', 'いせじんぐう'],
    ['shiga', '{滋賀|しが}', 'Shiga', 'kinki', 7, 6, 1, '{大津|おおつ}', 'Lake Biwa — the biggest lake in Japan', 'びわこ（にほん で いちばん おおきい みずうみ）'],
    ['kyoto', '{京都|きょうと}', 'Kyoto', 'kinki', 6, 5, 1, '{京都|きょうと}', 'Temples, matcha, autumn leaves, bamboo forest', 'おてら・まっちゃ・こうよう・たけばやし'],
    ['osaka', '{大阪|おおさか}', 'Osaka', 'kinki', 5, 6, 1, '{大阪|おおさか}', 'Takoyaki, okonomiyaki, very funny people', 'たこやき・おこのみやき・おもしろい ひと'],
    ['hyogo', '{兵庫|ひょうご}', 'Hyogo', 'kinki', 5, 5, 1, '{神戸|こうべ}', 'Kobe beef, Himeji Castle', 'こうべぎゅう・ひめじじょう'],
    ['nara', '{奈良|なら}', 'Nara', 'kinki', 6, 6, 1, '{奈良|なら}', 'Deer in the park, the Great Buddha', 'しか・だいぶつ'],
    ['wakayama', '{和歌山|わかやま}', 'Wakayama', 'kinki', 6, 7, 1, '{和歌山|わかやま}', 'Koyasan temples, plums, pandas', 'こうやさん・うめ・パンダ'],
    ['tottori', '{鳥取|とっとり}', 'Tottori', 'chugoku', 4, 5, 1, '{鳥取|とっとり}', 'Sand dunes', 'さきゅう'],
    ['shimane', '{島根|しまね}', 'Shimane', 'chugoku', 3, 5, 1, '{松江|まつえ}', 'Izumo Shrine — the shrine of love and good matches', 'いずもたいしゃ（えんむすび の かみさま）'],
    ['okayama', '{岡山|おかやま}', 'Okayama', 'chugoku', 4, 6, 1, '{岡山|おかやま}', 'Peaches, the folk tale of Momotaro', 'もも・ももたろう'],
    ['hiroshima', '{広島|ひろしま}', 'Hiroshima', 'chugoku', 3, 6, 1, '{広島|ひろしま}', 'Miyajima\'s floating torii gate, okonomiyaki', 'みやじま・おこのみやき'],
    ['yamaguchi', '{山口|やまぐち}', 'Yamaguchi', 'chugoku', 2, 6, 1, '{山口|やまぐち}', 'Fugu (pufferfish), Kintai Bridge', 'ふぐ・きんたいきょう'],
    ['tokushima', '{徳島|とくしま}', 'Tokushima', 'shikoku', 4, 8, 1, '{徳島|とくしま}', 'Awa Odori dance festival', 'あわおどり'],
    ['kagawa', '{香川|かがわ}', 'Kagawa', 'shikoku', 4, 7, 1, '{高松|たかまつ}', 'Udon! (people call it "Udon prefecture")', 'うどん（うどんけん）'],
    ['ehime', '{愛媛|えひめ}', 'Ehime', 'shikoku', 3, 7, 1, '{松山|まつやま}', 'Mikan oranges, Dogo Onsen', 'みかん・どうごおんせん'],
    ['kochi', '{高知|こうち}', 'Kochi', 'shikoku', 3, 8, 1, '{高知|こうち}', 'Seared bonito, the Shimanto River', 'かつお の たたき・しまんとがわ'],
    ['fukuoka', '{福岡|ふくおか}', 'Fukuoka', 'kyushu', 1, 7, 1, '{福岡|ふくおか}', 'Hakata ramen, food stalls (yatai)', 'はかたラーメン・やたい'],
    ['saga', '{佐賀|さが}', 'Saga', 'kyushu', 0, 7, 1, '{佐賀|さが}', 'Arita pottery, hot air balloon festival', 'ありたやき・バルーン'],
    ['nagasaki', '{長崎|ながさき}', 'Nagasaki', 'kyushu', 0, 8, 1, '{長崎|ながさき}', 'Night views, castella cake', 'やけい・カステラ'],
    ['kumamoto', '{熊本|くまもと}', 'Kumamoto', 'kyushu', 1, 8, 1, '{熊本|くまもと}', 'Kumamon the bear, Mt. Aso volcano', 'くまモン・あそさん'],
    ['oita', '{大分|おおいた}', 'Oita', 'kyushu', 2, 7, 1, '{大分|おおいた}', 'Hot springs (Beppu, Yufuin)', 'おんせん（べっぷ・ゆふいん）'],
    ['miyazaki', '{宮崎|みやざき}', 'Miyazaki', 'kyushu', 2, 8, 1, '{宮崎|みやざき}', 'Mangoes, Takachiho Gorge', 'マンゴー・たかちほきょう'],
    ['kagoshima', '{鹿児島|かごしま}', 'Kagoshima', 'kyushu', 1, 9, 1, '{鹿児島|かごしま}', 'Sakurajima volcano, black pork', 'さくらじま・くろぶた'],
    ['okinawa', '{沖縄|おきなわ}', 'Okinawa', 'kyushu', 0, 10, 1, '{那覇|なは}', 'Beaches, coral reefs, Shuri Castle', 'うみ・サンゴ・しゅりじょう']
  ];
  const PREFS = RAW.map(r => ({ id: r[0], kj: r[1], en: r[2], reg: r[3], x: r[4], y: r[5], w: r[6], cap: r[7], fam: r[8], famJa: r[9] }));
  window.CJ_PREF = { REGIONS, PREFS };
})();
