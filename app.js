/* ================= HU::2027 // BLACK TEAM — движок ================= */
'use strict';

var FLAGS = [
  'FLAG{H1DDEN_SOURC3}',
  'FLAG{CONS0LE_NEWYEAR}',
  'FLAG{L1VE_BR0ADCAST}',
  'FLAG{ADMIN_PANEL_H4CKED}',
  'FLAG{ID0R_N0TE_3}',
  'FLAG{R0LE_SW4P_2027}',
  'FLAG{TERMIN4L_CHE4T_2027}',
  'FLAG{ARC_H1VE_2027}'
];

function $(s){ return document.querySelector(s); }
function $$(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); }
function esc(t){ return String(t).replace(/[&<>"]/g, function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

/* ---------- хранилище флагов ---------- */
function getFlags(){
  try{ return JSON.parse(localStorage.getItem('hu_flags')) || []; }
  catch(e){ return []; }
}
function addFlag(f){
  if(FLAGS.indexOf(f) < 0) return false;
  var s = getFlags();
  if(s.indexOf(f) >= 0) return 'dup';
  s.push(f);
  localStorage.setItem('hu_flags', JSON.stringify(s));
  updateQuests();
  checkFinale();
  beep(true);
  return true;
}

/* ---------- тихий звук на успех ---------- */
var audioCtx = null;
function beep(ok){
  try{
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    var o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.frequency.value = ok ? 660 : 220;
    g.gain.value = .04;
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + .12);
  }catch(e){}
}

/* ---------- навигация ---------- */
$$('.nav-btn').forEach(function(btn){
  btn.addEventListener('click', function(){
    $$('.nav-btn').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    $$('main > section').forEach(function(sec){
      sec.hidden = (sec.id !== btn.dataset.s);
    });
    localStorage.setItem('hu_section', btn.dataset.s);
    if(btn.dataset.s === 'term' && $('#term-input')) $('#term-input').focus();
  });
});
(function restoreSection(){
  var saved = localStorage.getItem('hu_section');
  if(!saved) return;
  var btn = $('.nav-btn[data-s="' + saved + '"]');
  if(btn) btn.click();
})();

/* ---------- снег ---------- */
(function snow(){
  var box = $('#snow');
  if(!box) return;
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var N = window.innerWidth < 700 ? 26 : 44;
  var glyphs = ['❄','❅','❆','*'];
  for(var i = 0; i < N; i++){
    var f = document.createElement('i');
    f.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    f.style.left = (Math.random() * 100) + '%';
    f.style.fontSize = (8 + Math.random() * 12) + 'px';
    f.style.opacity = (.25 + Math.random() * .45).toFixed(2);
    f.style.animationDuration = (9 + Math.random() * 14) + 's';
    f.style.animationDelay = (-Math.random() * 20) + 's';
    box.appendChild(f);
  }
})();

/* ---------- гирлянда ---------- */
(function garland(){
  var g = $('#garland');
  if(!g) return;
  var colors = ['#ffd166','#ff7a7a','#8bd3ff','#9bf0a1'];
  for(var i = 0; i < 22; i++){
    var b = document.createElement('i');
    b.style.background = colors[i % 4];
    b.style.color = colors[i % 4];
    b.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
    g.appendChild(b);
  }
})();

/* ---------- эфир: печать обращения ---------- */
var BROADCAST = [
  '[СИСТЕМА] Эфир возвращается. Всем, кто дежурил до утра — привет.',
  'Год был громким: патчи накатывали быстрее, чем мы успевали их обходить.',
  'Но периметр держится — потому что вы держали его вместе.',
  'Без вас этот год был бы просто набором логов.'
];
var bcDone = localStorage.getItem('hu_bc') === '1';

function runBroadcast(){
  var out = $('#live-text');
  if(!out) return;
  if(bcDone){ showBroadcastEnd(); return; }
  out.textContent = '';
  var li = 0, ci = 0;
  var t = setInterval(function(){
    if(li >= BROADCAST.length){
      clearInterval(t);
      finishBroadcast();
      return;
    }
    var line = BROADCAST[li];
    if(ci < line.length){ out.textContent += line[ci++]; return; }
    out.textContent += '\n';
    li++; ci = 0;
  }, 30);
}
function finishBroadcast(){
  bcDone = true;
  localStorage.setItem('hu_bc','1');
  var out = $('#live-text');
  if(out) out.textContent = BROADCAST.join('\n') + '\n\n[СИСТЕМА] Флаг эфира: ' + FLAGS[2];
  addFlag(FLAGS[2]);
}
function showBroadcastEnd(){
  var out = $('#live-text');
  if(out) out.textContent = BROADCAST.join('\n') + '\n\n[СИСТЕМА] Флаг эфира сдан: ' + FLAGS[2];
}
setTimeout(runBroadcast, 1200);

/* ---------- консольное приветствие (флаг №2) ---------- */
console.log('%c HU::2027 ', 'background:#081712;color:#ffd07a;padding:2px 8px;border-radius:3px;font-weight:bold');
console.log('Привет, дежурный. Раз заглянул в консоль — держи: ' + FLAGS[1]);
console.log('Введи его в разделе ЗАДАНИЯ. Дальше будет глубже.');

/* ---------- задания ---------- */
var QUESTS = [
  ['1','Что не предназначено для глаз — лежит в исходнике этой страницы. Ctrl+U.','FLAG{H1DDEN_SOURC3}'],
  ['2','Консоль браузера иногда болтает лишнее (F12 → Console).','FLAG{CONS0LE_NEWYEAR}'],
  ['3','Дослушать эфир в разделе «ОБРАЩЕНИЕ» до конца.','FLAG{L1VE_BR0ADCAST}'],
  ['4','Штаб существует. robots.txt знает дорогу, а пароль лежит совсем не глубоко.','FLAG{ADMIN_PANEL_H4CKED}'],
  ['5','Заметки в штабе нумеруются. Не все они для всех.','FLAG{ID0R_N0TE_3}'],
  ['6','Роль можно переписать. Сейф доверяет надписи на бейдже.','FLAG{R0LE_SW4P_2027}'],
  ['7','Терминал отвечает на вежливость. И на настойчивость.','FLAG{TERMIN4L_CHE4T_2027}'],
  ['8','Резервный код лежит в сейфе браузера, сдвинутый на 3.','FLAG{ARC_H1VE_2027}']
];

function updateQuests(){
  var got = getFlags();
  var list = $('#qlist');
  if(list){
    list.innerHTML = '';
    QUESTS.forEach(function(q){
      var li = document.createElement('li');
      if(got.indexOf(q[2]) >= 0) li.className = 'done';
      li.innerHTML = '<span class="st">' + (got.indexOf(q[2]) >= 0 ? '✓' : '—') + '</span><span>' + esc(q[0]) + '. ' + esc(q[1]) + '</span>';
      list.appendChild(li);
    });
  }
  var cnt = got.length + '/8';
  var c1 = $('#counter'); if(c1) c1.textContent = 'СДАНО: ' + cnt;
  var c2 = $('#cnt'); if(c2) c2.textContent = cnt;
}
updateQuests();

/* ---------- сдача флага — только здесь ---------- */
function flash(msg, ok){
  var el = $('#flash');
  if(!el) return;
  el.textContent = msg;
  el.className = 'flash ' + (ok ? 'ok' : 'no');
}
function submitFlag(){
  var input = $('#flag-input');
  if(!input) return;
  var v = (input.value || '').trim();
  if(!v) return;
  input.value = '';
  if(FLAGS.indexOf(v) < 0){ flash('Такого флага нет. Ищи внимательнее.', false); return; }
  var r = addFlag(v);
  if(r === true) flash('Флаг засчитан ✓', true);
  else if(r === 'dup') flash('Этот флаг уже в активе.', false);
}
var flagBtn = $('#flag-btn');
if(flagBtn) flagBtn.addEventListener('click', submitFlag);
var flagInput = $('#flag-input');
if(flagInput) flagInput.addEventListener('keydown', function(e){
  if(e.key === 'Enter') submitFlag();
});

/* ---------- живая стена ---------- */
var WALL_LIVE = [
  ['n0ctis','С наступающим, команда! Пусть багов будет меньше, а флагов — больше.'],
  ['phantom_404','Сдал половину. Руки трясутся, но я это сделал!'],
  ['unknown','Кто выключил гирлянду? Верните свет, тут и так сервер гудит.'],
  ['black_ops_7','Мандарины в сейфе — единственная причина, почему я ещё тут сижу.'],
  ['ghost_in_log','Лог дня: консоль — мой лучший друг. С Новым годом!'],
  ['mint_julep','Слышно, как кто-то печатает. Явно готовит сдачу за пять минут до полуночи.'],
  ['r00t_jr','Хочется спать, но Новый год не сам себя встретит.'],
  ['pixel','Тишина в эфире… значит, все в терминале.'],
  ['n0ctis','Год был громким, но мы громче.'],
  ['ghost_in_log','Если кто ищет меня — я в серверной, у ёлки.']
];
function pushLive(seed){
  var wall = $('#wall-live');
  if(!wall) return;
  var item = WALL_LIVE[Math.floor(Math.random() * WALL_LIVE.length)];
  var d = document.createElement('div');
  d.className = 'post live-post' + (seed ? ' show' : '');
  d.innerHTML = '<span class="who">' + esc(item[0]) + '</span>' + esc(item[1]);
  wall.prepend(d);
  if(!seed) requestAnimationFrame(function(){ d.classList.add('show'); });
  setTimeout(function(){
    d.classList.remove('show');
    setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); }, 600);
  }, 12000);
}
(function liveWall(){
  var wall = $('#wall-live');
  if(!wall) return;
  pushLive(true); pushLive(true);
  setInterval(function(){
    if($$('#wall-live .live-post').length >= 4) return;
    pushLive(false);
  }, 45000);
})();

