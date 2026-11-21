/* ============================================================
   HU::2027 — движок канала
   Вход по коду, 6 флагов, секретный флаг, эфир, стена,
   терминал, финал. Недостающие секции дорисовывает сам.
   ============================================================ */
'use strict';
(function () {

/* ---------- константы ---------- */
var LS_ACCESS = 'hu_access';
var LS_FLAGS  = 'hu_flags';
var LS_SECRET = 'hu_secret_flag';
var ACCESS_CODE = 'HAPPYNEWHACK';

var FLAGS = [
  { id: 'WELCOME_2027',        hint: 'Добро пожаловать в канал. Иногда стоит заглянуть под капот страницы.' },
  { id: 'CONSOLE_2027',        hint: 'Консоль разработчика любит смелых. Набери console.hack().' },
  { id: 'LIVE_BROADCAST_2027', hint: 'Следи за эфиром — не всё в нём случайное.' },
  { id: 'ADMIN_PANEL_H4CKED',  hint: 'Штаб где-то рядом. Пароль от входа — в исходниках страницы входа.' },
  { id: 'IDOR_NOTE_3_2027',    hint: 'В штабе заметки нумеруются. Кто сказал, что видны все?' },
  { id: 'STORAGE_ROLE_2027',   hint: 'Браузер помнит, кем ты сказал ему быть. Подскажи ему роль admin.' }
];

function flagCode(id) { return 'FLAG{' + id + '}'; }

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(LS_FLAGS) || '[]') || []; }
  catch (e) { return []; }
}
function saveSaved(arr) {
  try { localStorage.setItem(LS_FLAGS, JSON.stringify(arr)); } catch (e) {}
}
function savedHas(id) { return loadSaved().indexOf(id) !== -1; }

function secretFound() {
  try { return localStorage.getItem(LS_SECRET) === 'found'; } catch (e) { return false; }
}
function markSecret() {
  try { localStorage.setItem(LS_SECRET, 'found'); } catch (e) {}
}

function $(id) { return document.getElementById(id); }

/* безопасная секция: ошибка в одной не глушит остальные */
function section(name, fn) {
  try { fn(); } catch (e) { console.warn('[HU] секция ' + name + ':', e && e.message); }
}

/* ============================================================
   ЭКРАН ДОСТУПА
   ============================================================ */
function setupAccess() {
  var screen = $('access-screen');
  if (!screen) { // если экрана нет в разметке — создаём
    screen = document.createElement('div');
    screen.id = 'access-screen';
    screen.innerHTML =
      '<div class="access-box">' +
      '<div class="access-sig">HU::2027</div>' +
      '<div class="access-sub">ЗАКРЫТЫЙ КАНАЛ — ДОСТУП ТОЛЬКО ПО КОДУ</div>' +
      '<input id="access-input" type="password" placeholder="ВВЕДИ КОД ДОСТУПА" autocomplete="off">' +
      '<button id="access-btn" type="button">ВОЙТИ</button>' +
      '<div id="access-error"></div>' +
      '</div>';
    document.body.insertBefore(screen, document.body.firstChild);
    console.info('[HU] access-screen собран автоматически');
  }

  var ok = false;
  try { ok = localStorage.getItem(LS_ACCESS) === ACCESS_CODE; } catch (e) {}
  if (ok) { screen.classList.add('off'); return; }

  var input = $('access-input');
  var btn = $('access-btn');
  var err = $('access-error');

  function tryLogin() {
    var val = (input && input.value ? input.value : '').trim().toUpperCase();
    if (val === ACCESS_CODE) {
      try { localStorage.setItem(LS_ACCESS, ACCESS_CODE); } catch (e) {}
      screen.classList.add('off');
      if (err) err.textContent = '';
      console.info('[HU] доступ разрешён. канал открыт.');
    } else {
      if (err) err.textContent = '✘ доступ запрещён. код знает ведущий. и, возможно, санта';
      if (input) { input.value = ''; input.focus(); }
    }
  }

  if (btn) btn.addEventListener('click', tryLogin);
  if (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); tryLogin(); }
    });
    setTimeout(function () { input.focus(); }, 100);
  }
  screen.addEventListener('submit', function (e) {
    e.preventDefault(); tryLogin();
  });
}

/* ============================================================
   САМОВОССТАНОВЛЕНИЕ СЕКЦИЙ
   ============================================================ */
