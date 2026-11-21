(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };

  /* ================= ФЛАГИ ================= */
  var FLAGS = {
    'FLAG{HTML_C0MMENT_2027}': 'Флаг в HTML-комментарии',
    'FLAG{C0NS0LE_HUNT_2027}': 'Флаг в консоли браузера',
    'FLAG{2027_HAPPY_HACKERS}': 'Флаг из новогодней трансляции',
    'FLAG{ADMIN_PANEL_H4CKED}': 'Флаг за вход в админку',
    'FLAG{IDOR_N0TES_2027}': 'Флаг в чужой заметке',
    'FLAG{R0LE_SW4P_2027}': 'Флаг из хранилища'
  };
  var found = [];
  try { found = JSON.parse(localStorage.getItem('hu_flags') || '[]') || []; } catch (e) { found = []; }

  function saveFlags() { localStorage.setItem('hu_flags', JSON.stringify(found)); }

  function submitFlag(flag) {
    if (!flag) return false;
    var norm = String(flag).trim().toUpperCase().replace(/\s+/g, '');
    if (FLAGS[norm] && found.indexOf(norm) === -1) {
      found.push(norm);
      saveFlags();
      updateCounter();
      toast('ФЛАГ ПРИНЯТ: ' + norm);
      var msg = $('submit-msg');
      if (msg) { msg.textContent = 'ПРИНЯТО: ' + norm; msg.className = 'submit-msg ok'; }
      return true;
    }
    return found.indexOf(norm) !== -1;
  }
  window.HU = { submit: submitFlag, found: function () { return found.slice(); } };

  function updateCounter() {
    var c = $('found-count');
    if (c) c.textContent = String(found.length);
    var list = $('flag-list');
    if (list) {
      list.innerHTML = '';
      found.forEach(function (f) {
        var li = document.createElement('li');
        li.textContent = f + ' — ' + (FLAGS[f] || '');
        list.appendChild(li);
      });
    }
  }

  function toast(text) {
    var t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 3500);
  }

  /* ================= МЕТЕЛЬ ================= */
  var SNOW_CHARS = ['*', '+', '\u00B7', '0', '1', '\u2744'];
  function initSnow() {
    var layer = $('snow');
    if (!layer) return;
    for (var i = 0; i < 46; i++) {
      var f = document.createElement('span');
      f.className = 'flake' + (Math.random() < 0.15 ? ' amber' : '');
      f.textContent = SNOW_CHARS[Math.floor(Math.random() * SNOW_CHARS.length)];
      f.style.left = (Math.random() * 100).toFixed(2) + '%';
      f.style.fontSize = (12 + Math.random() * 16).toFixed(0) + 'px';
      f.style.animationDuration = (7 + Math.random() * 10).toFixed(2) + 's';
      f.style.animationDelay = (-Math.random() * 17).toFixed(2) + 's';
      f.style.opacity = (0.35 + Math.random() * 0.6).toFixed(2);
      layer.appendChild(f);
    }
  }

  /* ================= ЧАСЫ ================= */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function tickClock() {
    var el = $('clock');
    if (!el) return;
    var d = new Date();
    el.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  /* ================= ЗВУК ================= */
  var audioOn = false, actx = null;
  function beep() {
    if (!audioOn) return;
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = 'square'; o.frequency.value = 880;
      g.gain.value = 0.02;
      o.connect(g); g.connect(actx.destination);
      o.start(); o.stop(actx.currentTime + 0.03);
    } catch (e) {}
  }
  function initAudioToggle() {
    var btn = $('audio-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      audioOn = !audioOn;
      btn.textContent = audioOn ? 'AUDIO: ON' : 'AUDIO: OFF';
      if (audioOn) beep();
    });
  }

  /* ================= ТРАНСЛЯЦИЯ ================= */
  var BROADCAST_LINES = [
    'Внимание, эфир. Говорит президент хакеров.',
    '',
    'Друзья, коллеги, ночные обитатели терминалов.',
    'Этот год был не тихим. Мы падали, поднимались и перезапускали сервисы в три ночи.',
    'Патчи накатывали быстрее, чем мы успевали их обходить.',
    'Мы забывали поесть, зато ни разу не забыли сделать бэкап.',
    'Кто-то сжёг прод, кто-то — свои нервы, но никто не сдался.',
    '',
    'Без вас этот год был бы просто набором логов.',
    '',
    'С Новым годом, Black Team.',
    'Пусть следующий год принесёт вам чистые сборки, зелёные пайплайны и ни одного незакрытого тикета.',
    'Выпьем за тех, кто ещё на дежурстве. За нас. За 2027.'
  ].join('\n');

  var typingTimer = null;
  function startBroadcast() {
    var out = $('broadcast-text');
    var startBtn = $('start-btn');
    var stopBtn = $('stop-btn');
    if (!out || typingTimer) return;
    if (startBtn) startBtn.className = 'btn-primary hidden';
    if (stopBtn) stopBtn.className = 'btn-ghost';
    out.textContent = '';
    var i = 0, blink = 0;
    typingTimer = setInterval(function () {
      if (i >= BROADCAST_LINES.length) {
        finishBroadcast(out, startBtn, stopBtn);
        return;
      }
      out.textContent = BROADCAST_LINES.slice(0, ++i).join('\n') + (blink++ % 2 ? '\u2588' : '');
      beep();
    }, 42);
  }
  function finishBroadcast(out, startBtn, stopBtn) {
    clearInterval(typingTimer);
    typingTimer = null;
    if (out) {
      out.textContent = BROADCAST_LINES;
      var banner = document.createElement('div');
      banner.className = 'flag-banner';
      banner.textContent = 'СИГНАЛ ПЕРЕХВАЧЕН. ФЛАГ: FLAG{2027_HAPPY_HACKERS}';
      out.appendChild(banner);
    }
    submitFlag('FLAG{2027_HAPPY_HACKERS}');
    if (startBtn) startBtn.className = 'btn-primary hidden';
    if (stopBtn) stopBtn.className = 'btn-ghost hidden';
  }
  function stopBroadcast() {
    var startBtn = $('start-btn');
    var stopBtn = $('stop-btn');
    if (typingTimer) {
      clearInterval(typingTimer);
      typingTimer = null;
    }
    if (startBtn) startBtn.className = 'btn-primary';
    if (stopBtn) stopBtn.className = 'btn-ghost hidden';
  }

  /* ================= СТЕНА ================= */
  var WALL_POSTS = [
    { author: 'n0ctis', time: '23:57', text: 'Кто-нибудь уже заходил в админку? Говорят, туда ведёт тропа, которую поисковики знают лучше нас. Смотри robots.txt.' },
    { author: 'phantom_404', time: '00:14', text: 'santa.exe, поздравляю с аптаймом 365 дней без перезагрузки. Это по-нашему.' },
    { author: 'santa.exe', time: '01:02', text: 'Пароли я всё-таки пишу в комментарии исходников. Пусть думают, что это шутка.' },
    { author: 'unknown', time: '03:33', text: 'серверу можно наврать. он верит тому, что лежит в вашем localStorage.' }
  ];
  function renderWall() {
    var box = $('wall-posts');
    if (!box) return;
    WALL_POSTS.forEach(function (p) {
      var d = document.createElement('div');
      d.className = 'wall-post';
      d.innerHTML = '<span class="author">' + p.author + '</span><span class="time">' + p.time + '</span><p></p>';
      d.querySelector('p').textContent = p.text;
      box.appendChild(d);
    });
  }

  /* ================= ТЕРМИНАЛ ================= */
  function printTerm(out, text) {
    if (!out) return;
    out.textContent += text + '\n';
    out.scrollTop = out.scrollHeight;
  }
  function initTerminal() {
    var out = $('term-out'), inp = $('term-input');
    if (!out || !inp) return;
    printTerm(out, 'HU::2027 SHELL v2.7. Введите help для списка команд.');
    inp.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var cmd = inp.value.trim();
      inp.value = '';
      if (!cmd) return;
      printTerm(out, 'black@hu:~$ ' + cmd);
      var low = cmd.toLowerCase();
      if (low === 'help') {
        printTerm(out, 'help, whoami, flags, newyear, clear, submit FLAG{...}');
      } else if (low === 'whoami') {
        printTerm(out, 'agent BLACK TEAM // clearance: ROOT-ISH');
      } else if (low === 'flags') {
        printTerm(out, found.length ? found.join('\n') : 'пока пусто. настоящие флаги ищутся, а не спрашиваются.');
      } else if (low === 'newyear') {
        printTerm(out, '   *\n  /|\\\n /*O*/\\  С НОВЫМ ГОДОМ, ХАКЕРЫ!\n   |');
      } else if (low === 'clear') {
        out.textContent = '';
      } else if (low.indexOf('submit') === 0) {
        var f = cmd.slice(6).trim();
        printTerm(out, submitFlag(f) ? 'ПРИНЯТО.' : 'ОТКАЗАНО. флаг неизвестен или уже сдан.');
      } else {
        printTerm(out, 'unknown command: ' + low);
      }
    });
  }

  /* ================= НАВИГАЦИЯ ================= */
  function initNav() {
    var buttons = document.querySelectorAll('.nav-btn[data-section]');
    if (!buttons.length) return;
    var sections = document.querySelectorAll('.section');
    function show(id) {
      sections.forEach(function (s) { s.className = 'content-block section' + (s.id === id ? '' : ' hidden'); });
      buttons.forEach(function (b) { b.className = 'nav-btn' + (b.getAttribute('data-section') === id ? ' active' : ''); });
      try { localStorage.setItem('hu_tab', id); } catch (e) {}
      window.scrollTo(0, 0);
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { show(b.getAttribute('data-section')); });
    });
    var saved = null;
    try { saved = localStorage.getItem('hu_tab'); } catch (e) {}
    if (saved && document.getElementById(saved)) show(saved);
  }

  /* ================= КОНСОЛЬ ================= */
  function consoleEgg() {
    console.log('%cHU::2027 // BLACK TEAM', 'color:#0f0;font-size:22px');
    console.log('%cНастоящие хакеры читают консоль. ФЛАГ: FLAG{C0NS0LE_HUNT_2027}', 'color:#ffb000;font-size:14px');
  }

  /* ================= СТАРТ ================= */
  function init() {
    initNav();
    initSnow();
    initAudioToggle();
    renderWall();
    initTerminal();
    updateCounter();
    tickClock();
    setInterval(tickClock, 1000);
    consoleEgg();
    var startBtn = $('start-btn');
    var stopBtn = $('stop-btn');
    if (startBtn) startBtn.addEventListener('click', startBroadcast);
    if (stopBtn) stopBtn.addEventListener('click', stopBroadcast);
    var submitBtn = $('submit-btn');
    var flagInput = $('flag-input');
    if (submitBtn && flagInput) {
      submitBtn.addEventListener('click', function () {
        submitFlag(flagInput.value);
        flagInput.value = '';
      });
      flagInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { submitFlag(flagInput.value); flagInput.value = ''; }
      });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
