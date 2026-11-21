/* Casual Japanese - 声に出して読む（短い会話）
   lines: [ひらがな（スペース区切り）, ローマ字, 英語, 漢字の書き方（{漢字|よみ}）]
   漢字の書き方は「漢字で見る」の表示と、音声認識の答え合わせ（漢字で聞き取られたとき用）の両方に使う */
(function () {
  "use strict";
  const PASSAGES = [
    { id: 'meet', icon: '📍', title: 'LINE before meeting up', titleJa: 'まちあわせ の LINE', reg: 'casual', lines: [
      ['いま どこ？', 'ima doko?', 'Where are you now?', '{今|いま}どこ？'],
      ['もう すぐ つく よ！', 'mou sugu tsuku yo!', 'I\'m almost there!', 'もうすぐ{着|つ}くよ！'],
      ['えき の きたぐち に いる ね', 'eki no kitaguchi ni iru ne', 'I\'ll be at the north exit of the station, OK?', '{駅|えき}の{北口|きたぐち}にいるね'],
      ['わかった！ すぐ いく ね', 'wakatta! sugu iku ne', 'Got it! I\'ll be right there.', '{分|わ}かった！すぐ{行|い}くね'],
      ['ついた よ〜', 'tsuita yo~', 'I\'m here~', '{着|つ}いたよ〜']] },
    { id: 'food', icon: '🍜', title: 'What shall we eat?', titleJa: 'なに たべる？', reg: 'casual', lines: [
      ['おなか すいた〜', 'onaka suita~', 'I\'m hungry~', 'お{腹|なか}すいた〜'],
      ['なに たべる？', 'nani taberu?', 'What shall we eat?', '{何|なに}{食|た}べる？'],
      ['うどん が たべたい な', 'udon ga tabetai na', 'I\'d love some udon…', 'うどんが{食|た}べたいな'],
      ['いい ね！ いこう！', 'ii ne! ikou!', 'Sounds good! Let\'s go!', 'いいね！{行|い}こう！'],
      ['おいしい ね！', 'oishii ne!', 'It\'s delicious, isn\'t it?', 'おいしいね！'],
      ['ごちそうさま！', 'gochisousama!', 'Thanks for the meal!', 'ごちそうさま！']] },
    { id: 'lights', icon: '✨', title: 'Christmas lights date', titleJa: 'イルミネーション デート', reg: 'casual', lines: [
      ['きょう は さむい ね', 'kyou wa samui ne', 'It\'s cold today, isn\'t it?', '{今日|きょう}は{寒|さむ}いね'],
      ['て つなご？', 'te tsunago?', 'Shall we hold hands?', '{手|て}つなご？'],
      ['わあ、 きれい だね！', 'waa, kirei da ne!', 'Wow, it\'s beautiful!', 'わあ、きれいだね！'],
      ['しゃしん とろう！', 'shashin torou!', 'Let\'s take a photo!', '{写真|しゃしん}{撮|と}ろう！'],
      ['きょう たのしかった ね', 'kyou tanoshikatta ne', 'Today was fun, wasn\'t it?', '{今日|きょう}{楽|たの}しかったね']] },
    { id: 'night', icon: '🌙', title: 'Good night LINE', titleJa: 'おやすみ の LINE', reg: 'casual', lines: [
      ['いま かえった よ', 'ima kaetta yo', 'I just got home.', '{今|いま}{帰|かえ}ったよ'],
      ['おかえり！ きょう も ありがとう', 'okaeri! kyou mo arigatou', 'Welcome home! Thanks for today, too.', 'おかえり！{今日|きょう}もありがとう'],
      ['あした も がんばって ね', 'ashita mo ganbatte ne', 'Good luck tomorrow, too.', '{明日|あした}も{頑張|がんば}ってね'],
      ['むり しないで ね', 'muri shinaide ne', 'Don\'t push yourself too hard.', '{無理|むり}しないでね'],
      ['おやすみ〜 また ね！', 'oyasumi~ mata ne!', 'Good night~ See you!', 'おやすみ〜またね！']] },
    { id: 'work', icon: '🏫', title: 'First day at work (polite)', titleJa: 'しょくば の あいさつ（ていねい）', reg: 'polite', lines: [
      ['おはよう ございます', 'ohayou gozaimasu', 'Good morning.', 'おはようございます'],
      ['はじめまして、 マル です', 'hajimemashite, maru desu', 'Nice to meet you. I\'m Maru.', 'はじめまして、マルです'],
      ['ドイツ から きました', 'doitsu kara kimashita', 'I\'m from Germany.', 'ドイツから{来|き}ました'],
      ['えいご の きょうし です', 'eigo no kyoushi desu', 'I\'m an English teacher.', '{英語|えいご}の{教師|きょうし}です'],
      ['よろしく おねがい します', 'yoroshiku onegai shimasu', 'I look forward to working with you.', 'よろしくお{願|ねが}いします'],
      ['おさきに しつれい します', 'osaki ni shitsurei shimasu', 'Excuse me for leaving first.', 'お{先|さき}に{失礼|しつれい}します']] },
    { id: 'cafe', icon: '☕', title: 'At a café (polite)', titleJa: 'カフェ で（ていねい）', reg: 'polite', lines: [
      ['すみません', 'sumimasen', 'Excuse me.', 'すみません'],
      ['おすすめ は なん です か？', 'osusume wa nan desu ka?', 'What do you recommend?', 'おすすめは{何|なん}ですか？'],
      ['じゃあ、 これ を ください', 'jaa, kore o kudasai', 'Then, this one, please.', 'じゃあ、これをください'],
      ['おみず を ください', 'omizu o kudasai', 'Water, please.', 'お{水|みず}をください'],
      ['おかいけい おねがい します', 'okaikei onegai shimasu', 'The bill, please.', 'お{会計|かいけい}お{願|ねが}いします'],
      ['ごちそうさま でした', 'gochisousama deshita', 'Thank you for the meal.', 'ごちそうさまでした']] }
  ];
  window.CJ_READ = { PASSAGES };
})();