function ensureSections() {
  var missing = [];
  var panel = document.querySelector('.panel') || document.body;

  function makeSec(id, title, inner) {
    if ($(id)) return;
    var sec = document.createElement('section');
    sec.id = id;
    sec.className = 'sec';
    sec.innerHTML = '<h2>[ ' + title + ' ]</h2>' + inner;
    panel.appendChild(sec);
    missing.push(title);
  }

  makeSec('tasks', 'ЗАДАНИЯ',
    '<div class="counter-line">СДАНО ФЛАГОВ: <span id="flags-counter">0/6</span></div>' +
    '<div id="tasks-list"></div>' +
    '<div class="submit-line">' +
    '<input id="flag-input" type="text" placeholder="ВВЕДИ ФЛАГ СЮДА" autocomplete="off">' +
    '<button id="flag-submit" type="button">СДАТЬ</button>' +
    '</div><div id="flag-msg"></div>');

  makeSec('live', 'ПРЯМОЙ ЭФИР', '<div id="broadcast-feed"></div>');
  makeSec('wall', 'СТЕНА', '<div id="wall-posts"></div>');
  makeSec('term', 'ТЕРМИНАЛ',
    '<div id="term-output" class="term-out"></div>' +
    '<div class="term-line"><span class="prompt">hu@2027:~$</span>' +
    '<input id="term-input" type="text" autocomplete="off" placeholder="help"></div>');

  if (!$('finale')) {
    var fin = document.createElement('div');
    fin.id = 'finale'; fin.hidden = true;
    fin.innerHTML =
      '<div class="finale-box">' +
      '<div class="finale-title">★ ВСЕ ФЛАГИ СОБРАНЫ ★</div>' +
      '<div class="finale-text">Канал очищен, эфир стабилен, мандарины на столе.</div>' +
      '<div class="finale-code">С ДНЁМ ХАКЕРА, С НОВЫМ 2027-М!</div>' +
      '<button id="finale-close" type="button">ЗАКРЫТЬ</button>' +
      '</div>';
    document.body.appendChild(fin);
  }
  if (!$('confetti')) {
    var conf = document.createElement('div');
    conf.id = 'confetti';
    document.body.insertBefore(conf, document.body.firstChild);
  }

  if (missing.length) {
    console.info('[HU] секции собраны автоматически: ' + missing.join(', '));
  }
}

/* ============================================================
   ЗАДАНИЯ И СДАЧА ФЛАГОВ
   ============================================================ */
function countReal() {
  var n = 0;
  for (var i = 0; i < FLAGS.length; i++) if (savedHas(FLAGS[i].id)) n++;
  return n;
}
function refreshTasks() {
  var list = $('tasks-list');
  if (!list) return;
  list.innerHTML = '';
  for (var i = 0; i < FLAGS.length; i++) {
    var f = FLAGS[i];
    var done = savedHas(f.id);
    var row = document.createElement('div');
    row.className = 'task-row' + (done ? ' done' : '');
    row.innerHTML =
      '<span class="task-st">' + (done ? '✔ сдан' : '· не сдан') + '</span>' +
      '<span class="task-flag">' + f.hint + '</span>';
    list.appendChild(row);
  }
  if (secretFound()) {
    var row = document.createElement('div');
    row.className = 'task-row done';
    row.innerHTML =
      '<span class="task-st">✔ сдан</span>' +
      '<span class="task-flag task-flag-secret">★ секретный флаг — не числился ни в одном реестре</span>';
    list.appendChild(row);
  }
  var counter = $('flags-counter');
  if (counter) {
    counter.textContent = (countReal() + (secretFound() ? 1 : 0)) + '/6';
  }
}

function setFlagMsg(text, cls) {
  var msg = $('flag-msg');
  if (!msg) return;
  msg.textContent = text;
  msg.className = cls || '';
}

function acceptSecret() {
  markSecret();
  refreshTasks();
  setFlagMsg('✔ принято. система не смогла это классифицировать — и записала как секретный флаг', 'sec');
}

function submitFlag(value) {
  var v = (value || '').trim();
  if (!v) { setFlagMsg('✘ пустая строка — флагами не считается', 'err'); return; }

  for (var i = 0; i < FLAGS.length; i++) {
    if (v.toUpperCase() === flagCode(FLAGS[i].id).toUpperCase()) {
      if (savedHas(FLAGS[i].id)) {
        setFlagMsg('✔ этот флаг уже сдан. не жадничай', 'ok');
      } else {
        var arr = loadSaved(); arr.push(FLAGS[i].id); saveSaved(arr);
        refreshTasks();
        setFlagMsg('✔ флаг принят: ' + flagCode(FLAGS[i].id), 'ok');
      }
      checkFinale();
      return;
    }
  }

  if (!secretFound()) { acceptSecret(); checkFinale(); return; }
  setFlagMsg('✘ Неизвестный флаг. система даже не поняла, что это было', 'err');
}

