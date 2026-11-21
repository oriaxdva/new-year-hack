/* ═══ HU::2027 · Black Team · новогодний движок ═══ */
'use strict';

/* ── экран доступа ── */
(function access(){
  var KEY='hu_access', CODE='HAPPYNEWHACK';
  var screen=document.getElementById('access-screen');
  var inp=document.getElementById('access-input');
  var btn=document.getElementById('access-submit');
  var err=document.getElementById('access-err');
  var ok=false;
  try{ ok=localStorage.getItem(KEY)===CODE; }catch(e){}
  function openSite(){
    if(screen) screen.remove();
    console.log('%c🎄 HU::2027 · Black Team · с наступающим!','color:#7ee08c;font-size:14px');
  }
  if(ok){ openSite(); return; }
  if(screen) document.body.style.overflow='hidden';
  function tryCode(){
    var v=(inp.value||'').trim().toUpperCase();
    if(v===CODE){
      try{ localStorage.setItem(KEY,CODE); }catch(e){}
      document.body.style.overflow='';
      if(err) err.textContent='';
      openSite();
      click(0.05);
    }else{
      if(err) err.textContent='✘ доступ запрещён. код знает ведущий. и, возможно, санта';
      inp.value='';
      click(0.02);
    }
  }
  if(btn) btn.addEventListener('click',tryCode);
  if(inp) inp.addEventListener('keydown',function(e){ if(e.key==='Enter') tryCode(); });
})();

/* ── снег ── */
(function snow(){
  var box=document.getElementById('snow'); if(!box) return;
  var glyphs=['❄','❅','❆','✦'];
  for(var i=0;i<55;i++){
    var s=document.createElement('span');
    s.textContent=glyphs[Math.floor(Math.random()*glyphs.length)];
    s.style.left=Math.random()*100+'%';
    s.style.fontSize=(10+Math.random()*14)+'px';
    s.style.opacity=(0.25+Math.random()*0.5).toFixed(2);
    s.style.animationDuration=(9+Math.random()*14)+'s';
    s.style.animationDelay=(-Math.random()*20)+'s';
    box.appendChild(s);
  }
})();

/* ── гирлянда ── */
(function garland(){
  var g=document.getElementById('garland'); if(!g) return;
  var colors=['#7ee08c','#e06a5a','#e8b84a','#7ab8e0'];
  for(var i=0;i<22;i++){
    var b=document.createElement('span');
    b.className='bulb';
    var c=colors[i%colors.length];
    b.style.background=c; b.style.color=c;
    b.style.animationDelay=(Math.random()*2.4).toFixed(2)+'s';
    b.style.animationDuration=(1.8+Math.random()*2).toFixed(2)+'s';
    g.appendChild(b);
  }
})();

/* ── звук ── */
var audioOn=false, actx=null;
function click(vol){
  if(!audioOn) return;
  try{
    if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)();
    var o=actx.createOscillator(), gn=actx.createGain();
    o.type='square'; o.frequency.value=520+Math.random()*160;
    gn.gain.value=vol||0.02;
    o.connect(gn); gn.connect(actx.destination);
    o.start(); o.stop(actx.currentTime+0.03);
  }catch(e){}
}
var audioBtn=document.getElementById('audio-toggle');
if(audioBtn) audioBtn.addEventListener('click',function(){
  audioOn=!audioOn;
  this.textContent='AUDIO: '+(audioOn?'ON':'OFF');
  if(audioOn) click(0.04);
});

/* ── часы ── */
setInterval(function(){
  var d=new Date(),z=function(n){return String(n).padStart(2,'0');};
  var el=document.getElementById('clock');
  if(el) el.textContent=z(d.getHours())+':'+z(d.getMinutes())+':'+z(d.getSeconds());
},1000);

/* ── разделы ── */
var navEl=document.getElementById('crt-nav');
if(navEl) navEl.addEventListener('click',function(e){
  var btn=e.target.closest('button[data-section]'); if(!btn) return;
  document.querySelectorAll('#crt-nav button').forEach(function(b){b.classList.remove('active');});
  document.querySelectorAll('.crt-section').forEach(function(s){s.classList.remove('active');});
  btn.classList.add('active');
  document.getElementById(btn.dataset.section).classList.add('active');
  try{localStorage.setItem('hu_section',btn.dataset.section);}catch(err){}
});
(function restoreSection(){
  var saved=null;
  try{saved=localStorage.getItem('hu_section');}catch(err){}
  if(!saved) return;
  var btn=document.querySelector('#crt-nav button[data-section="'+saved+'"]');
  if(btn) btn.click();
})();

