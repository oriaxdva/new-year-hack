/* HU::2027 — движок Black Team */
'use strict';

/* ---------- ФЛАГИ ---------- */
const FLAGS = {
  1:'FLAG{HTML_C0MMENT_2027}',
  2:'FLAG{C0NS0LE_M4STER}',
  3:'FLAG{NY_BR0ADCAST}',
  4:'FLAG{ADMIN_PANEL_H4CKED}',
  5:'FLAG{ID0R_N0TE_3}',
  6:'FLAG{R0LE_SW4P_2027}',
  7:'FLAG{TERMIN4L_CHE4T_2027}',
  8:'FLAG{ARCHIVE_CODE_2027}'
};
function getFlags(){ try{ return JSON.parse(localStorage.getItem('hu_flags')||'[]'); }catch(e){ return []; } }
function addFlag(n){
  const f = getFlags();
  if(!f.includes(n)){ f.push(n); localStorage.setItem('hu_flags', JSON.stringify(f)); }
  updateCounter();
  if(f.length >= 8) showFinale();
}
function updateCounter(){
  const el = document.getElementById('counter');
  if(!el) return;
  el.textContent = 'Сдано флагов: ' + getFlags().length + '/8';
}
function showFinale(){
  const b = document.getElementById('final-banner');
  if(b && b.classList.contains('hidden')){
    b.classList.remove('hidden');
    confetti();
  }
}
let confettiRun = false;
function confetti(){
  if(confettiRun) return; confettiRun = true;
  const layer = document.getElementById('snowLayer');
  const glyphs = ['🎄','❄️','🍊','✨','⛄'];
  let n = 0;
  const iv = setInterval(()=>{
    for(let i=0;i<6;i++){
      const s = document.createElement('span');
      s.className = 'flake';
      s.textContent = glyphs[Math.floor(Math.random()*glyphs.length)];
      s.style.left = Math.random()*100 + '%';
      s.style.fontSize = (12 + Math.random()*14) + 'px';
      s.style.animationDuration = (2.5 + Math.random()*3) + 's';
      layer.appendChild(s);
      setTimeout(()=>s.remove(), 6500);
    }
    if(++n > 10){ clearInterval(iv); confettiRun = false; }
  }, 250);
}

/* ---------- СНЕГ ---------- */
(function snow(){
  const layer = document.getElementById('snowLayer');
  if(!layer) return;
  const glyphs = ['❄','❅','❆'];
  for(let i=0;i<40;i++){
    const f = document.createElement('span');
    f.className = 'flake';
    f.textContent = glyphs[i%3];
    f.style.left = Math.random()*100 + '%';
    f.style.fontSize = (10 + Math.random()*10) + 'px';
    f.style.animationDuration = (9 + Math.random()*14) + 's';
    f.style.animationDelay = (-Math.random()*20) + 's';
    f.style.opacity = .25 + Math.random()*.35;
    layer.appendChild(f);
  }
})();

/* ---------- ГИРЛЯНДА ---------- */
(function garland(){
  const g = document.getElementById('garland');
  if(!g) return;
  g.innerHTML = '<div class="wire"></div>';
  const colors = ['#8fe3b0','#ff9a8a','#ffcf7a','#9ecbff'];
  for(let i=0;i<22;i++){
    const b = document.createElement('span');
    b.className = 'bulb';
    b.style.background = colors[i%4];
    b.style.animationDelay = (Math.random()*2.4).toFixed(2) + 's';
    g.appendChild(b);
  }
})();

/* ---------- НАВИГАЦИЯ ---------- */
(function nav(){
  const navEl = document.getElementById('nav');
  if(!navEl) return;
  const saved = localStorage.getItem('hu_section');
  function show(id){
    document.querySelectorAll('.sec').forEach(s=>s.classList.remove('active'));
    const sec = document.getElementById('sec-' + id);
    if(sec) sec.classList.add('active');
    navEl.querySelectorAll('button').forEach(b=>
      b.classList.toggle('active', b.dataset.sec === id));
    localStorage.setItem('hu_section', id);
  }
  navEl.addEventListener('click', e=>{
    const b = e.target.closest('button');
    if(b) show(b.dataset.sec);
  });
  if(saved && document.getElementById('sec-' + saved)) show(saved);
})();

/* ---------- ЧАСЫ ---------- */
(function clock(){
  const el = document.getElementById('clock');
  if(!el) return;
  setInterval(()=>{
    el.textContent = new Date().toLocaleTimeString('ru-RU');
  }, 1000);
})();

