/* HU::2027 // BLACK TEAM — движок квеста */
(function(){
'use strict';

/* ======== КОНСТАНТЫ ======== */
var FLAG_KEY='hu_flags_v3';
var FLAGS=[
  {id:1,name:'FLAG{W3LC0ME_2027}',hint:'Ctrl+U на главной странице'},
  {id:2,name:'FLAG{C0NS0LE_D1VER}',hint:'Консоль браузера (F12)'},
  {id:3,name:'FLAG{NEW_YEAR_ADDR3SS}',hint:'Смотри трансляцию до конца'},
  {id:4,name:'FLAG{ADMIN_PANEL_H4CKED}',hint:'robots.txt намекает на запасной вход'},
  {id:5,name:'FLAG{1DOR_N0T3S}',hint:'В админке есть заметки. Но не все выдает список.'},
  {id:6,name:'FLAG{R0LE_SW4P_2027}',hint:'Сервер верит тому, что написано в твоем localStorage'},
  {id:7,name:'FLAG{TERMIN4L_CHE4T_2027}',hint:'Иногда проще попросить громче, чем ломать дверь'},
  {id:8,name:'FLAG{S4F3_N0T_L0CK3D}',hint:'Сейф не запирается. Код хранится в localStorage, сдвинут на 3.'}
];

/* ======== ХРАНЕНИЕ ФЛАГОВ ======== */
function getFlags(){try{return JSON.parse(localStorage.getItem(FLAG_KEY)||'[]')}catch(e){return[]}}
function hasFlag(id){return getFlags().indexOf(id)!==-1}
function submitFlag(name){
  name=String(name||'').trim().toUpperCase();
  var f=FLAGS.filter(function(x){return x.name===name})[0];
  if(!f)return{ok:false,msg:'Неизвестный флаг. Проверь формат FLAG{...}'};
  if(hasFlag(f.id))return{ok:false,msg:'Этот флаг уже сдан.',already:true};
  var fl=getFlags();fl.push(f.id);localStorage.setItem(FLAG_KEY,JSON.stringify(fl));
  updateCounter();renderTasks();checkFinal();
  return{ok:true,flag:f};
}

/* ======== СЧЁТЧИК И ФИНАЛ ======== */
function updateCounter(){
  var el=document.getElementById('flag-counter');
  if(el)el.textContent='ФЛАГОВ СОБРАНО: '+getFlags().length+'/8';
}
function checkFinal(){
  if(getFlags().length<8)return;
  var b=document.getElementById('final-banner');
  if(b&&!b.dataset.shown){
    b.dataset.shown='1';b.classList.remove('hidden');
    confettiBurst();
    var t=document.getElementById('terminal-out');
    if(t)typeOut(t,'\n[СИСТЕМА] Все флаги собраны. Новый год официально наступил. Отряд Black Team — вы лучшие. 🎄\n');
  }else if(b&&b.dataset.shown){b.classList.remove('hidden')}
}
function confettiBurst(){
  var layer=document.getElementById('confetti-layer');
  if(!layer)return;
  var chars=['🎄','❄','🍊','🌟','🎅'];
  for(var i=0;i<40;i++){
    var s=document.createElement('span');
    s.className='confetti';s.textContent=chars[i%chars.length];
    s.style.left=(Math.random()*100)+'%';
    s.style.animationDuration=(3+Math.random()*4)+'s';
    s.style.animationDelay=(Math.random()*2)+'s';
    layer.appendChild(s);
    setTimeout(function(node){return function(){node.remove()}}(s),9000);
  }
}

/* ======== СНЕГ ======== */
function initSnow(){
  var box=document.getElementById('snow');if(!box)return;
  var chars=['❄','❅','❆'];
  for(var i=0;i<28;i++){
    var f=document.createElement('span');
    f.className='snowflake';f.textContent=chars[i%3];
    f.style.left=(Math.random()*100)+'%';
    f.style.fontSize=(8+Math.random()*12)+'px';
    f.style.opacity=(0.25+Math.random()*0.4).toFixed(2);
    f.style.animationDuration=(9+Math.random()*12)+'s';
    f.style.animationDelay=(-Math.random()*15)+'s';
    box.appendChild(f);
  }
}

/* ======== ГИРЛЯНДА ======== */
var BULB_COLORS=['#e06a5a','#e8b84a','#5fd28a','#6fb7d9'];
function initGarland(){
  var g=document.getElementById('garland');if(!g)return;
  var n=22,w=100/n;
  for(var i=0;i<n;i++){
    var b=document.createElement('span');
    b.className='bulb';
    b.style.left=(w*i+w/2)+'%';
    b.style.top=(6+Math.sin(i/3)*8)+'px';
    b.style.background=BULB_COLORS[i%4];
    b.style.color=BULB_COLORS[i%4];
    b.style.setProperty('--dur',(2.2+Math.random()*2.5).toFixed(2)+'s');
    b.style.animationDelay=(-Math.random()*4)+'s';
    g.appendChild(b);
  }
}

/* ======== ЧАСЫ ======== */
function initClock(){
  var c=document.getElementById('clock');if(!c)return;
  function tick(){
    var d=new Date();
    c.textContent=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+':'+String(d.getSeconds()).padStart(2,'0');
  }
  tick();setInterval(tick,1000);
}

/* ======== ШАПКА: ПЕРЕКЛЮЧЕНИЕ РАЗДЕЛОВ ======== */
function initNav(){
  var btns=document.querySelectorAll('.tab-btn');
  btns.forEach(function(btn){
    btn.addEventListener('click',function(){
      btns.forEach(function(b){b.classList.remove('active')});
      btn.classList.add('active');
      document.querySelectorAll('.tab-section').forEach(function(s){s.classList.add('hidden')});
      var sec=document.getElementById('section-'+btn.dataset.section);
      if(sec)sec.classList.remove('hidden');
      try{localStorage.setItem('hu_tab',btn.dataset.section)}catch(e){}
      if(btn.dataset.section==='wall')renderWallStatic();
    });
  });
  var saved=null;try{saved=localStorage.getItem('hu_tab')}catch(e){}
  if(saved){
    var target=document.querySelector('.tab-btn[data-section="'+saved+'"]');
    if(target)target.click();
  }
}

/* ======== ОБРАЩЕНИЕ (ПЕЧАТЬ) ======== */
var ADDRESS_TEXT=
'КОМАНДИРУ ОТРЯДА BLACK TEAM.\n\n'+
'Год подходит к концу. Серверы пережили всё: дедлайны, ночные деплои и один очень смелый тост от бухгалтерии.\n\n'+
'Патчи накатывали быстрее, чем мы успевали их обходить. Но мы обходили. Каждый раз.\n\n'+
'За это — спасибо. Каждому, кто держал оборону, кто чинил то, что ломалось в пятницу вечером, кто не сдавался, когда монитор казался единственным другом.\n\n'+
'Без вас этот год был бы просто набором логов.\n\n'+
'С наступающим, Black Team.';

function initTypewriter(){
  var box=document.getElementById('typewriter');if(!box)return;
  var i=0,done=false;
  function step(){
    if(done)return;
    box.innerHTML=ADDRESS_TEXT.slice(0,i).replace(/\n/g,'<br>')+'<span class="cursor">▌</span>';
    i+=1;
    if(i<=ADDRESS_TEXT.length){setTimeout(step,28)}
    else{
      done=true;
      box.innerHTML=ADDRESS_TEXT.replace(/\n/g,'<br>')+
        '<div class="flag-reveal">FLAG{NEW_YEAR_ADDR3SS} — флаг за терпение сдан автоматически</div>';
      submitFlag('FLAG{NEW_YEAR_ADDR3SS}');
    }
  }
  step();
}

/* ======== ЗАДАНИЯ ======== */
function renderTasks(){
  var list=document.getElementById('tasks-list');if(!list)return;
  list.innerHTML='';
  FLAGS.forEach(function(f){
    var div=document.createElement('div');
    var solved=hasFlag(f.id);
    div.className='task'+(solved?' solved':'');
    div.innerHTML='<h3>'+(solved?'✓ ':'□ ')+'ФЛАГ #'+f.id+'</h3>'+
      '<div class="status">'+(solved?'СДАН':'НЕ НАЙДЕН — '+f.hint)+'</div>'+
      (solved?'<div class="flag-shown">'+f.name+'</div>':'');
    list.appendChild(div);
  });
}

/* ======== СТЕНА СООБЩЕНИЙ ======== */
var WALL_HINTS=[
  {author:'n0ctis',text:'Не ищи кнопку входа — ищи файл. Стандартные имена в прошлом. Или наоборот в настоящем.'},
  {author:'unknown',text:'Пропуска тут не бумажные. Сервер верит тому, что лежит в твоем localStorage.'},
  {author:'phantom_404',text:'Иногда проще попросить громче, чем ломать дверь. Терминал любит вежливых... и настойчивых.'},
  {author:'n0ctis',text:'robots.txt — это табличка "сюда можно". Не пропускайте его, новички.'}
];
var WALL_ALIVE=[
  {author:'n0ctis',text:'С наступающим, команда! Пусть в новом году багов будет меньше, а флагов — больше!'},
  {author:'phantom_404',text:'Только что сдал флаг. Руки трясутся, но я это сделал! 🎉'},
  {author:'unknown',text:'Кто выключил гирлянду? Верните свет, тут и так сервер гудит!'},
  {author:'black_ops_7',text:'Мандарины в сейфе — единственная причина, по которой я ещё на смене.'},
  {author:'ghost_in_log',text:'Лог дня: консоль — мой лучший друг. С Новым годом, Black Team!'},
  {author:'m4ndarin',text:'Ёлку в серверной не выключать. Это приказ. Не помню чей, но приказ.'},
  {author:'pingu',text:'Пинг до сервера 12 мс. Пинг до праздника — 0 мс. Уже тут.'},
  {author:'zero_day_off',text:'Взял отгул на 1 января. Кто-то должен тестировать салаты.'},
  {author:'cryptic_cat',text:'Шифрую подарки XOR-ом. Кот уже всё расшифровал, но молчит.'},
  {author:'n0ctis',text:'Кофе в автомате закончился ещё в октябре. Мы это переживём.'},
  {author:'phantom_404',text:'Слышал, Санта тоже ведёт баг-трекер. Все дети в тикетах "в обработке".'},
  {author:'script_k1ddie',text:'Мой первый эксплойт был против будильника. Он проиграл.'},
  {author:'firewalled',text:'С наступающим! Пусть ваш трафик будет чистым, а бэкапы — свежими.'},
  {author:'m4ndarin',text:'Не забудьте выключить ёлку в серверной. Шутка. Никогда не выключайте.'},
  {author:'ghost_in_log',text:'Кто-то оставил мандарин на клавиатуре. Логи пахнут citrus.'},
  {author:'zero_day_off',text:'Мой новый год начался с инцидента. Часы перевёл, крон не сработал.'},
  {author:'pingu',text:'Дед Мороз существует. Он называется "релиз перед праздниками".'},
  {author:'cryptic_cat',text:'Если флаг не находится — он вас просто стесняется. Подойдите ближе.'},
  {author:'black_ops_7',text:'С Новым годом, тим! Пусть UP будет 365 дней без разрывов.'},
  {author:'unknown',text:'Праздник — это когда пейджер молчит. Молчание — золото. И покой.'}
];
function makePost(p,live){
  var d=document.createElement('div');
  d.className='post'+(live?' live':'');
  var t=new Date(Date.now()-Math.floor(Math.random()*3600000));
  var ts=String(t.getHours()).padStart(2,'0')+':'+String(t.getMinutes()).padStart(2,'0');
  d.innerHTML='<span class="author">'+p.author+'</span><span class="text">'+p.text+'</span><span class="time">'+ts+'</span>';
  return d;
}
function renderWallStatic(){
  var wall=document.getElementById('wall-posts');if(!wall||wall.dataset.done)return;
  wall.dataset.done='1';wall.innerHTML='';
  WALL_HINTS.forEach(function(p){wall.appendChild(makePost(p,false))});
}
function startWallPulse(){
  var wall=document.getElementById('wall-posts');if(!wall)return;
  var tab=document.getElementById('section-wall');
  function drop(){
    var p=WALL_ALIVE[Math.floor(Math.random()*WALL_ALIVE.length)];
    var node=makePost(p,true);
    wall.insertBefore(node,wall.firstChild);
    setTimeout(function(){node.classList.add('leaving');setTimeout(function(){node.remove()},900)},12000);
  }
  function tick(){
    if(tab&&!tab.classList.contains('hidden')&&wall)drop();
    setTimeout(tick,20000);
  }
  setTimeout(tick,6000);
}

/* ======== ТЕРМИНАЛ ======== */
var WELCOME='HU::2027 shell — Black Team edition\nВведите "help" для списка команд.\n';
function typeOut(box,text){
  var span=document.createElement('span');
  box.appendChild(span);
  var i=0;
  (function s(){
    if(i<=text.length){span.textContent=text.slice(0,i);i++;box.scrollTop=box.scrollHeight;setTimeout(s,12)}
  })();
}
function initTerminal(){
  var out=document.getElementById('terminal-out');
  var inp=document.getElementById('terminal-in');
  if(!out||!inp)return;
  typeOut(out,WELCOME);
  function print(t){var d=document.createElement('div');d.textContent=t;out.appendChild(d);out.scrollTop=out.scrollHeight}
  function run(cmd){
    print('black@hu:~$ '+cmd);
    var c=cmd.trim().toLowerCase();
    if(!c)return;
    if(c==='help'){
      print('Команды: help, whoami, flags, submit FLAG{...}, newyear, xmas, wall chat, clear');
    }else if(c==='whoami'){
      print('role=guest | uid=77 | codename: agent Black Team');
      print('Подсказка: у этой команды остались служебные флаги. Попробуйте добавить параметр.');
    }else if(c==='whoami --force-admin'){
      print('Ладно, ты спрашивал громче всех. Держи: FLAG{TERMIN4L_CHE4T_2027}');
      submitFlag('FLAG{TERMIN4L_CHE4T_2027}');
    }else if(c==='flags'){
      print('Сдано флагов: '+getFlags().length+'/8');
      getFlags().forEach(function(id){print(' ✓ FLAG #'+id)});
    }else if(c==='newyear'){
      print('🎆 До Нового года: '+Math.ceil((new Date('2028-01-01')-new Date())/86400000)+' дней. Праздник сам себя не проведет.');
    }else if(c==='xmas'){
      print('🍊 Мандаринка выдана. Бонусный предмет, на счётчик не влияет.');
    }else if(c==='wall chat'){
      for(var i=0;i<3;i++){
        var p=WALL_ALIVE[Math.floor(Math.random()*WALL_ALIVE.length)];
        print(p.author+': '+p.text);
      }
    }else if(c==='clear'){
      out.innerHTML='';
    }else if(c.indexOf('submit ')===0){
      var r=submitFlag(cmd.slice(7));
      print(r.ok?('Флаг принят: '+r.flag.name):(r.msg||'Ошибка'));
      if(r.ok)checkFinal();
    }else{
      print('Неизвестная команда: '+c+'. Введите "help".');
    }
  }
  inp.addEventListener('keydown',function(e){
    if(e.key==='Enter'){run(inp.value);inp.value=''}
  });
}

/* ======== ЗВУК ======== */
function initSound(){
  var btn=document.getElementById('sound-toggle');if(!btn)return;
  var on=false;try{on=localStorage.getItem('hu_sound')==='1'}catch(e){}
  btn.classList.toggle('on',on);
  var ctx=null;
  function beep(freq,dur){
    if(!on)return;
    try{
      ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();
      var o=ctx.createOscillator(),g=ctx.createGain();
      o.frequency.value=freq;o.type='sine';
      g.gain.value=0.03;o.connect(g);g.connect(ctx.destination);
      o.start();g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+dur);
      o.stop(ctx.currentTime+dur);
    }catch(e){}
  }
  btn.addEventListener('click',function(){
    on=!on;btn.classList.toggle('on',on);
    try{localStorage.setItem('hu_sound',on?'1':'0')}catch(e){}
    if(on)beep(660,0.15);
  });
  document.addEventListener('click',function(e){
    if(e.target&&e.target.classList&&e.target.classList.contains('tab-btn'))beep(440,0.1);
    if(e.target&&e.target.classList&&e.target.classList.contains('bulb'))beep(880,0.08);
  });
}

/* ======== КОНСОЛЬ ======== */
console.log('%cHU::2027 // BLACK TEAM','color:#5fd28a;font-weight:bold;font-size:18px');
console.log('Приветствую, агент Black Team. Системный привет: FLAG{C0NS0LE_D1VER}');
console.log('С наступающим! Не забудьте: мандарины в сейфе, ёлку не выключать.');

/* ======== СТАРТ ======== */
document.addEventListener('DOMContentLoaded',function(){
  initSnow();initGarland();initClock();initNav();initSound();
  renderTasks();updateCounter();initTypewriter();initTerminal();startWallPulse();
  var f=getFlags();
  if(f.length&&f.indexOf(1)===-1)submitFlag('FLAG{W3LC0ME_2027}');
  checkFinal();
});
})();