/* ── флаги (7 штук; №7 — вопрос без подсказок) ── */
var FLAGS=[
  {flag:'FLAG{HTML_C0MMENT_2027}', hint:'комментарии в исходниках'},
  {flag:'FLAG{C0NS0LE_HUNT_2027}', hint:'консоль браузера'},
  {flag:'FLAG{2027_HAPPY_HACKERS}', hint:'финал трансляции'},
  {flag:'FLAG{ADMIN_PANEL_H4CKED}', hint:'вход в штаб'},
  {flag:'FLAG{IDOR_N0TES_2027}', hint:'чужие заметки'},
  {flag:'FLAG{R0LE_SW4P_2027}', hint:'роль в браузере'},
  {flag:'FLAG{GHOST_INPUT_2027}', hint:''}
];
function getFlags(){ try{return JSON.parse(localStorage.getItem('hu_flags')||'[]');}catch(e){return [];} }
function saveFlag(f){
  var arr=getFlags();
  if(arr.indexOf(f)===-1){ arr.push(f); try{localStorage.setItem('hu_flags',JSON.stringify(arr));}catch(e){} }
  renderFlags();
  checkFinale();
}
function renderFlags(){
  var found=getFlags();
  var c=document.getElementById('flag-counter'); if(c) c.textContent=found.length;
  var list=document.getElementById('flag-list');
  if(list){
    list.innerHTML='';
    FLAGS.forEach(function(x){
      var li=document.createElement('li');
      var label=x.hint ? x.flag+' — '+x.hint : x.flag+' — ???';
      li.textContent=found.indexOf(x.flag)>-1 ? label : '??? — '+(x.hint||'???');
      if(found.indexOf(x.flag)>-1) li.className='done';
      list.appendChild(li);
    });
  }
}
function trySubmit(raw){
  var fb=document.getElementById('flag-feedback');
  var v=String(raw||'').trim().toUpperCase().replace(/\s+/g,'');
  if(!v) return false;
  var match=FLAGS.find(function(x){return x.flag===v;});
  if(match){
    saveFlag(match.flag);
    if(fb){ fb.textContent='✔ ФЛАГ ПРИНЯТ: '+match.flag; fb.style.color='var(--green)'; }
    click(0.05);
    return true;
  }else{
    if(fb){ fb.textContent='✘ Неизвестный флаг. Ищи внимательнее.'; fb.style.color='var(--red)'; }
    return false;
  }
}
var fsBtn=document.getElementById('flag-submit');
var fsInp=document.getElementById('flag-input');
if(fsBtn) fsBtn.addEventListener('click',function(){trySubmit(fsInp.value);});
if(fsInp) fsInp.addEventListener('keydown',function(e){if(e.key==='Enter')trySubmit(this.value);});
renderFlags();

/* ═══ ФЛАГ №7: призрак в консоли ═══
   забирается любой строкой, введённой в консоль.
   в списке зада­ний значится «???», на стене о нём ни слова. */
var ghostGot=false, ghostArmed=false;
setTimeout(function(){ ghostArmed=true; },4000);
function ghostFlag(){
  if(ghostGot||!ghostArmed) return;
  ghostGot=true;
  console.log('%c??? неопознанный шум в консоли. шум заметил тебя.','color:#e8b84a');
  console.log('%cFLAG{GHOST_INPUT_2027}','color:#e8b84a;font-size:18px;font-weight:bold');
  saveFlag('FLAG{GHOST_INPUT_2027}');
  click(0.06);
}
window.addEventListener('error',function(e){
  var src=(e&&e.filename)||'';
  if(src.indexOf('app.js')>-1||src.indexOf('index.html')>-1) return;
  ghostFlag();
});
window.addEventListener('unhandledrejection',function(){ ghostFlag(); });
['log','warn','error','info'].forEach(function(m){
  var orig=console[m]&&console[m].bind(console);
  console[m]=function(){ if(orig) orig.apply(null,arguments); ghostFlag(); };
});

