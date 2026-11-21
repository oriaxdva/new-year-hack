/* ============ HACKER UNION server v5.2 (без зависимостей) ============ */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC = path.join(__dirname, 'public');

/* ---------- Состояние ---------- */
const sessions = new Set();   // сессии после входа
const adminCookie = 'HU_ADMIN_2027_TOK';
const admins = new Set();     // cookie админа

const FLAGS = [
  { id: 't1', title: 'Подсказка в шапке', flag: 'FLAG{HTML_C0MMENT_2027}' },
  { id: 't2', title: 'Секретная админка', flag: 'FLAG{ADMIN_PANEL_H4CKED}' },
  { id: 't3', title: 'Чужие заметки', flag: 'FLAG{IDOR_N0TES_2027}' },
  { id: 't4', title: 'Обращение президента', flag: 'FLAG{2027_HAPPY_HACKERS}' }
];

// t5 — консольный флаг FLAG{C0NS0L3_2027} печатает app.js (серверу не нужен)

const wallPosts = [
  { author: 'admin', text: 'Операция МАНДАРИН & КО официально закрыта. С Новым годом!' },
  { author: 'agent_k', text: 'Кто-нибудь уже нашёл секрет в консоли?' },
  { author: 'mandarin', text: 'Мандарины на столе. Флаги в системе.' }
];

const adminNotes = [
  { id: 1, author: 'admin', text: 'Внутренняя заметка: доступ в панель подтверждён. Токен сессии — FLAG{ADMIN_PANEL_H4CKED}.' },
  { id: 2, author: 'agent_k', text: 'Заметка К: кто-то слил заметки через подмену id. Уязвимость IDOR — FLAG{IDOR_N0TES_2027}. Починим в 2027-м.' }
];

/* ---------- Утилиты ---------- */
function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', ...SECURITY_HEADERS });
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  return new Promise(resolve => {
    let data = '';
    req.on('data', c => { data += c; if (data.length > 10000) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); } });
  });
}
function cookie(req, name) {
  const h = req.headers.cookie || '';
  const m = h.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return m ? m[1] : '';
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; media-src 'self'; img-src 'self' data:; frame-src https://www.youtube.com"
};

/* ---------- API ---------- */
async function handleApi(req, res, urlPath) {
  const body = await readBody(req);
  const sess = req.headers['x-session'] || '';
  const isAdmin = cookie(req, 'admin_tok') === adminCookie && admins.has(adminCookie);

  if (urlPath === '/api/login' && req.method === 'POST') {
    if (body.code === 'HAPPYHACKER2027') {
      const s = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessions.add(s);
      return json(res, 200, { ok: true, session: s });
    }
    return json(res, 401, { error: 'Неверный код активации' });
  }

  if (urlPath === '/api/whoami') {
    if (!sessions.has(sess)) return json(res, 403, { error: 'Сессия недействительна' });
    return json(res, 200, { ok: true });
  }

  if (urlPath === '/api/tasks') {
    if (!sessions.has(sess)) return json(res, 403, { error: 'Нет доступа' });
    // флаг в выдаче не светится — только идентификаторы
    return json(res, 200, { tasks: FLAGS.map(f => ({ id: f.id, title: f.title, solved: sessions.has(sess) && checkSolved(sess, f.id) })) });
  }

  if (urlPath === '/api/submit' && req.method === 'POST') {
    if (!sessions.has(sess)) return json(res, 403, { error: 'Нет доступа' });
    const f = FLAGS.find(x => x.id === body.id);
    if (!f) return json(res, 404, { error: 'Задание не найдено' });
    const correct = String(body.flag || '').trim().toUpperCase() === f.flag.toUpperCase();
    if (correct) markSolved(sess, f.id);
    return json(res, 200, { correct });
  }

  if (urlPath === '/api/wall') {
    if (req.method === 'GET') return json(res, 200, { posts: wallPosts });
    if (!sessions.has(sess)) return json(res, 403, { error: 'Нет доступа' });
    // УЯЗВИМОСТЬ №4: текст вставляется как есть — XSS на стене
    wallPosts.push({ author: 'гость', text: String(body.text || '').slice(0, 200) });
    return json(res, 200, { ok: true });
  }

  if (urlPath === '/api/admin/notes') {
    // УЯЗВИМОСТЬ №3 (IDOR): заметки доступны по id, сервер не проверяет владельца...
    // ...но требует админ-cookie. Обход: админ-токен лежит в robots.txt подсказке? Нет — в комментарии страницы админки.
    if (isAdmin) return json(res, 200, { notes: adminNotes });
    return json(res, 403, { error: 'Только для админа' });
  }

  return json(res, 404, { error: 'Неизвестный маршрут' });
}

const solvedBySession = new Map();
function checkSolved(sess, id) {
  return (solvedBySession.get(sess) || new Set()).has(id);
}
function markSolved(sess, id) {
  if (!solvedBySession.has(sess)) solvedBySession.set(sess, new Set());
  solvedBySession.get(sess).add(id);
}

/* ---------- Статика ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mp4': 'video/mp4', '.png': 'image/png', '.ico': 'image/x-icon' };

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, SECURITY_HEADERS);
      return res.end('404');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream', ...SECURITY_HEADERS });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);

  if (urlPath.startsWith('/api/')) return handleApi(req, res, urlPath);

  if (urlPath === '/robots.txt') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', ...SECURITY_HEADERS });
    return res.end('User-agent: *\nDisallow: /admin\nDisallow: /api/admin/notes\n# ПС: не всё запретное должно оставаться запретным. Загляни под файл поближе... вернее, в комментарии страницы логина.\n');
  }

  if (urlPath === '/admin') {
    if (cookie(req, 'admin_tok') === adminCookie && admins.has(adminCookie)) {
      return serveFile(res, path.join(PUBLIC, 'admin.html'));
    }
    return serveFile(res, path.join(PUBLIC, 'admin-login.html'));
  }

  if (urlPath === '/api/admin/login' && req.method === 'POST') {
    readBody(req).then(body => {
      if (body.password === 'HAPPY2027ADMIN') {
        admins.add(adminCookie);
        res.writeHead(200, { 'Set-Cookie': 'admin_tok=' + adminCookie + '; Path=/', ...SECURITY_HEADERS });
        return res.end('{"ok":true}');
      }
      res.writeHead(401, SECURITY_HEADERS);
      res.end('{"error":"wrong"}');
    });
    return;
  }

  // фолбэк: неизвестный путь → главная (без перехвата /admin — тот уже обработан выше)
  let filePath = path.join(PUBLIC, urlPath === '/' ? 'index.html' : urlPath);
  if (!filePath.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  return serveFile(res, filePath);
});

server.listen(PORT, () => console.log('HU::2027 → http://localhost:' + PORT));
