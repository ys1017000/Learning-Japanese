/* オフライン対応：一度開いたページ・ファイルを端末に保存して、電波がなくても使えるようにする
   v11：ネットにつながっているときは「いつも最新」を先に取りに行く（古い画面が出つづける問題の対策）。
        つながらない・遅い（3秒）ときだけ、保存しておいたものを使う */
const CACHE = 'maru-pace-v51';
const ASSETS = ['./', 'index.html', 'practice.html', 'cards.html', 'endings.html', 'grammar.html', 'guide.html', 'basics.html', 'basics-data.js', 'help.html', 'kanji.html', 'words.html', 'map.html',
  'read.html', 'quiz.html', 'ask.html', 'record.html', 'pattern.html', 'switch.html', 'settings.html', 'daily-data.js', 'pattern-data.js', 'pattern-run.js', 'i18n.js', 'data.js', 'grammar-data.js', 'read-data.js', 'examples-data.js', 'kanji-data.js', 'words-data.js', 'pref-data.js',
  'common.js', 'bank.js', 'hints-data.js', 'common.css', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'index.json'];

self.addEventListener('install', e => {
  // 1つでも取れないファイルがあっても止まらないように、1つずつ入れる
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(ASSETS.map(a => c.add(new Request(a, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const key = url.origin + url.pathname;          // ?mode= などのクエリは無視
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // 声のファイル（.wav）は変わらないので、保存してあればそれを使う
    if (url.pathname.endsWith('.wav')) {
      const hit = await cache.match(key);
      if (hit) return hit;
      const res = await fetch(req).catch(() => null);
      if (res && res.ok) cache.put(key, res.clone());
      return res || Response.error();
    }
    // それ以外：まずネット（3秒まで）→ だめなら保存しておいたもの
    const net = fetch(req, { cache: 'no-cache' }).then(res => { if (res && res.ok) cache.put(key, res.clone()); return res; }).catch(() => null);
    const timeout = new Promise(r => setTimeout(() => r(null), 3000));
    const res = await Promise.race([net, timeout]);
    if (res) return res;
    const hit = await cache.match(key);
    if (hit) return hit;
    const late = await net;
    if (late) return late;
    if (req.mode === 'navigate') { const home = await cache.match(new URL('index.html', self.registration.scope).href); if (home) return home; }
    return Response.error();
  })());
});