/* ── трансляция ── */
var BROADCAST=[
  'Слушайте все. Говорит президент хакеров. Эфир разблокирован на все терминалы сети.',
  'Этот год был длинным, как компиляция без кэша. Сервера падали, дедлайны дышали в затылок, а патчи накатывали быстрее, чем мы успевали их обходить.',
  'Кто-то вошёл в этот год джуном, а выходит синьором. Кто-то так и не понял, почему на проде работает то, что падает локально. Это нормально. Это магия.',
  'Спасибо каждому, кто сидел на созвонах с закрытой камерой, кто чинил прод в три ночи и кто всё это время оставался человеком.',
  'Без вас этот год был бы просто набором логов.',
  'С Новым 2027-м. Мандарины не хакнут никогда — они слишком хорошо защищены кожурой.'
];
var typing=false, stopFlag=false, typeTimer=null;
function typeBroadcast(){
  if(typing) return;
  typing=true; stopFlag=false;
  var box=document.getElementById('broadcast-text');
  var fbBtn=document.getElementById('stop-broadcast');
  document.getElementById('start-broadcast').classList.add('hidden');
  fbBtn.classList.remove('hidden');
  box.innerHTML='';
  var li=0;
  function nextLine(){
    if(stopFlag||li>=BROADCAST.length){ finish(); return; }
    var line=document.createElement('div');
    line.className='line'; box.appendChild(line);
    var text=BROADCAST[li], i=0;
    (function typeChar(){
      if(stopFlag){ finish(); return; }
      if(i<text.length){
        line.textContent=text.slice(0,++i);
        if(i%3===0) click(0.015);
        typeTimer=setTimeout(typeChar,14+Math.random()*26);
      }else{
        li++; typeTimer=setTimeout(nextLine,420);
      }
    })();
  }
  function finish(){
    clearTimeout(typeTimer); typing=false;
    fbBtn.classList.add('hidden');
    document.getElementById('start-broadcast').classList.remove('hidden');
    if(stopFlag) return;
    var banner=document.getElementById('broadcast-flag');
    banner.textContent='★ FLAG{2027_HAPPY_HACKERS} — обращение расшифровано полностью ★';
    banner.classList.remove('hidden');
    saveFlag('FLAG{2027_HAPPY_HACKERS}');
    click(0.06);
  }
  nextLine();
}
var bcStart=document.getElementById('start-broadcast');
var bcStop=document.getElementById('stop-broadcast');
if(bcStart) bcStart.addEventListener('click',typeBroadcast);
if(bcStop) bcStop.addEventListener('click',function(){
  stopFlag=true; clearTimeout(typeTimer); typing=false;
  this.classList.add('hidden');
  document.getElementById('start-broadcast').classList.remove('hidden');
});

/* ── стена: базовые посты (намёки неявные, без шифров) ── */
var WALL=[
  {who:'n0ctis',when:'23:41',txt:'кто не успел за флагами — успевайте. остальное — вопрос громкости.'},
  {who:'phantom_404',when:'23:47',txt:'штаб потерял одну заметку. или заметка потеряла штаб. в любом случае она не там, где думают админы.'},
  {who:'snow_drift',when:'23:52',txt:'санта решил завести naughty-list в электронном виде. официальная позиция службы безопасности: не ваш список.'},
  {who:'unknown',when:'00:03',txt:'штаб верит только тому, что видит. к счастью для некоторых, он смотрит не туда.'},
  {who:'tangerine_guy',when:'00:07',txt:'в сейфе лежали мандарины. огрызки нашли в /tmp. кто-то не испугался безопасности.'}
];
var LIVE=[
  {who:'tangerine_guy',txt:'мандарины живут в серверной. кладбище кожуры на третьей стойке.'},
  {who:'n0ctis',txt:'кто-то опять оставил носок с оленями на кулере. кулер рад.'},
  {who:'snow_drift',txt:'терминал сегодня ворчливый. не берите в голову.'},
  {who:'phantom_404',txt:'всем тише. штаб спит и во сне считает свои заметки.'},
  {who:'unknown',txt:'если найдёте иголку от ёлки в проде — не спрашивайте. это был я.'}
];
function renderWall(){
  var box=document.getElementById('wall-posts'); if(!box) return;
  box.innerHTML='';
  WALL.forEach(function(p){ box.appendChild(makePost(p,false)); });
}
function makePost(p,live){
  var d=document.createElement('div');
  d.className=live?'live-post':'post';
  d.innerHTML='<span class="when">'+p.when+'</span><span class="who">'+p.who+'</span><div class="txt"></div>';
  d.querySelector('.txt').textContent=p.txt;
  return d;
}
renderWall();
var wpBtn=document.getElementById('wall-post');
var wpInp=document.getElementById('wall-input');
if(wpBtn) wpBtn.addEventListener('click',function(){
  var inp=document.getElementById('wall-input'), v=inp.value.trim();
  if(!v) return;
  var sep=v.indexOf(':'), who, txt;
  if(sep>0){ who=v.slice(0,sep).trim()||'anon'; txt=v.slice(sep+1).trim(); }
  else{ who='anon'; txt=v; }
  var d=new Date(),z=function(n){return String(n).padStart(2,'0');};
  WALL.push({who:who,when:z(d.getHours())+':'+z(d.getMinutes()),txt:txt});
  renderWall(); inp.value='';
  document.querySelectorAll('.wall .post')[WALL.length-1].scrollIntoView({behavior:'smooth',block:'nearest'});
});
/* живая стена: всплывающие сообщения без подсказок */
setInterval(function(){
  var box=document.getElementById('wall-posts'); if(!box) return;
  var section=document.getElementById('wall');
  if(section && !section.classList.contains('active')) return;
  var m=LIVE[Math.floor(Math.random()*LIVE.length)];
  var d=new Date(),z=function(n){return String(n).padStart(2,'0');};
  var p={who:m.who,when:z(d.getHours())+':'+z(d.getMinutes()),txt:m.txt};
  var el=makePost(p,true);
  box.appendChild(el);
  setTimeout(function(){ el.classList.add('fade'); },11000);
  setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); },12500);
},45000);