/* ---------- ЗВУК ---------- */
let soundOn = localStorage.getItem('hu_sound') === '1';
let actx = null;
function beep(){
  if(!soundOn) return;
  try{
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), gn = actx.createGain();
    o.frequency.value = 520 + Math.random()*220;
    gn.gain.value = .015;
    o.connect(gn); gn.connect(actx.destination);
    o.start(); o.stop(actx.currentTime + .05);
  }catch(e){}
}
(function(){
  const btn = document.getElementById('soundBtn');
  if(!btn) return;
  btn.textContent = soundOn ? '🔊' : '🔈';
  btn.addEventListener('click', ()=>{
    soundOn = !soundOn;
    localStorage.setItem('hu_sound', soundOn ? '1':'0');
    btn.textContent = soundOn ? '🔊' : '🔈';
  });
})();

/* ---------- ЭФИР / ОБРАЩЕНИЕ ---------- */
const SPEECH =
'> [ЭФИР] Внимание, говорит дежурный по серверной.\n' +
'> Год подходил к концу привычно: патчи накатывали быстрее, чем мы успевали их обходить,\n' +
'> а мы всё равно успевали. Потому что мы — Black Team.\n' +
'> Спасибо за каждый закрытый инцидент, за каждый рассвет у монитора и за мандарины,\n' +
'> которые мы так и не съели, потому что берегли до праздника.\n' +
'> Без вас этот год был бы просто набором логов.\n' +
'> С наступающим, бойцы. Эфир окончен. Флаг — в эфире.';
let bcTimer = null;
function playBroadcast(){
  const pre = document.getElementById('broadcast');
  const card = document.getElementById('bc-flag');
  if(!pre) return;
  clearInterval(bcTimer);
  pre.textContent = '';
  pre.classList.remove('done');
  if(card) card.classList.add('hidden');
  let i = 0;
  bcTimer = setInterval(()=>{
    pre.textContent = SPEECH.slice(0, i);
    i++;
    if(i % 3 === 0) beep();
    if(i >= SPEECH.length){
      clearInterval(bcTimer);
      pre.classList.add('done');
      if(card && !getFlags().includes(3)){
        card.innerHTML = '🎁 ФЛАГ №3 за эфир: <span class="code">FLAG{NY_BR0ADCAST}</span> — сдан автоматически.';
        card.classList.remove('hidden');
      }
      addFlag(3);
    }
  }, 28);
}
(function(){
  const btn = document.getElementById('bc-replay');
  if(btn) btn.addEventListener('click', playBroadcast);
  playBroadcast();
})();

/* ---------- СТЕНА ---------- */
const WALL_HINTS = [
  {who:'n0ctis', text:'Подсказка №1: некоторые дары прячут прямо в обёртке. Ctrl+U не кусается.'},
  {who:'phantom_404', text:'Подсказка №2: консоль — не только для ошибок. Иногда там дарят подарки. F12.'},
  {who:'unknown', text:'Не ищи кнопку входа — ищи файл. Роботы обычно оставляют карту: /robots.txt.'},
  {who:'n0ctis', text:'У заметок в админке есть номера. Не все номера предназначены для гостей.'},
  {who:'phantom_404', text:'Сервер верит тому, что лежит в localStorage. Ключ hu_role — это почти магическое слово.'},
  {who:'unknown', text:'Иногда проще попросить громче, чем ломать дверь. Вежливый терминал понимает настойчивость.'},
  {who:'n0ctis', text:'Резервный код лежит в сейфе (localStorage). Сейф не запирается. Код — в сдвиге.'}
];
const WALL_LIVE = [
  {who:'n0ctis', text:'С наступающим, команда! Пусть в новом году багов будет меньше, а флагов — больше!'},
  {who:'phantom_404', text:'Только что сдал флаг за эфир. Руки трясутся, но я это сделал! 🎉'},
  {who:'unknown', text:'Кто включил гирлянду в серверной? …Всем спасибо, не выключайте. Так уютнее.'},
  {who:'black_ops_7', text:'Мандарины в сейфе — единственная причина, почему я ещё тут сижу.'},
  {who:'ghost_in_log', text:'Лог дня: понял, что консоль — мой лучший друг. С Новым годом, Black Team!'},
  {who:'n0ctis', text:'Дежурство в новогоднюю ночь — это как понинг продакшена: страшно, но по расписанию.'},
  {who:'phantom_404', text:'У кого-нибудь ещё монитор мигает? А, нет, это я в сканлайны смотрю.'},
  {who:'unknown', text:'Ёлку в серверной не выключать. Это единственный источник праздничного духа.'},
  {who:'black_ops_7', text:'Сдвинул код на три символа. Нет, не в танце — в шифре.'},
  {who:'ghost_in_log', text:'Кто оставил снег в логах? Ай, ладно, пусть лежит. Красиво.'},
  {who:'n0ctis', text:'Всех с наступающим! Черри-пик вишенка на торте: год закрыт.'},
  {who:'phantom_404', text:'Если найдёшь все флаги — напиши сюда. Стена должна аплодировать.'}
];
function wallMsg(m, live){
  const wall = document.getElementById('wall');
  if(!wall) return;
  const div = document.createElement('div');
  div.className = 'msg' + (live ? ' live' : '');
  div.innerHTML = '<span class="who">' + m.who + ':</span> ' + m.text;
  wall.prepend(div);
  while(wall.children.length > 14) wall.lastChild.remove();
  if(live){
    setTimeout(()=>{ div.classList.add('leaving'); setTimeout(()=>div.remove(), 1300); }, 12000);
  }
}
(function wallInit(){
  const wall = document.getElementById('wall');
  if(!wall) return;
  WALL_HINTS.forEach(m=>wallMsg(m,false));
  setInterval(()=>{
    wallMsg(WALL_LIVE[Math.floor(Math.random()*WALL_LIVE.length)], true);
  }, 45000);
})();

