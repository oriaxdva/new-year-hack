/* ═══ HU::2027 · Black Team · новогодний движок ═══ */
'use strict';

/* ── окно входа ── */
(function gate(){
  var box=document.getElementById('gate');
  if(!box) return;
  var ok=false;
  try{ ok=localStorage.getItem('hu_access')==='ok'; }catch(e){}
  if(ok){ box.classList.add('hidden'); return; }
  function enter(){
    var v=(document.getElementById('gate-input').value||'').trim().toUpperCase();
    var msg=document.getElementById('gate-msg');
    if(v==='HAPPYNEWHACK'){
      try{ localStorage.setItem('hu_access','ok'); }catch(e){}
      box.classList.add('hidden');
      click(0.04);
      console.log('%c🎄 доступ открыт · с наступающим!','color:#7ee08c;font-size:14px');
    }else if(msg){
      msg.textContent='✘ доступ запрещён. код знает ведущий. и, возможно, санта.';
      msg.style.color='var(--red)';
    }
  }
  document.getElementById('gate-enter').addEventListener('click',enter);
  document.getElementById('gate-input').addEventListener('keydown',function(e){ if(e.key==='Enter') enter(); });
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
document.getElementById('audio-toggle').addEventListener('click',function(){
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
document.getElementById('crt-nav').addEventListener('click',function(e){
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

/* ── флаги ── */
var FLAGS=[
  {flag:'FLAG{HTML_C0MMENT_2027}', hint:'комментарии в исходниках'},
  {flag:'FLAG{C0NS0LE_HUNT_2027}', hint:'консоль браузера'},
  {flag:'FLAG{2027_HAPPY_HACKERS}', hint:'финал трансляции'},
  {flag:'FLAG{ADMIN_PANEL_H4CKED}', hint:'вход в штаб'},
  {flag:'FLAG{IDOR_N0TES_2027}', hint:'чужие заметки'},
  {flag:'FLAG{R0LE_SW4P_2027}', hint:'роль в localStorage'},
  {flag:'FLAG{FORCE_ADMIN_2027}', hint:'терминал · вежливость решает'},
  {flag:'FLAG{ARCHIVE_CODE_2027}', hint:'сейф в штабе'}
];
function getFlags(){ try{return JSON.parse(localStorage.getItem('hu_flags')||'[]');}catch(e){return [];} }
function saveFlag(f){
  var arr=getFlags(), added=false;
  if(arr.indexOf(f)===-1){ arr.push(f); added=true; try{localStorage.setItem('hu_flags',JSON.stringify(arr));}catch(e){} }
  renderFlags();
  if(added) checkFinale();
}
function renderFlags(){
  var found=getFlags();
  var c=document.getElementById('flag-counter'); if(c) c.textContent=found.length;
  var c2=document.getElementById('flag-counter2'); if(c2) c2.textContent=found.length;
  var list=document.getElementById('flag-list');
  if(list){
    list.innerHTML='';
    FLAGS.forEach(function(x){
      var li=document.createElement('li');
      li.textContent=found.indexOf(x.flag)>-1 ? x.flag+' — '+x.hint : '??? — '+x.hint;
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
document.getElementById('flag-submit').addEventListener('click',function(){trySubmit(document.getElementById('flag-input').value);});
document.getElementById('flag-input').addEventListener('keydown',function(e){if(e.key==='Enter')trySubmit(this.value);});
renderFlags();

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
document.getElementById('start-broadcast').addEventListener('click',typeBroadcast);
document.getElementById('stop-broadcast').addEventListener('click',function(){
  stopFlag=true; clearTimeout(typeTimer); typing=false;
  this.classList.add('hidden');
  document.getElementById('start-broadcast').classList.remove('hidden');
});
/* ── стена сообщений (подсказки) ── */
var WALL=[
  {who:'n0ctis',when:'23:41',txt:'кто не успел за флагами — успевайте, год закрывается. подсказка: одна строчка в консоли иногда решает всё.'},
  {who:'phantom_404',when:'23:47',txt:'админские заметки нумеруются с единицы. но иногда у заметки бывает id, о котором админ забыл.'},
  {who:'santa.exe',when:'23:52',txt:'🎁 вакансия: презентации подарков. требования: посмотреть robots.txt и не спрашивать лишнего.'},
  {who:'unknown',when:'00:03',txt:'говорят, штаб решает, кто админ, по тому, что написано в localStorage. ключ — hu_role. верит он строке в твоём браузере.'},
  {who:'snow_drift',when:'00:07',txt:'мандариновые логи зашифрованы кожурой. официальная позиция службы безопасности.'},
  {who:'ghost_in_log',when:'00:11',txt:'терминал отвечает на тон. если whoami кажется слишком тихим — добавьте аргумент и попросите громче.'},
  {who:'santa.exe',when:'00:14',txt:'сейф в штабе не запирается. код записан рядом с ним — просто другим алфавитом.'}
];
function renderWall(){
  var box=document.getElementById('wall-posts'); box.innerHTML='';
  WALL.forEach(function(p){
    var d=document.createElement('div');
    d.className='post';
    d.innerHTML='<span class="when">'+p.when+'</span><span class="who">'+p.who+'</span><div class="txt"></div>';
    d.querySelector('.txt').textContent=p.txt;
    box.appendChild(d);
  });
}
renderWall();
document.getElementById('wall-post').addEventListener('click',function(){
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

/* ── живая стена: человеческие сообщения без подсказок ── */
var LIVE=[
  {who:'n0ctis',txt:'с наступающим, команда! пусть в новом году багов будет меньше, а мандаринов — больше.'},
  {who:'phantom_404',txt:'только что сдал флаг. руки трясутся, но я это сделал!'},
  {who:'unknown',txt:'кто съел мандарины из сейфа? признавайтесь, камер там всё равно нет.'},
  {who:'black_ops_7',txt:'носок в серверной — это норма или уже традиция?'},
  {who:'snow_drift',txt:'гирлянда мигает в ритме 50 герц. совпадение? не думаю.'},
  {who:'ghost_in_log',txt:'лог дня: праздники — единственное время, когда никто не деплоит в пятницу.'},
  {who:'santa.exe',txt:'🎁 поздравляю всех, кто ещё не сломал прод. держитесь до полуночи.'},
  {who:'white_rabbit',txt:'если найдёте в серверной ёлку — не выключайте. это единственный источник праздничного духа.'},
  {who:'n0ctis',txt:'офисный снеговик из трёх терминалов. он в режиме ожидания, как и мы все.'},
  {who:'phantom_404',txt:'мандарины над клавиатурой — это риск. но какой приятный.'}
];
var liveIdx=0;
function showLive(){
  var box=document.getElementById('wall-posts'); if(!box) return;
  var p=LIVE[liveIdx%LIVE.length]; liveIdx++;
  var d=document.createElement('div');
  d.className='post live-post';
  d.innerHTML='<span class="when">сейчас</span><span class="who">'+p.who+'</span><div class="txt"></div>';
  d.querySelector('.txt').textContent=p.txt;
  box.insertBefore(d,box.firstChild);
  setTimeout(function(){ d.classList.add('fade-out'); },11500);
  setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); },12500);
}
setTimeout(showLive,8000);
setInterval(showLive,45000);

/* ── терминал ── */
var termOut=document.getElementById('term-out');
function tPrint(text,cls){
  var d=document.createElement('div');
  if(cls) d.className=cls;
  d.textContent=text; termOut.appendChild(d);
  termOut.scrollTop=termOut.scrollHeight;
}
tPrint('HU terminal v2.8 · подключение установлено','dim');
tPrint('введите help для списка команд','dim');
document.getElementById('term-in').addEventListener('keydown',function(e){
  if(e.key!=='Enter') return;
  var cmd=this.value.trim(); this.value='';
  if(!cmd) return;
  tPrint('black@hu:~$ '+cmd);
  var parts=cmd.split(/\s+/), c=parts[0].toLowerCase();
  if(c==='help'){
    tPrint('команды: help, whoami, flags, newyear, xmas, wall chat, clear');
  }else if(c==='whoami'){
    if(parts[1]&&parts[1].toLowerCase()==='--force-admin'){
      tPrint('ладно. ты спрашивал громче всех остальных. допуск повышен.','amber');
      saveFlag('FLAG{FORCE_ADMIN_2027}');
      tPrint('★ FLAG{FORCE_ADMIN_2027} — флаг засчитан. смотри на странице ЗАДАНИЯ','dim');
      click(0.06);
    }else{
      tPrint('агент Black Team · допуск: гость · настроение: праздничное');
      tPrint('...кто-то из коллег намекал, что сюда можно попроситься громче.','dim');
    }
  }else if(c==='flags'){
    var found=getFlags();
    tPrint('сдано флагов: '+found.length+' / 8');
    FLAGS.forEach(function(x){ tPrint((found.indexOf(x.flag)>-1?'✔ ':'□ ')+x.hint); });
  }else if(c==='newyear'){
    tPrint('🎄 счётчик до нового года переполнен — потому что он уже наступил. почти.');
  }else if(c==='xmas'){
    tPrint('🍊 мандаринка выкруглена из запасов. бонусный предмет, на счёт флагов не влияет.');
  }else if(c==='wall'){
    if(parts[1]&&parts[1].toLowerCase()==='chat'){
      for(var i=0;i<3;i++){
        var p=LIVE[Math.floor(Math.random()*LIVE.length)];
        tPrint(p.who+': '+p.txt,'dim');
      }
    }else{
      tPrint('wall что? попробуйте: wall chat','dim');
    }
  }else if(c==='clear'){
    termOut.innerHTML='';
  }else{
    tPrint('команда не найдена: '+c+' (try help)','dim');
  }
});

/* ── консольная пасхалка ── */
setTimeout(function(){
  console.log('%c✦ BLACK TEAM · приватный канал ✦','color:#e8b84a;font-size:16px');
  console.log('%cнастоящие хакеры читают исходники. а самые настоящие ещё и консоль открывают.','color:#7ee08c');
  console.log('%cFLAG{C0NS0LE_HUNT_2027}','color:#e8b84a;font-size:18px;font-weight:bold');
},2000);

/* ── финал: только при реальных 8/8 ── */
function checkFinale(){
  if(getFlags().length<FLAGS.length) return;
  var closed=false;
  try{closed=localStorage.getItem('hu_finale_closed')==='1';}catch(e){}
  if(closed) return;
  var f=document.getElementById('finale');
  if(f) f.classList.remove('hidden');
  confetti();
  click(0.06);
}
function confetti(){
  var glyphs=['🎄','❄','🍊','✦'];
  var layer=document.getElementById('snow');
  if(!layer) return;
  for(var i=0;i<44;i++){
    var s=document.createElement('span');
    s.className='confetti-piece';
    s.textContent=glyphs[Math.floor(Math.random()*glyphs.length)];
    s.style.left=Math.random()*100+'%';
    s.style.fontSize=(14+Math.random()*14)+'px';
    s.style.animationDuration=(4+Math.random()*4)+'s';
    s.style.animationDelay=(Math.random()*2.5)+'s';
    layer.appendChild(s);
  }
}
document.getElementById('finale-close').addEventListener('click',function(){
  var f=document.getElementById('finale');
  if(f) f.classList.add('hidden');
  try{ localStorage.setItem('hu_finale_closed','1'); }catch(e){}
});
(function finaleInit(){
  var closed=false;
  try{closed=localStorage.getItem('hu_finale_closed')==='1';}catch(e){}
  if(getFlags().length>=FLAGS.length && !closed) setTimeout(checkFinale,600);
})();

/* ── приветствие ── */
console.log('%c🎄 HU::2027 · Black Team · с наступающим!','color:#7ee08c;font-size:14px');
