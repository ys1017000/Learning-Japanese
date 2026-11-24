/* 🧱 きほん（つまずきやすい ところ）のデータ。説明 は 英語（マルちゃん 用）＋ ひらがな。
   例文 は [ひらがな, ローマ字, 英語, 漢字の書き方]。PARTICLE_Q と SOUNDS は クイズ（quiz.html）でも つかう */
(function () {
  const SECTIONS = [
    { id: 'particles', icon: '🧷', title: 'Particles: は が を に で と も', titleJa: 'じょし：は が を に で と も',
      intro: 'Particles are small words after a noun. They show its job in the sentence. Most learners mix up は/が and に/で — that\'s normal!',
      introJa: 'じょし は めいし の うしろ の ちいさい ことば。ぶん の なか の やくわり を あらわします。は／が、に／で は みんな まよう ので だいじょうぶ！',
      rows: [
        ['は (wa)', 'The topic: "As for ~". Use it for what you are talking about.', 'わたし は マル です', 'watashi wa maru desu', 'I am Maru.', 'わたしはマルです'],
        ['が', 'The subject — new info, or after question words (だれ が？). Also with すき／ほしい／わかる.', 'ねこ が すき', 'neko ga suki', 'I like cats.', '{猫|ねこ}が{好|す}き'],
        ['を (o)', 'The object: what you eat, see, do.', 'パスタ を たべる', 'pasuta o taberu', 'I eat pasta.', 'パスタを{食|た}べる'],
        ['に', 'A point: time (6じ に), place you go to / are at (いる・ある), person you meet or give to.', 'ろくじ に おきた', 'rokuji ni okita', 'I got up at six.', '{六時|ろくじ}に{起|お}きた'],
        ['で', 'Where an action happens, or "by / with" (train, phone).', 'カフェ で べんきょう する', 'kafe de benkyou suru', 'I study at a café.', 'カフェで{勉強|べんきょう}する'],
        ['と', '"and" (between nouns) or "with" someone.', 'ようちゃん と えいが を みた', 'youchan to eiga o mita', 'I watched a movie with Yoh-chan.', 'ようちゃんと{映画|えいが}を{見|み}た'],
        ['も', '"also / too". It replaces は, が, を.', 'わたし も いきたい', 'watashi mo ikitai', 'I want to go too.', 'わたしも{行|い}きたい']
      ],
      tips: [
        ['は vs が: は = "talking about…", が = "it is THIS one". Question words always take が: だれ が きた？ (Who came?). The answer too: ようちゃん が きた.', 'は ＝ 「〜について いうと」、が ＝ 「これ が」。だれ・なに など の あと は いつも が：「だれ が きた？」→「ようちゃん が きた」。'],
        ['に vs で: に = where something IS or GOES (えき に いる), で = where something HAPPENS (えき で まつ).', 'に ＝ ある・いる・いく ばしょ（えき に いる）、で ＝ なにか を する ばしょ（えき で まつ）。'],
        ['In casual talk, は and を are often dropped: パスタ たべる？ ／ これ なに？', 'ふつう の かいわ では、は と を は よく はぶきます：「パスタ たべる？」「これ なに？」']
      ] },
    { id: 'verbs', icon: '🔧', title: 'Verb types: る-verbs, う-verbs, する／くる', titleJa: 'どうし の しゅるい：る・う・する／くる',
      intro: 'Every verb belongs to one of three groups. The group tells you how to change it (polite, て, ない, past).',
      introJa: 'どうし は 3つ の グループ。グループ で かわりかた（ていねい・て・ない・かこ）が きまります。',
      table: { head: ['', 'dictionary', 'polite', 'て', 'ない', 'past'], rows: [
        ['る-verb', 'たべる', 'たべます', 'たべて', 'たべない', 'たべた'],
        ['る-verb', 'みる', 'みます', 'みて', 'みない', 'みた'],
        ['う-verb', 'のむ', 'のみます', 'のんで', 'のまない', 'のんだ'],
        ['う-verb', 'いく', 'いきます', 'いって ⚠️', 'いかない', 'いった'],
        ['う-verb', 'かう', 'かいます', 'かって', 'かわない ⚠️', 'かった'],
        ['う-verb', 'かえる', 'かえります', 'かえって', 'かえらない', 'かえった'],
        ['irregular', 'する', 'します', 'して', 'しない', 'した'],
        ['irregular', 'くる', 'きます', 'きて', 'こない', 'きた']
      ] },
      tips: [
        ['る-verbs: drop る and add the ending (たべる → たべ + ます / て / ない / た). Most end in -iru or -eru.', 'る どうし：る を とって つける（たべる → たべます／たべて／たべない／たべた）。'],
        ['う-verbs: the last sound changes (のむ → のみます, のんで). Some look like る-verbs but are う-verbs: かえる (go home), はいる, しる.', 'う どうし：さいご の おと が かわる（のむ → のみます、のんで）。かえる・はいる・しる は う どうし！'],
        ['Only 2 irregular verbs: する and くる. Many verbs are "noun + する": べんきょう する, りょうり する.', 'とくべつ な の は する と くる だけ。「めいし ＋ する」 が たくさん：べんきょう する、りょうり する。']
      ] },
    { id: 'shortcuts', icon: '💨', title: 'Casual shortcuts: てる・ちゃう・じゃん', titleJa: 'はなしことば の みじかい かたち',
      intro: 'In real conversation, Japanese people shorten words. Textbooks don\'t teach these much, but you hear them all the time.',
      introJa: 'ほんとう の かいわ では、ことば を みじかく します。きょうかしょ には あまり ない けど、いつも きこえます。',
      rows: [
        ['〜ている → 〜てる', 'is ~ing / has ~ed', 'いま なに してる？', 'ima nani shiteru?', 'What are you doing now?', '{今|いま}{何|なに}してる？'],
        ['〜てしまう → 〜ちゃう', 'end up ~ / completely (often regret)', 'ぜんぶ たべちゃった', 'zenbu tabechatta', 'I ate it all (oops).', '{全部|ぜんぶ}{食|た}べちゃった'],
        ['〜ではない → 〜じゃない', 'is not', 'それ、 わたし の じゃない', 'sore, watashi no janai', 'That\'s not mine.', 'それ、わたしのじゃない'],
        ['〜のだ → 〜んだ', 'explaining / feeling', 'あした やすみ なんだ', 'ashita yasumi nanda', 'I\'m off tomorrow, you know.', '{明日|あした}{休|やす}みなんだ'],
        ['〜という → 〜って', '"(someone) said / called"', 'あした あめ だって', 'ashita ame datte', 'They say it\'ll rain tomorrow.', '{明日|あした}{雨|あめ}だって'],
        ['〜ておく → 〜とく', 'do ~ in advance', 'よやく しとく ね', 'yoyaku shitoku ne', 'I\'ll make a reservation (beforehand).', '{予約|よやく}しとくね'],
        ['〜なければ → 〜なきゃ', 'have to', 'もう かえらなきゃ', 'mou kaeranakya', 'I have to go home now.', 'もう{帰|かえ}らなきゃ'],
        ['じゃん', '"isn\'t it? / you see!"', 'いい じゃん！', 'ii jan!', 'That\'s nice!', 'いいじゃん！']
      ] },
    { id: 'omit', icon: '🫥', title: 'Leaving words out', titleJa: 'いわなくて いい ことば',
      intro: 'Japanese often drops "I" and "you" when it\'s clear. Saying わたし は… every time sounds stiff. Let the situation do the work.',
      introJa: 'にほんご は、わかる とき は 「わたし」「あなた」 を いいません。まいかい 「わたし は…」 だと かたく きこえます。',
      rows: [
        ['(あなた は) もう たべた？', 'you → dropped', 'もう たべた？', 'mou tabeta?', 'Did (you) eat already?', 'もう{食|た}べた？'],
        ['(わたし は) つかれた', 'I → dropped', 'つかれた〜', 'tsukareta~', '(I\'m) tired~', '{疲|つか}れた〜'],
        ['(それ は) おいしい', 'it → dropped', 'おいしい！', 'oishii!', '(It\'s) delicious!', 'おいしい！'],
        ['あなた → name', 'あなた can sound cold. Use the person\'s name.', 'ようちゃん は なに に する？', 'youchan wa nani ni suru?', 'What will you (Yoh-chan) have?', 'ようちゃんは{何|なに}にする？']
      ] },
    { id: 'numbers', icon: '🔢', title: 'Numbers, counters, time & dates', titleJa: 'かず・かぞえかた・じかん・ひにち',
      intro: 'Japanese counts things with "counters". The most useful ones are below. ⚠️ = special reading.',
      introJa: 'にほんご は もの に よって かぞえかた が かわります。よく つかう もの だけ。⚠️ ＝ とくべつ な よみかた。',
      table: { head: ['', 'things', 'people', 'o\'clock', 'minutes', 'date'], rows: [
        ['1', 'ひとつ', 'ひとり ⚠️', 'いちじ', 'いっぷん', 'ついたち ⚠️'],
        ['2', 'ふたつ', 'ふたり ⚠️', 'にじ', 'にふん', 'ふつか ⚠️'],
        ['3', 'みっつ', 'さんにん', 'さんじ', 'さんぷん', 'みっか ⚠️'],
        ['4', 'よっつ', 'よにん ⚠️', 'よじ ⚠️', 'よんぷん', 'よっか ⚠️'],
        ['5', 'いつつ', 'ごにん', 'ごじ', 'ごふん', 'いつか ⚠️'],
        ['6', 'むっつ', 'ろくにん', 'ろくじ', 'ろっぷん', 'むいか ⚠️'],
        ['7', 'ななつ', 'ななにん', 'しちじ ⚠️', 'ななふん', 'なのか ⚠️'],
        ['8', 'やっつ', 'はちにん', 'はちじ', 'はっぷん', 'ようか ⚠️'],
        ['9', 'ここのつ', 'きゅうにん', 'くじ ⚠️', 'きゅうふん', 'ここのか ⚠️'],
        ['10', 'とお', 'じゅうにん', 'じゅうじ', 'じゅっぷん', 'とおか ⚠️']
      ] },
      rows: [
        ['〜つ (things)', 'Use for most things when ordering. After 10 just use numbers.', 'コーヒー ふたつ ください', 'koohii futatsu kudasai', 'Two coffees, please.', 'コーヒー{二|ふた}つください'],
        ['〜じ はん', 'half past', 'しちじ はん に あおう', 'shichiji han ni aou', 'Let\'s meet at 7:30.', '{七時半|しちじはん}に{会|あ}おう'],
        ['〜えん', 'yen. ⚠️ 4 = よえん', 'ぜんぶ で せんえん', 'zenbu de sen en', '1,000 yen in total.', '{全部|ぜんぶ}で{千円|せんえん}']
      ] },
    { id: 'sounds', icon: '👂', title: 'Small っ, long sounds, ん', titleJa: 'ちいさい っ・のばす おと・ん',
      intro: 'One small sound changes the meaning! っ = a tiny pause. Long sounds (おお, いい, ー) are held twice as long. Try the listening quiz.',
      introJa: 'ちいさい おと ひとつ で いみ が かわります！ っ ＝ ちいさく とまる。のばす おと（おお・いい・ー）は 2ばい ながく。きく クイズ で ためして みて ね。',
      pairsTitle: true }
  ];
  // 聞き分け の ペア：[[かな, 英語], [かな, 英語]]
  const SOUNDS = [
    [['きて', 'come (te-form)'], ['きって', 'stamp']],
    [['おばさん', 'aunt / middle-aged woman'], ['おばあさん', 'grandmother']],
    [['おじさん', 'uncle'], ['おじいさん', 'grandfather']],
    [['びょういん', 'hospital'], ['びよういん', 'hair salon']],
    [['しゅじん', 'husband'], ['しゅうじん', 'prisoner']],
    [['かこ', 'the past'], ['かっこ', 'brackets / cool']],
    [['いえ', 'house'], ['いいえ', 'no']],
    [['ここ', 'here'], ['こうこう', 'high school']],
    [['さか', 'slope'], ['さっか', 'writer']],
    [['ゆき', 'snow'], ['ゆうき', 'courage']],
    [['きた', 'came'], ['きいた', 'heard']],
    [['とり', 'bird'], ['とおり', 'street']],
    [['きねん', 'memorial'], ['きんえん', 'no smoking']]
  ];
  // 助詞 クイズ：[前, 正解, 後, 英語, まちがい の 選択肢, 理由(英), 漢字の書き方(前), 漢字(後)]
  const PARTICLE_Q = [
    ['わたし', 'は', 'マル です', 'I am Maru.', ['が', 'を', 'に'], 'は = topic ("as for me…")'],
    ['パスタ', 'を', 'たべる', 'I eat pasta.', ['が', 'に', 'で'], 'を = the thing you eat'],
    ['えき', 'で', 'まってる ね', 'I\'ll wait at the station.', ['に', 'を', 'は'], 'で = where you DO something (wait)'],
    ['いま えき', 'に', 'いる よ', 'I\'m at the station now.', ['で', 'を', 'が'], 'に = where you ARE (いる)'],
    ['カフェ', 'で', 'べんきょう する', 'I study at a café.', ['に', 'を', 'が'], 'で = where an action happens'],
    ['ようちゃん', 'と', 'えいが を みた', 'I watched a movie with Yoh-chan.', ['に', 'を', 'で'], 'と = with someone'],
    ['わたし', 'も', 'いきたい', 'I want to go too.', ['は', 'を', 'に'], 'も = too / also'],
    ['だれ', 'が', 'きた の？', 'Who came?', ['は', 'を', 'で'], 'Question words take が, never は'],
    ['ろくじ', 'に', 'おきた', 'I got up at six.', ['で', 'を', 'が'], 'に = a point in time'],
    ['ねこ', 'が', 'すき', 'I like cats.', ['を', 'に', 'で'], 'すき takes が (not を)'],
    ['でんしゃ', 'で', 'いく', 'I\'ll go by train.', ['に', 'を', 'が'], 'で = by / with (a tool or transport)'],
    ['ともだち', 'に', 'あう', 'I\'ll meet a friend.', ['を', 'で', 'が'], 'あう takes に (the person you meet)'],
    ['あめ', 'が', 'ふってる', 'It\'s raining.', ['を', 'に', 'で'], 'Weather and things you see happening: が'],
    ['てがみ', 'を', 'かいた', 'I wrote a letter.', ['が', 'に', 'で'], 'を = the thing you write'],
    ['うち', 'に', 'かえる', 'I\'m going home.', ['で', 'を', 'が'], 'に = where you go (へ is OK too)'],
    ['にほんご', 'が', 'わかる？', 'Do you understand Japanese?', ['を', 'に', 'で'], 'わかる takes が'],
    ['ようちゃん', 'に', 'プレゼント を あげた', 'I gave Yoh-chan a present.', ['を', 'で', 'と'], 'に = the person you give to'],
    ['スマホ', 'で', 'しゃしん を とった', 'I took a photo with my phone.', ['に', 'を', 'が'], 'で = with a tool']
  ];
  window.CJ_BASICS = { SECTIONS, SOUNDS, PARTICLE_Q };
})();