/* ---------- ТЕРМИНАЛ ---------- */
function termPrint(html){
  const out = document.getElementById('term-out');
  if(!out) return;
  const div = document.createElement('div');
  div.innerHTML = html;
  out.appendChild(div);
  out.scrollTop = out.scrollHeight;
}
const LIVE_PICK = ()=> WALL_LIVE[Math.floor(Math.random()*WALL_LIVE.length)].text;
function termCmd(raw){
  const cmd = raw.trim();
  if(!cmd) return;
  termPrint('<span class="dim">black@hu:~$</span> ' + cmd.replace(/</g,'&lt;'));
  const low = cmd.toLowerCase();

  if(low === 'help'){
    termPrint('Команды: help, whoami, flags, newyear, xmas, wall chat, submit FLAG{...}');
  } else if(low === 'whoami'){
    const role = localStorage.getItem('hu_role') || 'guest';
    termPrint('black_team_agent · role=' + role);
  } else if(low === 'whoami --force-admin'){
    termPrint('<span class="ok">Ладно, ты спрашивал громче всех. Держи:</span>');
    termPrint('<span class="gold">FLAG{TERMIN4L_CHE4T_2027}</span>');
    addFlag(7);
  } else if(low === 'flags'){
    const f = getFlags();
    termPrint(f.length ? 'Сдано: ' + f.length + '/8 → [' + f.join(', ') + ']'
                       : 'Пока ни одного. Но это поправимо.');
  } else if(low === 'newyear'){
    termPrint('🎄🎄🎄\n🎄 С наступающим, Black Team! 🎄\n🎄🎄🎄');
  } else if(low === 'xmas'){
    termPrint('<span class="gold">🍊 бонусная мандаринка. В счёт не идёт — просто для духа.</span>');
  } else if(low === 'wall chat'){
    termPrint('<span class="dim">— подслушанный общий чат —</span>');
    for(let i=0;i<3;i++) termPrint('<span class="dim">' + LIVE_PICK() + '</span>');
  } else if(low.startsWith('submit')){
    const m = cmd.match(/FLAG\{[^}]+\}/i);
    if(!m){ termPrint('<span class="warn">Формат: submit FLAG{...}</span>'); return; }
    const up = m[0].toUpperCase();
    const num = Object.keys(FLAGS).find(k=>FLAGS[k].toUpperCase() === up);
    if(num === undefined){
      termPrint('<span class="warn">Такого флага нет. Стена и эфир подскажут.</span>');
    } else if(getFlags().includes(+num)){
      termPrint('<span class="dim">Этот флаг уже сдан. Щедрость засчитана, дубль — нет.</span>');
    } else {
      addFlag(+num);
      termPrint('<span class="ok">✓ ФЛАГ №' + num + ' принят! Отлично, боец.</span>');
    }
  } else {
    termPrint('<span class="warn">Неизвестная команда. help — твой друг.</span>');
  }
}
(function termInit(){
  const input = document.getElementById('term-in');
  if(!input) return;
  termPrint('Терминал HU::2027 готов. Введи help. Удачи, агент Black Team. 🎄');
  input.addEventListener('keydown', e=>{
    if(e.key === 'Enter'){
      termCmd(input.value);
      input.value = '';
    }
  });
})();

/* ---------- СТАРТ ---------- */
console.log('%c[СИСТЕМА] Обнаружен скрытый канал. Уровень доступа: любопытный игрок.',
            'color:#8fe3b0');
console.log('%cFLAG{C0NS0LE_M4STER}', 'color:#ffcf7a;font-size:16px;font-weight:bold');
console.log('%cСдай его в терминале на странице: submit FLAG{C0NS0LE_M4STER}', 'color:#7fb99a');

updateCounter();
if(getFlags().length >= 8) showFinale();
