'use strict';
/* HU::2027 — движок канала */
(function () {
  var CODE = 'HAPPYNEWHACK';

  var FLAGS = [
    ['FLAG{WELCOME_2027}', 'флаг №1 — телеграмма штаба в исходном коде этой страницы'],
    ['FLAG{CONSOLE_2027}', 'флаг №2 — прячется в консоли браузера: console.hack()'],
    ['FLAG{LIVE_BROADCAST_2027}', 'флаг №3 — кто-то из эфира проговорится. лови момент'],
    ['FLAG{ADMIN_PANEL_H4CKED}', 'флаг №4 — панель администратора. дверь внизу страницы'],
    ['FLAG{IDOR_NOTE_3_2027}', 'флаг №5 — заметка №3 в штабе. ты не должен был её видеть'],
    ['FLAG{STORAGE_ROLE_2027}', 'флаг №6 — подмени роль в браузерном хранилище штаба']
  ];

  function $(id) { return document.getElementById(id); }
  function ls(k, v) {
    if (arguments.length > 1) { try { localStorage.setItem(k, v); } catch (e) {} }
    try { return localStorage.getItem(k); } catch (e) { return null; }
  }
  function safe(name, fn) {
    try { fn(); } catch (e) { console.warn('[HU] секция "' + name + '" не поднялась:', e.message); }
  }

  /* ---------- хранилище прохождения ---------- */
  var found = {};
  try { found = JSON.parse(ls('hu_flags') || '{}') || {}; } catch (e) { found = {}; }
  function save() { ls('hu_flags', JSON.stringify(found)); }
  function foundCount() {
    var n = 0; FLAGS.forEach(function (f) { if (found[f[0]]) n++; }); return n;
  }
  var secretFound = ls('hu_secret_flag') === '1';

  /* ---------- экран доступа ---------- */
  safe('access', function () {
    var screen = $('access-screen'), input = $('access-input'),
        btn = $('access-btn'), err = $('access-error');
    if (!screen) return;
    if (ls('hu_access') === '1') { screen.hidden = true; document.body.classList.remove('locked'); }
    function tryEnter() {
      if ((input.value || '').trim().toUpperCase() === CODE) {
        ls('hu_access', '1');
        screen.hidden = true;
        document.body.classList.remove('locked');
      } else {
        if (err) err.textContent = '\u2718 доступ запрещ\u0451н. код знает ведущий. и, возможно, санта';
      }
    }
    if (btn) btn.addEventListener('click', tryEnter);
    if (input) input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') tryEnter();
    });
  });

  /* ---------- тосты ---------- */
  function toast(msg, cls) {
    var box = $('flag-msg');
    if (!box) return;
    box.className = cls || '';
    box.textContent = msg;
  }

  /* ---------- счётчик ---------- */
  function renderCounter() {
    var c = $('flags-counter');
    if (!c) return;
    var base = 'флаги: ' + foundCount() + '/6';
    if (secretFound) base = base.replace('/6', '/6 \u2605');
    c.textContent = base;
  }

  /* ---------- список заданий ---------- */
  safe('tasks-list', function () {
    var list = $('tasks-list');
    if (!list) return;
    list.innerHTML = '';
    FLAGS.forEach(function (f) {
      var li = document.createElement('li');
      li.textContent = found[f[0]] ? f[0] + ' — ' + f[1] : '\u0444\u043b\u0430\u0433 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d: ' + f[1];
      li.className = found[f[0]] ? 'done' : 'locked';
      list.appendChild(li);
    });
    if (secretFound) {
      var li = document.createElement('li');
      li.className = 'secret-row';
      li.textContent = '\u0441\u0435\u043a\u0440\u0435\u0442\u043d\u044b\u0439 \u0444\u043b\u0430\u0433 — \u043d\u0435 \u0447\u0438\u0441\u043b\u0438\u043b\u0441\u044f \u043d\u0438 \u0432 \u043e\u0434\u043d\u043e\u043c \u0440\u0435\u0435\u0441\u0442\u0440\u0435';
      list.appendChild(li);
    }
  });

  /* ---------- сдача флагов ---------- */
  safe('flag-submit', function () {
    var input = $('flag-input'), btn = $('flag-submit');
    if (!input || !btn) return;
    function submit() {
      var v = (input.value || '').trim().toUpperCase();
      if (!v) { toast('введи флаг', 'err'); return; }
      var hit = FLAGS.filter(function (f) { return f[0] === v; })[0];
      if (hit) {
        if (found[hit[0]]) { toast('\u044d\u0442\u043e\u0442 \u0444\u043b\u0430\u0433 \u0443\u0436\u0435 \u0441\u0434\u0430\u043d. \u0448\u0442\u0430\u0431 \u0446\u0435\u043d\u0438\u0442 \u043f\u0430\u043c\u044f\u0442\u044c, \u043d\u043e \u043d\u0435 \u0434\u0443\u0431\u043b\u0438\u043a\u0430\u0442\u044b', 'ok'); return; }
        found[hit[0]] = true; save();
        toast('\u2714 \u043f\u0440\u0438\u043d\u044f\u0442\u043e: ' + hit[0], 'ok');
        renderCounter(); renderTasksSafe(); checkFinale();
        input.value = '';
        return;
      }
      if (!secretFound) {
        secretFound = true;
        ls('hu_secret_flag', '1');
        toast('\u2714 \u043f\u0440\u0438\u043d\u044f\u0442\u043e. \u0441\u0438\u0441\u0442\u0435\u043c\u0430 \u043d\u0435 \u0441\u043c\u043e\u0433\u043b\u0430 \u044d\u0442\u043e \u043a\u043b\u0430\u0441\u0441\u0438\u0444\u0438\u0446\u0438\u0440\u043e\u0432\u0430\u0442\u044c — \u0438 \u0437\u0430\u043f\u0438\u0441\u0430\u043b\u0430 \u043a\u0430\u043a \u0441\u0435\u043a\u0440\u0435\u0442\u043d\u044b\u0439 \u0444\u043b\u0430\u0433', 'secret');
        renderCounter(); renderTasksSafe();
        input.value = '';
        return;
      }
      toast('\u2718 \u041d\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043d\u044b\u0439 \u0444\u043b\u0430\u0433', 'err');
    }
    btn.addEventListener('click', submit);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
  });

  function renderTasksSafe() { safe('tasks-list-rerender', function () {
    var list = $('tasks-list');
    if (!list) return;
    list.innerHTML = '';
    FLAGS.forEach(function (f) {
      var li = document.createElement('li');
      li.textContent = found[f[0]] ? f[0] + ' — ' + f[1] : '\u0444\u043b\u0430\u0433 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d: ' + f[1];
      li.className = found[f[0]] ? 'done' : 'locked';
      list.appendChild(li);
    });
    if (secretFound) {
      var li = document.createElement('li');
      li.className = 'secret-row';
      li.textContent = '\u0441\u0435\u043a\u0440\u0435\u0442\u043d\u044b\u0439 \u0444\u043b\u0430\u0433 — \u043d\u0435 \u0447\u0438\u0441\u043b\u0438\u043b\u0441\u044f \u043d\u0438 \u0432 \u043e\u0434\u043d\u043e\u043c \u0440\u0435\u0435\u0441\u0442\u0440\u0435';
      list.appendChild(li);
    }
  }); }

  /* ---------- пасхалка в консоли ---------- */
  safe('console.hack', function () {
    window.console.hack = function () {
      if (found['FLAG{CONSOLE_2027}']) return '\u0443\u0436\u0435 \u0432\u0437\u043b\u043e\u043c\u0430\u043d\u043e. \u0444\u043b\u0430\u0433 \u0443 \u0442\u0435\u0431\u044f.';
      found['FLAG{CONSOLE_2027}'] = true; save();
      renderCounter(); renderTasksSafe(); checkFinale();
      return '\u0434\u043e\u0431\u0440\u043e \u043f\u043e\u0436\u0430\u043b\u043e\u0432\u0430\u0442\u044c \u0432 \u0437\u0430\u043a\u0443\u043b\u0438\u0441\u044c\u0435: FLAG{CONSOLE_2027}';
    };
    console.log('HU::2027 — \u043f\u043e\u043f\u0440\u043e\u0431\u0443\u0439 console.hack()');
  });

  /* ---------- прямой эфир ---------- */
  safe('broadcast', function () {
    var feed = $('broadcast-feed');
    if (!feed) return;
    var lines = [
      ['ведущий', 'в эфире у нас штатный порядок, санта на связи, тепло и спокойно'],
      ['диспетчер', 'не выключай канал. не выключай. НЕ ВЫКЛЮЧАЙ КАН'],
      ['санта', 'самолёт не мой. но олени почему-то запряжены'],
      ['дедлайн', 'бой прогремит ровно в полночь. или в 23:59. или уже'],
      ['ведущий', 'внимание, повторяю код резервного канала: FLAG{LIVE_BROADCAST_2027}'],
      ['санта', 'подарки в этом году подержу у себя. климат бережём'],
      ['диспетчер', 'по улице идёт подозрительный дед мороз с планшетом'],
      ['ведущий', 'вы ещё здесь? а след уже ускакал']
    ];
    var i = 0;
    function push() {
      var pair = lines[i % lines.length]; i++;
      var d = document.createElement('div');
      d.className = 'feed-line' + (pair[0] === 'ведущий' && pair[1].indexOf('FLAG{') === 0 ? ' hot' : (pair[1].indexOf('FLAG{') >= 0 ? ' hot' : ''));
      d.textContent = '[' + pair[0] + '] ' + pair[1];
      feed.appendChild(d);
      feed.scrollTop = feed.scrollHeight;
      if (pair[1].indexOf('FLAG{LIVE_BROADCAST_2027}') >= 0 && !found['FLAG{LIVE_BROADCAST_2027}']) {
        found['FLAG{LIVE_BROADCAST_2027}'] = true; save();
        renderCounter(); renderTasksSafe(); checkFinale();
      }
      while (feed.children.length > 40) feed.removeChild(feed.firstChild);
    }
    push(); push();
    window.setInterval(push, 8000);
  });

  /* ---------- стена ---------- */
  safe('wall', function () {
    var box = $('wall-posts');
    if (!box) return;
    var staticPosts = [
      ['гость 404', 'у нас дома сломался флагшток. это к чему?'],
      ['дед мороз (не настоящий)', 'продаю сани, б/у, следы взлома'],
      ['снежок', 'кто украл мой шарф, верните, он тёплый']
    ];
    staticPosts.forEach(function (p) {
      var d = document.createElement('div'); d.className = 'post';
      var w = document.createElement('div'); w.className = 'who'; w.textContent = p[0];
      var t = document.createElement('div'); t.textContent = p[1];
      d.appendChild(w); d.appendChild(t); box.appendChild(d);
    });
    var live = [
      ['гость с того берега', 'я видел, как во дворе камера моргнула в такт гирлянде'],
      ['аноним', 'пароль от чего-то там — hackmas2027. не помню от чего'],
      ['внук деда мороза', 'деду нужен доступ в админку. кто поможет?'],
      [' кот', 'мяу. я всё вижу']
    ];
    var j = 0;
    window.setInterval(function () {
      var p = live[j % live.length]; j++;
      var d = document.createElement('div'); d.className = 'post live';
      var w = document.createElement('div'); w.className = 'who'; w.textContent = p[0];
      var t = document.createElement('div'); t.textContent = p[1];
      d.appendChild(w); d.appendChild(t);
      box.prepend(d);
      window.setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 12000);
    }, 45000);
  });

  /* ---------- терминал ---------- */
  safe('terminal', function () {
    var out = $('term-output'), input = $('term-input');
    if (!out || !input) return;
    function print(s, cls) {
      var d = document.createElement('div');
      if (cls) d.className = cls;
      d.textContent = s;
      out.appendChild(d);
      out.scrollTop = out.scrollHeight;
    }
    print('HU terminal v2027. набери help', '');
    function run(raw) {
      var parts = (raw || '').trim().split(/\s+/);
      var cmd = (parts[0] || '').toLowerCase();
      if (!cmd) return;
      print('> ' + raw, 'term-cmd');
      if (cmd === 'help') {
        print('команды: help, whoami, flags, wall chat, xmas, clear');
        print('сдача флагов — только через страницу ЗАДАНИЕ, submit не работает');
      } else if (cmd === 'whoami') {
        print(parts[1] === '--force-admin'
          ? 'роль: admin (форс). но настоящий админ всё равно сделает это через localStorage'
          : 'роль: guest. тихий гость с клавиатурой');
      } else if (cmd === 'flags') {
        var foundList = FLAGS.filter(function (f) { return found[f[0]]; });
        print('\u0441\u0434\u0430\u043d\u043e \u0444\u043b\u0430\u0433\u043e\u0432: ' + foundCount() + ' / 6' + (secretFound ? ' (+1 \u043d\u0435 \u0438\u0437 \u0440\u0435\u0435\u0441\u0442\u0440\u0430)' : ''));
        foundList.forEach(function (f) { print(f[0]); });
        if (secretFound) print('\u2605 \u0441\u0435\u043a\u0440\u0435\u0442\u043d\u044b\u0439 \u0444\u043b\u0430\u0433 — \u0441\u0434\u0430\u043d. \u043d\u0435 \u0441\u043f\u0440\u0430\u0448\u0438\u0432\u0430\u0439, \u0447\u0442\u043e \u044d\u0442\u043e \u0431\u044b\u043b\u043e', 'secret-line');
      } else if (cmd === 'wall' && parts[1] === 'chat') {
        print('стена открыта в основной ленте. чат закрыт: админ сказал «тихо»');
      } else if (cmd === 'xmas') {
        print('\u0441 \u043d\u0430\u0441\u0442\u0443\u043f\u0430\u044e\u0449\u0438\u043c! \ud83c\udf8a \ud83c\udf85 \ud83c\udf4a');
      } else if (cmd === 'clear') {
        out.innerHTML = '';
      } else if (cmd === 'submit') {
        print('submit \u0437\u0434\u0435\u0441\u044c \u043d\u0435 \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442. \u0444\u043b\u0430\u0433\u0438 \u0441\u0434\u0430\u044e\u0442\u0441\u044f \u0442\u043e\u043b\u044c\u043a\u043e \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 \u0417\u0410\u0414\u0410\u041d\u0418\u0415');
      } else {
        print('неизвестная команда: ' + cmd + '. попробуй help');
      }
    }
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { run(input.value); input.value = ''; }
    });
  });

  /* ---------- финал ---------- */
  function checkFinale() {
    if (foundCount() < 6) return;
    var fin = $('finale');
    if (!fin) return;
    var sec = $('finale-secret');
    if (sec) {
      sec.textContent = secretFound
        ? 'бонус: ты нашёл то, чего не было в реестре. ★ секретный флаг — седьмой.'
        : 'в реестре числилось шесть. и ровно шесть сдано. а может, есть ещё?';
    }
    fin.hidden = false;
    safe('confetti', function () {
      var box = $('confetti');
      if (!box) return;
      var emojis = ['\ud83c\udf84', '\u2744\ufe0f', '\ud83c\udf4a'];
      for (var i = 0; i < 60; i++) {
        var s = document.createElement('span');
        s.className = 'conf';
        s.textContent = emojis[i % emojis.length];
        s.style.left = (Math.random() * 100) + '%';
        s.style.animationDuration = (2.5 + Math.random() * 3) + 's';
        s.style.animationDelay = (Math.random() * 2) + 's';
        s.style.fontSize = (14 + Math.random() * 14) + 'px';
        box.appendChild(s);
      }
    });
    var close = $('finale-close');
    if (close && !close.dataset.wired) {
      close.dataset.wired = '1';
      close.addEventListener('click', function () { fin.hidden = true; });
    }
  }

  /* ---------- запуск ---------- */
  renderCounter();
  renderTasksSafe();
  checkFinale();

  /* ---------- сброс для тестов ---------- */
  window.HU = {
    reset: function () {
      ['hu_access', 'hu_flags', 'hu_secret_flag', 'hu_admin_session', 'hu_role', 'hu_backup_pin', 'hu_finale_seen']
        .forEach(function (k) { ls(k, null); try { localStorage.removeItem(k); } catch (e) {} });
      location.reload();
    }
  };

  console.log('движок готов: HU::2027');
})();