/* ── терминал ── */
var termOut=document.getElementById('term-out');
function tPrint(text,cls){
  if(!termOut) return;
  var d=document.createElement('div');
  if(cls) d.className=cls;
  d.textContent=text; termOut.appendChild(d);
  termOut.scrollTop=termOut.scrollHeight;
}
tPrint('HU terminal v2.7 · подключение установлено','dim');
tPrint('введите help для списка команд','dim');
var termIn=document.getElementById('term-in');
if(termIn) termIn.addEventListener('keydown',function(e){
  if(e.key!=='Enter') return;
  var cmd=this.value.trim(); this.value='';
  if(!cmd) return;
  tPrint('black@hu:~$ '+cmd);
  var parts=cmd.split(/\s+/), c=parts[0].toLowerCase();
  if(c==='help'){
    tPrint('команды: help, whoami, flags, newyear, wall chat, xmas, clear');
  }else if(c==='whoami'){
    tPrint('агент Black Team · допуск: максимальный · настроение: праздничное');
  }else if(c==='flags'){
    var found=getFlags();
    tPrint('сдано флагов: '+found.length+' / 7');
    FLAGS.forEach(function(x){ tPrint((found.indexOf(x.flag)>-1?'✔ ':'□ ')+(x.hint||'???')); });
  }else if(c==='newyear'){
    tPrint('🎄 счётчик до нового года переполнен — потому что он уже наступил. почти.');
  }else if(c==='wall'){
    if(parts[1]==='chat'){
      tPrint('подслушано со стены:','dim');
      for(var i=0;i<3;i++){
        var m=LIVE[(Math.floor(Math.random()*LIVE.length))];
        tPrint(m.who+': '+m.txt,'dim');
      }
      tPrint('флагов на стене нет. стена это уже говорила, между строк.','dim');
    }else tPrint('использование: wall chat','dim');
  }else if(c==='xmas'){
    tPrint('🎄🍊 счастье с кожурой, как у мандарина 🍊🎄');
  }else if(c==='clear'){
    termOut.innerHTML='';
  }else{
    tPrint('команда не найдена: '+c+' (try help)','dim');
  }
});

/* ── финал при всех флагах ── */
function checkFinale(){
  var found=getFlags();
  var fin=document.getElementById('finale');
  if(!fin) return;
  var closed=false;
  try{ closed=localStorage.getItem('hu_finale_closed')==='1'; }catch(e){}
  if(found.length>=FLAGS.length && !closed){
    fin.classList.remove('hidden');
    confettiBurst();
    click(0.07);
  }
}
var finClose=document.getElementById('finale-close');
if(finClose) finClose.addEventListener('click',function(){
  document.getElementById('finale').classList.add('hidden');
  try{ localStorage.setItem('hu_finale_closed','1'); }catch(e){}
});
function confettiBurst(){
  var glyphs=['🎄','❄','🍊','✦','🎁'];
  for(var i=0;i<60;i++){
    var s=document.createElement('span');
    s.className='confetti';
    s.textContent=glyphs[Math.floor(Math.random()*glyphs.length)];
    s.style.left=Math.random()*100+'%';
    s.style.fontSize=(14+Math.random()*16)+'px';
    s.style.animationDuration=(2.5+Math.random()*3)+'s';
    s.style.animationDelay=(Math.random()*2)+'s';
    document.body.appendChild(s);
    setTimeout(function(el){ return function(){ if(el.parentNode) el.parentNode.removeChild(el); }; }(s),6500);
  }
}

/* ── консольная пасхалка ── */
setTimeout(function(){
  console.log('%c✦ BLACK TEAM · приватный канал ✦','color:#e8b84a;font-size:16px');
  console.log('%cнастоящие хакеры читают исходники. а самые настоящие ещё и консоль открывают.','color:#7ee08c');
  console.log('%cFLAG{C0NS0LE_HUNT_2027}','color:#e8b84a;font-size:18px;font-weight:bold');
},2000);
