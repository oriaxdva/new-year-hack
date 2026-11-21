/* HU::2027 — движок канала. Единый файл логики. */
'use strict';

/* ---------- Константы ---------- */
var ACCESS_CODE = 'HAPPYNEWHACK';
var LS_ACCESS = 'hu_access';
var LS_FLAGS = 'hu_flags';
var LS_SECRET = 'hu_secret_flag';

var FLAGS = [
  { id: 'WELCOME_2027',        title: 'ПРИВЕТСТВИЕ',      where: 'Самое начало. Иногда самое важное прячется в исходниках страницы.' },
  { id: 'CONSOLE_2027',        title: 'КОНСОЛЬ',          where: 'В браузере есть место, куда принято заглядывать разработчикам.' },
  { id: 'LIVE_BROADCAST_2027', title: 'ПРЯМОЙ ЭФИР',      where: 'Слушай эфир внимательно. Однажды он проговорится.' },
  { id: 'ADMIN_PANEL_H4CKED',  title: 'ШТАБ',             where: 'У штаба есть вход. Не основной.' },
  { id: 'IDOR_NOTE_3_2027',    title: 'ЗАПИСКА №3',       where: 'Штаб потерял одну заметку. Или заметка потеряла штаб.' },
  { id: 'STORAGE_ROLE_2027',   title: 'РОЛЬ',             where: 'Штаб верит только тому, что видит. К счастью для некоторых, он смотрит не туда.' }
];

/* ---------- Хранилище ---------- */
function getFlags() {
  try { return JSON.parse(localStorage.getItem(LS_FLAGS) || '{}'); }
  catch (e) { return {}; }
}
function isFlagFound(fid) { return !!getFlags()[fid]; }
function isSecretFound() { return localStorage.getItem(LS_SECRET) === '1'; }
function foundCount() {
  return FLAGS.filter(function (f) { return isFlagFound(f.id); }).length + (isSecretFound() ? 1 : 0);
}

/* ---------- Скрытые строки для трансляции ---------- */
var BROADCAST = [
  'HU::2027 — добро пожаловать. Контроль частоты завершён.',
  'сигнал чистый. впрочем, он всегда такой, пока ты не начинаешь слушать слишком внимательно.',
  'FLAG{LIVE_BROADCAST_2027} — пропущенный кадр. кто-то в эфире рассеян.',
  'мандарины в сейфе закончились. это не кодовое сообщение. это горе.',
  'штаб сообщает: прод уцелел. впервые за год.',
  'сводка: было тихо. стало тише.',
  'если ты читаешь это — ты уже внутри. оставайся.',
  'санта передал: вести себя хорошо. или хотя бы заметно.'
];
var SECRET_LINES = [
  '★ секретный флаг — сдан. не спрашивай, что это было.',
  '★ реестр флагов не сходится. так и задумано.',
  '★ кто-то сдал то, чего не существует. уважение.'
];

/* ---------- Сообщения на стене (только атмосфера) ---------- */
var WALL = [
  { who: 'phantom_404', text: 'штаб потерял одну заметку. или заметка потеряла штаб. в любом случае она не там, где думают админы.' },
  { who: 'unknown',     text: 'штаб верит только тому, что видит. к счастью для некоторых, он смотрит не туда.' },
  { who: 'mira',        text: 'кто-нибудь ещё слышит, как гирлянда моргает в такт эфиру? или это только я?' },
  { who: 'tim',         text: 'нашёл носок с оленями под столом. второй так и не нашёлся. подозреваю штаб.' },
  { who: 'phantom_404', text: 'остальное — вопрос громкости. запомните эту фразу.' },
  { who: 'mira',        text: 'мандарины на клавиатуре. печатаю сквозь кожуру. ждите новости.' },
  { who: 'tim',         text: 'год почти вскрыт. кое-кто уже держит нож.' },
  { who: 'unknown',     text: 'говорят, в консоли водится старый друг. оставьте ему мандаринку.' }
];
var WALL_LIVE = [
  'мандарин укатился под серверную стойку. строго слово — под стойку.',
  'кто-то снова поставил в терминале «rm -rf /». это шутка. наверное.',
  'носок с оленями замечен у вентиляции. он смотрит.',
  'сейф хранит не только флаги. хранит и огрызки.',
  'штабное табло показывает 0/6. кто-то только что вошёл. привет.'
];