/* ---------- терминал ---------- */
var termOut = $('#term-out'), termIn = $('#term-input');
function shuffle(a){ return a.slice().sort(function(){ return Math.random() - .5; }); }
function wallChat(){
  return shuffle(WALL_LIVE).slice(0, 3).map(function(x){ return x[0] + ': ' + x[1]; });
}
var CMDS = {
  help: function(){
    return ['Команды: help, whoami, flags, wall chat, newyear, xmas, clear',
            'Флаги сдаются в разделе ЗАДАНИЯ — я только намекаю.'];
  },
  whoami: function(args){
    if(args && args.join(' ').indexOf('--force-admin') >= 0){
      addFlag(FLAGS[6]);
      return ['Ладно, ты спрашивал громче всех. Держи: ' + FLAGS[6]];
    }
    return ['user: guest','role: guest','(команда устала, но честная)'];
  },
  flags: function(){
    var s = getFlags();
    return ['Сдано: ' + s.length + '/8'].concat(s.length ? [s.join(', ')] : ['Пока пусто. Всё впереди.']);
  },
  newyear: function(){
    return ['До Нового года — считанные коммиты. Держись, дежурный. 🎄'];
  },
  xmas: function(){
    return ['🍊 Мандаринка выдана. В счёт не идёт, в настроение — да.'];
  },
  clear: function(){
    if(termOut) termOut.innerHTML = '';
    return [];
  }
};
function tprint(lines, cls){
  if(!termOut) return;
  lines.forEach(function(l){
    var d = document.createElement('div');
    if(cls) d.className = cls;
    d.textContent = l;
    termOut.appendChild(d);
  });
  termOut.scrollTop = termOut.scrollHeight;
}
if(termIn){
  termIn.addEventListener('keydown', function(e){
    if(e.key !== 'Enter') return;
    var raw = termIn.value.trim();
    termIn.value = '';
    if(!raw) return;
    tprint(['> ' + raw], 'in');
    var parts = raw.toLowerCase().split(/\s+/);
    var cmd = parts[0];
    if(cmd === 'wall' && parts[1] === 'chat'){ tprint(wallChat()); return; }
    if(CMDS[cmd]) tprint(CMDS[cmd](parts.slice(1)));
    else tprint(['Нет такой команды. help — список.'], 'dimline');
  });
}

/* ---------- финал ---------- */
function checkFinale(){
  if(getFlags().length >= FLAGS.length){
    localStorage.setItem('hu_finale', '1');
    showFinale(true);
  }
}
function showFinale(withConfetti){
  var f = $('#finale');
  if(!f) return;
  f.hidden = false;
  if(withConfetti) confetti();
}
function confetti(){
  var box = document.createElement('div');
  box.id = 'confetti';
  var glyphs = ['🎄','❄','🍊','✨','⭐'];
  for(var i = 0; i < 50; i++){
    var c = document.createElement('i');
    c.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    c.style.left = (Math.random() * 100) + '%';
    c.style.animationDuration = (4 + Math.random() * 5) + 's';
    c.style.animationDelay = (Math.random() * 3) + 's';
    box.appendChild(c);
  }
  document.body.appendChild(box);
  setTimeout(function(){ if(box.parentNode) box.parentNode.removeChild(box); }, 12000);
}
if(localStorage.getItem('hu_finale') === '1') showFinale(false);
