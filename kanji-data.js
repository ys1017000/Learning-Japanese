/* Casual Japanese - 漢字データ（小学1年の80字 ＋ 2年から日常でよく使う字）
   1行 = [漢字, 学年, 意味(英), 音読み(ひらがな), 訓読み(ひらがな・()は送りがな), イメージ(英), コツ(英), 言葉]
   言葉の書き方：{漢字|よみ} がふりがな付き。例 {学|がっ}{校|こう}、まとめて読む言葉は {今日|きょう}
   言葉 = [ふりがな付きの書き方, ローマ字, 英語] */
(function () {
  "use strict";
  const RAW = [
    // ---- 1年生（80字）: 数 ----
    ['一', 1, 'one', 'いち・いつ', 'ひと(つ)', 'One line = one.', '', [['{一|ひと}つ', 'hitotsu', 'one (thing)'], ['{一人|ひとり}', 'hitori', 'one person / alone']]],
    ['二', 1, 'two', 'に', 'ふた(つ)', 'Two lines = two.', '', [['{二|ふた}つ', 'futatsu', 'two (things)'], ['{二人|ふたり}', 'futari', 'two people / the two of us']]],
    ['三', 1, 'three', 'さん', 'み・みっ(つ)', 'Three lines = three.', '', [['{三|みっ}つ', 'mittsu', 'three (things)'], ['{三|さん}{月|がつ}', 'sangatsu', 'March']]],
    ['四', 1, 'four', 'し', 'よ・よん・よっ(つ)', 'A room with four walls and something inside.', 'し sounds like "death" (死), so people usually say よん.', [['{四|よっ}つ', 'yottsu', 'four (things)'], ['{四|よ}{時|じ}', 'yoji', "four o'clock"]]],
    ['五', 1, 'five', 'ご', 'いつ(つ)', 'Like a 5 standing on a flat base.', '', [['{五|いつ}つ', 'itsutsu', 'five (things)'], ['{五|ご}{分|ふん}', 'gofun', 'five minutes']]],
    ['六', 1, 'six', 'ろく', 'む・むっ(つ)', 'A little house: a roof on top and two legs.', '', [['{六|むっ}つ', 'muttsu', 'six (things)'], ['{六|ろく}{時|じ}', 'rokuji', "six o'clock"]]],
    ['七', 1, 'seven', 'しち', 'なな', 'Looks like an upside-down 7.', 'しち sounds like いち (1), so people often say なな.', [['{七|なな}つ', 'nanatsu', 'seven (things)'], ['{七|しち}{時|じ}', 'shichiji', "seven o'clock"]]],
    ['八', 1, 'eight', 'はち', 'や・やっ(つ)', 'Two lines opening wide, like the bottom of an 8.', 'In Japan, 八 is a lucky number — it gets wider toward the bottom, like a future that opens up.', [['{八|やっ}つ', 'yattsu', 'eight (things)'], ['{八|はち}{月|がつ}', 'hachigatsu', 'August']]],
    ['九', 1, 'nine', 'きゅう・く', 'ここの(つ)', 'A person bending down — almost at ten.', "For the time, say く: 九時 = くじ (9 o'clock).", [['{九|ここの}つ', 'kokonotsu', 'nine (things)'], ['{九|く}{時|じ}', 'kuji', "nine o'clock"]]],
    ['十', 1, 'ten', 'じゅう', 'とお', 'A cross = ten. (A plus sign: 5 + 5!)', '', [['{十|とお}', 'too', 'ten (things)'], ['{十日|とおか}', 'tooka', 'the 10th day of the month']]],
    ['百', 1, 'hundred', 'ひゃく', '', 'One (一) on top of white (白) = one hundred.', 'The sound changes: 三百 さんびゃく, 六百 ろっぴゃく, 八百 はっぴゃく.', [['{百|ひゃく}{円|えん}', 'hyaku en', '100 yen'], ['{三|さん}{百|びゃく}', 'sanbyaku', 'three hundred']]],
    ['千', 1, 'thousand', 'せん', 'ち', 'Ten (十) with a small line on top — a much bigger number.', '三千 = さんぜん (not さんせん).', [['{千|せん}{円|えん}', 'sen en', '1,000 yen'], ['{三|さん}{千|ぜん}', 'sanzen', 'three thousand']]],
    ['円', 1, 'yen, circle', 'えん', 'まる(い)', 'A window or a wallet — think of a round yen coin.', 'You see 円 on every price tag: 500円.', [['{百|ひゃく}{円|えん}', 'hyaku en', '100 yen'], ['{千|せん}{円|えん}', 'sen en', '1,000 yen']]],
    // ---- 1年生: 時・自然 ----
    ['日', 1, 'sun, day', 'にち・じつ', 'ひ・か', 'The sun: a box with a line in the middle.', '日 has many readings. Learn it in words: 毎日 まいにち, 日本 にほん, 今日 きょう (special).', [['{毎|まい}{日|にち}', 'mainichi', 'every day'], ['{日|に}{本|ほん}', 'nihon', 'Japan']]],
    ['月', 1, 'moon, month', 'げつ・がつ', 'つき', 'A crescent moon with two little clouds.', 'Months: 一月 いちがつ… Monday is 月曜日 げつようび (moon day).', [['{月|つき}', 'tsuki', 'the moon'], ['{一|いち}{月|がつ}', 'ichigatsu', 'January']]],
    ['火', 1, 'fire', 'か', 'ひ', 'A fire with sparks flying out on both sides.', 'Tuesday = 火曜日 かようび (fire day).', [['{火|ひ}', 'hi', 'fire'], ['{花|はな}{火|び}', 'hanabi', 'fireworks']]],
    ['水', 1, 'water', 'すい', 'みず', 'A river in the middle with water splashing out.', 'Wednesday = 水曜日 すいようび. 氵 on the left of a kanji also means water.', [['{水|みず}', 'mizu', 'water'], ['お{水|みず}', 'omizu', 'water (polite, in restaurants)']]],
    ['木', 1, 'tree, wood', 'もく・ぼく', 'き', 'A tree: branches up, roots down.', 'Thursday = 木曜日 もくようび. Two trees = 林 (woods), three = 森 (forest)!', [['{木|き}', 'ki', 'tree'], ['{木|もく}{曜|よう}{日|び}', 'mokuyoubi', 'Thursday']]],
    ['金', 1, 'gold, money', 'きん', 'かね', 'Shiny gold nuggets under a roof.', 'Friday = 金曜日 きんようび. おかね = money.', [['お{金|かね}', 'okane', 'money'], ['{金|きん}{曜|よう}{日|び}', 'kin\'youbi', 'Friday']]],
    ['土', 1, 'soil, earth', 'ど・と', 'つち', 'A plant coming up out of the ground.', 'Saturday = 土曜日 どようび. Careful: 士 has a longer top line.', [['{土|つち}', 'tsuchi', 'soil'], ['{土|ど}{曜|よう}{日|び}', 'doyoubi', 'Saturday']]],
    ['年', 1, 'year', 'ねん', 'とし', 'A farmer carrying the rice harvest — once a year.', '', [['{今年|ことし}', 'kotoshi', 'this year'], ['{一|いち}{年|ねん}', 'ichinen', 'one year']]],
    ['夕', 1, 'evening', 'せき', 'ゆう', 'A half moon coming out at dusk.', '', [['{夕|ゆう}{方|がた}', 'yuugata', 'early evening'], ['{夕|ゆう}ごはん', 'yuugohan', 'dinner']]],
    ['早', 1, 'early, fast', 'そう', 'はや(い)', 'The sun (日) rising over a little sprout (十) — early morning.', 'おはよう comes from はやい — "it\'s early!"', [['{早|はや}い', 'hayai', 'early / fast'], ['{早|はや}く', 'hayaku', 'quickly / soon']]],
    ['天', 1, 'sky, heaven', 'てん', 'あま', 'A big person (大) with the sky (一) above their head.', '', [['{天|てん}{気|き}', 'tenki', 'weather'], ['{天|てん}ぷら', 'tenpura', 'tempura']]],
    ['空', 1, 'sky, empty', 'くう', 'そら・あ(く)', 'A hole in the roof — you can see the empty sky.', '', [['{空|そら}', 'sora', 'sky'], ['{空|くう}{港|こう}', 'kuukou', 'airport']]],
    ['雨', 1, 'rain', 'う', 'あめ', 'A window with raindrops (the four dots) falling.', '雨 on top of other kanji is about weather: 雪 snow, 電 electricity (lightning).', [['{雨|あめ}', 'ame', 'rain'], ['{大|おお}{雨|あめ}', 'ooame', 'heavy rain']]],
    ['気', 1, 'spirit, air, feeling', 'き・け', '', 'Steam rising — energy you can\'t see but can feel.', 'You already know it! げんき = 元気, てんき = 天気, きを つけて = 気をつけて.', [['{元|げん}{気|き}', 'genki', 'healthy / fine'], ['{天|てん}{気|き}', 'tenki', 'weather']]],
    ['山', 1, 'mountain', 'さん', 'やま', 'Three mountain peaks — the middle one is the tallest.', 'さん after a mountain name: 富士山 ふじさん.', [['{山|やま}', 'yama', 'mountain'], ['{富|ふ}{士|じ}{山|さん}', 'fujisan', 'Mt. Fuji']]],
    ['川', 1, 'river', 'せん', 'かわ', 'Three lines of water flowing down.', '', [['{川|かわ}', 'kawa', 'river'], ['{小|お}{川|がわ}', 'ogawa', 'stream']]],
    ['田', 1, 'rice field', 'でん', 'た', 'A rice field seen from above, cut into four parts.', 'Very common in family names: 田中 たなか, 山田 やまだ.', [['{田|た}んぼ', 'tanbo', 'rice field'], ['{田|た}{中|なか}', 'Tanaka', 'Tanaka (family name)']]],
    ['石', 1, 'stone', 'せき', 'いし', 'A rock (口) at the foot of a cliff.', '', [['{石|いし}', 'ishi', 'stone']]],
    ['花', 1, 'flower', 'か', 'はな', 'Grass (艹 on top) that changes into a flower.', '艹 on top = plants: 花, 草.', [['{花|はな}', 'hana', 'flower'], ['{花|はな}{火|び}', 'hanabi', 'fireworks ("fire flowers")']]],
    ['草', 1, 'grass', 'そう', 'くさ', 'Grass (艹) growing in the early (早) morning.', '', [['{草|くさ}', 'kusa', 'grass'], ['{草|くさ}{花|ばな}', 'kusabana', 'wild flowers']]],
    ['竹', 1, 'bamboo', 'ちく', 'たけ', 'Two bamboo stalks with leaves at the top.', '', [['{竹|たけ}', 'take', 'bamboo']]],
    ['林', 1, 'woods', 'りん', 'はやし', 'Two trees = a small woods.', '', [['{林|はやし}', 'hayashi', 'woods']]],
    ['森', 1, 'forest', 'しん', 'もり', 'Three trees = a big, deep forest.', '', [['{森|もり}', 'mori', 'forest'], ['{森|しん}{林|りん}', 'shinrin', 'forests']]],
    // ---- 1年生: 生き物・もの ----
    ['犬', 1, 'dog', 'けん', 'いぬ', 'Big (大) + a dot — the dog\'s ear!', 'Watch the dot: 大 big, 太 fat, 犬 dog.', [['{犬|いぬ}', 'inu', 'dog'], ['{子|こ}{犬|いぬ}', 'koinu', 'puppy']]],
    ['虫', 1, 'bug, insect', 'ちゅう', 'むし', 'A bug with a big head, a body and a little tail.', '', [['{虫|むし}', 'mushi', 'bug']]],
    ['貝', 1, 'shellfish', '', 'かい', 'An open shell with two little feet.', 'Long ago shells were money, so 貝 inside a kanji is often about money.', [['{貝|かい}', 'kai', 'shellfish / seashell']]],
    ['玉', 1, 'ball, jewel', 'ぎょく', 'たま', 'A king (王) with a jewel (the dot).', '', [['{玉|たま}ねぎ', 'tamanegi', 'onion'], ['お{年|とし}{玉|だま}', 'otoshidama', 'New Year money for kids']]],
    ['王', 1, 'king', 'おう', '', 'Three lines (sky, people, earth) joined by one line — the king connects them.', '', [['{王|おう}{様|さま}', 'ousama', 'king']]],
    ['糸', 1, 'thread', 'し', 'いと', 'A twisted thread hanging down.', '', [['{糸|いと}', 'ito', 'thread']]],
    ['車', 1, 'car, vehicle', 'しゃ', 'くるま', 'An old cart seen from above: the box and the wheel axle.', '', [['{車|くるま}', 'kuruma', 'car'], ['{電|でん}{車|しゃ}', 'densha', 'train']]],
    ['本', 1, 'book, origin', 'ほん', 'もと', 'A tree (木) with a mark at the root — the origin.', '日本 = "origin of the sun" = Japan!', [['{本|ほん}', 'hon', 'book'], ['{日|に}{本|ほん}', 'nihon', 'Japan']]],
    ['音', 1, 'sound', 'おん', 'おと・ね', 'Someone standing (立) and saying something (日).', '', [['{音|おと}', 'oto', 'sound'], ['{音|おん}{楽|がく}', 'ongaku', 'music']]],
    ['文', 1, 'writing, sentence', 'ぶん・もん', 'ふみ', 'A person with a pattern drawn on their chest.', '', [['{文|ぶん}', 'bun', 'sentence'], ['{文|も}{字|じ}', 'moji', 'letters, characters']]],
    ['字', 1, 'character, letter', 'じ', 'あざ', 'A child (子) under a roof, learning letters.', '', [['{漢|かん}{字|じ}', 'kanji', 'kanji'], ['{文|も}{字|じ}', 'moji', 'letters']]],
    ['学', 1, 'study, learning', 'がく', 'まな(ぶ)', 'A child (子) under a roof, with knowledge shining on top.', 'がく + こう = がっこう (the sound gets small っ).', [['{学|がっ}{校|こう}', 'gakkou', 'school'], ['{大|だい}{学|がく}', 'daigaku', 'university']]],
    ['校', 1, 'school', 'こう', '', 'A tree (木) next to people meeting (交) — a wooden school.', '', [['{学|がっ}{校|こう}', 'gakkou', 'school'], ['{高|こう}{校|こう}', 'koukou', 'high school']]],
    ['先', 1, 'ahead, before', 'せん', 'さき', 'Feet walking ahead of everyone.', '先生 = "born before" = teacher.', [['{先|せん}{生|せい}', 'sensei', 'teacher'], ['{先|せん}{週|しゅう}', 'senshuu', 'last week']]],
    ['生', 1, 'life, be born, raw', 'せい・しょう', 'い(きる)・う(まれる)・なま', 'A plant growing out of the ground — life!', '生 has MANY readings. Learn it in words.', [['{学|がく}{生|せい}', 'gakusei', 'student'], ['{誕|たん}{生|じょう}{日|び}', 'tanjoubi', 'birthday']]],
    ['正', 1, 'correct', 'せい・しょう', 'ただ(しい)', 'Stop (止) at the line — exactly the right place.', '', [['{正|ただ}しい', 'tadashii', 'correct'], ['お{正|しょう}{月|がつ}', 'oshougatsu', 'New Year']]],
    // ---- 1年生: 人・体 ----
    ['人', 1, 'person', 'じん・にん', 'ひと', 'A person walking — two legs.', 'Nationality = じん: ドイツ人. Counting people = にん: 三人 さんにん (but 一人 ひとり, 二人 ふたり).', [['ドイツ{人|じん}', 'doitsujin', 'German (person)'], ['{三|さん}{人|にん}', 'sannin', 'three people']]],
    ['女', 1, 'woman', 'じょ', 'おんな', 'A woman sitting gracefully with crossed legs.', 'On toilet doors: 女 = women, 男 = men. Very useful!', [['{女|おんな}の{人|ひと}', 'onna no hito', 'woman'], ['{女|おんな}の{子|こ}', 'onna no ko', 'girl']]],
    ['男', 1, 'man', 'だん', 'おとこ', 'Rice field (田) + power (力) — working hard in the field.', '', [['{男|おとこ}の{人|ひと}', 'otoko no hito', 'man'], ['{男|だん}{子|し}', 'danshi', 'boys, men']]],
    ['子', 1, 'child', 'し', 'こ', 'A baby wrapped up, with its arms open.', '', [['{子|こ}ども', 'kodomo', 'child'], ['{女|おんな}の{子|こ}', 'onna no ko', 'girl']]],
    ['目', 1, 'eye', 'もく', 'め', 'An eye turned on its side.', '', [['{目|め}', 'me', 'eye'], ['{一|ひと}つ{目|め}', 'hitotsume', 'the first one']]],
    ['耳', 1, 'ear', 'じ', 'みみ', 'Looks like an ear.', '', [['{耳|みみ}', 'mimi', 'ear']]],
    ['口', 1, 'mouth, opening', 'こう', 'くち', 'An open mouth.', 'At every station: 出口 でぐち = exit, 入口 いりぐち = entrance.', [['{出|で}{口|ぐち}', 'deguchi', 'exit'], ['{入|いり}{口|ぐち}', 'iriguchi', 'entrance']]],
    ['手', 1, 'hand', 'しゅ', 'て', 'A hand with fingers spread out.', 'て つなご？ = 手つなご？', [['{手|て}', 'te', 'hand'], ['{上手|じょうず}', 'jouzu', 'good at (something)']]],
    ['足', 1, 'foot, leg; enough', 'そく', 'あし・た(りる)', 'A knee (口) on top of a foot.', '', [['{足|あし}', 'ashi', 'foot / leg'], ['{一|いっ}{足|そく}', 'issoku', 'one pair (of shoes)']]],
    ['力', 1, 'power', 'りょく・りき', 'ちから', 'A strong arm flexing.', 'Looks just like katakana カ!', [['{力|ちから}', 'chikara', 'power, strength']]],
    ['見', 1, 'see, look', 'けん', 'み(る)', 'An eye (目) on legs — walking around looking.', '', [['{見|み}る', 'miru', 'to see'], ['{見|み}て！', 'mite!', 'Look!']]],
    ['休', 1, 'rest', 'きゅう', 'やす(む)', 'A person (亻) resting against a tree (木).', '亻 on the left = person.', [['{休|やす}み', 'yasumi', 'day off, break'], ['{休|やす}む', 'yasumu', 'to rest']]],
    ['立', 1, 'stand', 'りつ', 'た(つ)', 'A person standing on the ground.', '', [['{立|た}つ', 'tatsu', 'to stand']]],
    ['名', 1, 'name', 'めい・みょう', 'な', 'Evening (夕) + mouth (口): in the dark you must say your name.', '', [['{名|な}{前|まえ}', 'namae', 'name'], ['{有|ゆう}{名|めい}', 'yuumei', 'famous']]],
    // ---- 1年生: 位置・大きさ・色 ----
    ['大', 1, 'big', 'だい・たい', 'おお(きい)', 'A person stretching their arms out wide.', '', [['{大|おお}きい', 'ookii', 'big'], ['{大|だい}{丈|じょう}{夫|ぶ}', 'daijoubu', 'OK, all right']]],
    ['小', 1, 'small', 'しょう', 'ちい(さい)・こ・お', 'Something small broken into little pieces.', '', [['{小|ちい}さい', 'chiisai', 'small'], ['{小|しょう}{学|がっ}{校|こう}', 'shougakkou', 'elementary school']]],
    ['中', 1, 'middle, inside', 'ちゅう', 'なか', 'A line going through the middle of a box.', '', [['{中|なか}', 'naka', 'inside'], ['{中|ちゅう}{国|ごく}', 'chuugoku', 'China']]],
    ['上', 1, 'up, above', 'じょう', 'うえ・あ(がる)', 'A line pointing up from the ground.', '', [['{上|うえ}', 'ue', 'up, above'], ['{上手|じょうず}', 'jouzu', 'good at']]],
    ['下', 1, 'down, below', 'か・げ', 'した・さ(がる)・くだ(さい)', 'A line pointing down from the ceiling.', 'ください is sometimes written 下さい.', [['{下|した}', 'shita', 'down, below'], ['{地|ち}{下|か}{鉄|てつ}', 'chikatetsu', 'subway']]],
    ['右', 1, 'right', 'う・ゆう', 'みぎ', 'A hand + a mouth (口): the hand you eat with.', '右 and 左 look alike! 右 has 口 (mouth – eat), 左 has 工 (work).', [['{右|みぎ}', 'migi', 'right']]],
    ['左', 1, 'left', 'さ', 'ひだり', 'A hand + a tool (工): the hand that helps with work.', '', [['{左|ひだり}', 'hidari', 'left']]],
    ['入', 1, 'enter', 'にゅう', 'はい(る)・い(る)', 'A person stepping into a door.', 'Don\'t mix it up with 人 (person)! In 入, the left line is on top.', [['{入|はい}る', 'hairu', 'to enter'], ['{入|いり}{口|ぐち}', 'iriguchi', 'entrance']]],
    ['出', 1, 'go out, exit', 'しゅつ', 'で(る)・だ(す)', 'Two mountains stacked — going out over the hills.', '', [['{出|で}る', 'deru', 'to go out'], ['{出|で}{口|ぐち}', 'deguchi', 'exit']]],
    ['村', 1, 'village', 'そん', 'むら', 'Trees (木) and a hand (寸) — a small village in the woods.', '', [['{村|むら}', 'mura', 'village']]],
    ['町', 1, 'town', 'ちょう', 'まち', 'Rice fields (田) next to a road (丁) — a town.', '', [['{町|まち}', 'machi', 'town']]],
    ['青', 1, 'blue (green)', 'せい', 'あお(い)', 'A young plant over the moon — a fresh blue-green color.', 'In Japan, the green traffic light is called あお (blue)!', [['{青|あお}い', 'aoi', 'blue'], ['{青|あお}{信|しん}{号|ごう}', 'aoshingou', 'green traffic light']]],
    ['赤', 1, 'red', 'せき', 'あか(い)', 'Earth (土) with fire under it — glowing red.', '', [['{赤|あか}い', 'akai', 'red'], ['{赤|あか}ちゃん', 'akachan', 'baby']]],
    ['白', 1, 'white', 'はく', 'しろ(い)', 'The sun (日) with one ray of light — bright white.', '', [['{白|しろ}い', 'shiroi', 'white']]],

    // ---- 2年生（日常でよく見る字）: 時間 ----
    ['今', 2, 'now', 'こん', 'いま', 'A roof over one single moment — right now.', 'Special words: 今日 きょう (today), 今年 ことし (this year).', [['{今|いま}', 'ima', 'now'], ['{今日|きょう}', 'kyou', 'today']]],
    ['何', 2, 'what', 'か', 'なに・なん', 'A person (亻) holding a box: "What is this?"', 'なに or なん? Before t, d, n sounds and counters → なん: 何時 なんじ.', [['{何|なに}', 'nani', 'what'], ['{何|なん}{時|じ}', 'nanji', 'what time']]],
    ['時', 2, 'time, hour', 'じ', 'とき', 'Sun (日) + temple (寺): the temple bell tells the time.', '', [['{時|じ}{間|かん}', 'jikan', 'time'], ['{三|さん}{時|じ}', 'sanji', "three o'clock"]]],
    ['分', 2, 'minute; divide; understand', 'ぶん・ふん・ぷん', 'わ(かる)', 'A knife (刀) cutting something in two.', 'わかる is 分かる! Minutes change sound: 一分 いっぷん, 三分 さんぷん, 五分 ごふん.', [['{分|わ}かる', 'wakaru', 'to understand'], ['{五|ご}{分|ふん}', 'gofun', 'five minutes']]],
    ['半', 2, 'half', 'はん', 'なか(ば)', 'A line cutting something exactly in half.', '', [['{三|さん}{時|じ}{半|はん}', 'sanji han', 'three thirty'], ['{半|はん}{分|ぶん}', 'hanbun', 'half']]],
    ['週', 2, 'week', 'しゅう', '', 'A road (⻌) going around — the week goes round and round.', '⻌ at the bottom-left = moving, roads.', [['{今|こん}{週|しゅう}', 'konshuu', 'this week'], ['{来|らい}{週|しゅう}', 'raishuu', 'next week']]],
    ['毎', 2, 'every', 'まい', '', 'A mother doing the same thing every single day.', '', [['{毎|まい}{日|にち}', 'mainichi', 'every day'], ['{毎|まい}{週|しゅう}', 'maishuu', 'every week']]],
    ['朝', 2, 'morning', 'ちょう', 'あさ', 'The sun rising between grass, while the moon (月) is still in the sky.', '', [['{朝|あさ}', 'asa', 'morning'], ['{朝|あさ}ごはん', 'asagohan', 'breakfast']]],
    ['昼', 2, 'noon, daytime', 'ちゅう', 'ひる', 'The sun (日) high above the ground.', '', [['{昼|ひる}', 'hiru', 'noon'], ['{昼|ひる}ごはん', 'hirugohan', 'lunch']]],
    ['夜', 2, 'night', 'や', 'よる', 'A person under a roof, with the moon outside.', '', [['{夜|よる}', 'yoru', 'night'], ['{今|こん}{夜|や}', 'kon\'ya', 'tonight']]],
    ['午', 2, 'noon', 'ご', '', 'Like a clock hand pointing straight up at 12.', '午前 ごぜん = a.m. (before noon), 午後 ごご = p.m. (after noon).', [['{午|ご}{前|ぜん}', 'gozen', 'a.m.'], ['{午|ご}{後|ご}', 'gogo', 'p.m.']]],
    ['前', 2, 'before, front', 'ぜん', 'まえ', 'A boat with its nose pointing forward.', '', [['{前|まえ}', 'mae', 'front, before'], ['{名|な}{前|まえ}', 'namae', 'name']]],
    ['後', 2, 'after, behind', 'ご・こう', 'あと・うし(ろ)', 'A person walking slowly at the back.', '', [['{後|あと}で', 'ato de', 'later'], ['{午|ご}{後|ご}', 'gogo', 'p.m.']]],
    // ---- 2年生: 方角・場所 ----
    ['東', 2, 'east', 'とう', 'ひがし', 'The sun (日) rising behind a tree (木) — in the east.', '', [['{東|とう}{京|きょう}', 'toukyou', 'Tokyo ("east capital")'], ['{東|ひがし}{口|ぐち}', 'higashiguchi', 'east exit']]],
    ['西', 2, 'west', 'せい・さい', 'にし', 'A bird going back to its nest at sunset (in the west).', '', [['{西|にし}', 'nishi', 'west'], ['{関|かん}{西|さい}', 'kansai', 'Kansai (Osaka, Kyoto area)']]],
    ['南', 2, 'south', 'なん', 'みなみ', 'A warm tent in the sunny south.', '', [['{南|みなみ}', 'minami', 'south'], ['{南|みなみ}{口|ぐち}', 'minamiguchi', 'south exit']]],
    ['北', 2, 'north', 'ほく', 'きた', 'Two people sitting back to back, hiding from the cold north wind.', 'At big stations, look for 北口 (north exit), 南口, 東口, 西口.', [['{北|きた}', 'kita', 'north'], ['{北|きた}{口|ぐち}', 'kitaguchi', 'north exit']]],
    ['京', 2, 'capital', 'きょう・けい', '', 'A tall building on a hill — the capital city.', '', [['{東|とう}{京|きょう}', 'toukyou', 'Tokyo'], ['{京|きょう}{都|と}', 'kyouto', 'Kyoto']]],
    ['店', 2, 'shop', 'てん', 'みせ', 'A roof (广) over a little stand — a shop.', '', [['お{店|みせ}', 'omise', 'shop, restaurant'], ['{店|てん}{員|いん}', 'ten\'in', 'shop staff']]],
    ['家', 2, 'house, family', 'か・け', 'いえ・うち', 'A roof (宀) over a pig — a farmhouse long ago.', '宀 on top = roof, house.', [['{家|いえ}', 'ie', 'house, home'], ['{家|か}{族|ぞく}', 'kazoku', 'family']]],
    ['道', 2, 'road, way', 'どう', 'みち', 'A head (首) walking along a road (⻌).', '', [['{道|みち}', 'michi', 'road, way'], ['{北|ほっ}{海|かい}{道|どう}', 'hokkaidou', 'Hokkaido']]],
    ['外', 2, 'outside', 'がい・げ', 'そと', 'Evening (夕) + a fortune-teller outside.', '', [['{外|そと}', 'soto', 'outside'], ['{外|がい}{国|こく}', 'gaikoku', 'foreign country']]],
    ['近', 2, 'near', 'きん', 'ちか(い)', 'A short road (⻌) — it\'s close!', '', [['{近|ちか}い', 'chikai', 'near'], ['{近|ちか}く', 'chikaku', 'nearby']]],
    // ---- 2年生: 動き ----
    ['行', 2, 'go', 'こう・ぎょう', 'い(く)・おこな(う)', 'A crossroads seen from above.', 'いく = 行く! You saw いく？ in the cards.', [['{行|い}く', 'iku', 'to go'], ['{銀|ぎん}{行|こう}', 'ginkou', 'bank']]],
    ['来', 2, 'come', 'らい', 'く(る)・き(ます)', 'Wheat coming toward you in the wind.', '来週 らいしゅう = next week, 来年 らいねん = next year.', [['{来|く}る', 'kuru', 'to come'], ['{来|らい}{週|しゅう}', 'raishuu', 'next week']]],
    ['帰', 2, 'return home', 'き', 'かえ(る)', 'Coming back home and picking up a broom.', 'かえった よ = 帰ったよ!', [['{帰|かえ}る', 'kaeru', 'to go home'], ['{帰|かえ}った', 'kaetta', 'went home']]],
    ['食', 2, 'eat, food', 'しょく', 'た(べる)', 'A roof over a good bowl of food.', '', [['{食|た}べる', 'taberu', 'to eat'], ['{食|た}べ{物|もの}', 'tabemono', 'food']]],
    ['会', 2, 'meet', 'かい・え', 'あ(う)', 'People gathering under one roof.', 'あいたい = 会いたい!', [['{会|あ}う', 'au', 'to meet'], ['{会|あ}いたい', 'aitai', 'I want to see you']]],
    ['言', 2, 'say, word', 'げん・ごん', 'い(う)・こと', 'Words coming out of a mouth (口).', '言 on the left of a kanji = about words: 話, 読, 語.', [['{言|い}う', 'iu', 'to say']]],
    ['話', 2, 'talk, story', 'わ', 'はな(す)・はなし', 'Words (言) + tongue (舌).', '', [['{話|はな}す', 'hanasu', 'to talk'], ['{電|でん}{話|わ}', 'denwa', 'phone call']]],
    ['読', 2, 'read', 'どく', 'よ(む)', 'Words (言) + selling (売): reading out loud like a market seller.', '', [['{読|よ}む', 'yomu', 'to read']]],
    ['書', 2, 'write', 'しょ', 'か(く)', 'A hand holding a brush over paper.', '', [['{書|か}く', 'kaku', 'to write']]],
    ['聞', 2, 'hear, ask', 'ぶん', 'き(く)', 'An ear (耳) at the gate (門) — listening.', '', [['{聞|き}く', 'kiku', 'to listen, to ask']]],
    // ---- 2年生: その他 ----
    ['電', 2, 'electricity', 'でん', '', 'Rain (雨) + lightning coming down.', '', [['{電|でん}{車|しゃ}', 'densha', 'train'], ['{電|でん}{話|わ}', 'denwa', 'phone']]],
    ['新', 2, 'new', 'しん', 'あたら(しい)', 'Cutting fresh, new wood with an axe (斤).', '', [['{新|あたら}しい', 'atarashii', 'new'], ['{新|しん}{宿|じゅく}', 'shinjuku', 'Shinjuku']]],
    ['楽', 2, 'fun, music, easy', 'がく・らく', 'たの(しい)', 'A tree with drums on it — music is fun!', 'たのしかった = 楽しかった!', [['{楽|たの}しい', 'tanoshii', 'fun'], ['{音|おん}{楽|がく}', 'ongaku', 'music']]],
    ['友', 2, 'friend', 'ゆう', 'とも', 'Two hands helping each other.', '', [['{友|とも}だち', 'tomodachi', 'friend']]],
    ['明', 2, 'bright', 'めい・みょう', 'あか(るい)・あ(した)', 'Sun (日) + moon (月) = super bright.', 'Special word: 明日 = あした (tomorrow).', [['{明|あか}るい', 'akarui', 'bright'], ['{明日|あした}', 'ashita', 'tomorrow']]],
    ['晴', 2, 'clear weather', 'せい', 'は(れる)', 'Sun (日) + blue (青) sky = sunny.', 'あした はれる かな？ = 明日晴れるかな？', [['{晴|は}れ', 'hare', 'sunny'], ['{晴|は}れる', 'hareru', 'to clear up']]],
    ['雪', 2, 'snow', 'せつ', 'ゆき', 'Rain (雨) that you can sweep up with a broom.', '', [['{雪|ゆき}', 'yuki', 'snow']]]
  ];

  const KANJI = RAW.map(r => ({ k: r[0], g: r[1], m: r[2], on: r[3], kun: r[4], img: r[5], tip: r[6], words: r[7] }));

  /* 漢字を読むときのコツ */
  const KANJI_TIPS = [
    { en: '<b>Two kinds of readings.</b> Most kanji have a Japanese-style reading (<i>kun</i>) and a Chinese-style reading (<i>on</i>). Alone or with hiragana after it → usually <i>kun</i>: 山 やま. In a kanji + kanji word → usually <i>on</i>: 富士山 ふじさん.',
      ja: '<b>よみかた は 2しゅるい。</b> おおく の かんじ に は 「くんよみ」（にほん の よみかた） と 「おんよみ」（ちゅうごく から きた よみかた） が あります。かんじ ひとつ や、うしろ に ひらがな が ある とき → たいてい くんよみ。かんじ が ならぶ ことば → たいてい おんよみ。' },
    { en: '<b>Hiragana after a kanji helps you.</b> 楽しい → たの + しい. The hiragana (<i>okurigana</i>) tells you it\'s a kun reading and which word it is.',
      ja: '<b>かんじ の うしろ の ひらがな が ヒント。</b> 楽しい → たの ＋ しい。うしろ の ひらがな（おくりがな） で、くんよみ だ と わかります。' },
    { en: '<b>Look for parts you know.</b> 亻 person, 氵 water, 木 tree, 日 sun, 口 mouth, 言 words, 艹 plants, ⻌ road / moving, 宀 roof. Like German compound words (Hand + Schuh), kanji are built from smaller pieces!',
      ja: '<b>しって いる パーツ を さがそう。</b> 亻 ひと、氵 みず、木 き、日 ひ、口 くち、言 ことば、艹 くさ、⻌ みち、宀 やね。ドイツご の ふくごうご（Hand ＋ Schuh） の ように、かんじ も ちいさい パーツ で できて います！' },
    { en: '<b>Sounds change in words.</b> さん + ひゃく → さんびゃく, いち + ふん → いっぷん, がく + こう → がっこう. Don\'t worry — your ear will learn it.',
      ja: '<b>ことば の なか で おと が かわる。</b> さん ＋ ひゃく → さんびゃく、いち ＋ ふん → いっぷん、がく ＋ こう → がっこう。みみ で だんだん なれます。' },
    { en: '<b>Some words are special.</b> 今日 きょう, 明日 あした, 一人 ひとり, 上手 じょうず. Just remember these as one whole word.',
      ja: '<b>とくべつ な よみかた の ことば も ある。</b> 今日 きょう、明日 あした、一人 ひとり、上手 じょうず。ことば ぜんたい で おぼえよう。' },
    { en: '<b>You don\'t need to read everything.</b> On signs, find the kanji you know (出口, 北, 円…) and guess the rest from the picture and context.',
      ja: '<b>ぜんぶ よめなくて だいじょうぶ。</b> かんばん では、しって いる かんじ（出口、北、円…） を みつけて、のこり は ばめん から そうぞう しよう。' }
  ];

  /* {漢字|よみ} の書き方を変換するヘルパー */
  function rubyHtml(s, esc) {
    return String(s).split(/(\{[^|}]+\|[^}]+\})/).map(part => {
      const m = /^\{([^|}]+)\|([^}]+)\}$/.exec(part);
      return m ? '<ruby>' + esc(m[1]) + '<rt>' + esc(m[2]) + '</rt></ruby>' : esc(part);
    }).join('');
  }
  function reading(s) { return String(s).replace(/\{([^|}]+)\|([^}]+)\}/g, '$2'); }
  function plain(s) { return String(s).replace(/\{([^|}]+)\|([^}]+)\}/g, '$1'); }

  window.CJ_KANJI = { KANJI, KANJI_TIPS, rubyHtml, reading, plain };
})();