function setupTasks() {
  refreshTasks();
  var input = $('flag-input');
  var btn = $('flag-submit');
  if (btn) btn.addEventListener('click', function () {
    submitFlag(input ? input.value : '');
    if (input) input.value = '';
  });
  if (input) input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitFlag(input.value);
      input.value = '';
    }
  });
}

/* ============================================================
   ФИНАЛ
   ============================================================ */
function checkFinale() {
  if (countReal() === FLAGS.length && !$('finale').dataset.shown) {
    var fin = $('finale');
    fin.hidden = false;
    fin.dataset.shown = '1';
    runConfetti();
  }
}
function setupFinale() {
  var fin = $('finale');
  var btn = $('finale-close');
  if (btn) btn.addEventListener('click', function () {
    fin.hidden = true;
  });
  checkFinale();
}
function runConfetti() {
  var box = $('confetti');
  if (!box) return;
  var items = ['🎄', '❄', '🍊', '🎄', '❄'];
  for (var i = 0; i < 60; i++) {
    var p = document.createElement('div');
    p.className = 'confetti-piece';
    p.textContent = items[i % items.length];
    p.style.left = (Math.random() * 100) + 'vw';
    p.style.animationDuration = (2.4 + Math.random() * 2.6) + 's';
    p.style.animationDelay = (Math.random() * 1.4) + 's';
    box.appendChild(p);
  }
  setTimeout(function () { box.innerHTML = ''; }, 6500);
}

/* ============================================================
   ПРЯМОЙ ЭФИР
   ============================================================ */
var FEED_LINES = [
  '[эфир]checking: соединение стабильно. праздничное настроение — 98%',
  '[эфир]санта передаёт: носки над камином, глаза — на монитор',
  '[эфир]обнаружен неизвестный пакет. отложили на после праздников',
  '[эфир]мандарины кончаются. это тревожный сигнал',
  '[эфир]пинг до северного полюса: 42 мс. снег мешает, но не сильно',
  '[эфир]антивирус попросил выходной до 8 января. одобрено',
  '[эфир]кружок «снежинка» на связи. эфир чистый',
  '[эфир]гирлянда мигает в ритме сканера. совпадение? не думаем'
];

var feedTimer = null;
function feedLine(text, cls) {
  var feed = $('broadcast-feed');
  if (!feed) return;
  var d = new Date();
  var t = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  var line = document.createElement('div');
  line.className = 'feed-line' + (cls ? ' ' + cls : '');
  line.innerHTML = '<span class="feed-time">[' + t + ']</span>' + text;
  feed.appendChild(line);
  feed.scrollTop = feed.scrollHeight;
  while (feed.children.length > 40) feed.removeChild(feed.firstChild);
}

function setupFeed() {
  var feed = $('broadcast-feed');
  if (!feed) return;
  var idx = Math.floor(Math.random() * FEED_LINES.length);
  feedLine(FEED_LINES[idx]);
  feedTimer = setInterval(function () {
    idx = (idx + 1) % FEED_LINES.length;
    feedLine(FEED_LINES[idx]);
    /* флаг №3: один раз среди эфира проскакивает живая строка */
    if (idx === 3 && !savedHas('LIVE_BROADCAST_2027') && !window.__flag3shown) {
      window.__flag3shown = true;
      setTimeout(function () {
        var code = flagCode('LIVE_BROADCAST_2027');
        feedLine('⚠ глитч в матрице: ' + code + ' — кто успел, тот кликнул', 'flag-line');
        var lines = feed.querySelectorAll('.flag-line');
        var last = lines[lines.length - 1];
        if (last) last.addEventListener('click', function () {
          submitFlag(code);
          feedLine('✓ флаг из эфира сдан. глазастый.', '');
        });
      }, 1500);
    }
  }, 8000);
}

/* ============================================================
   СТЕНА
   ============================================================ */
var WALL_POSTS = [
  { who: 'гость_342', text: 'кто-нибудь пробовал ткнуть в заголовок на главной? палец чешется' },
  { who: 'ёжик_в_тумане', text: 'санта в чате сказал, что видел флаги своими глазами. где — не сказал' },
  { who: 'мандарин_король', text: 'эта стена что-то скрывает. я это чувствую кожурой' },
  { who: 'гость_777', text: 'задания — это верхушка. под ними ещё что-то есть, вот прям чувствую' }
];
var WALL_LIVE = [
  { who: 'гость_?.', text: 'у меня из-под клавиатуры выпал носок с оленями. это чей?' },
  { who: 'аноним', text: 'мандарины над клавиатурой — плохая примета для механики' },
  { who: 'снеговик', text: 'шум в эфире не всегда шум. иногда это сигнал' }
];