/* ---------- DOM ---------- */
function $(id) { return document.getElementById(id); }
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ---------- Экран доступа ---------- */
function showAccess() {
  var sc = $('access-screen');
  if (!sc) return;
  sc.style.display = 'flex';
  document.body.classList.add('locked');
  var inp = $('access-input');
  var btn = $('access-btn');
  var err = $('access-error');
  if (err) err.textContent = '';
  function tryEnter() {
    var v = (inp && inp.value || '').trim().toUpperCase();
    if (v === ACCESS_CODE) {
      localStorage.setItem(LS_ACCESS, '1');
      hideAccess();
    } else if (err) {
      err.textContent = '✘ доступ запрещён. код знает ведущий. и, возможно, санта';
    }
  }
  if (btn) btn.addEventListener('click', tryEnter);
  if (inp) inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryEnter(); });
}
function hideAccess() {
  var sc = $('access-screen');
  if (sc) sc.style.display = 'none';
  document.body.classList.remove('locked');
}

/* ---------- Рендер списка заданий ---------- */
function renderTasks() {
  var list = $('tasks-list');
  if (!list) return;
  var html = '';
  FLAGS.forEach(function (f, i) {
    var done = isFlagFound(f.id);
    html += '<div class="task' + (done ? ' done' : '') + '">'
      + '<div class="task-title">' + (i + 1) + '. ' + esc(f.title) + (done ? ' — сдан ✔' : '') + '</div>'
      + '<div class="task-where">' + esc(f.where) + '</div>'
      + '</div>';
  });
  if (isSecretFound()) {
    html += '<div class="task secret">★ секретный флаг — не числился ни в одном реестре — сдан ✔</div>';
  }
  list.innerHTML = html;
  var c = $('flags-counter');
  if (c) c.textContent = foundCount() + '/' + FLAGS.length;
  renderFinale();
}

/* ---------- Финал ---------- */
function renderFinale() {
  var fin = $('finale');
  if (!fin) return;
  if (foundCount() >= FLAGS.length && !fin.dataset.shown) {
    fin.dataset.shown = '1';
    fin.style.display = 'block';
    confetti();
  }
  var btn = $('finale-close');
  if (btn && !btn.dataset.bound) {
    btn.dataset.bound = '1';
    btn.addEventListener('click', function () { fin.style.display = 'none'; });
  }
}

/* ---------- Конфетти ---------- */
function confetti() {
  var box = $('confetti');
  if (!box) return;
  var chars = ['🎄', '❄', '🍊', '✦'];
  for (var i = 0; i < 60; i++) {
    var s = document.createElement('span');
    s.textContent = chars[Math.floor(Math.random() * chars.length)];
    s.style.left = Math.random() * 100 + '%';
    s.style.animationDuration = (2.5 + Math.random() * 3) + 's';
    s.style.animationDelay = (Math.random() * 2) + 's';
    s.style.fontSize = (14 + Math.random() * 16) + 'px';
    box.appendChild(s);
  }
  setTimeout(function () { box.innerHTML = ''; }, 9000);
}

/* ---------- Сдача флага на странице ЗАДАНИЕ ---------- */
function bindFlagSubmit() {
  var inp = $('flag-input');
  var btn = $('flag-submit');
  var msg = $('flag-msg');
  if (!inp || !btn) return;
  function submit() {
    var raw = (inp.value || '').trim();
    if (!raw) return;
    var v = raw.toUpperCase().replace(/\s+/g, '');
    var matched = FLAGS.some(function (f) { return v === ('FLAG{' + f.id + '}').toUpperCase(); });
    if (matched) {
      var id = FLAGS.filter(function (f) { return v === ('FLAG{' + f.id + '}').toUpperCase(); })[0].id;
      var st = getFlags();
      if (!st[id]) { st[id] = 1; localStorage.setItem(LS_FLAGS, JSON.stringify(st)); }
      if (msg) msg.className = 'ok';
      if (msg) msg.textContent = '✔ флаг принят: ' + id;
      inp.value = '';
    } else if (!isSecretFound()) {
      localStorage.setItem(LS_SECRET, '1');
      if (msg) msg.className = 'secret-ok';
      if (msg) msg.textContent = '✔ принято. система не смогла это классифицировать — и записала как секретный флаг';
      inp.value = '';
    } else {
      if (msg) msg.className = 'err';
      if (msg) msg.textContent = '✘ неизвестный флаг';
    }
    renderTasks();
  }
  btn.addEventListener('click', submit);
  inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
}

