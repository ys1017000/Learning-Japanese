/* マルちゃんのペースでいいよ - 声に出して読む（短い会話）
   v3：どの場面も「ふつう」と「ていねい」の両方を持つ。カードをタップすると切り替わる。
   lines: [英語, ふつう, ていねい]。ふつう／ていねい = [ひらがな（スペース区切り）, ローマ字, 漢字の書き方（{漢字|よみ}）]
   漢字の書き方は「漢字で見る」の表示と、音声認識の答え合わせ（漢字で聞き取られたとき用）の両方に使う。
   場面には、マルちゃんの好きなもの（抹茶・カフェ・パスタ・焼肉・ワイン・イルミネーション・自然・コケ・紅葉・キャンプ・ホラー映画・タロット）を入れている */
(function () {
  "use strict";
  const PASSAGES = [
    { id: 'meet', icon: '📍', title: 'Meeting up', titleJa: 'まちあわせ', lines: [
      ['Where are you now?', ['いま どこ？', 'ima doko?', '{今|いま}どこ？'], ['いま どこ です か？', 'ima doko desu ka?', '{今|いま}どこですか？']],
      ['I\'m almost there!', ['もう すぐ つく よ！', 'mou sugu tsuku yo!', 'もうすぐ{着|つ}くよ！'], ['もう すぐ つきます', 'mou sugu tsukimasu', 'もうすぐ{着|つ}きます']],
      ['I\'ll be at the north exit of the station.', ['えき の きたぐち に いる ね', 'eki no kitaguchi ni iru ne', '{駅|えき}の{北口|きたぐち}にいるね'], ['えき の きたぐち に います', 'eki no kitaguchi ni imasu', '{駅|えき}の{北口|きたぐち}にいます']],
      ['Sorry I\'m late!', ['おくれて ごめん！', 'okurete gomen!', '{遅|おく}れてごめん！'], ['おくれて すみません', 'okurete sumimasen', '{遅|おく}れてすみません']],
      ['Shall we go?', ['じゃあ、 いこう か', 'jaa, ikou ka', 'じゃあ、{行|い}こうか'], ['では、 いきましょう か', 'dewa, ikimashou ka', 'では、{行|い}きましょうか']]] },
    { id: 'cafe', icon: '🍵', title: 'Café & matcha', titleJa: 'カフェ と まっちゃ', lines: [
      ['I want to drink matcha.', ['まっちゃ のみたい な', 'maccha nomitai na', '{抹茶|まっちゃ}{飲|の}みたいな'], ['まっちゃ が のみたい です', 'maccha ga nomitai desu', '{抹茶|まっちゃ}が{飲|の}みたいです']],
      ['What do you recommend?', ['おすすめ は なに？', 'osusume wa nani?', 'おすすめは{何|なに}？'], ['おすすめ は なん です か？', 'osusume wa nan desu ka?', 'おすすめは{何|なん}ですか？']],
      ['I\'ll have a matcha latte and the cheesecake.', ['まっちゃ ラテ と チーズケーキ に する', 'maccha rate to chiizukeeki ni suru', '{抹茶|まっちゃ}ラテとチーズケーキにする'], ['まっちゃ ラテ と チーズケーキ を ください', 'maccha rate to chiizukeeki o kudasai', '{抹茶|まっちゃ}ラテとチーズケーキをください']],
      ['This cheesecake is so good!', ['この チーズケーキ、 すごく おいしい！', 'kono chiizukeeki, sugoku oishii!', 'このチーズケーキ、すごくおいしい！'], ['この チーズケーキ、 とても おいしい です', 'kono chiizukeeki, totemo oishii desu', 'このチーズケーキ、とてもおいしいです']],
      ['This café has a nice atmosphere.', ['この カフェ、 ふんいき いい ね', 'kono kafe, fun\'iki ii ne', 'このカフェ、ふんいきいいね'], ['この カフェ は ふんいき が いい です ね', 'kono kafe wa fun\'iki ga ii desu ne', 'このカフェはふんいきがいいですね']]] },
    { id: 'dinner', icon: '🍝', title: 'Dinner & drinks', titleJa: 'ばんごはん と おさけ', lines: [
      ['Italian or yakiniku — which do you want?', ['イタリアン と やきにく、 どっち が いい？', 'itarian to yakiniku, docchi ga ii?', 'イタリアンと{焼肉|やきにく}、どっちがいい？'], ['イタリアン と やきにく、 どちら が いい です か？', 'itarian to yakiniku, dochira ga ii desu ka?', 'イタリアンと{焼肉|やきにく}、どちらがいいですか？']],
      ['I feel like pasta today!', ['きょう は パスタ の きぶん！', 'kyou wa pasuta no kibun!', '{今日|きょう}はパスタの{気分|きぶん}！'], ['きょう は パスタ が たべたい です', 'kyou wa pasuta ga tabetai desu', '{今日|きょう}はパスタが{食|た}べたいです']],
      ['Let\'s share the pizza.', ['ピザ、 はんぶん こ しよう', 'piza, hanbun ko shiyou', 'ピザ、{半分|はんぶん}こしよう'], ['ピザ を はんぶん ずつ に しましょう', 'piza o hanbun zutsu ni shimashou', 'ピザを{半分|はんぶん}ずつにしましょう']],
      ['Red wine? Or beer?', ['あか ワイン？ それとも ビール？', 'aka wain? soretomo biiru?', '{赤|あか}ワイン？それともビール？'], ['あか ワイン に します か？ ビール に します か？', 'aka wain ni shimasu ka? biiru ni shimasu ka?', '{赤|あか}ワインにしますか？ビールにしますか？']],
      ['Cheers!', ['かんぱい！', 'kanpai!', 'かんぱい！'], ['かんぱい！', 'kanpai!', 'かんぱい！']],
      ['I\'m so full.', ['おなか いっぱい〜', 'onaka ippai~', 'お{腹|なか}いっぱい〜'], ['おなか が いっぱい です', 'onaka ga ippai desu', 'お{腹|なか}がいっぱいです']]] },
    { id: 'lights', icon: '✨', title: 'Illuminations', titleJa: 'イルミネーション', lines: [
      ['It\'s cold today, isn\'t it?', ['きょう は さむい ね', 'kyou wa samui ne', '{今日|きょう}は{寒|さむ}いね'], ['きょう は さむい です ね', 'kyou wa samui desu ne', '{今日|きょう}は{寒|さむ}いですね']],
      ['Shall we hold hands?', ['て つなご？', 'te tsunago?', '{手|て}つなご？'], ['て を つないでも いい です か？', 'te o tsunaide mo ii desu ka?', '{手|て}をつないでもいいですか？']],
      ['Wow, it\'s beautiful!', ['わあ、 きれい だね！', 'waa, kirei da ne!', 'わあ、きれいだね！'], ['わあ、 きれい です ね！', 'waa, kirei desu ne!', 'わあ、きれいですね！']],
      ['I like the pale blue lights best.', ['みずいろ の ライト が いちばん すき', 'mizuiro no raito ga ichiban suki', '{水色|みずいろ}のライトが{一番|いちばん}{好|す}き'], ['みずいろ の ライト が いちばん すき です', 'mizuiro no raito ga ichiban suki desu', '{水色|みずいろ}のライトが{一番|いちばん}{好|す}きです']],
      ['Let\'s take a photo!', ['しゃしん とろう！', 'shashin torou!', '{写真|しゃしん}{撮|と}ろう！'], ['しゃしん を とりましょう', 'shashin o torimashou', '{写真|しゃしん}を{撮|と}りましょう']],
      ['Next spring, I want to see the cherry blossom light-up too.', ['らいねん の はる は、 よざくら の ライトアップ も みたい な', 'rainen no haru wa, yozakura no raitoappu mo mitai na', '{来年|らいねん}の{春|はる}は、{夜桜|よざくら}のライトアップも{見|み}たいな'], ['らいねん の はる は、 よざくら の ライトアップ も みたい です', 'rainen no haru wa, yozakura no raitoappu mo mitai desu', '{来年|らいねん}の{春|はる}は、{夜桜|よざくら}のライトアップも{見|み}たいです']]] },
    { id: 'nature', icon: '⛰️', title: 'Hiking & nature', titleJa: 'ハイキング と しぜん', lines: [
      ['Want to go hiking this weekend?', ['こんど の しゅうまつ、 ハイキング いかない？', 'kondo no shuumatsu, haikingu ikanai?', '{今度|こんど}の{週末|しゅうまつ}、ハイキング{行|い}かない？'], ['こんど の しゅうまつ、 ハイキング に いきません か？', 'kondo no shuumatsu, haikingu ni ikimasen ka?', '{今度|こんど}の{週末|しゅうまつ}、ハイキングに{行|い}きませんか？']],
      ['The mountain air feels so good.', ['やま の くうき、 きもち いい ね', 'yama no kuuki, kimochi ii ne', '{山|やま}の{空気|くうき}、{気持|きも}ちいいね'], ['やま の くうき は きもち いい です ね', 'yama no kuuki wa kimochi ii desu ne', '{山|やま}の{空気|くうき}は{気持|きも}ちいいですね']],
      ['Look, there\'s moss here!', ['みて、 ここ に コケ が ある よ！', 'mite, koko ni koke ga aru yo!', '{見|み}て、ここにコケがあるよ！'], ['みて ください、 ここ に コケ が あります よ', 'mite kudasai, koko ni koke ga arimasu yo', '{見|み}てください、ここにコケがありますよ']],
      ['The river water is so clear.', ['かわ の みず、 すごく きれい', 'kawa no mizu, sugoku kirei', '{川|かわ}の{水|みず}、すごくきれい'], ['かわ の みず が とても きれい です', 'kawa no mizu ga totemo kirei desu', '{川|かわ}の{水|みず}がとてもきれいです']],
      ['The autumn leaves are bright red!', ['こうよう、 まっか だね', 'kouyou, makka da ne', '{紅葉|こうよう}、{真|ま}っ{赤|か}だね'], ['こうよう が まっか です ね', 'kouyou ga makka desu ne', '{紅葉|こうよう}が{真|ま}っ{赤|か}ですね']],
      ['Next time, let\'s go camping by the river.', ['こんど は かわ の ちかく で キャンプ しよう', 'kondo wa kawa no chikaku de kyanpu shiyou', '{今度|こんど}は{川|かわ}の{近|ちか}くでキャンプしよう'], ['こんど は かわ の ちかく で キャンプ を しましょう', 'kondo wa kawa no chikaku de kyanpu o shimashou', '{今度|こんど}は{川|かわ}の{近|ちか}くでキャンプをしましょう']]] },
    { id: 'movie', icon: '🔮', title: 'Horror movie & tarot night', titleJa: 'ホラー えいが と タロット', lines: [
      ['Let\'s watch a horror movie tonight!', ['こんや、 ホラー えいが みよう！', 'kon\'ya, horaa eiga miyou!', '{今夜|こんや}、ホラー{映画|えいが}{見|み}よう！'], ['こんや は ホラー えいが を みましょう', 'kon\'ya wa horaa eiga o mimashou', '{今夜|こんや}はホラー{映画|えいが}を{見|み}ましょう']],
      ['Are you scared?', ['こわい の？', 'kowai no?', '{怖|こわ}いの？'], ['こわい です か？', 'kowai desu ka?', '{怖|こわ}いですか？']],
      ['I\'m not scared at all!', ['ぜんぜん こわく ない よ！', 'zenzen kowaku nai yo!', 'ぜんぜん{怖|こわ}くないよ！'], ['ぜんぜん こわく ない です', 'zenzen kowaku nai desu', 'ぜんぜん{怖|こわ}くないです']],
      ['Shall I read your tarot?', ['タロット で うらなって あげよう か？', 'taroto de uranatte ageyou ka?', 'タロットで{占|うらな}ってあげようか？'], ['タロット で うらないましょう か？', 'taroto de uranaimashou ka?', 'タロットで{占|うらな}いましょうか？']],
      ['Pick one card.', ['カード を いちまい えらんで', 'kaado o ichimai erande', 'カードを{一枚|いちまい}{選|えら}んで'], ['カード を いちまい えらんで ください', 'kaado o ichimai erande kudasai', 'カードを{一枚|いちまい}{選|えら}んでください']],
      ['Wow, it\'s a good card!', ['わあ、 いい カード だよ！', 'waa, ii kaado da yo!', 'わあ、いいカードだよ！'], ['わあ、 いい カード です よ', 'waa, ii kaado desu yo', 'わあ、いいカードですよ']]] },
    { id: 'night', icon: '🌙', title: 'Good night LINE', titleJa: 'おやすみ の LINE', lines: [
      ['I just got home.', ['いま かえった よ', 'ima kaetta yo', '{今|いま}{帰|かえ}ったよ'], ['いま かえりました', 'ima kaerimashita', '{今|いま}{帰|かえ}りました']],
      ['Thank you for today.', ['きょう も ありがとう', 'kyou mo arigatou', '{今日|きょう}もありがとう'], ['きょう も ありがとう ございました', 'kyou mo arigatou gozaimashita', '{今日|きょう}もありがとうございました']],
      ['Good luck tomorrow, too.', ['あした も がんばって ね', 'ashita mo ganbatte ne', '{明日|あした}も{頑張|がんば}ってね'], ['あした も がんばって ください', 'ashita mo ganbatte kudasai', '{明日|あした}も{頑張|がんば}ってください']],
      ['Don\'t push yourself too hard.', ['むり しないで ね', 'muri shinaide ne', '{無理|むり}しないでね'], ['むり しないで ください ね', 'muri shinaide kudasai ne', '{無理|むり}しないでくださいね']],
      ['Good night~', ['おやすみ〜', 'oyasumi~', 'おやすみ〜'], ['おやすみ なさい', 'oyasumi nasai', 'おやすみなさい']]] },
    { id: 'intro', icon: '🤝', title: 'Introducing yourself', titleJa: 'じこしょうかい', lines: [
      ['Nice to meet you. I\'m Maru.', ['はじめまして！ マル だよ', 'hajimemashite! maru da yo', 'はじめまして！マルだよ'], ['はじめまして、 マル です', 'hajimemashite, maru desu', 'はじめまして、マルです']],
      ['I\'m from Germany.', ['ドイツ から きた よ', 'doitsu kara kita yo', 'ドイツから{来|き}たよ'], ['ドイツ から きました', 'doitsu kara kimashita', 'ドイツから{来|き}ました']],
      ['I want to be an English teacher in Japan.', ['にほん で えいご の せんせい に なりたい んだ', 'nihon de eigo no sensei ni naritai n da', '{日本|にほん}で{英語|えいご}の{先生|せんせい}になりたいんだ'], ['にほん で えいご の きょうし に なりたい です', 'nihon de eigo no kyoushi ni naritai desu', '{日本|にほん}で{英語|えいご}の{教師|きょうし}になりたいです']],
      ['I love nature and camping.', ['しぜん と キャンプ が だいすき', 'shizen to kyanpu ga daisuki', '{自然|しぜん}とキャンプが{大好|だいす}き'], ['しぜん と キャンプ が だいすき です', 'shizen to kyanpu ga daisuki desu', '{自然|しぜん}とキャンプが{大好|だいす}きです']],
      ['Nice to meet you! (Let\'s get along.)', ['よろしく ね！', 'yoroshiku ne!', 'よろしくね！'], ['よろしく おねがい します', 'yoroshiku onegai shimasu', 'よろしくお{願|ねが}いします']]] }
  ];
  window.CJ_READ = { PASSAGES };
})();