function wallPost(post, live) {
  var wall = $('wall-posts');
  if (!wall) return;
  var p = document.createElement('div');
  p.className = 'wall-post' + (live ? ' live' : '');
  p.innerHTML = '<span class="who">' + post.who + ':</span>' + post.text;
  wall.insertBefore(p, wall.firstChild);
  if (live) setTimeout(function () {
    if (p.parentNode) p.parentNode.removeChild(p);
  }, 12000);
  while (wall.children.length > 12) wall.removeChild(wall.lastChild);
}

function setupWall() {
  if (!$('wall-posts')) return;
  for (var i = 0; i < WALL_POSTS.length; i++) wallPost(WALL_POSTS[i], false);
  setInterval(function () {
    var p = WALL_LIVE[Math.floor(Math.random() * WALL_LIVE.length)];
    wallPost(p, true);
  }, 45000);
}

/* ============================================================
   ТЕРМИНАЛ
   ============================================================ */
function termPrint(text) {
  var out = $('term-output');
  if (!out) return;
  var d = document.createElement('div');
  d.textContent = text;
  out.appendChild(d);
  out.scrollTop = out.scrollHeight;
  while (out.children.length > 100) out.removeChild(out.firstChild);
}

function setupTerminal() {
  var input = $('term-input');
  var out = $('term-output');
  if (!input || !out) return;

  console.hack = function () {
    if (savedHas('CONSOLE_2027')) {
      termPrint('флаг уже сдан. консоль гордится тобой повторно');
      return flagCode('CONSOLE_2027');
    }
    var arr = loadSaved(); arr.push('CONSOLE_2027'); saveSaved(arr);
    refreshTasks(); checkFinale();
    termPrint('✓ флаг из консоли сдан: ' + flagCode('CONSOLE_2027'));
    return flagCode('CONSOLE_2027');
  };

  console.info('HU::2027 — попробуй console.hack()');

  function run(cmdline) {
    var parts = cmdline.trim().split(/\s+/);
    var cmd = (parts[0] || '').toLowerCase();
    var arg = parts.slice(1).join(' ').toLowerCase();
    termPrint('hu@2027:~$ ' + cmdline);

    if (cmd === 'help') {
      termPrint('команды: help, whoami, flags, wall chat, xmas, clear');
    } else if (cmd === 'whoami') {
      if (arg === '--force-admin') {
        termPrint('ролей тут больше не раздают. но мысль верная — копай браузер');
      } else {
        termPrint('гость закрытого канала. пока что.');
      }
    } else if (cmd === 'flags') {
      var n = countReal();
      var line = 'сдано флагов: ' + (n + (secretFound() ? 1 : 0)) + ' / 6' +
        (secretFound() ? ' (+1 не из реестра)' : '');
      termPrint(line);
      if (secretFound()) termPrint('★ секретный флаг — сдан. не спрашивай, что это было');
      if (n < FLAGS.length) termPrint('подсказки — в списке ЗАДАНИЯ');
    } else if (cmd === 'wall' && arg === 'chat') {
      termPrint('перехват стены:');
      termPrint('  гость_342: кто-нибудь пробовал ткнуть в заголовок на главной?');
      termPrint('  ёжик_в_тумане: санта видел флаги своими глазами. где — не сказал');
      termPrint('  мандарин_король: эта стена что-то скрывает. я чувствую кожурой');
    } else if (cmd === 'xmas') {
      termPrint(' merry christmas, хакер. 🍊');
    } else if (cmd === 'clear') {
      out.innerHTML = '';
    } else if (cmd === 'submit') {
      termPrint('сдача флагов — только на странице ЗАДАНИЯ. терминал не почта');
    } else if (cmd !== '') {
      termPrint('команда не найдена: ' + cmd + '. help подскажет');
    }
  }

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var v = input.value;
      input.value = '';
      run(v);
    }
  });

  termPrint('HU::2027 терминал готов. набери help');
}

/* ============================================================
   ЗАПУСК
   ============================================================ */
function boot() {
  var missing = [];
  ['access-screen','tasks-list','flags-counter','flag-msg','flag-input','flag-submit',
   'broadcast-feed','wall-posts','term-input','term-output','finale','confetti']
    .forEach(function (id) { if (!$(id)) missing.push(id); });

  section('access', setupAccess);
  section('sections', ensureSections);
  section('tasks', setupTasks);
  section('finale', setupFinale);
  section('feed', setupFeed);
  section('wall', setupWall);
  section('terminal', setupTerminal);

  console.info('[HU] движок готов.');
  if (missing.length) {
    console.warn('[HU] не найдены блоки: ' + missing.join(', ') + ' — недостающие собраны автоматически');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

})();