/* ---------- Эфир ---------- */
function startBroadcast() {
  var feed = $('broadcast-feed');
  if (!feed) return;
  var idx = 0;
  function push() {
    var line = document.createElement('div');
    line.className = 'bc-line';
    var text = BROADCAST[idx % BROADCAST.length];
    line.textContent = text;
    feed.appendChild(line);
    while (feed.children.length > 12) feed.removeChild(feed.firstChild);
    feed.scrollTop = feed.scrollHeight;
    idx++;
  }
  push();
  setInterval(push, 8000);
}

/* ---------- Стена ---------- */
function renderWall() {
  var box = $('wall-posts');
  if (!box) return;
  box.innerHTML = WALL.map(function (w) {
    return '<div class="wall-post"><span class="wall-who">' + esc(w.who) + '</span> ' + esc(w.text) + '</div>';
  }).join('');
  setInterval(function () {
    var live = document.createElement('div');
    live.className = 'wall-live';
    live.textContent = WALL_LIVE[Math.floor(Math.random() * WALL_LIVE.length)];
    box.appendChild(live);
    setTimeout(function () { live.remove(); }, 12000);
  }, 45000);
}

/* ---------- Терминал ---------- */
function bindTerminal() {
  var inp = $('term-input');
  var out = $('term-output');
  if (!inp || !out) return;
  function print(s) {
    var d = document.createElement('div');
    d.textContent = s;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  }
  inp.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var cmd = (inp.value || '').trim();
    inp.value = '';
    if (!cmd) return;
    print('HU> ' + cmd);
    var c = cmd.toLowerCase().split(/\s+/);
    switch (c[0]) {
      case 'help':
        print('доступно: help, whoami, whoami --force-admin, flags, wall chat, xmas, clear');
        break;
      case 'whoami':
        if (c[1] === '--force-admin') {
          print('...ладно. кто-то попросил вслух. role=admin (только в твоей голове и только в этом окне)');
        } else {
          print('role=guest. терминал верит строке, а не человеку.');
        }
        break;
      case 'flags':
        print('сдано флагов: ' + foundCount() + ' / ' + FLAGS.length + (isSecretFound() ? ' (+1 не из реестра)' : ''));
        if (isSecretFound()) print(SECRET_LINES[0]);
        break;
      case 'wall':
        if (c[1] === 'chat') {
          print('подслушано на стене:');
          print('  mira: «...гирлянда моргает в такт эфиру»');
          print('  tim: «носок с оленями смотрит»');
          print('  phantom_404: «остальное — вопрос громкости»');
        } else {
          print('wall что? попробуй: wall chat');
        }
        break;
      case 'xmas':
        print('🍊 держи мандаринку. без флага внутри. проверял.');
        break;
      case 'clear':
        out.innerHTML = '';
        break;
      case 'submit':
        print('сдача флагов — только на странице ЗАДАНИЕ. здесь не принимаю.');
        break;
      default:
        print('неизвестная команда. help — если потерялся.');
    }
  });
}

/* ---------- Консольная пасхалка ---------- */
function bindConsoleEgg() {
  var fired = false;
  console.hack = function () {
    if (fired) return 'повторно консоль не выдаёт. это единичность.';
    fired = true;
    var st = getFlags();
    if (!st['CONSOLE_2027']) { st['CONSOLE_2027'] = 1; localStorage.setItem(LS_FLAGS, JSON.stringify(st)); }
    renderTasks();
    return 'FLAG{CONSOLE_2027} — да, прямо здесь. молодец, что заглянул.';
  };
  console.log('%c HU::2027 — попробуй console.hack() ', 'background:#042; color:#5f5; padding:2px 6px;');
}

/* ---------- Запуск ---------- */
function boot() {
  var seen = [];
  ['access-screen', 'access-input', 'access-btn', 'tasks-list', 'flags-counter', 'flag-input', 'flag-submit', 'flag-msg', 'broadcast-feed', 'wall-posts', 'term-input', 'term-output', 'finale', 'finale-close', 'confetti'].forEach(function (id) {
    if (!$(id)) seen.push(id);
  });
  if (seen.length) console.warn('HU: не найдены блоки: ' + seen.join(', '));

  if (localStorage.getItem(LS_ACCESS) === '1') hideAccess(); else showAccess();
  renderTasks();
  bindFlagSubmit();
  bindTerminal();
  bindConsoleEgg();
  startBroadcast();
  renderWall();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
